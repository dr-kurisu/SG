import sqlite3 from "sqlite3";
import { open, Database } from 'sqlite';
import { FileRecord } from "./types";
import path from "path";

let db: Database | null = null;

export const initDB = async (): Promise<Database> => {
    if (!db) {
        console.log("Creating DB file ...");
        db = await open({
            filename: path.resolve(__dirname, '../../data/files.db'),
            driver: sqlite3.Database,
        });

        // 初始化数据库
        await db.exec(`
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                size INTEGER,
                type TEXT,
                uploaded_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT 0
            );
        `);
    }
    return db;
};

export const FileHandler = {
    insert: async (file: FileRecord): Promise<number> => {
        const db = await initDB();
        const result = await db.run(
            `INSERT INTO files (user_id, filename, filepath, size, type)
             VALUES (?, ?, ?, ?, ?)`,
            [file.user_id, file.filename, file.filepath, file.size, file.type]
        );
        return result.lastID!;
    },

    getAll: async (): Promise<FileRecord[]> => {
        const db = await initDB();
        const files = await db.all<FileRecord[]>(
            `SELECT * FROM files WHERE is_deleted = 0 ORDER BY uploaded_time DESC`
        );
        return files;
    },

    // Given id return a file
    getById: async (id: number): Promise<FileRecord | undefined> => {
        const db = await initDB();
        const file = await db.get<FileRecord>(
            `SELECT * FROM files WHERE id = ?`,
            [id]
        );
        return file;
    },
    
    // Given path return files in query path
    getFilesByPath: async (user_id: string, queryPath: string): Promise<FileRecord[]> => {
        const db = await initDB();
        const files = await db.all<FileRecord[]>(
            `SELECT * FROM files WHERE user_id = ? AND 
            filepath = ? AND is_deleted = 0 ORDER BY uploaded_time DESC`,
            [user_id, queryPath]
        );
        return files;
    },

    // 修改更改时间


    // 获取所有最近删除文件


    // 删除文件By id
    deleteById: async (id: number): Promise<void> => {
        const db = await initDB();
        await db.run(`UPDATE files SET is_deleted = 1 WHERE id = ?`, [id]);
    }
};