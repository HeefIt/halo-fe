<template>
  <div class="role-template-management">
    <div class="management-header">
      <div class="header-info">
        <h2>角色模板管理</h2>
        <p>维护角色对话的人设、提示词、变量配置与上下架状态。</p>
      </div>

      <div class="header-actions">
        <div class="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model="searchKeyword" placeholder="搜索角色名称或标识..." @keyup.enter="handleSearch" />
        </div>

        <input v-model="categoryFilter" class="text-filter" placeholder="分类筛选，如 interview" @keyup.enter="handleSearch" />

        <select v-model="statusFilter" class="status-select" @change="handleSearch">
          <option value="">全部状态</option>
          <option :value="1">启用中</option>
          <option :value="0">已停用</option>
        </select>

        <div class="action-buttons">
          <button class="btn-secondary" @click="handleSearch">搜索</button>
          <button class="btn-accent" @click="handleAddTemplate">新增角色</button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ pagination.total }}</span>
        <span class="stat-label">模板总数</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ enabledCount }}</span>
        <span class="stat-label">启用中</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ systemCount }}</span>
        <span class="stat-label">系统模板</span>
      </div>
    </div>

    <div class="table-container" v-loading="loading">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>角色信息</th>
            <th>分类/模型</th>
            <th>提示词配置</th>
            <th>变量配置</th>
            <th>状态</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="template in templateList" :key="template.id">
            <td>
              <span class="id-badge">#{{ template.id }}</span>
            </td>
            <td>
              <div class="role-main">
                <div class="role-title-row">
                  <span class="role-name">{{ template.roleName }}</span>
                  <span class="system-tag" :class="{ active: Number(template.isSystem) === 1 }">
                    {{ Number(template.isSystem) === 1 ? '系统' : '自定义' }}
                  </span>
                </div>
                <div class="role-key">{{ template.roleKey }}</div>
                <div class="role-desc">{{ template.roleDesc || '暂无角色简介' }}</div>
              </div>
            </td>
            <td>
              <div class="meta-stack">
                <span>{{ template.roleCategory || '未分类' }}</span>
                <span>{{ template.defaultModel || '未指定模型' }}</span>
                <span>温度 {{ displayTemperature(template.temperature) }}</span>
              </div>
            </td>
            <td>
              <div class="prompt-preview">{{ getPreview(template.promptTemplate, 88) }}</div>
            </td>
            <td>
              <div class="schema-preview">{{ getSchemaPreview(template.variableSchemaJson) }}</div>
            </td>
            <td>
              <span class="status-badge" :class="Number(template.status) === 1 ? 'is-enabled' : 'is-disabled'">
                {{ Number(template.status) === 1 ? '启用中' : '已停用' }}
              </span>
            </td>
            <td>
              <div class="meta-stack">
                <span>{{ formatDateTime(template.updateTime) || '-' }}</span>
                <span>{{ template.updateBy || template.createdBy || 'system' }}</span>
              </div>
            </td>
            <td>
              <div class="action-buttons-cell">
                <button class="action-btn edit" @click="editTemplate(template)">编辑</button>
                <button
                  v-if="Number(template.status) === 1"
                  class="action-btn disable"
                  @click="disableTemplateHandler(template)"
                >
                  停用
                </button>
                <button
                  v-else
                  class="action-btn enable"
                  @click="enableTemplateHandler(template)"
                >
                  启用
                </button>
                <button class="action-btn delete" @click="deleteTemplateHandler(template)">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && templateList.length === 0">
            <td colspan="8" class="empty-cell">
              暂无角色模板，先新增一个你想提供给用户使用的人设。
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="templateList.length > 0" class="pagination-container">
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
            <h3>{{ editingTemplate ? '编辑角色模板' : '新增角色模板' }}</h3>
            <button class="modal-close" @click="showDialog = false">×</button>
          </div>

          <div class="modal-body">
            <div class="form-notice">
              <strong>填写建议</strong>
              <p><span>必填：</span>角色标识、角色名称、角色提示词。</p>
              <p><span>建议填写：</span>角色简介、角色分类、开场白，这三项会直接影响前台选择体验。</p>
              <p><span>可选：</span>头像标识、变量配置 JSON、默认模型、温度、排序；不填会自动给默认值。</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>角色标识 <span class="label-required">*</span></label>
                <input v-model.trim="templateForm.roleKey" placeholder="例如：java_interviewer" />
              </div>

              <div class="form-group">
                <label>角色名称 <span class="label-required">*</span></label>
                <input v-model.trim="templateForm.roleName" placeholder="例如：Java面试官" />
              </div>

              <div class="form-group">
                <label>角色分类 <span class="label-soft">(建议)</span></label>
                <input v-model.trim="templateForm.roleCategory" placeholder="例如：interview / companion" />
              </div>

              <div class="form-group">
                <label>头像标识 <span class="label-soft">(可选)</span></label>
                <input v-model.trim="templateForm.avatar" placeholder="例如：INT / GF / ENG" />
              </div>

              <div class="form-group">
                <label>默认模型 <span class="label-soft">(可选)</span></label>
                <input v-model.trim="templateForm.defaultModel" placeholder="例如：deepseek-chat" />
              </div>

              <div class="form-group">
                <label>温度参数 <span class="label-soft">(可选)</span></label>
                <input v-model.number="templateForm.temperature" type="number" min="0" max="2" step="0.01" />
              </div>

              <div class="form-group">
                <label>排序值</label>
                <input v-model.number="templateForm.sortNo" type="number" min="0" />
              </div>

              <div class="form-group">
                <label>状态</label>
                <select v-model="templateForm.status">
                  <option :value="1">启用</option>
                  <option :value="0">停用</option>
                </select>
              </div>

              <div class="form-group form-group--full">
                <label>模板类型</label>
                <div class="switch-row">
                  <label class="switch-item">
                    <input v-model="templateForm.isSystem" :true-value="1" :false-value="0" type="checkbox" />
                    <span>系统预设模板</span>
                  </label>
                </div>
              </div>

              <div class="form-group form-group--full">
                <label>角色简介 <span class="label-soft">(建议)</span></label>
                <textarea v-model.trim="templateForm.roleDesc" rows="3" placeholder="用于前台列表展示的简短介绍"></textarea>
              </div>

              <div class="form-group form-group--full">
                <label>角色提示词 <span class="label-required">*</span></label>
                <textarea v-model="templateForm.promptTemplate" rows="10" placeholder="输入该角色的核心系统提示词"></textarea>
              </div>

              <div class="form-group form-group--full">
                <label>开场白 <span class="label-soft">(建议)</span></label>
                <textarea v-model="templateForm.openingMessage" rows="4" placeholder="会话创建后自动发送给用户的第一句话"></textarea>
              </div>

              <div class="form-group form-group--full">
                <label>变量配置 JSON <span class="label-soft">(可选)</span></label>
                <textarea
                  v-model="templateForm.variableSchemaJson"
                  rows="8"
                  placeholder='示例：[{"key":"job","label":"目标岗位","type":"select","required":true}]'
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="showDialog = false">取消</button>
            <button class="btn-primary" @click="saveTemplate">保存</button>
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
  addRoleTemplate,
  deleteRoleTemplate,
  disableRoleTemplate,
  enableRoleTemplate,
  getRoleTemplateAdminDetail,
  getRoleTemplatePage,
  updateRoleTemplate
} from '@/api/modules/ai/roleAdmin'

