<template>
  <div class="edit-container">
    <h1>编辑帖子</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>标题</label>
          <input v-model="form.title" type="text" required />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="form.description" rows="4"></textarea>
        </div>
        <div class="form-group">
          <label>地点</label>
          <input v-model="form.location" type="text" required />
        </div>
        <div class="form-group">
          <label>联系方式</label>
          <input v-model="form.contact" type="text" />
        </div>
        <!-- 可选：图片编辑，暂不支持图片上传，仅显示已有图片 -->
        <div class="form-group" v-if="form.images && form.images.length">
          <label>已上传图片</label>
          <div class="edit-images">
            <img v-for="(img, idx) in form.images" :key="idx" :src="img" />
          </div>
        </div>
        <button type="submit">保存修改</button>
        <button type="button" @click="goBack">取消</button>
      </form>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const loading = ref(true)
const error = ref('')
const form = ref({
  title: '',
  description: '',
  location: '',
  contact: '',
  images: []
})

const fetchPost = async () => {
  try {
    loading.value = true
    const res = await api.get(`/posts/${id}`)
    Object.assign(form.value, res.data)
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    const allowed = ['title', 'description', 'location', 'status', 'images', 'contact'];
    const data = {};
    allowed.forEach(key => {
      if (form.value[key] !== undefined) data[key] = form.value[key];
    });
    await api.patch(`/posts/${id}`, data);
    router.push('/profile');
  } catch (err) {
    error.value = err.response?.data?.message || err.message;
  }
}

const goBack = () => {
  router.push('/profile')
}

onMounted(fetchPost)
</script>

<style scoped>
.edit-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.edit-container h1 {
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
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
}
.edit-images {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.edit-images img {
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}
button[type="submit"] {
  background: #42b983;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}
button[type="button"] {
  background: #eee;
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.loading {
  text-align: center;
  color: #888;
  margin: 30px 0;
}
.error {
  color: #e74c3c;
  margin-top: 16px;
  text-align: center;
}
</style>