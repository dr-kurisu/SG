import { createRouter, createMemoryHistory } from "vue-router";

import HomeView from '../views/HomeView.vue';
import CloudDiskView from '../views/DiskView.vue';

const routes = [
    { path: '/',name: "Home", component: HomeView},
    { path: '/clouddisk', name: 'CloudDisk', component: CloudDiskView },
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes,
})