<!--
  Practice 刷题页面组件
  功能描述：用户进行题目练习的核心页面
  主要功能：
    - 显示当前题目详情（标题、难度、类型、标签）
    - 支持四种题型的答题：单选题、多选题、判断题、简答题
    - 题目导航：上一题/下一题功能
    - 题目解析：显示题目官方解析和参考答案
    - AI智能解析：调用AI接口获取智能分析
    - 答题提交：提交答案并记录刷题成绩
  使用位置：路由 /practice/:id
-->
<template>
  <div class="practice-page" v-loading="loading">
    <div class="practice-container">
      <!-- 题目信息区域 -->
      <div class="problem-section">
        <div class="problem-header">
          <el-button @click="goBackHome" :icon="ArrowLeft" circle />
          <div class="problem-meta">
            <h1 class="problem-title">{{ currentProblem.subjectName }}</h1>
            <div class="problem-tags">
              <el-tag
                :type="getDifficultyType(currentProblem.subjectDifficult)"
                size="small"
              >
                {{ getDifficultyLabel(currentProblem.subjectDifficult) }}
              </el-tag>
              <el-tag
                :type="getSubjectTypeType(currentProblem.subjectType)"
                size="small"
              >
                {{ getSubjectTypeLabel(currentProblem.subjectType) }}
              </el-tag>
              <el-tag
                v-for="label in currentProblem.labelName"
                :key="label"
                size="small"
                effect="plain"
              >
                {{ label }}
              </el-tag>
            </div>
          </div>
          <div class="navigation-buttons">
            <el-button @click="prevProblem" :disabled="!hasPrevProblem">上一题</el-button>
            <el-button @click="nextProblem" :disabled="!hasNextProblem">下一题</el-button>
          </div>
        </div>
        
        <div class="problem-content">
          <!-- 选择题选项 -->
          <div v-if="currentProblem.optionList && currentProblem.optionList.length > 0" class="problem-options">
            <h3>选项</h3>
            <el-radio-group 
              v-if="currentProblem.subjectType === 1" 
              v-model="selectedOption" 
              class="options-list single-choice"
            >
              <el-radio 
                v-for="option in currentProblem.optionList" 
                :key="option.optionType" 
                :label="option.optionType"
                class="option-item"
              >
                <span class="option-label">{{ getOptionLabel(option.optionType) }}.</span>
                <span class="option-content">{{ option.optionContent }}</span>
              </el-radio>
            </el-radio-group>
            
            <el-checkbox-group 
              v-else-if="currentProblem.subjectType === 2" 
              v-model="selectedOptions" 
              class="options-list"
            >
              <el-checkbox 
                v-for="option in currentProblem.optionList" 
                :key="option.optionType" 
                :label="option.optionType"
                class="option-item"
              >
                <span class="option-label">{{ getOptionLabel(option.optionType) }}.</span>
                <span class="option-content">{{ option.optionContent }}</span>
              </el-checkbox>
            </el-checkbox-group>
            
            <el-radio-group 
              v-else-if="currentProblem.subjectType === 3" 
              v-model="selectedOption" 
              class="options-list true-false"
            >
              <el-radio 
                v-for="option in judgeOptions" 
                :key="option.value" 
                :label="option.value"
                class="option-item"
              >
                <span class="option-label">{{ option.label }}.</span>
                <span class="option-content">{{ option.content }}</span>
              </el-radio>
            </el-radio-group>
          </div>
          
          <!-- 简答题 -->
          <div v-else-if="currentProblem.subjectType === 4" class="problem-answer">
            <h3>你的答案</h3>
            <el-input
              v-model="userAnswer"
              type="textarea"
              :rows="6"
              placeholder="请在此处作答..."
            />
          </div>
          
          <div class="problem-actions">
            <el-button 
              type="primary" 
              @click="submitAnswer"
            >
              提交答案
            </el-button>
            <el-button @click="showAnalysis = true">
              查看解析
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 解析抽屉 -->
    <el-drawer
      v-model="showAnalysis"
      direction="rtl"
      size="50%"
      :modal="true"
      :close-on-click-modal="true"
    >
      <template #header>
        <h2>题目解析</h2>
      </template>
      
      <div class="analysis-content">
        <el-tabs v-model="activeAnalysisTab">
          <el-tab-pane label="题目解析" name="subject">
            <div class="subject-analysis-container">
              <div class="analysis-text">{{ currentProblem.subjectParse }}</div>
              
              <!-- 添加分隔线 -->
              <div class="analysis-separator"></div>
              
              <div v-if="currentProblem.subjectType !== 4" class="correct-answer">
                <h3>正确答案</h3>
                <div class="answer-content">
                  <div v-if="currentProblem.subjectType === 1" class="answer-item">
                    {{ getCorrectAnswerForSingleChoice() }}
                  </div>
                  <div v-else-if="currentProblem.subjectType === 2" class="answer-item">
                    {{ getCorrectAnswerForMultipleChoice() }}
                  </div>
                  <div v-else-if="currentProblem.subjectType === 3" class="answer-item">
                    {{ getCorrectAnswerForTrueFalse() }}
                  </div>
                </div>
              </div>
              <div v-else class="correct-answer">
                <h3>参考答案</h3>
                <div class="answer-content">
                  <div class="answer-item essay-answer">
                    {{ currentProblem.subjectAnswer }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="AI解析" name="ai">
            <div class="ai-analysis-container">
              <div v-if="aiAnalysisLoading" class="ai-loading">
                <el-skeleton animated>
                  <template #template>
                    <el-skeleton-item variant="p" style="width: 100%" />
                    <el-skeleton-item variant="p" style="width: 90%" />
                    <el-skeleton-item variant="p" style="width: 95%" />
                    <el-skeleton-item variant="p" style="width: 85%" />
                  </template>
                </el-skeleton>
              </div>
              <div v-else-if="aiAnalysisContent" class="ai-analysis-content">
                <div class="ai-analysis-text" v-html="formatAIAnalysisContent(aiAnalysisContent)"></div>
              </div>
              <div v-else class="ai-analysis-empty">
                <el-empty description="点击'AI解析'按钮获取智能解析" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <template #footer>
        <el-button @click="showAnalysis = false">关闭</el-button>
        <el-button 
          v-if="activeAnalysisTab === 'ai'" 
          type="primary" 
          @click="analyzeWithAI"
          :loading="aiAnalysisLoading"
        >
          {{ aiAnalysisContent ? '重新解析' : 'AI解析' }}
        </el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSubjectInfo, savePracticeRecord } from '@/api/subject'
