<!--
  Sidebar 左侧筛选控制面板组件
  功能描述：题库页面的左侧筛选控制面板
  主要功能：
    - 每日刷题统计展示（刷题数、耗时、正确率、得分）
    - 多层级分类筛选（主分类→子分类→标签）
    - 难度筛选（简单/中等/困难）
    - 题目类型筛选（单选/多选/判断/简答）
    - 位置：沏一沏，使用sticky粘性定位
  使用位置：QuestionBank.vue
-->
<template>
  <aside class="filter-sidebar">
    <el-card class="filter-card">
      <template #header>
        <div class="filter-header">
          <span>控制面板</span>
          <el-button text @click="resetFilters">重置</el-button>
        </div>
      </template>
      
      <div class="filter-content">
        <!-- 每日刷题统计 -->
        <div class="filter-section">
          <h4>今日刷题统计 (每日凌晨1点结算)</h4>
          <slot name="daily-stats"></slot>
        </div>
        
        <!-- 层级筛选面包屑导航 -->
        <div class="filter-section" v-if="breadcrumbItems.length > 0">
          <div class="breadcrumb-container">
            <el-breadcrumb separator=">">
              <el-breadcrumb-item 
                v-for="(item, index) in breadcrumbItems" 
                :key="index"
                @click="handleBreadcrumbClick(index)"
                class="breadcrumb-item"
              >
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
            <el-button link @click="clearAllFilters" class="clear-all-btn">全部清除</el-button>
          </div>
        </div>
        
        <!-- 题目分类筛选 -->
        <div class="filter-section">
          <h4>{{ getCurrentLevelTitle() }}</h4>
          
          <!-- 返回上级按钮 -->
          <div v-if="currentLevel !== 'primary'" class="back-button-container">
            <el-button @click="goBack" size="small" type="primary" plain>
              <el-icon><ArrowLeft /></el-icon>
              返回上级
            </el-button>
          </div>
          
          <!-- 分类选项 -->
          <div class="filter-checkbox-group">
            <!-- 主分类 -->
            <div 
              v-for="category in primaryCategories" 
              :key="category.id" 
              class="category-item category-parent"
              v-show="currentLevel === 'primary'"
            >
              <el-button 
                @click="selectPrimaryCategory(category)" 
                :class="{ 'active': selectedCategories.primary?.id === category.id }"
                class="category-button"
              >
                {{ category.categoryName }}
                <el-icon class="arrow-right"><ArrowRight /></el-icon>
              </el-button>
            </div>
            
            <!-- 二级分类 -->
            <div 
              v-for="category in secondaryCategories" 
              :key="category.id" 
              class="category-item category-child"
              v-show="currentLevel === 'secondary'"
            >
              <el-button 
                @click="selectSecondaryCategory(category)" 
                :class="{ 'active': selectedCategories.secondary?.id === category.id }"
                class="category-button"
              >
                {{ category.categoryName }}
                <el-icon class="arrow-right"><ArrowRight /></el-icon>
              </el-button>
            </div>
            
            <!-- 标签 -->
            <div 
              v-for="label in currentLabels" 
              :key="label.id" 
              class="label-item"
              v-show="currentLevel === 'label'"
            >
              <el-checkbox 
                :label="label.id"
                v-model="selectedLabels[label.id]"
                @change="(val) => handleLabelSelect(label, val)"
                class="filter-checkbox-item"
              >
                {{ label.labelName }}
              </el-checkbox>
            </div>
          </div>
        </div>
        
        <!-- 题目难度筛选 -->
        <div class="filter-section">
          <h4>题目难度</h4>
          <div class="filter-checkbox-group">
            <el-checkbox 
              :label="1" 
              v-model="isDifficultySelected[1]"
              @change="handleDifficultyChange(1, $event)"
              class="filter-checkbox-item"
            >
              简单
            </el-checkbox>
            <el-checkbox 
              :label="2" 
              v-model="isDifficultySelected[2]"
              @change="handleDifficultyChange(2, $event)"
              class="filter-checkbox-item"
            >
              中等
            </el-checkbox>
            <el-checkbox 
              :label="3" 
              v-model="isDifficultySelected[3]"
              @change="handleDifficultyChange(3, $event)"
              class="filter-checkbox-item"
            >
              困难
            </el-checkbox>
          </div>
        </div>
        
        <!-- 题目类型筛选 -->
        <div class="filter-section">
          <h4>题目类型</h4>
          <div class="filter-checkbox-group">
            <el-checkbox 
              :label="1" 
              v-model="isTypeSelected[1]"
              @change="handleTypeChange(1, $event)"
              class="filter-checkbox-item"
            >
              单选题
            </el-checkbox>
            <el-checkbox 
              :label="2" 
              v-model="isTypeSelected[2]"
              @change="handleTypeChange(2, $event)"
              class="filter-checkbox-item"
            >
              多选题
            </el-checkbox>
            <el-checkbox 
              :label="3" 
              v-model="isTypeSelected[3]"
              @change="handleTypeChange(3, $event)"
              class="filter-checkbox-item"
            >
              判断题
            </el-checkbox>
            <el-checkbox 
              :label="4" 
              v-model="isTypeSelected[4]"
              @change="handleTypeChange(4, $event)"
              class="filter-checkbox-item"
            >
              简答题
            </el-checkbox>
          </div>
        </div>
        
        <div class="filter-actions">
          <el-button @click="resetFilters" block>重置筛选</el-button>
        </div>
      </div>
    </el-card>
  </aside>
