<template>
  <div
    class="practice-detail-page app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main-content">
      <div class="container">
        <div class="back-row">
          <button class="back-btn" @click="goBack">返回练习记录</button>
        </div>

        <section class="hero-panel">
          <div class="hero-copy">
            <span class="hero-kicker">PRACTICE DETAIL</span>
            <h1 class="hero-title">练习详情 #{{ practiceDetail.id }}</h1>
          </div>

          <button class="refresh-btn" @click="refreshData">刷新数据</button>
        </section>

        <section class="summary-strip">
          <article class="summary-unit summary-unit-strong">
            <span class="summary-label">正确率</span>
            <strong class="summary-value">{{ accuracyRate }}%</strong>
            <span class="summary-meta">本次练习共 {{ practiceDetail.subjectCount }} 题</span>
          </article>
          <article class="summary-unit">
            <span class="summary-label">练习时间</span>
            <strong class="summary-value">{{ formatDate(practiceDetail.practiceDate) }}</strong>
            <span class="summary-meta">{{ getSubjectTypeLabel(practiceDetail.subjectType) }}</span>
          </article>
          <article class="summary-unit">
            <span class="summary-label">获得积分</span>
            <strong class="summary-value">{{ practiceDetail.earnedPoints }}</strong>
            <span class="summary-meta">最高得分 {{ practiceDetail.maxScore }}</span>
          </article>
        </section>

        <div class="content-grid">
          <section class="review-panel">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">题目回顾</h2>
              </div>

              <div class="filter-tabs">
                <button
                  class="filter-tab"
                  :class="{ active: activeTab === 'all' }"
                  @click="activeTab = 'all'"
                >
                  全部题目
                </button>
                <button
                  class="filter-tab"
                  :class="{ active: activeTab === 'incorrect' }"
                  @click="activeTab = 'incorrect'"
                >
                  错误题目
                </button>
              </div>
            </div>

            <div class="question-stream">
              <article
                v-for="(question, index) in displayedQuestions"
                :key="question.id"
                class="question-row"
                :class="{ incorrect: !question.isCorrect }"
              >
                <div class="question-head">
                  <div class="question-index-row">
                    <span class="question-index">Q{{ index + 1 }}</span>
                    <span class="question-state" :class="{ correct: question.isCorrect }">
                      {{ question.isCorrect ? '正确' : '错误' }}
                    </span>
                  </div>

                  <div class="question-actions">
                    <button class="action-btn" @click="reviewQuestion(question)">复习</button>
                    <button
                      v-if="!question.isCorrect"
                      class="action-btn action-btn-primary"
                      @click="repracticeQuestion(question)"
                    >
                      重练
                    </button>
                  </div>
                </div>

                <h3 class="question-title">{{ question.title }}</h3>

                <div class="answer-grid">
                  <div class="answer-item">
                    <span class="answer-label">你的答案</span>
                    <strong class="answer-value" :class="{ wrong: !question.isCorrect }">
                      {{ question.userAnswer }}
                    </strong>
                  </div>

                  <div class="answer-item">
                    <span class="answer-label">正确答案</span>
                    <strong class="answer-value correct">{{ question.correctAnswer }}</strong>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <aside class="aside-column">
            <section class="aside-panel">
              <div class="panel-head">
                <div>
                  <h2 class="panel-title">本次统计</h2>
                </div>
              </div>

              <div class="note-list">
                <div class="note-item">
                  <span class="note-label">答对题数</span>
                  <strong class="note-value">{{ practiceDetail.correctCount }}</strong>
                </div>
                <div class="note-item">
                  <span class="note-label">错误题数</span>
                  <strong class="note-value">{{ incorrectQuestions.length }}</strong>
                </div>
                <div class="note-item">
                  <span class="note-label">总用时</span>
                  <strong class="note-value">{{ formatTime(practiceDetail.timeSpent) }}</strong>
                </div>
              </div>
            </section>

            <section class="aside-panel">
              <div class="panel-head">
                <div>
                  <h2 class="panel-title">分析摘要</h2>
                </div>
              </div>

              <div class="insight-list">
                <div class="insight-item">
                  <span class="insight-label">正确率趋势</span>
                  <strong class="insight-value">{{ accuracyRate >= 90 ? '状态稳定' : '仍有提升空间' }}</strong>
                </div>
                <div class="insight-item">
                  <span class="insight-label">题型表现</span>
                  <strong class="insight-value">{{ getSubjectTypeLabel(practiceDetail.subjectType) }}</strong>
                </div>
                <div class="insight-item">
                  <span class="insight-label">建议动作</span>
                  <strong class="insight-value">{{ incorrectQuestions.length ? '优先复盘错题' : '可以继续下一组练习' }}</strong>
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
import { useThemeStore } from '@/stores/theme'
import Header from '@/views/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const activeTab = ref('all')

