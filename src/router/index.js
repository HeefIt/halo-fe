import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

/**
 * 前端界面路由跳转
 * @type {[{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},null,null]}
 */
const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/Landing.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/modules/user/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/modules/user/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/home/questions',
    name: 'QuestionBank',
    component: () => import('@/views/modules/questionBank/QuestionBank.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/practice/:id?',
    name: 'Practice',
    component: () => import('@/views/Practice.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/modules/user/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/study-plan',
    name: 'StudyPlan',
    component: () => import('@/views/modules/studyPlan/StudyPlan.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/study-plan/:id',
    name: 'StudyPlanDetail',
    component: () => import('@/views/modules/studyPlan/StudyPlanDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/views/modules/ranking/Ranking.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ranking/:id',
    name: 'RankingDetail',
    component: () => import('@/views/modules/ranking/RankingDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/practice-history',
    name: 'PracticeHistory',
    component: () => import('@/views/modules/practiceHistory/PracticeHistory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/practice-history/:id',
    name: 'PracticeHistoryDetail',
    component: () => import('@/views/modules/practiceHistory/PracticeDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/chatbot',
    name: 'ChatBot',
    component: () => import('@/views/modules/ai/ChatBot.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/practice-assistant',
    name: 'PracticeAssistant',
    component: () => import('@/views/modules/ai/PracticeAssistant.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/customer-service',
    name: 'CustomerService',
    component: () => import('@/views/modules/ai/CustomerService.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/multimodal',
    name: 'MultimodalParser',
    component: () => import('@/views/modules/ai/MultimodalParser.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // 如果用户尚未初始化，则初始化用户状态
    if (!userStore.isLoggedIn) {
      const token = localStorage.getItem('halo_token')
      if (token) {
        // 尝试初始化用户信息
        await userStore.initUser()
      }
      
      // 再次检查用户是否已登录
      if (!userStore.isLoggedIn) {
        next('/login')
        return
      }
    }
    
    // 检查管理员权限
    if (to.path === '/admin') {
      // 基于username判断是否为管理员
      const userName = userStore.userInfo?.userName || ''
      const isAdmin = userName.toLowerCase().includes('admin')
      
      if (isAdmin) {
        next()
        return
      } else {
        // 非管理员用户重定向到首页
        next('/home')
        return
      }
    }
  }
  
  // 如果已登录访问登录页，重定向到首页
  if (userStore.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/home')
    return
  }
  
  // 如果访问根路径，根据登录状态重定向
  if (to.path === '/') {
    if (userStore.isLoggedIn) {
      next('/home')
    } else {
      next()
    }
    return
  }
  
  next()
})

export default router