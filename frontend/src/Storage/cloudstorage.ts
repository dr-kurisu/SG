import { ref } from 'vue';
import axios from 'axios';

const files = ref<string[]>([]);

const fetchFiles = async () => {
  const res = await axios.get<string[]>('http://localhost:3000/api/files');
  files.value = res.data;
  console.log(files.value);
};

const handleUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const formData = new FormData();
  formData.append('file', input.files[0]);

  await axios.post('http://localhost:3000/api/upload', formData);
  await fetchFiles();
};

const deleteFile = async (filename: string) => {
  await axios.delete(`http://localhost:3000/delete/${filename}`);
  await fetchFiles();
};

export { files, handleUpload, deleteFile, fetchFiles }