<template>
  <div class="login-container">
    <h2>登录</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>用户名</label>
        <input v-model="form.username" type="text" required>
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="form.password" type="password" required>
      </div>
      <button type="submit">登录</button>
    </form>
    <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/useApi'

const form = ref({
  email: '',
  password: ''
})

const router = useRouter()
const authStore = useAuthStore()

const handleSubmit = async () => {
  try {
    const response = await api.post('/auth/login', {
      email: form.value.email.trim().toLowerCase(), // 标准化邮箱格式
      password: form.value.password
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    authStore.setToken(response.data.token)
    authStore.setUser(response.data.user)
    router.push('/profile') // 明确跳转到个人中心
    
  } catch (error) {
    let message = '登录失败'
    
    if (error.response) {
      if (error.response.status === 401) {
        message = '邮箱或密码错误'
      } else if (error.response.data?.message) {
        message = error.response.data.message
      }
    }
    
    alert(message)
    console.error('登录错误详情:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    })
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #369f6b;
}
</style>