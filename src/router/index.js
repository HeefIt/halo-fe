import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import Home from '@/pages/home/HomePage.vue'

/**
 * 前端界面路由跳转
 * @type {[{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},{path: string, component: (function(): Promise<{}>), meta: {requiresAuth: boolean}, name: string},null,null]}
 */
const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/pages/landing/LandingPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/home/questions',
    name: 'QuestionBank',
    component: () => import('@/pages/question-bank/QuestionBankPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/practice/:id?',
    name: 'Practice',
    component: () => import('@/pages/practice/PracticePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/profile/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/pages/admin/AdminPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/study-plan',
    name: 'StudyPlan',
    component: () => import('@/pages/study-plan/StudyPlanPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/study-plan/:id',
    name: 'StudyPlanDetail',
    component: () => import('@/pages/study-plan/StudyPlanDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/pages/ranking/RankingPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ranking/:id',
    name: 'RankingDetail',
    component: () => import('@/pages/ranking/RankingDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/practice-history',
    name: 'PracticeHistory',
    component: () => import('@/pages/practice-history/PracticeHistoryPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/practice-history/:id',
    name: 'PracticeHistoryDetail',
    component: () => import('@/pages/practice-history/PracticeHistoryDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/chatbot',
    name: 'ChatBot',
    component: () => import('@/pages/ai/ChatPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/practice-assistant',
    name: 'PracticeAssistant',
    component: () => import('@/pages/ai/PracticeAssistantPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/customer-service',
    name: 'CustomerService',
    component: () => import('@/pages/ai/CustomerServicePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/multimodal',
    name: 'MultimodalParser',
    component: () => import('@/pages/ai/MultimodalParserPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/blog',
    name: 'BlogHome',
    component: () => import('@/pages/blog/BlogHomePage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/blog/list',
    name: 'BlogList',
    component: () => import('@/pages/blog/BlogListPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/blog/article/:id',
    name: 'BlogDetail',
    component: () => import('@/pages/blog/BlogDetailPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/blog/write',
    name: 'BlogWrite',
    component: () => import('@/pages/blog/BlogWritePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/blog/edit/:id',
    name: 'BlogEdit',
    component: () => import('@/pages/blog/BlogWritePage.vue'),
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
      // 基于后端返回的角色标识判断管理员身份，避免用户名硬编码误判。
      const isAdmin = userStore.isAdmin
      
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
  if (userStore.isLoggedIn && (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password')) {
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
