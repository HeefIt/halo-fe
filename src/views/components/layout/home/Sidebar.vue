<template>
  <aside class="filter-sidebar">
    <div class="sidebar-header">
      <h3>筛选条件</h3>
      <button class="reset-btn" @click="resetFilters">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        重置
      </button>
    </div>

    <div class="sidebar-content">
      <div class="stats-section">
        <div class="stats-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>今日统计</span>
        </div>
        <slot name="daily-stats"></slot>
      </div>

      <div class="breadcrumb-section" v-if="breadcrumbItems.length > 0">
        <div class="breadcrumb-nav">
          <button
            v-for="(item, index) in breadcrumbItems"
            :key="index"
            class="breadcrumb-item"
            @click="handleBreadcrumbClick(index)"
          >
            <span>{{ item.name }}</span>
            <svg v-if="index < breadcrumbItems.length - 1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <button class="clear-all-btn" @click="clearAllFilters">
          清除全部
        </button>
      </div>

      <div class="filter-section">
        <div class="section-header" @click="toggleSection('category')">
          <h4>{{ getCurrentLevelTitle() }}</h4>
          <svg :class="{ rotated: !expandedSections.category }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        <div class="section-content" v-show="expandedSections.category">
          <button v-if="currentLevel !== 'primary'" class="back-btn" @click="goBack">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            返回上级
          </button>

          <div class="category-list" v-show="currentLevel === 'primary'">
            <button
              v-for="category in primaryCategories"
              :key="category.id"
              class="category-card"
              :class="{ active: selectedCategories.primary?.id === category.id }"
              @click="selectPrimaryCategory(category)"
            >
              <span class="category-name">{{ category.categoryName }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div class="category-list" v-show="currentLevel === 'secondary'">
            <button
              v-for="category in secondaryCategories"
              :key="category.id"
              class="category-card"
              :class="{ active: selectedCategories.secondary?.id === category.id }"
              @click="selectSecondaryCategory(category)"
            >
              <span class="category-name">{{ category.categoryName }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div class="label-list" v-show="currentLevel === 'label'">
            <label
              v-for="label in currentLabels"
              :key="label.id"
              class="label-chip"
              :class="{ selected: selectedLabels[label.id] }"
            >
              <input
                type="checkbox"
                :checked="selectedLabels[label.id]"
                @change="(e) => handleLabelSelect(label, e.target.checked)"
              />
              <span class="chip-indicator"></span>
              <span class="chip-text">{{ label.labelName }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="section-header" @click="toggleSection('difficulty')">
          <h4>题目难度</h4>
          <svg :class="{ rotated: !expandedSections.difficulty }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        <div class="section-content" v-show="expandedSections.difficulty">
          <div class="difficulty-options">
            <label
              class="difficulty-chip easy"
              :class="{ selected: isDifficultySelected[1] }"
            >
              <input
                type="checkbox"
                :checked="isDifficultySelected[1]"
                @change="(e) => handleDifficultyChange(1, e.target.checked)"
              />
              <span class="chip-indicator"></span>
              <span class="chip-text">简单</span>
            </label>
            <label
              class="difficulty-chip medium"
              :class="{ selected: isDifficultySelected[2] }"
            >
              <input
                type="checkbox"
                :checked="isDifficultySelected[2]"
                @change="(e) => handleDifficultyChange(2, e.target.checked)"
              />
              <span class="chip-indicator"></span>
              <span class="chip-text">中等</span>
            </label>
            <label
              class="difficulty-chip hard"
              :class="{ selected: isDifficultySelected[3] }"
            >
              <input
                type="checkbox"
                :checked="isDifficultySelected[3]"
                @change="(e) => handleDifficultyChange(3, e.target.checked)"
              />
              <span class="chip-indicator"></span>
              <span class="chip-text">困难</span>
            </label>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="section-header" @click="toggleSection('type')">
          <h4>题目类型</h4>
          <svg :class="{ rotated: !expandedSections.type }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        <div class="section-content" v-show="expandedSections.type">
          <div class="type-options">
            <label
              class="type-chip"
              :class="{ selected: isTypeSelected[1] }"
            >
              <input
                type="checkbox"
                :checked="isTypeSelected[1]"
                @change="(e) => handleTypeChange(1, e.target.checked)"
              />
              <span class="chip-indicator"></span>
              <span class="chip-text">单选题</span>
            </label>
            <label
              class="type-chip"
              :class="{ selected: isTypeSelected[2] }"
            >
              <input
                type="checkbox"
                :checked="isTypeSelected[2]"
                @change="(e) => handleTypeChange(2, e.target.checked)"
              />
              <span class="chip-indicator"></span>
              <span class="chip-text">多选题</span>
            </label>
            <label
              class="type-chip"
              :class="{ selected: isTypeSelected[3] }"
            >
              <input
                type="checkbox"
                :checked="isTypeSelected[3]"
                @change="(e) => handleTypeChange(3, e.target.checked)"
              />
              <span class="chip-indicator"></span>
              <span class="chip-text">判断题</span>
            </label>
            <label
              class="type-chip"
              :class="{ selected: isTypeSelected[4] }"
            >
              <input
                type="checkbox"
                :checked="isTypeSelected[4]"
                @change="(e) => handleTypeChange(4, e.target.checked)"
              />
              <span class="chip-indicator"></span>
              <span class="chip-text">简答题</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { inject, reactive } from 'vue'

const primaryCategories = inject('primaryCategories')
const secondaryCategories = inject('secondaryCategories')
const currentLevel = inject('currentLevel')
const selectedCategories = inject('selectedCategories')
const currentLabels = inject('currentLabels')
const selectedLabels = inject('selectedLabels')
const breadcrumbItems = inject('breadcrumbItems')
const isDifficultySelected = inject('isDifficultySelected')
const isTypeSelected = inject('isTypeSelected')

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

const expandedSections = reactive({
  category: true,
  difficulty: true,
  type: true
})

const toggleSection = (section) => {
  expandedSections[section] = !expandedSections[section]
}
</script>

<style scoped>
.filter-sidebar {
  position: sticky;
  top: 80px;
  width: 300px;
  flex-shrink: 0;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.filter-sidebar::-webkit-scrollbar {
  width: 4px;
}

.filter-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.filter-sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.sidebar-content {
  padding: 16px;
}

.stats-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.breadcrumb-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #6366f1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  color: #4f46e5;
}

.breadcrumb-item svg {
  color: #94a3b8;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  color: #dc2626;
}

.filter-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-header:hover {
  background: rgba(0, 0, 0, 0.04);
}

.section-header h4 {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.section-header svg {
  color: #94a3b8;
  transition: transform 0.3s ease;
}

.section-header svg.rotated {
  transform: rotate(-90deg);
}

.section-content {
  padding: 12px 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  margin-bottom: 12px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 10px;
  color: #6366f1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.25);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: rgba(99, 102, 241, 0.04);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateX(4px);
}

.category-card.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.category-card.active .category-name,
.category-card.active svg {
  color: white;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.category-card svg {
  color: #94a3b8;
}

.label-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-chip,
.type-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.label-chip input,
.type-chip input,
.difficulty-chip input {
  display: none;
}

.chip-indicator {
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.label-chip.selected .chip-indicator,
.type-chip.selected .chip-indicator {
  background: #6366f1;
  border-color: #6366f1;
}

.label-chip.selected .chip-indicator::after,
.type-chip.selected .chip-indicator::after {
  content: '';
  width: 6px;
  height: 3px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg) translateY(-1px);
}

.chip-text {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.label-chip.selected,
.type-chip.selected {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
}

.label-chip.selected .chip-text,
.type-chip.selected .chip-text {
  color: #6366f1;
}

.label-chip:hover,
.type-chip:hover {
  border-color: rgba(99, 102, 241, 0.3);
}

.difficulty-options {
  display: flex;
  gap: 8px;
}

.difficulty-chip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.difficulty-chip::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.difficulty-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.difficulty-chip input {
  display: none;
}

.difficulty-chip.easy .chip-indicator {
  border-color: #22c55e;
  transition: all 0.3s ease;
}

.difficulty-chip.easy:hover {
  border-color: rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.05);
}

.difficulty-chip.easy.selected {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%);
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15), 0 4px 12px rgba(34, 197, 94, 0.2);
  transform: scale(1.02);
}

.difficulty-chip.easy.selected .chip-indicator {
  background: #22c55e;
  border-color: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.difficulty-chip.easy.selected .chip-indicator::after {
  content: '';
  width: 6px;
  height: 3px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg) translateY(-1px);
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -3px;
  margin-top: -2px;
}

.difficulty-chip.easy.selected .chip-text {
  color: #16a34a;
  font-weight: 700;
}

.difficulty-chip.medium .chip-indicator {
  border-color: #f59e0b;
  transition: all 0.3s ease;
}

.difficulty-chip.medium:hover {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.05);
}

.difficulty-chip.medium.selected {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%);
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15), 0 4px 12px rgba(245, 158, 11, 0.2);
  transform: scale(1.02);
}

