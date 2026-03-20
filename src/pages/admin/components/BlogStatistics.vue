<template>
  <div class="blog-statistics">
    <div class="management-header">
      <div class="header-info">
        <h2>博客统计</h2>
        <p>围绕文章内容表现与后台管理动作，快速看清博客区的真实状态。</p>
      </div>
      <div class="header-actions">
        <div class="chart-tabs">
          <button
            v-for="period in periodOptions"
            :key="period.value"
            class="tab-btn"
            :class="{ active: contentDays === period.value }"
            @click="changeContentDays(period.value)"
          >
            内容 {{ period.label }}
          </button>
        </div>
        <div class="chart-tabs">
          <button
            v-for="period in periodOptions"
            :key="`action-${period.value}`"
            class="tab-btn"
            :class="{ active: actionDays === period.value }"
            @click="changeActionDays(period.value)"
          >
            操作 {{ period.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon article">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ overview.totalArticles }}</span>
          <span class="stat-label">文章总数</span>
        </div>
        <span class="stat-note">已发布 {{ overview.publishedArticles }} 篇</span>
      </div>

      <div class="stat-card">
        <div class="stat-icon draft">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ overview.draftArticles }}</span>
          <span class="stat-label">草稿文章</span>
        </div>
        <span class="stat-note">待继续打磨</span>
      </div>

      <div class="stat-card">
        <div class="stat-icon like">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m12 21-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21Z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ overview.totalLikes }}</span>
          <span class="stat-label">累计点赞</span>
        </div>
        <span class="stat-note">评论 {{ overview.totalComments }}</span>
      </div>

      <div class="stat-card">
        <div class="stat-icon view">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ overview.totalViews }}</span>
          <span class="stat-label">累计浏览</span>
        </div>
        <span class="stat-note">今日新增 {{ overview.todayNewArticles }}</span>
      </div>

      <div class="stat-card subtle">
        <div class="stat-icon add">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ actionSummary.addCount }}</span>
          <span class="stat-label">新增文章</span>
        </div>
        <span class="stat-note">近 {{ actionDays }} 天</span>
      </div>

      <div class="stat-card subtle">
        <div class="stat-icon update">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ actionSummary.updateCount }}</span>
          <span class="stat-label">修改文章</span>
        </div>
        <span class="stat-note">持续运营痕迹</span>
      </div>

      <div class="stat-card subtle">
        <div class="stat-icon delete">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ actionSummary.deleteCount }}</span>
          <span class="stat-label">删除文章</span>
        </div>
        <span class="stat-note">建议关注是否误删</span>
      </div>

      <div class="stat-card subtle">
        <div class="stat-icon query">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ actionSummary.queryCount }}</span>
          <span class="stat-label">查询文章</span>
        </div>
        <span class="stat-note">后台检索热度</span>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="card-head">
          <div>
            <h3>内容趋势</h3>
            <p>新增文章、点赞、评论和浏览都放在一张图里。</p>
          </div>
        </div>
        <div ref="contentChartRef" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="card-head">
          <div>
            <h3>后台操作趋势</h3>
            <p>把新增、修改、删除、查询的管理动作单独看清楚。</p>
          </div>
        </div>
        <div ref="actionChartRef" class="chart-container"></div>
      </div>
    </div>

    <div class="bottom-grid">
      <div class="info-card">
        <div class="card-head">
          <div>
            <h3>浏览最多</h3>
            <p>最容易把人留下来的文章。</p>
          </div>
        </div>
        <div class="ranking-list">
          <div class="ranking-item" v-for="(item, index) in topArticles.viewTopArticles" :key="`view-${item.id}-${index}`">
            <span class="rank">{{ index + 1 }}</span>
            <div class="ranking-main">
              <strong>{{ item.title }}</strong>
              <span>{{ item.viewCount || 0 }} 浏览</span>
            </div>
          </div>
          <div v-if="!topArticles.viewTopArticles.length" class="empty-hint">暂无榜单数据</div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-head">
          <div>
            <h3>互动最热</h3>
            <p>点赞和评论都比较活跃的内容。</p>
          </div>
        </div>
        <div class="ranking-list">
          <div class="ranking-item" v-for="(item, index) in topArticles.likeTopArticles" :key="`like-${item.id}-${index}`">
            <span class="rank">{{ index + 1 }}</span>
            <div class="ranking-main">
              <strong>{{ item.title }}</strong>
              <span>{{ item.likeCount || 0 }} 点赞 · {{ item.commentCount || 0 }} 评论</span>
            </div>
          </div>
          <div v-if="!topArticles.likeTopArticles.length" class="empty-hint">暂无榜单数据</div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-head">
          <div>
            <h3>最近操作</h3>
            <p>后台内容管理最近发生了什么。</p>
          </div>
        </div>
        <div class="activity-list">
          <div class="activity-item" v-for="action in recentActions" :key="action.id">
            <span class="activity-type" :class="getActionClass(action.actionType)">
              {{ getActionLabel(action.actionType) }}
            </span>
            <div class="activity-main">
              <strong>{{ action.articleTitleSnapshot || '未指定文章' }}</strong>
              <span>{{ action.operatorName || '匿名用户' }} · {{ formatTime(action.operateTime) }}</span>
            </div>
          </div>
          <div v-if="!recentActions.length" class="empty-hint">日志表创建后，这里会开始累计真实操作</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import blogApi from '@/api/modules/blog'

