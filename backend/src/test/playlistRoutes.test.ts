import request from 'supertest';
import express from 'express';
import { playlistRouter } from "../routes/playlistRoutes";
import authenticateToken from "../middlerware/authToken";
import { examplePlaylistRecord } from "./exampleRecord";
import { PlayListHandler } from '../services/db_handler';

const app = express();

app.use(express.json());
app.use(authenticateToken);
app.use("/playlist", playlistRouter);

describe("POST /playlist/add", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    test("should return 400 if missing required field", async () => {
        const res = await request(app).post("/playlist/add");
        expect(res.status).toBe(400);
    });

    test("should return 500 if has internal error", async () => {
        const originalError = console.error;
        console.error = () => { };
        jest.spyOn(PlayListHandler, "createPlaylist").mockImplementation(() => {
            throw new Error("Database error");
        });
        const res = await request(app).post("/playlist/add").send(examplePlaylistRecord);
        console.error = originalError;
        expect(res.status).toBe(500);
    });

    test("should return 201 if successfully changed", async () => {
        jest.spyOn(PlayListHandler, "createPlaylist").mockResolvedValue(1);
        const res = await request(app).post("/playlist/add").send(examplePlaylistRecord);
        expect(res.status).toBe(201);
    });
});

describe("DELETE /playlist/:playlist_id", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    test("should return 400 if invalid playlist_id", async() => {
        const res = await request(app).delete("/playlist/NotANumber");
        expect(res.status).toBe(400);
    });
    test("should return 401 if user_id not match", async() => {
        jest.spyOn(PlayListHandler, "getPlaylistByID").mockResolvedValue({ 
            user_id: "random_user_id",
            name: "test_playlist",
            description: null,
            cover: null
        });
        const res = await request(app).delete("/playlist/1");
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/permission/i);
    });
    test("should return 500 if result is false", async() => {
        jest.spyOn(PlayListHandler, "getPlaylistByID").mockResolvedValue({ 
            user_id: "test_user",
            name: "test_playlist",
            description: null,
            cover: null
        });
        jest.spyOn(PlayListHandler, "removePlaylistByID").mockResolvedValue(false);
        const res = await request(app).delete("/playlist/1");
        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/Database/i);
    });
    test("should return 500 if has internal error", async() => {
        jest.spyOn(PlayListHandler, "getPlaylistByID").mockImplementation(() => {
            throw new Error("Database error");
        });
        const originalError = console.error;
        console.error = () => { };
        const res = await request(app).delete("/playlist/1");
        expect(res.status).toBe(500);
        console.error = originalError;
    });
    test("should return 204 if successful deleted", async() => {
        jest.spyOn(PlayListHandler, "getPlaylistByID").mockResolvedValue({ 
            user_id: "test_user",
            name: "test_playlist",
            description: null,
            cover: null
        });
        jest.spyOn(PlayListHandler, "removePlaylistByID").mockResolvedValue(true);
        const res = await request(app).delete("/playlist/1");
        expect(res.status).toBe(204);
    });
});

describe("GET /playlist/", () => {

});

describe("PUT /playlist/:playlist_id/:song_id/add-song", () => {

});

describe("DELETE /playlist/:playlist_id/:song_id", () => {

});