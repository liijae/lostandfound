import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  // 安全读取localStorage
  const getSafeLocalStorage = (key) => {
    try {
      const item = localStorage.getItem(key)
      if (item === null || item === 'undefined' || item === 'null' || item === '') {
        localStorage.removeItem(key)
        return null
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`解析 localStorage ${key} 失败:`, error)
      localStorage.removeItem(key)
      return null
    }
  }

  // 状态
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(getSafeLocalStorage('user'))

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // 持久化方法
  const persistAuth = () => {
    try {
      if (token.value) {
        localStorage.setItem('token', token.value)
      } else {
        localStorage.removeItem('token')
      }

      if (user.value) {
        localStorage.setItem('user', JSON.stringify(user.value))
      } else {
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('保存认证状态失败:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // API请求封装
  const apiRequest = async (url, data) => {
    try {
      const response = await api.post(`/${url}`, data)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error(`认证请求失败 (${url}):`, errorMessage)
      throw new Error(errorMessage)
    }
  }

  // 用户注册
  const register = async (formData) => {
    const data = await apiRequest('auth/register', formData)
    token.value = data.token
    user.value = data.user
    persistAuth()
    return data
  }

  // 用户登录
  const login = async (credentials) => {
    const data = await apiRequest('auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    })
    token.value = data.token
    user.value = data.user
    persistAuth()
    return data
  }

  // 用户登出
  const logout = () => {
    token.value = null
    user.value = null
    persistAuth()
  }

  // 设置Token
  const setToken = (newToken) => {
    token.value = newToken
    persistAuth()
  }

  // 设置用户数据
  const setUser = (userData) => {
    user.value = userData
    persistAuth()
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data.user)
      return response.data.user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
      throw error
    }
  }

  // 初始化方法（异步）
  const initialize = async () => {
    token.value = localStorage.getItem('token')
    user.value = getSafeLocalStorage('user')
    
    if (token.value && !user.value) {
      await fetchUserProfile()
    }
    
    console.debug('AuthStore 初始化完成', { 
      isAuthenticated: isAuthenticated.value 
    })
  }

  return { 
    token, 
    user, 
    isAuthenticated, 
    register,
    login,
    logout,
    setToken,
    setUser,
    initialize,
    fetchUserProfile
  }
})