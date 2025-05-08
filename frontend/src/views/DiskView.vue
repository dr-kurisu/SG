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
        <h3 class="text-xl font-semibold mb-4 select-none">新建文件</h3>
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

    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-2 select-none">
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
        <div class="text-gray-600 text-sm flex items-center space-x-1">
          <span class="cursor-pointer text-blue-600 hover:underline" @click="goRoot">LabMem001:</span>
          <template v-for="(part, index) in pathParts" :key="index">
            <span class="mx-1 text-gray-400">/</span>
            <span
              class="cursor-pointer text-blue-600 hover:underline"
              @click="goTo(index)"
            >
              {{ part }}
            </span>
          </template>
        </div>
      </div>
    </div>
    
    <!-- 文件列表容器 -->
    <div class="bg-gray-100 rounded-lg shadow-inner p-6 w-full min-h-[70vh]">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4 flex items-center space-x-2 select-none">
        <i class="fas fa-folder text-yellow-500"></i>
        <span>Future Badget Lab</span>
      </h2>
      <!-- 表头 -->
      <div class="flex text-sm font-medium text-gray-700 mb-1 bg-gray-50 border-b border-gray-300 select-none p-3 rounded-md">
      <!-- 文件名列 -->
      <div class="w-3/4 flex items-center group" @click="sortFiles('name')">
        <div class="flex items-center w-full pr-4 hover:bg-gray-200 rounded transition-colors duration-200 px-3 py-1.5">
          
          <!-- 文件名 + 箭头 -->
          <div class="flex items-center space-x-2">
            <span class="font-semibold">文件名</span>
            <i v-if="sortBy === 'name'" 
              :class="['fas text-xs text-gray-600', sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            <i v-else class="fas fa-sort text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </div>
          
        </div>
        <div class="h-4 w-px bg-gray-300 ml-4"></div>
      </div>

        <!-- 修改时间列 -->
        <div class="w-1/4 flex items-center group" @click="sortFiles('modifiedTime')">
          <div class="flex items-center w-full pr-4 hover:bg-gray-200 rounded transition-colors duration-200 px-3 py-1.5">
            <div class="flex items-center space-x-2">
              <span class="font-semibold">修改时间</span>
              <i v-if="sortBy === 'modifiedTime'" 
                :class="['fas text-xs text-gray-600', sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
              <i v-else class="fas fa-sort text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
            
          </div>
        </div>
      </div>

      <!-- List -->
      <ul v-if="files.length" class="space-y-3">
        <li
          v-for="item in files"
          :key="item.name"
          @click="handleItemClick(item)"
          class="flex items-center justify-between bg-white px-4 py-3 rounded-md hover:bg-gray-200 transition"
        >
          <div class="w-3/4 items-center space-x-2">
            <i :class="['fas', item.type === 'folder' ? 'fa-folder' : getFileIcon(item.name), 'text-gray-500']"></i>
            <span class="truncate">{{ item.name.replace(/-\w+(?=\.\w+$)/, '') }}</span>
          </div>
          <span class="w-1/4 text-sm text-gray-500 ml-4">{{ formatDate(item.modifiedTime) }}</span>
        </li>
      </ul>
      <div v-else class="text-gray-500 italic select-none">暂无文件</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { files, folderName, showModal, currentPath, fetchFiles, handleUpload, openModal, refresh, closeModal, getFileIcon, createFolder, handleItemClick, back } from '../Storage/cloudstorage'
  import type { FileItem } from '../Storage/cloudstorage';
  import { onMounted, computed, ref } from 'vue';
  const pathParts = computed(() => currentPath.value.split('/').filter(Boolean))
  const goTo = (index: number) => {
    const newPath = '/' + pathParts.value.slice(0, index + 1).join('/') + '/'
    if (newPath != currentPath.value) {
      currentPath.value = newPath
      fetchFiles(newPath)
    }
    // 刷新文件
  }

  const goRoot = () => {
    if (currentPath.value != '/') {
    currentPath.value = '/'
    fetchFiles(currentPath.value)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();  // 可以改成其它格式，比如 `toLocaleDateString()` 或自定义格式
  }

  const sortBy = ref('name');
  const sortOrder = ref('asc');
  const sortFiles = (field: string) => {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = field;
      sortOrder.value = 'asc';
    }
    console.log(sortOrder);

    files.value.sort((a: FileItem, b: FileItem) => {
        let compareA, compareB;

        if (field === 'name') {
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
        } else if (field === 'modifiedTime') {
          compareA = new Date(a.modifiedTime).getTime();
          compareB = new Date(b.modifiedTime).getTime();
        }else {
          compareA = "";
          compareB = "";
        }

        if (sortOrder.value === 'asc') {
          return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
        } else {
          return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
        }
      }); 
  }

  onMounted(fetchFiles);
</script>