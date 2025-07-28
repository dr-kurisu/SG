<template>
  <div class="progress-container">
    <!-- 进度条容器 -->
    <div 
      class="progress-bar-container"
      @click="seekTo"
      ref="progressBarRef"
    >
      <!-- 已播放部分 -->
      <div
        class="progress-bar-fill"
        :style="{ width: progressPercentage + '%' }"
      ></div>
      
      <!-- 拖动按钮 -->
      <div 
        class="progress-bar-handle"
        :style="{ left: progressPercentage + '%' }"
      ></div>
    </div>
    
    <!-- 时间显示 -->
    <div class="time-display">
      <div>{{ formatTime(currentTime) }}</div>
      <div>{{ formatTime(duration) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/music'
import { computed, ref } from 'vue'

const player = usePlayerStore()
const progressBarRef = ref<HTMLElement | null>(null)

// 计算当前播放时间（秒）
const currentTime = computed(() => player.progress)

// 获取当前歌曲总时长（秒）
const duration = computed(() => player.currentSong?.duration || 0)

// 计算进度百分比
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 格式化时间显示
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// 点击进度条跳转到指定位置
function seekTo(event: MouseEvent) {
  if (!progressBarRef.value) return
  
  const rect = progressBarRef.value.getBoundingClientRect()
  const clickPosition = event.clientX - rect.left
  const percentage = clickPosition / rect.width
  
  // 计算新的播放时间
  const newTime = percentage * duration.value
  
  // 更新播放进度
  player.setProgress(newTime)
  
  // 如果有音频元素引用，可以直接设置currentTime
  const audioElement = document.querySelector('audio')
  if (audioElement) {
    audioElement.currentTime = newTime
  }
}
</script>

<style scoped>
.progress-container {
  width: 100%;
  padding: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.progress-bar-container {
  position: relative;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  cursor: pointer;
}

.progress-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(to right, #8b5cf6, #ec4899);
  transition: all 0.3s ease-in-out;
}

.progress-bar-handle {
  position: absolute;
  top: 50%;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #d8b4fe;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.progress-bar-container:hover .progress-bar-handle {
  opacity: 1;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-top: 8px;
  color: #4b5563;
}

/* 鼠标悬停时显示进度条动画效果 */
.progress-bar-container:hover .progress-bar-fill {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.1);
  }
  100% {
    filter: brightness(1);
  }
}
</style>
