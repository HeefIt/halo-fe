<template>
  <div class="subject-management">
    <div class="management-header">
      <div class="header-info">
        <h2>题目管理</h2>
        <p>管理题库题目、选项和答案解析</p>
      </div>
      <div class="header-actions">
        <div class="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model="searchForm.subjectName" placeholder="搜索题目名称..." @keyup.enter="handleSearch" />
        </div>
        <div class="action-buttons">
          <button class="btn-secondary" @click="resetSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            重置
          </button>
          <button class="btn-primary" @click="handleSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            搜索
          </button>
          <button class="btn-accent" @click="showAddProblemDialog = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            添加题目
          </button>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label>题目难度</label>
        <div class="filter-options">
          <button 
            v-for="diff in difficultyOptions" 
            :key="diff.value"
            class="filter-btn"
            :class="{ active: searchForm.subjectDifficult === diff.value }"
            @click="selectDifficulty(diff.value)"
          >
            {{ diff.label }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <label>题目类型</label>
        <div class="filter-options">
          <button 
            v-for="type in typeOptions" 
            :key="type.value"
            class="filter-btn"
            :class="{ active: searchForm.subjectType === type.value }"
            @click="selectType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ pagination.total }}</span>
          <span class="stat-label">总题目数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon easy">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ easyCount }}</span>
          <span class="stat-label">简单题</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon medium">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="15" x2="16" y2="15"></line>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ mediumCount }}</span>
          <span class="stat-label">中等题</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon hard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ hardCount }}</span>
          <span class="stat-label">困难题</span>
        </div>
      </div>
    </div>

    <div class="table-container" v-loading="loading">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>题目信息</th>
              <th>难度</th>
              <th>类型</th>
              <th>出题人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in subjects" :key="subject.id" @dblclick="viewSubjectDetail(subject)">
              <td class="id-cell">
                <span class="id-badge">#{{ subject.id }}</span>
              </td>
              <td class="subject-cell">
                <div class="subject-icon" :style="{ background: getDifficultyColor(subject.subjectDifficult) }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <div class="subject-info">
                  <span class="subject-name">{{ subject.subjectName }}</span>
                  <span class="subject-score">{{ subject.subjectScore || 10 }} 分</span>
                </div>
              </td>
              <td class="difficulty-cell">
                <span class="difficulty-badge" :class="getDifficultyClass(subject.subjectDifficult)">
                  {{ getDifficultyLabel(subject.subjectDifficult) }}
                </span>
              </td>
              <td class="type-cell">
                <span class="type-badge">
                  {{ getSubjectTypeLabel(subject.subjectType) }}
                </span>
              </td>
              <td class="creator-cell">
                <span class="creator-name">{{ subject.settleName || '系统' }}</span>
              </td>
              <td class="action-cell">
                <div class="action-buttons-cell">
                  <button class="action-btn view" @click="viewSubjectDetail(subject)" title="查看">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button class="action-btn edit" @click="editProblem(subject)" title="编辑">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="action-btn delete" @click="deleteProblem(subject)" title="删除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && subjects.length === 0">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <h3>暂无题目数据</h3>
                  <p>点击"添加题目"创建第一道题目</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination-container" v-if="subjects.length > 0">
      <div class="pagination-info">
        显示 {{ (pagination.pageNo - 1) * pagination.pageSize + 1 }} - 
        {{ Math.min(pagination.pageNo * pagination.pageSize, pagination.total) }} 条，
        共 {{ pagination.total }} 条
      </div>
      <div class="pagination-controls">
        <select v-model="pagination.pageSize" @change="handleSizeChange" class="page-size-select">
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
          <option :value="100">100条/页</option>
        </select>
        <div class="page-buttons">
          <button class="page-btn" @click="handleCurrentChange(1)" :disabled="pagination.pageNo === 1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          </button>
          <button class="page-btn" @click="handleCurrentChange(pagination.pageNo - 1)" :disabled="pagination.pageNo === 1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="page-info">{{ pagination.pageNo }} / {{ totalPages }}</span>
          <button class="page-btn" @click="handleCurrentChange(pagination.pageNo + 1)" :disabled="pagination.pageNo >= totalPages">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button class="page-btn" @click="handleCurrentChange(totalPages)" :disabled="pagination.pageNo >= totalPages">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <transition name="modal">
      <div class="modal-overlay" v-if="showAddProblemDialog" @click.self="handleCancel">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>{{ editingProblem ? '编辑题目' : '添加题目' }}</h3>
            <button class="modal-close" @click="handleCancel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>题目名称</label>
                <input v-model="addProblemForm.subjectName" placeholder="请输入题目名称" />
              </div>
              <div class="form-group">
                <label>出题人名</label>
                <input v-model="addProblemForm.settleName" placeholder="请输入出题人名" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>题目难度</label>
                <div class="select-wrapper">
                  <select v-model="addProblemForm.subjectDifficult">
                    <option :value="1">简单</option>
                    <option :value="2">中等</option>
                    <option :value="3">困难</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>题目类型</label>
                <div class="select-wrapper">
                  <select v-model="addProblemForm.subjectType" @change="handleSubjectTypeChange">
                    <option :value="1">单选</option>
                    <option :value="2">多选</option>
                    <option :value="3">判断</option>
                    <option :value="4">简答</option>
                  </select>
                </div>
              </div>
              <div class="form-group small">
                <label>题目分数</label>
                <input type="number" v-model="addProblemForm.subjectScore" :min="1" :max="100" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>分类</label>
                <div class="multi-select" @click="showCategorySelect = !showCategorySelect">
                  <div class="selected-tags" v-if="addProblemForm.categoryIds.length">
                    <span class="selected-tag" v-for="id in addProblemForm.categoryIds" :key="id">
                      {{ getCategoryNameById(id) }}
                      <button @click.stop="removeCategory(id)">×</button>
                    </span>
                  </div>
                  <span v-else class="placeholder">请选择分类(必选)</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dropdown-panel" v-if="showCategorySelect">
                  <div 
                    class="dropdown-item" 
                    v-for="cat in categories" 
                    :key="cat.id"
                    :class="{ selected: addProblemForm.categoryIds.includes(cat.id) }"
                    @click="toggleCategory(cat.id)"
                  >
                    <span class="checkbox" :class="{ checked: addProblemForm.categoryIds.includes(cat.id) }"></span>
                    {{ cat.categoryName }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>标签</label>
                <div class="multi-select" @click="showLabelSelect = !showLabelSelect">
                  <div class="selected-tags" v-if="addProblemForm.labelIds.length">
                    <span class="selected-tag" v-for="id in addProblemForm.labelIds" :key="id">
                      {{ getLabelNameById(id) }}
                      <button @click.stop="removeLabel(id)">×</button>
                    </span>
                  </div>
                  <span v-else class="placeholder">请选择标签(必选)</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dropdown-panel" v-if="showLabelSelect">
                  <div 
                    class="dropdown-item" 
                    v-for="label in labels" 
                    :key="label.id"
                    :class="{ selected: addProblemForm.labelIds.includes(label.id) }"
                    @click="toggleLabel(label.id)"
                  >
                    <span class="checkbox" :class="{ checked: addProblemForm.labelIds.includes(label.id) }"></span>
                    {{ label.labelName }}
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>题目解析</label>
              <textarea v-model="addProblemForm.subjectParse" placeholder="请输入题目解析" rows="3"></textarea>
            </div>
            <div class="form-group" v-if="addProblemForm.subjectType === 4">
              <label>题目答案</label>
              <textarea v-model="addProblemForm.subjectAnswer" placeholder="请输入简答题答案" rows="3"></textarea>
            </div>
            <div class="form-group" v-if="[1, 2, 3].includes(addProblemForm.subjectType)">
              <label>选项设置</label>
              <div class="options-list">
                <div class="option-item" v-for="(option, index) in addProblemForm.optionList" :key="index">
                  <div class="option-header">
                    <span class="option-label">{{ getOptionLabel(option.optionType) }}</span>
                    <label class="correct-toggle">
                      <input type="checkbox" v-model="option.isCorrect" :true-value="1" :false-value="0" />
                      <span class="toggle-slider"></span>
                      <span class="toggle-label">正确答案</span>
                    </label>
                    <button class="remove-option-btn" @click="removeOption(index)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <input v-model="option.optionContent" placeholder="请输入选项内容" />
                </div>
                <button class="add-option-btn" @click="addOption">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  添加选项
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="handleCancel">取消</button>
            <button class="btn-primary" @click="saveProblem">保存</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div class="modal-overlay" v-if="showDetailDialog" @click.self="showDetailDialog = false">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>题目详情</h3>
            <button class="modal-close" @click="showDetailDialog = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body" v-if="subjectDetail">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">题目ID</span>
                <span class="detail-value">#{{ subjectDetail.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">出题人</span>
                <span class="detail-value">{{ subjectDetail.settleName || '系统' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">难度</span>
                <span class="detail-value" :class="getDifficultyClass(subjectDetail.subjectDifficult)">
                  {{ getDifficultyLabel(subjectDetail.subjectDifficult) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">类型</span>
                <span class="detail-value">{{ getSubjectTypeLabel(subjectDetail.subjectType) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">分数</span>
                <span class="detail-value">{{ subjectDetail.subjectScore }} 分</span>
              </div>
            </div>
            <div class="detail-section">
              <h4>题目名称</h4>
              <p>{{ subjectDetail.subjectName }}</p>
            </div>
            <div class="detail-section" v-if="subjectDetail.subjectParse">
              <h4>题目解析</h4>
              <p>{{ subjectDetail.subjectParse }}</p>
            </div>
            <div class="detail-section" v-if="subjectDetail.subjectType === 4 && subjectDetail.subjectAnswer">
              <h4>参考答案</h4>
              <p>{{ subjectDetail.subjectAnswer }}</p>
            </div>
            <div class="detail-section" v-if="[1, 2, 3].includes(subjectDetail.subjectType) && subjectDetail.optionList?.length">
              <h4>选项列表</h4>
              <div class="options-preview">
                <div 
                  class="option-preview-item" 
                  v-for="(option, index) in subjectDetail.optionList" 
                  :key="index"
                  :class="{ correct: option.isCorrect === 1 }"
                >
                  <span class="option-letter">{{ getOptionLabel(option.optionType) }}</span>
                  <span class="option-text">{{ option.optionContent }}</span>
                  <span class="correct-badge" v-if="option.isCorrect === 1">正确</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" @click="showDetailDialog = false">关闭</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSubjects, addSubject, getSubjectInfo, updateSubject, deleteSubject } from '@/api/modules/question/subject.js'
import { getCategoryList } from '@/api/modules/question/category.js'
import { getLabelList } from '@/api/modules/question/label.js'
import { normalizePageSize } from '@/utils/pagination'

const loading = ref(false)
const subjects = ref([])
const categories = ref([])
const labels = ref([])

const showCategorySelect = ref(false)
const showLabelSelect = ref(false)

const difficultyOptions = [
  { label: '全部', value: null },
  { label: '简单', value: 1 },
  { label: '中等', value: 2 },
  { label: '困难', value: 3 }
]

const typeOptions = [
  { label: '全部', value: null },
  { label: '单选题', value: 1 },
  { label: '多选题', value: 2 },
  { label: '判断题', value: 3 },
  { label: '简答题', value: 4 }
]

const optionTypes = [
  { label: 'A', value: 1 },
  { label: 'B', value: 2 },
  { label: 'C', value: 3 },
  { label: 'D', value: 4 },
  { label: 'E', value: 5 },
  { label: 'F', value: 6 },
  { label: 'G', value: 7 },
  { label: 'H', value: 8 }
]

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

const searchForm = reactive({
  subjectName: '',
  subjectDifficult: null,
  subjectType: null
})

const showAddProblemDialog = ref(false)
const showDetailDialog = ref(false)
const editingProblem = ref(null)
const subjectDetail = ref(null)

const addProblemForm = reactive({
  subjectName: '',
  subjectDifficult: 1,
  settleName: '',
  subjectType: 1,
  subjectScore: 10,
  subjectParse: '',
  subjectAnswer: '',
  categoryIds: [],
  labelIds: [],
  optionList: []
})

const easyCount = computed(() => subjects.value.filter(s => s.subjectDifficult === 1).length)
const mediumCount = computed(() => subjects.value.filter(s => s.subjectDifficult === 2).length)
const hardCount = computed(() => subjects.value.filter(s => s.subjectDifficult === 3).length)
const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize) || 1)

const getDifficultyColor = (difficulty) => {
  const colors = {
    1: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    2: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    3: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
  }
  return colors[difficulty] || colors[1]
}

const getDifficultyClass = (difficulty) => {
  const classes = { 1: 'easy', 2: 'medium', 3: 'hard' }
  return classes[difficulty] || 'easy'
}

const getDifficultyLabel = (difficulty) => {
  const labels = { 1: '简单', 2: '中等', 3: '困难' }
  return labels[difficulty] || '未知'
}

const getSubjectTypeLabel = (type) => {
  const labels = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题' }
  return labels[type] || '未知'
}

const getOptionLabel = (type) => {
  const option = optionTypes.find(o => o.value === type)
  return option ? option.label : '?'
}

const getCategoryNameById = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.categoryName : id
}

const getLabelNameById = (id) => {
  const label = labels.value.find(l => l.id === id)
  return label ? label.labelName : id
}

const selectDifficulty = (value) => {
  searchForm.subjectDifficult = value
  handleSearch()
}

const selectType = (value) => {
  searchForm.subjectType = value
  handleSearch()
}

const toggleCategory = (id) => {
  const index = addProblemForm.categoryIds.indexOf(id)
  if (index > -1) {
    addProblemForm.categoryIds.splice(index, 1)
  } else {
    addProblemForm.categoryIds.push(id)
  }
}

const removeCategory = (id) => {
  const index = addProblemForm.categoryIds.indexOf(id)
  if (index > -1) {
    addProblemForm.categoryIds.splice(index, 1)
  }
}

const toggleLabel = (id) => {
  const index = addProblemForm.labelIds.indexOf(id)
  if (index > -1) {
    addProblemForm.labelIds.splice(index, 1)
  } else {
    addProblemForm.labelIds.push(id)
  }
}

const removeLabel = (id) => {
  const index = addProblemForm.labelIds.indexOf(id)
  if (index > -1) {
    addProblemForm.labelIds.splice(index, 1)
  }
}

const fetchSubjects = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNo,
      pageSize: pagination.pageSize,
      ...searchForm
    }

    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })

    const res = await getSubjects(params)
    if (res.code === 200) {
      subjects.value = res.data.result
      pagination.total = res.data.total
      pagination.pageNo = res.data.pageNo
      pagination.pageSize = res.data.pageSize
    } else {
      ElMessage.error(res.message || '获取题目列表失败')
    }
  } catch (err) {
    ElMessage.error('获取题目列表失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNo = 1
  fetchSubjects()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    subjectName: '',
    subjectDifficult: null,
    subjectType: null
  })
  pagination.pageNo = 1
  fetchSubjects()
}

