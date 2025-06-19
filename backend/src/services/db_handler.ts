import sqlite3 from "sqlite3";
import { open, Database } from 'sqlite';
import { FileRecord, MusicRecord, PlayList, PlaylistEntry } from "./types";
import path from "path";
import bcrypt from "bcryptjs";

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

        // User table
        await db.exec(`
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
        await db.run(`
            INSERT INTO users (user_id, username, password, permission)
            VALUES (?, ?, ?, ?)`,
            ["admin", "admin", passwordHash, 999]
        );
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

    getMusicByFileID: async (user_id: string, file_id: number): Promise<MusicRecord | undefined> => {
        db = await initDB();
        const music = await db.get<MusicRecord>(`
            SELECT * FROM music m
            JOIN files f ON f.id = m.file_id
            WHERE f.user_id = ? AND
            f.id = ? AND
            f.is_deleted = 0`,
            [user_id, file_id]
        );
        return music;
    }
}


export const PlayListHandler = {
    getPlayListsByUserID: async (user_id: string): Promise<PlayList[] | []> => {
        db = await initDB();
        const playLists = await db.all<PlayList[]>(`
            SELECT * FROM playlist
            WHERE user_id = ?
            ORDER BY created_time DESC`, 
            [user_id]
        );
        return playLists;
    },

    getPlayListByID: async (id: number, user_id: string): Promise<PlayList | undefined> => {
        db = await initDB();
        const playList = await db.get<PlayList>(`
            SELECT * FROM playlist
            WHERE user_id = ? AND
            id = ?`,
            [user_id, id]
        );
        return playList;
    },

    insertPlayList: async (playList: PlayList): Promise<number> => {
        db = await initDB();
        const result = await db.run(`
            INSERT INTO playlist (user_id, name, description, cover_path)
            VALUES (?, ?, ?, ?);    `,
            [playList.user_id, playList.name, playList.description, playList.cover_path]
        );
        if (!result.lastID) {
            throw new Error("Insert failed. No last ID return in playList insertion");
        }
        return result.lastID;
    },

    removePlayListByID: async (id: number, user_id: string): Promise<boolean> => {
        db = await initDB();
        try {
            await db.run(`
                DELETE FROM playlist
                WHERE id = ? AND
                user_id = ?
            `, [id, user_id]);
            return true;
        } catch(error) {
            console.error(error);
            return false;
        }

    }
};


export const PlayListEntryHandler = {
    getEntriesByPlayListID: async (playListID: number, user_id: string): Promise<PlaylistEntry[] | []> => {
        db = await initDB();
        try {
            const playListEntries = await db.all<PlaylistEntry[]>(`
                SELECT * FROM playlistEntries e
                JOIN playlist p ON e.playlist_id = p.id
                WHERE p.user_id = ? AND
                e.playlist_id = ?;`,
                [user_id, playListID]
            );
            return playListEntries;
        }catch (error) {
            throw new Error(`Fail to get playList entry with ID: ${playListID} and userID: ${user_id}`);
        }
    },

    insertEntryByPlayListID: async (user_id: string, entry: PlaylistEntry): Promise<number | null> => {
        db = await initDB();

        const playlist_id = entry.playlist_id;

        // Checking playlist exist
        try {
            const playlist = await db.get<{ id: number }>(`
                SELECT id FROM playlist
                WHERE id = ? AND user_id = ?;
            `, [playlist_id, user_id]
            );

            if (!playlist) {
                throw new Error(`Unauthorized: playlist ${playlist_id} not found for user ${user_id}`);
            }
        } catch(error) {
            console.error(`Unauthorized: playlist ${playlist_id}`, error);
            return null;
        }

        // Get max position

        const row = await db.get<{ 'MAX(position)': number | null }>(`
        SELECT MAX(position) FROM playlistEntries
        WHERE playlist_id = ?;
        `, [playlist_id]);

        const maxPosition = row?.['MAX(position)'] ?? -1;
        const nextPosition = maxPosition + 1;
        console.log(`NextPosition: ${nextPosition}`);

        // Insert record
        try {
            const result = await db.run(`
                INSERT INTO playlistEntries (playlist_id, music_id, position) 
                VALUES (?, ?, ?);`,
                [playlist_id, entry.music_id, nextPosition]
            );
            return result.lastID!;
        } catch(error) {
            console.error(`Failed to insert playlist entry: `, error);
            throw error;
        }
    },

    removeEntryByPlayListIDByEntryID: async (
        user_id: string,
        playlist_id: number,
        entry_id: number
    ): Promise<boolean> => {
        db = await initDB();
        try {
            const playlist = await db.get<{ id: number }>(`
            SELECT id FROM playlist
            WHERE id = ? AND user_id = ?;
            `, [playlist_id, user_id]);

            if (!playlist) {
                throw new Error(`Unauthorized: playlist ${playlist_id} not found for user ${user_id}`);
            }

            // 执行删除
            const result = await db.run(`
                DELETE FROM playlistEntries
                WHERE id = ? AND playlist_id = ?;
                `, [entry_id, playlist_id]
            );
            
            if (!result || !result.changes) throw new Error("Fail to delete entry");
            return result.changes > 0;
        } catch (error) {
            console.error(`Failed to delete entry ${entry_id} from playlist ${playlist_id}`, error);
            throw error;
        }
    }

}