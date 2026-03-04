<template>
  <div class="ranking-page">
    <Header />
    
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <div class="header-left">
            <h1 class="page-title">排行榜</h1>
            <p class="page-subtitle">与全球学习者一较高下，见证你的成长</p>
          </div>
        </div>

        <div class="top-three-section" v-if="topThree.length > 0">
          <div class="podium">
            <div class="podium-item second" v-if="topThree[1]">
              <div class="avatar-wrapper">
                <div class="avatar-ring"></div>
                <div class="avatar">
                  {{ topThree[1].userName?.charAt(0) || 'U' }}
                </div>
                <div class="rank-badge silver">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              </div>
              <div class="user-name">{{ topThree[1].userName }}</div>
              <div class="user-value">{{ topThree[1].value }}</div>
              <div class="podium-stand">2</div>
            </div>

            <div class="podium-item first" v-if="topThree[0]">
              <div class="crown">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 19H22V21H2V19ZM22 9L18 12L12 4L6 12L2 9V19H22V9Z"/>
                </svg>
              </div>
              <div class="avatar-wrapper">
                <div class="avatar-ring gold"></div>
                <div class="avatar">
                  {{ topThree[0].userName?.charAt(0) || 'U' }}
                </div>
                <div class="rank-badge gold">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              </div>
              <div class="user-name champion">{{ topThree[0].userName }}</div>
              <div class="user-value champion">{{ topThree[0].value }}</div>
              <div class="podium-stand gold">1</div>
            </div>

            <div class="podium-item third" v-if="topThree[2]">
              <div class="avatar-wrapper">
                <div class="avatar-ring"></div>
                <div class="avatar">
                  {{ topThree[2].userName?.charAt(0) || 'U' }}
                </div>
                <div class="rank-badge bronze">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              </div>
              <div class="user-name">{{ topThree[2].userName }}</div>
              <div class="user-value">{{ topThree[2].value }}</div>
              <div class="podium-stand">3</div>
            </div>
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-group">
            <span class="filter-label">时间范围</span>
            <div class="filter-buttons">
              <button 
                v-for="range in timeRanges" 
                :key="range.value"
                class="filter-btn"
                :class="{ active: timeRange === range.value }"
                @click="timeRange = range.value"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
          <div class="filter-group">
            <span class="filter-label">排行类型</span>
            <div class="filter-buttons">
              <button 
                v-for="type in rankingTypes" 
                :key="type.value"
                class="filter-btn"
                :class="{ active: rankingType === type.value }"
                @click="rankingType = type.value"
              >
                {{ type.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="ranking-list-card">
          <div class="card-header">
            <h3 class="card-title">{{ getRankingTitle() }}</h3>
            <div class="my-rank" v-if="myRank">
              <span class="my-rank-label">我的排名</span>
              <span class="my-rank-value">#{{ myRank }}</span>
            </div>
          </div>

          <div class="ranking-table" v-loading="loading">
            <div class="table-header">
              <div class="col col-rank">排名</div>
              <div class="col col-user">用户</div>
              <div class="col col-value">{{ getValueLabel() }}</div>
              <div class="col col-trend">趋势</div>
            </div>

            <div class="table-body">
              <div 
                v-for="(item, index) in rankings" 
                :key="item.userId || index"
                class="table-row"
                :class="{ 'is-me': item.isMe, 'top-three': index < 3 }"
              >
                <div class="col col-rank">
                  <span class="rank-number" v-if="index >= 3">{{ index + 1 }}</span>
                  <div class="rank-medal" v-else :class="`medal-${index + 1}`">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                </div>
                <div class="col col-user">
                  <div class="user-cell">
                    <div class="user-avatar" :style="{ background: getAvatarColor(index) }">
                      {{ item.userName?.charAt(0) || 'U' }}
                    </div>
                    <div class="user-info">
                      <span class="user-name">{{ item.userName }}</span>
                      <span class="user-badge" v-if="item.isMe">我</span>
                    </div>
                  </div>
                </div>
                <div class="col col-value">
                  <span class="value-number">{{ item.value }}</span>
                </div>
                <div class="col col-trend">
                  <div class="trend" :class="item.trend">
                    <svg v-if="item.trend === 'up'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                    <svg v-else-if="item.trend === 'down'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    <span v-else class="trend-same">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" v-if="!loading && rankings.length === 0">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="url(#emptyGradient)" stroke-width="2" stroke-dasharray="8 4"/>
              <polygon points="100,40 115,75 150,80 125,105 130,140 100,125 70,140 75,105 50,80 85,75" fill="url(#emptyGradient)" opacity="0.3"/>
              <defs>
                <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b"/>
                  <stop offset="100%" stop-color="#ea580c"/>
                </linearGradient>
              </defs>
            </svg>
            <h4>暂无排行数据</h4>
            <p>开始练习，成为第一个上榜的人吧！</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getRankList } from '@/api/subject.js'
import Header from '@/views/components/layout/Header.vue'

const loading = ref(false)
const timeRange = ref('today')
const rankingType = ref('problemCount')
const rankings = ref([])
const myRank = ref(null)

const timeRanges = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

const rankingTypes = [
  { label: '刷题数', value: 'problemCount' },
  { label: '得分', value: 'score' },
  { label: '正确数', value: 'correctCount' }
]

const topThree = computed(() => {
  return rankings.value.slice(0, 3)
})

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

const getValueLabel = () => {
  const typeMap = {
    problemCount: '刷题数',
    score: '得分',
    correctCount: '正确数'
  }
  return typeMap[rankingType.value]
}

const getAvatarColor = (index) => {
  const colors = [
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
    'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
  ]
  return colors[index % colors.length]
}

const fetchRankings = async () => {
  loading.value = true
  try {
    const response = await getRankList(timeRange.value, rankingType.value)
    rankings.value = response.data || []
    const myIndex = rankings.value.findIndex(r => r.isMe)
    if (myIndex !== -1) {
      myRank.value = myIndex + 1
    }
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    rankings.value = [
      { userId: 1, userName: '张三', value: 156, trend: 'up', isMe: false },
      { userId: 2, userName: '李四', value: 142, trend: 'down', isMe: false },
      { userId: 3, userName: '王五', value: 138, trend: 'up', isMe: false },
      { userId: 4, userName: '赵六', value: 125, trend: 'same', isMe: false },
      { userId: 5, userName: '小明', value: 118, trend: 'up', isMe: true },
      { userId: 6, userName: '小红', value: 112, trend: 'down', isMe: false },
      { userId: 7, userName: '小刚', value: 105, trend: 'up', isMe: false },
      { userId: 8, userName: '小芳', value: 98, trend: 'same', isMe: false },
      { userId: 9, userName: '小强', value: 92, trend: 'up', isMe: false },
      { userId: 10, userName: '小丽', value: 88, trend: 'down', isMe: false }
    ]
    myRank.value = 5
  } finally {
    loading.value = false
  }
}

watch([timeRange, rankingType], () => {
  fetchRankings()
})

onMounted(() => {
  fetchRankings()
})
</script>

<style scoped>
.ranking-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%);
}

