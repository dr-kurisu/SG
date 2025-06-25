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
    <div class="flex items-center justify-between mb-2 select-none h-10 py-2">
      <!-- 左侧按钮组 -->
      <div class="flex items-center space-x-4">
        <button
          @click="back"
          class="text-sm text-blue-600 hover:scale-95 active:scale-75 transition-transform duration-40"
        >
          <i class="fas fa-arrow-left mr-1"></i>
          <span>返回</span>
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

      <!-- 右侧删除按钮，选中时显示 -->
      <div class="flex items-center">
        <button
          v-if="selectFileItems.size > 0"
          @click="removeFiles"
          class="bg-red-600 text-white px-2.5 py-1.5 rounded-md flex items-center justify-center hover:bg-red-700 transition duration-300 text-sm"
        >
          <i class="fas fa-trash-alt mr-1"></i> 删除
        </button>
      </div>
    </div>
    
    <!-- 文件列表容器 -->
    <div class="bg-gray-100 rounded-lg shadow-inner p-6 w-full min-h-[70vh]">

      <h2 class="text-2xl font-semibold text-gray-700 mb-4 flex items-center space-x-2 select-none">
        <i class="fas fa-folder text-yellow-500"></i>
        <span>Future Badget Lab</span>
      </h2>

      <!-- 表头 -->
      <div class="flex text-sm font-medium text-gray-700 mb-1 bg-gray-50 border-b border-gray-300 select-none p-1.5 rounded-md">
        <!-- 文件名列 -->
        <div class="w-3/4 flex items-center group" @click="sortFiles('name')">
          <div class="flex items-center w-full pr-4 hover:bg-gray-200 rounded transition-colors duration-200 px-3 py-1.5">
            <div class="flex items-center space-x-2">
              <span class="font-semibold">文件名</span>
              <i v-if="sortBy === 'name'" 
                :class="['fas text-xs text-gray-600', sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
              <i v-else class="fas fa-sort text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
          </div>
        </div>
        
        <div class="w-px flex item-center bg-gray-300 mx-2"></div>

        <!-- 修改时间列 -->
        <div class="w-36 text-right px-3 py-1.5" @click="sortFiles('modifiedTime')">
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
          class="relative flex items-center bg-white px-4 py-3 rounded-md hover:bg-gray-200 transition"
        >
          <!-- 文件名，占满宽度 -->
          <div class="flex items-center w-full pr-40 space-x-2 select-none"> 
            <i :class="['fas', item.type === 'folder' ? 'fa-folder' : getFileIcon(item.name), 'text-gray-500']"></i>
            <span class="truncate">{{ item.name.replace(/__\w+(?=\.\w+$)/, '') }}</span>
          </div>

          <!-- 修改时间，固定宽度，右对齐 -->
          <span class="absolute right-12 w-36 text-sm text-gray-500 text-right select-none top-1/2 -translate-y-1/2">
            {{ formatDate(item.modifiedTime) }}
          </span>

          <!-- 复选框，最右 -->
          <input
            type="checkbox"
            :value="item.name"
            :checked="selectFileItems.has(item)"
            @click.stop="toggleSelection(item)"
            class="form-checkbox text-blue-600 scale-150 absolute right-4 top-1/2 -translate-y-1/2"
          />
        </li>
      </ul>
      <div v-else class="text-gray-500 italic select-none">暂无文件</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { files, folderName, showModal, currentPath, fetchFiles, handleUpload, openModal, refresh, closeModal, getFileIcon, createFolder, removeFile,getNumberofFile } from '../Storage/cloudstorage'
import type { FileItem } from '../Storage/cloudstorage';
import { useRouter, useRoute } from 'vue-router';
import { onMounted, computed, ref } from 'vue';
import Swal from 'sweetalert2'

const router = useRouter();
const route = useRoute();

const selectFileItems = ref<Set<FileItem>>(new Set());

const fetchFilesV2 = async (path: string) => {
  console.log('Fetching files for path:', path);
  try {
    await fetchFiles(path);
    selectFileItems.value.clear();
  } catch (error) {
    console.error('获取文件列表失败:', error);
  }
}

const toggleSelection = (fileItem: FileItem) => {
  if (selectFileItems.value.has(fileItem)) {
    selectFileItems.value.delete(fileItem);
  } else {
    selectFileItems.value.add(fileItem);
  }
  selectFileItems.value = new Set(selectFileItems.value);
}

const removeFiles = async () => {
  if (selectFileItems.value.size === 0) {
    Swal.fire({
      icon: 'warning',
      title: '',
      text: '请选择要删除的文件',
      showConfirmButton: false,  // 显示确认按钮
      timer: 1000,  // 自动关闭时间
    })
    return;
  }
  const result = await Swal.fire({
    title: '确认删除',
    text: `确定要删除 ${selectFileItems.value.size} 个文件吗？当前剩余${await getNumberofFile()}文件`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  });
  // 如果用户点击了确认按钮
  if (result.isConfirmed) {
    console.log('删除文件:', [...selectFileItems.value].map(file => file.name));
    await Promise.all([...selectFileItems.value].map(file => removeFile(file.id, file.type)));
    selectFileItems.value.clear();
    await fetchFilesV2(currentPath.value);
  }
}

const pathParts = computed(() => currentPath.value.split('/').filter(Boolean));
const goTo = (index: number) => {
  const newPath = '/' + pathParts.value.slice(0, index + 1).join('/') + '/'
  if (newPath != currentPath.value) {
    currentPath.value = newPath;
    fetchFilesV2(newPath);
  }
}

const goRoot = () => {
  if (currentPath.value != '/') {
  currentPath.value = '/';
  fetchFilesV2(currentPath.value);
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

const handleItemClick = async (item: FileItem) => {
if (item.type == "folder") {
  openFolder(item);
}else if (item.type == 'file') {
  previewFile(item);
}
}

const openFolder = async (item: FileItem) => {
  currentPath.value += `${item.name}/`;
  fetchFilesV2(currentPath.value);
}

const previewFile = async (item: FileItem) => {
  const encodedPath = encodeURIComponent(currentPath.value);
  const encodedID = encodeURIComponent(item.name);
  router.push(`/preview?path=${encodedPath}&fileID=${encodedID}`);
}

const back = () => {
  console.log('当前路径:', currentPath.value);
  if (currentPath.value === '/' || !currentPath.value) {
    Swal.fire({
      icon: 'warning',
      title: '',
      text: '根目录无法回退',
      showConfirmButton: false,  // 显示确认按钮
      timer: 1000,  // 自动关闭时间
    })
    return;
  }
    const parts = currentPath.value.split('/').filter(Boolean);
    parts.pop();
    currentPath.value = '/' + parts.join('/') + (parts.length ? '/' : '');
    fetchFilesV2(currentPath.value);
}

onMounted(()=> {
  if (route.query.path) {
    currentPath.value = route.query.path.toString();
  }
  fetchFilesV2(currentPath.value);
});
</script>