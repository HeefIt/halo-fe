<template>
  <div class="circle-management">
    <div class="management-header">
      <div class="header-info">
        <h2>圈子管理</h2>
        <p>维护社区圈子的名称和图标展示，兼容文字图标与图片封面两种形式。</p>
      </div>

      <div class="header-actions">
        <div class="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model.trim="searchKeyword" placeholder="搜索圈子名称或图标..." @keyup.enter="handleSearch" />
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" @click="handleSearch">搜索</button>
          <button class="btn-accent" @click="handleAddCircle">新增圈子</button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ pagination.total }}</span>
        <span class="stat-label">圈子总数</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ imageCoverCount }}</span>
        <span class="stat-label">图片封面</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ textIconCount }}</span>
        <span class="stat-label">文字/表情图标</span>
      </div>
    </div>

    <div class="table-container" v-loading="loading">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>圈子信息</th>
            <th>图标预览</th>
            <th>图标内容</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="circle in circleList" :key="circle.id">
            <td>
              <span class="id-badge">#{{ circle.id }}</span>
            </td>
            <td>
              <div class="circle-main">
                <div class="circle-name">{{ circle.circleName }}</div>
                <div class="circle-meta">父级：{{ normalizeParentLabel(circle.parentId) }}</div>
              </div>
            </td>
            <td>
              <div class="circle-visual" :class="{ 'is-image': isCircleImage(circle.icon) }">
                <img
                  v-if="isCircleImage(circle.icon)"
                  :src="circle.icon"
                  :alt="circle.circleName"
                  class="circle-visual__image"
                />
                <span v-else class="circle-visual__text">{{ getCircleVisualText(circle.icon, circle.circleName) }}</span>
              </div>
            </td>
            <td>
              <div class="icon-content" :title="circle.icon || '未设置图标'">
                {{ getIconDescription(circle.icon, circle.circleName) }}
              </div>
            </td>
            <td>
              <div class="time-stack">
                <span>{{ formatDateTime(circle.updateTime || circle.createdTime) || '-' }}</span>
                <span>{{ circle.updateBy || circle.createdBy || 'system' }}</span>
              </div>
            </td>
            <td>
              <div class="action-buttons-cell">
                <button class="action-btn edit" @click="editCircle(circle)">编辑</button>
                <button class="action-btn delete" @click="deleteCircleHandler(circle)">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && circleList.length === 0">
            <td colspan="6" class="empty-cell">
              暂无圈子数据，先创建一个供社区用户发帖的主题圈子。
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="circleList.length > 0" class="pagination-container">
      <div class="pagination-info">
        显示 {{ (pagination.pageNum - 1) * pagination.pageSize + 1 }} -
        {{ Math.min(pagination.pageNum * pagination.pageSize, pagination.total) }} 条，共 {{ pagination.total }} 条
      </div>
      <div class="pagination-controls">
        <select v-model="pagination.pageSize" class="page-size-select" @change="handleSizeChange">
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
        </select>
        <div class="page-buttons">
          <button class="page-btn" :disabled="pagination.pageNum === 1" @click="handleCurrentChange(pagination.pageNum - 1)">上一页</button>
          <span class="page-info">{{ pagination.pageNum }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="pagination.pageNum >= totalPages" @click="handleCurrentChange(pagination.pageNum + 1)">下一页</button>
        </div>
      </div>
    </div>

    <transition name="modal">
      <div v-if="showDialog" class="modal-overlay" @click.self="showDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingCircle ? '编辑圈子' : '新增圈子' }}</h3>
            <button class="modal-close" @click="showDialog = false">×</button>
          </div>

          <div class="modal-body">
            <div class="form-notice">
              <strong>填写说明</strong>
              <p><span>必填：</span>圈子名称。</p>
              <p><span>图标可选：</span>可直接填 emoji / 短文字，也可上传图片生成 URL。</p>
              <p><span>删除限制：</span>如果圈子下已有社区动态，后台会阻止删除，避免误伤现有内容。</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>圈子名称 <span class="label-required">*</span></label>
                <input v-model.trim="circleForm.circleName" maxlength="20" placeholder="例如：面试闲聊 / 今日吐槽" />
              </div>

              <div class="form-group">
                <label>图标或封面 <span class="label-soft">(可选)</span></label>
                <input v-model.trim="circleForm.icon" placeholder="支持 emoji、短文字或图片 URL" />
              </div>

              <div class="form-group form-group--full">
                <label>上传图片封面 <span class="label-soft">(可选)</span></label>
                <div class="upload-row">
                  <button class="btn-secondary" :disabled="uploadingImage" @click="pickIconImage">
                    {{ uploadingImage ? '上传中...' : '上传图片' }}
                  </button>
                  <span class="upload-tip">建议使用 1:1 小图标，上传后会自动回填到输入框。</span>
                </div>
              </div>

              <div class="form-group form-group--full">
                <label>预览效果</label>
                <div class="preview-panel">
                  <div class="circle-visual circle-visual--large" :class="{ 'is-image': isCircleImage(circleForm.icon) }">
                    <img
                      v-if="isCircleImage(circleForm.icon)"
                      :src="circleForm.icon"
                      :alt="circleForm.circleName || '圈子预览'"
                      class="circle-visual__image"
                    />
                    <span v-else class="circle-visual__text">{{ getCircleVisualText(circleForm.icon, circleForm.circleName) }}</span>
                  </div>
                  <div class="preview-copy">
                    <strong>{{ circleForm.circleName || '未命名圈子' }}</strong>
                    <span>{{ getIconDescription(circleForm.icon, circleForm.circleName) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="showDialog = false">取消</button>
            <button class="btn-primary" @click="saveCircle">保存</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { fileApi } from '@/api/modules/file'
import {
  addCircleAdmin,
  deleteCircleAdmin,
  getCircleAdminDetail,
  getCircleAdminPage,
  updateCircleAdmin
} from '@/api/modules/shareAdmin'

const loading = ref(false)
const showDialog = ref(false)
const uploadingImage = ref(false)
const editingCircle = ref(null)
const searchKeyword = ref('')
const circleList = ref([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const circleForm = reactive({
  circleName: '',
  icon: ''
})

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize) || 1)
const imageCoverCount = computed(() => circleList.value.filter(item => isCircleImage(item.icon)).length)
const textIconCount = computed(() => circleList.value.filter(item => !isCircleImage(item.icon)).length)

const isCircleImage = (icon) => {
  if (!icon || typeof icon !== 'string') {
    return false
  }
  const normalizedIcon = icon.trim()
  return /^https?:\/\//i.test(normalizedIcon) || /^data:image\//i.test(normalizedIcon) || normalizedIcon.startsWith('/')
}

const getCircleVisualText = (icon, circleName) => {
  const normalizedIcon = typeof icon === 'string' ? icon.trim() : ''
  if (!normalizedIcon || isCircleImage(normalizedIcon)) {
    return (circleName || '圈').charAt(0)
  }
  if (normalizedIcon.length <= 4) {
    return normalizedIcon
  }
  return (circleName || normalizedIcon).charAt(0)
}

const getIconDescription = (icon, circleName) => {
  const normalizedIcon = typeof icon === 'string' ? icon.trim() : ''
  if (!normalizedIcon) {
    return `未设置图标，将回退为 ${(circleName || '圈子').charAt(0)}`
  }
  if (isCircleImage(normalizedIcon)) {
    return normalizedIcon
  }
  return normalizedIcon.length > 12 ? `${normalizedIcon.slice(0, 12)}...` : normalizedIcon
}

async function fetchCircleList() {
  loading.value = true
  try {
    const res = await getCircleAdminPage({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    })

    if (res.success) {
      circleList.value = res.data?.result || []
      pagination.total = res.data?.total || 0
      return
    }
    ElMessage.error(res.message || '获取圈子列表失败')
  } catch (error) {
    console.error('获取圈子列表失败:', error)
    ElMessage.error('获取圈子列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  fetchCircleList()
}

function handleSizeChange() {
  pagination.pageNum = 1
  fetchCircleList()
}

function handleCurrentChange(pageNum) {
  if (pageNum < 1 || pageNum > totalPages.value) {
    return
  }
  pagination.pageNum = pageNum
  fetchCircleList()
}

function handleAddCircle() {
  editingCircle.value = null
  resetCircleForm()
  showDialog.value = true
}

async function editCircle(circle) {
  try {
    const res = await getCircleAdminDetail(circle.id)
    if (!res.success) {
      ElMessage.error(res.message || '获取圈子详情失败')
      return
    }

    editingCircle.value = circle
    fillCircleForm(res.data)
    showDialog.value = true
  } catch (error) {
    console.error('获取圈子详情失败:', error)
    ElMessage.error('获取圈子详情失败')
  }
}

async function saveCircle() {
  if (!circleForm.circleName.trim()) {
    ElMessage.warning('请输入圈子名称')
    return
  }
  if (circleForm.circleName.trim().length > 20) {
    ElMessage.warning('圈子名称不能超过 20 个字符')
    return
  }

  const payload = {
    circleName: circleForm.circleName.trim(),
    icon: circleForm.icon.trim() || null
  }

  try {
    const res = editingCircle.value
      ? await updateCircleAdmin(editingCircle.value.id, payload)
      : await addCircleAdmin(payload)

    if (!res.success) {
      ElMessage.error(res.message || '保存圈子失败')
      return
    }

    ElMessage.success(editingCircle.value ? '圈子更新成功' : '圈子新增成功')
    showDialog.value = false
    fetchCircleList()
  } catch (error) {
    console.error('保存圈子失败:', error)
    ElMessage.error('保存圈子失败')
  }
}

function deleteCircleHandler(circle) {
  ElMessageBox.confirm(`确定删除圈子“${circle.circleName}”吗？若该圈子下已有动态，系统会阻止删除。`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteCircleAdmin(circle.id)
    if (res.success) {
      ElMessage.success('圈子删除成功')
      fetchCircleList()
      return
    }
    ElMessage.error(res.message || '删除圈子失败')
  }).catch(() => {})
}

function fillCircleForm(circle) {
  circleForm.circleName = circle?.circleName || ''
  circleForm.icon = circle?.icon || ''
}

function resetCircleForm() {
  fillCircleForm(null)
}

function normalizeParentLabel(parentId) {
  if (parentId === null || parentId === undefined) {
    return '-'
  }
  if (Number(parentId) === -1) {
    return '顶级圈子'
  }
  return `#${parentId}`
}

function formatDateTime(value) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function pickIconImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning('图片不能超过 5MB')
      return
    }

    const loadingInstance = ElLoading.service({
      lock: true,
      text: '图片上传中...',
      background: 'rgba(15, 23, 42, 0.24)'
    })
    uploadingImage.value = true

    try {
      const response = await fileApi.uploadImage(file, '社区圈子图标')
      const fileUrl = response?.data?.filePath
      if (!response || response.code !== 200 || !fileUrl) {
        throw new Error(response?.message || '图片上传失败')
      }
      circleForm.icon = fileUrl
      ElMessage.success('图片上传成功')
    } catch (error) {
      console.error('上传圈子图片失败:', error)
      ElMessage.error(error.message || '图片上传失败')
    } finally {
      uploadingImage.value = false
      loadingInstance.close()
    }
  }

  input.click()
}

onMounted(() => {
  fetchCircleList()
})
</script>

<style scoped>
.circle-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.management-header,
.header-actions,
.action-buttons,
.stats-row,
.action-buttons-cell,
.pagination-controls,
.page-buttons,
.upload-row,
.preview-panel {
  display: flex;
  gap: 12px;
}

.management-header {
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
}

.header-info h2 {
  margin: 0 0 6px;
  color: #ffffff;
  font-size: 24px;
}

.header-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.56);
}

