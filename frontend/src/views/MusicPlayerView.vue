<template>
    <CoverElement :isPlaying="isPlaying" />
    <PlayerControls v-model:isPlaying="isPlaying" />
</template>

<script lang="ts" setup>
import CoverElement from '@/components/MusicPlayer/CoverElement.vue';
import PlayerControls from '@/components/MusicPlayer/PlayerControls.vue';
import { ref } from "vue";

const isPlaying = ref(false);

</script>