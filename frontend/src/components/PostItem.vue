<template>
  <div class="post-item" :class="post.status">
    <div class="post-header">
      <span class="post-type">{{ postTypeText }}</span>
      <span class="post-time">{{ formatDate(post.createdAt) }}</span>
    </div>
    
    <h3>{{ post.title }}</h3>
    <p>{{ post.description }}</p>
    
    <div class="post-footer">
      <span class="post-status">{{ statusText }}</span>
      <div class="actions">
        <button @click.stop="$emit('edit', post._id)">编辑</button>
        <button @click.stop="$emit('delete', post._id)">删除</button>
        <button 
          v-if="post.type === 'lost' && post.status !== 'found'"
          @click.stop="$emit('mark-found', post._id)"
        >
          标记为已找回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'mark-found'])

const postTypeText = computed(() => {
  return props.post.type === 'lost' ? '寻物启事' : '失物招领'
})

const statusText = computed(() => {
  return props.post.status === 'found' ? '已找回' : '进行中'
})

const formatDate = (dateString) => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm')
}
</script>

<style scoped>
.post-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 15px;
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

.actions button {
  margin-left: 10px;
  padding: 5px 10px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:hover {
  background: #e0e0e0;
}
</style>