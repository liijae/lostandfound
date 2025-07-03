# 校园失物招领平台 Campus Lost & Found Platform

## 项目简介 Project Introduction

本项目是一个基于 **Node.js (Express) + MongoDB + Vue3 (Vite)** 的前后端分离校园失物招领系统，支持信息发布、智能匹配推送、地图点位、消息中心等功能，适用于高校等场景的失物招领管理。

This project is a full-stack campus lost & found platform based on **Node.js (Express), MongoDB, and Vue3 (Vite)**. It supports item posting, smart matching & notification, map point management, message center, and more. Suitable for universities and similar scenarios.

---

## 技术栈 Tech Stack

- **前端 Frontend**：Vue3 + Vite + Pinia + Vue Router + 原生 CSS
- **后端 Backend**：Node.js + Express + MongoDB (Mongoose)
- **通信 Communication**：RESTful API, JWT 认证
- **地图 Map**：自定义图片地图 + 坐标点位

---

## 主要功能 Main Features

- 用户注册/登录（JWT 认证）
- 信息发布（失物/招领，支持图片、地图选点、时间等）
- 信息展示墙（卡片流、搜索、筛选、排序）
- 智能匹配与推送（基于关键词、时间、坐标范围）
- 校园地图点位管理（可视化选点、编辑、删除）
- 消息中心（系统推送、私信）
- 个人中心（管理我的帖子、消息、标记已找回）
- 权限控制（未登录仅浏览，登录后可发帖、编辑、聊天）

---

## 目录结构 Directory Structure

### 前端 Frontend

```
src/
├── assets/                # 静态资源（图片、SVG等）
├── components/            # 公共组件
│   ├── PostCard.vue       # 帖子卡片
│   ├── PostItem.vue       # 我的帖子/列表项
│   ├── NavBar.vue         # 顶部导航栏
│   └── HelloWorld.vue     # 示例组件
├── composables/           # 组合式函数
│   └── useApi.js          # API 封装与请求
├── router/                # 路由配置
│   ├── index.js           # 路由表
│   └── authGuard.js       # 路由守卫（鉴权）
├── stores/                # Pinia 状态管理
│   ├── auth.js            # 用户认证状态
│   ├── posts.js           # 帖子数据状态
│   ├── messages.js        # 消息数据状态
│   └── lostAndFound.js    # 失物招领相关状态
├── views/                 # 页面组件
│   ├── CampusMap.vue      # 校园地图页
│   ├── ChatView.vue       # 聊天页面
│   ├── LoginView.vue      # 登录页
│   ├── RegisterView.vue   # 注册页
│   ├── PostListView.vue   # 帖子列表页
│   ├── PostCreateView.vue # 创建帖子页
│   ├── PostEditView.vue   # 编辑帖子页
│   ├── ProfileView.vue    # 个人中心
│   └── ...                # 其他页面
├── App.vue                # 根组件
├── main.js                # 前端主入口
└── style.css              # 全局样式
```

### 后端 Backend

```
后端根目录/
├── config/
│   └── db.js              # 数据库连接配置
├── controllers/           # 业务控制器
│   ├── authController.js  # 用户认证相关
│   ├── postController.js  # 帖子相关（发帖、匹配、推送等）
│   └── messageController.js # 消息相关
├── middlewares/           # 中间件
│   ├── authMiddleware.js  # JWT 鉴权
│   └── uploadMiddleware.js # 图片上传
├── models/                # Mongoose 数据模型
│   ├── User.js            # 用户模型
│   ├── Post.js            # 帖子模型
│   └── Message.js         # 消息模型
├── routes/                # 路由定义
│   ├── authRoutes.js      # 用户相关路由
│   ├── postRoutes.js      # 帖子相关路由
│   └── messageRoutes.js   # 消息相关路由
├── uploads/               # 图片上传存储目录
│   └── posts/             # 帖子图片
├── migrate_location_to_coordinates.js # 旧数据迁移脚本
├── server.js              # Express 主服务入口
├── package.json           # 依赖与脚本管理
└── ...                    # 其他文件
```

---

## 部署与运行 Run & Deploy

### 1. 克隆项目 Clone the repo

```bash
git clone <your-repo-url>
cd lostandfound
```

### 2. 安装依赖 Install dependencies

#### 后端 Backend

```bash
npm install
```

#### 前端 Frontend

```bash
cd frontend
npm install
```

### 3. 配置数据库 Configure MongoDB

- 修改 `config/db.js`，设置你的 MongoDB 连接地址。

### 4. 启动服务 Start the server

#### 后端 Backend

```bash
npm run dev
```

#### 前端 Frontend

```bash
cd frontend
npm run dev
```

- 前端默认端口：`5173`
- 后端默认端口：`5000`

### 5. 访问 Access

- 前端：http://localhost:5173
- 后端 API：http://localhost:5000/api

---如果想要同一个子网内的人访问 需改ip地址为自己的ipv4地址：
后端 CORS 白名单（server.js）：加上你的局域网IP。
前端 Vite 代理（frontend/vite.config.js）：target 改为你的后端IP。
前端 API 基础地址（frontend/.env）：VITE_API_BASE_URL 改为你的后端IP。
前端图片访问 BASE_URL（PostCard.vue）

## 其他说明 Other Notes

- 图片上传存储在服务器本地 `/uploads/posts/`，数据库仅存图片路径。
- 地图点位基于图片坐标，支持自定义区域判定。
- 智能匹配推送基于关键词、时间、坐标范围，自动推送系统消息。
- 支持局域网多端访问，适合团队协作和实际部署。

---

## 贡献与反馈 Contributing & Feedback
ljy 后端+前端（失物招领、个人中心、实时通信与匹配） dxt 首页地图功能实现（相关前后端） dzm 测试 zsj 界面美观优化 

欢迎提出 Issue 或 Pull Request，或联系开发团队交流改进建议！
