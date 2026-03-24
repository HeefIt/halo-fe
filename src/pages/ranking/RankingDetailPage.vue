<template>
  <div
    class="ranking-detail-page app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main-content">
      <div class="container">
        <div class="back-row">
          <button class="back-btn" @click="goBack">返回排行榜</button>
        </div>

        <section class="hero-panel">
          <div class="hero-main">
            <span class="hero-kicker">RANK DETAIL</span>
            <h1 class="hero-title">{{ rankingTitle }}</h1>
          </div>

          <div class="hero-actions">
            <button class="refresh-btn" @click="refreshData">刷新榜单</button>
          </div>
        </section>

        <section class="summary-strip">
          <article class="summary-unit summary-unit-strong">
            <span class="summary-label">我的排名</span>
            <strong class="summary-value">{{ userRank ? `#${userRank}` : '--' }}</strong>
            <span class="summary-meta">{{ userStore.userName || '当前用户' }}</span>
          </article>
          <article class="summary-unit">
            <span class="summary-label">当前成绩</span>
            <strong class="summary-value">{{ rankingValue || '--' }}</strong>
            <span class="summary-meta">{{ valueLabel }}</span>
          </article>
          <article class="summary-unit">
            <span class="summary-label">榜单人数</span>
            <strong class="summary-value">{{ rankings.length }}</strong>
          </article>
        </section>

        <div class="content-grid">
          <section class="ranking-panel">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">完整排名</h2>
              </div>
            </div>

            <div class="ranking-stream" v-loading="loading">
              <article
                v-for="(item, index) in rankings"
                :key="item.userId || index"
                class="ranking-row"
                :class="{ 'is-current': item.isCurrentUser }"
              >
                <div class="rank-cell">
                  <span class="rank-number" :class="{ top: index < 3 }">#{{ index + 1 }}</span>
                </div>

                <div class="user-cell">
                  <div class="avatar-shell">
                    {{ item.userName?.charAt(0) || 'U' }}
                  </div>
                  <div class="user-copy">
                    <strong class="user-name">{{ item.userName }}</strong>
                    <span class="user-mark" v-if="item.isCurrentUser">当前用户</span>
                  </div>
                </div>

                <div class="value-cell">
                  <span class="value-label">{{ valueLabel }}</span>
                  <strong class="value-number">{{ item.value }}</strong>
                </div>

                <div class="trend-cell">
                  <span class="trend-chip" :class="item.trend">{{ getTrendText(item.trend) }}</span>
                </div>
              </article>
            </div>
          </section>

          <aside class="aside-column">
            <section class="aside-panel">
              <div class="panel-head">
                <div>
                  <h2 class="panel-title">TOP 3</h2>
                </div>
              </div>

              <div class="top-list">
                <div
                  v-for="(item, index) in rankings.slice(0, 3)"
                  :key="item.userId || index"
                  class="top-row"
                >
                  <span class="top-rank">#{{ index + 1 }}</span>
                  <span class="top-name">{{ item.userName }}</span>
                  <strong class="top-value">{{ item.value }}</strong>
                </div>
              </div>
            </section>

            <section class="aside-panel">
              <div class="panel-head">
                <div>
                  <h2 class="panel-title">我的摘要</h2>
                </div>
              </div>

              <div class="note-list">
                <div class="note-item">
                  <span class="note-label">用户名</span>
                  <strong class="note-value">{{ userStore.userName || '未登录用户' }}</strong>
                </div>
                <div class="note-item">
                  <span class="note-label">当前名次</span>
                  <strong class="note-value">{{ userRank ? `#${userRank}` : '--' }}</strong>
                </div>
                <div class="note-item">
                  <span class="note-label">统计口径</span>
                  <strong class="note-value">{{ valueLabel }}</strong>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { useThemeStore } from '@/stores/modules/theme'
import { getRankDetail, getRankList } from '@/api/modules/question/subject.js'
import Header from '@/layouts/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const loading = ref(false)
const rankings = ref([])

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

const valueLabel = computed(() => {
  const typeMap = {
    problemCount: '刷题数',
    score: '得分',
    correctCount: '正确数'
  }

  const type = route.query.type || 'problemCount'
  return typeMap[type]
})

const userRank = ref(null)
const rankingValue = ref(0)

const goBack = () => {
  router.push('/ranking')
}

const refreshData = () => {
  fetchRankingDetail()
}

const getTrendText = (trend) => {
  const map = {
    up: '上升',
    down: '下降',
    same: '持平'
  }
  return map[trend] || '持平'
}

const normalizeRankings = (list = []) => {
  return list.map((item) => {
    const userId = item.userId ?? item.id ?? null
    return {
      ...item,
      userId,
      isCurrentUser: userStore.userId && String(userId) === String(userStore.userId)
    }
  })
}

const fetchRankingDetail = async () => {
  loading.value = true

  try {
    const time = route.query.time || 'today'
    const type = route.query.type || 'problemCount'
    const userId = userStore.userId

    if (!userId) {
      const response = await getRankList(time, type)
      rankings.value = normalizeRankings(response.data || [])
      userRank.value = null
      rankingValue.value = 0
      return
    }

    const response = await getRankDetail(time, type, userId)
    const data = response.data || {}

    rankings.value = normalizeRankings(data.rankings || [])
    userRank.value = Number(data.currentUserRank || 0) > 0 ? Number(data.currentUserRank) : null
    rankingValue.value = Number(data.currentUserValue || 0)
  } catch (error) {
    console.error('获取排行榜详情失败:', error)
    rankings.value = []
    userRank.value = null
    rankingValue.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRankingDetail()
})
</script>

