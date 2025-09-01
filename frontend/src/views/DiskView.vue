<template>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet">
    <div class="p-4">
        <!-- Upload + Create Folder -->
        <FunctionButtons />

        <!-- 操作栏 -->
        <OperationBar v-model:select-file-items="selectFileItems"
            :path-parts="pathParts" :files="files" @back="back" @go-root="goRoot" @refresh="refresh"
            @remove-files="removeFiles" @go-to="goTo" @toggle-add-songs="" />

        <!-- 文件列表容器 -->
        <FileList v-model:selectFileItems="selectFileItems" @fetch-files-v2="fetchFilesV2" />
    </div>
</template>

<script lang="ts" setup>
import { currentPath, fetchFiles, files, refresh, removeFile } from '../storage/cloudstorage'
import type { FileItem } from '@/types/types';
import { useRoute } from 'vue-router';
import { onMounted, computed, ref } from 'vue';
import OperationBar from '@/components/Disk/OperationBar.vue'
import FunctionButtons from '@/components/Disk/FunctionButtons.vue'
import Swal from 'sweetalert2'
import FileList from '@/components/Disk/FileList.vue';

const route = useRoute();
const pathParts = computed(() => currentPath.value.split('/').filter(Boolean));
const selectFileItems = ref<FileItem[]>([]);

const fetchFilesV2 = async (path: string) => {
    console.log('Fetching files for path:', path);
    try {
        await fetchFiles(path);
        selectFileItems.value = [];
    } catch (error) {
        console.error('获取文件列表失败:', error);
    }
}

const removeFiles = async () => {
    if (selectFileItems.value.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: '',
            text: 'No file is selected',
            showConfirmButton: false,
            timer: 1000,
        })
        return;
    }
    const result = await Swal.fire({
        title: 'Confirmation',
        text: ` Are you sure you want to delete ${selectFileItems.value.length} files?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
        console.log('删除文件:', [...selectFileItems.value].map(file => file.name));
        await Promise.all([...selectFileItems.value].map(file => removeFile(file.id, file.type)));
        selectFileItems.value = [];
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
            text: 'Already at the root directory',
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 1500,
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