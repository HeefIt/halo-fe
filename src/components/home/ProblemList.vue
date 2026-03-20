<!--
  ProblemList 题目列表组件
  功能描述：题库页面中间题目列表区域
  主要功能：
    - 题目数据展示：显示题目信息、难度、类型、标签等
    - 分页展示：支持每页条数切换
    - 题目跳转：点击题目条目进入答题页面
  使用位置：QuestionBank.vue
-->
<template>
  <div class="problem-list-section">
    <section class="result-bar">
      <div class="result-bar-main">
        <div class="result-copy">
          <span class="result-label">结果</span>
          <div class="result-title-row">
            <h2 class="result-title">{{ pagination.total }} 道题</h2>
            <span class="result-page">第 {{ currentPageLabel }} 页</span>
          </div>
        </div>

        <div class="result-metrics">
          <span class="metric-pill">{{ currentDeskMode }}</span>
          <span class="metric-pill" v-if="activeFilterCount > 0">筛选 {{ activeFilterCount }}</span>
        </div>
      </div>

      <div v-if="filterSummaryList.length > 0" class="filter-strip-list">
        <span
          v-for="item in filterSummaryList"
          :key="item"
          class="filter-pill"
        >
          {{ item }}
        </span>
      </div>
    </section>

    <div class="problem-list" v-loading="loading">
      <article
        v-for="problem in problems"
        :key="problem.id"
        class="problem-row"
        @click="goToProblem(problem.id)"
      >
        <div class="problem-index">
          <span class="problem-index-label">NO.</span>
          <strong class="problem-index-value">{{ formatProblemId(problem.id) }}</strong>
        </div>

        <div class="problem-main">
          <div class="problem-top">
            <div class="problem-copy">
              <h3 class="problem-title">{{ problem.subjectName }}</h3>
              <p class="problem-note">{{ buildProblemNote(problem) }}</p>
            </div>

            <div class="problem-meta">
              <el-tag
                :type="getDifficultyType(problem.subjectDifficult)"
                size="small"
              >
                {{ getDifficultyLabel(problem.subjectDifficult) }}
              </el-tag>
              <el-tag
                :type="getSubjectTypeType(problem.subjectType)"
                size="small"
              >
                {{ getSubjectTypeLabel(problem.subjectType) }}
              </el-tag>
              <button class="problem-start" @click.stop="goToProblem(problem.id)">
                开始练习
              </button>
            </div>
          </div>

          <div v-if="normalizeLabels(problem.labelName).length > 0" class="problem-tags">
            <span
              v-for="label in normalizeLabels(problem.labelName)"
              :key="label"
              class="problem-tag"
            >
              {{ label }}
            </span>
          </div>
        </div>
      </article>

      <el-empty
        v-if="!loading && problems.length === 0"
        description="当前条件下暂无题目"
      />
    </div>

    <div class="pagination-wrapper" v-if="problems.length > 0">
      <el-pagination
        v-model:current-page="pagination.pageNo"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const loading = inject('loading')
const problems = inject('problems')
const pagination = inject('pagination')
const activeFilterCount = inject('activeFilterCount')
const currentDeskMode = inject('currentDeskMode')
const filterSummaryList = inject('filterSummaryList')

const goToProblem = inject('goToProblem')
const getDifficultyType = inject('getDifficultyType')
const getDifficultyLabel = inject('getDifficultyLabel')
const getSubjectTypeType = inject('getSubjectTypeType')
const getSubjectTypeLabel = inject('getSubjectTypeLabel')
const handleSizeChange = inject('handleSizeChange')
const handleCurrentChange = inject('handleCurrentChange')

const currentPageLabel = computed(() => {
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.pageSize || 1)))
  return `${pagination.pageNo}/${totalPages}`
})

/**
 * 统一把标签字段整理成字符串数组，兼容后端返回数组或逗号分隔字符串。
 */
