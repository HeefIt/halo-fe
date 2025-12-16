<!--排行榜-->
<template>
  <div class="ranking-page">
    <!-- 顶部导航栏 -->
    <Header />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1>排行榜</h1>
        </div>
        
        <!-- 排行榜筛选 -->
        <el-card class="filter-card">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="filter-group">
                <span class="filter-label">时间范围：</span>
                <el-radio-group v-model="timeRange" @change="fetchRankings">
                  <el-radio-button label="today">今日</el-radio-button>
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                </el-radio-group>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="filter-group">
                <span class="filter-label">排行类型：</span>
                <el-radio-group v-model="rankingType" @change="fetchRankings">
                  <el-radio-button label="problemCount">刷题数排行</el-radio-button>
                  <el-radio-button label="score">得分排行</el-radio-button>
                  <el-radio-button label="correctCount">正确数排行</el-radio-button>
                </el-radio-group>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- 排行榜列表 -->
        <el-card class="ranking-card">
          <template #header>
            <div class="ranking-header">
              <span>{{ getRankingTitle() }}</span>
            </div>
          </template>
          
          <el-table 
            :data="rankings" 
            style="width: 100%" 
            v-loading="loading"
            :row-class-name="tableRowClassName"
          >
            <el-table-column label="排名" width="80">
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
            <el-table-column prop="value" :label="getValueLabel()">
              <template #default="scope">
                <span class="ranking-value">{{ scope.row.value }}</span>
              </template>
            </el-table-column>
            <el-table-column label="趋势" width="100">
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
          
          <!-- 空状态 -->
          <el-empty v-if="!loading && rankings.length === 0" description="暂无排行数据" />
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getRankList } from '@/api/subject.js'
import Header from '@/views/components/layout/Header.vue'

// 加载状态
const loading = ref(false)

// 时间范围 (today, week, month)
const timeRange = ref('today')

// 排行类型 (problemCount, score, correctCount)
const rankingType = ref('problemCount')

// 排行榜数据 (Mock数据)
const rankings = ref([])

// 获取排行标题
const getRankingTitle = () => {
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
  
  return `${timeMap[timeRange.value]}${typeMap[rankingType.value]}`
}

// 获取数值列标签
const getValueLabel = () => {
  const typeMap = {
    problemCount: '刷题数',
    score: '得分',
    correctCount: '正确数'
  }
  
  return typeMap[rankingType.value]
}

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  if (rowIndex === 0) {
    return 'first-rank'
  } else if (rowIndex === 1) {
    return 'second-rank'
  } else if (rowIndex === 2) {
    return 'third-rank'
  }
  return ''
}

// 获取排行榜数据
const fetchRankings = async () => {
  loading.value = true
  
  try {
    const response = await getRankList(timeRange.value, rankingType.value)
    rankings.value = response.data
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchRankings()
})
</script>

<style scoped>
.ranking-page {
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

.filter-card {
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  height: 100%;
}

.filter-label {
  font-size: 14px;
  color: var(--text-primary);
  margin-right: 16px;
  white-space: nowrap;
}

.ranking-card {
  margin-top: 20px;
}

.ranking-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
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

@media (max-width: 768px) {
  .filter-card :deep(.el-row) {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .filter-label {
    margin-right: 8px;
  }
}
</style>