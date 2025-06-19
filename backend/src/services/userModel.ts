import { Database } from 'sqlite';
import { initDB } from "./db_handler";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid"
import { userRecord } from './types';

let db: Database | null = null;

export const UserHandler = {
    insertUser: async (username: string, password: string) => {
        db = db ?? await initDB();
        try {
            const user_id = await uuidv4()
            const result = await db.run(
                `INSERT INTO users (username, password, user_id) VALUES (?, ?, ?)`,
                [username, password, user_id]
            );
            return { id: result.lastID };
        } catch (err: any) {
            throw new Error(`插入用户失败：${err.message}`);
        }
    },

    removeUser: async (username: string) => {
        db = db ?? await initDB();
        const result = await db.run(`DELETE FROM users WHERE username = ?`, [username]);
    },

    updateUser: async (username: string, newPassword: string) => {
        db = db ?? await initDB();
        const result = await db.run(
            `UPDATE users SET password = ? WHERE username = ?`,
            [newPassword, username]
        );

        if (!result || !result.changes) {
            throw new Error(`Fail to update user info ${username}`);
        }

        return result.changes > 0;
    },

    checkUser: async (username: string): Promise<string | null> => {
        db = db ?? await initDB();
        const user = await db.get(
            `SELECT user_id FROM users WHERE username = ?`,
            [username]
        );
        if (!user || !user.user_id) {
            return null;
        }else {
            return user.user_id;
        }
    },

    verifyUser: async (username: string, password: string): Promise<boolean> => {
        db = db ?? await initDB();

        const user = await db.get<userRecord>(
            `SELECT id, username, password FROM users WHERE username = ?`,
            [username]
        );

        if (!user) {
            return false;
        }
        const match = await bcrypt.compare(password, user.password);
        return match;
    }
}