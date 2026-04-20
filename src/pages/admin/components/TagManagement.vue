<template>
  <div class="tag-management">
    <div class="management-header">
      <div class="header-info">
        <h2>标签管理</h2>
        <p>管理题目标签和分类关联</p>
      </div>
      <div class="header-actions">
        <div class="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model="searchKeyword" placeholder="搜索标签名称..." @keyup.enter="handleSearch" />
        </div>
        <div class="action-buttons">
          <button class="btn-secondary" @click="handleSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            搜索
          </button>
          <button class="btn-accent" @click="handleAddTag">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            添加标签
          </button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ pagination.total }}</span>
          <span class="stat-label">总标签数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon category">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ categoryList.length }}</span>
          <span class="stat-label">关联分类</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon recent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ recentCount }}</span>
          <span class="stat-label">本周新增</span>
        </div>
      </div>
    </div>

    <div class="table-container" v-loading="loading">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标签信息</th>
              <th>排序号</th>
              <th>所属分类</th>
              <th>创建信息</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tag in tagList" :key="tag.id">
              <td class="id-cell">
                <span class="id-badge">#{{ tag.id }}</span>
              </td>
              <td class="tag-cell">
                <div class="tag-icon" :style="{ background: getTagColor(tag.id) }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                </div>
                <div class="tag-info">
                  <span class="tag-name">{{ tag.labelName }}</span>
                  <span class="tag-sort">排序: {{ tag.sortNum }}</span>
                </div>
              </td>
              <td class="sort-cell">
                <span class="sort-badge">{{ tag.sortNum }}</span>
              </td>
              <td class="category-cell">
                <span class="category-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {{ getCategoryName(tag.categoryId) }}
                </span>
              </td>
              <td class="creator-cell">
                <div class="creator-info">
                  <span class="creator-name">{{ tag.createdBy || '系统' }}</span>
                  <span class="creator-time">{{ formatTime(tag.createdTime) }}</span>
                </div>
              </td>
              <td class="action-cell">
                <div class="action-buttons-cell">
                  <button class="action-btn edit" @click="editTag(tag)" title="编辑">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="action-btn delete" @click="deleteTagHandler(tag)" title="删除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && tagList.length === 0">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  <h3>暂无标签数据</h3>
                  <p>点击"添加标签"创建第一个标签</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination-container" v-if="tagList.length > 0">
      <div class="pagination-info">
        显示 {{ (pagination.pageNum - 1) * pagination.pageSize + 1 }} - 
        {{ Math.min(pagination.pageNum * pagination.pageSize, pagination.total) }} 条，
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
          <button class="page-btn" @click="handleCurrentChange(1)" :disabled="pagination.pageNum === 1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          </button>
          <button class="page-btn" @click="handleCurrentChange(pagination.pageNum - 1)" :disabled="pagination.pageNum === 1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="page-info">{{ pagination.pageNum }} / {{ totalPages }}</span>
          <button class="page-btn" @click="handleCurrentChange(pagination.pageNum + 1)" :disabled="pagination.pageNum >= totalPages">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button class="page-btn" @click="handleCurrentChange(totalPages)" :disabled="pagination.pageNum >= totalPages">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <transition name="modal">
      <div class="modal-overlay" v-if="showAddTagDialog" @click.self="showAddTagDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingTag ? '编辑标签' : '添加标签' }}</h3>
            <button class="modal-close" @click="showAddTagDialog = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>标签名称</label>
              <input v-model="tagForm.labelName" placeholder="请输入标签名称" />
            </div>
            <div class="form-group">
              <label>排序号</label>
              <div class="sort-input">
                <input type="number" v-model="tagForm.sortNum" :min="0" />
                <span class="input-hint">数值越小越靠前</span>
              </div>
            </div>
            <div class="form-group">
              <label>所属分类</label>
              <div class="category-select" @click="showCategoryDropdown = !showCategoryDropdown">
                <div class="select-value">
                  <span v-if="tagForm.categoryId">{{ getSelectedCategoryName() }}</span>
                  <span v-else class="placeholder">请选择分类</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div class="category-dropdown" v-if="showCategoryDropdown">
                <div 
                  class="dropdown-item" 
                  v-for="category in categoryList" 
                  :key="category.id"
                  :class="{ active: tagForm.categoryId === category.id }"
                  @click="selectCategory(category)"
                >
                  {{ category.id }} - {{ category.categoryName }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showAddTagDialog = false">取消</button>
            <button class="btn-primary" @click="saveTag">保存</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLabelPage, addLabel, updateLabel, deleteLabel } from '@/api/modules/question/label'
import { getCategoryPage } from '@/api/modules/question/category'
import { normalizePageSize } from '@/utils/pagination'

const searchKeyword = ref('')
const showAddTagDialog = ref(false)
const showCategoryDropdown = ref(false)
const editingTag = ref(null)

const tagForm = reactive({
  labelName: '',
  sortNum: 1,
  categoryId: ''
})

const tagFormRef = ref()
const loading = ref(false)
const tagList = ref([])
const categoryList = ref([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const recentCount = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return tagList.value.filter(tag => new Date(tag.createdTime) > oneWeekAgo).length
})

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize) || 1)

