<template>
  <div class="study-plan-detail-page">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <!-- 返回按钮 -->
        <div class="back-section">
          <el-button @click="goBack" :icon="ArrowLeft">
            返回学习计划列表
          </el-button>
        </div>
        
        <!-- 计划详情头部 -->
        <el-card class="plan-header-card">
          <div class="plan-header">
            <div class="plan-basic-info">
              <h1>{{ currentPlan.title }}</h1>
              <div class="plan-meta">
                <el-tag :type="getPlanStatusType(currentPlan.status)" size="large">
                  {{ getPlanStatusText(currentPlan.status) }}
                </el-tag>
                <span class="plan-date">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(currentPlan.startDate) }} 至 {{ formatDate(currentPlan.endDate) }}
                </span>
              </div>
            </div>
            
            <div class="plan-stats">
              <div class="stat-item">
                <div class="stat-value">{{ currentPlan.totalTopics }}</div>
                <div class="stat-label">总主题数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ currentPlan.completedTopics }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ currentPlan.totalTopics - currentPlan.completedTopics }}</div>
                <div class="stat-label">待完成</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ Math.round((currentPlan.completedTopics / currentPlan.totalTopics) * 100) }}%</div>
                <div class="stat-label">完成率</div>
              </div>
            </div>
          </div>
          
          <div class="progress-section">
            <el-progress 
              :percentage="Math.round((currentPlan.completedTopics / currentPlan.totalTopics) * 100)" 
              :stroke-width="12"
              striped
              striped-flow
            />
          </div>
        </el-card>
        
        <!-- 学习主题列表 -->
        <el-card class="topics-card">
          <template #header>
            <div class="topics-header">
              <span>学习主题</span>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索主题..."
                :prefix-icon="Search"
                style="width: 200px;"
              />
            </div>
          </template>
          
          <el-table 
            :data="filteredTopics" 
            style="width: 100%" 
            v-loading="loading"
            row-key="id"
          >
            <el-table-column prop="name" label="主题名称">
              <template #default="scope">
                <div class="topic-name">
                  <el-icon v-if="scope.row.type === 1"><Collection /></el-icon>
                  <el-icon v-else-if="scope.row.type === 2"><Document /></el-icon>
                  <el-icon v-else><Reading /></el-icon>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="150" />
            <el-table-column label="预计时长" width="120">
              <template #default="scope">
                {{ scope.row.estimatedTime }} 小时
              </template>
            </el-table-column>
            <el-table-column label="截止日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.deadline) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getTopicStatusType(scope.row.status)">
                  {{ getTopicStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.status !== 3" 
                  size="small" 
                  @click="startLearning(scope.row)"
                >
                  {{ scope.row.status === 2 ? '继续学习' : '开始学习' }}
                </el-button>
                <el-button 
                  v-if="scope.row.status === 2" 
                  size="small" 
                  type="success"
                  @click="markAsCompleted(scope.row)"
                >
                  完成
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Search, Calendar, 
  Collection, Document, Reading 
} from '@element-plus/icons-vue'
import Header from '@/views/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()

// 加载状态
const loading = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 当前学习计划 (Mock数据)
const currentPlan = ref({})

// 学习主题列表 (Mock数据)
const topics = ref([])

// 返回学习计划列表
const goBack = () => {
  router.push('/study-plan')
}

// 获取学习计划状态类型
const getPlanStatusType = (status) => {
  const statusMap = {
    1: 'info',    // 未开始
    2: 'warning', // 进行中
    3: 'success'  // 已完成
  }
  return statusMap[status] || 'info'
}

// 获取学习计划状态文本
const getPlanStatusText = (status) => {
  const statusMap = {
    1: '未开始',
    2: '进行中',
    3: '已完成'
  }
  return statusMap[status] || '未知'
}

// 获取主题状态类型
const getTopicStatusType = (status) => {
  const statusMap = {
    1: 'info',    // 未开始
    2: 'warning', // 进行中
    3: 'success'  // 已完成
  }
  return statusMap[status] || 'info'
}

// 获取主题状态文本
const getTopicStatusText = (status) => {
  const statusMap = {
    1: '未开始',
    2: '进行中',
    3: '已完成'
  }
  return statusMap[status] || '未知'
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 筛选后的主题列表
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

// 开始学习
const startLearning = (topic) => {
  ElMessage.info(`开始学习 "${topic.name}"`)
  // 更新主题状态为进行中
  if (topic.status === 1) {
    topic.status = 2
  }
}

// 标记为主题已完成
const markAsCompleted = (topic) => {
  ElMessageBox.confirm(`确定要将 "${topic.name}" 标记为已完成吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 更新主题状态为已完成
    topic.status = 3
    
    // 更新计划的完成数量
    currentPlan.value.completedTopics++
    
    ElMessage.success('主题已标记为完成')
  }).catch(() => {
    // 用户取消操作
  })
}

// 获取学习计划详情
const fetchStudyPlanDetail = () => {
  const planId = route.params.id
  
  // Mock数据
  currentPlan.value = {
    id: parseInt(planId),
    title: 'Java基础巩固计划',
    status: 2, // 进行中
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    totalTopics: 25,
    completedTopics: 10
  }
  
  // Mock主题数据
  topics.value = [
    {
      id: 1,
      name: 'Java基础语法',
      category: 'Java基础',
      type: 1, // 视频
      estimatedTime: 3,
      deadline: '2025-11-10',
      status: 3 // 已完成
    },
    {
      id: 2,
      name: '面向对象编程',
      category: 'Java基础',
      type: 1, // 视频
      estimatedTime: 4,
      deadline: '2025-11-15',
      status: 3 // 已完成
    },
    {
      id: 3,
      name: '集合框架详解',
      category: 'Java基础',
      type: 2, // 文档
      estimatedTime: 5,
      deadline: '2025-11-20',
      status: 2 // 进行中
    },
    {
      id: 4,
      name: '异常处理机制',
      category: 'Java基础',
      type: 3, // 练习
      estimatedTime: 2,
      deadline: '2025-11-25',
      status: 1 // 未开始
    },
    {
      id: 5,
      name: '多线程基础',
      category: 'Java进阶',
      type: 1, // 视频
      estimatedTime: 6,
      deadline: '2025-11-30',
      status: 1 // 未开始
    },
    {
      id: 6,
      name: 'IO流操作',
      category: 'Java基础',
      type: 2, // 文档
      estimatedTime: 4,
      deadline: '2025-12-05',
      status: 1 // 未开始
    }
  ]
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStudyPlanDetail()
})
</script>

<style scoped>
.study-plan-detail-page {
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

.plan-header-card {
  margin-bottom: 24px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.plan-basic-info h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.plan-date {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 14px;
}

.plan-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.progress-section {
  margin-top: 20px;
}

.topics-card {
  margin-top: 24px;
}

.topics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .plan-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .plan-stats {
    gap: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .topics-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>