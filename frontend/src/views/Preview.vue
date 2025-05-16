<template>
  <div class="text-gray-600 text-sm flex items-center space-x-1 select-none">
    <span class="cursor-pointer text-blue-600 hover:underline" @click="goRoot">LabMem001:</span>
    <template v-for="(part, index) in pathParts" :key="index">
      <span class="mx-1 text-gray-400">/</span>
      <span
        class="cursor-pointer text-blue-600 hover:underline"
        @click="goTo(index)"
      >
        {{ part }}
      </span>
      <span class="mx-1 text-gray-400">/</span>
      <span class="cursor-pointer text-black-600">{{ fileID }}</span>
    </template>
  </div>

  <div class="text-preview">
      <pre v-if="content">{{ content }}</pre>
      <p v-else>正在加载...</p>
  </div>
</template>

<script lang="ts" setup>
  import { useRouter, useRoute } from 'vue-router';
  import { onMounted, computed, ref } from 'vue';

  const content = ref('');
  const route = useRoute();
  const fileID = route.query.fileID;
  const currentPath = ref('/');
  const router = useRouter();

  if (route.query.path) {
    currentPath.value = route.query.path.toString();
  }

  const pathParts = computed(() => currentPath.value.split('/').filter(Boolean));

  const goTo = (index: number) => {
    const newPath = '/' + pathParts.value.slice(0, index + 1).join('/') + '/'
    currentPath.value = newPath
    router.push(`/clouddisk?path=${currentPath.value}`);
    currentPath.value = '/';
  };

  const goRoot = () => {
    currentPath.value = '/';
    router.push(`/clouddisk?path=${currentPath.value}`);
  }

  onMounted(async () => {
    try {
      const res = await fetch(`/api/preview?fileID=${fileID}&path=${currentPath.value}`);
      if (res.ok) {
        content.value = await res.text();
      } else {
        content.value = '无法预览该文件。';
      }
    } catch (err) {
      content.value = '预览失败。';
    }
  });
</script>

<style scoped>
.text-preview {
  background: #f6f6f6;
  padding: 1rem;
  border-radius: 8px;
  white-space: pre-wrap;
  font-family: monospace;
}
</style>