import { analyzeSubjectWithAI } from '@/api/openai'
import { useUserStore } from '@/stores/user'
import { usePracticeStore } from '@/stores/practice'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const practiceStore = usePracticeStore()

// 加载状态
const loading = ref(false)

// 是否显示解析
const showAnalysis = ref(false)

// 当前激活的解析标签页
const activeAnalysisTab = ref('subject')

// AI解析内容
const aiAnalysisContent = ref('')

// AI解析加载状态
const aiAnalysisLoading = ref(false)

// 当前题目数据
const currentProblem = reactive({
  id: null,
  subjectName: '',
  subjectDifficult: 1,
  subjectType: 1,
  subjectParse: '',
  labelName: [],
  optionList: []
})

// 用户选择的选项（单选/判断）
const selectedOption = ref(null)

// 用户选择的选项（多选）
const selectedOptions = ref([])

// 用户答案（简答）
const userAnswer = ref('')

// 答题开始时间
const startTime = ref(null)

// 判断题选项
const judgeOptions = computed(() => [
  { value: 1, label: 'A', content: '正确' },
  { value: 0, label: 'B', content: '错误' }
])

// 是否有上一题
const hasPrevProblem = computed(() => {
  return practiceStore.hasPrevProblem
})

// 是否有下一题
const hasNextProblem = computed(() => {
  return practiceStore.hasNextProblem
})

// 获取难度标签类型
const getDifficultyType = (difficulty) => {
  const typeMap = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[difficulty] || ''
}

// 获取难度标签文本
const getDifficultyLabel = (difficulty) => {
  const labelMap = {
    1: '简单',
    2: '中等',
    3: '困难'
  }
  return labelMap[difficulty] || ''
}

