import { createApp } from 'vue'
import { createPinia } from 'pinia'  // 导入Pinia
import App from './App.vue'
import router from './router'  // 导入已配置好的router实例

// 创建应用实例
const app = createApp(App)

// 初始化Pinia
const pinia = createPinia()
app.use(pinia)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')