import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";

import HomeView from '@/views/HomeView.vue';
import CloudDiskView from '@/views/DiskView.vue';
import Preview from '@/views/Preview.vue';
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import MusicPlayerView from "@/views/MusicPlayerView.vue"

export const routes = [
    { path: '/',name: "Home", component: HomeView},
    { path: '/clouddisk', name: 'CloudDisk', component: CloudDiskView },
    { path: '/preview', name: 'Preview', component: Preview},
    { path: '/login', name: "Login", component: LoginView},
    { path: '/register', name: "Register", component: RegisterView},
    { path: '/musicplayer', name: 'MusicPlayer', component: MusicPlayerView}
    // { path: '/diary', name: 'Diary', component: DiaryView},
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
});