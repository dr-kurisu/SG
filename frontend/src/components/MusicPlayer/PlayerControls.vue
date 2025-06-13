<!-- Control Bar -->
<template>
  <div class="w-full flex bg-gray-700 text-white p-4 items-center justify-between">
    <!-- AudioElement-->
    <AudioElement
      ref="audio"
      :src="currentMusic"
      v-model:currentTime="currentTime"
      @loaded="onLoaded"
      @ended="onEnded"
    />

    <!-- 时间和进度条 -->
    <div class="flex items-center space-x-4 justify-center flex-1">
      <span class="text-sm">{{ formatTime(Number(currentTime)) }}</span>
      <input
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        v-model="currentTime"
        @input="onSliderInput"
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
        <component :is="props.isPlaying ? PauseIcon : PlayIcon" class="w-8 h-8" />
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
import AudioElement from './AudioElement.vue';

const props = defineProps<{
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isPlaying', value: boolean): void
}>();

const audio = ref<InstanceType<typeof AudioElement> | null>(null);
const currentMusic = ref("/api/music/audio/2");
const currentTime = ref("0");
const duration = ref<number>(0);
const playMode = ref<'order' | 'repeat' | 'shuffle'>('order');
const lyricsSwitch = ref<boolean>(false);

const onSliderInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  console.log("In playerControl: ", value);
  currentTime.value = value;
  audio.value?.seek(Number(value)); // 主动调用 seek
}

const togglePlay = () => {
  if (!audio.value) return;
  if (props.isPlaying) {
    audio.value.pause();
  } else {
    audio.value.play();
  }
  emit("update:isPlaying", !props.isPlaying);
}

const toggleLyrics = () => {
  lyricsSwitch.value = !lyricsSwitch.value;
}

const onEnded = () => {
  console.log("ended !!!");
  emit("update:isPlaying", false);
  // 单曲循环重复
  if (playMode.value === 'repeat') {
    audio.value?.seek(0);
    audio.value?.play();
    emit("update:isPlaying", true);
  } else {
    next();
  }
}

const prev = () => {
  console.log('上一首');
}
const next = () => {
  console.log('下一首');
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

const onLoaded = (d: number) => {
  duration.value = d;
}

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