// 获取题目类型标签类型
const getSubjectTypeType = (type) => {
  return 'primary'
}

// 获取题目类型标签文本
const getSubjectTypeLabel = (type) => {
  const labelMap = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '简答题'
  }
  return labelMap[type] || ''
}

// 获取选项标签
const getOptionLabel = (optionType) => {
  const labelMap = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F'
  }
  return labelMap[optionType] || ''
}

// 获取单选题的正确答案
const getCorrectAnswerForSingleChoice = () => {
  if (!currentProblem.optionList) return ''
  const correctOption = currentProblem.optionList.find(option => option.isCorrect === 1)
  return correctOption ? getOptionLabel(correctOption.optionType) : ''
}

// 获取多选题的正确答案
const getCorrectAnswerForMultipleChoice = () => {
  if (!currentProblem.optionList) return ''
  return currentProblem.optionList
    .filter(option => option.isCorrect === 1)
    .map(option => getOptionLabel(option.optionType))
    .sort()
    .join('')
}

// 获取判断题的正确答案
const getCorrectAnswerForTrueFalse = () => {
  if (!currentProblem.optionList || currentProblem.optionList.length === 0) return ''
  return currentProblem.optionList[0].isCorrect === 1 ? 'A' : 'B'
}

// 格式化多选答案
const formatMultipleAnswer = (answer) => {
  if (!answer) return ''
  return answer
    .split('')
    .map(code => getOptionLabel(parseInt(code)))
    .join(', ')
}

// 检查答案是否正确
const checkAnswer = (userAnswer, correctAnswer) => {
  console.log('检查答案:', { userAnswer, correctAnswer, subjectType: currentProblem.subjectType });
  
  if (!correctAnswer) return false
  
  // 对于单选题，直接比较答案
  if (currentProblem.subjectType === 1) {
    return userAnswer === correctAnswer
  }
  
  // 对于判断题，需要特殊处理
  if (currentProblem.subjectType === 3) {
    return userAnswer === correctAnswer
  }
  
  // 对于多选题，直接比较（因为之前已经排序过了）
  if (currentProblem.subjectType === 2) {
    return userAnswer === correctAnswer
  }
  
  return false
}

// 提交答案
const submitAnswer = () => {
  let answer = ''
  let correctAnswer = ''
  
  if (currentProblem.subjectType === 1) {
    // 单选题
    answer = selectedOption.value !== null ? getOptionLabel(selectedOption.value) : ''
    // 获取正确答案
    const correctOption = currentProblem.optionList.find(option => option.isCorrect === 1)
    if (correctOption) {
      correctAnswer = getOptionLabel(correctOption.optionType)
    }
  } else if (currentProblem.subjectType === 2) {
    // 多选题
    answer = selectedOptions.value
      .map(option => getOptionLabel(option))
      .sort() // 多选题答案需要排序
      .join('')
    // 获取正确答案
    correctAnswer = currentProblem.optionList
      .filter(option => option.isCorrect === 1)
      .map(option => getOptionLabel(option.optionType))
      .sort()
      .join('')
  } else if (currentProblem.subjectType === 3) {
    // 判断题，需要特殊处理
    if (selectedOption.value === 1) {
      answer = 'A' // 正确
    } else if (selectedOption.value === 0) {
      answer = 'B' // 错误
    }
    // 获取正确答案
    correctAnswer = currentProblem.optionList[0].isCorrect === 1 ? 'A' : 'B'
  } else {
    // 简答题
    answer = userAnswer.value
  }
  
  // 检查是否已作答（判断题和单选题检查选项，简答题和多选题检查内容）
  const hasAnswer = (currentProblem.subjectType === 1 && selectedOption.value !== null) || 
                    (currentProblem.subjectType === 3 && selectedOption.value !== null) ||
                    (currentProblem.subjectType === 2 && selectedOptions.value.length > 0) ||
                    (currentProblem.subjectType === 4 && userAnswer.value.trim() !== '')
  
  if (!hasAnswer) {
    ElMessage.warning('请先作答')
    return
  }
  
  // 计算答题耗时
  const endTime = new Date()
  const timeCost = startTime.value ? Math.floor((endTime - startTime.value) / 1000) : 0
  
  // 根据题目类型给出不同的反馈
  if (currentProblem.subjectType === 4) {
    // 简答题直接提示
    ElMessage.success('回答得很好，详细请看题目解析')
  } else {
    // 对于选择题和判断题，直接使用题目详情中的正确答案进行判断
    const isCorrect = checkAnswer(answer, correctAnswer)
    
    if (isCorrect) {
      ElMessage.success('回答正确！')
    } else {
      ElMessage.error('回答错误，请查看解析')
    }
  }
  
  // 保存刷题记录
  saveRecord(answer, correctAnswer, timeCost)
}

