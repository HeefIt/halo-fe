<template>
  <div class="notice-management">
    <div class="management-header">
      <div class="header-info">
        <h2>公告管理</h2>
        <p>维护首页公告弹窗、公告入口和生效时间。</p>
      </div>

      <div class="header-actions">
        <div class="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model="searchKeyword" placeholder="搜索公告标题..." @keyup.enter="handleSearch" />
        </div>

        <select v-model="statusFilter" class="status-select" @change="handleSearch">
          <option value="">全部状态</option>
          <option :value="0">草稿</option>
          <option :value="1">已发布</option>
          <option :value="2">已下线</option>
        </select>

        <div class="action-buttons">
          <button class="btn-secondary" @click="handleSearch">搜索</button>
          <button class="btn-accent" @click="handleAddNotice">新增公告</button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ pagination.total }}</span>
        <span class="stat-label">公告总数</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ publishedCount }}</span>
        <span class="stat-label">发布中</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ popupEnabledCount }}</span>
        <span class="stat-label">启用弹窗</span>
      </div>
    </div>

    <div class="table-container" v-loading="loading">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>公告信息</th>
            <th>状态</th>
            <th>展示配置</th>
            <th>生效时间</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="notice in noticeList" :key="notice.id">
            <td>
              <span class="id-badge">#{{ notice.id }}</span>
            </td>
            <td>
              <div class="notice-title">{{ notice.title }}</div>
              <div class="notice-summary">{{ getSummary(notice.content) }}</div>
            </td>
            <td>
              <span class="status-badge" :class="`is-${getStatusKey(notice.status)}`">
                {{ getStatusLabel(notice.status) }}
              </span>
            </td>
            <td>
              <div class="config-tags">
                <span class="config-tag" :class="{ enabled: Number(notice.popupEnabled) === 1 }">弹窗</span>
                <span class="config-tag" :class="{ enabled: Number(notice.iconEnabled) === 1 }">图标</span>
              </div>
            </td>
            <td>
              <div class="time-range">
                <span>{{ formatDateTime(notice.startTime) || '立即生效' }}</span>
                <span>{{ formatDateTime(notice.endTime) || '长期有效' }}</span>
              </div>
            </td>
            <td>
              <span class="sort-badge">{{ notice.sort ?? 0 }}</span>
            </td>
            <td>
              <div class="action-buttons-cell">
                <button class="action-btn edit" @click="editNotice(notice)">编辑</button>
                <button
                  v-if="Number(notice.status) !== 1"
                  class="action-btn publish"
                  @click="publishNoticeHandler(notice)"
                >
                  发布
                </button>
                <button
                  v-else
                  class="action-btn offline"
                  @click="offlineNoticeHandler(notice)"
                >
                  下线
                </button>
                <button class="action-btn delete" @click="deleteNoticeHandler(notice)">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && noticeList.length === 0">
            <td colspan="7" class="empty-cell">
              暂无公告数据，先新增一条首页说明公告。
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-container" v-if="noticeList.length > 0">
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
            <h3>{{ editingNotice ? '编辑公告' : '新增公告' }}</h3>
            <button class="modal-close" @click="showDialog = false">×</button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group form-group--full">
                <label>公告标题</label>
                <input v-model="noticeForm.title" placeholder="请输入公告标题" />
              </div>

              <div class="form-group">
                <label>状态</label>
                <select v-model="noticeForm.status">
                  <option :value="0">草稿</option>
                  <option :value="1">已发布</option>
                  <option :value="2">已下线</option>
                </select>
              </div>

              <div class="form-group">
                <label>排序值</label>
                <input v-model.number="noticeForm.sort" type="number" min="0" placeholder="数值越大越靠前" />
              </div>

              <div class="form-group">
                <label>开始时间</label>
                <input v-model="noticeForm.startTime" type="datetime-local" />
              </div>

              <div class="form-group">
                <label>结束时间</label>
                <input v-model="noticeForm.endTime" type="datetime-local" />
              </div>

              <div class="form-group form-group--full">
                <label>展示配置</label>
                <div class="switch-row">
                  <label class="switch-item">
                    <input v-model="noticeForm.popupEnabled" type="checkbox" />
                    <span>启用首页弹窗</span>
                  </label>
                  <label class="switch-item">
                    <input v-model="noticeForm.iconEnabled" type="checkbox" />
                    <span>启用头部/首页入口</span>
                  </label>
                </div>
              </div>

              <div class="form-group form-group--full">
                <label>公告内容</label>
                <textarea v-model="noticeForm.content" rows="8" placeholder="支持粘贴 HTML，也支持直接输入纯文本说明"></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="showDialog = false">取消</button>
            <button class="btn-primary" @click="saveNotice">保存</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addNotice,
  deleteNotice,
  getNoticeDetail,
  getNoticePage,
  offlineNotice,
  publishNotice,
  updateNotice
} from '@/api/modules/notice'

