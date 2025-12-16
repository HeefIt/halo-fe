<!--
  ProblemList 题目列表组件
  功能描述：题库页面中间题目列表区域
  主要功能：
    - 题目数据展示：显示题目信息即题目名称、难度、类型、标签等
    - 搜索功能：按题目名称模糊搜索
    - 分页展示：支持每页上下数预设，默认10条/页
    - 题目上传：点击题目卡片进入答题页面
    - 位置：中间区域，或者爓相涨收
  使用位置：QuestionBank.vue
-->
<template>
  <div class="problem-list-section">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索题目..."
        :prefix-icon="Search"
        size="large"
        clearable
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>
    
    <!-- 题目列表 -->
    <div class="problem-list" v-loading="loading">
      <el-card
        v-for="problem in problems"
        :key="problem.id"
        class="problem-card"
        @click="goToProblem(problem.id)"
      >
        <div class="problem-content">
          <div class="problem-header">
            <div class="problem-info">
              <h3 class="problem-title">{{ problem.subjectName }}</h3>
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
            </div>
          </div>
          
          <div class="problem-tags">
            <el-tag
              v-for="label in problem.labelName"
              :key="label"
              size="small"
              effect="plain"
            >
              {{ label }}
            </el-tag>
          </div>
        </div>
      </el-card>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && problems.length === 0" description="暂无题目数据" />
    </div>
    
    <!-- 分页 -->
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
import { inject } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 从父组件注入数据
const searchKeyword = inject('searchKeyword')
const loading = inject('loading')
const problems = inject('problems')
const pagination = inject('pagination')

// 从父组件注入方法
const handleSearch = inject('handleSearch')
const goToProblem = inject('goToProblem')
const getDifficultyType = inject('getDifficultyType')
const getDifficultyLabel = inject('getDifficultyLabel')
const getSubjectTypeType = inject('getSubjectTypeType')
const getSubjectTypeLabel = inject('getSubjectTypeLabel')
const handleSizeChange = inject('handleSizeChange')
const handleCurrentChange = inject('handleCurrentChange')
</script>

<style scoped>
/* 中间题目列表 */
.problem-list-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.search-bar :deep(.el-input) {
  flex: 1;
}

.problem-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.problem-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.problem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
}

.problem-content {
  padding: 4px;
}

.problem-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.problem-info {
  flex: 1;
}

.problem-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.problem-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.problem-meta {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.problem-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
}
</style>