const loading = ref(false)
const showDialog = ref(false)
const editingTemplate = ref(null)
const searchKeyword = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const templateList = ref([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const templateForm = reactive({
  roleKey: '',
  roleName: '',
  roleDesc: '',
  roleCategory: '',
  avatar: '',
  promptTemplate: '',
  openingMessage: '',
  variableSchemaJson: '',
  defaultModel: 'deepseek-chat',
  temperature: 0.7,
  sortNo: 0,
  status: 1,
  isSystem: 1
})

const enabledCount = computed(() => templateList.value.filter(item => Number(item.status) === 1).length)
const systemCount = computed(() => templateList.value.filter(item => Number(item.isSystem) === 1).length)
const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize) || 1)

async function fetchTemplateList() {
  loading.value = true
  try {
    const res = await getRoleTemplatePage({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined,
      roleCategory: categoryFilter.value || undefined,
      status: statusFilter.value === '' ? undefined : Number(statusFilter.value)
    })

    if (res.success) {
      templateList.value = res.data?.result || []
      pagination.total = res.data?.total || 0
      return
    }
    ElMessage.error(res.message || '获取角色模板列表失败')
  } catch (error) {
    console.error('获取角色模板列表失败:', error)
    ElMessage.error('获取角色模板列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  fetchTemplateList()
}

function handleSizeChange() {
  pagination.pageNum = 1
  fetchTemplateList()
}

function handleCurrentChange(pageNum) {
  if (pageNum < 1 || pageNum > totalPages.value) {
    return
  }
  pagination.pageNum = pageNum
  fetchTemplateList()
}

function handleAddTemplate() {
  editingTemplate.value = null
  resetTemplateForm()
  showDialog.value = true
}

async function editTemplate(template) {
  try {
    const res = await getRoleTemplateAdminDetail(template.id)
    if (!res.success) {
      ElMessage.error(res.message || '获取角色模板详情失败')
      return
    }

    editingTemplate.value = template
    fillTemplateForm(res.data)
    showDialog.value = true
  } catch (error) {
    console.error('获取角色模板详情失败:', error)
    ElMessage.error('获取角色模板详情失败')
  }
}

async function saveTemplate() {
  if (!templateForm.roleKey.trim()) {
    ElMessage.warning('请输入角色标识')
    return
  }
  if (!templateForm.roleName.trim()) {
    ElMessage.warning('请输入角色名称')
    return
  }
  if (!templateForm.promptTemplate.trim()) {
    ElMessage.warning('请输入角色提示词')
    return
  }
  if (templateForm.variableSchemaJson && !isValidJson(templateForm.variableSchemaJson)) {
    ElMessage.warning('变量配置 JSON 格式不正确')
    return
  }

  const payload = buildSubmitPayload()

  try {
    const res = editingTemplate.value
      ? await updateRoleTemplate(editingTemplate.value.id, payload)
      : await addRoleTemplate(payload)

    if (!res.success) {
      ElMessage.error(res.message || '保存角色模板失败')
      return
    }

    ElMessage.success(editingTemplate.value ? '角色模板更新成功' : '角色模板新增成功')
    showDialog.value = false
    fetchTemplateList()
  } catch (error) {
    console.error('保存角色模板失败:', error)
    ElMessage.error('保存角色模板失败')
  }
}

function enableTemplateHandler(template) {
  ElMessageBox.confirm(`确定启用角色“${template.roleName}”吗？`, '提示', {
    confirmButtonText: '启用',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await enableRoleTemplate(template.id)
    if (res.success) {
      ElMessage.success('角色模板已启用')
      fetchTemplateList()
      return
    }
    ElMessage.error(res.message || '启用角色模板失败')
  }).catch(() => {})
}

function disableTemplateHandler(template) {
  ElMessageBox.confirm(`确定停用角色“${template.roleName}”吗？`, '提示', {
    confirmButtonText: '停用',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await disableRoleTemplate(template.id)
    if (res.success) {
      ElMessage.success('角色模板已停用')
      fetchTemplateList()
      return
    }
    ElMessage.error(res.message || '停用角色模板失败')
  }).catch(() => {})
}

function deleteTemplateHandler(template) {
  ElMessageBox.confirm(`确定删除角色“${template.roleName}”吗？删除后前台将不可继续新建此角色会话。`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteRoleTemplate(template.id)
    if (res.success) {
      ElMessage.success('角色模板删除成功')
      fetchTemplateList()
      return
    }
    ElMessage.error(res.message || '删除角色模板失败')
  }).catch(() => {})
}

function buildSubmitPayload() {
  return {
    roleKey: templateForm.roleKey.trim(),
    roleName: templateForm.roleName.trim(),
    roleDesc: templateForm.roleDesc.trim() || null,
    roleCategory: templateForm.roleCategory.trim() || null,
    avatar: templateForm.avatar.trim() || null,
    promptTemplate: templateForm.promptTemplate.trim(),
    openingMessage: templateForm.openingMessage.trim() || null,
    variableSchemaJson: templateForm.variableSchemaJson.trim() || null,
    defaultModel: templateForm.defaultModel.trim() || null,
    temperature: Number.isFinite(Number(templateForm.temperature)) ? Number(templateForm.temperature) : 0.7,
    sortNo: Number(templateForm.sortNo || 0),
    status: Number(templateForm.status ?? 1),
    isSystem: Number(templateForm.isSystem ?? 1)
  }
}

function fillTemplateForm(template) {
  templateForm.roleKey = template?.roleKey || ''
  templateForm.roleName = template?.roleName || ''
  templateForm.roleDesc = template?.roleDesc || ''
  templateForm.roleCategory = template?.roleCategory || ''
  templateForm.avatar = template?.avatar || ''
  templateForm.promptTemplate = template?.promptTemplate || ''
  templateForm.openingMessage = template?.openingMessage || ''
  templateForm.variableSchemaJson = formatJsonForEditor(template?.variableSchemaJson)
  templateForm.defaultModel = template?.defaultModel || 'deepseek-chat'
  templateForm.temperature = Number(template?.temperature ?? 0.7)
  templateForm.sortNo = Number(template?.sortNo ?? 0)
  templateForm.status = Number(template?.status ?? 1)
  templateForm.isSystem = Number(template?.isSystem ?? 1)
}

function resetTemplateForm() {
  fillTemplateForm(null)
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

function getPreview(value, limit = 80) {
  const normalized = (value || '').replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return '暂无配置'
  }
  return normalized.length > limit ? `${normalized.slice(0, limit)}...` : normalized
}

function getSchemaPreview(value) {
  if (!value) {
    return '无变量配置'
  }

  try {
    const schema = JSON.parse(value)
    if (Array.isArray(schema)) {
      return schema.map(item => item?.label || item?.key).filter(Boolean).join(' / ') || '无变量配置'
    }
  } catch (error) {
    console.warn('变量配置解析失败:', error)
  }

  return getPreview(value, 60)
}

function formatJsonForEditor(value) {
  if (!value) {
    return ''
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch (error) {
    return value
  }
}

function isValidJson(value) {
  try {
    JSON.parse(value)
    return true
  } catch (error) {
    return false
  }
}

function displayTemperature(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : '0.70'
}

onMounted(() => {
  fetchTemplateList()
})
</script>

<style scoped>
.role-template-management {
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
.switch-row,
.role-title-row {
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
.text-filter,
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

.search-input input,
.text-filter {
  outline: none;
}

.search-input input {
  width: 100%;
  border: none;
  background: transparent;
  color: #ffffff;
  padding: 11px 8px;
}

.text-filter,
.status-select,
.page-size-select,
.form-group input,
.form-group select,
.form-group textarea {
  border-radius: 10px;
  padding: 11px 12px;
}

.text-filter {
  min-width: 160px;
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
  background: linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%);
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
  background: rgba(45, 212, 191, 0.06);
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

.role-main,
.meta-stack {
  display: grid;
  gap: 6px;
}

.role-title-row {
  align-items: center;
  flex-wrap: wrap;
}

.role-name {
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
}

.role-key {
  color: #7dd3fc;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.role-desc,
.prompt-preview,
.schema-preview {
  color: rgba(255, 255, 255, 0.52);
  line-height: 1.6;
}

.system-tag,
.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.system-tag {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.56);
}

.system-tag.active {
  background: rgba(14, 165, 233, 0.16);
  color: #7dd3fc;
}

.status-badge.is-enabled {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
}

.status-badge.is-disabled {
  background: rgba(245, 158, 11, 0.16);
  color: #fcd34d;
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

.action-btn.enable {
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
}

.action-btn.disable {
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
  width: min(880px, 100%);
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
  border: 1px solid rgba(45, 212, 191, 0.18);
  background: rgba(45, 212, 191, 0.06);
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

.form-group textarea {
  min-height: 120px;
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

@media (max-width: 1100px) {
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
  .text-filter,
  .status-select,
  .action-buttons {
    width: 100%;
  }
}
</style>
