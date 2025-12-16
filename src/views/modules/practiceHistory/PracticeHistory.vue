<template>
  <div class="practice-history-page">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1>我的练习</h1>
        </div>
        
        <!-- 筛选和统计区域 -->
        <el-card class="filter-stats-card">
          <el-row :gutter="20">
            <el-col :span="16">
              <div class="filter-section">
                <el-form :inline="true" :model="filterForm" class="filter-form">
                  <el-form-item label="练习时间">
                    <el-date-picker
                      v-model="filterForm.dateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      value-format="YYYY-MM-DD"
                    />
                  </el-form-item>
                  <el-form-item label="题目类型">
                    <el-select v-model="filterForm.subjectType" placeholder="请选择题目类型" clearable>
                      <el-option label="单选题" :value="1" />
                      <el-option label="多选题" :value="2" />
                      <el-option label="判断题" :value="3" />
                      <el-option label="简答题" :value="4" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="fetchPracticeHistory">搜索</el-button>
                    <el-button @click="resetFilters">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stats-summary">
                <div class="stat-item">
                  <div class="stat-label">总练习次数</div>
                  <div class="stat-value">{{ stats.totalPracticeCount }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">总答题数</div>
                  <div class="stat-value">{{ stats.totalSubjectCount }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">平均正确率</div>
                  <div class="stat-value">{{ stats.averageAccuracy }}%</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- 练习记录列表 -->
        <el-card class="history-card">
          <template #header>
            <div class="history-header">
              <span>练习记录</span>
              <div class="header-actions">
                <el-button @click="exportHistory" :icon="Download">导出记录</el-button>
              </div>
            </div>
          </template>
          
          <el-table 
            :data="practiceHistory" 
            style="width: 100%" 
            v-loading="loading"
            @row-dblclick="viewPracticeDetail"
          >
            <el-table-column prop="id" label="记录ID" width="80" />
            <el-table-column prop="practiceDate" label="练习时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.practiceDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="subjectCount" label="题目数量" width="100" />
            <el-table-column prop="correctCount" label="正确题数" width="100" />
            <el-table-column label="正确率" width="100">
              <template #default="scope">
                <el-progress 
                  :percentage="Math.round((scope.row.correctCount / scope.row.subjectCount) * 100)" 
                  :stroke-width="12"
                  :color="getAccuracyColor(scope.row.correctCount, scope.row.subjectCount)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="timeSpent" label="用时" width="100">
              <template #default="scope">
                {{ formatTime(scope.row.timeSpent) }}
              </template>
            </el-table-column>
            <el-table-column prop="subjectType" label="题目类型" width="100">
              <template #default="scope">
                {{ getSubjectTypeLabel(scope.row.subjectType) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="viewPracticeDetail(scope.row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.pageNo"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
          
          <!-- 空状态 -->
          <el-empty v-if="!loading && practiceHistory.length === 0" description="暂无练习记录" />
        </el-card>
      </div>
    </main>
    
    <!-- 练习详情对话框 -->
    <el-dialog 
      v-model="showDetailDialog" 
      title="练习详情" 
      width="80%"
      @close="handleDialogClose"
    >
      <div v-if="selectedPractice" class="practice-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ selectedPractice.id }}</el-descriptions-item>
          <el-descriptions-item label="练习时间">{{ formatDate(selectedPractice.practiceDate) }}</el-descriptions-item>
          <el-descriptions-item label="题目数量">{{ selectedPractice.subjectCount }}</el-descriptions-item>
          <el-descriptions-item label="正确题数">{{ selectedPractice.correctCount }}</el-descriptions-item>
          <el-descriptions-item label="正确率">{{ Math.round((selectedPractice.correctCount / selectedPractice.subjectCount) * 100) }}%</el-descriptions-item>
          <el-descriptions-item label="用时">{{ formatTime(selectedPractice.timeSpent) }}</el-descriptions-item>
          <el-descriptions-item label="题目类型">{{ getSubjectTypeLabel(selectedPractice.subjectType) }}</el-descriptions-item>
        </el-descriptions>
        
        <h3 style="margin-top: 20px;">题目详情</h3>
        <el-table :data="selectedPractice.questions" style="width: 100%" max-height="400">
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
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import Header from '@/views/components/layout/Header.vue'

// 加载状态
const loading = ref(false)

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  subjectType: ''
})

// 统计数据
const stats = ref({
  totalPracticeCount: 25,
  totalSubjectCount: 320,
  averageAccuracy: 82.5
})

// 分页数据
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 练习历史记录
const practiceHistory = ref([])

// 显示详情对话框
const showDetailDialog = ref(false)

// 选中的练习记录
const selectedPractice = ref(null)

// 获取练习历史数据
const fetchPracticeHistory = () => {
  loading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    // Mock数据
    practiceHistory.value = [
      {
        id: 1001,
        practiceDate: '2025-11-25T14:30:00',
        subjectCount: 20,
        correctCount: 18,
        timeSpent: 1800, // 30分钟
        subjectType: 1
      },
      {
        id: 1002,
        practiceDate: '2025-11-24T10:15:00',
        subjectCount: 15,
        correctCount: 12,
        timeSpent: 1200, // 20分钟
        subjectType: 2
      },
      {
        id: 1003,
        practiceDate: '2025-11-23T16:45:00',
        subjectCount: 25,
        correctCount: 22,
        timeSpent: 2100, // 35分钟
        subjectType: 3
      },
      {
        id: 1004,
        practiceDate: '2025-11-22T09:00:00',
        subjectCount: 18,
        correctCount: 15,
        timeSpent: 1500, // 25分钟
        subjectType: 1
      },
      {
        id: 1005,
        practiceDate: '2025-11-21T13:20:00',
        subjectCount: 22,
        correctCount: 19,
        timeSpent: 1980, // 33分钟
        subjectType: 4
      }
    ]
    
    pagination.total = practiceHistory.value.length
    loading.value = false
  }, 500)
}

