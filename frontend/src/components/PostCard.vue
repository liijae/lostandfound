<template>
  <div 
    class="post-card"
    :class="post.type"
    @click.stop="$emit('click')"
  >
    <div class="card-badge">{{ post.type === 'lost' ? '寻物' : '招领' }}</div>
    
    <div class="card-image-container">
      <img 
        v-if="post.images?.length" 
        :src="post.images[0]" 
        class="card-image"
      >
      <div v-else class="image-placeholder">
        <i class="icon-camera"></i>
      </div>
      <div class="card-time">{{ formatTime(post.createdAt) }}</div>
    </div>
    
    <div class="card-content">
      <h3 class="card-title">{{ post.title }}</h3>
      <p class="card-desc">{{ truncate(post.description, 60) }}</p>
      
      <div class="card-footer">
        <span class="location">
          <i class="icon-location"></i>
          {{ post.location || '未知地点' }}
        </span>
        <span class="contact">
          <i class="icon-user"></i>
          {{ post.contact || '匿名' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const formatTime = (date) => {
  return format(new Date(date), 'MM-dd HH:mm')
}

const truncate = (text, length) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}
</script>

<style scoped>
.post-card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

/* 类型角标 */
.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  z-index: 2;
}
.lost .card-badge { background: rgba(255, 77, 79, 0.9); }
.found .card-badge { background: rgba(82, 196, 26, 0.9); }

/* 图片区域 */
.card-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.post-card:hover .card-image {
  transform: scale(1.05);
}
.image-placeholder {
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 40px;
}

/* 时间标签 */
.card-time {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
}

/* 内容区域 */
.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.card-title {
  display: -webkit-box;
  display: -moz-box;
  display: box;
  -webkit-line-clamp: 2;
  -moz-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
}
.card-desc {
  margin: 0 0 15px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  flex-grow: 1;
}

/* 底部信息 */
.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: auto;
}
.card-footer span {
  display: flex;
  align-items: center;
}
.card-footer i {
  margin-right: 4px;
  font-size: 14px;
}
</style>