.difficulty-chip.medium.selected .chip-indicator {
  background: #f59e0b;
  border-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.difficulty-chip.medium.selected .chip-text {
  color: #d97706;
  font-weight: 700;
}

.difficulty-chip.hard .chip-indicator {
  border-color: #ef4444;
  transition: all 0.3s ease;
}

.difficulty-chip.hard:hover {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.05);
}

.difficulty-chip.hard.selected {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15), 0 4px 12px rgba(239, 68, 68, 0.2);
  transform: scale(1.02);
}

.difficulty-chip.hard.selected .chip-indicator {
  background: #ef4444;
  border-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.difficulty-chip.hard.selected .chip-text {
  color: #dc2626;
  font-weight: 700;
}

.difficulty-chip .chip-text {
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.type-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.type-chip {
  justify-content: center;
  border: 2px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.type-chip:hover {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.type-chip.selected {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%);
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(99, 102, 241, 0.2);
  transform: scale(1.02);
}

.type-chip.selected .chip-indicator {
  background: #6366f1;
  border-color: #6366f1;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
}

.type-chip.selected .chip-indicator::after {
  content: '';
  width: 6px;
  height: 3px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg) translateY(-1px);
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -3px;
  margin-top: -2px;
}

.type-chip.selected .chip-text {
  color: #4f46e5;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .filter-sidebar {
    position: static;
    width: 100%;
    max-height: none;
  }
}
</style>
