<template>
  <div class="flex justify-center items-center h-screen bg-gray-300">
    <div class="bg-gray-100 p-8 rounded-xl shadow-lg w-80">
      <h2 class="text-2xl font-bold text-center mb-6">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block mb-1 text-gray-700">Username:</label>
          <input
            v-model="username"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label class="block mb-1 text-gray-700">Password:</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors duration-200"
        >
          Login
        </button>
      </form>
      <p v-if="error" class="text-red-600 text-sm text-center mt-4">{{ error }}</p>
    </div>
  </div>
</template>


<script setup>
import Swal from 'sweetalert2';
import { ref } from 'vue';
import { instance as axiosInstance } from '@/api/axios';
import axios from "axios";
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

async function handleLogin() {
  if (!username.value || !password.value) {
    Swal.fire({
      icon: 'warning',
      title: '请输入用户名和密码',
      text: '',
      showConfirmButton: true, 
      timer: 1200,
    });
    return;
  }
  try{
    const res = await axiosInstance.post("/api/account/login", {username: username.value, password: password.value});
    if (res.data?.token) {
      const token = res.data?.token;
      if (typeof token !== 'string' || !token) {
        throw new Error('Token is missing or invalid');
      }
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      error.value = "";
      router.push('/');
    }else {
      error.value = 'Login failed: Invalid credentials'
    }
  } catch(err) {
    console.log(err);
    if (err.response && err.response.status === 401) {
      error.value = 'Incorrect username or password';
    }else if (err.response.status === 404){
      error.value = 'User does not exist';
    }
     else {
      error.value = 'Server error, please try again later';
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #22578c;
}

.login-box {
  background-color: aqua;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 300px;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}

.error {
  color: red;
  margin-top: 0.5rem;
  text-align: center;
}
</style>