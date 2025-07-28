<template>
    <audio ref="audioRef" :src="player.currentSong?.url" @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata"></audio>
    <div class="player">
        <!-- 歌曲信息 -->
        <div class="song-info">
            <div class="song-details">
                <h3 class="song-title">{{ player.currentSong?.title || 'No song selected' }}</h3>
                <p class="song-artist">{{ player.currentSong?.artist || 'Unknown artist' }}</p>
            </div>
        </div>
        
        <!-- 进度条 -->
        <ProgressBar />
        
        <!-- 播放控制 -->
        <PlayerControls
            :isPlaying="player.isPlaying"
            @togglePlay="togglePlay"
            @prev="playPrev"
            @next="playNext"
            class="player-controls"
        />
    </div>
</template>


<script setup lang="ts">
    import { usePlayerStore } from '@/stores/music';
    import { ref, watch } from 'vue';
    import PlayerControls from './PlayerControls.vue';
    import ProgressBar from './ProgressBar.vue';
    const player = usePlayerStore();
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
    
    function onLoadedMetadata() {
        if (!audioRef.value) return
        // 更新歌曲总时长
        const duration = audioRef.value.duration
        if (player.currentSong && duration) {
            if (player.currentSong.duration === 0 || !player.currentSong.duration) {
                player.setDuration(duration)
            }
        }
    }

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    watch(() => player.currentSong, (newSong) => {
        if (!audioRef.value) return
        audioRef.value.src = newSong?.url || '';
        // wait until loading metadata completed
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

<style scoped>
.player {
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  max-width: 28rem;
  margin-left: auto;
  margin-right: auto;
}

.song-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.song-details {
  flex-grow: 1;
}

.song-title {
  font-size: 1.125rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.875rem;
  color: #4b5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls {
  margin-top: 1rem;
}
</style>