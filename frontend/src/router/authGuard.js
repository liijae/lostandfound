import { useAuthStore } from '@/stores/auth'

export const setupAuthGuard = (router) => {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    
    // 等待初始化完成
    await authStore.initialize()
    
    // 需要登录但未认证
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath }
      }
    }
    
    // 需要访客但已登录
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      return { name: 'home' }
    }
  })
}