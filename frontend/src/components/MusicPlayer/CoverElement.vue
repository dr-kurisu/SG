<template>
  <div class="flex flex-col items-center">
    <div
      class="w-400 h-400 rounded-full overflow-hidden border-4 border-gray-200"
      :class="{ 'animate-spin-slow': isPlaying }"
    >
        <template v-if="converPath">
            <img
                :src="coverPath"
                alt="cover"
                class="w-full h-full object-cover"
            />
        </template>
        <template v-else>
            <div class="w-[400px] h-[400px]">
                <VinylDisc />
            </div>
        </template>
    </div>
    
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VinylDisc from '@/components/MusicPlayer/VinylDisc.vue'

const isPlaying = ref(true)
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const coverPath = ref('');
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 15s linear infinite;
}
</style>

