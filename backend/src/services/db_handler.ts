import sqlite3 from "sqlite3";
import { open, Database } from 'sqlite';
import { FileRecord, MusicRecord } from "./types";
import path from "path";

let db: Database | null = null;

export const initDB = async (): Promise<Database> => {
    if (!db) {
        console.log("Creating DB file ...");
        db = await open({
            filename: path.resolve(__dirname, '../../data/files.db'),
            driver: sqlite3.Database,
        });
        // Files table
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
        // Music table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS music (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id INTEGER NOT NULL,
                artist TEXT,
                year INTEGER,
                duration REAL, -- second
                bitrate INTEGER, -- kbps
                cover_path TEXT,
                FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
            );            
        `);
        // PlayList table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS playlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                cover_path TEXT,
                created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_public BOOLEAN DEFAULT 0
            );  
        `);

        // Playlist entries
        await db.exec(`
            CREATE TABLE IF NOT EXISTS playlistEntries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playlist_id INTEGER NOT NULL,
                music_id INTEGER NOT NULL,
                position INTEGER NOT NULL, -- 播放列表中的顺序
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE,
                FOREIGN KEY (music_id) REFERENCES music(id) ON DELETE CASCADE,
                UNIQUE (playlist_id, music_id) -- 防止重复添加同一首歌
            );  
        `);
    }
    return db;
};

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
};

export const MusicHandler = {
    insert: async (musicRecord: MusicRecord): Promise<number> => {
        db = await initDB();

        try {
            // 检查关联的file是否存在
            const fileExists = await db.get(
                'SELECT 1 FROM files WHERE id = ?', 
                [musicRecord.file_id]
            );
            
            if (!fileExists) {
                throw new Error(`关联的文件记录不存在 (file_id: ${musicRecord.file_id})`);
            }

            const result = await db.run(`
                INSERT INTO music (file_id, artist, year, duration, bitrate, cover_path) 
                VALUES (?, ?, ?, ?, ?, ?);`
                , [
                    musicRecord.file_id,
                    musicRecord.artist, 
                    musicRecord.year, 
                    musicRecord.duration,
                    musicRecord.bitrate,
                    musicRecord.cover_path
                ]
            );

            if (!result.lastID) {
                throw new Error('Insert failed. No lastID return');
            };

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
            
            console.error('插入音乐记录失败:', error);
            throw new Error(`音乐记录插入失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    },

    getAll: async (): Promise<MusicRecord[]> => {
        db = await initDB();
        const files = await db.all<MusicRecord[]>(`
            SELECT 
                f.*,
                m.*
            FROM music m 
            JOIN files f ON m.file_id = f.id
            WHERE f.is_deleted = 0 
            ORDER BY f.uploaded_time DESC  
        `);
        return files;
    },

    getByFileId: async (file_id: number, user_id: string): Promise<MusicRecord | undefined> => {
        db = await initDB();
        try {
            const file = await db.get<MusicRecord>(`
                SELECT * FROM music m 
                JOIN files f ON f.id = m.file_id
                WHERE f.id = ? AND f.user_id = ?
                `,
                [file_id, user_id]
            );
            return file || undefined;
        }catch (error) {
            console.error(`Error fetched music record for ${file_id}`, error);
            return undefined;
        }

    },

    // Given path return music in query path
    getMusicByPath: async (user_id: string, queryPath: string): Promise<MusicRecord[]> => {
        db = await initDB();
        const music = await db.all<MusicRecord[]>(`
            SELECT * FROM music m
            JOIN files f ON f.id = m.file_id
            WHERE f.user_id = ? AND 
            f.filepath = ? AND f.is_deleted = 0 
            ORDER BY f.uploaded_time DESC`,
            [user_id, queryPath]
        );
        return music;
    },
}