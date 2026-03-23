<template>
  <div class="admin-container">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div class="brand-text">
            <h1>管理后台</h1>
            <span>Admin Panel</span>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeTab === item.id }"
          @click="switchTab(item.id)"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="back-btn" @click="goHome">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          返回首页
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="main-header">
        <div class="header-left">
          <h2>{{ currentTabTitle }}</h2>
          <p>{{ currentTabDesc }}</p>
        </div>
        <div class="header-right">
          <div class="quick-stats">
            <div class="stat-item">
              <span class="stat-value">{{ stats.totalUsers }}</span>
              <span class="stat-label">用户</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.totalProblems }}</span>
              <span class="stat-label">题目</span>
            </div>
            <div class="stat-item online">
              <span class="stat-dot"></span>
              <span class="stat-value">{{ stats.onlineUsers }}</span>
              <span class="stat-label">在线</span>
            </div>
          </div>
        </div>
      </header>

      <div class="main-content">
        <transition name="fade" mode="out-in">
          <component
            :is="currentComponent"
            :key="activeTab"
            v-bind="currentComponentProps"
          />
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStatistics } from '@/api/modules/question/subject'
import UserManagement from '@/pages/admin/components/UserManagement.vue'
import CategoryManagement from '@/pages/admin/components/CategoryManagement.vue'
import TagManagement from '@/pages/admin/components/TagManagement.vue'
import SubjectManagement from '@/pages/admin/components/SubjectManagement.vue'
import Statistics from '@/pages/admin/components/Statistics.vue'
import BlogStatistics from '@/pages/admin/components/BlogStatistics.vue'
import NoticeManagement from '@/pages/admin/components/NoticeManagement.vue'
import RoleTemplateManagement from '@/pages/admin/components/RoleTemplateManagement.vue'

const router = useRouter()

const activeTab = ref('users')

const loadedTabs = reactive({
  users: true,
  categories: false,
  tags: false,
  problems: false,
  notices: false,
  roleTemplates: false,
  statistics: false,
  blogStatistics: false
})

const userSearch = ref('')
const categorySearch = ref('')
const problemSearch = ref('')

const showAddUserDialog = ref(false)
const showAddCategoryDialog = ref(false)
const showAddProblemDialog = ref(false)

const editingUser = ref(null)
const editingCategory = ref(null)
const editingProblem = ref(null)

const userForm = reactive({
  id: null,
  userName: '',
  nickName: '',
  email: '',
  phone: '',
  status: 0
})

const categoryForm = reactive({
  id: null,
  name: '',
  description: ''
})

const problemForm = reactive({
  id: null,
  title: '',
  description: '',
  category: '',
  difficulty: '简单'
})

const users = ref([])

const categories = ref([])

const problems = ref([])

const stats = ref({
  totalUsers: 0,
  totalProblems: 0,
  onlineUsers: 0,
  totalSubmissions: 0
})

let statsRefreshTimer = null

const navItems = [
  {
    id: 'users',
    label: '用户管理',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: 9, cy: 7, r: 4 }),
      h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
      h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ])
  },
  {
    id: 'categories',
    label: '分类管理',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
    ])
  },
  {
    id: 'tags',
    label: '标签管理',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }),
      h('line', { x1: 7, y1: 7, x2: '7.01', y2: 7 })
    ])
  },
  {
    id: 'problems',
    label: '题目管理',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
      h('line', { x1: 16, y1: 17, x2: 8, y2: 17 })
    ])
  },
  {
    id: 'roleTemplates',
    label: '角色模板',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5z' }),
      h('path', { d: 'M4 22c0-3.31 3.58-6 8-6s8 2.69 8 6' }),
      h('path', { d: 'M19 8h3' }),
      h('path', { d: 'M20.5 6.5v3' })
    ])
  },
  {
    id: 'notices',
    label: '公告管理',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17c0 .53-.21 1.04-.59 1.41L4 17h5' }),
      h('path', { d: 'M10 17a2 2 0 0 0 4 0' })
    ])
  },
  {
    id: 'blogStatistics',
    label: '博客统计',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
      h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' })
    ])
  },
  {
    id: 'statistics',
    label: '数据统计',
    icon: h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
      h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
      h('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
    ])
  }
]

