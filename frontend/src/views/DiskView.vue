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
import { currentFolderID, fetchFiles, files, refresh, removeFile, breadcrumb } from '../storage/cloudstorage'
import type { FileItem } from '@/types/types';
import { useRoute } from 'vue-router';
import { onMounted, computed, ref } from 'vue';
import OperationBar from '@/components/Disk/OperationBar.vue'
import FunctionButtons from '@/components/Disk/FunctionButtons.vue'
import Swal from 'sweetalert2'
import FileList from '@/components/Disk/FileList.vue';

const route = useRoute();
const pathParts = computed(() => breadcrumb.value.map(b => b.name));

const selectFileItems = ref<FileItem[]>([]);

const fetchFilesV2 = async (currentFolderID: number) => {
    console.log(`Fetching files for folder with id: ${currentFolderID}`);
    try {
        await fetchFiles(currentFolderID);
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
        await fetchFilesV2(currentFolderID.value);
    }
}

const goTo = (index: number) => {
    const target = breadcrumb.value[index];
    if (!target) return;

    if (target.id !== currentFolderID.value) {
        currentFolderID.value = target.id;
        fetchFilesV2(currentFolderID.value);
    }
    // 截断面包屑
    breadcrumb.value = breadcrumb.value.slice(0, index + 1);
}

const goRoot = () => {
    currentFolderID.value = -1;
    fetchFilesV2(-1);
    breadcrumb.value = [];
}

const back = () => {
    if (breadcrumb.value.length <= 0) {
        Swal.fire({
            icon: 'warning',
            title: '',
            text: 'Already at the root directory',
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 1500,
        });
        return;
    }

    // 移除最后一级
    breadcrumb.value.pop();

    if (breadcrumb.value.length === 0) goRoot();

    const last = breadcrumb.value[breadcrumb.value.length - 1];
    currentFolderID.value = last.id;

    fetchFilesV2(currentFolderID.value);
};



onMounted(() => {
    // if (route.query.path) {
    //     currentPath.value = route.query.path.toString();
    // }
    fetchFilesV2(currentFolderID.value);
});
</script>