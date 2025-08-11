import express, {Request, Response} from "express";
import { removeSongBySongID } from "../services/song";
import fs from 'fs';
import { PlayListHandler, UserHandler } from "../services/db_handler";
import { Playlist } from "../services/types";

export const playlistRouter = express.Router();


// Add new playlist
playlistRouter.post('/add', async(req, res) => {
    try {
        const user_id: string = req.user?.user_id;
        if (!user_id) {
            res.status(401).json({error: "Missing user_id"});
        }
        
        const playlist: Playlist = req.body;

        if (!playlist || !playlist.name) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        playlist.user_id = user_id;

        const playlist_id = await PlayListHandler.createPlaylist(playlist);

        if (isNaN(Number(playlist_id))) {
            throw new Error("playlist_id not valid");
        }
        res.status(201).json({ success: true, playlist_id });
    }catch (err) {
        console.error("Failed to add new playlist:", err);
        res.status(500).json({ error: "Failed to add playlist" });
    }
});


// remove playlist
playlistRouter.delete('/:playlist_id', async(req, res) => {
    try {
        const user_id = req.user?.user_id;
        const playlist_id = req.params.playlist_id;
        if (!user_id || !playlist_id || isNaN(Number(playlist_id))) {
            res.status(400).json({ error: "missing required fields "});
            return;
        }

        const result = await PlayListHandler.removePlaylistByID(Number(playlist_id));
        if (!result) {
            res.status(500).json({ error: "Database error"});
            return;
        }else {
            res.status(204).json({ success: true });
        }
    }catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fail to remove playlist" });
    }
});

// Add song to current playlist
playlistRouter.put('/:playlist_id/:song_id/add-song', async(req, res): Promise<any> => {
    try {
        const playlist_id = req.params.playlist_id;
        const song_id = req.params.song_id;
        if (!playlist_id || !song_id || isNaN(Number(playlist_id)) || isNaN(Number(song_id))) {
            return res.status(400).json({ error: "Missing required field" });
        }
        const user_id = req.user?.user_id;
        if (!user_id) return res.status(401).json({ error: "Missing user_id" });

        const result = await PlayListHandler.addSongToPlaylist(Number(playlist_id), Number(song_id));
        if (!result) return res.status(500).json({ error: "Database error" });
        return res.status(201).json({ success: true });
    }catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
});

// Get playlists by user_id
playlistRouter.get('/', async(req, res): Promise<any> => {
    try {
        const user_id: string = req.user?.user_id;
        if (!user_id) {
            return res.status(401).json({ error: "Missing required user_id" });
        }

        const playlists = await PlayListHandler.getPlaylistsByUserID(user_id);
        return res.status(200).json(playlists);
    }catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
});

// Remove song from playlist
playlistRouter.delete('/:playlist_id/:song_id', async (req, res): Promise<any> => {
    try {
        const user_id: string = req.user?.user_id;
        if (!user_id) {
            return res.status(401).json({ error: "Missing required user_id" });
        }
        const playlist_id = req.params.playlist_id;
        const song_id = req.params.song_id;
        if (!playlist_id || !song_id || isNaN(Number(playlist_id)) || isNaN(Number(song_id))) {
            return res.status(400).json({ error: "Missing required field" });
        }

        const playlist = await PlayListHandler.getPlaylistByID(Number(playlist_id));
        const permission = (await UserHandler.getUserByUserID(user_id))?.permission;
        if (!permission) {
            return res.status(401).json({ error: "User does not have permission" });
        }
        if (playlist?.user_id === user_id || permission > 10) {
            const result = await PlayListHandler.removeSongFromPlaylist(Number(playlist_id), Number(song_id));
            if (!result) {
                return res.status(500).json({ error: "Database error" });
            }else {
                return res.status(201).json({ success: true });
            }
        }else {
            return res.status(401).json({ error: "Do not have permission to update playlist"});
        }
    }catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
});