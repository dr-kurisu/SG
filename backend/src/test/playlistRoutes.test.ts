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
    test("should return 400 if missing required field", async() => {
        const res = await request(app).post("/playlist/add");
        expect(res.status).toBe(400);
    });

    test("should return 500 if has internal error", async() => {
        const originalError = console.error;
        console.error = () => {};
        jest.spyOn(PlayListHandler, "createPlaylist").mockImplementation(() => {
            throw new Error("Database error");
        });
        const res = await request(app).post("/playlist/add").send(examplePlaylistRecord);
        console.error = originalError;
        expect(res.status).toBe(500);
    });

    test("should return 201 if successfully changed", async() => {
        jest.spyOn(PlayListHandler, "createPlaylist").mockResolvedValue(1);
        const res = await request(app).post("/playlist/add").send(examplePlaylistRecord);
        expect(res.status).toBe(201);
    });
});