<template>
  <div class="study-plan-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <div class="header-left">
            <h1 class="page-title">学习计划</h1>
            <p class="page-subtitle">把想学的主题拆成节奏清晰、可持续推进的计划</p>
          </div>
          <button class="create-btn" @click="createPlan">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新建计划
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon stat-icon-total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ studyPlans.length }}</span>
              <span class="stat-label">计划总数</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ activePlansCount }}</span>
              <span class="stat-label">进行中</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-completed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ completedPlansCount }}</span>
              <span class="stat-label">已完成</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-topics">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalTopicsCompleted }}</span>
              <span class="stat-label">已完成主题</span>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-tabs">
            <button 
              v-for="tab in statusTabs" 
              :key="tab.value"
              class="filter-tab"
              :class="{ active: currentStatus === tab.value }"
              @click="currentStatus = tab.value"
            >
              {{ tab.label }}
              <span class="tab-count">{{ getPlanCountByStatus(tab.value) }}</span>
            </button>
          </div>
        </div>

        <div class="plans-grid" v-if="filteredPlans.length > 0">
          <div 
            v-for="plan in filteredPlans" 
            :key="plan.id" 
            class="plan-card"
            :class="`status-${plan.status}`"
            @click="viewPlan(plan)"
          >
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="status-badge" :class="`status-${plan.status}`">
                  <span class="status-dot"></span>
                  {{ getStatusText(plan.status) }}
                </div>
                <div class="card-menu" @click.stop>
                  <button class="menu-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <h3 class="plan-title">{{ plan.title }}</h3>

              <div class="plan-meta">
                <div class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{{ formatDateRange(plan.startDate, plan.endDate) }}</span>
                </div>
                <div class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>{{ plan.totalTopics }} 个主题</span>
                </div>
              </div>

              <div class="progress-section">
                <div class="progress-header">
                  <span class="progress-label">学习进度</span>
                  <span class="progress-value">{{ Math.round((plan.completedTopics / plan.totalTopics) * 100) }}%</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: `${(plan.completedTopics / plan.totalTopics) * 100}%` }"
                  >
                    <div class="progress-shine"></div>
                  </div>
                </div>
                <div class="progress-detail">
                  已完成 {{ plan.completedTopics }} / {{ plan.totalTopics }} 个主题
                </div>
              </div>

              <div class="card-footer">
                <div class="days-info" v-if="plan.status === 2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>剩余 {{ getRemainingDays(plan.endDate) }} 天</span>
                </div>
                <div class="days-info completed" v-else-if="plan.status === 3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>已完成</span>
                </div>
                <div class="days-info pending" v-else>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{{ getDaysUntilStart(plan.startDate) }} 天后开始</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else>
          <div class="empty-illustration">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="url(#emptyGradient)" stroke-width="2" stroke-dasharray="8 4"/>
              <path d="M100 60 L100 100 L130 115" stroke="url(#emptyGradient)" stroke-width="3" stroke-linecap="round"/>
              <circle cx="100" cy="100" r="4" fill="#10b981"/>
              <defs>
                <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#10b981"/>
                  <stop offset="100%" stop-color="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h3 class="empty-title">还没有学习计划</h3>
          <p class="empty-desc">从一个目标主题开始，把接下来几周的节奏排出来。</p>
          <button class="create-btn large" @click="createPlan">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新建学习计划
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/views/components/layout/Header.vue'

const router = useRouter()

const studyPlans = ref([])
const currentStatus = ref('all')

const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 2 },
  { label: '未开始', value: 1 },
  { label: '已完成', value: 3 }
]

const filteredPlans = computed(() => {
  if (currentStatus.value === 'all') {
    return studyPlans.value
  }
  return studyPlans.value.filter(plan => plan.status === currentStatus.value)
})

const activePlansCount = computed(() => {
  return studyPlans.value.filter(plan => plan.status === 2).length
})

const completedPlansCount = computed(() => {
  return studyPlans.value.filter(plan => plan.status === 3).length
})

const totalTopicsCompleted = computed(() => {
  return studyPlans.value.reduce((sum, plan) => sum + plan.completedTopics, 0)
})

const getPlanCountByStatus = (status) => {
  if (status === 'all') return studyPlans.value.length
  return studyPlans.value.filter(plan => plan.status === status).length
}

const getStatusText = (status) => {
  const statusMap = {
    1: '未开始',
    2: '进行中',
    3: '已完成'
  }
  return statusMap[status] || '未知'
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const format = (date) => `${date.getMonth() + 1}/${date.getDate()}`
  return `${format(start)} - ${format(end)}`
}

const getRemainingDays = (endDate) => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

