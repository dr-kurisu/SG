import { disconnectDB, FileHandler, initDB, PlayListHandler, SongHandler, UserHandler } from '../services/db_handler';
import { Database } from 'sqlite';
import { clearDatabase, muteConsole } from '../services/utili';
import bcrypt from "bcryptjs";
import { SongRecord } from '../services/types';
import { exampleFileRecord, examplePlaylistRecord } from './exampleRecord';



describe('Database Integration Tests', () => {
    let db: Database;
    const user_id = "admin";
    let restoreConsole: () => void;

    beforeAll(async () => {
        restoreConsole = muteConsole();
        db = await initDB();
        restoreConsole();
    });

    afterAll(async () => {
        restoreConsole = muteConsole();
        await disconnectDB();
        await clearDatabase();
        restoreConsole();
    });

    test('Full file insert and retrieve flow', async () => {
        const file_id = await FileHandler.insert({
            user_id: user_id,
            filename: 'music.mp3',
            filepath: '/music',
            size: 1024,
            type: 'audio/mpeg'
        });
        expect(file_id).toBeDefined();
        const file = await FileHandler.getById(1, user_id);
        expect(file?.id).toBe(1);
        expect(file?.filename).toBe("music.mp3");
        expect(file?.filepath).toBe("/music");
    });
});


describe('File field update', () => {
    let db: Database;
    let restoreConsole: () => void;

    beforeAll(async () => {
        restoreConsole = muteConsole();
        db = await initDB();
        restoreConsole();
    });

    afterAll(async () => {
        restoreConsole = muteConsole();
        await disconnectDB();
        await clearDatabase();
        restoreConsole();
    });


    test('Normal case', async () => {
        const file_id = await FileHandler.insert({
            user_id: "test",
            filename: 'music.mp3',
            filepath: '/music',
            size: 1024,
            type: 'audio/mpeg'
        });
        const oldFile = await FileHandler.getById(file_id, "test");
        expect(oldFile?.permission).toBe(0);
        const result = await FileHandler.updatePermissionById(file_id, "test", 1);
        const newFile = await FileHandler.getById(file_id, "test");
        expect(result).toBe(true);
        expect(newFile?.permission).toBe(1);
    });
});

describe('User table test', () => {
    let db: Database;
    let restoreConsole: () => void;

    beforeAll(async () => {
        restoreConsole = muteConsole(['log']);
        db = await initDB();
        restoreConsole();
    });

    afterAll(async () => {
        restoreConsole = muteConsole(['log']);
        await disconnectDB();
        await clearDatabase();
        restoreConsole();
    });

    test('should insert and get normal user', async () => {
        const passwordHash = await bcrypt.hash("123456", 10);
        const id = await UserHandler.insert("test_user", "test_user", passwordHash, 0);
        const user = await UserHandler.getUserByUserID("test_user");

        expect(id).toBeGreaterThan(0);
        expect(user?.password).toBe(passwordHash);
        expect(user?.permission).toBe(0);
        expect(user?.username).toBe("test_user");
    });

    test('verify correct account', async () => {
        const user = await UserHandler.getUserByUserID("test_user");
        expect(user).toBeDefined();
        const result = await UserHandler.verifyUser("test_user", "123456");
        expect(result).toBeTruthy();
    });

    test('verify incorrect account', async () => {
        const user = await UserHandler.getUserByUserID("test_user");
        expect(user).toBeDefined();
        const result = await UserHandler.verifyUser("test_user", "uksdhfkshd");
        expect(result).toBeFalsy();
    });

    test('update all fields', async () => {
        const id = await UserHandler.insert("test_user_update", "test_user_update", "123456", 0);

        await UserHandler.updateUserID("test_user_update", "test_user_update1");
        await UserHandler.updateUserPassword("test_user_update1", "1234567");
        await UserHandler.updateUserPermission("test_user_update1", 1);
        await UserHandler.updateUsername("test_user_update1", "XD");
        const newUser = await UserHandler.getUserByUserID("test_user_update1");
        const oldUser = await UserHandler.getUserByUserID("test_user_update");
        expect(newUser).toBeDefined();
        expect(oldUser).toBeNull();
        expect(newUser?.id).toBe(id);
        expect(newUser?.password).toBe("1234567");
        expect(newUser?.permission).toBe(1);
        expect(newUser?.username).toBe("XD");

    });

    test('Remove account', async () => {
        const user = await UserHandler.getUserByUserID("test_user");
        expect(user).toBeDefined();
        const result = await UserHandler.removeUserByUserID("test_user");
        expect(result).toBeTruthy();
    });
});

