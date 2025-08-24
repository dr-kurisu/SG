import { ref } from 'vue';
import { instance as axiosInstance } from '@/api/axios';
import axios from "axios";
import Swal from 'sweetalert2'
import type { FileItem, Song } from '@/types/types';

export const files = ref<FileItem[]>([]);
export const currentPath = ref('/');

export const fetchFiles = async (path: string = '/') => {
    try {
        const res = await axiosInstance.get<FileItem[]>('/api/files', {
            params: { path }
        });

        files.value = res.data;

        // console.log('当前路径:', path, '文件列表:', files.value.map(v => v.name));
    } catch (err: any) {
        if (err.response.status === 401 || err.response.status === 403) {
            // 想办法跳转
            return;
        }
        Swal.fire({
            icon: 'error',
            title: '错误',
            text: '获取文件失败，请稍后再试。',
            showConfirmButton: false,  // 显示确认按钮
            timer: 1200,  // 自动关闭时间
        })
        console.error('获取文件失败:', err);
    }
}

// button adaptor
export const refresh = async (event: Event) => {
    await fetchFiles(currentPath.value);
    Swal.fire({
        icon: 'success',
        title: '',
        text: '刷新成功',
        showConfirmButton: false,  // 显示确认按钮
        timer: 1000,  // 自动关闭时间
    });
}
// handling upload of files
export const handleUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files == null) {
        Swal.fire({
            icon: 'error',
            title: '上传错误',
            text: '请上传合法文件',
            showConfirmButton: true,
            timer: 1000,
        });
        return;
    }
    const file = input.files[0];
    if (!input.files || input.files.length === 0) {
        Swal.fire({
            icon: 'error',
            title: '上传错误',
            text: '请上传合法文件',
            showConfirmButton: true,
            timer: 1000,
        });
        return;
    }

    try {
        const formData = new FormData();
        formData.append('file', file, encodeURIComponent(file.name));
        await axiosInstance.post(`/api/upload?path=${encodeURIComponent(currentPath.value)}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        await fetchFiles(currentPath.value);
        input.value = '';
    } catch (error) {
        const message = (error as Error).message || error?.toString?.() || '未知错误';
        Swal.fire({
            icon: 'error',
            title: '上传失败',
            text: message,
            showConfirmButton: true,
        });
    }
};

export const createFolder = async (folderName: string) => {
    if (!folderName) {
        Swal.fire({
            icon: "warning",
            title: "Please fill the required field",
            showConfirmButton: false,
            timer: 1200,
        })
        return;
    }

    try {
        const response = await axiosInstance.post('/api/createFolder', {
            folderName: folderName,
            currentPath: currentPath.value
        });

        console.log("createFolderMessage: ", response.data.message);
        fetchFiles(currentPath.value);

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                Swal.fire({
                    icon: "error",
                    title: "文件夹已存在",
                    showConfirmButton: true,
                    timer: 1000,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "创建失败，请稍后重试",
                    showConfirmButton: true,
                    timer: 1000,
                });
            }
        }
    }
};

// Remove given file by ID
export const removeFile = async (id: number, file_type: string) => {
    if (file_type === 'folder') {
        try {
            const response = await axiosInstance.delete(`/api/deleteFolder/${id}`);
            fetchFiles(currentPath.value);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '删除失败',
                text: '无法删除Music文件夹或稍后重试',
                showConfirmButton: true,
            });
            console.error('删除文件夹失败:', error);
        }
        return;
    } else {
        try {
            const response = await axiosInstance.delete(`/api/delete/${id}`);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '删除失败',
                text: '请稍后再试。',
                showConfirmButton: true,
            });
            console.error('删除文件失败:', error);
        }
    }
}

// remove folder by ID
export const removeFolder = async (folder_id: number) => {
};

export const addSongs = async (selectedFiles: FileItem[]) => {
    const results = [];
    for (const file of selectedFiles) {
        try {
            const res = await axiosInstance.post("/api/songs/add-song", { file_id: file.id });
            results.push({
                status: 'fulfilled',
                value: { file, success: res.data?.success }
            });
        } catch (err) {
            results.push({
                status: 'rejected',
                value: { file, success: false, error: err }
            });
        }
    }
    return results;
}

export const handleAddSongs = async (selectedFiles: FileItem[]) => {
    const results = await addSongs(selectedFiles);
    
    // 统计成功和失败的数量
    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success);
    const failed = results.filter(result => result.status === 'rejected' || !result.value.success);
    
    if (failed.length === 0) {
        Swal.fire({
            icon: "success",
            title: "添加成功",
            text: `全部 ${successful.length} 个文件已成功添加到 Songs List`
        });
    } else if (successful.length === 0) {
        Swal.fire({
            icon: "error",
            title: "添加失败",
            text: `全部 ${failed.length} 个文件添加失败`
        });
    } else {
        Swal.fire({
            icon: "warning",
            title: "部分成功",
            html: `
                <p>成功: ${successful.length} 个</p>
                <p>失败: ${failed.length} 个</p>
            `
        });
    }
};

// function used to display icon for each file type
export const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) return 'fa-file-image';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return 'fa-file-video';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'fa-file-audio';
    if (['pdf'].includes(ext)) return 'fa-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'fa-file-word';
    if (['xls', 'xlsx'].includes(ext)) return 'fa-file-excel';
    if (['ppt', 'pptx'].includes(ext)) return 'fa-file-powerpoint';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'fa-file-archive';
    if (['txt', 'md', 'csv'].includes(ext)) return 'fa-file-alt';
    return 'fa-file'; // 默认图标
};