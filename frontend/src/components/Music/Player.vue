<template>
    <audio ref="audioRef" :src="player.currentSong?.url" @timeupdate="onTimeUpdate"></audio>
    <div class="player">
        <PlayerControls
        :isPlaying="player.isPlaying"
        @togglePlay="togglePlay"
        @prev="playPrev"
        @next="playNext"
    />
        <div>
            Now Playing: {{ player.currentSong ? player.currentSong.title : ""  }}
            Current Time: {{ formatTime(player.progress) }}
        </div>
    </div>
</template>


<script setup lang="ts">
    import { usePlayerStore } from '@/stores/music';
    import { ref, watch } from 'vue';
    import PlayerControls from './PlayerControls.vue';
    const player = usePlayerStore()
    const audioRef = ref<HTMLAudioElement | null>(null)

    function togglePlay() {
        if (!audioRef.value) return;
        if (player.isPlaying) {
            player.pause();
            audioRef.value.pause();
        }else {
            player.play();
            audioRef.value.play();
        }
    }

    function onTimeUpdate() {
        if (!audioRef.value) return
        player.progress = audioRef.value.currentTime
    }

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    watch(() => player.currentSong, (newSong) => {
        if (!audioRef.value) return
        audioRef.value.src = newSong?.url || '';
        audioRef.value.addEventListener('loadedmetadata', () => {
            audioRef.value?.play();
        });
        player.play();
    })

    function playPrev() {
        player.prev();
    }
    function playNext() {
        player.next();
    }

</script>