<template>
  <div
    class="study-plan-detail-page app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main-content">
      <div class="container">
        <div class="back-row">
          <button class="back-btn" @click="goBack">返回学习计划</button>
        </div>

        <section class="plan-hero">
          <div class="hero-main">
            <div class="hero-topline">
              <span class="status-chip" :class="`status-${currentPlan.status}`">
                {{ getPlanStatusText(currentPlan.status) }}
              </span>
              <span class="hero-date">
                {{ formatDate(currentPlan.startDate) }} 至 {{ formatDate(currentPlan.endDate) }}
              </span>
            </div>

            <h1 class="hero-title">{{ currentPlan.title }}</h1>

            <div class="hero-progress">
              <div class="progress-heading">
                <span>整体进度</span>
                <strong>{{ completionRate }}%</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${completionRate}%` }"></div>
              </div>
              <div class="progress-foot">
                <span>已完成 {{ currentPlan.completedTopics }}/{{ currentPlan.totalTopics }} 个主题</span>
                <span>待完成 {{ remainingTopicCount }} 个主题</span>
              </div>
            </div>
          </div>

          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-label">总主题数</span>
              <strong class="hero-stat-value">{{ currentPlan.totalTopics }}</strong>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-label">已完成</span>
              <strong class="hero-stat-value">{{ currentPlan.completedTopics }}</strong>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-label">进行中</span>
              <strong class="hero-stat-value">{{ topicStatusSummary.active }}</strong>
            </div>
          </div>
        </section>

        <div class="detail-grid">
          <section class="topics-panel">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">学习主题</h2>
              </div>

              <div class="search-box">
                <input
                  v-model="searchKeyword"
                  type="text"
                  class="search-input"
                  placeholder="搜索主题或分类"
                />
              </div>
            </div>

            <div class="topic-stream" v-if="filteredTopics.length">
              <article
                v-for="topic in filteredTopics"
                :key="topic.id"
                class="topic-row"
              >
                <div class="topic-main">
                  <div class="topic-title-row">
                    <h3 class="topic-title">{{ topic.name }}</h3>
                    <span class="topic-type">{{ getTopicTypeLabel(topic.type) }}</span>
                  </div>

                  <div class="topic-meta">
                    <span>{{ topic.category }}</span>
                    <span>预计 {{ topic.estimatedTime }} 小时</span>
                    <span>截止 {{ formatDate(topic.deadline) }}</span>
                  </div>
                </div>

                <div class="topic-side">
                  <span class="topic-status" :class="`status-${topic.status}`">
                    {{ getTopicStatusText(topic.status) }}
                  </span>

                  <div class="topic-actions">
                    <button
                      v-if="topic.status !== 3"
                      class="action-btn action-btn-primary"
                      @click="startLearning(topic)"
                    >
                      {{ topic.status === 2 ? '继续学习' : '开始学习' }}
                    </button>
                    <button
                      v-if="topic.status === 2"
                      class="action-btn"
                      @click="markAsCompleted(topic)"
                    >
                      标记完成
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="empty-block">没有匹配的主题，可以换个关键词试试。</div>
          </section>

          <aside class="aside-column">
            <section class="aside-panel">
              <div class="panel-head">
                <div>
                  <h2 class="panel-title">状态摘要</h2>
                </div>
              </div>

              <div class="summary-list">
                <div class="summary-row">
                  <span>未开始</span>
                  <strong>{{ topicStatusSummary.pending }}</strong>
                </div>
                <div class="summary-row">
                  <span>进行中</span>
                  <strong>{{ topicStatusSummary.active }}</strong>
                </div>
                <div class="summary-row">
                  <span>已完成</span>
                  <strong>{{ topicStatusSummary.completed }}</strong>
                </div>
              </div>
            </section>

            <section class="aside-panel">
              <div class="panel-head">
                <div>
                  <h2 class="panel-title">执行提醒</h2>
                </div>
              </div>

              <div class="note-list">
                <div class="note-item">
                  <span class="note-label">最近应优先处理</span>
                  <strong class="note-value">
                    {{ activeTopic ? activeTopic.name : '暂无进行中的主题' }}
                  </strong>
                </div>
                <div class="note-item">
                  <span class="note-label">搜索结果</span>
                  <strong class="note-value">{{ filteredTopics.length }} 个主题</strong>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useThemeStore } from '@/stores/theme'
import Header from '@/views/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const loading = ref(false)
const searchKeyword = ref('')
const currentPlan = ref({})
const topics = ref([])

const completionRate = computed(() => {
  if (!currentPlan.value.totalTopics) {
    return 0
  }
  return Math.round((currentPlan.value.completedTopics / currentPlan.value.totalTopics) * 100)
})

const remainingTopicCount = computed(() => {
  return Math.max(0, (currentPlan.value.totalTopics || 0) - (currentPlan.value.completedTopics || 0))
})

const topicStatusSummary = computed(() => {
  return {
    pending: topics.value.filter(topic => topic.status === 1).length,
    active: topics.value.filter(topic => topic.status === 2).length,
    completed: topics.value.filter(topic => topic.status === 3).length
  }
})

const activeTopic = computed(() => topics.value.find(topic => topic.status === 2))

const goBack = () => {
  router.push('/study-plan')
}

const getPlanStatusText = (status) => {
  const statusMap = {
    1: '未开始',
    2: '进行中',
    3: '已完成'
  }
  return statusMap[status] || '未知'
}

const getTopicStatusText = (status) => {
  const statusMap = {
    1: '未开始',
    2: '进行中',
    3: '已完成'
  }
  return statusMap[status] || '未知'
}

const getTopicTypeLabel = (type) => {
  const typeMap = {
    1: '视频',
    2: '文档',
    3: '练习'
  }
  return typeMap[type] || '主题'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const filteredTopics = computed(() => {
  if (!searchKeyword.value) {
    return topics.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return topics.value.filter(topic =>
    topic.name.toLowerCase().includes(keyword) ||
    topic.category.toLowerCase().includes(keyword)
  )
})

const startLearning = (topic) => {
  ElMessage.info(`开始学习 "${topic.name}"`)
  if (topic.status === 1) {
    topic.status = 2
  }
}

const markAsCompleted = (topic) => {
  ElMessageBox.confirm(`确定要将 "${topic.name}" 标记为已完成吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    topic.status = 3
    currentPlan.value.completedTopics++
    ElMessage.success('主题已标记为完成')
  }).catch(() => {
    // 用户取消操作
  })
}

