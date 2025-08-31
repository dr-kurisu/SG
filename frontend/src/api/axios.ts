import axios from 'axios';
import { router } from '@/router/index';
import Swal from 'sweetalert2';

export const instance = axios.create({
  baseURL: '/',
  timeout: 5000,
});

instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

instance.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status;
    const url = error.config?.url;

    const isLoginRequest = url?.includes('/account/login') || url?.includes('/account/register');
    // console.log(url);
    if (!isLoginRequest && (status === 401 || status === 403)) {
      localStorage.removeItem('token');

      await Swal.fire({
        icon: 'warning',
        title: '登录失效',
        text: '您的登录信息已过期，请重新登录',
        confirmButtonText: '确定'
      });

      router.push({ path: '/login' });
    }

    return Promise.reject(error);
  }
);
