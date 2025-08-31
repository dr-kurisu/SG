<template>
    <div class="controls-container">
        <!-- 上一首 -->
        <button @click="$emit('prev')" class="control-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="control-icon" viewBox="0 0 24 24">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" />
            </svg>
        </button>
        
        <!-- 播放/暂停 -->
        <button @click="$emit('togglePlay')" class="control-button">
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="control-icon" viewBox="0 0 24 24">
                <polygon points="8,5 19,12 8,19" fill="currentColor" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="control-icon" viewBox="0 0 24 24">
                <rect x="7" y="5" width="3" height="14" fill="currentColor" />
                <rect x="14" y="5" width="3" height="14" fill="currentColor" />
            </svg>
        </button>
        
        <!-- 下一首 -->
        <button @click="$emit('next')" class="control-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="control-icon" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" />
            </svg>
        </button>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['togglePlay', 'prev', 'next'])
const props = defineProps({
    isPlaying: Boolean,
})
</script>

<style scoped>
.controls-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
}

.control-button {
  color: #333;
  border: none;
  background: none;
  cursor: pointer;
  padding: 3px;
  margin: 0 10px;
}

.control-icon {
  height: 20px;
  width: 20px;
}
</style>