const getDaysUntilStart = (startDate) => {
  const start = new Date(startDate)
  const now = new Date()
  const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

const viewPlan = (plan) => {
  router.push(`/study-plan/${plan.id}`)
}

const createPlan = () => {
  console.log('创建学习计划')
}

const fetchStudyPlans = () => {
  studyPlans.value = [
    {
      id: 1,
      title: '后端基础与 API 设计',
      status: 2,
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      totalTopics: 25,
      completedTopics: 10
    },
    {
      id: 2,
      title: 'Spring 与服务治理',
      status: 1,
      startDate: '2026-01-01',
      endDate: '2026-02-28',
      totalTopics: 18,
      completedTopics: 0
    },
    {
      id: 3,
      title: '数据库建模与性能优化',
      status: 3,
      startDate: '2025-09-01',
      endDate: '2025-10-31',
      totalTopics: 15,
      completedTopics: 15
    },
    {
      id: 4,
      title: '分布式系统实践',
      status: 2,
      startDate: '2025-11-15',
      endDate: '2026-01-15',
      totalTopics: 22,
      completedTopics: 8
    },
    {
      id: 5,
      title: '前端工程协作',
      status: 1,
      startDate: '2026-02-01',
      endDate: '2026-03-31',
      totalTopics: 20,
      completedTopics: 0
    },
    {
      id: 6,
      title: '算法与数据结构进阶',
      status: 2,
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      totalTopics: 30,
      completedTopics: 22
    }
  ]
}

onMounted(() => {
  fetchStudyPlans()
})
</script>

<style scoped>
.study-plan-page {
  min-height: 100vh;
  --page-accent: #0f9f7a;
  --page-accent-deep: #0b7a5d;
  --page-accent-soft: #ecfdf5;
  --page-accent-line: rgba(15, 159, 122, 0.16);
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(6, 182, 212, 0.08), transparent 24%),
    linear-gradient(180deg, #fbfdff 0%, #f4f7fb 100%);
}

.main-content {
  padding: 108px 24px 48px;
}

.container {
  max-width: 1320px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
  letter-spacing: -0.03em;
}

.page-subtitle {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 620px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 16px 30px rgba(99, 102, 241, 0.2);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.24);
}

.create-btn.large {
  padding: 18px 36px;
  font-size: 16px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--page-accent) 0%, rgba(6, 182, 212, 0.7) 100%);
  opacity: 0.85;
}

.stat-card:hover {
  border-color: var(--page-accent-line);
  transform: translateY(-3px);
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.07);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon-total {
  background: rgba(15, 159, 122, 0.12);
  color: var(--page-accent);
}

.stat-icon-active {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.stat-icon-completed {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.stat-icon-topics {
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.filter-bar {
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 20px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.04);
  width: fit-content;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: none;
  border-radius: 14px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.filter-tab:hover {
  color: var(--color-text);
  background: rgba(15, 23, 42, 0.04);
}

.filter-tab.active {
  background: #ffffff;
  color: var(--page-accent-deep);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
}

.tab-count {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(15, 23, 42, 0.06);
  border-radius: 999px;
}

.filter-tab.active .tab-count {
  background: var(--page-accent-soft);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.plan-card {
  position: relative;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 28px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
}

.plan-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.45) 0%, rgba(148, 163, 184, 0.15) 100%);
}

.plan-card:hover {
  transform: translateY(-6px);
  border-color: var(--page-accent-line);
  box-shadow: 0 26px 54px rgba(15, 23, 42, 0.08);
}

.plan-card:hover .card-glow {
  opacity: 1;
}

.plan-card.status-2::before {
  background: linear-gradient(90deg, var(--page-accent) 0%, rgba(6, 182, 212, 0.75) 100%);
}

.plan-card.status-3::before {
  background: linear-gradient(90deg, #22c55e 0%, #86efac 100%);
}

.plan-card.status-1::before {
  background: linear-gradient(90deg, #f59e0b 0%, #fde68a 100%);
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 42%);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.card-content {
  position: relative;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.status-1 {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge.status-2 {
  background: var(--page-accent-soft);
  color: var(--page-accent-deep);
}

.status-badge.status-3 {
  background: #f0fdf4;
  color: #15803d;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.status-badge.status-3 .status-dot {
  animation: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

.card-menu {
  position: relative;
}

.menu-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.04);
  border: none;
  border-radius: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.25s ease;
}

.menu-btn:hover {
  background: rgba(15, 23, 42, 0.08);
  color: var(--color-text);
}

.menu-btn svg {
  width: 18px;
  height: 18px;
}

.plan-title {
  font-size: 21px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 16px 0;
  line-height: 1.35;
}

.plan-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.meta-item svg {
  width: 16px;
  height: 16px;
  color: rgba(15, 159, 122, 0.72);
}

.progress-section {
  margin-bottom: 20px;
  padding: 18px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 18px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.progress-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--page-accent-deep);
}

.progress-bar {
  height: 8px;
  background: rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--page-accent) 0%, rgba(6, 182, 212, 0.92) 100%);
  border-radius: 999px;
  position: relative;
  transition: width 0.6s ease;
}

.progress-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-detail {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 8px;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.days-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--page-accent-deep);
}

.days-info svg {
  width: 16px;
  height: 16px;
}

.days-info.completed {
  color: #15803d;
}

.days-info.pending {
  color: #b45309;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 32px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
}

.empty-illustration {
  width: 180px;
  height: 180px;
  margin-bottom: 28px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}

.empty-illustration svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px 0;
}

.empty-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0 0 32px 0;
  max-width: 420px;
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 96px 16px 32px;
  }

  .page-header {
    flex-direction: column;
    gap: 20px;
  }

  .page-title {
    font-size: 32px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    width: 100%;
    overflow-x: auto;
  }

  .filter-tab {
    flex-shrink: 0;
    padding: 9px 14px;
    font-size: 13px;
  }
}
</style>
