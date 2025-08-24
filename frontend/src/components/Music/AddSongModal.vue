<!-- Add songs to a given playlist -->

<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal">
            <h3>添加到 {{ playlist?.name || "UNKNOWN" }}</h3>
            <!--display all songs user had-->
            <div class="song-list">
                <div v-for="song in songs" :key="song.id" class="song-item"
                    :class="{ selected: selectedSongs.has(song.id) }" @click="toggleSelect(song)">
                    <div class="song-info">
                        <h4 class="song-title"> {{ song.title }} </h4>
                        <h4 class="song-artist"> {{ song.artist }}</h4>
                    </div>
                </div>
            </div>


            <div class="modal-actions">
                <button @click="$emit('songs-added', selectedSongs)">确定</button>
                <button @click="$emit('close')">取消</button>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import type { Playlist, Song } from '@/types/types';
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2';

const props = defineProps<{
    playlist: Playlist | null;
    songs: Song[];
}>();

const emit = defineEmits(['close', 'songs-added', 'fetchSongs']);

const selectedSongs = ref<Set<number>>(new Set());

function toggleSelect(song: Song) {
    if (selectedSongs.value.has(song.id)) {
        selectedSongs.value.delete(song.id);
    } else if (selectedSongs.value.size < 50) {
        selectedSongs.value.add(song.id);
    } else {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: "Maximum 50 songs a time",
            showConfirmButton: false,
            timer: 2000,
        });
    }
}

onMounted(() => {
    emit("fetchSongs");
});

</script>

<style scoped>
.song-info {
    display: flex;
    align-items: center;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
}
.song-title {
  font-weight: 500;
  font-size: 0.95rem;
  color: #1b1b1b;
}

.song-artist {
  font-size: 0.65rem;
  color: #959595;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.modal {
    background: #fff;
    padding: 16px;
    border-radius: 6px;
    min-width: 600px;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}


.song-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    overflow-y: auto;
}

.song-item {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
}

.song-item.selected {
    background: #409eff;
    color: #fff;
}

.song-item:not(.selected):hover {
    background-color: #e8e8e8;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

/* 文本溢出 */
.song-title,
.song-artist {
  white-space: nowrap;       /* 不换行 */
  overflow: hidden;          /* 超出隐藏 */
  text-overflow: ellipsis;   /* 显示省略号 */
}
</style>
