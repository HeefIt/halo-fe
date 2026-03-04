<template>
  <div class="study-plan-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <div class="header-left">
            <h1 class="page-title">学习计划</h1>
            <p class="page-subtitle">规划你的学习旅程，追踪每一个成长足迹</p>
          </div>
          <button class="create-btn" @click="createPlan">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            创建计划
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
          <h3 class="empty-title">暂无学习计划</h3>
          <p class="empty-desc">创建你的第一个学习计划，开启高效学习之旅</p>
          <button class="create-btn large" @click="createPlan">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            创建学习计划
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
      title: 'Java基础巩固计划',
      status: 2,
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      totalTopics: 25,
      completedTopics: 10
    },
    {
      id: 2,
      title: 'Spring框架深入学习',
      status: 1,
      startDate: '2026-01-01',
      endDate: '2026-02-28',
      totalTopics: 18,
      completedTopics: 0
    },
    {
      id: 3,
      title: '数据库优化专题',
      status: 3,
      startDate: '2025-09-01',
      endDate: '2025-10-31',
      totalTopics: 15,
      completedTopics: 15
    },
    {
      id: 4,
      title: '微服务架构实践',
      status: 2,
      startDate: '2025-11-15',
      endDate: '2026-01-15',
      totalTopics: 22,
      completedTopics: 8
    },
    {
      id: 5,
      title: '前端工程化进阶',
      status: 1,
      startDate: '2026-02-01',
      endDate: '2026-03-31',
      totalTopics: 20,
      completedTopics: 0
    },
    {
      id: 6,
      title: '算法与数据结构',
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
  background: linear-gradient(135deg, #0f1419 0%, #1a252f 50%, #0f1419 100%);
}

.main-content {
  padding: 100px 24px 48px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
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
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon-total {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
  color: #10b981;
}

.stat-icon-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
  color: #3b82f6;
}

.stat-icon-completed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%);
  color: #22c55e;
}

.stat-icon-topics {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%);
  color: #f59e0b;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.filter-bar {
  margin-bottom: 28px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  width: fit-content;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.filter-tab.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
}

.tab-count {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.filter-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.plan-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.plan-card:hover {
  transform: translateY(-8px);
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.plan-card:hover .card-glow {
  opacity: 1;
}

.plan-card.status-2 {
  border-color: rgba(16, 185, 129, 0.2);
}

.plan-card.status-3 {
  border-color: rgba(34, 197, 94, 0.2);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
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
  margin-bottom: 16px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-1 {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.status-badge.status-2 {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.status-3 {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
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
  50% { opacity: 0.5; }
}

.card-menu {
  position: relative;
}

.menu-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-btn svg {
  width: 18px;
  height: 18px;
}

.plan-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
  line-height: 1.3;
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
  color: rgba(255, 255, 255, 0.5);
}

.meta-item svg {
  width: 16px;
  height: 16px;
  color: rgba(16, 185, 129, 0.7);
}

.progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.progress-value {
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
  border-radius: 4px;
  position: relative;
  transition: width 0.6s ease;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-detail {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8px;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.days-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(16, 185, 129, 0.8);
}

.days-info svg {
  width: 16px;
  height: 16px;
}

.days-info.completed {
  color: #22c55e;
}

.days-info.pending {
  color: #fbbf24;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-illustration {
  width: 200px;
  height: 200px;
  margin-bottom: 32px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.empty-illustration svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
}

.empty-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 32px 0;
  max-width: 400px;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 24px;
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
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>
