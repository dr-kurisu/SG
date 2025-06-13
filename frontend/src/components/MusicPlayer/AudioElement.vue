<template>
  <audio
    ref="audioRef"
    :src="src"
    @ended="onEnded"
    @loadedmetadata="onLoadedMetadata"
    @timeupdate="onTimeUpdate"
  ></audio>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{
  src: string;
  currentTime: string;
  isDragging: boolean;
}>();

const isSeeking = ref(false);

const emit = defineEmits<{
  (e: 'update:currentTime', value: string): void
  (e: 'loaded', duration: number): void
  (e: 'ended'): void
}>();

const audioRef = ref<HTMLAudioElement | null>(null);

// Play function used to control audio
const play = async () => {
  if (audioRef.value) {
    await audioRef.value.play();
  }
};

// Pause function used to control audio
const pause = async () => {
  if (audioRef.value) {
    await audioRef.value.pause();
  }
}

// Seek function used to control 
const seek = async (time: number) => {
  isSeeking.value = true;
  if (audioRef.value) {
    audioRef.value.currentTime = time;
    emit('update:currentTime', time.toString());
  }
  isSeeking.value = false;
};

// onTimeUpdate used to reverse update currentTime in a parent component
const onTimeUpdate = () => {
  if (audioRef.value && !isSeeking.value && !props.isDragging) {
    emit('update:currentTime', audioRef.value.currentTime.toString());
  }
};

const onLoadedMetadata = () => {
  if (audioRef.value) {
    emit('loaded', audioRef.value.duration);
  }
};

defineExpose({
  play,
  pause,
  seek,
});

</script>