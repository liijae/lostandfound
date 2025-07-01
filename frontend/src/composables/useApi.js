import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // 根据你的后端地址修改
  timeout: 5000
})

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api