const tabTitles = {
  users: { title: '用户管理', desc: '管理系统用户账户和权限' },
  categories: { title: '分类管理', desc: '管理题目分类和层级结构' },
  tags: { title: '标签管理', desc: '管理题目标签和关键词' },
  problems: { title: '题目管理', desc: '管理题库内容和信息' },
  roleTemplates: { title: '角色模板管理', desc: '管理角色对话的人设、提示词和变量配置' },
  notices: { title: '公告管理', desc: '管理首页公告、弹窗策略和过期时间' },
  blogStatistics: { title: '博客统计', desc: '查看文章表现与后台管理动作的真实数据' },
  statistics: { title: '数据统计', desc: '查看系统运营数据和趋势' }
}

const currentTabTitle = computed(() => tabTitles[activeTab.value]?.title || '')
const currentTabDesc = computed(() => tabTitles[activeTab.value]?.desc || '')

const currentComponent = computed(() => {
  const components = {
    users: UserManagement,
    categories: CategoryManagement,
    tags: TagManagement,
    problems: SubjectManagement,
    roleTemplates: RoleTemplateManagement,
    notices: NoticeManagement,
    blogStatistics: BlogStatistics,
    statistics: Statistics
  }
  return components[activeTab.value]
})

const currentComponentProps = computed(() => {
  const propsMap = {
    users: {
      userSearch: userSearch.value,
      showAddUserDialog: showAddUserDialog.value,
      editingUser: editingUser.value,
      userForm: userForm,
      users: users.value
    },
    categories: {
      searchKeyword: categorySearch.value,
      showAddCategoryDialog: showAddCategoryDialog.value,
      editingCategory: editingCategory.value,
      categoryForm: categoryForm,
      categories: categories.value
    },
    tags: {},
    problems: {
      problemSearch: problemSearch.value,
      showAddProblemDialog: showAddProblemDialog.value,
      editingProblem: editingProblem.value,
      problemForm: problemForm,
      problems: problems.value
    },
    statistics: {
      stats: stats.value
    }
  }
  return propsMap[activeTab.value] || {}
})

const switchTab = (tabId) => {
  activeTab.value = tabId
  loadedTabs[tabId] = true
}

/**
 * 拉取后台头部统计卡片的真实数据。
 * @param {boolean} silent 是否静默刷新
 * @return {Promise<void>}
 */
const fetchAdminStats = async (silent = false) => {
  try {
    const res = await getStatistics()
    const isSuccess = res?.code === 200 || res?.success

    if (!isSuccess) {
      if (!silent) {
        ElMessage.error(res?.message || '获取后台统计数据失败')
      }
      return
    }

    stats.value = {
      totalUsers: Number(res?.data?.totalUsers || 0),
      totalProblems: Number(res?.data?.totalProblems || 0),
      onlineUsers: Number(res?.data?.onlineUsers || 0),
      totalSubmissions: Number(res?.data?.totalSubmissions || 0)
    }
  } catch (error) {
    console.error('获取后台统计数据失败:', error)
    if (!silent) {
      ElMessage.error('获取后台统计数据失败')
    }
  }
}

const goHome = () => {
  router.push('/home')
}

onMounted(() => {
  fetchAdminStats()
  statsRefreshTimer = window.setInterval(() => fetchAdminStats(true), 60000)
})

onUnmounted(() => {
  if (statsRefreshTimer) {
    window.clearInterval(statsRefreshTimer)
    statsRefreshTimer = null
  }
})
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.admin-sidebar {
  width: 280px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.brand-text h1 {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.brand-text span {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
  color: white;
  box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.3);
}

.nav-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.admin-main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left h2 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.header-left p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.quick-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item.online {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}

.stat-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    width: 80px;
  }

  .brand-text,
  .nav-item span,
  .nav-badge {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 14px;
  }

  .back-btn span {
    display: none;
  }

  .back-btn {
    justify-content: center;
  }

  .admin-main {
    margin-left: 80px;
  }

  .quick-stats {
    display: none;
  }
}
</style>
