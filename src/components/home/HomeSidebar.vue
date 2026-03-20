<template>
  <aside class="filter-sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title">
        <span class="sidebar-kicker">CONTROL PANEL</span>
        <h3>筛选面板</h3>
      </div>
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
  top: 84px;
  width: 304px;
  flex-shrink: 0;
  height: fit-content;
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  padding-right: 8px;
  color: var(--color-text);
}

.filter-sidebar::-webkit-scrollbar {
  width: 6px;
}

.filter-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.filter-sidebar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 999px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 18px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}

.sidebar-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.reset-btn:hover {
  background: var(--color-error-light);
  border-color: rgba(194, 59, 59, 0.16);
  color: var(--color-error);
}

.sidebar-content {
  padding: 18px 0 0;
}

.stats-section {
  margin-bottom: 22px;
  padding: 0 0 18px;
  border-bottom: 1px solid var(--color-border);
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.breadcrumb-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
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
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.breadcrumb-item:hover {
  color: var(--qb-accent, var(--color-accent-hover));
}

.breadcrumb-item svg {
  color: var(--color-text-muted);
}

.clear-all-btn {
  background: none;
  border: none;
  color: var(--color-error);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--transition-fast);
  flex-shrink: 0;
}

.clear-all-btn:hover {
  color: #dc2626;
}

.filter-section {
  margin-bottom: 22px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 10px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: color var(--transition-base);
}

.section-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.section-header svg {
  color: var(--color-text-muted);
  transition: transform var(--transition-base), color var(--transition-fast);
}

.section-header svg.rotated {
  transform: rotate(-90deg);
}

.section-content {
  padding: 14px 0 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  margin-bottom: 12px;
  background: var(--color-accent-light);
  border: 1px solid rgba(23, 78, 166, 0.12);
  border-radius: var(--radius-md);
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.back-btn:hover {
  filter: brightness(1.02);
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
  min-height: 44px;
  padding: 0 14px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.category-card:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.category-card.active {
  background: var(--color-accent-light);
  border-color: rgba(23, 78, 166, 0.14);
}

.category-card.active .category-name,
.category-card.active svg {
  color: var(--color-accent);
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.category-card svg {
  color: var(--color-text-muted);
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
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.label-chip input,
.type-chip input,
.difficulty-chip input {
  display: none;
}

.chip-indicator {
  width: 14px;
  height: 14px;
  border: 1px solid var(--color-border-hover);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  position: relative;
}

.label-chip.selected .chip-indicator,
.type-chip.selected .chip-indicator {
  background: var(--color-accent);
  border-color: var(--color-accent);
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
  font-weight: 600;
  color: var(--color-text-secondary);
}

.label-chip.selected,
.type-chip.selected {
  background: var(--color-accent-light);
  border-color: rgba(23, 78, 166, 0.14);
}

.label-chip.selected .chip-text,
.type-chip.selected .chip-text {
  color: var(--color-accent);
}

.label-chip:hover,
.type-chip:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-subtle);
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
  min-height: 40px;
  padding: 0 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
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
  background: var(--color-bg-subtle);
}

.difficulty-chip input {
  display: none;
}

.difficulty-chip.easy .chip-indicator {
  border-color: #22c55e;
}

.difficulty-chip.easy:hover {
  border-color: rgba(15, 157, 88, 0.4);
  background: rgba(15, 157, 88, 0.05);
}

.difficulty-chip.easy.selected {
  background: rgba(15, 157, 88, 0.08);
  border-color: #0f9d58;
}

.difficulty-chip.easy.selected .chip-indicator {
  background: #0f9d58;
  border-color: #0f9d58;
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
  color: #0f7b55;
  font-weight: 700;
}

.difficulty-chip.medium .chip-indicator {
  border-color: #f59e0b;
}

.difficulty-chip.medium:hover {
  border-color: rgba(201, 130, 0, 0.4);
  background: rgba(201, 130, 0, 0.05);
}

.difficulty-chip.medium.selected {
  background: rgba(201, 130, 0, 0.08);
  border-color: #c98200;
}

.difficulty-chip.medium.selected .chip-indicator {
  background: #c98200;
  border-color: #c98200;
}

.difficulty-chip.medium.selected .chip-text {
  color: #9a6700;
  font-weight: 700;
}

.difficulty-chip.hard .chip-indicator {
  border-color: #ef4444;
}

.difficulty-chip.hard:hover {
  border-color: rgba(194, 59, 59, 0.4);
  background: rgba(194, 59, 59, 0.05);
}

.difficulty-chip.hard.selected {
  background: rgba(194, 59, 59, 0.08);
  border-color: #c23b3b;
}

.difficulty-chip.hard.selected .chip-indicator {
  background: #c23b3b;
  border-color: #c23b3b;
}

.difficulty-chip.hard.selected .chip-text {
  color: #a73b3b;
  font-weight: 700;
}

.difficulty-chip .chip-text {
  font-size: 12px;
  font-weight: 600;
  transition: color var(--transition-fast);
}

.type-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.type-chip {
  justify-content: center;
  border-width: 1px;
  position: relative;
  overflow: hidden;
}

.type-chip.selected {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
}

.type-chip.selected .chip-indicator {
  background: var(--color-accent);
  border-color: var(--color-accent);
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
  color: var(--color-accent);
  font-weight: 700;
}

@media (max-width: 1200px) {
  .filter-sidebar {
    position: static;
    width: 100%;
    max-height: none;
  }
}

:global(.question-bank-page.is-dark) .filter-sidebar::-webkit-scrollbar-thumb {
  background: var(--color-border);
}

:global(.question-bank-page.is-dark) .difficulty-chip.easy.selected .chip-text {
  color: #78d1aa;
}

:global(.question-bank-page.is-dark) .difficulty-chip.medium.selected .chip-text {
  color: #f0c679;
}

:global(.question-bank-page.is-dark) .difficulty-chip.hard.selected .chip-text {
  color: #f0a0a0;
}

:global(.question-bank-page.is-dark) .label-chip.selected,
:global(.question-bank-page.is-dark) .type-chip.selected,
:global(.question-bank-page.is-dark) .back-btn {
  background: rgba(108, 159, 255, 0.14);
  border-color: rgba(108, 159, 255, 0.16);
}
</style>
