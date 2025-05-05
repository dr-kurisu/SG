<template>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet">
  <div class="p-4">
    <!-- Upload + Create Folder -->
    <div class="flex items-center space-x-4 mb-6">
      <!-- 上传文件按钮 -->
      <label
        for="file-upload"
        class="cursor-pointer bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition duration-300"
      >
        <i class="fas fa-upload mr-2"></i> 上传文件
        <input
          id="file-upload"
          type="file"
          name="name"
          @change="handleUpload"
          class="hidden"
        />
      </label>

      <!-- 新建文件夹按钮 -->
      <button
        @click="openModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition duration-300"
      >
        <i class="fas fa-folder-plus mr-2"></i> 新建文件夹
      </button>
    </div>


    <!-- 模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <!-- 模态框标题 -->
        <h3 class="text-xl font-semibold mb-4">新建文件</h3>
        <!-- 文件名输入框 -->
        <div class="mb-4">
          <input 
            v-model="folderName" 
            type="text" 
            id="folderName" 
            placeholder="请输入文件名" 
            class="w-full px-4 py-2 border rounded-lg mt-2" 
          />
        </div>
        <div class="flex justify-end">
            <button @click="createFolder" class="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2">创建</button>
            <button @click="closeModal" class="bg-gray-600 text-white px-4 py-2 rounded-lg">取消</button>
        </div>
      </div>
    </div>

    <!-- -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-4">
        <button
          @click="back"
          class="text-sm text-blue-600 hover:scale-95 active:scale-75 transition-transform duration-40"
        >
          <i class="fas fa-arrow-left mr-1"></i>返回
        </button>
        <button
          @click="refresh"
          class="text-sm text-blue-600 hover:scale-95 active:rotate-90 transition-transform duration-40"
        >
          <i class="fas fa-redo mr-1"></i>
        </button>
        <div class="text-gray-600 text-sm">
          LabMem001: {{ currentPath.replace(/^\//, '') }}
        </div>
      </div>
    </div>
    <!-- 文件列表容器 -->
    <div class="bg-gray-100 rounded-lg shadow-inner p-6 w-full min-h-[60vh]">
      <h2 class="text-xl font-bold mb-4">📁 文件列表</h2>

      <ul v-if="files.length" class="space-y-3">
        <li
          v-for="item in files"
          :key="item.name"
          @click="handleItemClick(item)"
          class="flex items-center justify-between bg-white px-4 py-3 rounded-md hover:bg-gray-50 transition"
        >
        <div class="flex items-center space-x-2">
          <i :class="['fas', item.type === 'folder' ? 'fa-folder' : getFileIcon(item.name), 'text-gray-500']"></i>
          <span class="truncate">{{ item.name.replace(/-(.*?)\./, '.') }}</span>
        </div>
        </li>
      </ul>
      <div v-else class="text-gray-500 italic">暂无文件</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { files, folderName, showModal, currentPath, fetchFiles, handleUpload, openModal, refresh, closeModal, getFileIcon, createFolder, handleItemClick, back } from '../Storage/cloudstorage'
  import { onMounted } from 'vue';
  onMounted(fetchFiles);
</script>