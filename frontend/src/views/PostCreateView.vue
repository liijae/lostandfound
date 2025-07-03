<template>
  <div class="create-post-container">
    <h2>发布新帖</h2>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <div class="form-group">
        <label>类型：</label>
        <select v-model="form.type" required>
          <option value="lost">寻物启事</option>
          <option value="found">失物招领</option>
        </select>
      </div>
      <div class="form-group">
        <label>标题：</label>
        <input v-model="form.title" required />
      </div>
      <div class="form-group">
        <label>描述：</label>
        <textarea v-model="form.description" />
      </div>
      <div class="form-group">
        <label>地点：</label>
        <div style="display: flex; align-items: center; gap: 10px;">
          <button type="button" @click="goToMapSelect">地图选点</button>
          <span v-if="form.coordinates">已选坐标：X: {{ form.coordinates.x.toFixed(2) }}, Y: {{ form.coordinates.y.toFixed(2) }}</span>
        </div>
      </div>
      <div class="form-group">
        <label>时间：</label>
        <input v-model="form.date" type="date" />
      </div>
      <div class="form-group">
        <label>图片：</label>
        <input type="file" multiple @change="handleFileChange" />
      </div>
      <div class="form-actions">
        <button type="submit">发布</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/composables/useApi'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = ref({
  type: 'lost',
  title: '',
  description: '',
  date: '',
  coordinates: null
})
const images = ref([])

const handleFileChange = (e) => {
  images.value = Array.from(e.target.files)
}

const handleSubmit = async () => {
  const formData = new FormData()
  Object.entries(form.value).forEach(([key, val]) => {
    if (key === 'coordinates' && val) {
      formData.append('coordinates', JSON.stringify(val))
    } else {
      formData.append(key, val)
    }
  })
  images.value.forEach(file => formData.append('images', file))
  try {
    await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    router.push('/posts')
  } catch (e) {
    // 可以保留错误提示
    // 例如：alert('发帖失败') 或错误提示UI
  }
}

const goToCreate = () => {
  alert('goToCreate 被触发')
  router.push('/posts/create')
}

const goToMapSelect = () => {
  // 跳转前缓存表单内容
  localStorage.setItem('postCreateFormCache', JSON.stringify(form.value))
  router.push({ path: '/', query: { mode: 'add', from: 'post-create' } })
}

onMounted(() => {
  // 恢复表单内容（跳过coordinates）
  const cacheStr = localStorage.getItem('postCreateFormCache')
  if (cacheStr) {
    try {
      const cache = JSON.parse(cacheStr)
      Object.entries(cache).forEach(([key, val]) => {
        if (key !== 'coordinates') form.value[key] = val
      })
    } catch {}
    localStorage.removeItem('postCreateFormCache')
  }
  // 恢复坐标（优先用地图选点的）
  const coordStr = localStorage.getItem('postCreateCoordinates')
  if (coordStr) {
    try {
      form.value.coordinates = JSON.parse(coordStr)
    } catch {}
    localStorage.removeItem('postCreateCoordinates')
  }
})
</script>

<style scoped>
.post-form-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.post-form-container h1 {
  margin-bottom: 24px;
  font-size: 22px;
  text-align: center;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
}
.form-group textarea {
  resize: vertical;
}
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}
button[type="submit"] {
  background: #42b983;
  color: #fff;
  border: none;
  padding: 8px 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button[type="button"] {
  background: #eee;
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
@media (max-width: 600px) {
  .post-form-container {
    padding: 10px;
  }
  .form-group input,
  .form-group textarea,
  .form-group select {
    font-size: 14px;
    padding: 6px;
  }
  button[type="submit"], button[type="button"] {
    font-size: 15px;
    padding: 8px 10px;
  }
}
</style>