// 保存刷题记录到数据库
const saveRecord = async (userAnswer, correctAnswer, timeCost) => {
  try {
    // 判断答案是否正确
    const isCorrect = checkAnswer(userAnswer, correctAnswer) ? 1 : 0
    
    // 构造刷题记录数据
    const recordData = {
      userId: userStore.userInfo?.id,
      subjectId: currentProblem.id,
      userAnswer: userAnswer,
      isCorrect: isCorrect,
      answerTime: new Date(),
      timeCost: timeCost,
      score: isCorrect ? 100 : 0 // 简单处理，正确得100分，错误得0分
    }
    
    // 调用API保存记录
    await savePracticeRecord(recordData)
    console.log('刷题记录保存成功')
  } catch (error) {
    console.error('保存刷题记录失败:', error)
    ElMessage.error('保存刷题记录失败')
  }
}

// 关闭解析面板前的处理
const handleCloseAnalysis = (done) => {
  // 直接关闭，无需确认
  done()
}

// 上一题
const prevProblem = () => {
  if (practiceStore.moveToPrev()) {
    const prevId = practiceStore.currentProblemId
    router.push(`/practice/${prevId}`)
  } else {
    ElMessage.warning('没有上一题了')
  }
}

// 下一题
const nextProblem = () => {
  if (practiceStore.moveToNext()) {
    const nextId = practiceStore.currentProblemId
    router.push(`/practice/${nextId}`)
  } else {
    ElMessage.warning('没有下一题了')
  }
}

// 返回上一页
const goBackHome = () => {
  router.go(-1)
}

// 获取题目详情
const fetchSubjectInfo = async (problemId) => {
  try {
    loading.value = true
    const res = await getSubjectInfo(problemId)
    
    if (res.code === 200) {
      // 更新当前题目数据
      Object.assign(currentProblem, res.data)
      
      // 重置用户选择
      if (currentProblem.subjectType === 1 || currentProblem.subjectType === 3) {
        selectedOption.value = null
      } else if (currentProblem.subjectType === 2) {
        selectedOptions.value = []
      } else {
        userAnswer.value = ''
      }
      
      // 记录开始答题时间
      startTime.value = new Date()
    } else {
      ElMessage.error(res.message || '获取题目详情失败')
    }
  } catch (err) {
    ElMessage.error('获取题目详情失败: ' + err.message)
  } finally {
    loading.value = false
  }
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

// 监听路由参数变化，当用户点击上一题或下一题时重新加载题目
watch(() => route.params.id, (newId) => {
  if (newId) {
    practiceStore.setCurrentProblemId(parseInt(newId))
    fetchSubjectInfo(newId)
  }
})

// AI解析题目
const analyzeWithAI = async () => {
  // 如果当前不在AI解析标签页，切换到AI解析标签页
  if (activeAnalysisTab.value !== 'ai') {
    activeAnalysisTab.value = 'ai'
  }
  
  try {
    // 设置加载状态
    aiAnalysisLoading.value = true
    aiAnalysisContent.value = ''
    
    // 构造发送给AI的数据
    const aiRequestData = {
      subjectName: currentProblem.subjectName,
      subjectType: currentProblem.subjectType,
      subjectParse: currentProblem.subjectParse,
      subjectAnswer: currentProblem.subjectAnswer,
      optionList: currentProblem.optionList
    }

    // 调用AI解析接口
    const response = await analyzeSubjectWithAI(aiRequestData)
    
    // 设置AI解析内容
    aiAnalysisContent.value = response
  } catch (error) {
    console.error('AI解析失败:', error)
    // 根据错误类型显示不同的提示信息
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('AI解析超时，请稍后重试')
      aiAnalysisContent.value = 'AI解析超时，请稍后重试'
    } else {
      ElMessage.error('AI解析失败: ' + (error.message || '未知错误'))
      aiAnalysisContent.value = 'AI解析失败，请稍后重试'
    }
  } finally {
    aiAnalysisLoading.value = false
  }
}

