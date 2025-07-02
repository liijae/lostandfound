import axios from 'axios'

console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL); // 临时调试

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 50000
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