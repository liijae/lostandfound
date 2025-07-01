<template>
  <div class="post-list-container">
    <!-- 顶部操作栏：发布按钮和筛选控件同一行 -->
    <div class="top-bar">
      <div class="filters">
        <select v-model="filterType" @change="fetchPosts">
          <option value="">全部类型</option>
          <option value="lost">寻物启事</option>
          <option value="found">失物招领</option>
        </select>
        <span class="sort-label">排序：</span>
        <select v-model="sortOrder" @change="fetchPosts">
          <option value="-createdAt">最新优先</option>
          <option value="createdAt">最旧优先</option>
        </select>
      </div>
      <button v-if="authStore.isAuthenticated" @click="goToCreate" class="create-btn">发布新帖</button>
    </div>
    <!-- 卡片流 -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="posts.length === 0" class="empty-tip">
      <img src="@/assets/empty.svg" alt="暂无数据">
      <p>当前没有{{ filterType ? typeText[filterType] : '' }}信息</p>
    </div>

    <div v-else class="card-grid">
      <transition-group name="card-fade">
        <PostCard 
          v-for="post in posts" 
          :key="post._id" 
          :post="post"
          @click="viewDetail(post._id)"
        />
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import PostCard from '@/components/PostCard.vue'
import api from '@/composables/useApi'
import emptyImage from '@/assets/empty.png'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const posts = ref([])
const loading = ref(false)
const filterType = ref('')
const sortOrder = ref('-createdAt') // 默认最新优先
const authStore = useAuthStore()

const typeText = {
  'lost': '寻物启事',
  'found': '失物招领'
}

const fetchPosts = async () => {
  try {
    loading.value = true
    const params = {
      sort: sortOrder.value
    }
    if (filterType.value) params.type = filterType.value
    
    const res = await api.get('/posts', { params })
    posts.value = res.data
  } finally {
    loading.value = false
  }
}

const viewDetail = (id) => {
  router.push(`/posts/${id}`)
}

const goToCreate = () => {
  router.push('/posts/create')
}

// 初始加载
onMounted(fetchPosts)
</script>

<style scoped>
.post-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.create-btn {
  padding: 8px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
  height: 38px;
  line-height: 1;
  margin: 0;
}
.create-btn:hover {
  background: #369f6b;
}
.filters {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 0;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
}
.filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}
.sort-label {
  margin-left: 10px;
  color: #666;
}

/* 卡片网格布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 5px; /* 为悬停效果留空间 */
}

/* 加载状态 */
.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 50px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-tip {
  text-align: center;
  padding: 40px 0;
}
.empty-tip img {
  width: 120px;
  opacity: 0.6;
}
.empty-tip p {
  margin-top: 15px;
  color: #888;
}

/* 卡片入场动画 */
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.5s ease;
}
.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>