.main-content {
  padding: 100px 24px 48px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.top-three-section {
  margin-bottom: 40px;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 24px;
  padding: 20px 0;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.podium-item.first {
  order: 2;
}

.podium-item.second {
  order: 1;
}

.podium-item.third {
  order: 3;
}

.crown {
  width: 40px;
  height: 40px;
  color: #fbbf24;
  margin-bottom: 8px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 2px solid rgba(156, 163, 175, 0.5);
  animation: pulse-ring 2s infinite;
}

.avatar-ring.gold {
  border-color: #fbbf24;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  position: relative;
  z-index: 1;
}

.first .avatar {
  width: 96px;
  height: 96px;
  font-size: 36px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.4);
}

.rank-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.rank-badge svg {
  width: 14px;
  height: 14px;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
}

.rank-badge.silver {
  background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%);
  color: #374151;
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #a0522d 100%);
  color: #fef3c7;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.user-name.champion {
  font-size: 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.user-value.champion {
  font-size: 18px;
  font-weight: 700;
  color: #fbbf24;
}

.podium-stand {
  width: 100px;
  height: 60px;
  background: linear-gradient(180deg, rgba(156, 163, 175, 0.3) 0%, rgba(156, 163, 175, 0.1) 100%);
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(156, 163, 175, 0.2);
  border-bottom: none;
}

.podium-stand.gold {
  height: 80px;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.filter-section {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.filter-btn.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.ranking-list-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.my-rank {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 12px;
}

.my-rank-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.my-rank-value {
  font-size: 18px;
  font-weight: 700;
  color: #f59e0b;
}

.ranking-table {
  padding: 0;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px 80px;
  padding: 16px 28px;
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  max-height: 500px;
  overflow-y: auto;
}

.table-body::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-track {
  background: transparent;
}

.table-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 80px;
  padding: 16px 28px;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.table-row.is-me {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.2);
}

.table-row.top-three {
  background: rgba(245, 158, 11, 0.03);
}

.col {
  display: flex;
  align-items: center;
}

.col-rank {
  justify-content: center;
}

.col-value {
  justify-content: flex-end;
}

.col-trend {
  justify-content: center;
}

.rank-number {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.rank-medal {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-medal svg {
  width: 24px;
  height: 24px;
}

.rank-medal.medal-1 {
  color: #fbbf24;
}

.rank-medal.medal-2 {
  color: #9ca3af;
}

.rank-medal.medal-3 {
  color: #cd7f32;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info .user-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.user-badge {
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #f59e0b;
}

.value-number {
  font-size: 18px;
  font-weight: 700;
  color: #f59e0b;
}

.trend {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.trend svg {
  width: 20px;
  height: 20px;
}

.trend.up {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.trend.down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.trend-same {
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state svg {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  animation: float 4s ease-in-out infinite;
}

.empty-state h4 {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 32px;
  }

  .podium {
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .podium-item.first,
  .podium-item.second,
  .podium-item.third {
    order: unset;
  }

  .podium-stand {
    width: 150px;
  }

  .filter-section {
    flex-direction: column;
    gap: 20px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .filter-buttons {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-btn {
    flex: 1;
    min-width: 80px;
    text-align: center;
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 80px 60px;
    padding: 12px 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
