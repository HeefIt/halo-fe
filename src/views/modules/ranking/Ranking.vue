<template>
  <div
    class="ranking-page app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main-content">
      <div class="container">
        <section class="page-hero">
          <div class="hero-copy">
            <span class="hero-kicker">RANKING BOARD</span>
            <h1 class="hero-title">排行榜</h1>
          </div>
        </section>

        <section class="summary-strip">
          <article class="summary-unit summary-unit-strong">
            <span class="summary-label">当前榜单</span>
            <strong class="summary-value">{{ getRankingTitle() }}</strong>
            <span class="summary-meta">共 {{ rankings.length }} 位学习者</span>
          </article>
          <article class="summary-unit">
            <span class="summary-label">我的排名</span>
            <strong class="summary-value">{{ myRank ? `#${myRank}` : '--' }}</strong>
          </article>
          <article class="summary-unit">
            <span class="summary-label">榜首成绩</span>
            <strong class="summary-value">{{ topThree[0]?.value ?? '--' }}</strong>
            <span class="summary-meta">{{ getValueLabel() }}</span>
          </article>
        </section>

        <section class="toolbar">
          <div class="control-group">
            <span class="control-label">时间范围</span>
            <div class="control-tabs">
              <button
                v-for="range in timeRanges"
                :key="range.value"
                class="control-tab"
                :class="{ active: timeRange === range.value }"
                @click="timeRange = range.value"
              >
                {{ range.label }}
              </button>
            </div>
          </div>

          <div class="control-group">
            <span class="control-label">排行类型</span>
            <div class="control-tabs">
              <button
                v-for="type in rankingTypes"
                :key="type.value"
                class="control-tab"
                :class="{ active: rankingType === type.value }"
                @click="rankingType = type.value"
              >
                {{ type.label }}
              </button>
            </div>
          </div>
        </section>

        <div class="content-grid">
          <aside class="leader-panel" v-if="topThree.length > 0">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">TOP 3 摘要</h2>
              </div>
            </div>

            <article class="leader-focus" v-if="topThree[0]">
              <span class="leader-rank">#1</span>
              <strong class="leader-name">{{ topThree[0].userName }}</strong>
              <span class="leader-score">{{ topThree[0].value }} {{ getValueLabel() }}</span>
            </article>

            <div class="leader-list">
              <div
                v-for="(item, index) in topThree.slice(1)"
                :key="item.userId || index"
                class="leader-row"
              >
                <span class="leader-row-rank">#{{ index + 2 }}</span>
                <span class="leader-row-name">{{ item.userName }}</span>
                <strong class="leader-row-value">{{ item.value }}</strong>
              </div>
            </div>
          </aside>

          <section class="ranking-panel">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">{{ getRankingTitle() }}</h2>
              </div>
              <span class="panel-meta">我的位置 {{ myRank ? `#${myRank}` : '--' }}</span>
            </div>

            <div class="ranking-stream" v-loading="loading">
              <article
                v-for="(item, index) in rankings"
                :key="item.userId || index"
                class="ranking-row"
                :class="{ 'is-me': item.isMe }"
              >
                <div class="rank-cell">
                  <span class="rank-number" :class="{ top: index < 3 }">#{{ index + 1 }}</span>
                </div>

                <div class="user-cell">
                  <div class="avatar-shell" :style="{ background: getAvatarColor(index) }">
                    {{ item.userName?.charAt(0) || 'U' }}
                  </div>
                  <div class="user-copy">
                    <strong class="user-name">{{ item.userName }}</strong>
                    <span class="user-flag" v-if="item.isMe">我</span>
                  </div>
                </div>

                <div class="value-cell">
                  <span class="value-label">{{ getValueLabel() }}</span>
                  <strong class="value-number">{{ item.value }}</strong>
                </div>

                <div class="trend-cell">
                  <span class="trend-chip" :class="item.trend">
                    {{ getTrendText(item.trend) }}
                  </span>
                </div>
              </article>
            </div>

            <div class="empty-block" v-if="!loading && rankings.length === 0">
              当前条件下还没有排行数据，先完成几道题，榜单就会开始记录你的进度。
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getRankList } from '@/api/subject.js'
import { useThemeStore } from '@/stores/theme'
import Header from '@/views/components/layout/Header.vue'

