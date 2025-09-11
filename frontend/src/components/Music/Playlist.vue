<template>
    <div class="playlist-container">
        <div class="playlist-header">
            <h2 class="playlist-title">播放列表</h2>
            <button class="btn-refresh" @click="updateInfo">
                <i class="fas fa-redo mr-1"></i>
            </button>
            <button class="add-playlist-btn" @click="showModalCreatePL = true">+</button>
        </div>

        <PlaylistModal :visible="showModalCreatePL" mode="create" @confirm="createPlaylist"
            @close="showModalCreatePL = false" />

        <PlaylistModal v-if="playlistToBeEdited" :visible="showModalEditPL" mode="edit" :playlist="playlistToBeEdited"
            @confirm="editPlaylist" @close="showModalEditPL = false" />


        <!-- 模态框 插入歌曲 -->
        <AddSongModal v-if="showAddSongModal" :playlist="selectedPlaylist" :songs="songs"
            @close="showAddSongModal = false" @songs-added="addSongsToPlaylist" @fetch-songs="updateUserSongs" />

        <!-- Playlist info -->
        <div class="playlist-list">
            <div v-for="playlist in playlists" :key="playlist.id" class="playlist-item"
                @click="selectPlaylist(playlist)"
                :class="{ 'active': selectedPlaylist && selectedPlaylist.id === playlist.id }">
                <div class="playlist-cover">
                    <img :src="playlist.cover" :alt="playlist.name" />
                </div>
                <div class="playlist-info">
                    <div class="playlist-name">{{ playlist.name }}</div>
                    <div class="playlist-desc">{{ playlist.description }}</div>
                    <div class="playlist-count">{{ playlist.songs?.length }}首歌曲</div>
                </div>

                <el-dropdown trigger="click">
                    <span class="el-dropdown-link" @click.stop>⋮</span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="deletePlaylist(playlist.id!)">Delete</el-dropdown-item>
                            <el-dropdown-item
                                @click="() => { showModalEditPL = true, playlistToBeEdited = playlist }">Edit</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>

        <!-- playlist songs -->
        <div v-if="selectedPlaylist" class="selected-playlist">
            <div class="playlist-header">
                <h2 class="playlist-title">{{ selectedPlaylist.name }}</h2>
                <button class="add-playlist-btn" @click="showAddSongModal = true">+</button>
            </div>

            <div class="song-list">
                <div v-for="(song, index) in selectedPlaylist.songs" :key="song.id" class="song-item"
                    @click="playSong(song, index)" :class="{ 'playing': currentSong && currentSong.id === song.id }">
                    <div class="song-index">{{ index + 1 }}</div>
                    <div class="song-info">
                        <div class="song-title">{{ song.title }}</div>
                        <div class="song-artist">{{ song.artist }}</div>
                    </div>
                    <div class="song-duration">{{ formatDuration(song.duration) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import type { Playlist, Song } from '@/types/types'
import { usePlayerStore } from '@/stores/music'
import { instance as axiosInstance } from '@/api/axios';
import Swal from 'sweetalert2';
import AddSongModal from './AddSongModal.vue';
import PlaylistModal from './PlaylistModal.vue';
import { ElNotification } from 'element-plus';

const emit = defineEmits(['play-song']);

const playlists = ref<Playlist[]>([]);
const selectedPlaylist = ref<Playlist | null>(null);
const playlistToBeEdited = ref<Playlist | null>(null);
const currentSong = ref<Song | null>(null);
const player = usePlayerStore();
const songs = ref<Song[]>([]);

const showModalCreatePL = ref(false);
const showAddSongModal = ref(false);
const showModalEditPL = ref(false);

async function deletePlaylist(playlist_id: number) {
    if (!playlist_id) {
        ElNotification({
            title: 'Warning',
            message: 'Playlist_id is invalid',
            type: 'warning',
            position: 'top-right',
            duration: 2000
        });
        return;
    }

    try {
        const result = await axiosInstance.delete(`/api/playlist/${playlist_id}`);

        if (result.status !== 204) {
            ElNotification({
                title: 'Error',
                message: 'Please try again latter',
                type: 'error',
                position: 'top-right',
                duration: 2000
            });
        } else {
            ElNotification({
                title: 'Success',
                message: 'Playlist have been removed',
                type: 'success',
                position: 'top-right',
                duration: 1500
            });
            updateInfo();
        }
    } catch (err) {
        ElNotification({
            title: 'Error',
            message: 'Internet error or internal error',
            type: 'error',
            position: 'top-right',
            duration: 2500
        });
    }
}

async function editPlaylist(payload: Playlist) {
    try {
        showModalEditPL.value = false;

        const playlist: Playlist = { ...payload };
        const result = await axiosInstance.post(`/api/playlist/update`, { playlist });

        if (result.status === 204) {
            ElNotification({
                title: "Success",
                message: `Playlist "${playlist.name}" updated successfully`,
                type: "success",
                duration: 2000,
            });
            await updateInfo();
        } else {
            ElNotification({
                title: "Warning",
                message: "Playlist update did not complete",
                type: "warning",
                duration: 2000,
            });
        }
    } catch (err) {
        console.error(err);
        ElNotification({
            title: "Error",
            message: "Failed to update playlist, please try again",
            type: "error",
            duration: 2000,
        });
    }
}


// 选择播放列表
function selectPlaylist(playlist: Playlist) {
    updatePlaylists();
    selectedPlaylist.value = playlist;
    player.updatePlaylist(playlist.songs || []);
}

// 播放歌曲
function playSong(song: Song, index: number) {
    updateSongsInPlaylist();
    currentSong.value = song;
    emit('play-song', song, index);
}

// 刷新按钮
async function updateInfo() {
    try {
        await Promise.all([
            updatePlaylists(),
            updateUserSongs()
        ]);
        ElNotification({
            title: "Success",
            type: "success",
            message: "Successfully refreshed",
            position: "top-right",
            duration: 1500
        })
    } catch (err) {
        console.error("Failed to update info:", err);
    }
}

// 格式化时长
function formatDuration(seconds: number): string {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function updatePlaylists(): Promise<void> {
    const res = await axiosInstance.get('/api/playlist/');
    if (res.status !== 200) {
        Swal.fire({
            icon: 'warning',
            title: 'Fail to refresh playlists',
            text: '',
            showConfirmButton: true,
            timer: 600,
        });
        return;
    }
    playlists.value = res.data;
    const exists = playlists.value.some(p => p.id === selectedPlaylist.value?.id)
    if (!exists) {
        selectedPlaylist.value = null;
    };
    updateSongsInPlaylist();
}

async function updateSongsInPlaylist(): Promise<void> {
    const playlist_id = selectedPlaylist.value?.id;
    if (!playlist_id) return;

    try {
        const res = await axiosInstance.get(`/api/playlist/${playlist_id}/songs`);

        if (res.status === 200) {
            selectedPlaylist.value!.songs = res.data;
        } else {
            throw new Error(`Failed to fetch songs, status: ${res.status}`);
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Fail to update songs',
            text: `Please try again latter`,
            showConfirmButton: true,
            timer: 1500
        });
    }
}

async function createPlaylist(payload: Playlist): Promise<void> {
    const { name, description, cover } = payload;
    if (!name) {
        Swal.fire({
            icon: 'warning',
            title: 'Please input required field',
            text: '',
            showConfirmButton: true,
            timer: 1200,
        });
    }
    try {
        const res = await axiosInstance.post('/api/playlist/add', { name, description, cover });
        if (res.status !== 201) {
            throw new Error("Fail to add new playlist");
        }
        updatePlaylists();
        showModalCreatePL.value = false;
    } catch (err) {
        console.error(err);
        showModalCreatePL.value = false;
        Swal.fire({
            icon: 'warning',
            title: 'Fail to add new playlist',
            text: '',
            showConfirmButton: true,
            timer: 1200,
        });
    }
}

async function addSongsToPlaylist(songs_id: Set<number>) {
    if (songs_id.size <= 0) {
        showAddSongModal.value = false;
        return;
    }

    try {
        const res = await axiosInstance.put(`/api/playlist/${selectedPlaylist.value?.id}/add-songs`, {
            song_ids: Array.from(songs_id)
        });

        if (res.status === 201 || res.status === 200) {
            showAddSongModal.value = false;
            updateSongsInPlaylist();
            Swal.fire({
                icon: "success",
                title: `Successfully added ${songs_id.size} songs`,
                timer: 1200,
                showConfirmButton: false
            });
            updatePlaylists();
        } else {
            throw new Error("Fail to add songs");
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Fail to add songs due to interal error",
            timer: 1200,
            showConfirmButton: true
        });
    }
}

async function updateUserSongs(): Promise<void> {
    try {
        const res = await axiosInstance.get('/api/songs/get-songs');
        songs.value = res.data;
    } catch (err) {
        Swal.fire({
            toast: true,
            icon: "error",
            title: "Fail to update user songs",
            timer: 3000,
        });
    }
}
// watch player.currentSong
watch(() => player.currentSong, (newSong) => {
    currentSong.value = newSong;
})

onBeforeMount(() => {
    updatePlaylists();
    updateUserSongs();
})

</script>

<style scoped>
.el-dropdown-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 1.5rem;
    cursor: pointer;
    user-select: none;
}

