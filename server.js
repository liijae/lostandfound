require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose'); // 需要添加这行
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require('./routes/messageRoutes');
const app = express();

// 数据库连接
connectDB();

// ============ 中间件配置 ============
const allowedOrigins = [
  'http://localhost:5173',
  'http://10.122.193.212:5173',       // 添加您的本地IP
  'http://<其他子网设备IP>:5173'     // 可选：添加其他子网设备IP
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 请求体解析
app.use(express.json())
// 使用路由
// app.use('/api', routes); // 已删除

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});


// ============ 路由配置 ============
// 测试端点
app.get('/api/healthcheck', (req, res) => {
  res.json({ 
    status: 'running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

const path = require('path');

// 添加静态文件服务（在路由配置之前）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 业务路由
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/messages', messageRoutes)


// ============ 增强的错误处理 ============
app.use((err, req, res, next) => {
  console.error('全局错误捕获:', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(500).json({ 
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});



// ============ 错误处理 ============
// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'API端点不存在' })
})

// ============ 启动服务器 ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ==================================
  🚀 服务器运行中
  📡 本机访问: http://localhost:${PORT}
  🌐 子网访问: http://10.122.193.212:${PORT}
  ==================================
  `);
});