.header-actions {
  align-items: center;
  flex-wrap: wrap;
}

.search-input,
.page-size-select,
.form-group input {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.page-size-select option {
  background: #0f172a;
}

.search-input {
  display: flex;
  align-items: center;
  min-width: 240px;
  padding: 0 12px;
  border-radius: 10px;
}

.search-input svg {
  color: rgba(255, 255, 255, 0.36);
}

.search-input input {
  width: 100%;
  border: none;
  background: transparent;
  color: #ffffff;
  padding: 11px 8px;
  outline: none;
}

.page-size-select,
.form-group input {
  border-radius: 10px;
  padding: 11px 12px;
  outline: none;
}

.page-size-select {
  min-width: 120px;
}

.btn-primary,
.btn-secondary,
.btn-accent,
.action-btn,
.page-btn {
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary,
.btn-accent {
  color: #ffffff;
}

.btn-primary {
  padding: 10px 18px;
  background: linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%);
}

.btn-secondary {
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.76);
}

.btn-accent {
  padding: 10px 18px;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card,
.table-container,
.pagination-container {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.stat-card {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 16px;
}

.stat-value {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  color: rgba(255, 255, 255, 0.52);
  font-size: 13px;
}

.table-container {
  border-radius: 16px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: left;
  vertical-align: top;
}

.data-table th {
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.data-table td {
  color: rgba(255, 255, 255, 0.86);
  font-size: 14px;
}

.data-table tbody tr:hover {
  background: rgba(20, 184, 166, 0.06);
}

.id-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
}

.circle-main,
.time-stack {
  display: grid;
  gap: 6px;
}

.circle-name {
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
}

.circle-meta,
.time-stack,
.icon-content {
  color: rgba(255, 255, 255, 0.52);
  line-height: 1.6;
}

.icon-content {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circle-visual {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.circle-visual.is-image {
  background: rgba(255, 255, 255, 0.08);
}

.circle-visual--large {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  font-size: 26px;
}

.circle-visual__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-visual__text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.action-buttons-cell {
  flex-wrap: wrap;
}

.action-btn {
  min-height: 34px;
  padding: 0 12px;
}

.action-btn.edit {
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
}

.empty-cell {
  text-align: center !important;
  color: rgba(255, 255, 255, 0.48) !important;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-radius: 14px;
}

.pagination-info,
.page-info,
.upload-tip {
  color: rgba(255, 255, 255, 0.52);
  font-size: 13px;
}

.page-btn {
  min-height: 34px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.78);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.64);
  backdrop-filter: blur(8px);
}

.modal-content {
  width: min(820px, 100%);
  max-height: 86vh;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  background: linear-gradient(180deg, #132238 0%, #0f172a 100%);
  overflow: hidden;
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h3 {
  margin: 0;
  color: #ffffff;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  cursor: pointer;
  font-size: 18px;
}

.modal-body {
  max-height: calc(86vh - 140px);
  overflow-y: auto;
  padding: 20px;
}

.form-notice {
  display: grid;
  gap: 6px;
  margin-bottom: 18px;
  padding: 14px 16px;
  border: 1px solid rgba(20, 184, 166, 0.18);
  background: rgba(20, 184, 166, 0.06);
  border-radius: 12px;
}

.form-notice strong {
  color: #ffffff;
  font-size: 14px;
}

.form-notice p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.6;
}

.form-notice span {
  color: #99f6e4;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-group label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  font-weight: 600;
}

.label-required {
  color: #fda4af;
}

.label-soft {
  color: rgba(255, 255, 255, 0.42);
  font-size: 12px;
  font-weight: 500;
}

.upload-row {
  align-items: center;
  flex-wrap: wrap;
}

.preview-panel {
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.preview-copy {
  display: grid;
  gap: 6px;
}

.preview-copy strong {
  color: #ffffff;
  font-size: 15px;
}

.preview-copy span {
  max-width: 520px;
  color: rgba(255, 255, 255, 0.52);
  line-height: 1.6;
  word-break: break-all;
}

.modal-footer {
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .stats-row,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .pagination-container,
  .header-actions,
  .preview-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .action-buttons {
    width: 100%;
  }
}
</style>
