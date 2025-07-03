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
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    })
    router.push('/profile')
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    if (msg.includes('用户名已存在')) {
      alert('用户名已存在，请更换用户名')
    } else if (msg.includes('邮箱已存在')) {
      alert('邮箱已存在，请更换邮箱')
    } else {
      alert('注册失败：' + msg)
    }
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