<template>
    <div class="bg-gray-100 rounded-lg shadow-inner p-6 w-full min-h-[70vh]">

        <h2 class="text-2xl font-semibold text-gray-700 mb-4 flex items-center space-x-2 select-none">
            <i class="fas fa-folder text-yellow-500"></i>
            <span>Future Badget Lab</span>
        </h2>

        <!-- 表头 -->
        <div
            class="flex text-sm font-medium text-gray-700 mb-1 bg-gray-50 border-b border-gray-300 select-none p-1.5 rounded-md">
            <!-- 文件名列 -->
            <div class="w-3/4 flex items-center group" @click="sortFiles('name')">
                <div
                    class="flex items-center w-full pr-4 hover:bg-gray-200 rounded transition-colors duration-200 px-3 py-1.5">
                    <div class="flex items-center space-x-2">
                        <span class="font-semibold">文件名</span>
                        <i v-if="sortBy === 'name'"
                            :class="['fas text-xs text-gray-600', sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
                        <i v-else
                            class="fas fa-sort text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                </div>
            </div>

            <div class="w-px flex item-center bg-gray-300 mx-2"></div>

            <!-- 修改时间列 -->
            <div class="w-36 text-right px-3 py-1.5" @click="sortFiles('modifiedTime')">
                <div
                    class="flex items-center w-full pr-4 hover:bg-gray-200 rounded transition-colors duration-200 px-3 py-1.5">
                    <div class="flex items-center space-x-2">
                        <span class="font-semibold">修改时间</span>
                        <i v-if="sortBy === 'modifiedTime'"
                            :class="['fas text-xs text-gray-600', sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
                        <i v-else
                            class="fas fa-sort text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- List -->
        <ul v-if="files.length" class="space-y-3">
            <li v-for="item in files" :key="item.name" @click="handleItemClick(item)"
                class="relative flex items-center bg-white px-4 py-3 rounded-md hover:bg-gray-200 transition">
                <!-- 文件名，占满宽度 -->
                <div class="flex items-center w-full pr-40 space-x-2 select-none">
                    <i :class="['fas', item.type === 'folder' ? 'fa-folder' : getFileIcon(item.name), 'text-gray-500']">
                    </i>
                    <span class="truncate">{{ item.name.replace(/__\w+(?=\.\w+$)/, '') }}</span>
                </div>

                <!-- 修改时间，固定宽度，右对齐 -->
                <span
                    class="absolute right-12 w-36 text-sm text-gray-500 text-right select-none top-1/2 -translate-y-1/2">
                    {{ formatDate(item.modifiedTime) }}
                </span>

                <!-- 复选框，最右 -->
                <input type="checkbox" :value="item.name" :checked="props.selectFileItems.includes(item)"
                    @click.stop="toggleSelection(item)"
                    class="form-checkbox text-blue-600 scale-150 absolute right-4 top-1/2 -translate-y-1/2" />
            </li>
        </ul>
        <div v-else class="text-gray-500 italic select-none">暂无文件</div>
    </div>
</template>

<script setup lang="ts">
import type { FileItem } from '@/types/types';
import { ref } from 'vue';
import { getFileIcon, files, currentPath } from '@/storage/cloudstorage';
import { useRouter } from 'vue-router';

const props = defineProps<{
    selectFileItems: FileItem[];
}>();

const emit = defineEmits(['fetchFilesV2', 'update:selectFileItems']);

const router = useRouter();

const toggleSelection = (fileItem: FileItem) => {
    const newSelectedFileItems = [...props.selectFileItems];

    const index = newSelectedFileItems.indexOf(fileItem);
    if (index !== -1) {
        newSelectedFileItems.splice(index, 1);
    } else {
        newSelectedFileItems.push(fileItem);
    }

    emit('update:selectFileItems', newSelectedFileItems);
};


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
        } else {
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
    } else if (item.type == 'file') {
        previewFile(item);
    }
}

const openFolder = async (item: FileItem) => {
    currentPath.value += `${item.name}/`;
    emit("fetchFilesV2", currentPath.value);
}

const previewFile = async (item: FileItem) => {
    const encodedPath = encodeURIComponent(currentPath.value);
    const encodedID = encodeURIComponent(item.name);
    router.push(`/preview?path=${encodedPath}&fileID=${encodedID}`);
}




</script>