describe('Song table test', () => {
    let db: Database;
    let restoreConsole: () => void;
    beforeEach(async () => {
        restoreConsole = muteConsole(['log']);
        db = await initDB();
        restoreConsole();
    });

    afterEach(async () => {
        restoreConsole = muteConsole(['log']);
        await disconnectDB();
        await clearDatabase();
        restoreConsole();
    });

    test('should insert a song and return lastID', async () => {
        const { user_id, filename, filepath, size, type } = exampleFileRecord;
        db = await initDB();
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id = await SongHandler.insert({
            file_id,
            title: 'test music',
            duration: 10,
            user_id,
            filename,
            filepath,
            size,
            type
        });
        expect(song_id).toBeDefined();
    });

    test('should get inserted songRecord by song_id', async () => {
        const { user_id, filename, filepath, size, type } = exampleFileRecord;
        db = await initDB();
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id = await SongHandler.insert({
            file_id,
            title: 'test music',
            duration: 10,
            user_id,
            filename: filename,
            filepath,
            size,
            type
        });
        expect(song_id).toBeDefined();
        const song = await SongHandler.getSongByID(song_id);
        expect(song).toBeDefined();
        expect(song?.file_id).toBe(file_id);
        expect(song?.filename).toBe(filename);
        expect(song?.filepath).toBe(filepath);
        expect(song?.duration).toBe(10);
        expect(song?.size).toBe(size);
        expect(song?.type).toBe(type);
    });

    test('should get inserted songRecord by file_id', async () => {
        const { user_id, filename, filepath, size, type } = exampleFileRecord;
        db = await initDB();
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id = await SongHandler.insert({
            file_id,
            title: 'test music',
            duration: 10,
            user_id,
            filename: filename,
            filepath,
            size,
            type
        });
        expect(song_id).toBeDefined();
        const song = await SongHandler.getSongByFileID(file_id);
        expect(song).toBeDefined();
        expect(song?.file_id).toBe(file_id);
        expect(song?.filename).toBe(filename);
        expect(song?.filepath).toBe(filepath);
        expect(song?.duration).toBe(10);
        expect(song?.size).toBe(size);
        expect(song?.type).toBe(type);
    });

    test('should remove inserted songRecord by song_id', async () => {
        const { user_id, filename, filepath, size, type } = exampleFileRecord;
        db = await initDB();
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id = await SongHandler.insert({
            file_id,
            title: 'test music',
            duration: 10,
            user_id,
            filename: filename,
            filepath,
            size,
            type
        });
        const result = await SongHandler.removeSongByID(song_id);
        expect(result).toBeTruthy();
        const song = await SongHandler.getSongByID(song_id);
        expect(song).toBeNull();
    });

    test('should return null when getting non-existent song', async () => {
        const song = await SongHandler.getSongByID(999);
        expect(song).toBeNull();
    });

    test('should handle duplicate file_id insertions', async () => {
        const { user_id, filename, filepath, size, type } = exampleFileRecord;
        db = await initDB();
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id_1 = await SongHandler.insert({
            file_id,
            title: 'test music',
            duration: 10,
            user_id,
            filename: filename,
            filepath,
            size,
            type
        });

        try {
            const song_id_2 = await SongHandler.insert({
                file_id,
                title: 'test music',
                duration: 10,
                user_id,
                filename: filename,
                filepath,
                size,
                type
            });
            expect(false).toBeTruthy();
        } catch (err: any) {
            expect(err.message.includes('SQLITE_CONSTRAINT: UNIQUE')).toBeTruthy();
        }
        // Here
    });

    test('should insert with optional artist and cover', async () => {
        const { user_id, filename, filepath, size, type } = exampleFileRecord;
        db = await initDB();
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id = await SongHandler.insert({
            file_id,
            title: 'test music',
            cover: 'test_cover_path',
            artist: 'amazing_daniel',
            duration: 10,
            user_id,
            filename: filename,
            filepath,
            size,
            type
        });
        const song = await SongHandler.getSongByID(song_id);
        expect(song_id).toBeDefined();
        expect(song?.cover).toBe('test_cover_path');
        expect(song?.artist).toBe('amazing_daniel');
    });
});

