<!-- Control Bar -->
<template>
    <div class="w-full flex bg-gray-700 text-white p-4 items-center justify-between">
        <!-- 时间和进度条 -->
        <div class="flex items-center space-x-4 justify-center flex-1">
          <span class="text-sm">{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            min="0"
            :max="duration"
            step="0.1"
            v-model="currentTime"
            @input="onSeek"
            class="flex-1"
          />
          <span class="text-sm w-12">{{ formatTime(duration) }}</span>
        </div>
    </div>


    <!-- 控制按钮 -->
    <div class="flex items-center gap-6 mt-2 justify-center">
      <button @click="togglePlayMode" class="hover:text-blue-400" :title="playModeTitle">
        <component :is="playModeIcon" class="w-5 h-5" />
      </button>

      <button @click="prev" class="hover:text-blue-400" title="上一首">
        <SkipBackIcon class="w-6 h-6" />
      </button>

      <button @click="togglePlay" class="hover:text-blue-400" title="播放 / 暂停">
        <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-8 h-8" />
      </button>

      <button @click="next" class="hover:text-blue-400" title="下一首">
        <SkipForwardIcon class="w-6 h-6" />
      </button>

      <button @click="toggleLyrics" class="hover:text-blue-400" title="歌词">
        <List class="w-6 h-6" />
      </button>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, RepeatIcon, ShuffleIcon, Repeat1Icon, List } from 'lucide-vue-next'
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(240); // 假设一首歌4分钟

const playMode = ref<'order' | 'repeat' | 'shuffle'>('order');
const lyricsSwitch = ref(false);

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  // 调用 audio.play() / audio.pause() 逻辑
}

const toggleLyrics = () => {
  lyricsSwitch.value = !lyricsSwitch.value
}

const onSeek = () => {
  // audio.currentTime = currentTime.value
}

const prev = () => {
  // 切换到上一首
}
const next = () => {
  // 切换到下一首
}

const togglePlayMode = () => {
  const modes: Array<'order' | 'repeat' | 'shuffle'> = ['order', 'repeat', 'shuffle'];
  const index = modes.indexOf(playMode.value);
  playMode.value = modes[(index + 1) % modes.length];
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const playModeIcon = computed(() => {
  switch (playMode.value) {
    case 'repeat': return RepeatIcon;
    case 'shuffle': return ShuffleIcon;
    case 'order': return Repeat1Icon;
  }
})

const playModeTitle = computed(() => {
  switch (playMode.value) {
    case 'repeat': return '循环播放'
    case 'shuffle': return '随机播放'
    case 'order': return '单曲循环'
  }
})
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  height: 14px;
  width: 14px;
  background-color: #f40;
  border-radius: 50%;
  cursor: pointer;
}
</style>
