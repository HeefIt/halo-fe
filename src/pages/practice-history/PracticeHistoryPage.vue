<template>
  <div
    class="practice-history-page app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main-content">
      <div class="container">
        <section class="page-hero">
          <div class="hero-copy">
            <span class="hero-kicker">PRACTICE ARCHIVE</span>
            <h1 class="hero-title">练习记录</h1>
          </div>

          <button class="export-btn" @click="exportHistory">导出记录</button>
        </section>

        <section class="stats-strip">
          <article class="stat-unit stat-unit-strong">
            <span class="stat-label">平均正确率</span>
            <strong class="stat-value">{{ Math.round(stats.averageAccuracy) }}%</strong>
            <span class="stat-meta">累计 {{ stats.totalPracticeCount }} 次练习后的平均表现</span>
          </article>
          <article class="stat-unit">
            <span class="stat-label">总练习次数</span>
            <strong class="stat-value">{{ stats.totalPracticeCount }}</strong>
          </article>
          <article class="stat-unit">
            <span class="stat-label">总答题数</span>
            <strong class="stat-value">{{ stats.totalSubjectCount }}</strong>
          </article>
          <article class="stat-unit">
            <span class="stat-label">累计用时</span>
            <strong class="stat-value">{{ formatTotalTime(stats.totalTime) }}</strong>
          </article>
        </section>

        <section class="toolbar">
          <div class="toolbar-group">
            <span class="toolbar-label">练习时间</span>
            <div class="date-range">
              <input v-model="filterForm.startDate" type="date" class="toolbar-input" />
              <span class="toolbar-separator">至</span>
              <input v-model="filterForm.endDate" type="date" class="toolbar-input" />
            </div>
          </div>

          <div class="toolbar-group">
            <span class="toolbar-label">题目类型</span>
            <div class="type-select" @click="showTypeDropdown = !showTypeDropdown">
              <span>{{ getSubjectTypeLabel(filterForm.subjectType) || '全部类型' }}</span>
              <span class="type-arrow">▾</span>

              <div class="type-dropdown" v-if="showTypeDropdown">
                <button class="dropdown-item" @click.stop="selectType('')">全部类型</button>
                <button class="dropdown-item" @click.stop="selectType(1)">单选题</button>
                <button class="dropdown-item" @click.stop="selectType(2)">多选题</button>
                <button class="dropdown-item" @click.stop="selectType(3)">判断题</button>
                <button class="dropdown-item" @click.stop="selectType(4)">简答题</button>
              </div>
            </div>
          </div>

          <div class="toolbar-actions">
            <button class="toolbar-btn toolbar-btn-primary" @click="fetchPracticeHistory">筛选</button>
            <button class="toolbar-btn" @click="resetFilters">重置</button>
          </div>
        </section>

        <section class="archive-panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">练习档案</h2>
            </div>
            <span class="panel-meta">共 {{ pagination.total }} 条</span>
          </div>

          <div class="record-stream" v-loading="loading" v-if="practiceHistory.length > 0">
            <article
              v-for="record in practiceHistory"
              :key="record.id"
              class="record-row"
              @dblclick="viewPracticeDetail(record)"
            >
              <div class="record-main">
                <div class="record-title-row">
                  <strong class="record-id">#{{ record.id }}</strong>
                  <span class="record-type" :class="`type-${record.subjectType}`">
                    {{ getSubjectTypeLabel(record.subjectType) }}
                  </span>
                </div>

                <div class="record-date">{{ formatDate(record.practiceDate) }}</div>

                <div class="record-stats">
                  <span>{{ record.subjectCount }} 题</span>
                  <span>答对 {{ record.correctCount }} 题</span>
                  <span>耗时 {{ formatTime(record.timeSpent) }}</span>
                </div>
              </div>

              <div class="record-progress">
                <span class="progress-label">正确率</span>
                <div class="progress-track">
                  <div
                    class="progress-fill"
                    :class="getAccuracyClass(record.correctCount, record.subjectCount)"
                    :style="{ width: `${(record.correctCount / record.subjectCount) * 100}%` }"
                  ></div>
                </div>
                <strong class="progress-value">
                  {{ Math.round((record.correctCount / record.subjectCount) * 100) }}%
                </strong>
              </div>

              <div class="record-actions">
                <button class="detail-btn" @click="viewPracticeDetail(record)">查看详情</button>
              </div>
            </article>
          </div>

          <div class="empty-block" v-else-if="!loading">
            当前还没有练习记录，完成第一组题目后，这里会开始累计你的练习档案。
          </div>

          <div class="pagination" v-if="pagination.total > 0">
            <div class="page-info">
              {{ (pagination.pageNo - 1) * pagination.pageSize + 1 }} -
              {{ Math.min(pagination.pageNo * pagination.pageSize, pagination.total) }} / {{ pagination.total }}
            </div>

            <div class="page-controls">
              <button
                class="page-btn"
                :disabled="pagination.pageNo === 1"
                @click="changePage(pagination.pageNo - 1)"
              >
                上一页
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                class="page-num"
                :class="{ active: page === pagination.pageNo }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>

              <button
                class="page-btn"
                :disabled="pagination.pageNo >= totalPages"
                @click="changePage(pagination.pageNo + 1)"
              >
                下一页
              </button>
            </div>

            <div class="page-size">
              <select v-model="pagination.pageSize" class="page-size-select" @change="handleSizeChange">
                <option :value="10">10 条/页</option>
                <option :value="20">20 条/页</option>
                <option :value="50">50 条/页</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div class="modal-overlay" v-if="showDetailDialog" @click="showDetailDialog = false">
      <div class="modal-panel" @click.stop>
        <div class="modal-head">
          <div>
            <span class="modal-kicker">PRACTICE DETAIL</span>
            <h3 class="modal-title">练习详情 #{{ selectedPractice?.id }}</h3>
          </div>
          <button class="modal-close" @click="showDetailDialog = false">关闭</button>
        </div>

        <div class="modal-body" v-if="selectedPractice">
          <section class="modal-summary">
            <article class="modal-summary-item">
              <span class="summary-label">练习时间</span>
              <strong class="summary-value">{{ formatDate(selectedPractice.practiceDate) }}</strong>
            </article>
            <article class="modal-summary-item">
              <span class="summary-label">题目数量</span>
              <strong class="summary-value">{{ selectedPractice.subjectCount }} 题</strong>
            </article>
            <article class="modal-summary-item">
              <span class="summary-label">正确率</span>
              <strong class="summary-value">
                {{ Math.round((selectedPractice.correctCount / selectedPractice.subjectCount) * 100) }}%
              </strong>
            </article>
            <article class="modal-summary-item">
              <span class="summary-label">用时</span>
              <strong class="summary-value">{{ formatTime(selectedPractice.timeSpent) }}</strong>
            </article>
          </section>

          <section class="question-stream">
            <article
              v-for="(question, index) in selectedPractice.questions"
              :key="question.id"
              class="question-row"
              :class="{ incorrect: !question.isCorrect }"
            >
              <div class="question-head">
                <span class="question-index">Q{{ index + 1 }}</span>
                <span class="question-state" :class="{ correct: question.isCorrect }">
                  {{ question.isCorrect ? '正确' : '错误' }}
                </span>
              </div>

              <h4 class="question-title">{{ question.title }}</h4>

              <div class="question-answer">
                <span class="answer-label">你的答案</span>
                <strong class="answer-value" :class="{ wrong: !question.isCorrect }">
                  {{ question.userAnswer }}
                </strong>
              </div>

              <div class="question-answer" v-if="!question.isCorrect">
                <span class="answer-label">正确答案</span>
                <strong class="answer-value correct">{{ question.correctAnswer }}</strong>
              </div>
            </article>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/modules/theme'
