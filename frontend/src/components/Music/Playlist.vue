<template>
    <div class="playlist-container">
        <div class="playlist-header">
            <h2 class="playlist-title">播放列表</h2>
            <button class="add-playlist-btn" @click="showModalCreatePL = true">+</button>
        </div>

        <!-- 模态框 新建歌单 -->
        <div v-if="showModalCreatePL" class="modal-overlay" @click.self="showModalCreatePL = false">
            <div class="modal">
                <h3>新建播放列表</h3>
                <input v-model="newPlaylist.name" placeholder="请输入名称" />
                <input v-model="newPlaylist.description" placeholder="请输入描述" />

                <div class="modal-actions">
                    <button @click="createPlaylist">确定</button>
                    <button @click="showModalCreatePL = false">取消</button>
                </div>
            </div>
        </div>

        <!-- 模态框 插入歌曲 -->
        <AddSongModal v-if="showAddSongModal" :playlist="selectedPlaylist" :songs="mockSongs"
            @close="showAddSongModal = false" @songs-added="addSongsToPlaylist" />

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
                    <div class="playlist-count">{{ playlist.songs.length }}首歌曲</div>
                </div>
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
import { mockSongs } from '@/mock/mockData';

const emit = defineEmits(['play-song']);

const playlists = ref<Playlist[]>([]);
const selectedPlaylist = ref<Playlist | null>(null);
const currentSong = ref<Song | null>(null);
const player = usePlayerStore();

const showModalCreatePL = ref(false);
const showAddSongModal = ref(false);

const newPlaylist = ref({
    name: '',
    description: '',
});

// 选择播放列表
function selectPlaylist(playlist: Playlist) {
    selectedPlaylist.value = playlist;
    player.updatePlaylist(playlist.songs);
    if (!player.isEmpty) {
        player.setCurrentSong(playlist.songs[0]);
    }
}

// 播放歌曲
function playSong(song: Song, index: number) {
    currentSong.value = song
    emit('play-song', song, index)
}

// 格式化时长
function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function updatePlaylists(): Promise<void> {
    const res = await axiosInstance.get('/api/playlist/');
    if (res.status !== 200) {
        Swal.fire({
            icon: 'warning',
            title: '刷新Playlist失败',
            text: '',
            showConfirmButton: true,
            timer: 600,
        });
        return;
    }
    playlists.value = res.data;
    updateSongs();
}

async function updateSongs(): Promise<void> {
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
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: '更新歌曲失败',
            text: '请稍后重试',
            showConfirmButton: true,
            timer: 1500
        });
    }
}

async function createPlaylist(): Promise<void> {
    if (!newPlaylist.value.name) {
        Swal.fire({
            icon: 'warning',
            title: '请输入Playlist信息',
            text: '',
            showConfirmButton: true,
            timer: 1200,
        });
    }
    try {
        const res = await axiosInstance.post('/api/playlist/add', newPlaylist.value);
        if (res.status !== 201) {
            throw new Error("Fail to add new playlist");
        }
        updatePlaylists();
        showModalCreatePL.value = false;
        newPlaylist.value = { name: '', description: '' };
    } catch (err) {
        console.error(err);
        showModalCreatePL.value = false;
        Swal.fire({
            icon: 'warning',
            title: '新增Playlist失败',
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
            updateSongs();
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
// watch player.currentSong
watch(() => player.currentSong, (newSong) => {
    currentSong.value = newSong;
})

onBeforeMount(() => {
    updatePlaylists();
})

</script>

<style scoped>
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
</style>