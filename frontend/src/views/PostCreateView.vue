<template>
  <div class="create-post-container">
    <h2>发布新帖</h2>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <label>类型：</label>
      <select v-model="form.type" required>
        <option value="lost">寻物启事</option>
        <option value="found">失物招领</option>
      </select>
      <label>标题：</label>
      <input v-model="form.title" required />
      <label>描述：</label>
      <textarea v-model="form.description" />
      <label>地点：</label>
      <input v-model="form.location" required />
      <label>时间：</label>
      <input v-model="form.date" type="date" />
      <label>图片：</label>
      <input type="file" multiple @change="handleFileChange" />
      <label>联系方式：</label>
      <input v-model="form.contact" />
      <button type="submit">发布</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/composables/useApi'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = ref({
  type: 'lost',
  title: '',
  description: '',
  location: '',
  date: '',
  contact: ''
})
const images = ref([])

const handleFileChange = (e) => {
  images.value = Array.from(e.target.files)
}

const handleSubmit = async () => {
  const formData = new FormData()
  Object.entries(form.value).forEach(([key, val]) => formData.append(key, val))
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
</script>