// 格式化AI解析内容
const formatAIAnalysisContent = (content) => {
  if (!content) return ''
  
  // 先处理代码块，避免与其他格式冲突
  let formattedContent = content
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  
  // 按行处理其他格式
  const lines = formattedContent.split('\n')
  const processedLines = []
  let inList = false
  let listType = null // 'ul' or 'ol'
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    
    // 处理空行
    if (line.trim() === '') {
      if (inList) {
        // 结束列表
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
        inList = false
        listType = null
      }
      processedLines.push('<br>')
      continue
    }
    
    // 处理标题
    if (line.startsWith('### ')) {
      if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
        inList = false
        listType = null
      }
      processedLines.push(`<h3>${escapeHtml(line.substring(4))}</h3>`)
    } else if (line.startsWith('## ')) {
      if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
        inList = false
        listType = null
      }
      processedLines.push(`<h2>${escapeHtml(line.substring(3))}</h2>`)
    } else if (line.startsWith('# ')) {
      if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
        inList = false
        listType = null
      }
      processedLines.push(`<h1>${escapeHtml(line.substring(2))}</h1>`)
    } 
    // 处理无序列表项
    else if (line.startsWith('- ')) {
      if (!inList || listType !== 'ul') {
        if (inList) {
          processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
        }
        processedLines.push('<ul>')
        inList = true
        listType = 'ul'
      }
      // 处理列表项中的行内格式
      let listItemContent = formatInlineMarkdown(line.substring(2))
      processedLines.push(`<li>${listItemContent}</li>`)
    } 
    // 处理有序列表项
    else if (/^\d+\.\s/.test(line)) {
      if (!inList || listType !== 'ol') {
        if (inList) {
          processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
        }
        processedLines.push('<ol>')
        inList = true
        listType = 'ol'
      }
      // 处理列表项中的行内格式
      let listItemContent = formatInlineMarkdown(line.replace(/^\d+\.\s*/, ''))
      processedLines.push(`<li>${listItemContent}</li>`)
    } 
    // 处理引用
    else if (line.startsWith('> ')) {
      if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
        inList = false
        listType = null
      }
      // 处理引用中的行内格式
      let blockquoteContent = formatInlineMarkdown(line.substring(2))
      processedLines.push(`<blockquote>${blockquoteContent}</blockquote>`)
    } 
    // 处理普通段落
    else {
      if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
        inList = false
        listType = null
      }
      
      // 处理段落中的行内格式
      let paragraphContent = formatInlineMarkdown(line)
      processedLines.push(`<p>${paragraphContent}</p>`)
    }
  }
  
  // 如果最后还在列表中，关闭列表标签
  if (inList) {
    processedLines.push(listType === 'ul' ? '</ul>' : '</ol>')
  }
  
  return processedLines.join('')
}

// 转义HTML特殊字符
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return text.replace(/[&<>"']/g, function(m) { return map[m] })
}

// 格式化行内Markdown语法
const formatInlineMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // 斜体
    .replace(/`(.*?)`/g, '<code>$1</code>')            // 行内代码
}
</script>

<style scoped>
.practice-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

.practice-container {
  height: 100vh;
}

