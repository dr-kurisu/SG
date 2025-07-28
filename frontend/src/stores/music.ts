import { defineStore } from 'pinia'
import { mockPlaylist } from '@/mock/mockData'
import type { Song, PlayerState } from "@/types/types"


export const usePlayerStore = defineStore('player', {
    state: (): PlayerState => ({
        currentSong: null,
        playlist: mockPlaylist || [],
        isPlaying: false,
        volume: 1.0,
        progress: 0,
        duration: mockPlaylist[0]?.duration || 0
    }),

    getters: {
        currentTitle: (state: PlayerState) => state.currentSong ? state.currentSong : "",
        currentPlaylist: (state: PlayerState) => state.playlist,
        isEmpty: (state: { playlist: any[] }) => state.playlist.length === 0,
    },

    actions: {
        play(song?: Song) {
            if (song) this.currentSong = song;
            this.isPlaying = true;
        },

        pause() {
            this.isPlaying = false;
        },

        prev() {
            if (this.currentSong) {
                const index = this.playlist.findIndex(t => t.id === this.currentSong?.id);
                if (index >= 1 && index < this.playlist.length) {
                    this.currentSong = this.playlist[index - 1];
                }
            }
        },

        next() {
            if (this.currentSong) {
                const index = this.playlist.findIndex(t => t.id === this.currentSong?.id);
                if (index >= 0 && index < this.playlist.length - 1) {
                    this.currentSong = this.playlist[index + 1];
                }
            }
        },

        setVolume(volume: number) {
            this.volume = volume;
        },

        setProgress(second: number) {
            this.progress = second
        },

        setDuration(duration: number) {
            this.duration = duration
        },
        
        setCurrentSong(song: Song) {
            this.currentSong = song;
            this.progress = 0;
            this.duration = song.duration || 0;
        },
        
        updatePlaylist(songs: Song[]) {
            this.playlist = songs;
        }
    }
})