const handleSizeChange = (val) => {
  pagination.pageSize = normalizePageSize(val, pagination.pageSize)
  pagination.pageNo = 1
  fetchSubjects()
}

const handleCurrentChange = (val) => {
  if (val >= 1 && val <= totalPages.value) {
    pagination.pageNo = val
    fetchSubjects()
  }
}

const viewSubjectDetail = async (row) => {
  try {
    const response = await getSubjectInfo(row.id)
    if (response.success) {
      subjectDetail.value = response.data
      if (subjectDetail.value.categoryIds && !Array.isArray(subjectDetail.value.categoryIds)) {
        subjectDetail.value.categoryIds = [subjectDetail.value.categoryIds]
      } else if (!subjectDetail.value.categoryIds) {
        subjectDetail.value.categoryIds = []
      }
      if (subjectDetail.value.labelIds && !Array.isArray(subjectDetail.value.labelIds)) {
        subjectDetail.value.labelIds = [subjectDetail.value.labelIds]
      } else if (!subjectDetail.value.labelIds) {
        subjectDetail.value.labelIds = []
      }
      showDetailDialog.value = true
    } else {
      ElMessage.error(response.message || '获取题目详情失败')
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    ElMessage.error('获取题目详情失败')
  }
}

const editProblem = async (problem) => {
  try {
    const response = await getSubjectInfo(problem.id)
    if (response.success) {
      editingProblem.value = problem
      const detail = response.data
      Object.assign(addProblemForm, {
        id: detail.id,
        subjectName: detail.subjectName,
        subjectDifficult: detail.subjectDifficult,
        settleName: detail.settleName,
        subjectType: detail.subjectType,
        subjectScore: detail.subjectScore,
        subjectParse: detail.subjectParse,
        subjectAnswer: detail.subjectAnswer,
        categoryIds: Array.isArray(detail.categoryIds) ? detail.categoryIds : (detail.categoryIds || []),
        labelIds: Array.isArray(detail.labelIds) ? detail.labelIds : (detail.labelIds || []),
        optionList: detail.optionList || []
      })
      showAddProblemDialog.value = true
    } else {
      ElMessage.error(response.message || '获取题目详情失败')
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    ElMessage.error('获取题目详情失败')
  }
}

const deleteProblem = (problem) => {
  ElMessageBox.confirm(`确定要删除题目 "${problem.subjectName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteSubject({ id: problem.id })
      if (res.success) {
        ElMessage.success('题目删除成功')
        fetchSubjects()
      } else {
        ElMessage.error(res.message || '删除题目失败')
      }
    } catch (error) {
      ElMessage.error('删除题目失败: ' + error.message)
    }
  }).catch(() => {})
}

const saveProblem = async () => {
  if (!addProblemForm.subjectName.trim()) {
    ElMessage.warning('请输入题目名称')
    return
  }
  if (!addProblemForm.categoryIds.length) {
    ElMessage.warning('请至少选择一个分类')
    return
  }
  if (!addProblemForm.labelIds.length) {
    ElMessage.warning('请至少选择一个标签')
    return
  }

  try {
    const requestData = {
      ...addProblemForm,
      categoryIds: addProblemForm.categoryIds || [],
      labelIds: addProblemForm.labelIds || []
    }

    if (editingProblem.value) {
      const response = await updateSubject(requestData)
      if (response.success) {
        ElMessage.success('题目信息已更新')
        showAddProblemDialog.value = false
        resetAddProblemForm()
        fetchSubjects()
      } else {
        ElMessage.error(response.message || '更新题目失败')
      }
    } else {
      const response = await addSubject(requestData)
      if (response.success) {
        ElMessage.success('题目添加成功')
        showAddProblemDialog.value = false
        resetAddProblemForm()
        fetchSubjects()
      } else {
        ElMessage.error(response.message || '题目添加失败')
      }
    }
  } catch (error) {
    console.error('保存题目失败:', error)
    ElMessage.error('保存题目失败')
  }
}

const handleCancel = () => {
  showAddProblemDialog.value = false
}

const handleSubjectTypeChange = () => {
  if ([1, 2, 3].includes(addProblemForm.subjectType)) {
    addProblemForm.optionList = []
  }
}

const addOption = () => {
  addProblemForm.optionList.push({
    optionType: addProblemForm.optionList.length + 1,
    optionContent: '',
    isCorrect: 0
  })
}

const removeOption = (index) => {
  addProblemForm.optionList.splice(index, 1)
}

const resetAddProblemForm = () => {
  Object.assign(addProblemForm, {
    subjectName: '',
    subjectDifficult: 1,
    settleName: '',
    subjectType: 1,
    subjectScore: 10,
    subjectParse: '',
    subjectAnswer: '',
    categoryIds: [],
    labelIds: [],
    optionList: []
  })
  editingProblem.value = null
  showCategorySelect.value = false
  showLabelSelect.value = false
}

const loadCategories = async () => {
  try {
    const response = await getCategoryList()
    if (response.success) {
      categories.value = response.data.result || response.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const loadLabels = async () => {
  try {
    const response = await getLabelList()
    if (response.success) {
      labels.value = response.data.result || response.data
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

onMounted(() => {
  fetchSubjects()
  loadCategories()
  loadLabels()
})

defineExpose({
  resetAddProblemForm
})
</script>

<style scoped>
.subject-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.header-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.header-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.search-input:focus-within {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.05);
}

.search-input svg {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.search-input input {
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 14px;
  padding: 10px 0;
  width: 200px;
}

.search-input input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-primary, .btn-secondary, .btn-accent {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-accent {
  background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
  color: white;
}

.btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.filter-bar {
  display: flex;
  gap: 24px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.filter-options {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.filter-btn.active {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.5);
  color: #a78bfa;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.stat-icon.easy {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.stat-icon.medium {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.stat-icon.hard {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.table-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.data-table tbody tr {
  transition: all 0.3s ease;
  cursor: pointer;
}

.data-table tbody tr:hover {
  background: rgba(139, 92, 246, 0.05);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.id-badge {
  display: inline-flex;
  padding: 4px 10px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #a78bfa;
  font-family: 'JetBrains Mono', monospace;
}

.subject-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subject-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.subject-info {
  display: flex;
  flex-direction: column;
}

.subject-name {
  font-weight: 600;
  color: white;
  font-size: 14px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject-score {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.difficulty-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.difficulty-badge.easy {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.difficulty-badge.medium {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.difficulty-badge.hard {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.type-badge {
  display: inline-flex;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 8px;
  font-size: 12px;
  color: #60a5fa;
}

.creator-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.action-buttons-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn.view {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.action-btn.view:hover {
  background: rgba(34, 197, 94, 0.2);
  transform: scale(1.1);
}

.action-btn.edit {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.action-btn.edit:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

.empty-cell {
  padding: 60px 20px !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 4px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.pagination-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-size-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.page-size-select option {
  background: #1e293b;
}

.page-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.2);
  color: white;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  padding: 0 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.modal-large {
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.small {
  max-width: 120px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.05);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  cursor: pointer;
  appearance: none;
}

.select-wrapper::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.multi-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.multi-select:hover {
  border-color: rgba(139, 92, 246, 0.5);
}

.multi-select .placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

.multi-select svg {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: #a78bfa;
}

.selected-tag button {
  background: none;
  border: none;
  color: #a78bfa;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 1;
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(139, 92, 246, 0.1);
  color: white;
}

.dropdown-item.selected {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
}

.checkbox.checked {
  border-color: #8b5cf6;
  background: #8b5cf6;
}

.checkbox.checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.option-label {
  font-weight: 600;
  color: #a78bfa;
  font-size: 14px;
}

.correct-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-left: auto;
}

.correct-toggle input {
  display: none;
}

.toggle-slider {
  width: 36px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.correct-toggle input:checked + .toggle-slider {
  background: rgba(34, 197, 94, 0.5);
}

.correct-toggle input:checked + .toggle-slider::after {
  transform: translateX(16px);
}

.toggle-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.remove-option-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-option-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.option-item input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
}

.option-item input:focus {
  border-color: rgba(139, 92, 246, 0.5);
}

.add-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px dashed rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  color: #a78bfa;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-option-btn:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.detail-value {
  font-size: 14px;
  color: white;
  font-weight: 500;
}

.detail-value.easy {
  color: #4ade80;
}

.detail-value.medium {
  color: #fbbf24;
}

.detail-value.hard {
  color: #f87171;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px 0;
}

.detail-section p {
  font-size: 14px;
  color: white;
  line-height: 1.6;
  margin: 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.options-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.option-preview-item.correct {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}

.option-letter {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
}

.option-preview-item.correct .option-letter {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.option-text {
  flex: 1;
  font-size: 14px;
  color: white;
}

.correct-badge {
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: #4ade80;
  font-weight: 500;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .management-header {
    flex-direction: column;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .search-input input {
    width: 100%;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
  
  .filter-bar {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
