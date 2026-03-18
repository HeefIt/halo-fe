<template>
  <div class="practice-history-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <div class="header-left">
            <h1 class="page-title">我的练习</h1>
            <p class="page-subtitle">回顾每一次练习，见证成长的足迹</p>
          </div>
          <button class="export-btn" @click="exportHistory">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出记录
          </button>
        </div>

        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-visual">
              <svg viewBox="0 0 100 100" class="stat-circle">
                <circle cx="50" cy="50" r="45" class="circle-bg"/>
                <circle cx="50" cy="50" r="45" class="circle-fill" :style="{ strokeDashoffset: 283 - (283 * stats.averageAccuracy / 100) }"/>
              </svg>
              <div class="stat-center">
                <span class="stat-number">{{ stats.averageAccuracy }}</span>
                <span class="stat-unit">%</span>
              </div>
            </div>
            <div class="stat-info">
              <span class="stat-label">平均正确率</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-practice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalPracticeCount }}</span>
              <span class="stat-label">总练习次数</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-questions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalSubjectCount }}</span>
              <span class="stat-label">总答题数</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ formatTotalTime(stats.totalTime) }}</span>
              <span class="stat-label">累计用时</span>
            </div>
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-group">
              <label class="filter-label">练习时间</label>
              <div class="date-range-picker">
                <input 
                  type="date" 
                  v-model="filterForm.startDate"
                  class="date-input"
                />
                <span class="date-separator">至</span>
                <input 
                  type="date" 
                  v-model="filterForm.endDate"
                  class="date-input"
                />
              </div>
            </div>
            <div class="filter-group">
              <label class="filter-label">题目类型</label>
              <div class="type-select" @click="showTypeDropdown = !showTypeDropdown">
                <span class="selected-type">{{ getSubjectTypeLabel(filterForm.subjectType) || '全部类型' }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <div class="type-dropdown" v-if="showTypeDropdown">
                  <div class="dropdown-item" @click.stop="selectType('')">全部类型</div>
                  <div class="dropdown-item" @click.stop="selectType(1)">单选题</div>
                  <div class="dropdown-item" @click.stop="selectType(2)">多选题</div>
                  <div class="dropdown-item" @click.stop="selectType(3)">判断题</div>
                  <div class="dropdown-item" @click.stop="selectType(4)">简答题</div>
                </div>
              </div>
            </div>
            <div class="filter-actions">
              <button class="search-btn" @click="fetchPracticeHistory">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                搜索
              </button>
              <button class="reset-btn" @click="resetFilters">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                重置
              </button>
            </div>
          </div>
        </div>

        <div class="history-list-card">
          <div class="card-header">
            <h3 class="card-title">练习记录</h3>
            <span class="record-count">共 {{ pagination.total }} 条记录</span>
          </div>

          <div class="history-table" v-loading="loading">
            <div class="table-header">
              <div class="col col-id">ID</div>
              <div class="col col-date">练习时间</div>
              <div class="col col-count">题目数</div>
              <div class="col col-correct">正确</div>
              <div class="col col-accuracy">正确率</div>
              <div class="col col-time">用时</div>
              <div class="col col-type">类型</div>
              <div class="col col-action">操作</div>
            </div>

            <div class="table-body">
              <div 
                v-for="record in practiceHistory" 
                :key="record.id"
                class="table-row"
                @dblclick="viewPracticeDetail(record)"
              >
                <div class="col col-id">
                  <span class="record-id">#{{ record.id }}</span>
                </div>
                <div class="col col-date">
                  <div class="date-cell">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{{ formatDate(record.practiceDate) }}</span>
                  </div>
                </div>
                <div class="col col-count">
                  <span class="count-value">{{ record.subjectCount }}</span>
                </div>
                <div class="col col-correct">
                  <span class="correct-value">{{ record.correctCount }}</span>
                </div>
                <div class="col col-accuracy">
                  <div class="accuracy-cell">
                    <div class="accuracy-bar">
                      <div 
                        class="accuracy-fill"
                        :class="getAccuracyClass(record.correctCount, record.subjectCount)"
                        :style="{ width: `${(record.correctCount / record.subjectCount) * 100}%` }"
                      ></div>
                    </div>
                    <span class="accuracy-value">{{ Math.round((record.correctCount / record.subjectCount) * 100) }}%</span>
                  </div>
                </div>
                <div class="col col-time">
                  <div class="time-cell">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{{ formatTime(record.timeSpent) }}</span>
                  </div>
                </div>
                <div class="col col-type">
                  <span class="type-tag" :class="`type-${record.subjectType}`">
                    {{ getSubjectTypeLabel(record.subjectType) }}
                  </span>
                </div>
                <div class="col col-action">
                  <button class="detail-btn" @click="viewPracticeDetail(record)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    详情
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" v-if="!loading && practiceHistory.length === 0">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="url(#emptyGradient)" stroke-width="2" stroke-dasharray="8 4"/>
              <path d="M70 90 L85 105 L70 120" stroke="url(#emptyGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M130 90 L115 105 L130 120" stroke="url(#emptyGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M85 130 Q100 145 115 130" stroke="url(#emptyGradient)" stroke-width="3" stroke-linecap="round"/>
              <defs>
                <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f43f5e"/>
                  <stop offset="100%" stop-color="#ec4899"/>
                </linearGradient>
              </defs>
            </svg>
            <h4>暂无练习记录</h4>
            <p>开始你的第一次练习吧！</p>
          </div>

          <div class="pagination" v-if="pagination.total > 0">
            <div class="page-info">
              显示 {{ (pagination.pageNo - 1) * pagination.pageSize + 1 }} - 
              {{ Math.min(pagination.pageNo * pagination.pageSize, pagination.total) }} 
              条，共 {{ pagination.total }} 条
            </div>
            <div class="page-controls">
              <button 
                class="page-btn" 
                :disabled="pagination.pageNo === 1"
                @click="changePage(pagination.pageNo - 1)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div class="page-numbers">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-num"
                  :class="{ active: page === pagination.pageNo }"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </div>
              <button 
                class="page-btn" 
                :disabled="pagination.pageNo >= totalPages"
                @click="changePage(pagination.pageNo + 1)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
            <div class="page-size-select">
              <select v-model="pagination.pageSize" @change="handleSizeChange">
                <option :value="10">10条/页</option>
                <option :value="20">20条/页</option>
                <option :value="50">50条/页</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div class="modal-overlay" v-if="showDetailDialog" @click="showDetailDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">练习详情</h3>
          <button class="modal-close" @click="showDetailDialog = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedPractice">
          <div class="detail-summary">
            <div class="summary-item">
              <span class="summary-label">记录ID</span>
              <span class="summary-value">#{{ selectedPractice.id }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">练习时间</span>
              <span class="summary-value">{{ formatDate(selectedPractice.practiceDate) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">题目数量</span>
              <span class="summary-value">{{ selectedPractice.subjectCount }} 题</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">正确题数</span>
              <span class="summary-value correct">{{ selectedPractice.correctCount }} 题</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">正确率</span>
              <span class="summary-value highlight">{{ Math.round((selectedPractice.correctCount / selectedPractice.subjectCount) * 100) }}%</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">用时</span>
              <span class="summary-value">{{ formatTime(selectedPractice.timeSpent) }}</span>
            </div>
          </div>

          <div class="questions-section">
            <h4 class="section-title">题目详情</h4>
            <div class="questions-list">
              <div 
                v-for="(question, index) in selectedPractice.questions" 
                :key="question.id"
                class="question-item"
                :class="{ correct: question.isCorrect, incorrect: !question.isCorrect }"
              >
                <div class="question-header">
                  <span class="question-number">Q{{ index + 1 }}</span>
                  <span class="question-status" :class="{ correct: question.isCorrect }">
                    <svg v-if="question.isCorrect" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </div>
                <div class="question-title">{{ question.title }}</div>
                <div class="question-answers">
                  <div class="answer-row">
                    <span class="answer-label">你的答案：</span>
                    <span class="answer-value" :class="{ wrong: !question.isCorrect }">{{ question.userAnswer }}</span>
                  </div>
                  <div class="answer-row" v-if="!question.isCorrect">
                    <span class="answer-label">正确答案：</span>
                    <span class="answer-value correct">{{ question.correctAnswer }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="close-btn" @click="showDetailDialog = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Header from '@/views/components/layout/Header.vue'

const loading = ref(false)
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
  min-height: 100vh;
  --page-accent: #f43f5e;
  --page-accent-soft: #fff1f2;
  --page-accent-line: rgba(244, 63, 94, 0.16);
  background:
    radial-gradient(circle at top left, rgba(244, 63, 94, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.07), transparent 26%),
    linear-gradient(180deg, #fbfdff 0%, #f5f7fb 100%);
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
  margin-bottom: 24px;
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
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 620px;
  line-height: 1.7;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.04);
}

.export-btn:hover {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
  color: var(--color-text);
  transform: translateY(-1px);
}

.export-btn svg {
  width: 18px;
  height: 18px;
}

.stats-overview {
  display: grid;
  grid-template-columns: minmax(240px, 1.2fr) repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 26px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.72), rgba(244, 63, 94, 0.72));
}

.stat-card:hover {
  border-color: var(--page-accent-line);
  transform: translateY(-3px);
  box-shadow: 0 22px 46px rgba(15, 23, 42, 0.08);
}

.stat-card:first-child {
  background:
    radial-gradient(circle at top right, rgba(244, 63, 94, 0.1), transparent 32%),
    rgba(255, 255, 255, 0.96);
}

.stat-visual {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 12px;
}

.stat-circle {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: rgba(148, 163, 184, 0.25);
  stroke-width: 8;
}

.circle-fill {
  fill: none;
  stroke: var(--page-accent);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s ease;
}

.stat-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.stat-unit {
  font-size: 14px;
  color: var(--color-text-muted);
}

.stat-info {
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  margin-bottom: 12px;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon-practice {
  background: rgba(244, 63, 94, 0.12);
  color: #f43f5e;
}

.stat-icon-questions {
  background: rgba(99, 102, 241, 0.12);
  color: #3b82f6;
}

.stat-icon-time {
  background: rgba(16, 185, 129, 0.12);
  color: #22c55e;
}

.stat-content {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 24px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.04);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  color: var(--color-text);
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  min-width: 148px;
}

.date-input:focus {
  border-color: rgba(99, 102, 241, 0.28);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
}

.date-separator {
  color: var(--color-text-muted);
  font-size: 14px;
}

.type-select {
  position: relative;
  min-width: 140px;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.type-select:hover {
  border-color: rgba(15, 23, 42, 0.12);
}

.selected-type {
  font-size: 14px;
  color: var(--color-text);
}

.type-select svg {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
}

.type-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.dropdown-item {
  padding: 12px 14px;
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--page-accent-soft);
  color: var(--page-accent);
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.search-btn, .reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn {
  background: var(--gradient-primary);
  border: none;
  color: white;
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.18);
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(99, 102, 241, 0.22);
}

.reset-btn {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  color: var(--color-text-secondary);
}

.reset-btn:hover {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
  color: var(--color-text);
}

.search-btn svg, .reset-btn svg {
  width: 16px;
  height: 16px;
}

.history-list-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.record-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.table-header {
  display: grid;
  grid-template-columns: 80px 180px 80px 80px 160px 100px 100px 100px;
  padding: 14px 28px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  max-height: 500px;
  overflow-y: auto;
}

.table-body::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-track {
  background: transparent;
}

.table-body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.45);
  border-radius: 3px;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 180px 80px 80px 160px 100px 100px 100px;
  padding: 16px 28px;
  align-items: center;
  border-bottom: 1px solid rgba(15, 23, 42, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
}

.table-row:hover {
  background: rgba(248, 250, 252, 0.88);
}

.col {
  display: flex;
  align-items: center;
}

.record-id {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.date-cell svg {
  width: 16px;
  height: 16px;
  color: rgba(99, 102, 241, 0.66);
}

.count-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.correct-value {
  font-size: 15px;
  font-weight: 600;
  color: #22c55e;
}

.accuracy-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.accuracy-bar {
  flex: 1;
  height: 6px;
  background: rgba(148, 163, 184, 0.18);
  border-radius: 3px;
  overflow: hidden;
}

.accuracy-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.accuracy-fill.high {
  background: linear-gradient(90deg, #22c55e, #10b981);
}

.accuracy-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #eab308);
}

.accuracy-fill.low {
  background: linear-gradient(90deg, #ef4444, #f43f5e);
}

.accuracy-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  min-width: 40px;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.time-cell svg {
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
}

.type-tag {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.type-tag.type-1 {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.type-tag.type-2 {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}

.type-tag.type-3 {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.type-tag.type-4 {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--page-accent-soft);
  border: 1px solid rgba(244, 63, 94, 0.14);
  border-radius: 12px;
  color: var(--page-accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-btn:hover {
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.2);
}

.detail-btn svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state svg {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-state h4 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.page-info {
  font-size: 13px;
  color: var(--color-text-muted);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: rgba(15, 23, 42, 0.12);
  color: var(--color-text);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-btn svg {
  width: 16px;
  height: 16px;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-num {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-num:hover {
  background: #f8fafc;
  color: var(--color-text);
}

.page-num.active {
  background: var(--page-accent-soft);
  color: var(--page-accent);
}

.page-size-select select {
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  color: var(--color-text-secondary);
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: none;
  border-radius: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #eef2f7;
  color: var(--color-text);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.summary-item {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 18px;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.summary-value.correct {
  color: #22c55e;
}

.summary-value.highlight {
  color: var(--page-accent);
}

.questions-section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  padding: 20px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  transition: all 0.3s ease;
}

.question-item.correct {
  border-color: rgba(34, 197, 94, 0.18);
  box-shadow: inset 4px 0 0 rgba(34, 197, 94, 0.55);
}

.question-item.incorrect {
  border-color: rgba(239, 68, 68, 0.18);
  box-shadow: inset 4px 0 0 rgba(239, 68, 68, 0.52);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.question-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.question-status.correct {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.question-status svg {
  width: 14px;
  height: 14px;
}

.question-title {
  font-size: 15px;
  color: var(--color-text);
  margin-bottom: 12px;
  line-height: 1.5;
}

.question-answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.answer-label {
  color: var(--color-text-muted);
}

.answer-value {
  color: var(--color-text);
}

.answer-value.wrong {
  color: #ef4444;
  text-decoration: line-through;
}

.answer-value.correct {
  color: #22c55e;
}

.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  padding: 12px 28px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8fafc;
}

@media (max-width: 1200px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px 140px 60px 60px 140px 80px 80px 80px;
    padding: 12px 16px;
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

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .filter-actions {
    margin-left: 0;
    width: 100%;
  }

  .search-btn, .reset-btn {
    flex: 1;
    justify-content: center;
  }

  .date-range-picker {
    flex-wrap: wrap;
  }

  .detail-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .pagination {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
