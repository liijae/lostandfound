<template>
  <div class="register-container">
    <!-- 注册表单内容 -->
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <div>
        <label>用户名：</label>
        <input v-model="username" type="text" required>
      </div>
      <div>
        <label>邮箱：</label>
        <input v-model="email" type="email" required>
      </div>
      <div>
        <label>密码：</label>
        <input v-model="password" type="password" required>
      </div>
      <button type="submit">注册</button>
    </form>
    <p>已有账号？<router-link to="/login">去登录</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')

const handleRegister = async () => {
  try {
    console.log("正在提交注册数据:", { 
      username: username.value, 
      email: email.value 
    }) // 调试

    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    })
    console.log("注册成功，跳转首页") // 调试
    router.push('/') // 注册成功后跳转首页
  } catch (error) {
    console.error('注册失败:', error.response?.data || error.message) // 详细错误
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
form div {
  margin-bottom: 15px;
}
label {
  display: inline-block;
  width: 80px;
}
button {
  padding: 8px 16px;
}
</style>