<template>
  <div id="app">
    <!-- 全局导航栏 -->
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/clouddisk">Cloud Disk</router-link>
    </nav>
    <router-view /> <!-- 这里会根据路由显示页面 -->
  </div>
</template>

<style scoped>
@import './assets/app.css';
</style>