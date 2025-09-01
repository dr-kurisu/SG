import express, { Request, Response } from "express";
import { SongRecord } from "../services/types";
import { FileHandler, SongHandler } from "../services/db_handler";
import { removeSongBySongID } from "../services/song";
import fs from "fs";
import path from "path";
import { getUploadDir } from "../services/storage";
import { parseBuffer } from "music-metadata"
import { fileTypeFromFile } from "file-type";
import logger from "../logger/logger";

export const songRouter = express.Router();

// Insert song record POST
songRouter.post("/add-song", async (req: Request, res: Response): Promise<any> => {
    const { file_id } = req.body;
    if (!file_id) {
        return res.status(400).json({ err: "file_id is required" });
    }

    try {
        const user_id = req.user?.user_id;
        const file = await FileHandler.getById(file_id, user_id);

        if (!file) {
            return res.status(404).json({ err: "File not found" });
        }
        const fullPath = path.posix.join(getUploadDir(), user_id, file.filepath, file.filename);

        // type check
        const fileType = await fileTypeFromFile(fullPath);
        if (!fileType || !fileType.mime.startsWith('audio/')) {
            return res.status(400).json({ err: "File is not valid audio type" });
        }

        const buffer = await fs.promises.readFile(fullPath);

        const metadata = await parseBuffer(buffer, { mimeType: fileType.mime });

        const song: SongRecord = {
            ...file,
            file_id,
            title: metadata.common.title || file.filename,
            artist: metadata.common.artist || "Unknown Artist",
            cover: "",
            duration: metadata.format.duration || 0,
        };

        const result = await SongHandler.insert(song);

        if (result) {
            res.status(200).json({ success: true });
        } else {
            throw new Error("Fail to insert song in DB");
        }
    } catch (err) {
        res.status(500).json({ err: `Fail to add song: ${(err as Error).message}` });
    }
});

// Get song info
songRouter.get('/:song_id/get-song', async (req, res) => {
    const song_id = req.params.song_id;
    if (!song_id || isNaN(Number(song_id))) {
        res.status(400).json({ error: "Invalid or missing song_id" });
        return;
    }

    try {
        const song = await SongHandler.getSongByID(Number(song_id));
        if (!song) {
            res.status(404).json({ error: "Song not found" });
            return;
        }
        res.status(200).json(song);
    } catch (err) {
        console.error("Error fetching song:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get songs info by user_id
songRouter.get('/get-songs', async (req, res): Promise<any> => {
    const user_id = req.user?.user_id;
    if (!user_id) { 
        logger.error(`Fail to get user songs since unauthorised access`);
        return res.status(401).json({ err: "Unauthorised" }); 
    }

    logger.info(`Attemping to get user_id: ${user_id} songs in /get-songs`);

    try {
        const songs = await SongHandler.getSongsByUserID(user_id);
        logger.debug(`Get songs from user_id: ${user_id}`, {songs});
        return res.status(200).json(songs);
    } catch (err: any) {
        logger.error(`Error occur when get-songs: ${err.message}`, { user_id, stack: err.stack });
        return res.status(500).json({ err: `Internal Error` })
    }
});

// DELETE /songs/:song_id
songRouter.delete('/:song_id', async (req, res) => {
    const song_id = req.params.song_id;
    if (!song_id || isNaN(Number(song_id))) {
        res.status(400).json({ error: "Invalid or missing song_id" });
        return;
    }
    try {
        const result = await removeSongBySongID(Number(song_id));
        if (!result) {
            res.status(404).json({ error: "Song not found" });
            return;
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /stream/:song_id
songRouter.get('/stream/:song_id', async (req, res): Promise<any> => {
    const song_id = req.params.song_id;
    if (!song_id || isNaN(Number(song_id))) {
        res.status(400).json({ error: "song_id is required" });
        return;
    }

    try {
        const user_id = req.user!.user_id;
        const song = await SongHandler.getSongByID(Number(song_id));
        if (!song) {
            // Remove song if song not found
            await SongHandler.removeSongByID(Number(song_id));
            return res.status(404).json({ error: "Song not found" });
        }

        // 检查文件是否存在
        const fullPath = path.posix.join(getUploadDir(), user_id, song.filepath, song.filename);
        if (!fs.existsSync(fullPath)) {
            // immediate remove
            await FileHandler.quicklyRemoveById(song.file_id, user_id);
            logger.warn(`${song.filename} with file_id: ${song.file_id} has been removed since file does not exist`);
            return res.status(404).json({ error: "File not found" });
        }

        // 获取文件基本信息
        const stat = fs.statSync(fullPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // 支持断点续传
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunkSize = (end - start) + 1;
            const file = fs.createReadStream(fullPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': song.type || 'audio/mpeg',
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': song.type || 'audio/mpeg',
            };
            res.writeHead(200, head);
            fs.createReadStream(fullPath).pipe(res);
        }
    } catch (err: any) {
        logger.error(err.message, {stack: err.stack});
        res.status(500).json({ error: "Internal server error" });
    }
});