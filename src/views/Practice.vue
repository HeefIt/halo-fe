<template>
  <div class="practice" v-loading="loading">
    <Header />
    
    <main class="main">
      <div class="practice-container">
        <div class="problem-header">
          <button class="back-btn" @click="goBackHome">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回
          </button>
          
          <div class="problem-meta">
            <h1 class="problem-title">{{ currentProblem.subjectName }}</h1>
            <div class="problem-tags">
              <span :class="['tag', `tag-${getDifficultyClass(currentProblem.subjectDifficult)}`]">
                {{ getDifficultyLabel(currentProblem.subjectDifficult) }}
              </span>
              <span class="tag tag-type">{{ getSubjectTypeLabel(currentProblem.subjectType) }}</span>
              <span v-for="label in currentProblem.labelName" :key="label" class="tag tag-label">
                {{ label }}
              </span>
            </div>
          </div>
          
          <div class="problem-nav">
            <button class="nav-btn" @click="prevProblem" :disabled="!hasPrevProblem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              上一题
            </button>
            <button class="nav-btn" @click="nextProblem" :disabled="!hasNextProblem">
              下一题
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="problem-content">
          <div v-if="currentProblem.optionList && currentProblem.optionList.length > 0" class="options-section">
            <h3 class="section-title">选择答案</h3>
            
            <div v-if="currentProblem.subjectType === 1" class="options-grid">
              <button
                v-for="option in currentProblem.optionList"
                :key="option.optionType"
                class="option-card"
                :class="{ selected: selectedOption === option.optionType }"
                @click="selectedOption = option.optionType"
              >
                <span class="option-letter">{{ getOptionLabel(option.optionType) }}</span>
                <span class="option-text">{{ option.optionContent }}</span>
              </button>
            </div>
            
            <div v-else-if="currentProblem.subjectType === 2" class="options-grid">
              <button
                v-for="option in currentProblem.optionList"
                :key="option.optionType"
                class="option-card"
                :class="{ selected: selectedOptions.includes(option.optionType) }"
                @click="toggleOption(option.optionType)"
              >
                <span class="option-letter">{{ getOptionLabel(option.optionType) }}</span>
                <span class="option-text">{{ option.optionContent }}</span>
                <span v-if="selectedOptions.includes(option.optionType)" class="check-icon">✓</span>
              </button>
            </div>
            
            <div v-else-if="currentProblem.subjectType === 3" class="options-row">
              <button
                class="option-card option-card-large"
                :class="{ selected: selectedOption === 1 }"
                @click="selectedOption = 1"
              >
                <span class="option-letter">A</span>
                <span class="option-text">正确</span>
              </button>
              <button
                class="option-card option-card-large"
                :class="{ selected: selectedOption === 0 }"
                @click="selectedOption = 0"
              >
                <span class="option-letter">B</span>
                <span class="option-text">错误</span>
              </button>
            </div>
          </div>
          
          <div v-else-if="currentProblem.subjectType === 4" class="answer-section">
            <h3 class="section-title">你的答案</h3>
            <textarea
              v-model="userAnswer"
              class="answer-input"
              placeholder="请在此处输入你的答案..."
              rows="8"
            ></textarea>
          </div>
          
          <div class="actions-section">
            <button class="btn btn-primary" @click="submitAnswer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              提交答案
            </button>
            <button class="btn btn-secondary" @click="showAnalysis = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              查看解析
            </button>
          </div>
        </div>
      </div>
    </main>

    <Transition name="drawer">
      <div v-if="showAnalysis" class="drawer-overlay" @click="showAnalysis = false">
        <div class="drawer" @click.stop>
          <div class="drawer-header">
            <h2 class="drawer-title">题目解析</h2>
            <button class="drawer-close" @click="showAnalysis = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div class="drawer-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'subject' }"
              @click="activeTab = 'subject'"
            >
              题目解析
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'ai' }"
              @click="activeTab = 'ai'"
            >
              AI解析
            </button>
          </div>
          
          <div class="drawer-content">
            <div v-if="activeTab === 'subject'" class="analysis-section">
              <div class="analysis-text">{{ currentProblem.subjectParse }}</div>
              
              <div class="divider"></div>
              
              <div class="correct-answer">
                <h4>正确答案</h4>
                <div class="answer-box">
                  <span v-if="currentProblem.subjectType === 1">{{ getCorrectAnswerForSingleChoice() }}</span>
                  <span v-else-if="currentProblem.subjectType === 2">{{ getCorrectAnswerForMultipleChoice() }}</span>
                  <span v-else-if="currentProblem.subjectType === 3">{{ getCorrectAnswerForTrueFalse() }}</span>
                  <span v-else>{{ currentProblem.subjectAnswer }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="analysis-section">
              <div v-if="aiAnalysisLoading && !aiAnalysisContent" class="ai-loading">
                <div class="loading-spinner"></div>
                <p>AI 正在分析中，马上给你首屏结论...</p>
              </div>
              <div v-else-if="aiAnalysisContent" class="ai-stream-shell">
                <div v-if="aiAnalysisLoading" class="ai-stream-status">AI 正在持续输出...</div>
                <div class="ai-content" v-html="formatAIAnalysisContent(aiAnalysisContent)"></div>
              </div>
              <div v-else class="ai-empty">
                <p>{{ aiAnalysisError || '点击下方按钮获取 AI 智能解析' }}</p>
              </div>
            </div>
          </div>
          
          <div class="drawer-footer">
            <button class="btn btn-secondary" @click="showAnalysis = false">关闭</button>
            <button 
              v-if="activeTab === 'ai'" 
              class="btn btn-primary" 
              @click="analyzeWithAI"
              :disabled="aiAnalysisLoading"
            >
              {{ aiAnalysisLoading ? '解析中...' : aiAnalysisContent ? '重新解析' : 'AI解析' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSubjectInfo, savePracticeRecord } from '@/api/subject'
import { analyzeSubjectWithAI, analyzeSubjectWithAIStream } from '@/api/openai'
import { useUserStore } from '@/stores/user'
import { usePracticeStore } from '@/stores/practice'
import Header from '@/views/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const practiceStore = usePracticeStore()

const loading = ref(false)
const showAnalysis = ref(false)
const activeTab = ref('subject')
const aiAnalysisContent = ref('')
const aiAnalysisLoading = ref(false)
const aiAnalysisError = ref('')

let aiAnalysisAbortController = null
let aiAnalysisBufferedContent = ''
let aiAnalysisFlushTimer = null

const currentProblem = reactive({
  id: null,
  subjectName: '',
  subjectDifficult: 1,
  subjectType: 1,
  subjectParse: '',
  subjectAnswer: '',
  labelName: [],
  optionList: []
})

const selectedOption = ref(null)
const selectedOptions = ref([])
const userAnswer = ref('')
const startTime = ref(null)

const hasPrevProblem = computed(() => practiceStore.hasPrevProblem)
const hasNextProblem = computed(() => practiceStore.hasNextProblem)

const getDifficultyClass = (difficulty) => {
  const map = { 1: 'easy', 2: 'medium', 3: 'hard' }
  return map[difficulty] || 'easy'
}

const getDifficultyLabel = (difficulty) => {
  const map = { 1: '简单', 2: '中等', 3: '困难' }
  return map[difficulty] || ''
}

const getSubjectTypeLabel = (type) => {
  const map = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题' }
  return map[type] || ''
}

const getOptionLabel = (optionType) => {
  const map = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F' }
  return map[optionType] || ''
}

const toggleOption = (optionType) => {
  const index = selectedOptions.value.indexOf(optionType)
  if (index > -1) {
    selectedOptions.value.splice(index, 1)
  } else {
    selectedOptions.value.push(optionType)
  }
}

const getCorrectAnswerForSingleChoice = () => {
  if (!currentProblem.optionList) return ''
  const correctOption = currentProblem.optionList.find(option => option.isCorrect === 1)
  return correctOption ? getOptionLabel(correctOption.optionType) : ''
}

const getCorrectAnswerForMultipleChoice = () => {
  if (!currentProblem.optionList) return ''
  return currentProblem.optionList
    .filter(option => option.isCorrect === 1)
    .map(option => getOptionLabel(option.optionType))
    .sort()
    .join('')
}

const getCorrectAnswerForTrueFalse = () => {
  if (!currentProblem.optionList || currentProblem.optionList.length === 0) return ''
  return currentProblem.optionList[0].isCorrect === 1 ? 'A (正确)' : 'B (错误)'
}

const checkAnswer = (userAnswer, correctAnswer) => {
  if (!correctAnswer) return false
  if (currentProblem.subjectType === 1 || currentProblem.subjectType === 3) {
    return userAnswer === correctAnswer
  }
  if (currentProblem.subjectType === 2) {
    return userAnswer === correctAnswer
  }
  return false
}

const submitAnswer = () => {
  let answer = ''
  let correctAnswer = ''
  
  if (currentProblem.subjectType === 1) {
    answer = selectedOption.value !== null ? getOptionLabel(selectedOption.value) : ''
    const correctOption = currentProblem.optionList.find(option => option.isCorrect === 1)
    if (correctOption) correctAnswer = getOptionLabel(correctOption.optionType)
  } else if (currentProblem.subjectType === 2) {
    answer = selectedOptions.value.map(option => getOptionLabel(option)).sort().join('')
    correctAnswer = currentProblem.optionList
      .filter(option => option.isCorrect === 1)
      .map(option => getOptionLabel(option.optionType))
      .sort()
      .join('')
  } else if (currentProblem.subjectType === 3) {
    answer = selectedOption.value === 1 ? 'A' : selectedOption.value === 0 ? 'B' : ''
    correctAnswer = currentProblem.optionList[0].isCorrect === 1 ? 'A' : 'B'
  } else {
    answer = userAnswer.value
  }
  
  const hasAnswer = (currentProblem.subjectType === 1 && selectedOption.value !== null) || 
                    (currentProblem.subjectType === 3 && selectedOption.value !== null) ||
                    (currentProblem.subjectType === 2 && selectedOptions.value.length > 0) ||
                    (currentProblem.subjectType === 4 && userAnswer.value.trim() !== '')
  
  if (!hasAnswer) {
    ElMessage.warning('请先作答')
    return
  }
  
  const endTime = new Date()
  const timeCost = startTime.value ? Math.floor((endTime - startTime.value) / 1000) : 0
  
  if (currentProblem.subjectType === 4) {
    ElMessage.success('回答得很好，详细请看题目解析')
  } else {
    const isCorrect = checkAnswer(answer, correctAnswer)
    ElMessage({ type: isCorrect ? 'success' : 'error', message: isCorrect ? '回答正确！' : '回答错误，请查看解析' })
  }
  
  saveRecord(answer, correctAnswer, timeCost)
}

const saveRecord = async (userAnswer, correctAnswer, timeCost) => {
  try {
    const isCorrect = checkAnswer(userAnswer, correctAnswer) ? 1 : 0
    const recordData = {
      userId: userStore.userInfo?.id,
      subjectId: currentProblem.id,
      userAnswer: userAnswer,
      isCorrect: isCorrect,
      answerTime: new Date(),
      timeCost: timeCost,
      score: isCorrect ? 100 : 0
    }
    await savePracticeRecord(recordData)
  } catch (error) {
    console.error('保存刷题记录失败:', error)
  }
}

const prevProblem = () => {
  if (practiceStore.moveToPrev()) {
    router.push(`/practice/${practiceStore.currentProblemId}`)
  } else {
    ElMessage.warning('没有上一题了')
  }
}

const nextProblem = () => {
  if (practiceStore.moveToNext()) {
    router.push(`/practice/${practiceStore.currentProblemId}`)
  } else {
    ElMessage.warning('没有下一题了')
  }
}

const goBackHome = () => {
  router.go(-1)
}

const fetchSubjectInfo = async (problemId) => {
  try {
    cancelAIAnalysisStream()
    resetAIAnalysisState()
    loading.value = true
    const res = await getSubjectInfo(problemId)
    if (res.code === 200) {
      Object.assign(currentProblem, res.data)
      if (currentProblem.subjectType === 1 || currentProblem.subjectType === 3) {
        selectedOption.value = null
      } else if (currentProblem.subjectType === 2) {
        selectedOptions.value = []
      } else {
        userAnswer.value = ''
      }
      startTime.value = new Date()
    } else {
      ElMessage.error(res.message || '获取题目详情失败')
    }
  } catch (err) {
    ElMessage.error('获取题目详情失败')
  } finally {
    loading.value = false
  }
}

const resetAIAnalysisState = () => {
  aiAnalysisContent.value = ''
  aiAnalysisError.value = ''
  aiAnalysisLoading.value = false
  aiAnalysisBufferedContent = ''
  if (aiAnalysisFlushTimer) {
    clearTimeout(aiAnalysisFlushTimer)
    aiAnalysisFlushTimer = null
  }
}

const cancelAIAnalysisStream = () => {
  if (aiAnalysisAbortController) {
    aiAnalysisAbortController.abort()
    aiAnalysisAbortController = null
  }
  if (aiAnalysisFlushTimer) {
    clearTimeout(aiAnalysisFlushTimer)
    aiAnalysisFlushTimer = null
  }
  aiAnalysisBufferedContent = ''
}

const flushAIAnalysisBuffer = () => {
  if (!aiAnalysisBufferedContent) {
    aiAnalysisFlushTimer = null
    return
  }

  aiAnalysisContent.value += aiAnalysisBufferedContent
  aiAnalysisBufferedContent = ''
  aiAnalysisFlushTimer = null
}

const queueAIAnalysisChunk = (chunk) => {
  if (!chunk) {
    return
  }

  aiAnalysisBufferedContent += chunk
  if (!aiAnalysisFlushTimer) {
    aiAnalysisFlushTimer = setTimeout(flushAIAnalysisBuffer, 50)
  }
}

const buildUserAnswerForAI = () => {
  if (currentProblem.subjectType === 1) {
    return selectedOption.value !== null ? getOptionLabel(selectedOption.value) : ''
  }

  if (currentProblem.subjectType === 2) {
    return selectedOptions.value
      .map((optionType) => getOptionLabel(optionType))
      .sort()
      .join('')
  }

  if (currentProblem.subjectType === 3) {
    if (selectedOption.value === 1) return 'A'
    if (selectedOption.value === 0) return 'B'
    return ''
  }

  return userAnswer.value.trim()
}

const analyzeWithAI = async () => {
  try {
    cancelAIAnalysisStream()
    resetAIAnalysisState()
    aiAnalysisLoading.value = true
    const aiRequestData = {
      subjectId: currentProblem.id,
      subjectName: currentProblem.subjectName,
      subjectType: currentProblem.subjectType,
      subjectParse: currentProblem.subjectParse,
      subjectAnswer: currentProblem.subjectAnswer,
      optionList: currentProblem.optionList,
      userAnswer: buildUserAnswerForAI(),
      needMistakeAnalysis: true
    }

    aiAnalysisAbortController = new AbortController()

    await analyzeSubjectWithAIStream(aiRequestData, {
      signal: aiAnalysisAbortController.signal,
      onChunk: (payload) => {
        aiAnalysisError.value = ''
        queueAIAnalysisChunk(payload.content || '')
      },
      onDone: (payload) => {
        flushAIAnalysisBuffer()
        if (payload.fullContent) {
          aiAnalysisContent.value = payload.fullContent
        }
      }
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      return
    }

    try {
      const fallbackContent = await analyzeSubjectWithAI({
        subjectId: currentProblem.id,
        subjectName: currentProblem.subjectName,
        subjectType: currentProblem.subjectType,
        subjectParse: currentProblem.subjectParse,
        subjectAnswer: currentProblem.subjectAnswer,
        optionList: currentProblem.optionList,
        userAnswer: buildUserAnswerForAI(),
        needMistakeAnalysis: true
      })
      aiAnalysisContent.value = fallbackContent
      aiAnalysisError.value = ''
    } catch (fallbackError) {
      aiAnalysisError.value = 'AI解析失败，请稍后重试'
    }
  } finally {
    aiAnalysisLoading.value = false
    aiAnalysisAbortController = null
    flushAIAnalysisBuffer()
  }
}

const formatAIAnalysisContent = (content) => {
  if (!content) return ''
  return content
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

onMounted(() => {
  const problemId = route.params.id
  if (problemId) {
    practiceStore.setCurrentProblemId(parseInt(problemId))
    fetchSubjectInfo(problemId)
  } else {
    ElMessage.warning('题目ID不存在')
    router.back()
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    practiceStore.setCurrentProblemId(parseInt(newId))
    fetchSubjectInfo(newId)
  }
})

watch(showAnalysis, (visible) => {
  if (!visible) {
    cancelAIAnalysisStream()
    aiAnalysisLoading.value = false
  }
})

onBeforeUnmount(() => {
  cancelAIAnalysisStream()
})
</script>

<style scoped>
.practice {
  min-height: 100vh;
  background: var(--color-bg);
}

.main {
  padding-top: 64px;
  min-height: 100vh;
}

.practice-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.problem-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  color: var(--color-text);
  border-color: var(--color-border-hover);
}

.problem-meta {
  flex: 1;
}

.problem-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.problem-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-sm);
}

.tag-easy {
  background: var(--color-success-light);
  color: var(--color-success);
}

.tag-medium {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.tag-hard {
  background: var(--color-error-light);
  color: var(--color-error);
}

.tag-type {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.tag-label {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
}

.problem-nav {
  display: flex;
  gap: var(--spacing-sm);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-btn:hover:not(:disabled) {
  color: var(--color-text);
  border-color: var(--color-border-hover);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.problem-content {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.options-row {
  display: flex;
  gap: var(--spacing-md);
}

.option-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.option-card:hover {
  border-color: var(--color-border-hover);
}

.option-card.selected {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}

.option-card-large {
  flex: 1;
  justify-content: center;
}

.option-letter {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.option-card.selected .option-letter {
  background: var(--color-accent);
  color: white;
}

.option-text {
  flex: 1;
  font-size: var(--text-base);
  color: var(--color-text);
  line-height: 1.5;
}

.check-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: white;
  border-radius: 50%;
  font-size: var(--text-xs);
}

.answer-section {
  margin-bottom: var(--spacing-xl);
}

.answer-input {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--text-base);
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  resize: vertical;
  outline: none;
  transition: border-color var(--transition-fast);
}

.answer-input:focus {
  border-color: var(--color-accent);
}

.actions-section {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  margin-top: var(--spacing-xl);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--text-base);
  font-weight: 500;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  color: white;
  background: var(--gradient-primary);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md), 0 0 20px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.drawer {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 480px;
  max-width: 100%;
  background: var(--color-bg-elevated);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.drawer-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.drawer-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: var(--color-bg-subtle);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.drawer-close:hover {
  color: var(--color-text);
  background: var(--color-bg-muted);
}

.drawer-tabs {
  display: flex;
  padding: var(--spacing-md) var(--spacing-lg);
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--color-text);
  background: var(--color-bg-subtle);
}

.tab-btn.active {
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.analysis-section {
  animation: fadeIn var(--transition-base);
}

.analysis-text {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
}

.divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--spacing-xl) 0;
}

.correct-answer h4 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.answer-box {
  padding: var(--spacing-md);
  background: var(--color-success-light);
  border-radius: var(--radius-lg);
  color: var(--color-success);
  font-weight: 600;
  font-size: var(--text-lg);
}

.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-content {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.ai-stream-shell {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.ai-stream-status {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-radius: var(--radius-sm);
}

.ai-content :deep(pre) {
  background: var(--color-bg-subtle);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: var(--spacing-md) 0;
}

.ai-content :deep(code) {
  background: var(--color-bg-subtle);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.ai-content :deep(strong) {
  color: var(--color-text);
}

.ai-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: all var(--transition-slow);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .problem-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .problem-nav {
    width: 100%;
    justify-content: flex-end;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .drawer {
    width: 100%;
  }
}
</style>