function normalizeLabels(labelName) {
  if (Array.isArray(labelName)) {
    return labelName
  }

  if (typeof labelName === 'string' && labelName.trim()) {
    return labelName
      .split(/[、,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

/**
 * 题目编号统一补零，保持列表扫描时的节奏感更稳定。
 */
function formatProblemId(id) {
  return String(id).padStart(3, '0')
}

/**
 * 生成列表副标题，只保留用户判断题目所需的关键信息。
 */
function buildProblemNote(problem) {
  const labels = normalizeLabels(problem.labelName)
  const fragments = [
    getSubjectTypeLabel(problem.subjectType),
    getDifficultyLabel(problem.subjectDifficult)
  ].filter(Boolean)

  if (labels.length > 0) {
    fragments.push(`${labels.length} 个标签`)
  }

  return fragments.join(' · ')
}
</script>

<style scoped>
.problem-list-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  color: var(--color-text);
}

.result-bar {
  display: grid;
  gap: 8px;
  margin-bottom: 8px;
  padding: 2px 0 12px;
  border-bottom: 1px solid var(--color-border);
}

.result-bar-main {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.result-label,
.problem-index-label {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.result-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.result-title {
  color: var(--color-text);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.05;
}

.result-page,
.metric-pill,
.filter-pill,
.problem-tag {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.result-metrics,
.filter-strip-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.problem-list {
  position: relative;
  min-height: 320px;
}

.problem-list :deep(.el-loading-mask) {
  background: var(--internal-loading-mask);
}

.problem-list :deep(.el-loading-spinner .el-loading-text) {
  color: var(--color-text-secondary);
}

.problem-row {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 18px;
  padding: 18px 0 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.problem-row:hover {
  background: rgba(23, 78, 166, 0.03);
}

.problem-index {
  padding-top: 1px;
}

.problem-index-value {
  display: block;
  margin-top: 8px;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 22px;
  line-height: 1.08;
}

.problem-main {
  min-width: 0;
}

.problem-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;
}

.problem-title {
  color: var(--color-text);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
}

.problem-note {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.problem-meta {
  display: grid;
  gap: 8px;
  justify-items: end;
}

.problem-meta :deep(.el-tag) {
  min-width: 72px;
  height: 26px;
  justify-content: center;
  border-radius: 0;
  font-weight: 700;
  border-width: 1px;
}

.problem-meta :deep(.el-tag--success) {
  background: rgba(15, 157, 88, 0.08);
  border-color: rgba(15, 157, 88, 0.16);
  color: #0f7b55;
}

.problem-meta :deep(.el-tag--warning) {
  background: rgba(201, 130, 0, 0.08);
  border-color: rgba(201, 130, 0, 0.16);
  color: #9a6700;
}

.problem-meta :deep(.el-tag--danger) {
  background: rgba(194, 59, 59, 0.08);
  border-color: rgba(194, 59, 59, 0.16);
  color: #a73b3b;
}

.problem-meta :deep(.el-tag--primary) {
  background: var(--color-accent-light);
  border-color: rgba(23, 78, 166, 0.16);
  color: var(--color-accent);
}

.problem-start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.problem-start:hover {
  background: var(--color-accent);
  color: #ffffff;
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.pagination-wrapper :deep(.btn-prev),
.pagination-wrapper :deep(.btn-next),
.pagination-wrapper :deep(.el-pager li) {
  min-width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: 0;
  background: var(--internal-panel-bg);
  color: var(--color-text-secondary);
}

.pagination-wrapper :deep(.el-pager li.is-active) {
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-color: rgba(23, 78, 166, 0.14);
}

.problem-list :deep(.el-empty) {
  padding: 72px 0;
}

@media (max-width: 900px) {
  .result-bar-main,
  .problem-top {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .result-bar-main {
    display: grid;
  }

  .problem-meta {
    justify-items: start;
    grid-auto-flow: column;
    justify-content: start;
  }
}

@media (max-width: 768px) {
  .problem-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .problem-index {
    padding-top: 0;
  }

  .problem-meta {
    grid-auto-flow: row;
  }
}

:global(.question-bank-page.is-dark) .result-title,
:global(.question-bank-page.is-dark) .problem-title,
:global(.question-bank-page.is-dark) .problem-index-value {
  color: var(--text-1);
}

:global(.question-bank-page.is-dark) .problem-row:hover {
  background: rgba(108, 159, 255, 0.05);
}

:global(.question-bank-page.is-dark) .problem-meta :deep(.el-tag--success) {
  color: #78d1aa;
}

:global(.question-bank-page.is-dark) .problem-meta :deep(.el-tag--warning) {
  color: #f0c679;
}

:global(.question-bank-page.is-dark) .problem-meta :deep(.el-tag--danger) {
  color: #f0a0a0;
}

:global(.question-bank-page.is-dark) .problem-meta :deep(.el-tag--primary) {
  color: var(--color-accent);
}
</style>
