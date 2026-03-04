<template>
  <div class="category-management">
    <div class="management-header">
      <div class="header-info">
        <h2>分类管理</h2>
        <p>管理题目分类和层级结构</p>
      </div>
      <div class="header-actions">
        <div class="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model="searchKeyword" placeholder="搜索分类名称..." @keyup.enter="handleSearch" />
        </div>
        <div class="action-buttons">
          <button class="btn-secondary" @click="handleSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            搜索
          </button>
          <button class="btn-accent" @click="handleAddCategory">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            添加分类
          </button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ pagination.total }}</span>
          <span class="stat-label">总分类数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ primaryCount }}</span>
          <span class="stat-label">主分类</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sub">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ subCount }}</span>
          <span class="stat-label">子分类</span>
        </div>
      </div>
    </div>

    <div class="table-container" v-loading="loading">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>分类信息</th>
              <th>类型</th>
              <th>父级</th>
              <th>创建信息</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categoryList" :key="category.id">
              <td class="id-cell">
                <span class="id-badge">#{{ category.id }}</span>
              </td>
              <td class="category-cell">
                <div class="category-icon" :style="{ background: getCategoryColor(category.id) }">
                  {{ category.categoryName?.charAt(0) || '?' }}
                </div>
                <div class="category-info">
                  <span class="category-name">{{ category.categoryName }}</span>
                  <span class="category-image" v-if="category.imageUrl">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    有图标
                  </span>
                </div>
              </td>
              <td class="type-cell">
                <span class="type-badge" :class="getTypeClass(category.categoryType)">
                  {{ getTypeLabel(category.categoryType) }}
                </span>
              </td>
              <td class="parent-cell">
                <span v-if="category.parentId === 0" class="parent-badge root">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  主分类
                </span>
                <span v-else class="parent-badge sub">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  父级 #{{ category.parentId }}
                </span>
              </td>
              <td class="creator-cell">
                <div class="creator-info">
                  <span class="creator-name">{{ category.createdBy || '系统' }}</span>
                  <span class="creator-time">{{ formatTime(category.createdTime) }}</span>
                </div>
              </td>
              <td class="action-cell">
                <div class="action-buttons-cell">
                  <button class="action-btn edit" @click="editCategory(category)" title="编辑">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="action-btn delete" @click="deleteCategoryHandler(category)" title="删除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && categoryList.length === 0">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <h3>暂无分类数据</h3>
                  <p>点击"添加分类"创建第一个分类</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination-container" v-if="categoryList.length > 0">
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
      <div class="modal-overlay" v-if="showAddCategoryDialog" @click.self="showAddCategoryDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingCategory ? '编辑分类' : '添加分类' }}</h3>
            <button class="modal-close" @click="showAddCategoryDialog = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>分类名称</label>
              <input v-model="categoryForm.categoryName" placeholder="请输入分类名称" />
            </div>
            <div class="form-group">
              <label>分类类型</label>
              <div class="type-options">
                <label class="type-option" :class="{ active: categoryForm.categoryType === 1 }">
                  <input type="radio" :value="1" v-model="categoryForm.categoryType" />
                  <span class="option-dot"></span>
                  <span class="option-label">类别1</span>
                </label>
                <label class="type-option" :class="{ active: categoryForm.categoryType === 2 }">
                  <input type="radio" :value="2" v-model="categoryForm.categoryType" />
                  <span class="option-dot"></span>
                  <span class="option-label">类别2</span>
                </label>
                <label class="type-option" :class="{ active: categoryForm.categoryType === 3 }">
                  <input type="radio" :value="3" v-model="categoryForm.categoryType" />
                  <span class="option-dot"></span>
                  <span class="option-label">类别3</span>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>图标链接</label>
              <input v-model="categoryForm.imageUrl" placeholder="请输入图标链接（可选）" />
            </div>
            <div class="form-group">
              <label>父级ID</label>
              <div class="parent-input">
                <input type="number" v-model="categoryForm.parentId" :min="0" />
                <span class="input-hint">0 表示主分类</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showAddCategoryDialog = false">取消</button>
            <button class="btn-primary" @click="saveCategory">保存</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryPage, addCategory, updateCategory, deleteCategory } from '@/api/category'

const searchKeyword = ref('')
const showAddCategoryDialog = ref(false)
const editingCategory = ref(null)

const categoryForm = reactive({
  categoryName: '',
  categoryType: 1,
  imageUrl: '',
  parentId: 0
})