describe('Playlist and entries test', () => {
    let db: Database;
    let restoreConsole: () => void;
    beforeEach(async () => {
        restoreConsole = muteConsole(['log']);
        db = await initDB();
        restoreConsole();
    });

    afterEach(async () => {
        restoreConsole = muteConsole(['log']);
        await disconnectDB();
        await clearDatabase();
        restoreConsole();
    });
    test('should insert playlist and return lastID', async () => {
        const playlist_id = await PlayListHandler.createPlaylist(examplePlaylistRecord);
        expect(playlist_id).toBeDefined();
    });

    test('should get a single inserted playlist by user_id', async () => {
        const user_id = examplePlaylistRecord.user_id
        const playlist_id = await PlayListHandler.createPlaylist(examplePlaylistRecord);
        expect(playlist_id).toBeDefined();
        const playlists = await PlayListHandler.getPlaylistsByUserID(user_id);
        expect(playlists).toBeDefined();
        expect(playlists[0].user_id).toBe(user_id);
        expect(playlists[0].created_at).toBeDefined();
        expect(playlists[0].description).toBe(examplePlaylistRecord.description);
        expect(playlists[0].name).toBe(examplePlaylistRecord.name);
        expect(playlists[0].cover).toBe(examplePlaylistRecord.cover);
    });

    test('should remove inserted playlist record by playlist_id', async () => {
        const user_id = examplePlaylistRecord.user_id
        const playlist_id = await PlayListHandler.createPlaylist(examplePlaylistRecord);
        expect(playlist_id).toBeDefined();
        const result = await PlayListHandler.removePlaylistByID(playlist_id);
        expect(result).toBeTruthy();
        const playlists = await PlayListHandler.getPlaylistsByUserID(user_id);
        expect(playlists.length).toBe(0);
    });

    test('should get all playlists by user_id', async () => {
        const user_id = examplePlaylistRecord.user_id;
        const playlist_id = await PlayListHandler.createPlaylist(examplePlaylistRecord);
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id = await SongHandler.insert(constructExampleSong(file_id));
        const result = await PlayListHandler.addSongToPlaylist(playlist_id, song_id);
        expect(result).toBeTruthy();
        const songs = await PlayListHandler.getPlaylistsByUserID(user_id);
        expect(songs.length).toBe(1);
        expect(songs[0].id).toBe(song_id);
    });

    test('should handle non-exist user_id', async () => {
        const playlists = await PlayListHandler.getPlaylistsByUserID('Non_Exist_User');
        expect(playlists.length).toBe(0);
    });

    test('should insert a song into specific playlist', async () => {
        const playlist_id = await PlayListHandler.createPlaylist(examplePlaylistRecord);
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id = await SongHandler.insert(constructExampleSong(file_id));
        expect(song_id && file_id && playlist_id).toBeDefined();
        const result = await PlayListHandler.addSongToPlaylist(playlist_id, song_id);
        expect(result).toBeTruthy();
    });

    test('should get a single inserted song by playlist_id', async() => {
        const playlist_id = await PlayListHandler.createPlaylist(examplePlaylistRecord);
        const file_id = await FileHandler.insert(exampleFileRecord);
        const song_id = await SongHandler.insert(constructExampleSong(file_id));
        await PlayListHandler.addSongToPlaylist(playlist_id, song_id);
        const result = await PlayListHandler.isSongInPlaylist(playlist_id, song_id);
        expect(result).toBeTruthy();
        const songs = await PlayListHandler.getSongsByPlaylistID(playlist_id);
        expect(songs.length).toBe(1);
        expect(songs[0].file_id).toBe(file_id);
        expect(songs[0].cover).toBeNull();
    });
});


describe(`Protected files test`, () => {

});

function constructExampleSong(file_id: number): SongRecord {
    return {
    file_id,
    title: "test_song_title",
    duration: 100,
    ...exampleFileRecord
}
}


afterAll(async () => {
    const restoreConsole = muteConsole(['log', 'error']);
    await disconnectDB();
    await clearDatabase();
    restoreConsole();
});