import { defineStore } from 'pinia'
import api from '@/composables/useApi'
import { useAuthStore } from './auth'

export const useMessageStore = defineStore('messages', {
  state: () => ({
    unreadCount: 0
  }),
  actions: {
    async fetchUnreadCount() {
      try {
        const res = await api.getUnreadCount()
        this.unreadCount = res.data.count
      } catch (e) {
        this.unreadCount = 0
      }
    }
  }
}) 