const loading = ref(false)
const showDialog = ref(false)
const editingNotice = ref(null)
const searchKeyword = ref('')
const statusFilter = ref('')
const noticeList = ref([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const noticeForm = reactive({
  title: '',
  content: '',
  status: 0,
  sort: 0,
  startTime: '',
  endTime: '',
  popupEnabled: true,
  iconEnabled: true
})

const publishedCount = computed(() => noticeList.value.filter(item => Number(item.status) === 1).length)
const popupEnabledCount = computed(() => noticeList.value.filter(item => Number(item.popupEnabled) === 1).length)
const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize) || 1)

async function fetchNoticeList() {
  loading.value = true
  try {
    const res = await getNoticePage({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      title: searchKeyword.value || undefined,
      status: statusFilter.value === '' ? undefined : Number(statusFilter.value)
    })

    if (res.success) {
      noticeList.value = res.data?.result || []
      pagination.total = res.data?.total || 0
      return
    }
    ElMessage.error(res.message || '获取公告列表失败')
  } catch (error) {
    console.error('获取公告列表失败:', error)
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  fetchNoticeList()
}

function handleSizeChange() {
  pagination.pageNum = 1
  fetchNoticeList()
}

function handleCurrentChange(pageNum) {
  if (pageNum < 1 || pageNum > totalPages.value) {
    return
  }
  pagination.pageNum = pageNum
  fetchNoticeList()
}

function handleAddNotice() {
  editingNotice.value = null
  resetNoticeForm()
  showDialog.value = true
}

async function editNotice(notice) {
  try {
    const res = await getNoticeDetail(notice.id)
    if (!res.success) {
      ElMessage.error(res.message || '获取公告详情失败')
      return
    }

    editingNotice.value = notice
    fillNoticeForm(res.data)
    showDialog.value = true
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败')
  }
}

async function saveNotice() {
  if (!noticeForm.title.trim()) {
    ElMessage.warning('请输入公告标题')
    return
  }
  if (!noticeForm.content.trim()) {
    ElMessage.warning('请输入公告内容')
    return
  }

  const payload = buildSubmitPayload()

  try {
    const res = editingNotice.value
      ? await updateNotice(editingNotice.value.id, payload)
      : await addNotice(payload)

    if (!res.success) {
      ElMessage.error(res.message || '保存公告失败')
      return
    }

    ElMessage.success(editingNotice.value ? '公告更新成功' : '公告新增成功')
    showDialog.value = false
    fetchNoticeList()
  } catch (error) {
    console.error('保存公告失败:', error)
    ElMessage.error('保存公告失败')
  }
}

function publishNoticeHandler(notice) {
  ElMessageBox.confirm(`确定发布公告“${notice.title}”吗？`, '提示', {
    confirmButtonText: '发布',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await publishNotice(notice.id)
    if (res.success) {
      ElMessage.success('公告发布成功')
      fetchNoticeList()
      return
    }
    ElMessage.error(res.message || '发布公告失败')
  }).catch(() => {})
}

function offlineNoticeHandler(notice) {
  ElMessageBox.confirm(`确定下线公告“${notice.title}”吗？`, '提示', {
    confirmButtonText: '下线',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await offlineNotice(notice.id)
    if (res.success) {
      ElMessage.success('公告已下线')
      fetchNoticeList()
      return
    }
    ElMessage.error(res.message || '下线公告失败')
  }).catch(() => {})
}

function deleteNoticeHandler(notice) {
  ElMessageBox.confirm(`确定删除公告“${notice.title}”吗？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteNotice(notice.id)
    if (res.success) {
      ElMessage.success('公告删除成功')
      fetchNoticeList()
      return
    }
    ElMessage.error(res.message || '删除公告失败')
  }).catch(() => {})
}

function buildSubmitPayload() {
  return {
    title: noticeForm.title.trim(),
    content: noticeForm.content.trim(),
    status: Number(noticeForm.status),
    scopeType: 1,
    popupEnabled: noticeForm.popupEnabled ? 1 : 0,
    iconEnabled: noticeForm.iconEnabled ? 1 : 0,
    startTime: formatDateTimeForApi(noticeForm.startTime),
    endTime: formatDateTimeForApi(noticeForm.endTime),
    sort: Number(noticeForm.sort || 0)
  }
}

function fillNoticeForm(notice) {
  noticeForm.title = notice?.title || ''
  noticeForm.content = notice?.content || ''
  noticeForm.status = Number(notice?.status ?? 0)
  noticeForm.sort = Number(notice?.sort ?? 0)
  noticeForm.startTime = formatDateTimeForInput(notice?.startTime)
  noticeForm.endTime = formatDateTimeForInput(notice?.endTime)
  noticeForm.popupEnabled = Number(notice?.popupEnabled ?? 1) === 1
  noticeForm.iconEnabled = Number(notice?.iconEnabled ?? 1) === 1
}

function resetNoticeForm() {
  fillNoticeForm(null)
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

function formatDateTimeForInput(value) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

function formatDateTimeForApi(value) {
  return value ? `${value.replace('T', ' ')}:00` : null
}

function getSummary(content) {
  return (content || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 56) || '暂无内容'
}

function getStatusLabel(status) {
  const map = {
    0: '草稿',
    1: '已发布',
    2: '已下线'
  }
  return map[status] || '未知状态'
}

function getStatusKey(status) {
  const map = {
    0: 'draft',
    1: 'published',
    2: 'offline'
  }
  return map[status] || 'draft'
}

onMounted(() => {
  fetchNoticeList()
})
</script>

<style scoped>
.notice-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.management-header,
.header-actions,
.action-buttons,
.stats-row,
.config-tags,
.action-buttons-cell,
.pagination-controls,
.page-buttons,
.switch-row {
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
.status-select,
.page-size-select,
.form-group input,
.form-group select,
.form-group textarea {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.status-select option,
.page-size-select option,
.form-group select option {
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

.status-select,
.page-size-select,
.form-group input,
.form-group select,
.form-group textarea {
  border-radius: 10px;
  padding: 11px 12px;
  outline: none;
}

.status-select,
.page-size-select,
.form-group select {
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
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.btn-secondary {
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.76);
}

.btn-accent {
  padding: 10px 18px;
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
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
  background: rgba(139, 92, 246, 0.05);
}

.id-badge,
.sort-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
}

.notice-title {
  color: #ffffff;
  font-weight: 700;
}

.notice-summary {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.48);
  line-height: 1.6;
}

.status-badge,
.config-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.is-draft {
  background: rgba(148, 163, 184, 0.16);
  color: #cbd5e1;
}

.status-badge.is-published {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
}

.status-badge.is-offline {
  background: rgba(245, 158, 11, 0.16);
  color: #fcd34d;
}

.config-tag {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.52);
}

.config-tag.enabled {
  background: rgba(59, 130, 246, 0.16);
  color: #93c5fd;
}

.time-range {
  display: grid;
  gap: 6px;
  color: rgba(255, 255, 255, 0.66);
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

.action-btn.publish {
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
}

.action-btn.offline {
  background: rgba(245, 158, 11, 0.14);
  color: #fcd34d;
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
.page-info {
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
  width: min(760px, 100%);
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

.form-group textarea {
  min-height: 180px;
  resize: vertical;
}

.switch-row {
  flex-wrap: wrap;
}

.switch-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.84);
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

@media (max-width: 900px) {
  .stats-row,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .pagination-container,
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .status-select,
  .action-buttons {
    width: 100%;
  }
}
</style>
