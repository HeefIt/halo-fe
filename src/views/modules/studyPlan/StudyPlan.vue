<template>
  <div
    class="study-plan-page app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main-content">
      <div class="container">
        <section class="plan-hero">
          <div class="hero-copy">
            <span class="hero-kicker">PLAN DESK</span>
            <h1 class="hero-title">学习计划</h1>
          </div>

          <button class="hero-action" @click="createPlan">
            <span class="hero-action-plus">+</span>
            <span>新建计划</span>
          </button>
        </section>

        <section class="stats-strip">
          <article class="stat-unit stat-unit-strong">
            <span class="stat-label">全部计划</span>
            <strong class="stat-value">{{ studyPlans.length }}</strong>
            <span class="stat-meta">当前已规划 {{ totalTopics }} 个主题</span>
          </article>
          <article class="stat-unit">
            <span class="stat-label">进行中</span>
            <strong class="stat-value">{{ activePlans.length }}</strong>
            <span class="stat-meta">优先关注正在推进的计划</span>
          </article>
          <article class="stat-unit">
            <span class="stat-label">已完成</span>
            <strong class="stat-value">{{ completedPlansCount }}</strong>
            <span class="stat-meta">已完成主题 {{ totalTopicsCompleted }}</span>
          </article>
          <article class="stat-unit">
            <span class="stat-label">平均进度</span>
            <strong class="stat-value">{{ averageProgress }}%</strong>
            <span class="stat-meta">按全部计划完成度计算</span>
          </article>
        </section>

        <section class="toolbar">
          <div class="toolbar-tabs">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              class="toolbar-tab"
              :class="{ active: currentStatus === tab.value }"
              @click="currentStatus = tab.value"
            >
              <span>{{ tab.label }}</span>
              <span class="toolbar-count">{{ getPlanCountByStatus(tab.value) }}</span>
            </button>
          </div>

          <div class="toolbar-note">
            <span class="toolbar-note-key">当前视图</span>
            <span class="toolbar-note-value">
              {{ currentStatus === 'all' ? '全部计划' : getStatusText(currentStatus) }}
            </span>
          </div>
        </section>

        <div class="workspace" v-if="filteredPlans.length > 0">
          <section class="primary-column">
            <div class="section-head">
              <div>
                <h2 class="section-title">计划列表</h2>
              </div>
              <span class="section-meta">{{ filteredPlans.length }} 项</span>
            </div>

            <div class="plan-stream">
              <article
                v-for="plan in filteredPlans"
                :key="plan.id"
                class="plan-row"
                :class="`status-${plan.status}`"
                @click="viewPlan(plan)"
              >
                <div class="plan-main">
                  <div class="plan-headline">
                    <div class="headline-copy">
                      <span class="plan-status" :class="`status-${plan.status}`">
                        {{ getStatusText(plan.status) }}
                      </span>
                      <h3 class="plan-title">{{ plan.title }}</h3>
                    </div>
                    <span class="plan-percent">
                      {{ Math.round((plan.completedTopics / plan.totalTopics) * 100) }}%
                    </span>
                  </div>

                  <div class="plan-meta">
                    <span>{{ formatDateRange(plan.startDate, plan.endDate) }}</span>
                    <span>{{ plan.totalTopics }} 个主题</span>
                    <span>已完成 {{ plan.completedTopics }} 个</span>
                  </div>

                  <div class="plan-progress">
                    <div class="progress-track">
                      <div
                        class="progress-fill"
                        :style="{ width: `${(plan.completedTopics / plan.totalTopics) * 100}%` }"
                      ></div>
                    </div>
                    <div class="progress-foot">
                      <span>{{ plan.completedTopics }}/{{ plan.totalTopics }}</span>
                      <span v-if="plan.status === 2">剩余 {{ getRemainingDays(plan.endDate) }} 天</span>
                      <span v-else-if="plan.status === 1">{{ getDaysUntilStart(plan.startDate) }} 天后开始</span>
                      <span v-else>已按计划完成</span>
                    </div>
                  </div>
                </div>

                <div class="plan-side">
                  <span class="side-label">下一步</span>
                  <strong class="side-value" v-if="plan.status === 2">继续推进</strong>
                  <strong class="side-value" v-else-if="plan.status === 1">准备启动</strong>
                  <strong class="side-value" v-else>复盘整理</strong>
                  <span class="side-arrow">查看详情</span>
                </div>
              </article>
            </div>
          </section>

          <aside class="secondary-column">
            <section class="side-panel">
              <div class="section-head">
                <div>
                  <h2 class="section-title">计划摘要</h2>
                </div>
              </div>

              <div class="summary-list">
                <div class="summary-item">
                  <span class="summary-label">最近要开始</span>
                  <strong class="summary-value">
                    {{ upcomingPlan ? upcomingPlan.title : '暂无待开始计划' }}
                  </strong>
                  <span class="summary-meta" v-if="upcomingPlan">
                    {{ getDaysUntilStart(upcomingPlan.startDate) }} 天后开始
                  </span>
                </div>

                <div class="summary-item">
                  <span class="summary-label">最接近完成</span>
                  <strong class="summary-value">
                    {{ focusPlan ? focusPlan.title : '暂无进行中计划' }}
                  </strong>
                  <span class="summary-meta" v-if="focusPlan">
                    完成度 {{ Math.round((focusPlan.completedTopics / focusPlan.totalTopics) * 100) }}%
                  </span>
                </div>
              </div>
            </section>

            <section class="side-panel">
              <div class="section-head">
                <div>
                  <h2 class="section-title">状态分布</h2>
                </div>
              </div>

              <div class="status-list">
                <div class="status-row">
                  <span>进行中</span>
                  <strong>{{ activePlans.length }}</strong>
                </div>
                <div class="status-row">
                  <span>未开始</span>
                  <strong>{{ pendingPlans.length }}</strong>
                </div>
                <div class="status-row">
                  <span>已完成</span>
                  <strong>{{ completedPlans.length }}</strong>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <section v-else class="empty-state">
          <span class="empty-kicker">NO PLAN</span>
          <h2 class="empty-title">还没有学习计划</h2>
          <button class="hero-action" @click="createPlan">
            <span class="hero-action-plus">+</span>
            <span>创建第一份计划</span>
          </button>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import Header from '@/views/components/layout/Header.vue'