const fetchStudyPlanDetail = () => {
  const planId = route.params.id

  currentPlan.value = {
    id: parseInt(planId),
    title: 'Java基础巩固计划',
    status: 2,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    totalTopics: 25,
    completedTopics: 10
  }

  topics.value = [
    {
      id: 1,
      name: 'Java基础语法',
      category: 'Java基础',
      type: 1,
      estimatedTime: 3,
      deadline: '2025-11-10',
      status: 3
    },
    {
      id: 2,
      name: '面向对象编程',
      category: 'Java基础',
      type: 1,
      estimatedTime: 4,
      deadline: '2025-11-15',
      status: 3
    },
    {
      id: 3,
      name: '集合框架详解',
      category: 'Java基础',
      type: 2,
      estimatedTime: 5,
      deadline: '2025-11-20',
      status: 2
    },
    {
      id: 4,
      name: '异常处理机制',
      category: 'Java基础',
      type: 3,
      estimatedTime: 2,
      deadline: '2025-11-25',
      status: 1
    },
    {
      id: 5,
      name: '多线程基础',
      category: 'Java进阶',
      type: 1,
      estimatedTime: 6,
      deadline: '2025-11-30',
      status: 1
    },
    {
      id: 6,
      name: 'IO流操作',
      category: 'Java基础',
      type: 2,
      estimatedTime: 4,
      deadline: '2025-12-05',
      status: 1
    }
  ]
}

onMounted(() => {
  fetchStudyPlanDetail()
})
</script>

<style scoped>
.study-plan-detail-page {
  --detail-bg: #f3f5f8;
  --detail-surface: #ffffff;
  --detail-surface-soft: #eef2f6;
  --detail-border: rgba(15, 23, 42, 0.1);
  --detail-line: rgba(15, 23, 42, 0.06);
  --detail-text: var(--color-text);
  --detail-text-soft: var(--color-text-secondary);
  --detail-text-faint: var(--color-text-muted);
  --detail-accent: #0f766e;
  --detail-accent-soft: rgba(15, 118, 110, 0.08);
  --detail-accent-line: rgba(15, 118, 110, 0.16);
  min-height: 100vh;
  background: var(--detail-bg);
}

.study-plan-detail-page.is-dark {
  --detail-bg: #09111c;
  --detail-surface: #0f172a;
  --detail-surface-soft: #111c31;
  --detail-border: rgba(148, 163, 184, 0.14);
  --detail-line: rgba(148, 163, 184, 0.1);
  --detail-text: var(--text-1);
  --detail-text-soft: var(--text-2);
  --detail-text-faint: var(--text-3);
  --detail-accent: #5eead4;
  --detail-accent-soft: rgba(94, 234, 212, 0.12);
  --detail-accent-line: rgba(94, 234, 212, 0.18);
}

.main-content {
  padding: 94px 20px 36px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-row {
  margin-bottom: 12px;
}

.back-btn,
.action-btn {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--detail-border);
  background: var(--detail-surface);
  color: var(--detail-text);
  font-size: 13px;
  font-weight: 700;
}

