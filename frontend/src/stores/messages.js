import { defineStore } from 'pinia'
import api from '@/composables/useApi'
import { useAuthStore } from './auth'

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    unreadCount: 0,
    messages: []
  }),
  actions: {
    async fetchUnreadCount() {
      try {
        const res = await api.getUnreadCount()
        this.unreadCount = res.data.count
      } catch (e) {
        this.unreadCount = 0
      }
    },
    async fetchMessages() {
      try {
        const res = await api.getMyMessages()
        this.messages = res.data
      } catch (e) {
        this.messages = []
      }
    }
  }
}) 