<style scoped>
.ranking-detail-page {
  --detail-bg: #f3f5f8;
  --detail-surface: #ffffff;
  --detail-surface-soft: #eef2f6;
  --detail-border: rgba(15, 23, 42, 0.1);
  --detail-line: rgba(15, 23, 42, 0.06);
  --detail-text: var(--color-text);
  --detail-text-soft: var(--color-text-secondary);
  --detail-text-faint: var(--color-text-muted);
  --detail-accent: #b45309;
  --detail-accent-soft: rgba(180, 83, 9, 0.08);
  --detail-accent-line: rgba(180, 83, 9, 0.16);
  min-height: 100vh;
  background: var(--detail-bg);
}

.ranking-detail-page.is-dark {
  --detail-bg: #09111c;
  --detail-surface: #0f172a;
  --detail-surface-soft: #111c31;
  --detail-border: rgba(148, 163, 184, 0.14);
  --detail-line: rgba(148, 163, 184, 0.1);
  --detail-text: var(--text-1);
  --detail-text-soft: var(--text-2);
  --detail-text-faint: var(--text-3);
  --detail-accent: #fbbf24;
  --detail-accent-soft: rgba(251, 191, 36, 0.12);
  --detail-accent-line: rgba(251, 191, 36, 0.18);
}

.main-content {
  padding: 94px 20px 36px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-row {
  margin-bottom: 12px;
}

.back-btn,
.refresh-btn {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--detail-border);
  background: var(--detail-surface);
  color: var(--detail-text);
  font-size: 13px;
  font-weight: 700;
}

.hero-panel,
.summary-strip,
.ranking-panel,
.aside-panel {
  border: 1px solid var(--detail-border);
  background: var(--detail-surface);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
  padding: 22px 24px;
}

.hero-kicker,
.summary-label,
.note-label {
  color: var(--detail-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-title {
  margin: 6px 0 0;
  color: var(--detail-text);
  font-size: clamp(30px, 4vw, 42px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.hero-subtitle,
.summary-meta,
.panel-desc {
  color: var(--detail-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

.hero-subtitle {
  max-width: 620px;
  margin: 10px 0 0;
}

.refresh-btn {
  border-color: var(--detail-accent);
  background: var(--detail-accent-soft);
  color: var(--detail-accent);
}

.summary-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(0, 1fr));
  margin-top: 14px;
}

.summary-unit {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-right: 1px solid var(--detail-line);
}

.summary-unit:last-child {
  border-right: none;
}

.summary-unit-strong {
  background: var(--detail-surface-soft);
}

.summary-value {
  color: var(--detail-text);
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.32fr) 320px;
  gap: 16px;
  margin-top: 16px;
}

.ranking-panel,
.aside-panel {
  padding: 16px;
}

.aside-column {
  display: grid;
  gap: 16px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.panel-title {
  margin: 0;
  color: var(--detail-text);
  font-size: 18px;
}

.panel-desc {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.ranking-stream,
.top-list,
.note-list {
  display: grid;
  gap: 0;
  margin-top: 14px;
}

.ranking-row,
.top-row,
.note-item {
  border-bottom: 1px solid var(--detail-line);
}

.ranking-row:last-child,
.top-row:last-child,
.note-item:last-child {
  border-bottom: none;
}

.ranking-row {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 140px 96px;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
}

.ranking-row.is-current {
  background: var(--detail-accent-soft);
  margin: 0 -16px;
  padding: 14px 16px;
}

.rank-number {
  color: var(--detail-text-soft);
  font-size: 18px;
  font-weight: 800;
}

.rank-number.top {
  color: var(--detail-accent);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar-shell {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
}

.user-copy {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-name {
  color: var(--detail-text);
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-mark {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 6px;
  background: var(--detail-surface-soft);
  color: var(--detail-accent);
  font-size: 11px;
  font-weight: 700;
}

.value-cell {
  display: grid;
  justify-items: end;
  gap: 4px;
}

.value-label {
  color: var(--detail-text-faint);
  font-size: 11px;
  font-weight: 700;
}

.value-number,
.top-value,
.note-value {
  color: var(--detail-text);
  font-size: 18px;
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
  border: 1px solid var(--detail-border);
  color: var(--detail-text-soft);
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
  background: var(--detail-surface-soft);
}

.ranking-detail-page.is-dark .trend-chip.up {
  color: #86efac;
}

.ranking-detail-page.is-dark .trend-chip.down {
  color: #fca5a5;
}

.top-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
}

.top-rank,
.top-name {
  color: var(--detail-text-soft);
  font-size: 14px;
}

.note-item {
  display: grid;
  gap: 6px;
  padding: 12px 0;
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
    border-bottom: 1px solid var(--detail-line);
  }

  .summary-unit:last-child {
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .hero-panel,
  .ranking-row {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .hero-panel {
    align-items: start;
  }

  .value-cell,
  .trend-cell {
    justify-items: start;
    justify-content: start;
  }
}
</style>