const periodOptions = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 }
]

const overview = reactive({
  totalArticles: 0,
  publishedArticles: 0,
  draftArticles: 0,
  totalLikes: 0,
  totalComments: 0,
  totalViews: 0,
  todayNewArticles: 0
})

const actionSummary = reactive({
  addCount: 0,
  updateCount: 0,
  deleteCount: 0,
  queryCount: 0
})

const topArticles = reactive({
  viewTopArticles: [],
  likeTopArticles: [],
  commentTopArticles: []
})

const recentActions = ref([])
const contentTrend = ref([])
const actionTrend = ref([])
const contentDays = ref(7)
const actionDays = ref(7)

const contentChartRef = ref(null)
const actionChartRef = ref(null)

let contentChart = null
let actionChart = null

/**
 * 判断接口调用是否成功。
 * @param {Object} response 接口响应
 * @return {boolean}
 */
const isSuccess = (response) => response?.code === 200 || response?.success === true

/**
 * 获取博客总览统计。
 * @return {Promise<void>}
 */
const fetchOverview = async () => {
  try {
    const response = await blogApi.getAdminStatisticsOverview()
    if (!isSuccess(response)) {
      ElMessage.error(response?.message || '获取博客总览失败')
      return
    }
    Object.assign(overview, response.data || {})
  } catch (error) {
    console.error('获取博客总览失败:', error)
    ElMessage.error('获取博客总览失败')
  }
}

/**
 * 获取博客内容趋势并刷新图表。
 * @return {Promise<void>}
 */
const fetchContentTrend = async () => {
  try {
    const response = await blogApi.getAdminStatisticsTrend(contentDays.value)
    if (!isSuccess(response)) {
      ElMessage.error(response?.message || '获取博客趋势失败')
      return
    }
    contentTrend.value = response.data || []
    await nextTick()
    renderContentChart()
  } catch (error) {
    console.error('获取博客趋势失败:', error)
    ElMessage.error('获取博客趋势失败')
  }
}

/**
 * 获取博客榜单。
 * @return {Promise<void>}
 */
const fetchTopArticles = async () => {
  try {
    const response = await blogApi.getAdminTopArticles(5)
    if (!isSuccess(response)) {
      ElMessage.error(response?.message || '获取博客榜单失败')
      return
    }
    Object.assign(topArticles, response.data || {})
  } catch (error) {
    console.error('获取博客榜单失败:', error)
    ElMessage.error('获取博客榜单失败')
  }
}

/**
 * 获取博客后台操作汇总。
 * @return {Promise<void>}
 */
const fetchActionSummary = async () => {
  try {
    const response = await blogApi.getAdminActionSummary(actionDays.value)
    if (!isSuccess(response)) {
      ElMessage.error(response?.message || '获取博客操作汇总失败')
      return
    }
    Object.assign(actionSummary, response.data || {})
  } catch (error) {
    console.error('获取博客操作汇总失败:', error)
    ElMessage.error('获取博客操作汇总失败')
  }
}

/**
 * 获取博客后台操作趋势并刷新图表。
 * @return {Promise<void>}
 */
