<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <div>
        <label>Username:</label>
        <input v-model="username" type="text" required />
      </div>
      <div>
        <label>Password:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<style>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5; /* 添加背景色 */
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>



<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }

  // 模拟登录逻辑
  console.log('Logging in with', username.value, password.value)
}
</script>
