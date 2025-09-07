<template>
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal">
            <h3>{{ mode === 'create' ? 'Create New Playlist' : 'Edit Playlist' }}</h3>
            <input class="modal-input" v-model="form.name" placeholder="Please input playlist name" />
            <input class="modal-input" v-model="form.description" placeholder="Please input playlist description" />

            <div class="modal-actions">
                <button @click="confirm">{{ mode === 'create' ? 'Create' : 'Save' }}</button>
                <button @click="$emit('close')">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Playlist } from '@/types/types';
import { reactive, watch } from 'vue'

const props = defineProps<{
    visible: boolean
    mode: 'create' | 'edit'
    playlist?: Playlist
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'confirm', payload: Playlist): void
}>()

const form = reactive<Playlist>({
    id: undefined,
    name: '',
    description: ''
})

// 当 props.playlist 改变时，更新本地表单
watch(
    () => props.playlist,
    (newVal) => {
        if (props.mode === 'edit' && newVal) {
            form.id = newVal.id;
            form.name = newVal.name
            form.description = newVal.description
        } else {
            form.id = undefined;
            form.name = ''
            form.description = ''
        }
    },
    { immediate: true }
)

function confirm() {
    emit('confirm', { id: form.id, name: form.name, description: form.description, cover: form.cover })
}
</script>

<style scoped>
.modal-input {
    display: block;
    width: 100%;
    margin-bottom: 12px;
    /* 增加间距 */
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    box-sizing: border-box;
}


.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    width: 400px;
}

.modal-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}
</style>
