<template>
    <div class="p-4">
      <h2 class="font-bold">📂 Cloud Storage</h2>
      <!-- File Upload -->
      <input type="file" name="name" @change="handleUpload" />
      <!-- File List-->
      <ul>
        <li v-for="file in files" :key="file" class="flex justify-between items-center">
        <span>{{ file }}</span>
        <!-- <div>
          <a :href="`http://localhost:3000/download/${file}`" class="text-blue-500 mr-2" target="_blank">下载</a>
          <button class="text-red-500" @click="deleteFile(file)">删除</button>
        </div> -->
      </li>
      </ul>
    </div>

</template>

<script lang="ts" setup>
  import { files, fetchFiles, handleUpload, deleteFile } from '../Storage/cloudstorage'
  import { onMounted } from 'vue';
  onMounted(fetchFiles);
</script>