.playlist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    user-select: none;
}

.playlist-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background-color: #f5f5f5;
    overflow-y: auto;
    user-select: none;
}

.playlist-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
}

.playlist-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.playlist-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.playlist-item:hover {
    background-color: #e0e0e0;
}

.playlist-item.active {
    background-color: #d0d0d0;
}

.playlist-cover {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    overflow: hidden;
    margin-right: 12px;
    flex-shrink: 0;
}

.playlist-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.playlist-info {
    flex: 1;
    overflow: hidden;
}

.playlist-name {
    font-weight: bold;
    font-size: 1rem;
    margin-bottom: 4px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-desc {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 4px;
    white-space: normal;
}

.playlist-count {
    font-size: 0.75rem;
    color: #888;
}

.selected-playlist {
    margin-top: 16px;
    border-top: 1px solid #ddd;
    padding-top: 16px;
}

.selected-playlist h3 {
    font-size: 1.2rem;
    margin-bottom: 12px;
    color: #333;
}

.song-list {
    display: flex;
    flex-direction: column;
}

.song-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.song-item:hover {
    background-color: #e0e0e0;
}

.song-item.playing {
    background-color: #d0d0d0;
}

.song-index {
    width: 24px;
    text-align: center;
    color: #888;
    font-size: 0.9rem;
}

.song-info {
    flex: 1;
    margin: 0 12px;
    overflow: hidden;
}

.song-title {
    font-weight: 500;
    font-size: 0.9rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-artist {
    font-size: 0.8rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-duration {
    font-size: 0.8rem;
    color: #888;
    width: 40px;
    text-align: right;
}

.add-playlist-btn {
    width: 36px;
    height: 36px;
    border-radius: 20%;
    background-color: #409eff;
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-playlist-btn:hover {
    background-color: #66b1ff;
    transform: scale(1.05);
}

.add-playlist-btn:active {
    transform: scale(0.95);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.modal input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.modal-actions button {
    padding: 6px 12px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
}

.modal-actions button:first-child {
    background: #409eff;
    color: white;
}

.modal-actions button:last-child {
    background: #ccc;
    color: #333;
}

.btn-back,
.btn-refresh {
    font-size: 0.875rem;
    color: #2563eb;
    transition: transform 0.1s;
}

.btn-refresh:hover {
    transform: scale(0.90) rotate(25deg);
}

.btn-refresh:active {
    transform: scale(0.85) rotate(90deg);
}
</style>