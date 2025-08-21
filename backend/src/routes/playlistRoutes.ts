import express from "express";
import { PlayListHandler, UserHandler } from "../services/db_handler";
import { Playlist } from "../services/types";

export const playlistRouter = express.Router();

// Add new playlist
playlistRouter.post('/add', async (req, res) => {
    try {
        const user_id: string = req.user?.user_id;
        if (!user_id) {
            res.status(401).json({ error: "Missing user_id" });
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
    } catch (err) {
        console.error("Failed to add new playlist:", err);
        res.status(500).json({ error: "Failed to add playlist" });
    }
});


// remove playlist
playlistRouter.delete('/:playlist_id', async (req, res) => {
    try {
        const user_id = req.user!.user_id;
        const playlist_id = req.params.playlist_id;
        if (!playlist_id || isNaN(Number(playlist_id))) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const playlist = await PlayListHandler.getPlaylistByID(Number(playlist_id));
        // 权限判定
        if (playlist?.user_id !== user_id) {
            res.status(401).json({ error: "User_id not match do not have permission to delete playlist" });
            return;
        } 

        const result = await PlayListHandler.removePlaylistByID(Number(playlist_id));
        if (!result) {
            res.status(500).json({ error: "Database error, may not exist" });
            return;
        } else {
            res.status(204).json({ success: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fail to remove playlist" });
    }
});

// Add song to given playlist
playlistRouter.put('/:playlist_id/:song_id/add-song', async (req, res): Promise<any> => {
    try {
        const { playlist_id, song_id } = req.params;
        if (!playlist_id || !song_id || isNaN(Number(playlist_id)) || isNaN(Number(song_id))) {
            return res.status(400).json({ error: "Missing required field" });
        }
        const user_id = req.user?.user_id;
        if (!user_id) return res.status(401).json({ error: "Missing user_id" });

        const result = await PlayListHandler.addSongToPlaylist(Number(playlist_id), Number(song_id));
        if (!result) return res.status(500).json({ error: "Database error" });
        return res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
});

// Have not tested
// Add songs to given playlist
playlistRouter.put('/:playlist_id/add-songs', async (req, res): Promise<any> => {
    try {
        const { playlist_id } = req.params;
        const { song_ids } = req.body;

        if (!playlist_id || isNaN(Number(playlist_id))) {
            return res.status(400).json({ error: "Missing or invalid playlist_id" });
        }

        if (!Array.isArray(song_ids) || song_ids.length === 0) {
            return res.status(400).json({ error: "Missing song_ids" });
        }

        const user_id = req.user?.user_id;
        if (!user_id) return res.status(401).json({ error: "Missing user_id" });

        const results = [];
        for (const id of song_ids) {
            const song_id = Number(id);
            if (isNaN(song_id)) continue;
            const result = await PlayListHandler.addSongToPlaylist(Number(playlist_id), song_id);
            results.push({ song_id, success: !!result });
        }

        return res.status(201).json({ success: true, results });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
});


// Get playlists by user_id
playlistRouter.get('/', async (req, res): Promise<any> => {
    try {
        const user_id: string = req.user?.user_id;
        if (!user_id) {
            return res.status(401).json({ error: "Missing required user_id" });
        }

        let playlists = await PlayListHandler.getPlaylistsByUserID(user_id);
        playlists = await Promise.all(
            playlists.map(async (pl) => {
                const songs = await PlayListHandler.getSongsByPlaylistID(pl.id!);
                return {
                    ...pl,
                    songs: songs || []
                };
            })
        );

        return res.status(200).json(playlists);
    } catch (err) {
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
            } else {
                return res.status(201).json({ success: true });
            }
        } else {
            return res.status(401).json({ error: "Do not have permission to update playlist" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
});


// Have not tested
// Get songs from given playlist
playlistRouter.get('/:playlist_id/songs', async (req, res): Promise<any> => {
    try {
        const { playlist_id } = req.params;
        if (!playlist_id || isNaN(Number(playlist_id))) {
            return res.status(400).json({ error: "Missing or invalid playlist_id" });
        }

        const user_id: string = req.user?.user_id;
        if (!user_id) return res.status(401).json({ error: "Missing user_id" });

        const songs = await PlayListHandler.getSongsByPlaylistID(Number(playlist_id));

        return res.status(200).json(songs || []);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
});