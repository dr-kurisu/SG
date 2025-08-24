<template>
    <div class="operation-bar">
        <!-- 左侧按钮组 -->
        <div class="left-buttons">
            <button @click="$emit('back')" class="btn-back">
                <i class="fas fa-arrow-left mr-1"></i>
                <span>返回</span>
            </button>
            <button @click="$emit('refresh')" class="btn-refresh">
                <i class="fas fa-redo mr-1"></i>
            </button>

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
            <!-- 添加音乐按钮 -->
            <div class="add-song-buttons">
                <button v-if="selectFileItemsRef.length >= 0" @click="$emit('addSongs')" class="btn-add-song">
                    Add songs
                </button>
            </div>

            <!-- 右侧删除按钮 -->
            <div class="delete-buttons">
                <button v-if="selectFileItemsRef.length >= 0" @click="$emit('removeFiles')" class="btn-delete">
                    <i class="fas fa-trash-alt mr-1"></i> 删除
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FileItem } from '@/types/types';
import { computed } from 'vue';

const props = defineProps<{
    pathParts: string[];
    selectFileItems: FileItem[];
}>();
const emit = defineEmits(['removeFiles', 'goRoot', "goTo", 'back', 'refresh', 'addSongs']);

const pathPartsRef = computed(() => props.pathParts);
const selectFileItemsRef = computed(() => props.selectFileItems);
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

.btn-back,
.btn-refresh {
    font-size: 0.875rem;
    color: #2563eb;
    transition: transform 0.1s;
}

.btn-back:hover {
    transform: scale(0.95);
}

.btn-back:active {
    transform: scale(0.75);
}

.btn-refresh:hover {
    transform: scale(0.90) rotate(25deg);
}

.btn-refresh:active {
    transform: scale(0.85) rotate(90deg);
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

.add-song-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-left: auto;
}

.btn-add-song {
    background-color: #2563eb;
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s, background-color 0.3s;
}

.btn-add-song:hover {
    background-color: #1d4ed8;
}

.btn-add-song:active {
    background-color: #1e40af;
    transform: scale(0.85);
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
