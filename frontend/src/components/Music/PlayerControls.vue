<template>
    <button @click="$emit('prev')"> Prev </button>
    <button @click="$emit('togglePlay')">
        {{ isPlaying ? 'Pause' : 'Play' }}
    </button>
    <button @click="$emit('next')"> Next </button>
</template>

<script setup lang="ts">
    const emit = defineEmits(['togglePlay', 'prev', 'next'])
    const props = defineProps({
        isPlaying: Boolean,
    })
</script>