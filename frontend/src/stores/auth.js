import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // 增强版安全读取方法
  const getSafeLocalStorage = (key) => {
    try {
      const item = localStorage.getItem(key)
      // 显式排除 undefined/null/空字符串
      if (item === null || item === 'undefined' || item === 'null' || item === '') {
        localStorage.removeItem(key) // 自动清理无效数据
        return null
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`解析 localStorage ${key} 失败:`, error)
      localStorage.removeItem(key) // 解析失败时清理数据
      return null
    }
  }

  // 初始化状态（添加类型提示）
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(getSafeLocalStorage('user'))

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // 增强版持久化方法
  const persistAuth = () => {
    try {
      // 条件性存储，避免存储无效值
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
      // 存储失败时清理所有认证数据
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // API 请求方法（添加请求取消功能）
  const apiRequest = async (url, data) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/${url}`, data)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error(`认证请求失败 (${url}):`, errorMessage)
      throw new Error(errorMessage)
    }
  }

  // 用户注册
  const register = async (formData) => {
    const data = await apiRequest('register', formData)
    token.value = data.token
    user.value = data.user
    persistAuth()
    return data
  }

  // 用户登录
  const login = async (credentials) => {
    const data = await apiRequest('login', {
      email: credentials.email.toLowerCase().trim(), // 邮箱标准化
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
    persistAuth() // 使用统一的持久化方法
  }

  // 手动设置 Token（用于特殊场景）
  const setToken = (newToken) => {
    token.value = newToken
    persistAuth() // 使用统一的持久化方法
  }

  // 手动设置用户数据
  const setUser = (userData) => {
    user.value = userData
    persistAuth() // 使用统一的持久化方法
  }

  // 初始化方法（应用启动时调用）
  const initialize = () => {
    token.value = localStorage.getItem('token')
    user.value = getSafeLocalStorage('user')
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
    initialize
  }
})