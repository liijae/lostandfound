// 完全独立的测试文件
const express = require('express')
const app = express()
const port = 6001

// 基础中间件
app.use(express.json())

// 直接定义路由（跳过所有模块系统）
app.post('/api/auth/direct', (req, res) => {
  console.log("直接路由被调用！", req.body)
  res.json({ success: true })
})

// 通配路由处理
app.use((req, res) => {
  console.log("未处理的路由:", req.method, req.url)
  res.status(404).json({ error: "路由不存在" })
})

app.listen(port, () => {
  console.log(`测试服务器运行在 http://localhost:${port}`)
  console.log("尝试访问 POST /api/auth/direct")
})