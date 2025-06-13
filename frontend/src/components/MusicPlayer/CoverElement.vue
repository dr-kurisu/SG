<template>
  <div class="flex flex-col items-center">
    <div
      ref="discRef"
      class="w-[400px] h-[400px] rounded-full overflow-hidden border-4 border-gray-200 transition-transform duration-100"
    >
      <template v-if="coverPath">
          <!-- <img
              :src="coverPath"
              alt="cover"
              class="w-full h-full object-cover"
          /> -->
      </template>
      <template v-else>
          <div class="w-[400px] h-[400px]">
              <VinylDisc 
                :rotation="rotation"
              />
          </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import VinylDisc from '@/components/MusicPlayer/VinylDisc.vue'

const props = defineProps<{
  isPlaying: boolean;
}>();

const coverPath = ref('');
const frameId = ref<number | null>(null);
const discRef = ref<HTMLDivElement | null>(null);
const rotation = ref(0);

const animate = () => {
  rotation.value = rotation.value + 0.3;
  frameId.value = requestAnimationFrame(animate);
};

watch(
  () => props.isPlaying,
  (playing) => {
    if (playing) {
      frameId.value = requestAnimationFrame(animate);
    } else {
      if (frameId.value) {
        cancelAnimationFrame(frameId.value);
        frameId.value = null;
      }
    }
  }
);

onBeforeUnmount(() => {
  if (frameId.value) cancelAnimationFrame(frameId.value);
});

</script>

<style scoped>

</style>