</template>

<script setup>
import { inject } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// 从父组件注入数据和方法
const primaryCategories = inject('primaryCategories')
const secondaryCategories = inject('secondaryCategories')
const currentLevel = inject('currentLevel')
const selectedCategories = inject('selectedCategories')
const currentLabels = inject('currentLabels')
const selectedLabels = inject('selectedLabels')
const breadcrumbItems = inject('breadcrumbItems')
const isDifficultySelected = inject('isDifficultySelected')
const isTypeSelected = inject('isTypeSelected')

// 从父组件注入方法
const selectPrimaryCategory = inject('selectPrimaryCategory')
const selectSecondaryCategory = inject('selectSecondaryCategory')
const handleLabelSelect = inject('handleLabelSelect')
const goBack = inject('goBack')
const handleBreadcrumbClick = inject('handleBreadcrumbClick')
const clearAllFilters = inject('clearAllFilters')
const handleDifficultyChange = inject('handleDifficultyChange')
const handleTypeChange = inject('handleTypeChange')
const resetFilters = inject('resetFilters')
const getCurrentLevelTitle = inject('getCurrentLevelTitle')

</script>

<style scoped>
/* 左侧筛选栏 */
.filter-sidebar {
  position: sticky;
  top: 64px;
  width: 320px;
  flex-shrink: 0;
  height: fit-content;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
}

.filter-card {
  border-radius: 8px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-content {
  padding: 8px 0;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section h4 {
  margin-bottom: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.filter-section :deep(.filter-select) {
  width: 100%;
}

.filter-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-radio-group.horizontal {
  flex-direction: row;
}

.filter-radio-item {
  margin-right: 0;
  align-items: center;
}

.filter-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-checkbox-item {
  margin-right: 0;
  align-items: center;
}

.category-item {
  display: flex;
  align-items: center;
}

.category-parent {
  font-weight: bold;
}

.category-child {
  padding-left: 16px;
}

.filter-actions {
  margin-top: 24px;
}

.filter-actions :deep(.el-button) {
  height: 36px;
  font-weight: 500;
}

/* 面包屑导航 */
.breadcrumb-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.breadcrumb-item {
  cursor: pointer;
}

.breadcrumb-item:hover {
  color: var(--primary-color);
}

.clear-all-btn {
  font-size: 12px;
}

.back-button-container {
  margin-bottom: 16px;
}

/* 分类按钮样式 */
.category-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  text-align: left;
}

.category-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.category-button:not(.active):hover {
  background-color: #ecf5ff;
  color: var(--primary-color);
}

.arrow-right {
  font-size: 12px;
}

/* 标签项样式 */
.label-item {
  margin-bottom: 8px;
}

/* 层级区分样式 */
.category-parent {
  font-weight: bold;
}

.category-child {
  padding-left: 16px;
}

@media (max-width: 1200px) {
  .filter-sidebar {
    position: static;
    width: 100%;
  }
}
</style>