// 重置筛选条件
const resetFilters = () => {
  filterForm.dateRange = []
  filterForm.subjectType = ''
  fetchPracticeHistory()
}

// 查看练习详情
const viewPracticeDetail = (row) => {
  selectedPractice.value = {
    ...row,
    questions: [
      {
        id: 1,
        title: 'Java中String是不可变的吗？',
        userAnswer: '是',
        correctAnswer: '是',
        isCorrect: true
      },
      {
        id: 2,
        title: 'Java中int和Integer有什么区别？',
        userAnswer: 'int是基本类型，Integer是包装类',
        correctAnswer: 'int是基本类型，Integer是包装类',
        isCorrect: true
      },
      {
        id: 3,
        title: 'Java中final关键字的作用是什么？',
        userAnswer: '用于修饰不可变的变量',
        correctAnswer: '用于修饰不可变的变量、方法和类',
        isCorrect: false
      }
    ]
  }
  showDetailDialog.value = true
}

// 处理对话框关闭
const handleDialogClose = () => {
  selectedPractice.value = null
}

// 导出练习记录
const exportHistory = () => {
  ElMessage.info('导出功能正在开发中...')
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchPracticeHistory()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  pagination.pageNo = val
  fetchPracticeHistory()
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

// 获取正确率颜色
const getAccuracyColor = (correct, total) => {
  const accuracy = correct / total
  if (accuracy >= 0.9) return '#67c23a' // 绿色
  if (accuracy >= 0.7) return '#e6a23c' // 黄色
  return '#f56c6c' // 红色
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPracticeHistory()
})
</script>

<style scoped>
.practice-history-page {
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

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.filter-stats-card {
  margin-bottom: 24px;
}

.filter-section {
  display: flex;
  align-items: center;
  height: 100%;
}

.filter-form :deep(.el-form-item) {
  margin-right: 20px;
  margin-bottom: 0;
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

.history-card {
  margin-top: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.incorrect-answer {
  color: #f56c6c;
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .filter-stats-card :deep(.el-row) {
    flex-direction: column;
  }
  
  .filter-section {
    margin-bottom: 20px;
  }
  
  .stats-summary {
    flex-direction: row;
  }
}
</style>