const fetchActionTrend = async () => {
  try {
    const response = await blogApi.getAdminActionTrend(actionDays.value)
    if (!isSuccess(response)) {
      ElMessage.error(response?.message || '获取博客操作趋势失败')
      return
    }
    actionTrend.value = response.data || []
    await nextTick()
    renderActionChart()
  } catch (error) {
    console.error('获取博客操作趋势失败:', error)
    ElMessage.error('获取博客操作趋势失败')
  }
}

/**
 * 获取最近后台操作。
 * @return {Promise<void>}
 */
const fetchRecentActions = async () => {
  try {
    const response = await blogApi.getAdminRecentActions(8)
    if (!isSuccess(response)) {
      ElMessage.error(response?.message || '获取最近操作失败')
      return
    }
    recentActions.value = response.data || []
  } catch (error) {
    console.error('获取最近操作失败:', error)
    ElMessage.error('获取最近操作失败')
  }
}

/**
 * 切换内容趋势天数。
 * @param {number} days 天数
 */
const changeContentDays = (days) => {
  contentDays.value = days
  fetchContentTrend()
}

/**
 * 切换操作趋势天数。
 * @param {number} days 天数
 */
const changeActionDays = (days) => {
  actionDays.value = days
  Promise.all([fetchActionSummary(), fetchActionTrend()])
}

/**
 * 渲染博客内容趋势图。
 */
const renderContentChart = () => {
  if (!contentChartRef.value) {
    return
  }
  const dates = contentTrend.value.map(item => item.date)
  if (!contentChart) {
    contentChart = echarts.init(contentChartRef.value)
  }
  contentChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.96)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      textStyle: { color: '#fff' }
    },
    legend: {
      top: 0,
      textStyle: { color: 'rgba(255, 255, 255, 0.6)' },
      data: ['新增文章', '新增点赞', '新增评论', '新增浏览']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.12)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
    },
    series: [
      {
        name: '新增文章',
        type: 'bar',
        barMaxWidth: 18,
        data: contentTrend.value.map(item => item.articleCount || 0),
        itemStyle: { color: '#60a5fa', borderRadius: [6, 6, 0, 0] }
      },
      {
        name: '新增点赞',
        type: 'line',
        smooth: true,
        data: contentTrend.value.map(item => item.likeCount || 0),
        lineStyle: { width: 3, color: '#f97316' },
        itemStyle: { color: '#f97316' }
      },
      {
        name: '新增评论',
        type: 'line',
        smooth: true,
        data: contentTrend.value.map(item => item.commentCount || 0),
        lineStyle: { width: 3, color: '#34d399' },
        itemStyle: { color: '#34d399' }
      },
      {
        name: '新增浏览',
        type: 'line',
        smooth: true,
        data: contentTrend.value.map(item => item.viewCount || 0),
        lineStyle: { width: 3, color: '#a78bfa' },
        itemStyle: { color: '#a78bfa' }
      }
    ]
  })
}

/**
 * 渲染博客操作趋势图。
 */
const renderActionChart = () => {
  if (!actionChartRef.value) {
    return
  }
  const dates = actionTrend.value.map(item => item.date)
  if (!actionChart) {
    actionChart = echarts.init(actionChartRef.value)
  }
  actionChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.96)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      textStyle: { color: '#fff' }
    },
    legend: {
      top: 0,
      textStyle: { color: 'rgba(255, 255, 255, 0.6)' },
      data: ['新增', '修改', '删除', '查询']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.12)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: 'rgba(255, 255, 255, 0.5)' }
    },
    series: [
      {
        name: '新增',
        type: 'bar',
        data: actionTrend.value.map(item => item.addCount || 0),
        itemStyle: { color: '#4ade80', borderRadius: [6, 6, 0, 0] }
      },
      {
        name: '修改',
        type: 'bar',
        data: actionTrend.value.map(item => item.updateCount || 0),
        itemStyle: { color: '#60a5fa', borderRadius: [6, 6, 0, 0] }
      },
      {
        name: '删除',
        type: 'bar',
        data: actionTrend.value.map(item => item.deleteCount || 0),
        itemStyle: { color: '#f87171', borderRadius: [6, 6, 0, 0] }
      },
      {
        name: '查询',
        type: 'line',
        smooth: true,
        data: actionTrend.value.map(item => item.queryCount || 0),
        lineStyle: { width: 3, color: '#fbbf24' },
        itemStyle: { color: '#fbbf24' }
      }
    ]
  })
}

