import { ref } from 'vue';
import axios from 'axios';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
}

const files = ref<FileItem[]>([]);
const folderName = ref(''); // Folder name
const showModal = ref(false);  // 控制模态框的显示

const openModal = () => {
  showModal.value = true;
  folderName.value = '';
};

const closeModal = () => {
  showModal.value = false;
  folderName.value = '';
};

const fetchFiles = async () => {
  const res = await axios.get<FileItem[]>('/api/files');
  files.value = res.data;
  console.log(files.value);
};

const handleUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files == null) {
    alert("The selected file is null");
    return;
  }
  const file = input.files[0];
  if (!input.files || input.files.length === 0) return;

  const formData = new FormData();
  formData.append('file', file, encodeURIComponent(file.name));

  await axios.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  await fetchFiles();
};

const createFolder = async (event: Event) => {
  if (!folderName.value) {
    alert('请输入文件夹名称');
    return;
  }
  const response = await axios.post('/api/createFolder', { folderName: folderName.value });
  console.log(response.data.message);
  fetchFiles();
  closeModal();
}

// function used to display icon for each file type
const getFileIcon = (filename: string): string => {
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

export { files, folderName, showModal, handleUpload, fetchFiles, createFolder, getFileIcon, openModal, closeModal }