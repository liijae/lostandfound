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

api.getConversations = () => api.get('/messages')
api.getMessagesWithUser = (userId) => api.get(`/messages/with/${userId}`)
api.sendMessage = (to, content) => api.post('/messages', { to, content })
api.getUnreadCount = () => api.get('/messages/unread/count')
api.getConversationsWithUnread = () => api.get('/messages/with-unread')
api.markAsRead = (userId) => api.post(`/messages/read/${userId}`)

export default api