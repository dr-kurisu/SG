<template>
    <div class="function-buttons">
        <!-- 上传文件按钮 -->
        <label for="file-upload" class="upload-btn">
            <i class="fas fa-upload"></i>
            <span>上传文件</span>
            <input id="file-upload" type="file" name="name" @change="handleUpload" class="hidden-input" />
        </label>

        <!-- 新建文件夹按钮 -->
        <button @click="openModal" class="create-btn">
            <i class="fas fa-folder-plus"></i>
            <span>新建文件夹</span>
        </button>

    </div>

    <!-- 模态框 -->
    <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
            <h3 class="modal-title">新建文件</h3>
            <div class="modal-body">
                <input v-model="folderName" type="text" id="folderName" placeholder="请输入文件名" class="input-text" />
            </div>
            <div class="modal-actions">
                <button @click="createFolder(folderName).then(() => showModal = false)" class="btn-confirm">创建</button>
                <button @click="closeModal" class="btn-cancel">取消</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { handleUpload, createFolder } from "@/storage/cloudstorage";

const showModal = ref(false);
const folderName = ref("");

const openModal = () => {
    showModal.value = true;
    folderName.value = "";
};

const closeModal = () => {
    showModal.value = false;
    folderName.value = "";
};
</script>

<style scoped>
.function-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

/* 上传按钮 */
.upload-btn {
    cursor: pointer;
    background-color: #e5e7eb;
    color: #374151;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
}

.upload-btn:hover {
    background-color: #d1d5db;
}

.upload-btn i {
    margin-right: 0.5rem;
}

.hidden-input {
    display: none;
}

/* 新建按钮 */
.create-btn {
    background-color: #2563eb;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
}

.create-btn:hover {
    background-color: #1e40af;
}

.create-btn i {
    margin-right: 0.5rem;
}

/* 模态框 */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(107, 114, 128, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
}

.modal-content {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    width: 24rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    user-select: none;
}

.modal-body {
    margin-bottom: 1rem;
}

.input-text {
    width: 100%;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
}

.btn-confirm {
    background-color: #2563eb;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    margin-right: 0.5rem;
    transition: background-color 0.3s;
}

.btn-confirm:hover {
    background-color: #1e40af;
}

.btn-cancel {
    background-color: #4b5563;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    transition: background-color 0.3s;
}

.btn-cancel:hover {
    background-color: #374151;
}
</style>
