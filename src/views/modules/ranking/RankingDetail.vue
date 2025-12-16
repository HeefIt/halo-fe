<template>
  <div class="ranking-detail-page">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <!-- 返回按钮 -->
        <div class="back-section">
          <el-button @click="goBack" :icon="ArrowLeft">
            返回排行榜
          </el-button>
        </div>
        
        <!-- 排行榜详情 -->
        <el-card class="ranking-detail-card">
          <template #header>
            <div class="ranking-detail-header">
              <h2>{{ rankingTitle }}</h2>
              <div class="header-actions">
                <el-button @click="refreshData" :icon="Refresh" circle />
              </div>
            </div>
          </template>
          
          <!-- 用户排名信息 -->
          <div class="user-ranking-info">
            <div class="user-rank-card">
              <div class="rank-icon">
                <el-icon v-if="userRank <= 3" class="crown-icon">
                  <Medal />
                </el-icon>
                <span v-else class="rank-number">{{ userRank }}</span>
              </div>
              <div class="user-info">
                <el-avatar :src="userStore.userAvatar" :size="48">
                  {{ userStore.userName.charAt(0) }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-name">{{ userStore.userName }}</div>
                  <div class="rank-value">{{ rankingValue }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 排行榜列表 -->
          <div class="ranking-list">
            <el-table 
              :data="rankings" 
              style="width: 100%" 
              v-loading="loading"
              :row-class-name="tableRowClassName"
            >
              <el-table-column label="排名" width="80" align="center">
                <template #default="scope">
                  <div class="rank-cell">
                    <span 
                      v-if="scope.$index < 3" 
                      class="rank-badge"
                      :class="`rank-${scope.$index + 1}`"
                    >
                      {{ scope.$index + 1 }}
                    </span>
                    <span v-else class="rank-normal">{{ scope.$index + 1 }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="用户" width="200">
                <template #default="scope">
                  <div class="user-info">
                    <el-avatar :src="scope.row.avatar" :size="32">
                      {{ scope.row.userName.charAt(0) }}
                    </el-avatar>
                    <span class="user-name">{{ scope.row.userName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="value" :label="valueLabel" align="center">
                <template #default="scope">
                  <span class="ranking-value">{{ scope.row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column label="趋势" width="100" align="center">
                <template #default="scope">
                  <div class="trend-cell">
                    <el-icon 
                      v-if="scope.row.trend === 'up'" 
                      class="trend-up"
                    >
                      <ArrowUp />
                    </el-icon>
                    <el-icon 
                      v-else-if="scope.row.trend === 'down'" 
                      class="trend-down"
                    >
                      <ArrowDown />
                    </el-icon>
                    <span v-else>--</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getRankDetail } from '@/api/subject.js'
import { 
  ArrowLeft, ArrowUp, ArrowDown, 
  Medal, Refresh 
} from '@element-plus/icons-vue'
import Header from '@/views/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 加载状态
const loading = ref(false)

// 排行榜数据
const rankings = ref([])

// 获取排行榜标题
const rankingTitle = computed(() => {
  const timeMap = {
    today: '今日',
    week: '本周',
    month: '本月'
  }
  
  const typeMap = {
    problemCount: '刷题数排行',
    score: '得分排行',
    correctCount: '正确数排行'
  }
  
  const time = route.query.time || 'today'
  const type = route.query.type || 'problemCount'
  
  return `${timeMap[time]}${typeMap[type]}`
})

// 获取数值标签
const valueLabel = computed(() => {
  const typeMap = {
    problemCount: '刷题数',
    score: '得分',
    correctCount: '正确数'
  }
  
  const type = route.query.type || 'problemCount'
  return typeMap[type]
})

// 用户排名
const userRank = ref(5)

// 用户数值
const rankingValue = ref(0)

// 返回排行榜列表
const goBack = () => {
  router.push('/ranking')
}

// 刷新数据
const refreshData = () => {
  fetchRankingDetail()
}

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  // 高亮当前用户行
  if (row.userName === userStore.userName) {
    return 'current-user-row'
  }
  
  if (rowIndex === 0) {
    return 'first-rank'
  } else if (rowIndex === 1) {
    return 'second-rank'
  } else if (rowIndex === 2) {
    return 'third-rank'
  }
  return ''
}

// 获取排行榜详情数据
const fetchRankingDetail = async () => {
  loading.value = true
  
  try {
    const time = route.query.time || 'today'
    const type = route.query.type || 'problemCount'
    const userId = userStore.userId
    
    const response = await getRankDetail(time, type, userId)
    const data = response.data
    
    rankings.value = data.rankings
    userRank.value = data.currentUserRank
    rankingValue.value = data.currentUserValue
  } catch (error) {
    console.error('获取排行榜详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRankingDetail()
})
</script>

<style scoped>
.ranking-detail-page {
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

.ranking-detail-card {
  margin-top: 20px;
}

.ranking-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ranking-detail-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.user-ranking-info {
  margin-bottom: 30px;
}

.user-rank-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa, #e4e7f4);
  border-radius: 12px;
}

.rank-icon {
  margin-right: 20px;
}

.crown-icon {
  font-size: 48px;
  color: #ffd700;
}

.rank-number {
  font-size: 48px;
  font-weight: bold;
  color: var(--text-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.rank-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--primary-color);
}

.ranking-list {
  margin-top: 20px;
}

.rank-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffa500);
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #a9a9a9);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #a0522d);
}

.rank-normal {
  font-weight: 600;
  color: var(--text-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
}

.ranking-value {
  font-weight: 600;
  font-size: 16px;
  color: var(--primary-color);
}

.trend-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-up {
  color: #f56c6c;
  font-size: 18px;
}

.trend-down {
  color: #67c23a;
  font-size: 18px;
}

:deep(.first-rank) {
  background-color: rgba(255, 215, 0, 0.1);
}

:deep(.second-rank) {
  background-color: rgba(192, 192, 192, 0.1);
}

:deep(.third-rank) {
  background-color: rgba(205, 127, 50, 0.1);
}

:deep(.current-user-row) {
  background-color: rgba(64, 158, 255, 0.1);
  font-weight: 600;
}

@media (max-width: 768px) {
  .user-rank-card {
    flex-direction: column;
    text-align: center;
  }
  
  .rank-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>