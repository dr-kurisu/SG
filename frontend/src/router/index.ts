import { createRouter, createMemoryHistory } from "vue-router";

import HomeView from '@/views/HomeView.vue';
import CloudDiskView from '@/views/DiskView.vue';
import MusicPlayerView from "@/views/MusicPlayerView.vue";

const routes = [
    { path: '/',name: "Home", component: HomeView},
    { path: '/clouddisk', name: 'CloudDisk', component: CloudDiskView },
    { path: '/musicplayer', name: 'MusicPlayer', component: MusicPlayerView}
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes,
})