/**
 * 格式化时间。
 * @param {string|number|Date} time 时间值
 * @return {string}
 */
const formatTime = (time) => {
  if (!time) {
    return '-'
  }
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取操作标签文案。
 * @param {string} actionType 操作类型
 * @return {string}
 */
const getActionLabel = (actionType) => {
  if (actionType === 'ADD') return '新增'
  if (actionType === 'UPDATE') return '修改'
  if (actionType === 'DELETE') return '删除'
  if (actionType === 'QUERY_DETAIL') return '详情'
  return '查询'
}

/**
 * 获取操作样式类。
 * @param {string} actionType 操作类型
 * @return {string}
 */
const getActionClass = (actionType) => {
  if (actionType === 'ADD') return 'add'
  if (actionType === 'UPDATE') return 'update'
  if (actionType === 'DELETE') return 'delete'
  return 'query'
}

/**
 * 处理窗口缩放。
 */
const handleResize = () => {
  contentChart?.resize()
  actionChart?.resize()
}

onMounted(async () => {
  await Promise.all([
    fetchOverview(),
    fetchContentTrend(),
    fetchTopArticles(),
    fetchActionSummary(),
    fetchActionTrend(),
    fetchRecentActions()
  ])
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  contentChart?.dispose()
  actionChart?.dispose()
})
</script>

<style scoped>
.blog-statistics {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.management-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.header-info h2 {
  margin: 0 0 4px;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}

.header-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.chart-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tab-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-btn.active,
.tab-btn:hover {
  background: rgba(96, 165, 250, 0.18);
  color: #dbeafe;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card.subtle {
  background: rgba(255, 255, 255, 0.02);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.article { background: rgba(96, 165, 250, 0.16); color: #93c5fd; }
.stat-icon.draft { background: rgba(251, 191, 36, 0.16); color: #fde68a; }
.stat-icon.like { background: rgba(249, 115, 22, 0.16); color: #fdba74; }
.stat-icon.view { background: rgba(167, 139, 250, 0.16); color: #c4b5fd; }
.stat-icon.add { background: rgba(74, 222, 128, 0.16); color: #86efac; }
.stat-icon.update { background: rgba(96, 165, 250, 0.16); color: #93c5fd; }
.stat-icon.delete { background: rgba(248, 113, 113, 0.16); color: #fca5a5; }
.stat-icon.query { background: rgba(251, 191, 36, 0.16); color: #fde68a; }

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  color: rgba(255, 255, 255, 0.58);
  font-size: 14px;
}

.stat-note {
  color: rgba(255, 255, 255, 0.42);
  font-size: 12px;
}

.charts-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.bottom-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.chart-card,
.info-card {
  padding: 24px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.card-head h3 {
  margin: 0 0 4px;
  color: #fff;
  font-size: 18px;
}

.card-head p {
  margin: 0;
  color: rgba(255, 255, 255, 0.48);
  font-size: 13px;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.ranking-list,
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item,
.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}

.rank {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(96, 165, 250, 0.14);
  color: #bfdbfe;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.ranking-main,
.activity-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ranking-main strong,
.activity-main strong {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-main span,
.activity-main span {
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
}

.activity-type {
  min-width: 48px;
  padding: 6px 10px;
  border-radius: 999px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.activity-type.add {
  background: rgba(74, 222, 128, 0.16);
  color: #86efac;
}

.activity-type.update {
  background: rgba(96, 165, 250, 0.16);
  color: #93c5fd;
}

.activity-type.delete {
  background: rgba(248, 113, 113, 0.16);
  color: #fca5a5;
}

.activity-type.query {
  background: rgba(251, 191, 36, 0.16);
  color: #fde68a;
}

.empty-hint {
  padding: 18px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

@media (max-width: 1280px) {
  .stats-grid,
  .bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .charts-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
  }

  .chart-tabs {
    width: 100%;
    justify-content: space-between;
  }

  .tab-btn {
    flex: 1;
  }
}
</style>
