import express, {Request, Response} from "express";
import { SongRecord } from "../services/types";
import { SongHandler } from "../services/db_handler";
import { removeSongBySongID } from "../services/song";
import fs from "fs";
import path from "path";
import { getUploadDir } from "../services/storage";

export const songRouter = express.Router();

// Insert song record POST
songRouter.post('/add-song', async(req: Request, res: Response) => {
    const song: SongRecord = req.body
    if (!song) {
        res.status(400).json({"err": "song record is required"});
    }
    try {
        const result = await SongHandler.insert(song);
        if (!result) throw new Error()
        res.status(200).json({"success": true});
    }catch(err) {
        res.status(500).json({"err": `Fail to insert song. ${err}`});
    }
});

// Get songs info
songRouter.get('/:song_id', async(req, res) => {
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
    }catch (err) {
        console.error("Error fetching song:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /songs/:song_id
songRouter.delete('/:song_id', async(req, res) => {
    const song_id = req.params.song_id;
    if (!song_id || isNaN(Number(song_id))) {
        res.status(400).json({ error: "Invalid or missing song_id" });
        return;
    }
    try {
        const result = await removeSongBySongID(Number(song_id));
        if (!result) {
            res.status(404).json({error: "Song not found"});
            return;
        }
        res.sendStatus(200);
    }catch (err) {
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});

// GET /stream/:song_id
songRouter.get('/stream/:song_id', async(req, res) => {
    const song_id = req.params.song_id;
    if (!song_id || isNaN(Number(song_id))) {
        res.status(400).json({ error: "song_id is required" });
        return;
    }

    try {
        const user_id = req.user!.user_id;
        const song = await SongHandler.getSongByID(Number(song_id));
        if (!song) {
            res.status(404).json({ error: "Song not found" });
            return;
        }
        // 检查文件是否存在
        const fullPath = path.posix.join(getUploadDir(), user_id, song.filepath, song.filename);
        console.log(fullPath);
        if (!fs.existsSync(fullPath)) {
            res.status(404).json({ error: "File not found" });
            return;
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});