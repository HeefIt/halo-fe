
<!--
  DailyStats 每日统计组件
  功能描述：显示今日刷题统计数据
  主要功能：
    - 显示今日刷题信息（刷题数、耗时、正确率、得分）
    - 支持加载态
  使用位置：QuestionBank.vue的Sidebar中
-->
<template>
  <el-skeleton :loading="dailyStatsLoading" animated>
    <template #template>
      <div class="daily-stats-skeleton">
        <el-skeleton-item variant="text" style="width: 60%; height: 20px; margin-bottom: 8px;" />
        <el-skeleton-item variant="text" style="width: 80%; height: 16px; margin-bottom: 4px;" />
        <el-skeleton-item variant="text" style="width: 70%; height: 16px; margin-bottom: 4px;" />
        <el-skeleton-item variant="text" style="width: 90%; height: 16px;" />
      </div>
    </template>
    <template #default>
      <div class="daily-stats-content">
        <div class="stat-item">
          <span class="stat-label">刷题数</span>
          <span class="stat-value">{{ dailyStats.problemCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">学习时长</span>
          <span class="stat-value">{{ formatTime(dailyStats.totalTime) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正确率</span>
          <span class="stat-value">{{ dailyStats.accuracy }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">今日得分</span>
          <span class="stat-value">{{ dailyStats.totalScore }}</span>
        </div>
      </div>
    </template>
  </el-skeleton>
</template>

<script setup>
import { inject } from 'vue'

// 从父组件注入数据
const dailyStats = inject('dailyStats')
const dailyStatsLoading = inject('dailyStatsLoading')
const formatTime = inject('formatTime')
</script>

<style scoped>
/* 每日统计样式 */
.daily-stats-content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 4px 0 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 82px;
  padding: 14px;
  border-radius: 18px;
  background: var(--qb-panel-bg, var(--internal-panel-bg));
  border: 1px solid var(--qb-panel-border, var(--internal-panel-border));
}

.stat-label {
  color: var(--qb-text-faint, var(--color-text-muted));
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.stat-value {
  color: var(--qb-text-main, var(--color-text));
  font-weight: 700;
  font-size: 16px;
  line-height: 1.4;
}

.daily-stats-skeleton {
  padding: 4px 0 0;
}

@media (max-width: 768px) {
  .daily-stats-content {
    grid-template-columns: 1fr;
  }
}
</style>
