<template>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet">
    <div class="p-4">
        <!-- Upload + Create Folder -->
        <div class="flex items-center space-x-4 mb-6">
            <!-- 上传文件按钮 -->
            <label for="file-upload"
                class="cursor-pointer bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition duration-300">
                <i class="fas fa-upload mr-2"></i> 上传文件
                <input id="file-upload" type="file" name="name" @change="handleUpload" class="hidden" />
            </label>

            <!-- 新建文件夹按钮 -->
            <button @click="openModal"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition duration-300">
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
                    <input v-model="folderName" type="text" id="folderName" placeholder="请输入文件名"
                        class="w-full px-4 py-2 border rounded-lg mt-2" />
                </div>
                <div class="flex justify-end">
                    <button @click="createFolder" class="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2">创建</button>
                    <button @click="closeModal" class="bg-gray-600 text-white px-4 py-2 rounded-lg">取消</button>
                </div>
            </div>
        </div>

        <!-- 操作栏 -->
        <OperationBar :path-parts="pathParts" :select-file-items="selectFileItems" @back="back" @go-root="goRoot"
            @refresh="refresh" @remove-files="removeFiles" @go-to="goTo" />


        <!-- 文件列表容器 -->
        <FileList 
            v-model:selectFileItemSet="selectFileItems"
            @fetch-files-v2="fetchFilesV2"
        />

    </div>
</template>

<script lang="ts" setup>
import { folderName, showModal, currentPath, fetchFiles, handleUpload, openModal, refresh, closeModal, createFolder, removeFile } from '../storage/cloudstorage'
import type { FileItem } from '@/types/types';
import { useRoute } from 'vue-router';
import { onMounted, computed, ref } from 'vue';
import OperationBar from '@/components/Disk/OperationBar.vue'
import Swal from 'sweetalert2'
import FileList from '@/components/Disk/FileList.vue';

const route = useRoute();
const pathParts = computed(() => currentPath.value.split('/').filter(Boolean));
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
        text: `确定要删除 ${selectFileItems.value.size} 个文件吗？`,
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

onMounted(() => {
    if (route.query.path) {
        currentPath.value = route.query.path.toString();
    }
    fetchFilesV2(currentPath.value);
});
</script>