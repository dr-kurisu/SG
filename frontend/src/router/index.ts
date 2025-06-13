import { createRouter, createMemoryHistory } from "vue-router";

import HomeView from '@/views/HomeView.vue';
import CloudDiskView from '@/views/DiskView.vue';
import MusicPlayerView from "@/views/MusicPlayerView.vue";
import Preview from '@/views/Preview.vue';

const routes = [
    { path: '/',name: "Home", component: HomeView},
    { path: '/clouddisk', name: 'CloudDisk', component: CloudDiskView },
    { path: '/musicplayer', name: 'MusicPlayer', component: MusicPlayerView},
    { path: '/preview', name: 'Preview', component: Preview},
    // { path: '/diary', name: 'Diary', component: DiaryView},
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes,
});