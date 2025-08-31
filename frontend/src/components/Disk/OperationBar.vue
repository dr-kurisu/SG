<template>
    <div class="operation-bar">
        <!-- 左侧按钮组 -->
        <div class="left-buttons">
            <button @click="$emit('back')" class="btn-back">
                <i class="fas fa-arrow-left mr-1"></i>
                <span>返回</span>
            </button>

            <!-- 刷新按钮 -->
            <button @click="$emit('refresh')" class="btn-refresh">
                <i class="fas fa-redo mr-1"></i>
            </button>

            <!-- 当前路径 -->
            <div class="path-display">
                <span class="root-path" @click="$emit('goRoot')">LabMem001:</span>
                <template v-for="(part, index) in pathPartsRef" :key="index">
                    <span class="separator">/</span>
                    <span class="path-part" @click="$emit('goTo', index)">
                        {{ part }}
                    </span>
                </template>
            </div>
        </div>

        <div class="operation-buttons">
            <!-- 添加音乐开关 -->
            <div class="add-song-switch" @click="toggleAddSongs">
                <div class="switch" :class="{ on: isAdding }">
                    <div class="knob"></div>
                </div>
                <span class="label">{{ isAdding ? 'Adding Songs' : 'Add Songs' }}</span>
            </div>

            <!-- 右侧删除按钮 -->
            <div class="delete-buttons">
                <button @click="$emit('removeFiles')" class="btn-delete">
                    <i class="fas fa-trash-alt mr-1"></i> Delete
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { files, disbaleFileItems, isAdding, handleAddSongs, getUserSongs } from '@/storage/cloudstorage';
import type { FileItem } from '@/types/types';
import { computed } from 'vue';


const props = defineProps<{
    pathParts: string[];
    selectFileItems: FileItem[];
    files: FileItem[];
}>();

const emit = defineEmits(['removeFiles', 'goRoot', "goTo", 'back', 'refresh', 'toggleAddSongs', 'update:selectFileItems']);

const pathPartsRef = computed(() => props.pathParts);

async function toggleAddSongs() {
    // First toggle
    if (!isAdding.value) {
        // Get all disabled files
        const songsPromise = getUserSongs();
        // 1. Not audio media
        files.value.forEach((file) => {
            if (!file.type.startsWith('audio/')) {
                disbaleFileItems.value.add(file.id);
                // if file in selectedFileItems remove it
                const index = props.selectFileItems.findIndex(f => f.id === file.id);
                if (index !== -1) {
                    props.selectFileItems.splice(index, 1);
                }
            }
        })
        // 2. Already in songs
        const songs = await songsPromise;
        files.value.forEach((file) => {
            const alreadyExists = songs.some(song => song.file_id === file.id);
            if (alreadyExists) {
                disbaleFileItems.value.add(file.id);
                const index = props.selectFileItems.findIndex(f => f.id === file.id);
                if (index !== -1) {
                    props.selectFileItems.splice(index, 1);
                }
            }
        });


        isAdding.value = true
    } else {
        // Second click
        const songsToAdd = props.selectFileItems;
        console.log('Adding songs:', songsToAdd);

        // Call addSongs
        await addSongs(props.selectFileItems.filter((file) => !disbaleFileItems.value.has(file.id)));

        // restroe state
        disbaleFileItems.value = new Set();
        isAdding.value = false
        emit('update:selectFileItems', []);
    }
}

const addSongs = async (addFileItems: FileItem[]) => {
    if (addFileItems.length === 0) {
        return;
    }

    await handleAddSongs(addFileItems);
}
</script>

<style scoped>
.operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    height: 2.5rem;
    padding: 0.5rem 0;
    user-select: none;
}

.left-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-back, .btn-refresh {
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

.btn-back:hover {
    transform: scale(0.95);
}

.btn-back:active {
    transform: scale(0.75);
}


.path-display {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: #4b5563;
    gap: 0.25rem;
}

.root-path,
.path-part {
    cursor: pointer;
    color: #2563eb;
}

.root-path:hover,
.path-part:hover {
    text-decoration: underline;
}

.separator {
    margin: 0 0.25rem;
    color: #9ca3af;
}

.delete-buttons .btn-delete {
    background-color: #dc2626;
    color: white;
    padding: 0.375rem 0.625rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    transition: background-color 0.3s;
}

.right-buttons .btn-delete:hover {
    background-color: #b91c1c;
}

.add-song-switch {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

.switch {
    width: 50px;
    height: 28px;
    background: #d1d5db;
    border-radius: 999px;
    position: relative;
    transition: background 0.3s;
}

.switch.on {
    background: #10b981;
}

.knob {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: left 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch.on .knob {
    left: 24px;
}

.label {
  font-size: 14px;
  width: 100px;
  font-weight: 500;
  color: #374151;
  transition: color 0.3s;
}

.switch.on + .label {
  color: #10b981;
}

.operation-buttons {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
</style>
