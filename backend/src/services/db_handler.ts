import sqlite3 from "sqlite3";
import { open, Database } from 'sqlite';
import { FileRecord } from "./types";
import path from "path";
import fs from 'fs/promises';
import bcrypt from "bcryptjs";

let db: Database | null = null;
let dbPromise: Promise<Database> | null = null;

export const initDB = async (): Promise<Database> => {
    if (db) return db;
    if (dbPromise) return await dbPromise; // 正在初始化
    dbPromise = (async () => {
        const dbName = process.env.NODE_ENV === 'test' ? "test.db" : "files.db"
        const dbPath = path.resolve(__dirname, `../../data/${dbName}`);

        console.log("Creating DB file ...");

        const newDB = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        // Files table
        await newDB.exec(`
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                permission INTEGER DEFAULT 0,
                user_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                size INTEGER,
                type TEXT,
                uploaded_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT 0,
                require_password BOOLEAN DEFAULT 0
            );
        `);

        // User table
        await newDB.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                permission INTEGER DEFAULT 0
            );
        `);

        // Insert admin
        const passwordHash = await bcrypt.hash("admin", 10);
        await newDB.run(`
            INSERT INTO users (user_id, username, password, permission)
            SELECT ?, ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM users WHERE user_id = ?
            )`,
            ["admin", "admin", passwordHash, 999, "admin"]
        );


        db = newDB;
        return db;
    })();
    if (!dbPromise) throw Error("Invalid db promise");
    return await dbPromise;
};

export async function disconnectDB() {
    if (db) {
        await db.close();
        db = null;
        dbPromise = null;
        console.log('Database connection closed');
    }
}

export const FileHandler = {
    insert: async (file: FileRecord): Promise<number> => {
        db = await initDB();
        try {
            const result = await db.run(
                `INSERT INTO files (user_id, filename, filepath, size, type)
                 VALUES (?, ?, ?, ?, ?)`,
                [file.user_id, file.filename, file.filepath, file.size, file.type]
            );
            if (!result.lastID) {
                throw new Error('Insert failed. No lastID return');
            }
            return result.lastID;
        }catch (error) {
            // classify errors
            if (error instanceof Error) {
                if (error.message.includes('SQLITE_CONSTRAINT: FOREIGN KEY')) {
                    throw new Error(`数据库外键约束错误: ${error.message}`);
                }
                if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE')) {
                    throw new Error(`数据重复: ${error.message}`);
                }
            }
            
            console.error('插入文件失败:', error);
            throw new Error(`文件插入失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    },

    getAll: async (user_id: string): Promise<FileRecord[]> => {
        db = await initDB();
        const files = await db.all<FileRecord[]>(
            `SELECT * FROM files WHERE is_deleted = 0 AND user_id = ? ORDER BY uploaded_time DESC`,
            [user_id]
        );
        return files;
    },

    // Given id return a file
    getById: async (id: number, user_id: string): Promise<FileRecord | undefined> => {
        db = await initDB();
        const file = await db.get<FileRecord>(
            `SELECT * FROM files WHERE id = ? AND user_id = ?`,
            [id, user_id]
        );
        return file;
    },
    //更新权限byId
    updatePermissionById: async(id: number, user_id:string, permission: number): Promise<Boolean> =>{
        db =await initDB();
        await db.run(`
            UPDATE files SET permission = ?
            WHERE user_id = ? AND
            id = ?`,
            [permission, user_id, id]
        );
        //1.更改的permission不能大于current permission
        
        //2.更改的permission不能为负数
        return true;
    },

    
    // Given path return files in query path
    getFilesByPath: async (user_id: string, queryPath: string): Promise<FileRecord[]> => {
        db = await initDB();
        const files = await db.all<FileRecord[]>(
            `SELECT * FROM files WHERE user_id = ? AND 
            filepath = ? AND is_deleted = 0 ORDER BY uploaded_time DESC`,
            [user_id, queryPath]
        );
        return files;
    },

    // 修改更改时间
    updateUploadedTime: async (id: number, user_id: string, uploaded_time: Date): Promise<void> => {
        db = await initDB();
        await db.run(`UPDATE files SET uploaded_time = ? WHERE id = ? AND user_id = ?`, [uploaded_time, id, user_id]);
    },

    // 获取所有最近删除文件
    getRecentDelete: async (user_id: string): Promise<FileRecord[]> => {
        db = await initDB();
        const files = await db.all<FileRecord[]>(
            `
            SELECT * FROM files
            WHERE user_id = ? AND is_deleted = 1;
            `,
            [user_id]
        );
        return files;
    },

    // 删除文件By id
    removeById: async (id: number): Promise<void> => {
        db = await initDB();
        await db.run(`UPDATE files SET is_deleted = 1 WHERE id = ?`, [id]);
    },

    // 删除文件By Given start path
    removeByStartPath: async (startPath: string, user_id: string): Promise<void> => {
        console.log(`Removing files with start path: ${startPath} for user: ${user_id}`);
        db = await initDB();
        await db.run(`
            UPDATE files 
            SET is_deleted = 1 
            WHERE filepath LIKE ? AND user_id = ?`, 
            [`${startPath}%`, user_id]
        );
    },
    // 更新是否为加密文件夹
    updateRequirePassword: async (id: number, newValue: boolean) => {
        db = await initDB();
        await db.run(`
            UPDATE files
            SET require_password = ?
            WHERE id = ?`,
            [newValue, id]
        );
    },
};