import Header from '@/layouts/AppHeader.vue'

const loading = ref(false)
const themeStore = useThemeStore()
const showTypeDropdown = ref(false)
const showDetailDialog = ref(false)
const selectedPractice = ref(null)

const filterForm = reactive({
  startDate: '',
  endDate: '',
  subjectType: ''
})

const stats = ref({
  totalPracticeCount: 25,
  totalSubjectCount: 320,
  averageAccuracy: 82.5,
  totalTime: 45000
})

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

const practiceHistory = ref([])

const totalPages = computed(() => {
  return Math.ceil(pagination.total / pagination.pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.pageNo - 2)
  const end = Math.min(totalPages.value, pagination.pageNo + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const getSubjectTypeLabel = (type) => {
  const typeMap = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '简答题'
  }
  return typeMap[type] || ''
}

const selectType = (type) => {
  filterForm.subjectType = type
  showTypeDropdown.value = false
}

const getAccuracyClass = (correct, total) => {
  const accuracy = correct / total
  if (accuracy >= 0.9) return 'high'
  if (accuracy >= 0.7) return 'medium'
  return 'low'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

const formatTotalTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h${mins}m`
  }
  return `${mins}分钟`
}

const fetchPracticeHistory = () => {
  loading.value = true
  setTimeout(() => {
    practiceHistory.value = [
      { id: 1001, practiceDate: '2025-11-25T14:30:00', subjectCount: 20, correctCount: 18, timeSpent: 1800, subjectType: 1 },
      { id: 1002, practiceDate: '2025-11-24T10:15:00', subjectCount: 15, correctCount: 12, timeSpent: 1200, subjectType: 2 },
      { id: 1003, practiceDate: '2025-11-23T16:45:00', subjectCount: 25, correctCount: 22, timeSpent: 2100, subjectType: 3 },
      { id: 1004, practiceDate: '2025-11-22T09:00:00', subjectCount: 18, correctCount: 15, timeSpent: 1500, subjectType: 1 },
      { id: 1005, practiceDate: '2025-11-21T13:20:00', subjectCount: 22, correctCount: 19, timeSpent: 1980, subjectType: 4 },
      { id: 1006, practiceDate: '2025-11-20T15:00:00', subjectCount: 30, correctCount: 27, timeSpent: 2400, subjectType: 1 },
      { id: 1007, practiceDate: '2025-11-19T11:30:00', subjectCount: 12, correctCount: 10, timeSpent: 900, subjectType: 2 },
      { id: 1008, practiceDate: '2025-11-18T14:45:00', subjectCount: 28, correctCount: 24, timeSpent: 2200, subjectType: 3 }
    ]
    pagination.total = practiceHistory.value.length
    loading.value = false
  }, 500)
}

const resetFilters = () => {
  filterForm.startDate = ''
  filterForm.endDate = ''
  filterForm.subjectType = ''
  fetchPracticeHistory()
}

const viewPracticeDetail = (record) => {
  selectedPractice.value = {
    ...record,
    questions: [
      { id: 1, title: 'Java中String是不可变的吗？', userAnswer: '是', correctAnswer: '是', isCorrect: true },
      { id: 2, title: 'Java中int和Integer有什么区别？', userAnswer: 'int是基本类型，Integer是包装类', correctAnswer: 'int是基本类型，Integer是包装类', isCorrect: true },
      { id: 3, title: 'Java中final关键字的作用是什么？', userAnswer: '用于修饰不可变的变量', correctAnswer: '用于修饰不可变的变量、方法和类', isCorrect: false }
    ]
  }
  showDetailDialog.value = true
}

const exportHistory = () => {
  console.log('导出记录')
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    pagination.pageNo = page
    fetchPracticeHistory()
  }
}

const handleSizeChange = () => {
  pagination.pageNo = 1
  fetchPracticeHistory()
}

onMounted(() => {
  fetchPracticeHistory()
})
</script>

<style scoped>
.practice-history-page {
  --history-bg: #f3f5f8;
  --history-surface: #ffffff;
  --history-surface-soft: #eef2f6;
  --history-border: rgba(15, 23, 42, 0.1);
  --history-line: rgba(15, 23, 42, 0.06);
  --history-text: var(--color-text);
  --history-text-soft: var(--color-text-secondary);
  --history-text-faint: var(--color-text-muted);
  --history-accent: #be123c;
  --history-accent-soft: rgba(190, 18, 60, 0.08);
  --history-accent-line: rgba(190, 18, 60, 0.16);
  min-height: 100vh;
  background: var(--history-bg);
}

.practice-history-page.is-dark {
  --history-bg: #09111c;
  --history-surface: #0f172a;
  --history-surface-soft: #111c31;
  --history-border: rgba(148, 163, 184, 0.14);
  --history-line: rgba(148, 163, 184, 0.1);
  --history-text: var(--text-1);
  --history-text-soft: var(--text-2);
  --history-text-faint: var(--text-3);
  --history-accent: #fb7185;
  --history-accent-soft: rgba(251, 113, 133, 0.12);
  --history-accent-line: rgba(251, 113, 133, 0.18);
}

.main-content {
  padding: 94px 20px 36px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-hero,
.stats-strip,
.toolbar,
.archive-panel,
.modal-panel {
  border: 1px solid var(--history-border);
  background: var(--history-surface);
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
  padding: 22px 24px;
}

.hero-kicker,
.stat-label,
.toolbar-label,
.summary-label,
.modal-kicker {
  color: var(--history-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-title {
  margin: 6px 0 0;
  color: var(--history-text);
  font-size: clamp(30px, 4vw, 42px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.hero-subtitle,
.stat-meta,
.panel-desc {
  color: var(--history-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

.hero-subtitle {
  max-width: 640px;
  margin: 10px 0 0;
}

.export-btn,
.toolbar-btn,
.detail-btn,
.page-btn,
.page-num,
.modal-close,
.dropdown-item {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--history-border);
  background: var(--history-surface);
  color: var(--history-text);
  font-size: 13px;
  font-weight: 700;
}

.toolbar-btn-primary {
  border-color: var(--history-accent);
  background: var(--history-accent);
  color: #ffffff;
}

.practice-history-page.is-dark .toolbar-btn-primary {
  color: #3b0715;
}

.stats-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
  margin-top: 14px;
}

.stat-unit {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-right: 1px solid var(--history-line);
}

.stat-unit:last-child {
  border-right: none;
}

.stat-unit-strong {
  background: var(--history-surface-soft);
}

.stat-value {
  color: var(--history-text);
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: end;
  margin-top: 14px;
  padding: 12px 16px;
}

.toolbar-group {
  display: grid;
  gap: 8px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-input,
.page-size-select {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--history-border);
  background: var(--history-surface-soft);
  color: var(--history-text);
  font-size: 13px;
  outline: none;
}

.toolbar-separator,
.page-info {
  color: var(--history-text-soft);
  font-size: 13px;
}

.type-select {
  position: relative;
  min-width: 150px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--history-border);
  background: var(--history-surface-soft);
  color: var(--history-text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.type-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  display: grid;
  background: var(--history-surface);
  border: 1px solid var(--history-border);
  z-index: 10;
}

.dropdown-item {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--history-line);
  text-align: left;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.archive-panel {
  margin-top: 16px;
  padding: 16px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.panel-title,
.modal-title {
  margin: 0;
  color: var(--history-text);
  font-size: 18px;
}

.panel-desc {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.panel-meta {
  color: var(--history-text-faint);
  font-size: 12px;
  font-weight: 700;
}

.record-stream {
  display: grid;
  gap: 0;
  margin-top: 14px;
}

.record-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px 110px;
  gap: 18px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--history-line);
}

.record-row:last-child {
  border-bottom: none;
}

.record-main,
.record-progress {
  display: grid;
  gap: 8px;
}

.record-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.record-id {
  color: var(--history-text);
  font-size: 18px;
}

.record-type {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border: 1px solid var(--history-border);
  font-size: 12px;
  font-weight: 700;
}

.record-type.type-1 {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.16);
}

.record-type.type-2 {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.08);
  border-color: rgba(124, 58, 237, 0.16);
}

.record-type.type-3 {
  color: #15803d;
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.16);
}

.record-type.type-4 {
  color: var(--history-accent);
  background: var(--history-accent-soft);
  border-color: var(--history-accent-line);
}

.record-date,
.record-stats,
.progress-label {
  color: var(--history-text-soft);
  font-size: 13px;
}

.record-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.progress-track {
  width: 100%;
  height: 8px;
  overflow: hidden;
  background: var(--history-surface-soft);
}

.progress-fill {
  height: 100%;
}

.progress-fill.high {
  background: #15803d;
}

.progress-fill.medium {
  background: #d97706;
}

.progress-fill.low {
  background: #b91c1c;
}

.progress-value {
  color: var(--history-text);
  font-size: 18px;
}

.record-actions {
  display: flex;
  justify-content: end;
}

.detail-btn {
  border-color: var(--history-accent-line);
  background: var(--history-accent-soft);
  color: var(--history-accent);
}

.empty-block {
  margin-top: 16px;
  color: var(--history-text-soft);
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--history-line);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.page-num.active {
  border-color: var(--history-accent-line);
  background: var(--history-accent-soft);
  color: var(--history-accent);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.56);
  z-index: 1000;
}

.practice-history-page.is-dark .modal-overlay {
  background: rgba(2, 6, 23, 0.72);
}

.modal-panel {
  width: min(960px, 100%);
  max-height: 90vh;
  overflow: auto;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
  padding: 18px 20px;
  border-bottom: 1px solid var(--history-line);
}

.modal-body {
  padding: 20px;
}

.modal-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.modal-summary-item {
  display: grid;
  gap: 6px;
  padding: 14px;
  background: var(--history-surface-soft);
  border: 1px solid var(--history-line);
}

.question-stream {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.question-row {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--history-border);
  background: var(--history-surface);
}

.question-row.incorrect {
  border-left: 3px solid #b91c1c;
}

.question-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.question-index,
.answer-label {
  color: var(--history-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.question-state {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border: 1px solid rgba(239, 68, 68, 0.16);
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
  font-size: 12px;
  font-weight: 700;
}

.question-state.correct {
  border-color: rgba(34, 197, 94, 0.16);
  background: rgba(34, 197, 94, 0.08);
  color: #15803d;
}

.practice-history-page.is-dark .question-state {
  color: #fca5a5;
}

.practice-history-page.is-dark .question-state.correct {
  color: #86efac;
}

.question-title,
.answer-value {
  color: var(--history-text);
}

.question-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}

.question-answer {
  display: grid;
  gap: 6px;
}

.answer-value.wrong {
  color: #b91c1c;
}

.answer-value.correct {
  color: #15803d;
}

.practice-history-page.is-dark .answer-value.wrong {
  color: #fca5a5;
}

.practice-history-page.is-dark .answer-value.correct {
  color: #86efac;
}

@media (max-width: 1080px) {
  .main-content {
    padding: 94px 16px 28px;
  }

  .container {
    padding: 0 16px;
  }

  .stats-strip,
  .record-row,
  .modal-summary {
    grid-template-columns: 1fr;
  }

  .stat-unit {
    border-right: none;
    border-bottom: 1px solid var(--history-line);
  }

  .stat-unit:last-child {
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .page-hero,
  .toolbar,
  .pagination {
    flex-direction: column;
    align-items: start;
  }

  .toolbar-actions {
    margin-left: 0;
  }

  .record-actions {
    justify-content: start;
  }

  .date-range {
    flex-wrap: wrap;
  }
}
</style>