const categoryFormRef = ref()
const loading = ref(false)
const categoryList = ref([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const primaryCount = computed(() => categoryList.value.filter(c => c.parentId === 0).length)
const subCount = computed(() => categoryList.value.filter(c => c.parentId !== 0).length)
const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize) || 1)

const getCategoryColor = (id) => {
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

const getTypeClass = (type) => {
  const classes = { 1: 'type-1', 2: 'type-2', 3: 'type-3' }
  return classes[type] || 'type-1'
}

const getTypeLabel = (type) => {
  const labels = { 1: '类别1', 2: '类别2', 3: '类别3' }
  return labels[type] || '类别1'
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const fetchCategoryList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      categoryName: searchKeyword.value || undefined
    }

    const res = await getCategoryPage(params)
    
    if (res.success) {
      categoryList.value = res.data.result
      pagination.total = res.data.total
    } else {
      ElMessage.error(res.message || '获取分类列表失败')
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchCategoryList()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchCategoryList()
}

const handleCurrentChange = (val) => {
  if (val >= 1 && val <= totalPages.value) {
    pagination.pageNum = val
    fetchCategoryList()
  }
}

const handleAddCategory = () => {
  editingCategory.value = null
  resetCategoryForm()
  showAddCategoryDialog.value = true
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.categoryName = category.categoryName
  categoryForm.categoryType = category.categoryType
  categoryForm.imageUrl = category.imageUrl
  categoryForm.parentId = category.parentId
  showAddCategoryDialog.value = true
}

const deleteCategoryHandler = (category) => {
  ElMessageBox.confirm(`确定要删除分类 "${category.categoryName}" 吗？该分类下的题目不会被删除，但会变为未分类状态。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCategory(category.id)
      if (res.success) {
        ElMessage.success('分类删除成功')
        fetchCategoryList()
      } else {
        ElMessage.error(res.message || '删除分类失败')
      }
    } catch (error) {
      ElMessage.error('删除分类失败')
      console.error('删除分类失败:', error)
    }
  }).catch(() => {})
}

const saveCategory = async () => {
  if (!categoryForm.categoryName.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    let res
    if (editingCategory.value) {
      res = await updateCategory(editingCategory.value.id, {
        categoryName: categoryForm.categoryName,
        categoryType: categoryForm.categoryType,
        imageUrl: categoryForm.imageUrl,
        parentId: categoryForm.parentId
      })
      if (res.success) {
        ElMessage.success('分类信息已更新')
      } else {
        ElMessage.error(res.message || '更新分类失败')
        return
      }
    } else {
      res = await addCategory({
        categoryName: categoryForm.categoryName,
        categoryType: categoryForm.categoryType,
        imageUrl: categoryForm.imageUrl,
        parentId: categoryForm.parentId
      })
      if (res.success) {
        ElMessage.success('分类添加成功')
      } else {
        ElMessage.error(res.message || '添加分类失败')
        return
      }
    }
    
    resetCategoryForm()
    showAddCategoryDialog.value = false
    editingCategory.value = null
    fetchCategoryList()
  } catch (error) {
    ElMessage.error(editingCategory.value ? '更新分类失败' : '添加分类失败')
    console.error(editingCategory.value ? '更新分类失败:' : '添加分类失败:', error)
  }
}

const resetCategoryForm = () => {
  categoryForm.categoryName = ''
  categoryForm.categoryType = 1
  categoryForm.imageUrl = ''
  categoryForm.parentId = 0
  
  nextTick(() => {
    if (categoryFormRef.value) {
      categoryFormRef.value.clearValidate()
    }
  })
}

onMounted(() => {
  resetCategoryForm()
  fetchCategoryList()
})

defineExpose({
  resetCategoryForm
})
</script>

<style scoped>
.category-management {
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

.stat-icon.primary {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.stat-icon.sub {
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

.category-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.category-info {
  display: flex;
  flex-direction: column;
}

.category-name {
  font-weight: 600;
  color: white;
  font-size: 14px;
}

.category-image {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.type-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.type-1 {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.type-badge.type-2 {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.type-badge.type-3 {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.parent-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.parent-badge.root {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.parent-badge.sub {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
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

.type-options {
  display: flex;
  gap: 12px;
}

.type-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-option input {
  display: none;
}

.type-option.active {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
}

.option-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  position: relative;
}

.type-option.active .option-dot {
  border-color: #8b5cf6;
}

.type-option.active .option-dot::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #8b5cf6;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.option-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.type-option.active .option-label {
  color: #a78bfa;
}

.parent-input {
  position: relative;
}

.parent-input input {
  width: 100%;
}

.input-hint {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
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
