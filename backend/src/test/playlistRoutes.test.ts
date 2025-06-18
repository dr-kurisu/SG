import request from "supertest"
import express from "express"
import playlistRouter from "../routes/playlistRoutes"
import { getAllPlaylist, getEntriesByPlayListID, insertEntryByPlayListID, removePlaylist } from "../services/music";


import { PlayList } from '../services/types';


jest.mock("../services/music", () => ({
  getAllPlaylist: jest.fn(),
  removePlaylist: jest.fn(),
  getEntriesByPlayListID: jest.fn(),
  insertEntryByPlayListID: jest.fn(),
  removeEntryByPlayListIDByEntryID: jest.fn(),
}));

// 引用 mock 函数
const mockedGetAllPlaylist = getAllPlaylist as jest.Mock;
const mockedGetEntries = getEntriesByPlayListID as jest.Mock;
const mockedInsertEntry = insertEntryByPlayListID as jest.Mock;
const mockedRemovePlaylist = removePlaylist as jest.Mock;


const mockPlaylists: PlayList[] = [
  {
    id: 1,
    user_id: "admin",
    name: "安静的音乐",
    description: "A playlist for testing music.",
    cover_path: null,
    created_time: "2025-06-16T12:00:00Z",
    is_public: true,
  },
  {
    id: 2,
    user_id: "admin",
    name: "Workout !!!",
    description: null,
    cover_path: null,
    created_time: "2025-06-15T08:30:00Z",
    is_public: false,
  },
];

const mockPlaylistEntries = [
    {
        id: 1,
        playlist_id: 2,
        music_id: 4,
        position: 0,
        added_at: "2025-06-16T12:00:00Z",
    },

    {
        id: 2,
        playlist_id: 2,
        music_id: 6,
        position: 1,
        added_at: "2025-06-16T12:00:00Z",
    }
]

beforeEach(() => {
  mockedGetAllPlaylist.mockResolvedValue(mockPlaylists);
  mockedGetEntries.mockResolvedValue(mockPlaylistEntries);
  mockedInsertEntry.mockResolvedValue(3);
  mockedRemovePlaylist.mockResolvedValue(true);
});


const app = express();
app.use(express.json());
app.use("/api/playlist", playlistRouter);


// describe
describe("Playlist API", () => {
    it("GET /api/playlist/getAllPlaylists - should return all playlists", async () => {
        const res = await request(app).get("/api/playlist/getAllPlaylists");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPlaylists);
    });

    it("GET /api/playlist/2/entries - should return playlist entries", async () => {
        const res = await request(app).get("/api/playlist/2/entries");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPlaylistEntries);
    });

    it("POST /api/playlist/2/music/6 - should insert entry and return entry_id", async () => {
        const res = await request(app).post("/api/playlist/2/music/6");
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ entry_id: 3 });
    });

    it("DELETE /api/playlist/1 - should delete a playlist", async () => {
        const res = await request(app).delete("/api/playlist/1");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

});