const practiceDetail = ref({
  id: 1001,
  practiceDate: '2025-11-25T14:30:00',
  subjectCount: 20,
  correctCount: 18,
  timeSpent: 1800,
  subjectType: 1,
  maxScore: 180,
  earnedPoints: 18,
  questions: [
    {
      id: 1,
      title: 'Java中String是不可变的吗？',
      userAnswer: '是',
      correctAnswer: '是',
      isCorrect: true,
      difficulty: 1
    },
    {
      id: 2,
      title: 'Java中int和Integer有什么区别？',
      userAnswer: 'int是基本类型，Integer是包装类',
      correctAnswer: 'int是基本类型，Integer是包装类',
      isCorrect: true,
      difficulty: 1
    },
    {
      id: 3,
      title: 'Java中final关键字的作用是什么？',
      userAnswer: '用于修饰不可变的变量',
      correctAnswer: '用于修饰不可变的变量、方法和类',
      isCorrect: false,
      difficulty: 2
    },
    {
      id: 4,
      title: 'Java中equals和==有什么区别？',
      userAnswer: 'equals比较值，==比较引用',
      correctAnswer: 'equals比较值，==比较引用',
      isCorrect: true,
      difficulty: 2
    },
    {
      id: 5,
      title: 'Java中接口和抽象类有什么区别？',
      userAnswer: '接口只能有抽象方法，抽象类可以有具体方法',
      correctAnswer: '接口只能有抽象方法，抽象类可以有具体方法',
      isCorrect: false,
      difficulty: 3
    }
  ]
})

const incorrectQuestions = computed(() => {
  return practiceDetail.value.questions.filter(q => !q.isCorrect)
})

const displayedQuestions = computed(() => {
  return activeTab.value === 'incorrect' ? incorrectQuestions.value : practiceDetail.value.questions
})

const accuracyRate = computed(() => {
  if (!practiceDetail.value.subjectCount) {
    return 0
  }
  return Math.round((practiceDetail.value.correctCount / practiceDetail.value.subjectCount) * 100)
})

const goBack = () => {
  router.push('/practice-history')
}

const refreshData = () => {
  console.log('刷新数据')
}

const reviewQuestion = (question) => {
  console.log('复习题目:', question)
}

const repracticeQuestion = (question) => {
  console.log('重练题目:', question)
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

const getSubjectTypeLabel = (type) => {
  const typeMap = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '简答题'
  }
  return typeMap[type] || '未知'
}

onMounted(() => {
  console.log('获取练习详情数据，ID:', route.params.id)
})
</script>

<style scoped>
.practice-detail-page {
  --detail-bg: #f3f5f8;
  --detail-surface: #ffffff;
  --detail-surface-soft: #eef2f6;
  --detail-border: rgba(15, 23, 42, 0.1);
  --detail-line: rgba(15, 23, 42, 0.06);
  --detail-text: var(--color-text);
  --detail-text-soft: var(--color-text-secondary);
  --detail-text-faint: var(--color-text-muted);
  --detail-accent: #2563eb;
  --detail-accent-soft: rgba(37, 99, 235, 0.08);
  --detail-accent-line: rgba(37, 99, 235, 0.16);
  min-height: 100vh;
  background: var(--detail-bg);
}

