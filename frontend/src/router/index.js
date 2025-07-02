import { createRouter, createWebHistory } from 'vue-router'
import { setupAuthGuard } from './authGuard'

// 静态导入（适合核心页面）
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

// 动态导入（懒加载，优化性能）
const PostListView = () => import('../views/PostListView.vue')
const PostCreateView = () => import('../views/PostCreateView.vue')
const ProfileView = () => import('../views/ProfileView.vue')
const PostEditView = () => import('../views/PostEditView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/posts',
    name: 'posts',
    component: PostListView
  },
  {
    path: '/posts/create',
    name: 'post-create',
    component: PostCreateView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/edit/:id',
    name: 'post-edit',
    component: PostEditView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// 设置路由守卫
setupAuthGuard(router)

export default router