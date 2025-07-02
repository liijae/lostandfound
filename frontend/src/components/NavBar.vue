<template>
  <nav>
    <router-link to="/">首页</router-link> |
    <router-link to="/posts">失物招领</router-link> |
    <span v-if="!authStore.isAuthenticated">
      <router-link to="/login">登录</router-link> |
      <router-link to="/register">注册</router-link>
    </span>
    <span v-else>
      <router-link to="/profile" class="profile-link">
        个人中心
        <span v-if="messageStore.unreadCount > 0" class="badge">{{ messageStore.unreadCount }}</span>
      </router-link> |
      <a href="#" @click.prevent="handleLogout">退出</a>
    </span>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMessageStore } from '@/stores/messages'
import { onMounted, watch, onUnmounted } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const messageStore = useMessageStore()
const { isAuthenticated } = storeToRefs(authStore)

let timer = null

onMounted(() => {
  if (isAuthenticated.value) messageStore.fetchUnreadCount()
  timer = setInterval(() => {
    if (isAuthenticated.value) messageStore.fetchUnreadCount()
  }, 3000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
watch(isAuthenticated, (val) => {
  if (val) messageStore.fetchUnreadCount()
  else messageStore.unreadCount = 0
})

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
.profile-link {
  position: relative;
}
.badge {
  background: #ff5b5b;
  color: #fff;
  border-radius: 8px;
  padding: 0 6px;
  font-size: 12px;
  margin-left: 4px;
  position: relative;
  top: -2px;
}
</style>