.practice-detail-page.is-dark {
  --detail-bg: #09111c;
  --detail-surface: #0f172a;
  --detail-surface-soft: #111c31;
  --detail-border: rgba(148, 163, 184, 0.14);
  --detail-line: rgba(148, 163, 184, 0.1);
  --detail-text: var(--text-1);
  --detail-text-soft: var(--text-2);
  --detail-text-faint: var(--text-3);
  --detail-accent: #60a5fa;
  --detail-accent-soft: rgba(96, 165, 250, 0.12);
  --detail-accent-line: rgba(96, 165, 250, 0.18);
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
.refresh-btn,
.filter-tab,
.action-btn {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--detail-border);
  background: var(--detail-surface);
  color: var(--detail-text);
  font-size: 13px;
  font-weight: 700;
}

.hero-panel,
.summary-strip,
.review-panel,
.aside-panel {
  border: 1px solid var(--detail-border);
  background: var(--detail-surface);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
  padding: 22px 24px;
}

.hero-kicker,
.summary-label,
.answer-label,
.note-label,
.insight-label {
  color: var(--detail-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-title {
  margin: 6px 0 0;
  color: var(--detail-text);
  font-size: clamp(30px, 4vw, 42px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.hero-subtitle,
.summary-meta,
.panel-desc {
  color: var(--detail-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

.hero-subtitle {
  max-width: 640px;
  margin: 10px 0 0;
}

.refresh-btn {
  border-color: var(--detail-accent-line);
  background: var(--detail-accent-soft);
  color: var(--detail-accent);
}

.summary-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) repeat(2, minmax(0, 1fr));
  margin-top: 14px;
}

.summary-unit {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-right: 1px solid var(--detail-line);
}

.summary-unit:last-child {
  border-right: none;
}

.summary-unit-strong {
  background: var(--detail-surface-soft);
}

.summary-value {
  color: var(--detail-text);
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.36fr) 320px;
  gap: 16px;
  margin-top: 16px;
}

.review-panel,
.aside-panel {
  padding: 16px;
}

.aside-column {
  display: grid;
  gap: 16px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.panel-title {
  margin: 0;
  color: var(--detail-text);
  font-size: 18px;
}

.panel-desc {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab.active,
.action-btn-primary {
  border-color: var(--detail-accent);
  background: var(--detail-accent-soft);
  color: var(--detail-accent);
}

.question-stream,
.note-list,
.insight-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.question-row {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--detail-border);
  background: var(--detail-surface);
}

.question-row.incorrect {
  border-left: 3px solid #b91c1c;
}

.question-head,
.question-index-row,
.question-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.question-head {
  justify-content: space-between;
}

.question-index {
  color: var(--detail-text-faint);
  font-size: 12px;
  font-weight: 700;
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

.practice-detail-page.is-dark .question-state {
  color: #fca5a5;
}

.practice-detail-page.is-dark .question-state.correct {
  color: #86efac;
}

.question-title {
  margin: 0;
  color: var(--detail-text);
  font-size: 16px;
  line-height: 1.7;
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.answer-item {
  display: grid;
  gap: 6px;
  padding: 12px;
  background: var(--detail-surface-soft);
  border: 1px solid var(--detail-line);
}

.answer-value {
  color: var(--detail-text);
  font-size: 14px;
  line-height: 1.6;
}

.answer-value.wrong {
  color: #b91c1c;
}

.answer-value.correct {
  color: #15803d;
}

.practice-detail-page.is-dark .answer-value.wrong {
  color: #fca5a5;
}

.practice-detail-page.is-dark .answer-value.correct {
  color: #86efac;
}

.note-item,
.insight-item {
  display: grid;
  gap: 6px;
  padding: 12px 0;
  border-bottom: 1px solid var(--detail-line);
}

.note-item:last-child,
.insight-item:last-child {
  border-bottom: none;
}

.note-value,
.insight-value {
  color: var(--detail-text);
  font-size: 16px;
  line-height: 1.5;
}

@media (max-width: 1080px) {
  .main-content {
    padding: 94px 16px 28px;
  }

  .container {
    padding: 0 16px;
  }

  .summary-strip,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .summary-unit {
    border-right: none;
    border-bottom: 1px solid var(--detail-line);
  }

  .summary-unit:last-child {
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .hero-panel,
  .panel-head,
  .question-head {
    flex-direction: column;
    align-items: start;
  }

  .answer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
