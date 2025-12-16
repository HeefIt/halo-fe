<!--
  Statistics 数据统计组件
  功能描述：管理员查看系统数据统计的组件
  主要功能：
    - 整体统计卡片：显示稀有用户数、题目总数、在线用户数、总提交数
    - 用户学习增长趣势：按上选一孜7天或一个一30天查帋
    - 题目涉親趣势：按上选一孜7天或一个一30天查帋
    - ECharts图表：使用ECharts组件部分圈閯越越司数据
  使用位置：Admin.vue的"数据统计"上
-->
<template>
  <div class="tab-content">
    <h2>数据统计</h2>
    
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
        <el-icon class="stat-icon"><User /></el-icon>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalProblems }}</div>
          <div class="stat-label">题目总数</div>
        </div>
        <el-icon class="stat-icon"><Collection /></el-icon>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.onlineUsers }}</div>
          <div class="stat-label">在线用户</div>
        </div>
        <el-icon class="stat-icon"><Avatar /></el-icon>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalSubmissions }}</div>
          <div class="stat-label">总提交数</div>
        </div>
        <el-icon class="stat-icon"><DataAnalysis /></el-icon>
      </el-card>
    </div>
    
    <div class="charts">
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>用户增长趋势</span>
            <el-radio-group v-model="userTrendDays" @change="fetchUserGrowthTrend" size="small">
              <el-radio-button label="7">7天</el-radio-button>
              <el-radio-button label="30">30天</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="userChartContainer" class="chart-container"></div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>题目提交趋势</span>
            <el-radio-group v-model="submissionTrendDays" @change="fetchSubmissionTrend" size="small">
              <el-radio-button label="7">7天</el-radio-button>
              <el-radio-button label="30">30天</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="submissionChartContainer" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  User, Collection, Avatar, 
  DataAnalysis, DataLine, PieChart 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getStatistics, getUserGrowthTrend, getSubmissionTrend } from '@/api/subject'
import { ElMessage } from 'element-plus'

// 统计数据
const stats = ref({
  totalUsers: 0,
  totalProblems: 0,
  onlineUsers: 0,
  totalSubmissions: 0
})

// 用户增长趋势天数
const userTrendDays = ref('7')
// 题目提交趋势天数
const submissionTrendDays = ref('7')

// 图表容器ref
const userChartContainer = ref(null)
const submissionChartContainer = ref(null)

// 图表实例
let userChart = null
let submissionChart = null

// 获取统计数据
const fetchStatistics = async () => {
  try {
    console.log('[DEBUG] 开始获取统计数据')
    const res = await getStatistics()
    if (res.code === 200) {
      stats.value = res.data
      console.log('[DEBUG] 统计数据获取成功:', res.data)
    } else {
      ElMessage.error(res.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取用户增长趋势
const fetchUserGrowthTrend = async () => {
  try {
    console.log('[DEBUG] 开始获取用户增长趋势, days:', userTrendDays.value)
    const res = await getUserGrowthTrend(parseInt(userTrendDays.value))
    
    if (res.code === 200) {
      console.log('[DEBUG] 用户增长趋势获取成功:', res.data)
      renderUserGrowthChart(res.data)
    } else {
      ElMessage.error(res.message || '获取用户增长趋势失败')
    }
  } catch (error) {
    console.error('获取用户增长趋势失败:', error)
    ElMessage.error('获取用户增长趋势失败')
  }
}

// 获取题目提交趋势
const fetchSubmissionTrend = async () => {
  try {
    console.log('[DEBUG] 开始获取题目提交趋势, days:', submissionTrendDays.value)
    const res = await getSubmissionTrend(parseInt(submissionTrendDays.value))
    
    if (res.code === 200) {
      console.log('[DEBUG] 题目提交趋势获取成功:', res.data)
      renderSubmissionTrendChart(res.data)
    } else {
      ElMessage.error(res.message || '获取题目提交趋势失败')
    }
  } catch (error) {
    console.error('获取题目提交趋势失败:', error)
    ElMessage.error('获取题目提交趋势失败')
  }
}

// 渲染用户增长趋势图表
const renderUserGrowthChart = (trendData) => {
  try {
    if (!userChartContainer.value) {
      console.error('[ERROR] userChartContainer 容器不存在')
      return
    }
    
    const dates = trendData.map(item => item.date)
    const counts = trendData.map(item => item.count)
    
    // 计算累计数据
    let total = 0
    const totals = counts.map(count => {
      total += count
      return total
    })
    
    const option = {
      title: {
        text: ''
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: true
      },
      yAxis: [
        {
          type: 'value',
          name: '新增用户数',
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '累计用户数',
          position: 'right',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '新增用户数',
          type: 'bar',
          data: counts,
          itemStyle: {
            color: '#409eff'
          },
          yAxisIndex: 0
        },
        {
          name: '累计用户数',
          type: 'line',
          data: totals,
          smooth: true,
          lineStyle: {
            width: 3
          },
          symbolSize: 6,
          itemStyle: {
            color: '#f56c6c'
          },
          yAxisIndex: 1
        }
      ]
    }
    
    if (userChart) {
      userChart.dispose()
    }
    
    userChart = echarts.init(userChartContainer.value)
    userChart.setOption(option)
    
    console.log('[DEBUG] 用户增长趋势图表渲染成功')
  } catch (error) {
    console.error('[ERROR] 用户增长趋势图表渲染失败:', error)
  }
}

// 渲染题目提交趋势图表
const renderSubmissionTrendChart = (trendData) => {
  try {
    if (!submissionChartContainer.value) {
      console.error('[ERROR] submissionChartContainer 容器不存在')
      return
    }
    
    const dates = trendData.map(item => item.date)
    const counts = trendData.map(item => item.count)
    
    // 计算累计数据
    let total = 0
    const totals = counts.map(count => {
      total += count
      return total
    })
    
    const option = {
      title: {
        text: ''
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: true
      },
      yAxis: [
        {
          type: 'value',
          name: '日均提交数',
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '累计提交数',
          position: 'right',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '日均提交数',
          type: 'bar',
          data: counts,
          itemStyle: {
            color: '#67c23a'
          },
          yAxisIndex: 0
        },
        {
          name: '累计提交数',
          type: 'line',
          data: totals,
          smooth: true,
          lineStyle: {
            width: 3
          },
          symbolSize: 6,
          itemStyle: {
            color: '#e6a23c'
          },
          yAxisIndex: 1
        }
      ]
    }
    
    if (submissionChart) {
      submissionChart.dispose()
    }
    
    submissionChart = echarts.init(submissionChartContainer.value)
    submissionChart.setOption(option)
    
    console.log('[DEBUG] 题目提交趋势图表渲染成功')
  } catch (error) {
    console.error('[ERROR] 题目提交趋势图表渲染失败:', error)
  }
}

onMounted(() => {
  console.log('[DEBUG] Statistics组件已挂载')
  fetchStatistics()
  // 需要下一个汪拆案，等待DOM渲染
  setTimeout(() => {
    fetchUserGrowthTrend()
    fetchSubmissionTrend()
  }, 100)
})
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 48px;
  color: var(--primary-color);
  opacity: 0.3;
}

/* 图表区域 */
.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  border-radius: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style>