<template>
  <div id="app">
    <!-- 全局导航栏 -->
    <nav v-if="showNav">
      <router-link to="/">Home</router-link>
      <router-link to="/clouddisk">Cloud Disk</router-link>
      <router-link to="/musicplayer">Music</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import axios from "axios";

const route = useRoute()
const showNav = computed(() => {
  return !(route.path.endsWith('/login') || route.path.endsWith('/register'));
});

const token = localStorage.getItem('token');
if (token || typeof token === 'string') {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

</script>

<style scoped>
@import './assets/app.css';
</style>