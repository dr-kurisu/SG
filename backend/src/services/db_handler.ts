import sqlite3 from "sqlite3";
import { open, Database } from 'sqlite';
import { FileRecord, Playlist, SongRecord, UserRecord } from "./types";
import path from "path";
import bcrypt from "bcryptjs";
import logger from "../logger/logger"

let db: Database | null = null;
let dbPromise: Promise<Database> | null = null;

export const initDB = async (): Promise<Database> => {
    if (db) return db;
    if (dbPromise) return await dbPromise; // 正在初始化
    dbPromise = (async () => {
        const dbName = process.env.NODE_ENV === 'test' ? "test.db" : "files.db"
        const dbPath = path.resolve(__dirname, `../../data/${dbName}`);

        logger.info(`Connecting to DB file`);

        const newDB = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Foreign Key contrain
        await newDB.exec("PRAGMA foreign_keys = ON;");

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
            INSERT OR IGNORE INTO users (user_id, username, password, permission)
            VALUES (?, ?, ?, ?)`,
            ["admin", "admin", passwordHash, 999]
        );


        // Song table
        await newDB.run(`
            CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id INTEGER NOT NULL UNIQUE,
                title TEXT NOT NULL,
                artist TEXT,
                cover TEXT,
                duration INTEGER NOT NULL,             -- second
                FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
            );`
        );

        // Playlist table
        await newDB.run(`
            CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                cover TEXT
            );`
        );

        // Playlist entries table
        await newDB.run(`
            CREATE TABLE IF NOT EXISTS playlistEntries (
                playlist_id INTEGER NOT NULL,
                song_id INTEGER NOT NULL,
                PRIMARY KEY (playlist_id, song_id),
                FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
                FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
            );
        `);

        db = newDB;
        logger.info(`DB is Connected`);
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
        } catch (err) {
            handleInsertionSQLError(err);
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
    updatePermissionById: async (id: number, user_id: string, permission: number): Promise<Boolean> => {
        db = await initDB();
        await db.run(`
            UPDATE files SET permission = ?
            WHERE user_id = ? AND
            id = ?`,
            [permission, user_id, id]
        );
        //1.更改的permission不能大于current permission

        //2.更改的permission不能最小是0
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

    // Enforce remove file by id
    quicklyRemoveById: async (id: number): Promise<void> => {
        const db = await initDB();
        await db.run(`DELETE FROM files WHERE id = ?`, [id]);
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

export const UserHandler = {
    // 插入用户record
    insert: async (user_id: string, username: string, password: string, permission: number) => {
        const db = await initDB();
        try {
            const result = await db.run(
                `INSERT INTO users (user_id, username, password, permission)
            VALUES (?, ?, ?, ?)`,
                [user_id, username, password, permission]
            );
            if (!result.lastID) {
                throw new Error('Insert failed. No lastID returned');
            }
            return result.lastID;
        } catch (err) {
            handleInsertionSQLError(err);
        }
    },

    // 移除用户record by username
    removeUserByUserID: async (user_id: string) => {
        const db = await initDB();
        const result = await db.run(`DELETE FROM users WHERE user_id = ?`, [user_id]);
        return result.changes! > 0;
    },

    // 更新用户权限
    updateUserPermission: async (user_id: string, permission: number) => {
        const db = await initDB();
        const result = await db.run(
            `UPDATE users SET permission = ? WHERE user_id = ?`,
            [permission, user_id]
        );
        return result.changes! > 0;
    },

    // 更新用户密码
    updateUserPassword: async (user_id: string, newPassword: string) => {
        const db = await initDB();
        const result = await db.run(
            `UPDATE users SET password = ? WHERE user_id = ?`,
            [newPassword, user_id]
        );
        return result.changes! > 0;
    },

    // 更新用户名
    updateUsername: async (user_id: string, newUsername: string) => {
        const db = await initDB();
        try {
            const result = await db.run(
                `UPDATE users SET username = ? WHERE user_id = ?`,
                [newUsername, user_id]
            );
            return result.changes! > 0;
        } catch (error) {
            if (error instanceof Error && error.message.includes('SQLITE_CONSTRAINT: UNIQUE')) {
                throw new Error(`用户名已存在: ${error.message}`);
            }
            throw error;
        }
    },

    // 更新用户ID
    updateUserID: async (oldUserID: string, newUserID: string) => {
        const db = await initDB();
        try {
            const result = await db.run(
                `UPDATE users SET user_id = ? WHERE user_id = ?`,
                [newUserID, oldUserID]
            );
            return result.changes! > 0;
        } catch (error) {
            if (error instanceof Error && error.message.includes('SQLITE_CONSTRAINT: UNIQUE')) {
                throw new Error(`user_id 已存在: ${error.message}`);
            }
            throw error;
        }
    },

    // 获取用户 by user_id
    getUserByUserID: async (user_id: string) => {
        const db = await initDB();
        const user = await db.get<UserRecord>(
            `SELECT * FROM users WHERE user_id = ?;`,
            [user_id]
        );
        return user || null;
    },

    getUserByUsername: async (username: string) => {
        const db = await initDB();
        const user = await db.get<UserRecord>(
            `SELECT * FROM users WHERE username = ?;`,
            [username]
        );
        return user || null;
    },

    // 验证用户密码
    verifyUser: async (username: string, password: string) => {
        const db = await initDB();
        const user = await db.get(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        );
        if (!user) return null;
        return await bcrypt.compare(password, user.password);
    }
};

export const SongHandler = {
    // Insert song
    insert: async (song: SongRecord) => {
        db = await initDB();
        try {
            const result = await db.run(
                `INSERT INTO songs (file_id, title, artist, cover, duration)
                 VALUES (?, ?, ?, ?, ?)`,
                [song.file_id, song.title, song.artist ?? null, song.cover ?? null, song.duration]
            );
            if (!result.lastID) {
                throw new Error('Insert failed. No lastID return');
            }
            return result.lastID;
        } catch (err) {
            handleInsertionSQLError(err);
        }
    },

    // Get songRecord by song_id
    getSongByID: async (song_id: number) => {
        db = await initDB();
        const song = await db.get<SongRecord>(`
            SELECT * FROM songs s JOIN files f ON s.file_id = f.id WHERE s.id = ?;`,
            [song_id]
        );
        return song || null;
    },

    // Get song by file_id
    getSongByFileID: async (file_id: number) => {
        db = await initDB();
        const song = await db.get<SongRecord>(
            `SELECT * FROM songs s JOIN files f ON s.file_id = f.id WHERE s.file_id = ?;`,
            [file_id]
        );
        return song || null;
    },

    // Get songs by user_id (have not tested)
    getSongsByUserID: async (user_id: string) => {
        db = await initDB();
        const songs = await db.all<SongRecord[]>(
            `SELECT s.*,
                    f.filepath,
                    f.size,
                    f.type
             FROM songs s
             JOIN files f ON 
             s.file_id = f.id 
             WHERE f.user_id = ?`,
            [user_id]
        );
        return songs;
    },

    // Remove songRecord by song_id
    removeSongByID: async (song_id: number) => {
        db = await initDB();
        const result = await db.run(`DELETE FROM songs WHERE id = ?;`, [song_id]);
        return result.changes! > 0;
    },
}

export const PlayListHandler = {
    // Create playlist
    createPlaylist: async (playlist: Playlist) => {
        db = await initDB();
        const result = await db.run(`
            INSERT INTO playlists (name, user_id, description, cover)
            VALUES (?, ?, ?, ?);`,
            [playlist.name, playlist.user_id, playlist.description ?? null, playlist.cover ?? null]
        );
        if (!result.lastID) throw new Error(`Fail to create playlist ${playlist.name}`);
        return result.lastID!;
    },

    // Get playlist by user_id
    getPlaylistsByUserID: async (user_id: string) => {
        db = await initDB();
        const playlists = await db.all<Playlist[]>(`
            SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC`,
            [user_id]
        );
        return playlists;
    },

    getPlaylistByID: async (playlist_id: number) => {
        db = await initDB();
        const result = await db.get<Playlist>(`
            SELECT * FROM playlists WHERE id =  ?;`,
            [playlist_id]
        );
        return result ?? null;
    },

    // Remove playlist by playlist_id
    removePlaylistByID: async (playlist_id: number) => {
        db = await initDB();
        const result = await db.run(
            `DELETE FROM playlists WHERE id = ?`,
            [playlist_id]
        );
        return result.changes! > 0;
    },

    // Add song to a playlist
    addSongToPlaylist: async (playlist_id: number, song_id: number) => {
        db = await initDB();
        logger.debug(`Attempting to add song_id: ${song_id} to playlist_id: ${playlist_id}`);
        try {
            // Check existance of playlist_id
            const playlist = await db.get(`SELECT 1 FROM playlists WHERE id = ?`, [playlist_id]);
            if (!playlist) {
                throw new Error('Playlist does not exist');
            }
            // Check existance of song_id
            const song = await db.get(`SELECT 1 FROM songs WHERE id = ?`, [song_id]);
            if (!song) {
                throw new Error('Song does not exist');
            }

            await db.run(
                `INSERT OR IGNORE INTO playlistEntries (playlist_id, song_id) VALUES (?, ?)`,
                [playlist_id, song_id]
            );
            logger.info(`Successfully added ${song_id} to ${playlist_id}`);
            return true;
        } catch (err: any) {
            throw err;
        }
    },

    // Remove song from playlist
    removeSongFromPlaylist: async (playlist_id: number, song_id: number) => {
        db = await initDB();
        const result = await db.run(
            `DELETE FROM playlistEntries WHERE playlist_id = ? AND song_id = ?`,
            [playlist_id, song_id]
        );
        return result.changes! > 0;
    },

    // Get songs by playlist_id
    getSongsByPlaylistID: async (playlist_id: number) => {
        db = await initDB();
        const songs = await db.all<SongRecord[]>(
            `SELECT s.*
             FROM songs s
             JOIN playlistEntries pe ON s.id = pe.song_id
             WHERE pe.playlist_id = ?`,
            [playlist_id]
        );
        logger.debug(`Get songs in playlist_id: ${playlist_id}`, {songs});

        return songs;
    },

    // 判断歌曲是否在playlist里
    isSongInPlaylist: async (playlist_id: number, song_id: number) => {
        db = await initDB();
        const result = await db.get(
            `SELECT 1 FROM playlistEntries WHERE playlist_id = ? AND song_id = ?`,
            [playlist_id, song_id]
        );
        return !!result;
    }
}


function handleInsertionSQLError(error: unknown): never {
    if (error instanceof Error) {
        if (error.message.includes('SQLITE_CONSTRAINT: FOREIGN KEY')) {
            logger.error(`数据库外键约束错误 ${error.message}`, {stack: error.stack});
            throw new Error(`数据库外键约束错误: ${error.message}`);
        }
        if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE')) {
            logger.error(`数据不唯一 ${error.message}`, {stack: error.stack});
            throw new Error(`数据不唯一: ${error.message}`);
        }

    }
    logger.error(`Fail to insert ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Fail to insert: ${error instanceof Error ? error.message : String(error)}`);
}