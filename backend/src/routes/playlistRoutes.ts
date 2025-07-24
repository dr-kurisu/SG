import express, { Request, Response } from "express";
import {
  getAllPlaylist,
  removePlaylist,
  getEntriesByPlayListID,
  insertEntryByPlayListID,
  removeEntryByPlayListIDByEntryID,
  createPlaylist,
} from "../services/music";

const playlistRouter = express.Router();

// 获取用户所有 playlist
playlistRouter.get("/getAllPlaylists", async (req: Request, res: Response) => {
  const user_id = "admin";
  const playlists = await getAllPlaylist(user_id);
  res.status(200).json(playlists);
});

// 创建新的 playlist
playlistRouter.post("/", async (req: Request, res: Response) => {
  const user_id = "admin";
  const { name, description, cover_path } = req.body;

  console.log(name, description, cover_path);
  
  if (!name) {
    res.status(400).json({ error: "Playlist name is required" });
    return;
  }
  
  try {
    const playlist_id = await createPlaylist(user_id, name, description, cover_path);
    res.status(201).json({ playlist_id });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 删除 playlist
playlistRouter.delete("/:playlist_id", async (req: Request, res: Response) => {
  const user_id = "admin";
  const { playlist_id } = req.params;
  const result = await removePlaylist(Number(playlist_id), user_id);
  res.status(200).json({ success: result });
});

// 获取 playlist 的所有 entries
playlistRouter.get("/:playlist_id/entries", async (req: Request, res: Response) => {
  const user_id = "admin";
  const { playlist_id } = req.params;
  const entries = await getEntriesByPlayListID(Number(playlist_id), user_id);
  res.status(200).json(entries);
});

// 添加 music entry 到 playlist
playlistRouter.post("/:playlist_id/music/:music_id", async (req: Request, res: Response) => {
  const user_id = "admin";
  const { playlist_id, music_id } = req.params;
  try {
    const lastID = await insertEntryByPlayListID(user_id, Number(playlist_id), Number(music_id));
    res.status(201).json({ entry_id: lastID });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 删除 playlist entry（从 playlist 中移除 music）
playlistRouter.delete("/:playlist_id/entries/:entry_id", async (req: Request, res: Response) => {
  const user_id = "admin";
  const { playlist_id, entry_id } = req.params;
  try {
    await removeEntryByPlayListIDByEntryID(user_id, Number(playlist_id), Number(entry_id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default playlistRouter; 