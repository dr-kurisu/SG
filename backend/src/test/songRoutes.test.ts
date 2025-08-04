import request from 'supertest';
import express from 'express';
import { songRouter } from '../routes/songRoutes';
import { SongHandler } from '../services/db_handler';
import { SongRecord } from '../services/types';


const app = express();
app.use(express.json());
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
    })
})