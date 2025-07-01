<template>
  <nav>
    <router-link to="/">首页</router-link> |
    <router-link to="/posts">失物招领</router-link> |
    <span v-if="!authStore.isAuthenticated">
      <router-link to="/login">登录</router-link> |
      <router-link to="/register">注册</router-link>
    </span>
    <span v-else>
      <router-link to="/profile">个人中心</router-link> |
      <a href="#" @click.prevent="handleLogout">退出</a>
    </span>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const router = useRouter()

// 使用 storeToRefs 保持响应式
const { isAuthenticated } = storeToRefs(authStore)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
nav {
  padding: 20px;
  background: #f0f0f0;
  margin-bottom: 20px;
  text-align: center;
}
nav a {
  margin: 0 5px;
  color: #2c3e50;
  text-decoration: none;
}
nav a.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
}
nav a:hover {
  text-decoration: underline;
}
</style>