<template>
  <div class="post-list-container">
    <!-- 顶部操作栏：添加搜索框 -->
    <div class="top-bar">
      <div class="search-and-filters">
        <!-- 搜索框 -->
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索物品名称、描述..."
          @keyup.enter="fetchPosts"
          class="search-input"
        >
        <!-- 新增日期筛选器 -->
        <input type="date" v-model="startDate" class="date-input" @change="fetchPosts" />
        <span>至</span>
        <input type="date" v-model="endDate" class="date-input" @change="fetchPosts" />
        
        <!-- 原有筛选控件 -->
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
      </div>
      <button v-if="authStore.isAuthenticated" @click="goToCreate" class="create-btn">发布新帖</button>
    </div>

    <!-- 帖子列表部分 -->
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-if="posts.length === 0">暂无帖子</div>
      <div v-else class="card-grid">
        <PostCard v-for="post in posts" :key="post._id" :post="post" :id="'post-' + post._id" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../composables/useApi'
import PostCard from '../components/PostCard.vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessagesStore } from '@/stores/messages'

const router = useRouter()
const route = useRoute()
const goToCreate = () => {
  console.log('goToCreate 被触发') // 测试用，后续可删
  router.push('/posts/create')
}

const searchKeyword = ref('')
const filterType = ref('')
const sortOrder = ref('-createdAt')
const startDate = ref('')
const endDate = ref('')
const authStore = useAuthStore()
const posts = ref([])
const loading = ref(false)
const store = useMessagesStore()
const highlightId = ref(route.query.highlight || '')

const fetchPosts = async () => {
  try {
    loading.value = true
    const params = {
      sort: sortOrder.value,
      limit: 100,
      keyword: searchKeyword.value
    }
    if (filterType.value) params.type = filterType.value
    if (startDate.value) params.startDate = startDate.value
    if (endDate.value) params.endDate = endDate.value
    console.log('收到的日期参数:', startDate.value, endDate.value, params.date);
    const res = await api.get('/posts', { params })
    console.log('最终查询条件:', params);
    posts.value = res.data.data
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchPosts()
  store.fetchMessages()
  await nextTick()
  if (highlightId.value) {
    scrollToPost(highlightId.value)
  }
})

function scrollToPost(id) {
  const el = document.getElementById('post-' + id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight')
    setTimeout(() => el.classList.remove('highlight'), 2000)
  }
}
</script>

<style scoped>
/* 新增搜索框样式 */
.search-and-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-grow: 1;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  max-width: 100%;
}

/* 调整顶部栏布局 */
.top-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 768px) {
  .search-and-filters {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  padding: 5px;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 140px;
  max-width: 100%;
}

.badge {
  color: #fff;
  background: #f56c6c;
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 12px;
  margin-left: 4px;
}

.highlight {
  box-shadow: 0 0 10px 2px #42b983;
  transition: box-shadow 0.5s;
}

.system-link {
  cursor: pointer;
  color: #42b983;
  text-decoration: underline;
  display: inline;
}
.system-link:hover {
  color: #2a8c6c;
}
</style>