const router = useRouter()
const themeStore = useThemeStore()

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

const activePlans = computed(() => studyPlans.value.filter(plan => plan.status === 2))
const pendingPlans = computed(() => studyPlans.value.filter(plan => plan.status === 1))
const completedPlans = computed(() => studyPlans.value.filter(plan => plan.status === 3))

const completedPlansCount = computed(() => completedPlans.value.length)

const totalTopicsCompleted = computed(() => {
  return studyPlans.value.reduce((sum, plan) => sum + plan.completedTopics, 0)
})

const totalTopics = computed(() => {
  return studyPlans.value.reduce((sum, plan) => sum + plan.totalTopics, 0)
})

const averageProgress = computed(() => {
  if (!studyPlans.value.length) {
    return 0
  }
  const total = studyPlans.value.reduce((sum, plan) => {
    return sum + (plan.completedTopics / plan.totalTopics) * 100
  }, 0)
  return Math.round(total / studyPlans.value.length)
})

const upcomingPlan = computed(() => {
  return [...pendingPlans.value].sort((left, right) => new Date(left.startDate) - new Date(right.startDate))[0]
})

const focusPlan = computed(() => {
  return [...activePlans.value].sort((left, right) => {
    const leftRate = left.completedTopics / left.totalTopics
    const rightRate = right.completedTopics / right.totalTopics
    return rightRate - leftRate
  })[0]
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
  --plan-bg: #f3f5f8;
  --plan-surface: #ffffff;
  --plan-surface-soft: #eef2f6;
  --plan-surface-strong: #e7edf4;
  --plan-border: rgba(15, 23, 42, 0.1);
  --plan-line: rgba(15, 23, 42, 0.06);
  --plan-text: var(--color-text);
  --plan-text-soft: var(--color-text-secondary);
  --plan-text-faint: var(--color-text-muted);
  --plan-accent: #0f766e;
  --plan-accent-soft: rgba(15, 118, 110, 0.08);
  --plan-accent-line: rgba(15, 118, 110, 0.16);
  min-height: 100vh;
  background: var(--plan-bg);
}

.study-plan-page.is-dark {
  --plan-bg: #09111c;
  --plan-surface: #0f172a;
  --plan-surface-soft: #111c31;
  --plan-surface-strong: #162338;
  --plan-border: rgba(148, 163, 184, 0.14);
  --plan-line: rgba(148, 163, 184, 0.1);
  --plan-text: var(--text-1);
  --plan-text-soft: var(--text-2);
  --plan-text-faint: var(--text-3);
  --plan-accent: #5eead4;
  --plan-accent-soft: rgba(94, 234, 212, 0.12);
  --plan-accent-line: rgba(94, 234, 212, 0.18);
}

.main-content {
  padding: 94px 20px 36px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.plan-hero,
.stats-strip,
.toolbar,
.side-panel,
.empty-state {
  border: 1px solid var(--plan-border);
  background: var(--plan-surface);
}

.plan-hero {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
  padding: 22px 24px;
}

.hero-kicker,
.stat-label,
.toolbar-note-key,
.summary-label,
.side-label {
  color: var(--plan-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-title {
  margin: 6px 0 0;
  color: var(--plan-text);
  font-size: clamp(30px, 4vw, 42px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.hero-subtitle {
  max-width: 620px;
  margin: 10px 0 0;
  color: var(--plan-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

.hero-action {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--plan-accent);
  background: var(--plan-accent);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.study-plan-page.is-dark .hero-action {
  color: #06201d;
}

.hero-action-plus {
  font-size: 18px;
  line-height: 1;
}

.stats-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(3, minmax(0, 1fr));
  margin-top: 14px;
}

.stat-unit {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-right: 1px solid var(--plan-line);
}

.stat-unit:last-child {
  border-right: none;
}

.stat-unit-strong {
  background: var(--plan-surface-soft);
}

.stat-value {
  color: var(--plan-text);
  font-size: clamp(28px, 3vw, 38px);
  line-height: 1;
  letter-spacing: -0.04em;
}

.stat-meta,
.toolbar-note-value,
.section-desc,
.summary-meta {
  color: var(--plan-text-soft);
  font-size: 13px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  margin-top: 14px;
  padding: 12px 16px;
}

.toolbar-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--plan-border);
  background: transparent;
  color: var(--plan-text-soft);
  font-size: 13px;
  font-weight: 700;
}

.toolbar-tab.active {
  border-color: var(--plan-accent-line);
  background: var(--plan-accent-soft);
  color: var(--plan-accent);
}

.toolbar-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--plan-surface-soft);
  font-size: 11px;
  font-weight: 700;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.36fr) minmax(280px, 0.74fr);
  gap: 16px;
  margin-top: 16px;
}

.primary-column,
.secondary-column {
  display: grid;
  gap: 16px;
  align-content: start;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.section-title {
  margin: 0;
  color: var(--plan-text);
  font-size: 18px;
}

.section-desc {
  margin: 6px 0 0;
  line-height: 1.6;
}

.section-meta {
  color: var(--plan-text-faint);
  font-size: 12px;
  font-weight: 700;
}

.plan-stream {
  display: grid;
  gap: 10px;
}

.plan-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 18px;
  padding: 18px;
  border: 1px solid var(--plan-border);
  background: var(--plan-surface);
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.plan-row:hover {
  background: var(--plan-surface-soft);
}

.plan-row.status-2 {
  border-left: 3px solid var(--plan-accent);
}

.plan-row.status-1 {
  border-left: 3px solid #d97706;
}

.plan-row.status-3 {
  border-left: 3px solid #15803d;
}

.plan-main,
.plan-progress {
  display: grid;
  gap: 10px;
}

.plan-headline {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.headline-copy {
  display: grid;
  gap: 8px;
}

.plan-status {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 24px;
  padding: 0 8px;
  border: 1px solid var(--plan-border);
  font-size: 12px;
  font-weight: 700;
}

.plan-status.status-1 {
  color: #b45309;
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.16);
}

.plan-status.status-2 {
  color: var(--plan-accent);
  background: var(--plan-accent-soft);
  border-color: var(--plan-accent-line);
}

.plan-status.status-3 {
  color: #15803d;
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.16);
}

.study-plan-page.is-dark .plan-status.status-1 {
  color: #fdba74;
}

.study-plan-page.is-dark .plan-status.status-3 {
  color: #86efac;
}

.plan-title {
  margin: 0;
  color: var(--plan-text);
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.plan-percent {
  color: var(--plan-text);
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}

.plan-meta,
.progress-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  color: var(--plan-text-soft);
  font-size: 13px;
}

.progress-track {
  width: 100%;
  height: 8px;
  overflow: hidden;
  background: var(--plan-surface-strong);
}

.progress-fill {
  height: 100%;
  background: var(--plan-accent);
}

.plan-side {
  display: grid;
  gap: 6px;
  align-content: start;
  padding-left: 18px;
  border-left: 1px solid var(--plan-line);
}

.side-value {
  color: var(--plan-text);
  font-size: 16px;
  line-height: 1.4;
}

.side-arrow {
  color: var(--plan-text-soft);
  font-size: 12px;
  font-weight: 700;
}

.side-panel {
  padding: 16px;
}

.summary-list,
.status-list {
  display: grid;
  gap: 0;
  margin-top: 14px;
}

.summary-item,
.status-row {
  display: grid;
  gap: 6px;
  padding: 12px 0;
  border-bottom: 1px solid var(--plan-line);
}

.summary-item:last-child,
.status-row:last-child {
  border-bottom: none;
}

.summary-value {
  color: var(--plan-text);
  font-size: 16px;
  line-height: 1.5;
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  color: var(--plan-text-soft);
  font-size: 14px;
}

.status-row strong {
  color: var(--plan-text);
  font-size: 16px;
}

.empty-state {
  display: grid;
  gap: 10px;
  justify-items: start;
  margin-top: 16px;
  padding: 28px 24px;
}

.empty-kicker {
  color: var(--plan-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.empty-title {
  margin: 0;
  color: var(--plan-text);
  font-size: 28px;
  letter-spacing: -0.04em;
}

.empty-desc {
  max-width: 480px;
  margin: 0;
  color: var(--plan-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 1080px) {
  .main-content {
    padding: 94px 16px 28px;
  }

  .container {
    padding: 0 16px;
  }

  .stats-strip,
  .workspace {
    grid-template-columns: 1fr;
  }

  .stat-unit {
    border-right: none;
    border-bottom: 1px solid var(--plan-line);
  }

  .stat-unit:last-child {
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .plan-hero,
  .toolbar,
  .plan-row {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .plan-hero,
  .toolbar {
    align-items: start;
  }

  .plan-row {
    gap: 14px;
  }

  .plan-side {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--plan-line);
    padding-top: 12px;
  }
}
</style>
