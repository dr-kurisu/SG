import express from "express";
import { SongRecord } from "../services/types";
import { SongHandler } from "../services/db_handler";
import { removeSongBySongID } from "../services/song";

export const songRouter = express.Router();

// Upload song POST
songRouter.post('/', async(req, res) => {
    // Todo
});

// Insert song record POST
songRouter.post('/record', async(req, res) => {
    // upload file_id
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

});