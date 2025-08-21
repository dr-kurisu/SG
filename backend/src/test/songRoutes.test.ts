import request from 'supertest';
import express from 'express';
import { songRouter } from '../routes/songRoutes';
import { disconnectDB, SongHandler } from '../services/db_handler';
import { SongRecord } from '../services/types';
import fs from "fs";
import { getUploadDir } from '../services/storage';
import path from 'path';
import authenticateToken from '../middlerware/authToken';
import { clearDatabase, muteConsole } from '../services/utili';


const app = express();
app.use(express.json());
app.use(authenticateToken);
app.use('/songs', songRouter);


describe('GET /songs/:song_id', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return 400 if song_id is missing or invalid', async () => {
    const res = await request(app).get('/songs/notANumber');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it('should return 404 if song is not found', async () => {
    jest.spyOn(SongHandler, 'getSongByID').mockResolvedValue(null);
    const res = await request(app).get('/songs/123');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('should return correct song with correct song_id', async() => {
    const mockSong: SongRecord = {
        id: 1,
        title: 'Test Song',
        duration: 120,
        file_id: 5,
        user_id: 'test_user',
        filename: '',
        filepath: '',
        size: 0,
        type: ''
    };
    jest.spyOn(SongHandler, 'getSongByID').mockResolvedValue(mockSong);
    const res = await request(app).get('/songs/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSong);
  });

  it('should return 500 when has internal server error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(SongHandler, 'getSongByID').mockImplementation(() => {
      throw new Error('Database error');
    });
    const res = await request(app).get('/songs/1');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/internal/i);
    errorSpy.mockRestore();
  });
});

describe('DELETE /songs/:song_id', () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    it('should return 400 if song_id is missing or invalid', async() => {
        const res = await request(app).delete('/songs/notANumber');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/missing/i);
    });

    it('should return 404 if song_id not in DB', async() => {
        jest.spyOn(SongHandler, 'removeSongByID').mockResolvedValue(false);
        const res = await request(app).delete('/songs/1234');
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/not found/i);
    });

    it('should return 200 if successfully deleted', async() => {
        jest.spyOn(SongHandler, 'removeSongByID').mockResolvedValue(true);
        const res = await request(app).delete('/songs/1234');
        expect(res.status).toBe(200);    
    });

    it('should return 500 if has internal error', async() => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(SongHandler, 'removeSongByID').mockImplementation(() => {
            throw new Error("Database error");
        });
        
        const res = await request(app).delete('/songs/1234');
        expect(res.status).toBe(500);
        expect(res.body.error).toMatch(/internal/i);   
        errorSpy.mockRestore();
    });
})


describe("POST /songs/add-song", () => {
    const songRecord = {
        file_id: 1,
        title: 'Test Song',
        duration: 120,
        user_id: 'user123',
        filename: 'test.mp3',
        filepath: '/music/test.mp3',
        size: 123456,
        type: 'audio/mpeg'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should insert song record if everything is right", async() => {
        jest.spyOn(SongHandler, "insert").mockResolvedValue(1);
        const res = await request(app)
            .post('/songs/add-song')
            .send(songRecord);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
        expect(SongHandler.insert).toHaveBeenCalledWith(songRecord);
    });

    test("should return 500 if had internal error", async() => {
        jest.spyOn(SongHandler, "insert").mockImplementation(() => {
            throw new Error("Internal Error");
        })
        const res = await request(app)
        .post('/songs/add-song')
        .send(songRecord);
        expect(res.status).toBe(500);
        expect(res.body.err).toContain('Fail to insert song');
    });

    test("should return 400 if missing required fields", async() => {
        const res = await request(app)
            .post('/songs/add-song')
            .send();

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ err: 'song record is required' });
    });
});

describe("GET /songs/stream/song_id", () => {
    const tempDir = path.posix.join(getUploadDir(), "test_user", "temp");
    const tempFile = path.posix.join(tempDir, "TEST_MUSIC.mp3");

    beforeAll(() => {
        fs.mkdirSync(tempDir, { recursive: true });
    });

    beforeEach(() => {
        fs.writeFileSync(tempFile, "FAKE_MP3_DATA_123456789");
    });

    afterEach(() => {
        jest.restoreAllMocks();
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    });

    test("should return 400 when missing or invalid song_id", async() => {
        const res = await request(app)
        .get("/songs/stream/notANumber");
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/song_id is required/i);
    });

    test("should return 200 if success", async() => {
        jest.spyOn(SongHandler, "getSongByID").mockResolvedValue({
            user_id: "test_user",
            filename: "TEST_MUSIC.mp3",
            filepath: "/temp/",
            size: fs.statSync(tempFile).size,
            type: 'audio/mpeg',
            file_id: 1,
            title: "TEST MUSIC",
            duration: 120
        });
        // 增加parse方便测试内容
        const res = await request(app)
        .get("/songs/stream/1")
        .buffer()
        .parse((res, cb) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk) => chunks.push(chunk));
            res.on("end", () => cb(null, Buffer.concat(chunks)));
        });
        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toBe("audio/mpeg");
        expect(Number(res.headers["content-length"])).toBe(fs.statSync(tempFile).size);
        expect(res.body.toString()).toContain("FAKE_MP3_DATA_123456789");
    });
});


// 避免影响其他的测试
afterAll(async () => {
    const restoreConsole = muteConsole(['log', 'error']);
    await disconnectDB();
    await clearDatabase();
    restoreConsole();
});