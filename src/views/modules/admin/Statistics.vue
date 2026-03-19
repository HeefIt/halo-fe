<template>
  <div class="statistics-page">
    <div class="management-header">
      <div class="header-info">
        <h2>数据统计</h2>
        <p>系统运营数据概览与趋势分析</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ animatedStats.totalUsers }}</span>
          <span class="stat-label">总用户数</span>
        </div>
        <div class="stat-trend up">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          近{{ userTrendDays }}天 +{{ userGrowthSummary.total }}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon problems">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ animatedStats.totalProblems }}</span>
          <span class="stat-label">题目总数</span>
        </div>
        <div class="stat-trend neutral">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7H9"></path>
            <path d="M14 17H4"></path>
            <path d="M20 12H4"></path>
          </svg>
          全量题库
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon online">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ animatedStats.onlineUsers }}</span>
          <span class="stat-label">在线用户</span>
        </div>
        <div class="stat-indicator">
          <span class="pulse-dot"></span>
          实时
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon submissions">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ animatedStats.totalSubmissions }}</span>
          <span class="stat-label">总提交数</span>
        </div>
        <div class="stat-trend neutral">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7H9"></path>
            <path d="M14 17H4"></path>
            <path d="M20 12H4"></path>
          </svg>
          近{{ submissionTrendDays }}天 {{ submissionSummary.total }}
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            用户增长趋势
          </div>
          <div class="chart-tabs">
            <button 
              v-for="period in periodOptions" 
              :key="period.value"
              class="tab-btn"
              :class="{ active: userTrendDays === period.value }"
              @click="userTrendDays = period.value; fetchUserGrowthTrend()"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div ref="userChartContainer" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            题目提交趋势
          </div>
          <div class="chart-tabs">
            <button 
              v-for="period in periodOptions" 
              :key="period.value"
              class="tab-btn"
              :class="{ active: submissionTrendDays === period.value }"
              @click="submissionTrendDays = period.value; fetchSubmissionTrend()"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div ref="submissionChartContainer" class="chart-container"></div>
      </div>
    </div>

    <div class="bottom-grid">
      <div class="info-card">
        <div class="info-header">
          <h3>热门题目 TOP 5</h3>
          <span class="badge">本周</span>
        </div>
        <div class="ranking-list">
          <div class="ranking-item" v-for="(item, index) in topProblems" :key="item.subjectId || index">
            <span class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            <span class="problem-name">{{ item.subjectName }}</span>
            <span class="problem-count">{{ item.submitCount }} 次提交</span>
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-header">
          <h3>活跃用户 TOP 5</h3>
          <span class="badge">本周</span>
        </div>
        <div class="user-list">
          <div class="user-item" v-for="(user, index) in activeUsers" :key="user.userId || index">
            <div class="user-avatar" :style="{ background: getAvatarColor(index) }">
              {{ user.userName?.charAt(0) || '?' }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ user.userName }}</span>
              <span class="user-stats">{{ user.problemCount }} 题 · {{ user.accuracy }}% 正确率</span>
            </div>
            <span class="user-score">{{ user.totalScore }} 分</span>
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="info-header">
          <h3>系统状态</h3>
          <span class="status-badge online">
            <span class="status-dot"></span>
            实时数据
          </span>
        </div>
        <div class="status-list">
          <div class="status-item">
            <span class="status-label">当前在线用户</span>
            <span class="status-value good">{{ animatedStats.onlineUsers }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">近{{ userTrendDays }}日新增用户</span>
            <span class="status-value">{{ userGrowthSummary.total }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">今日新增用户</span>
            <span class="status-value">{{ userGrowthSummary.today }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">近{{ submissionTrendDays }}日提交量</span>
            <span class="status-value">{{ submissionSummary.total }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">今日提交量</span>
            <span class="status-value">{{ submissionSummary.today }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getStatistics, getUserGrowthTrend, getSubmissionTrend, getTopProblems, getActiveUsers } from '@/api/subject'
import { ElMessage } from 'element-plus'

const stats = ref({
  totalUsers: 0,
  totalProblems: 0,
  onlineUsers: 0,
  totalSubmissions: 0
})

const animatedStats = reactive({
  totalUsers: 0,
  totalProblems: 0,
  onlineUsers: 0,
  totalSubmissions: 0
})

const periodOptions = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 }
]

const userTrendDays = ref(7)
const submissionTrendDays = ref(7)

const userChartContainer = ref(null)
const submissionChartContainer = ref(null)

let userChart = null
let submissionChart = null
let animationTimer = null

const topProblems = ref([])
const activeUsers = ref([])
const userTrendData = ref([])
const submissionTrendData = ref([])

const userGrowthSummary = computed(() => {
  const total = userTrendData.value.reduce((sum, item) => sum + Number(item.count || 0), 0)
  const today = Number(userTrendData.value[userTrendData.value.length - 1]?.count || 0)
  return { total, today }
})

const submissionSummary = computed(() => {
  const total = submissionTrendData.value.reduce((sum, item) => sum + Number(item.count || 0), 0)
  const today = Number(submissionTrendData.value[submissionTrendData.value.length - 1]?.count || 0)
  return { total, today }
})

const getAvatarColor = (index) => {
  const colors = [
    'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
  ]
  return colors[index % colors.length]
}

const animateValue = (key, target) => {
  const duration = 1500
  const start = animatedStats[key]
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    animatedStats[key] = Math.floor(start + (target - start) * easeOut)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

const fetchStatistics = async () => {
  try {
    const res = await getStatistics()
    if (res.code === 200) {
      stats.value = res.data
      animateValue('totalUsers', res.data.totalUsers || 0)
      animateValue('totalProblems', res.data.totalProblems || 0)
      animateValue('onlineUsers', res.data.onlineUsers || 0)
      animateValue('totalSubmissions', res.data.totalSubmissions || 0)
    } else {
      ElMessage.error(res.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

const fetchUserGrowthTrend = async () => {
  try {
    const res = await getUserGrowthTrend(userTrendDays.value)
    if (res.code === 200) {
      userTrendData.value = res.data || []
      renderUserGrowthChart(res.data)
    } else {
      ElMessage.error(res.message || '获取用户增长趋势失败')
    }
  } catch (error) {
    console.error('获取用户增长趋势失败:', error)
    ElMessage.error('获取用户增长趋势失败')
  }
}

const fetchSubmissionTrend = async () => {
  try {
    const res = await getSubmissionTrend(submissionTrendDays.value)
    if (res.code === 200) {
      submissionTrendData.value = res.data || []
      renderSubmissionTrendChart(res.data)
    } else {
      ElMessage.error(res.message || '获取题目提交趋势失败')
    }
  } catch (error) {
    console.error('获取题目提交趋势失败:', error)
    ElMessage.error('获取题目提交趋势失败')
  }
}

const fetchTopProblems = async () => {
  try {
    const res = await getTopProblems(7, 5)
    if (res.code === 200) {
      topProblems.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取热门题目失败')
    }
  } catch (error) {
    console.error('获取热门题目失败:', error)
    ElMessage.error('获取热门题目失败')
  }
}

const fetchActiveUsers = async () => {
  try {
    const res = await getActiveUsers(7, 5)
    if (res.code === 200) {
      activeUsers.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取活跃用户失败')
    }
  } catch (error) {
    console.error('获取活跃用户失败:', error)
    ElMessage.error('获取活跃用户失败')
  }
}

const renderUserGrowthChart = (trendData) => {
  if (!userChartContainer.value) return
  
  const dates = trendData.map(item => item.date)
  const counts = trendData.map(item => item.count)
  
  let total = 0
  const totals = counts.map(count => {
    total += count
    return total
  })

  if (userChart) userChart.dispose()
  
  userChart = echarts.init(userChartContainer.value)
  userChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['新增用户', '累计用户'],
      textStyle: { color: 'rgba(255, 255, 255, 0.6)' },
      top: 0
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
    },
    yAxis: [
      {
        type: 'value',
        name: '新增',
        position: 'left',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      {
        type: 'value',
        name: '累计',
        position: 'right',
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
      }
    ],
    series: [
      {
        name: '新增用户',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.2)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        yAxisIndex: 0
      },
      {
        name: '累计用户',
        type: 'line',
        data: totals,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: '#22c55e' },
        itemStyle: { color: '#22c55e' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
            { offset: 1, color: 'rgba(34, 197, 94, 0)' }
          ])
        },
        yAxisIndex: 1
      }
    ]
  })
}

const renderSubmissionTrendChart = (trendData) => {
  if (!submissionChartContainer.value) return
  
  const dates = trendData.map(item => item.date)
  const counts = trendData.map(item => item.count)
  
  let total = 0
  const totals = counts.map(count => {
    total += count
    return total
  })

  if (submissionChart) submissionChart.dispose()
  
  submissionChart = echarts.init(submissionChartContainer.value)
  submissionChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['日均提交', '累计提交'],
      textStyle: { color: 'rgba(255, 255, 255, 0.6)' },
      top: 0
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
    },
    yAxis: [
      {
        type: 'value',
        name: '日均',
        position: 'left',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      {
        type: 'value',
        name: '累计',
        position: 'right',
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
      }
    ],
    series: [
      {
        name: '日均提交',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: 'rgba(245, 158, 11, 0.2)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        yAxisIndex: 0
      },
      {
        name: '累计提交',
        type: 'line',
        data: totals,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: '#ef4444' },
        itemStyle: { color: '#ef4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0)' }
          ])
        },
        yAxisIndex: 1
      }
    ]
  })
}

