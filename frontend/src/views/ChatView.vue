<template>
  <div class="chat-container">
    <div class="chat-header">
      <router-link to="/profile" class="back">← 返回</router-link>
      <span>与 {{ otherUsername }} 的私信</span>
    </div>
    <div class="chat-messages" ref="msgListRef">
      <div v-for="msg in messages" :key="msg._id">
        <div v-if="msg.type === 'system'" class="chat-msg system-message">
          <router-link
            v-if="msg.matchedPost"
            :to="`/posts?highlight=${msg.matchedPost}`"
            class="system-link"
            style="text-decoration: underline; color: #42b983;"
          >
            [系统推送] {{ msg.content }}
          </router-link>
          <span v-else>
            [系统推送] {{ msg.content }}
          </span>
          <div class="msg-time">{{ formatTime(msg.createdAt) }}</div>
        </div>
        <div v-else :class="['chat-msg', String(msg.from._id) === myId ? 'me' : 'other']">
          <div class="msg-content">{{ msg.content }}</div>
          <div class="msg-time">{{ formatTime(msg.createdAt) }}</div>
        </div>
      </div>
    </div>
    <form class="chat-input" @submit.prevent="handleSend">
      <input v-model="input" placeholder="输入消息..." autocomplete="off" />
      <button type="submit" :disabled="!input.trim()">发送</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/useApi'
import { format } from 'date-fns'
import { useMessagesStore } from '@/stores/messages'

const route = useRoute()
const authStore = useAuthStore()
const myId = String(authStore.user?._id)
const otherId = String(route.params.userId)
const messages = ref([])
const input = ref('')
const otherUsername = ref('')
const msgListRef = ref(null)
const messageStore = useMessagesStore()
let timer = null

const fetchMessages = async () => {
  const res = await api.getMessagesWithUser(otherId)
  messages.value = res.data
  // 获取对方用户名
  if (otherId === myId) {
    otherUsername.value = '我'
  } else if (messages.value.length) {
    let found = false
    for (const msg of messages.value) {
      if (msg.from && String(msg.from._id) === otherId && msg.from.username) {
        otherUsername.value = msg.from.username
        found = true
        break
      }
      if (msg.to && String(msg.to._id) === otherId && msg.to.username) {
        otherUsername.value = msg.to.username
        found = true
        break
      }
    }
    if (!found) {
      otherUsername.value = '对方'
    }
  } else {
    otherUsername.value = ''
  }
  await nextTick()
  scrollToBottom()
}

const handleSend = async () => {
  if (!input.value.trim()) return
  await api.sendMessage(otherId, input.value)
  input.value = ''
  await fetchMessages()
}

const formatTime = (date) => format(new Date(date), 'MM-dd HH:mm')

const scrollToBottom = () => {
  if (msgListRef.value) {
    msgListRef.value.scrollTop = msgListRef.value.scrollHeight
  }
}

const markAsRead = async () => {
  await api.markAsRead(otherId)
  await messageStore.fetchUnreadCount()
}

onMounted(async () => {
  await markAsRead()
  await fetchMessages()
  timer = setInterval(async () => {
    await fetchMessages()
    await markAsRead()
  }, 3000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 30px auto;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 70vh;
}
.chat-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}
.back {
  color: #42b983;
  text-decoration: none;
  margin-right: 10px;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9f9f9;
}
.chat-msg {
  margin-bottom: 12px;
  max-width: 70%;
  word-break: break-all;
}
.chat-msg.me {
  align-self: flex-end;
  background: #e6f7ff;
  border-radius: 8px 8px 2px 8px;
  padding: 8px 12px;
  margin-left: auto;
}
.chat-msg.other {
  align-self: flex-start;
  background: #f0f0f0;
  border-radius: 8px 8px 8px 2px;
  padding: 8px 12px;
  margin-right: auto;
}
.msg-content {
  font-size: 15px;
}
.msg-time {
  font-size: 12px;
  color: #aaa;
  margin-top: 2px;
  text-align: right;
}
.chat-input {
  display: flex;
  border-top: 1px solid #eee;
  padding: 10px;
  background: #fafafa;
}
.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
}
.chat-input button {
  padding: 8px 16px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.system-message {
  background: #f5f5f5;
  color: #888;
  text-align: center;
  border-radius: 8px;
  margin: 8px 0;
  font-size: 14px;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  padding: 8px 12px;
}
.system-link {
  cursor: pointer;
  color: #42b983;
  text-decoration: underline;
}
</style> 