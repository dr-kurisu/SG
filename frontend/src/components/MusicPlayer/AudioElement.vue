<template>
  <audio
    ref="audioRef"
    :src="src"
    @ended="onEnded"
    @loadedmetadata="onLoadedMetadata"
  ></audio>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

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
  const audio = audioRef.value;
  if (!audio) {
    console.log("音频元素未找到");
    return;
  }

  console.log("尝试跳转到:", time);
  console.log("当前 readyState:", audio.readyState);

  const doSeek = () => {
    if (audio.readyState >= 2) {
      audio.currentTime = time;
      emit("update:currentTime", String(time));
      // 在短暂延迟后检查跳转是否成功
      setTimeout(() => {
        console.log("设置后的 currentTime:", audio.currentTime);
      }, 1000);
    } else {
      console.log("音频尚未准备好跳转，当前 readyState:", audio.readyState);
    }
  };

  if (audio.readyState >= 2) {
    doSeek();
  } else {
    // 等待 "canplay" 事件，确保音频可播放
    audio.addEventListener("canplay", doSeek, { once: true });
    console.log("等待 'canplay' 事件以执行跳转");
  }

  // 添加错误处理，检查音频加载问题
  audio.addEventListener("error", (e) => {
    console.error("音频错误:", e);
  });
};

const onTimeUpdate = () => {
  if (audioRef.value) {
    console.log("update: ", audioRef.value?.currentTime);
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