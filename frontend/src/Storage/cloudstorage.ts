import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2'

interface FileItem {
  name: string;
  type: 'file' | 'folder';
}

const files = ref<FileItem[]>([]);
const folderName = ref(''); // Folder name
const showModal = ref(false);  // 控制模态框的显示
const currentPath = ref('/')

const openModal = () => {
  showModal.value = true;
  folderName.value = '';
};

const closeModal = () => {
  showModal.value = false;
  folderName.value = '';
};

const fetchFiles = async (path: string = '/') => {
  try {
    const res = await axios.get<FileItem[]>('/api/files', {
      params: { path }
    })
    files.value = res.data
    console.log('当前路径:', path, '文件列表:', files.value)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '错误',
      text: '获取文件失败，请稍后再试。',
      showConfirmButton: false,  // 显示确认按钮
      timer: 1200,  // 自动关闭时间
    })
    console.error('获取文件失败:', error)
  }
}

// button adaptor
const refresh = async(event: Event) => {
  fetchFiles(currentPath.value);
  Swal.fire({
    icon: 'success',
    title: '',
    text: '刷新成功',
    showConfirmButton: false,  // 显示确认按钮
    timer: 1000,  // 自动关闭时间
  })
}
// handling upload of files
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
  await axios.post(`/api/upload?path=${encodeURIComponent(currentPath.value)}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  await fetchFiles(currentPath.value);
  input.value = '';
};

const createFolder = async (event: Event) => {
  if (!folderName.value) {
    alert('请输入文件夹名称');
    return;
  }
  const response = await axios.post('/api/createFolder', { folderName: folderName.value });
  console.log(response.data.message);
  fetchFiles(currentPath.value);
  closeModal();
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
  fetchFiles(currentPath.value);
}

const previewFile = async (item: FileItem) => {

}

const back = () => {
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
  currentPath.value = '/';
  currentPath.value = '/' + parts.join('/') + (parts.length ? '/' : '');
  fetchFiles(currentPath.value);
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

export { files, folderName, showModal, currentPath, handleUpload, fetchFiles, createFolder, getFileIcon, openModal, closeModal, back, handleItemClick, refresh }