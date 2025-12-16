<!--我的练习-->

<template>
  <div class="practice-detail-page">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <!-- 返回按钮 -->
        <div class="back-section">
          <el-button @click="goBack" :icon="ArrowLeft">
            返回我的练习
          </el-button>
        </div>
        
        <!-- 练习详情 -->
        <el-card class="practice-detail-card">
          <template #header>
            <div class="detail-header">
              <h2>练习详情 #{{ practiceDetail.id }}</h2>
              <div class="header-actions">
                <el-button @click="refreshData" :icon="Refresh" circle />
              </div>
            </div>
          </template>
          
          <!-- 练习概览 -->
          <el-descriptions :column="4" border>
            <el-descriptions-item label="练习时间">{{ formatDate(practiceDetail.practiceDate) }}</el-descriptions-item>
            <el-descriptions-item label="题目数量">{{ practiceDetail.subjectCount }}</el-descriptions-item>
            <el-descriptions-item label="正确题数">{{ practiceDetail.correctCount }}</el-descriptions-item>
            <el-descriptions-item label="正确率">{{ Math.round((practiceDetail.correctCount / practiceDetail.subjectCount) * 100) }}%</el-descriptions-item>
            <el-descriptions-item label="用时">{{ formatTime(practiceDetail.timeSpent) }}</el-descriptions-item>
            <el-descriptions-item label="题目类型">{{ getSubjectTypeLabel(practiceDetail.subjectType) }}</el-descriptions-item>
            <el-descriptions-item label="最高得分">{{ practiceDetail.maxScore }}</el-descriptions-item>
            <el-descriptions-item label="获得积分">{{ practiceDetail.earnedPoints }}</el-descriptions-item>
          </el-descriptions>
          
          <!-- 答题分析 -->
          <div class="analysis-section">
            <h3>答题分析</h3>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="analysis-card">
                  <div class="analysis-content">
                    <div class="analysis-title">正确率趋势</div>
                    <div class="analysis-chart">
                      <div class="chart-placeholder">正确率趋势图表</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="analysis-card">
                  <div class="analysis-content">
                    <div class="analysis-title">题目类型分布</div>
                    <div class="analysis-chart">
                      <div class="chart-placeholder">题目类型分布图表</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="analysis-card">
                  <div class="analysis-content">
                    <div class="analysis-title">难度分析</div>
                    <div class="analysis-chart">
                      <div class="chart-placeholder">难度分析图表</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          
          <!-- 题目详情 -->
          <div class="questions-section">
            <h3>题目详情</h3>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="全部题目" name="all">
                <el-table :data="practiceDetail.questions" style="width: 100%">
                  <el-table-column prop="id" label="题目ID" width="80" />
                  <el-table-column prop="title" label="题目标题" />
                  <el-table-column label="用户答案" width="150">
                    <template #default="scope">
                      <span :class="{ 'incorrect-answer': !scope.row.isCorrect }">{{ scope.row.userAnswer }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="是否正确" width="100">
                    <template #default="scope">
                      <el-tag :type="scope.row.isCorrect ? 'success' : 'danger'">
                        {{ scope.row.isCorrect ? '正确' : '错误' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="正确答案" width="150">
                    <template #default="scope">
                      {{ scope.row.correctAnswer }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="scope">
                      <el-button size="small" @click="reviewQuestion(scope.row)">复习</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="错误题目" name="incorrect">
                <el-table :data="incorrectQuestions" style="width: 100%">
                  <el-table-column prop="id" label="题目ID" width="80" />
                  <el-table-column prop="title" label="题目标题" />
                  <el-table-column label="用户答案" width="150">
                    <template #default="scope">
                      <span class="incorrect-answer">{{ scope.row.userAnswer }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="正确答案" width="150">
                    <template #default="scope">
                      {{ scope.row.correctAnswer }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="scope">
                      <el-button size="small" @click="reviewQuestion(scope.row)">复习</el-button>
                      <el-button size="small" type="primary" @click="repracticeQuestion(scope.row)">重练</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, Refresh 
} from '@element-plus/icons-vue'
import Header from '@/views/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()

// 活动标签页
const activeTab = ref('all')

// 练习详情数据 (Mock数据)
const practiceDetail = ref({
  id: 1001,
  practiceDate: '2025-11-25T14:30:00',
  subjectCount: 20,
  correctCount: 18,
  timeSpent: 1800, // 30分钟
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

// 错误题目
const incorrectQuestions = computed(() => {
  return practiceDetail.value.questions.filter(q => !q.isCorrect)
})

// 返回我的练习
const goBack = () => {
  router.push('/practice-history')
}

// 刷新数据
const refreshData = () => {
  // 模拟刷新数据
  console.log('刷新数据')
}

// 复习题目
const reviewQuestion = (question) => {
  console.log('复习题目:', question)
}

// 重练题目
const repracticeQuestion = (question) => {
  console.log('重练题目:', question)
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

// 获取题目类型标签
const getSubjectTypeLabel = (type) => {
  const typeMap = {
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '简答题'
  }
  return typeMap[type] || '未知'
}

// 组件挂载时获取数据
onMounted(() => {
  // 模拟获取练习详情数据
  console.log('获取练习详情数据，ID:', route.params.id)
})
</script>

<style scoped>
.practice-detail-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

/* 主内容区 */
.main-content {
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-section {
  margin-bottom: 20px;
}

.practice-detail-card {
  margin-top: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.analysis-section {
  margin: 30px 0;
}

.analysis-section h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

.analysis-card {
  height: 100%;
}

.analysis-content {
  text-align: center;
}

.analysis-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  color: var(--text-primary);
}

.analysis-chart {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  color: var(--text-secondary);
}

.questions-section {
  margin: 30px 0;
}

.questions-section h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

.incorrect-answer {
  color: #f56c6c;
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .analysis-section :deep(.el-row) {
    flex-direction: column;
  }
  
  .analysis-section :deep(.el-col) {
    margin-bottom: 20px;
  }
}
</style>