.plan-hero,
.topics-panel,
.aside-panel {
  border: 1px solid var(--detail-border);
  background: var(--detail-surface);
}

.plan-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) 240px;
  gap: 18px;
  padding: 22px 24px;
}

.hero-topline,
.progress-heading,
.progress-foot,
.topic-meta,
.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.hero-topline {
  align-items: center;
}

.status-chip,
.topic-status,
.topic-type {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border: 1px solid var(--detail-border);
  font-size: 12px;
  font-weight: 700;
}

.status-chip.status-1,
.topic-status.status-1 {
  color: #b45309;
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.16);
}

.status-chip.status-2,
.topic-status.status-2 {
  color: var(--detail-accent);
  background: var(--detail-accent-soft);
  border-color: var(--detail-accent-line);
}

.status-chip.status-3,
.topic-status.status-3 {
  color: #15803d;
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.16);
}

.study-plan-detail-page.is-dark .status-chip.status-1,
.study-plan-detail-page.is-dark .topic-status.status-1 {
  color: #fdba74;
}

.study-plan-detail-page.is-dark .status-chip.status-3,
.study-plan-detail-page.is-dark .topic-status.status-3 {
  color: #86efac;
}

.hero-date,
.panel-desc,
.topic-meta,
.progress-foot,
.note-label {
  color: var(--detail-text-soft);
  font-size: 13px;
}

.hero-title {
  margin: 14px 0 0;
  color: var(--detail-text);
  font-size: clamp(30px, 4vw, 42px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.hero-progress {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.progress-heading {
  justify-content: space-between;
  color: var(--detail-text-soft);
  font-size: 13px;
}

.progress-heading strong {
  color: var(--detail-text);
  font-size: 18px;
}

.progress-track {
  width: 100%;
  height: 9px;
  overflow: hidden;
  background: var(--detail-surface-soft);
}

.progress-fill {
  height: 100%;
  background: var(--detail-accent);
}

.hero-stats {
  display: grid;
  gap: 10px;
  align-content: start;
}

.hero-stat {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid var(--detail-line);
  background: var(--detail-surface-soft);
}

.hero-stat-label,
.summary-row span {
  color: var(--detail-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.hero-stat-value {
  color: var(--detail-text);
  font-size: 26px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 320px;
  gap: 16px;
  margin-top: 16px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.topics-panel,
.aside-panel {
  padding: 16px;
}

.panel-title {
  margin: 0;
  color: var(--detail-text);
  font-size: 18px;
}

.panel-desc {
  margin: 6px 0 0;
  line-height: 1.6;
}

.search-box {
  min-width: 220px;
}

.search-input {
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--detail-border);
  background: var(--detail-surface-soft);
  color: var(--detail-text);
  font-size: 13px;
  outline: none;
}

.search-input::placeholder {
  color: var(--detail-text-faint);
}

.topic-stream,
.aside-column,
.summary-list,
.note-list {
  display: grid;
  gap: 10px;
}

.topic-stream {
  margin-top: 16px;
}

.topic-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--detail-line);
}

.topic-row:last-child {
  border-bottom: none;
}

.topic-main,
.topic-side,
.topic-actions {
  display: grid;
  gap: 10px;
}

.topic-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.topic-title {
  margin: 0;
  color: var(--detail-text);
  font-size: 18px;
  line-height: 1.4;
}

.topic-type {
  color: var(--detail-text-soft);
  background: var(--detail-surface-soft);
}

.topic-side {
  justify-items: start;
  align-content: start;
}

.action-btn {
  background: transparent;
}

.action-btn-primary {
  border-color: var(--detail-accent);
  background: var(--detail-accent);
  color: #ffffff;
}

.study-plan-detail-page.is-dark .action-btn-primary {
  color: #06201d;
}

.summary-list,
.note-list {
  margin-top: 14px;
}

.summary-row,
.note-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--detail-line);
}

.summary-row:last-child,
.note-item:last-child {
  border-bottom: none;
}

.summary-row {
  justify-content: space-between;
  align-items: center;
}

.summary-row strong,
.note-value {
  color: var(--detail-text);
  font-size: 16px;
}

.note-item {
  display: grid;
  gap: 6px;
}

.empty-block {
  margin-top: 16px;
  color: var(--detail-text-soft);
  font-size: 14px;
}

@media (max-width: 1080px) {
  .main-content {
    padding: 94px 16px 28px;
  }

  .container {
    padding: 0 16px;
  }

  .plan-hero,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .panel-head,
  .topic-row {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .search-box {
    min-width: 0;
    width: 100%;
  }

  .topic-row {
    gap: 12px;
  }
}
</style>
