<!--学习计划-->
<template>
  <div class="study-plan-page">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1>学习计划</h1>
          <el-button type="primary" @click="createPlan">
            <el-icon><Plus /></el-icon>
            创建学习计划
          </el-button>
        </div>
        
        <!-- 学习计划卡片 -->
        <div class="plans-container">
          <el-row :gutter="20">
            <el-col 
              v-for="plan in studyPlans" 
              :key="plan.id" 
              :xs="24" 
              :sm="12" 
              :md="8" 
              :lg="6"
            >
              <el-card class="plan-card" @click="viewPlan(plan)">
                <template #header>
                  <div class="plan-header">
                    <span class="plan-title">{{ plan.title }}</span>
                    <el-tag :type="getPlanStatusType(plan.status)" size="small">
                      {{ getPlanStatusText(plan.status) }}
                    </el-tag>
                  </div>
                </template>
                
                <div class="plan-content">
                  <div class="plan-info">
                    <div class="info-item">
                      <el-icon><Calendar /></el-icon>
                      <span>{{ formatDate(plan.startDate) }} - {{ formatDate(plan.endDate) }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Document /></el-icon>
                      <span>{{ plan.totalTopics }} 个主题</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Checked /></el-icon>
                      <span>已完成 {{ plan.completedTopics }}/{{ plan.totalTopics }}</span>
                    </div>
                  </div>
                  
                  <div class="progress-section">
                    <div class="progress-label">
                      进度: {{ Math.round((plan.completedTopics / plan.totalTopics) * 100) }}%
                    </div>
                    <el-progress 
                      :percentage="Math.round((plan.completedTopics / plan.totalTopics) * 100)" 
                      :stroke-width="6" 
                      striped
                      striped-flow
                    />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <!-- 空状态 -->
          <el-empty v-if="studyPlans.length === 0" description="暂无学习计划，点击创建按钮开始制定学习计划">
            <el-button type="primary" @click="createPlan">创建学习计划</el-button>
          </el-empty>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Calendar, Document, Checked } from '@element-plus/icons-vue'
import Header from '@/views/components/layout/Header.vue'

const router = useRouter()

// 学习计划数据 (Mock数据)
const studyPlans = ref([])

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

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 查看学习计划详情
const viewPlan = (plan) => {
  router.push(`/study-plan/${plan.id}`)
}

// 创建学习计划
const createPlan = () => {
  ElMessage.info('创建学习计划功能正在开发中...')
}

// 获取学习计划数据
const fetchStudyPlans = () => {
  // Mock数据
  studyPlans.value = [
    {
      id: 1,
      title: 'Java基础巩固计划',
      status: 2, // 进行中
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      totalTopics: 25,
      completedTopics: 10
    },
    {
      id: 2,
      title: 'Spring框架深入学习',
      status: 1, // 未开始
      startDate: '2026-01-01',
      endDate: '2026-02-28',
      totalTopics: 18,
      completedTopics: 0
    },
    {
      id: 3,
      title: '数据库优化专题',
      status: 3, // 已完成
      startDate: '2025-09-01',
      endDate: '2025-10-31',
      totalTopics: 15,
      completedTopics: 15
    },
    {
      id: 4,
      title: '微服务架构实践',
      status: 2, // 进行中
      startDate: '2025-11-15',
      endDate: '2026-01-15',
      totalTopics: 22,
      completedTopics: 8
    }
  ]
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStudyPlans()
})
</script>

<style scoped>
.study-plan-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.plans-container {
  margin-top: 20px;
}

.plan-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.plan-content {
  padding: 10px 0;
}

.plan-info {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.progress-section {
  margin-top: 16px;
}

.progress-label {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .plans-container {
    margin-top: 10px;
  }
}
</style>