const getTagColor = (id) => {
  const colors = [
    'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
  ]
  return colors[id % colors.length]
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const getCategoryName = (categoryId) => {
  if (!categoryId) return '未分配分类'
  const category = categoryList.value.find(c => String(c.id) === String(categoryId))
  return category ? category.categoryName : '未知分类'
}

const getSelectedCategoryName = () => {
  if (!tagForm.categoryId) return ''
  const category = categoryList.value.find(c => c.id === tagForm.categoryId)
  return category ? `${category.id} - ${category.categoryName}` : ''
}

const selectCategory = (category) => {
  tagForm.categoryId = category.id
  showCategoryDropdown.value = false
}

const fetchCategoryList = async () => {
  try {
    const res = await getCategoryPage({ pageNum: 1, pageSize: 1000 })
    if (res.success) {
      categoryList.value = res.data.result
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    console.error('获取分类列表失败:', error)
  }
}

const fetchTagList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      labelName: searchKeyword.value || undefined
    }

    const res = await getLabelPage(params)
    
    if (res.success) {
      tagList.value = res.data.result
      pagination.total = res.data.total
    } else {
      ElMessage.error(res.message || '获取标签列表失败')
    }
  } catch (error) {
    ElMessage.error('获取标签列表失败')
    console.error('获取标签列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchTagList()
}

const handleSizeChange = (val) => {
  pagination.pageSize = normalizePageSize(val, pagination.pageSize)
  pagination.pageNum = 1
  fetchTagList()
}

const handleCurrentChange = (val) => {
  if (val >= 1 && val <= totalPages.value) {
    pagination.pageNum = val
    fetchTagList()
  }
}

const handleAddTag = () => {
  editingTag.value = null
  resetTagForm()
  showAddTagDialog.value = true
}

const editTag = (tag) => {
  editingTag.value = tag
  tagForm.labelName = tag.labelName
  tagForm.sortNum = tag.sortNum
  tagForm.categoryId = tag.categoryId
  showAddTagDialog.value = true
}

const deleteTagHandler = (tag) => {
  ElMessageBox.confirm(`确定要删除标签 "${tag.labelName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteLabel(tag.id)
      if (res.success) {
        ElMessage.success('标签删除成功')
        fetchTagList()
      } else {
        ElMessage.error(res.message || '删除标签失败')
      }
    } catch (error) {
      ElMessage.error('删除标签失败')
      console.error('删除标签失败:', error)
    }
  }).catch(() => {})
}

const saveTag = async () => {
  if (!tagForm.labelName.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  try {
    let res
    if (editingTag.value) {
      res = await updateLabel(editingTag.value.id, {
        labelName: tagForm.labelName,
        sortNum: tagForm.sortNum,
        categoryId: tagForm.categoryId
      })
      if (res.success) {
        ElMessage.success('标签信息已更新')
      } else {
        ElMessage.error(res.message || '更新标签失败')
        return
      }
    } else {
      res = await addLabel({
        labelName: tagForm.labelName,
        sortNum: tagForm.sortNum,
        categoryId: tagForm.categoryId
      })
      if (res.success) {
        ElMessage.success('标签添加成功')
      } else {
        ElMessage.error(res.message || '添加标签失败')
        return
      }
    }
    
    resetTagForm()
    showAddTagDialog.value = false
    editingTag.value = null
    fetchTagList()
  } catch (error) {
    ElMessage.error(editingTag.value ? '更新标签失败' : '添加标签失败')
    console.error(editingTag.value ? '更新标签失败:' : '添加标签失败:', error)
  }
}

const resetTagForm = () => {
  tagForm.labelName = ''
  tagForm.sortNum = 1
  tagForm.categoryId = ''
  showCategoryDropdown.value = false
  
  nextTick(() => {
    if (tagFormRef.value) {
      tagFormRef.value.clearValidate()
    }
  })
}

onMounted(() => {
  resetTagForm()
  fetchCategoryList()
  fetchTagList()
})

defineExpose({
  resetTagForm
})
</script>

<style scoped>
.tag-management {
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.stat-icon.category {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.stat-icon.recent {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
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

.tag-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.tag-info {
  display: flex;
  flex-direction: column;
}

.tag-name {
  font-weight: 600;
  color: white;
  font-size: 14px;
}

.tag-sort {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.sort-badge {
  display: inline-flex;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #60a5fa;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: #4ade80;
}

.creator-info {
  display: flex;
  flex-direction: column;
}

.creator-name {
  font-size: 13px;
  color: white;
}

.creator-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.form-group input {
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

.form-group input:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.05);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.sort-input {
  position: relative;
}

.sort-input input {
  width: 100%;
  padding-right: 100px;
}

.input-hint {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

.category-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-select:hover {
  border-color: rgba(139, 92, 246, 0.5);
}

.select-value {
  font-size: 14px;
  color: white;
}

.select-value .placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.category-select svg {
  color: rgba(255, 255, 255, 0.4);
}

.category-dropdown {
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

.dropdown-item.active {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
