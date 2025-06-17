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

const route = useRoute()
const showNav = computed(() => !route.path.endsWith('/login'))
</script>

<style scoped>
@import './assets/app.css';
</style>