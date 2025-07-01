<template>
  <div class="profile-container">
    <h1>个人中心</h1>
    
    <div class="profile-header">
      <div class="avatar">
        <img :src="userAvatar" alt="用户头像">
      </div>
      <div class="user-info">
        <h2>{{ authStore.user?.name || '未登录用户' }}</h2>
        <p>注册时间：{{ formatDate(authStore.user?.createdAt) }}</p>
      </div>
    </div>

    <div class="tabs">
      <button 
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="content">
      <!-- 我的帖子 -->
      <div v-if="activeTab === 'posts'" class="post-list">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="myPosts.length === 0" class="empty">
          <img src="@/assets/empty-post.png" alt="暂无帖子">
          <p>您还没有发布过任何帖子</p>
        </div>
        <div v-else class="posts">
          <PostItem
            v-for="post in myPosts"
            :key="post._id"
            :post="post"
            @edit="handleEditPost"
            @delete="handleDeletePost"
            @mark-found="handleMarkFound"
          />
        </div>
      </div>

      <!-- 账号设置 -->
      <div v-if="activeTab === 'settings'" class="settings">
        <h3>账号设置</h3>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="profileForm.name" type="text">
          </div>
          <div class="form-group">
            <label>电子邮箱</label>
            <input v-model="profileForm.email" type="email">
          </div>
          <button type="submit">保存更改</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PostItem from '@/components/PostItem.vue'
import api from '@/composables/useApi'
import { format } from 'date-fns'

const authStore = useAuthStore()
const activeTab = ref('posts')
const myPosts = ref([])
const loading = ref(false)

const tabs = [
  { label: '我的帖子', value: 'posts' },
  { label: '账号设置', value: 'settings' }
]

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || ''
})

const userAvatar = computed(() => {
  return authStore.user?.avatar || '@/assets/default-avatar.png'
})

// 获取用户帖子
const fetchMyPosts = async () => {
  try {
    loading.value = true
    const res = await api.get('/posts/my-posts')
    myPosts.value = res.data
  } finally {
    loading.value = false
  }
}

// 编辑帖子
const handleEditPost = (postId) => {
  router.push(`/posts/edit/${postId}`)
}

// 删除帖子
const handleDeletePost = async (postId) => {
  if (confirm('确定要删除这个帖子吗？')) {
    await api.delete(`/posts/${postId}`)
    fetchMyPosts()
  }
}

// 标记为已找回
const handleMarkFound = async (postId) => {
  await api.patch(`/posts/${postId}`, { status: 'found' })
  fetchMyPosts()
}

// 更新个人信息
const updateProfile = async () => {
  const res = await api.put('/users/profile', profileForm.value)
  authStore.setUser(res.data.user)
}

// 格式化日期
const formatDate = (dateString) => {
  return dateString ? format(new Date(dateString), 'yyyy-MM-dd') : '未知'
}

onMounted(fetchMyPosts)
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info h2 {
  margin: 0 0 5px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.tabs button.active {
  color: #42b983;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #42b983;
}

.post-list {
  margin-top: 20px;
}

.empty {
  text-align: center;
  padding: 40px 0;
}

.empty img {
  width: 150px;
  opacity: 0.6;
}

.empty p {
  margin-top: 10px;
  color: #888;
}

.settings {
  margin-top: 20px;
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

button[type="submit"] {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>