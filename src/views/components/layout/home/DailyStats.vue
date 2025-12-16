
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
          <span class="stat-label">刷题数:</span>
          <span class="stat-value">{{ dailyStats.problemCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">刷题时间:</span>
          <span class="stat-value">{{ formatTime(dailyStats.totalTime) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正确率:</span>
          <span class="stat-value">{{ dailyStats.accuracy }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">今日得分:</span>
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
  padding: 12px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.daily-stats-skeleton {
  padding: 12px 0;
}
</style>