const handleResize = () => {
  userChart?.resize()
  submissionChart?.resize()
}

onMounted(() => {
  fetchStatistics()
  fetchTopProblems()
  fetchActiveUsers()
  setTimeout(() => {
    fetchUserGrowthTrend()
    fetchSubmissionTrend()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  userChart?.dispose()
  submissionChart?.dispose()
})
</script>

<style scoped>
.statistics-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.header-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-4px);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:nth-child(1) { --accent-color: #8b5cf6; }
.stat-card:nth-child(2) { --accent-color: #22c55e; }
.stat-card:nth-child(3) { --accent-color: #f59e0b; }
.stat-card:nth-child(4) { --accent-color: #ef4444; }

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.users {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.stat-icon.problems {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.stat-icon.online {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.stat-icon.submissions {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  width: fit-content;
}

.stat-trend.up {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.stat-trend.neutral {
  background: rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
}

.stat-trend.down {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.stat-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.chart-title svg {
  color: #a78bfa;
}

.chart-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 10px;
}

.tab-btn {
  padding: 6px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: white;
}

.tab-btn.active {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.info-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.info-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.badge {
  padding: 4px 10px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 6px;
  font-size: 12px;
  color: #a78bfa;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.online {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.rank {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.rank.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  color: white;
}

.rank.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a9a9a9 100%);
  color: white;
}

.rank.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #a0522d 100%);
  color: white;
}

.problem-name {
  flex: 1;
  font-size: 14px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.problem-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.user-stats {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.user-score {
  font-size: 16px;
  font-weight: 600;
  color: #a78bfa;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}

.status-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.status-value.good {
  color: #4ade80;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bottom-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .bottom-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
