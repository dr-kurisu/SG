<template>
  <svg viewBox="0 0 200 200" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <!-- 黑胶基础底色 -->
    <circle cx="100" cy="100" r="98" fill="#111" />

    <!-- 刻痕效果（交替色带模拟） -->
    <g>
      <circle
        v-for="r in 40"
        :key="r"
        :cx="100"
        :cy="100"
        :r="98 - r * 1.2"
        :fill="r % 2 === 0 ? '#1b1b1b' : '#151515'"
      />
    </g>

    <!-- 中心标贴 -->
    <circle cx="100" cy="100" r="18" fill="#ccc" />
    <circle cx="100" cy="100" r="6" fill="#333" />

    <!-- 高光 -->
    <defs>
      <radialGradient id="light" cx="28%" cy="32%" r="50%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#000" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="98" fill="url(#light)" />

    <!-- 唱针 -->
    <g transform="rotate(-45, 100, 100)">
      <!-- 唱臂 -->
      <rect x="100" y="20" width="6" height="60" fill="#666" rx="2" />
      <!-- 唱头 -->
      <rect x="97" y="18" width="12" height="6" fill="#333" rx="1" />
      <!-- 唱针头 -->
      <circle cx="103" cy="16" r="2" fill="red" />
    </g>
  </svg>
</template>
