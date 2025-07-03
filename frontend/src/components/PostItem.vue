<template>
  <div class="post-item" :class="post.status">
    <div class="post-header">
      <span class="post-type">{{ postTypeText }}</span>
      <span class="post-time">{{ formatDate(post.createdAt) }}</span>
      <span v-if="post.status === 'found'" class="post-status-tag">已找回</span>
    </div>
    
    <h3>{{ post.title }}</h3>
    <p>{{ post.description }}</p>
    
    <div v-if="post.images?.length" class="post-images">
      <img 
        v-for="(img, index) in post.images" 
        :key="index" 
        :src="img" 
        @click="openImage(img)"
      >
    </div>
    
    <div class="post-footer">
      <span class="post-status">{{ statusText }}</span>
      <div v-if="isAuthor" class="post-actions">
        <button @click.stop="handleEdit">编辑</button>
        <button v-if="post.status !== 'found'" @click.stop="handleMarkFound">标记为已找回</button>
        <button @click.stop="handleDelete">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/useApi'
import { format } from 'date-fns'
import { useMessagesStore } from '../stores/messages'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'mark-found', 'refresh'])

const authStore = useAuthStore()
const store = useMessagesStore()
const router = useRouter()

// 计算属性
const postTypeText = computed(() => {
  return props.post.type === 'lost' ? '寻物启事' : '失物招领'
})

const statusText = computed(() => {
  return props.post.status === 'found' ? '已找回' : '进行中'
})

const isAuthor = computed(() => {
  return authStore.user?._id === props.post.user?._id
})

const { unreadCount } = store

// 方法
const formatDate = (dateString) => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm')
}

const handleEdit = () => {
  emit('edit', props.post._id)
}

const handleDelete = () => {
      emit('delete', props.post._id)
}

const handleMarkFound = () => {
  emit('mark-found', props.post._id);
};

const openImage = (imgUrl) => {
  window.open(imgUrl, '_blank')
}

const goToCreate = () => {
  router.push('/create')
}

onMounted(() => {
  store.fetchMessages()
})
</script>

<style scoped>
.post-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.post-item.found {
  opacity: 0.7;
  background: #f8f8f8;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.post-type {
  color: #42b983;
  font-weight: bold;
}

.post-time {
  color: #888;
}

.post-images {
  display: flex;
  gap: 10px;
  margin: 10px 0;
  overflow-x: auto;
}

.post-images img {
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
  object-fit: cover;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.post-status {
  font-size: 14px;
  color: #666;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.post-actions button {
  padding: 5px 10px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.post-actions button:hover {
  background: #e0e0e0;
}

.post-actions button:last-child {
  background: #42b983;
  color: white;
}

.post-actions button:last-child:hover {
  background: #3aa876;
}

.post-status-tag {
  display: inline-block;
  background: #42b983;
  color: #fff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  margin-left: 8px;
  margin-top: 2px;
}

.badge {
  color: #fff;
  background: #f56c6c;
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 12px;
  margin-left: 4px;
}
</style>