const loading = ref(false)
const themeStore = useThemeStore()
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
  { label: '练习量', value: 'problemCount' },
  { label: '综合得分', value: 'score' },
  { label: '正确率', value: 'correctCount' }
]

const topThree = computed(() => rankings.value.slice(0, 3))

const getRankingTitle = () => {
  const timeMap = {
    today: '今日',
    week: '本周',
    month: '本月'
  }
  const typeMap = {
    problemCount: '练习量排行',
    score: '综合得分排行',
    correctCount: '正确率排行'
  }
  return `${timeMap[timeRange.value]}${typeMap[rankingType.value]}`
}

const getValueLabel = () => {
  const typeMap = {
    problemCount: '练习量',
    score: '综合得分',
    correctCount: '正确率'
  }
  return typeMap[rankingType.value]
}

const getTrendText = (trend) => {
  const map = {
    up: '上升',
    down: '下降',
    same: '持平'
  }
  return map[trend] || '持平'
}

const getAvatarColor = (index) => {
  const colors = [
    'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    'linear-gradient(135deg, #9a3412 0%, #7c2d12 100%)',
    'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
    'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
  ]
  return colors[index % colors.length]
}

const fetchRankings = async () => {
  loading.value = true
  try {
    const response = await getRankList(timeRange.value, rankingType.value)
    rankings.value = response.data || []
    const myIndex = rankings.value.findIndex(r => r.isMe)
    myRank.value = myIndex !== -1 ? myIndex + 1 : null
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
  --ranking-bg: #f3f5f8;
  --ranking-surface: #ffffff;
  --ranking-surface-soft: #eef2f6;
  --ranking-border: rgba(15, 23, 42, 0.1);
  --ranking-line: rgba(15, 23, 42, 0.06);
  --ranking-text: var(--color-text);
  --ranking-text-soft: var(--color-text-secondary);
  --ranking-text-faint: var(--color-text-muted);
  --ranking-accent: #b45309;
  --ranking-accent-soft: rgba(180, 83, 9, 0.08);
  --ranking-accent-line: rgba(180, 83, 9, 0.16);
  min-height: 100vh;
  background: var(--ranking-bg);
}

.ranking-page.is-dark {
  --ranking-bg: #09111c;
  --ranking-surface: #0f172a;
  --ranking-surface-soft: #111c31;
  --ranking-border: rgba(148, 163, 184, 0.14);
  --ranking-line: rgba(148, 163, 184, 0.1);
  --ranking-text: var(--text-1);
  --ranking-text-soft: var(--text-2);
  --ranking-text-faint: var(--text-3);
  --ranking-accent: #fbbf24;
  --ranking-accent-soft: rgba(251, 191, 36, 0.12);
  --ranking-accent-line: rgba(251, 191, 36, 0.18);
}

.main-content {
  padding: 94px 20px 36px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-hero,
.summary-strip,
.toolbar,
.leader-panel,
.ranking-panel {
  border: 1px solid var(--ranking-border);
  background: var(--ranking-surface);
}

.page-hero {
  padding: 22px 24px;
}

.hero-kicker,
.summary-label,
.control-label {
  color: var(--ranking-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-title {
  margin: 6px 0 0;
  color: var(--ranking-text);
  font-size: clamp(30px, 4vw, 42px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.hero-subtitle,
.summary-meta,
.panel-desc {
  color: var(--ranking-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

.hero-subtitle {
  max-width: 620px;
  margin: 10px 0 0;
}

.summary-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 1fr));
  margin-top: 14px;
}

.summary-unit {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-right: 1px solid var(--ranking-line);
}

.summary-unit:last-child {
  border-right: none;
}

.summary-unit-strong {
  background: var(--ranking-surface-soft);
}

.summary-value {
  color: var(--ranking-text);
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 18px 28px;
  align-items: center;
  margin-top: 14px;
  padding: 12px 16px;
}

.control-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.control-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.control-tab {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--ranking-border);
  background: transparent;
  color: var(--ranking-text-soft);
  font-size: 13px;
  font-weight: 700;
}

.control-tab.active {
  border-color: var(--ranking-accent-line);
  background: var(--ranking-accent-soft);
  color: var(--ranking-accent);
}

.content-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.leader-panel,
.ranking-panel {
  padding: 16px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.panel-title {
  margin: 0;
  color: var(--ranking-text);
  font-size: 18px;
}

.panel-desc {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.panel-meta {
  color: var(--ranking-text-faint);
  font-size: 12px;
  font-weight: 700;
}

.leader-focus {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 18px;
  background: var(--ranking-surface-soft);
  border: 1px solid var(--ranking-line);
}

.leader-rank {
  color: var(--ranking-accent);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.leader-name {
  color: var(--ranking-text);
  font-size: 26px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.leader-score {
  color: var(--ranking-text-soft);
  font-size: 14px;
}

.leader-list {
  display: grid;
  gap: 0;
  margin-top: 12px;
}

.leader-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--ranking-line);
}

.leader-row:last-child {
  border-bottom: none;
}

.leader-row-rank,
.leader-row-name {
  color: var(--ranking-text-soft);
  font-size: 14px;
}

.leader-row-value {
  color: var(--ranking-text);
  font-size: 16px;
}

.ranking-stream {
  display: grid;
  gap: 0;
  margin-top: 14px;
}

.ranking-row {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 160px 96px;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--ranking-line);
}

.ranking-row:last-child {
  border-bottom: none;
}

.ranking-row.is-me {
  background: var(--ranking-accent-soft);
  margin: 0 -16px;
  padding: 14px 16px;
}

.rank-number {
  color: var(--ranking-text-soft);
  font-size: 18px;
  font-weight: 800;
}

.rank-number.top {
  color: var(--ranking-accent);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar-shell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.user-copy {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-name {
  color: var(--ranking-text);
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-flag {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 6px;
  background: var(--ranking-surface-soft);
  color: var(--ranking-accent);
  font-size: 11px;
  font-weight: 700;
}

.value-cell {
  display: grid;
  justify-items: end;
  gap: 4px;
}

.value-label {
  color: var(--ranking-text-faint);
  font-size: 11px;
  font-weight: 700;
}

.value-number {
  color: var(--ranking-text);
  font-size: 20px;
  line-height: 1;
}

.trend-cell {
  display: flex;
  justify-content: end;
}

.trend-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border: 1px solid var(--ranking-border);
  color: var(--ranking-text-soft);
  font-size: 12px;
  font-weight: 700;
}

.trend-chip.up {
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.16);
  background: rgba(34, 197, 94, 0.08);
}

.trend-chip.down {
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.16);
  background: rgba(239, 68, 68, 0.08);
}

.trend-chip.same {
  background: var(--ranking-surface-soft);
}

.ranking-page.is-dark .trend-chip.up {
  color: #86efac;
}

.ranking-page.is-dark .trend-chip.down {
  color: #fca5a5;
}

.empty-block {
  margin-top: 16px;
  color: var(--ranking-text-soft);
  font-size: 14px;
}

@media (max-width: 1080px) {
  .main-content {
    padding: 94px 16px 28px;
  }

  .container {
    padding: 0 16px;
  }

  .summary-strip,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .summary-unit {
    border-right: none;
    border-bottom: 1px solid var(--ranking-line);
  }

  .summary-unit:last-child {
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .ranking-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .value-cell,
  .trend-cell {
    justify-items: start;
    justify-content: start;
  }
}
</style>
