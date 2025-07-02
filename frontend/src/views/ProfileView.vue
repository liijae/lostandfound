<template>
  <div class="profile-container">
    <h1>个人中心</h1>
    
    <div class="profile-header">
      <!-- <div class="avatar">
        <img :src="userAvatar" alt="用户头像">
      </div> -->
      <div class="user-info">
        <h2>{{ authStore.user?.username || '未登录用户' }}</h2>
        <p>注册时间：{{ formatDate(authStore.user?.createdAt) }}</p>
      </div>
    </div>

    <div class="tabs">
      <button 
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span v-if="tab.value === 'messages' && messageStore.unreadCount > 0" class="badge">{{ messageStore.unreadCount }}</span>
      </button>
    </div>

    <div class="content">
      <!-- 我的帖子 -->
      <div v-if="activeTab === 'posts'" class="post-list">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="myPosts.length === 0" class="empty">
          <img src="@/assets/empty-post.png" alt="暂无帖子">
          <p>您还没有发布过任何帖子</p>
        </div>
        <div v-else class="posts">
          <PostItem
            v-for="post in myPosts"
            :key="post._id"
            :post="post"
            @edit="handleEditPost"
            @delete="handleDeletePost"
            @mark-found="handleMarkFound"
          />
        </div>
      </div>

      <!-- 我的消息 -->
      <div v-if="activeTab === 'messages'" class="message-list">
        <div v-if="loadingConvs" class="loading">加载中...</div>
        <div v-else-if="conversations.length === 0" class="empty">
          <p>暂无会话</p>
        </div>
        <ul v-else>
          <li v-for="conv in conversations" :key="conv._id">
            <router-link :to="`/chat/${conv.from._id === authStore.user._id ? conv.to._id : conv.from._id}`">
              与 {{ conv.from._id === authStore.user._id ? conv.to.username : conv.from.username }} 的对话
              <span class="msg-preview">{{ conv.content }}</span>
              <span class="msg-time">{{ formatDate(conv.createdAt) }}</span>
              <span v-if="conv.unread > 0" class="badge">{{ conv.unread }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PostItem from '@/components/PostItem.vue'
import api from '@/composables/useApi'
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/messages'

const authStore = useAuthStore()
const activeTab = ref('posts')
const myPosts = ref([])
const loading = ref(false)
const router = useRouter()
const conversations = ref([])
const loadingConvs = ref(false)
const messageStore = useMessageStore()

const tabs = [
  { label: '我的帖子', value: 'posts' },
  { label: '我的消息', value: 'messages' }
]

// 修改获取帖子的方法
const fetchMyPosts = async () => {
  try {
    loading.value = true;
    // 确保传递正确的用户ID
    const res = await api.get('/posts/my-posts', {
      params: { userId: authStore.user?._id }
    });
    myPosts.value = res.data;
  } catch (error) {
    console.error('获取帖子失败:', error);
  } finally {
    loading.value = false;
  }
};

// 添加用户信息检查
onMounted(() => {
  if (!authStore.user) {
    router.push('/login');
  } else {
    fetchMyPosts();
  }
});

// 编辑帖子
const handleEditPost = (postId) => {
  router.push(`/posts/edit/${postId}`);
};

// 删除帖子
const handleDeletePost = async (postId) => {
  if (!confirm('确定要删除这个帖子吗？')) return;
  try {
    await api.delete(`/posts/${postId}`);
    fetchMyPosts();
  } catch (error) {
    fetchMyPosts(); // 404或网络错误时也刷新
    alert('删除失败: ' + (error.response?.data?.message || error.message));
  }
}

// 标记为已找回
const handleMarkFound = async (postId) => {
  try {
    await api.patch(`/posts/${postId}`, { status: 'found' });
    fetchMyPosts();
  } catch (error) {
    alert('标记失败: ' + (error.response?.data?.message || error.message));
  }
};

// 格式化日期
const formatDate = (dateString) => {
  return dateString ? format(new Date(dateString), 'yyyy-MM-dd') : '未知'
}

const fetchConversations = async () => {
  try {
    loadingConvs.value = true
    const res = await api.getConversationsWithUnread()
    conversations.value = res.data
  } catch (e) {
    conversations.value = []
  } finally {
    loadingConvs.value = false
  }
}

watch(activeTab, (val) => {
  if (val === 'messages') fetchConversations()
})

onMounted(fetchMyPosts)
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info h2 {
  margin: 0 0 5px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.tabs button.active {
  color: #42b983;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #42b983;
}

.post-list {
  margin-top: 20px;
}

.empty {
  text-align: center;
  padding: 40px 0;
}

.empty img {
  width: 150px;
  opacity: 0.6;
}

.empty p {
  margin-top: 10px;
  color: #888;
}

.settings {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button[type="submit"] {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-list ul {
  list-style: none;
  padding: 0;
}
.message-list li {
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}
.msg-preview {
  color: #888;
  margin-left: 8px;
}
.msg-time {
  float: right;
  color: #bbb;
  font-size: 12px;
}

.badge {
  background: #ff5b5b;
  color: #fff;
  border-radius: 8px;
  padding: 0 6px;
  font-size: 12px;
  margin-left: 4px;
  position: relative;
  top: -2px;
}
</style>