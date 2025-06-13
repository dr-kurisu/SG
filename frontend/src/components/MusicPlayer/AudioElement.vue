<template>
  <audio
    ref="audioRef"
    :src="src"
    @timeupdate="onTimeUpdate"
    @ended="onEnded"
    @loadedmetadata="onLoadedMetadata"
  ></audio>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  src: string;
  currentTime: string;
}>()

const emit = defineEmits<{
  (e: 'update:currentTime', value: string): void
  (e: 'loaded', duration: number): void
  (e: 'ended'): void
}>();

const audioRef = ref<HTMLAudioElement | null>(null);

const play = () => {
  audioRef.value?.play();
}

const seek = (time: number) => {
  if (audioRef.value && Math.abs(audioRef.value.currentTime - time) > 0.3) {
    audioRef.value.currentTime = time;
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    // console.log("update: ", audioRef.value?.currentTime);
    emit('update:currentTime', String(audioRef.value.currentTime));
  }
}

const onLoadedMetadata = () => {
  if (!audioRef.value) return
  emit('loaded', audioRef.value.duration);
}

const onEnded = () => {
  emit('ended');
}

const pause = () => {
  audioRef.value?.pause()
}

onMounted(() => {
  if (!audioRef.value) {
    console.warn('audioRef is not loaded yet.');
  }
});

defineExpose({
  play,
  pause,
  seek,
})

</script>