/* 题目信息区域 */
.problem-section {
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.problem-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.problem-meta {
  flex: 1;
}

.navigation-buttons {
  display: flex;
  gap: 12px;
}

.problem-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.problem-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.problem-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.problem-description {
  line-height: 1.6;
  white-space: pre-wrap;
}

.problem-options h3,
.problem-answer h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 单选题选项布局 - 使用Grid实现两列布局 */
.options-list.single-choice {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* 判断题选项布局 - 水平排列 */
.options-list.true-false {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 24px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  transition: background-color 0.2s;
  border: 1px solid var(--border-color);
  min-height: 50px;
}

.option-item:hover {
  background-color: #f5f7fa;
}

.option-item :deep(.el-radio__input),
.option-item :deep(.el-checkbox__input) {
  margin-right: 12px;
}

.option-item :deep(.el-radio__label),
.option-item :deep(.el-checkbox__label) {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0;
}

.option-item :deep(.el-radio__label):before,
.option-item :deep(.el-checkbox__label):before {
  content: '';
  display: none;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 24px;
}

.option-content {
  flex: 1;
}

.problem-answer .el-textarea {
  margin-bottom: 16px;
}

.problem-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 0;
}

/* 解析区域 */
.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

/* 题目解析容器 */
.subject-analysis-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 10px;
}

.analysis-text {
  line-height: 1.6;
  white-space: pre-wrap;
  flex: 1;
}

/* 解析内容分隔线 */
.analysis-separator {
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
  flex-shrink: 0;
}

.correct-answer h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  flex-shrink: 0;
}

.answer-content {
  padding: 16px;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  color: #67c23a;
  font-weight: 500;
  font-size: 16px;
  flex-shrink: 0;
}

.answer-item {
  padding: 8px 0;
}

.essay-answer {
  white-space: pre-wrap;
  line-height: 1.6;
}

/* AI解析区域 */
.ai-analysis-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ai-analysis-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* AI解析文本样式优化 */
.ai-analysis-text {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}

.ai-analysis-text h1,
.ai-analysis-text h2,
.ai-analysis-text h3 {
  margin: 20px 0 15px 0;
  font-weight: 600;
  line-height: 1.3;
}

.ai-analysis-text h1 {
  font-size: 24px;
  color: #1a6eff;
  border-bottom: 2px solid #1a6eff;
  padding-bottom: 8px;
}

.ai-analysis-text h2 {
  font-size: 20px;
  color: #1a6eff;
  border-bottom: 1px solid #1a6eff;
  padding-bottom: 6px;
}

.ai-analysis-text h3 {
  font-size: 18px;
  color: #1a6eff;
}

.ai-analysis-text p {
  margin: 12px 0;
  line-height: 1.8;
  text-align: justify;
}

.ai-analysis-text strong {
  color: #e65100;
  font-weight: 600;
  background-color: rgba(230, 81, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
}

.ai-analysis-text em {
  color: #00695c;
  font-style: italic;
  background-color: rgba(0, 105, 92, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
}

.ai-analysis-text ul,
.ai-analysis-text ol {
  padding-left: 24px;
  margin: 15px 0;
}

.ai-analysis-text li {
  margin: 10px 0;
  line-height: 1.6;
}

.ai-analysis-text code {
  background-color: #e3f2fd;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #0d47a1;
  font-size: 14px;
}

.ai-analysis-text pre {
  background-color: #e8f5e9;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 15px 0;
  color: #2e7d32;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ai-analysis-text blockquote {
  border-left: 4px solid #1a6eff;
  padding: 10px 20px;
  margin: 15px 0;
  background-color: #e3f2fd;
  color: #0d47a1;
  border-radius: 0 4px 4px 0;
}

.ai-analysis-text blockquote p {
  margin: 0;
}

.ai-analysis-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-loading {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  /* 在小屏幕上，单选题选项改为单列布局 */
  .options-list.single-choice {
    grid-template-columns: 1fr;
  }
  
  /* 在小屏幕上，判断题选项改为垂直排列 */
  .options-list.true-false {
    flex-direction: column;
    gap: 12px;
  }
  
  /* 在小屏幕上，解析面板占据更多空间 */
  :deep(.el-drawer) {
    width: 80% !important;
  }
  
  /* 在小屏幕上调整AI解析内容的padding */
  .ai-analysis-content {
    padding: 15px;
    margin: 5px;
  }
}
</style>