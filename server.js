require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
// const routes = require('./routes'); // 已删除

// 路由导入
const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')

// 初始化应用
const app = express()

// 数据库连接
connectDB()

// ============ 中间件配置 ============
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// 请求体解析
app.use(express.json())
// 使用路由
// app.use('/api', routes); // 已删除

// ============ 路由配置 ============
// 测试端点
app.get('/api/healthcheck', (req, res) => {
  res.json({ 
    status: 'running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// 业务路由
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)

// ============ 错误处理 ============
// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'API端点不存在' })
})

// ============ 启动服务器 ============
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`
  ==================================
  🚀 服务器运行在端口 ${PORT}
  📡 访问地址: http://localhost:${PORT}
  ==================================
  `)
})