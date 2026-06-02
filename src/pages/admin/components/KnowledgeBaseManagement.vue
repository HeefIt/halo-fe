<template>
  <div class="knowledge-management">
    <div class="management-header">
      <div class="header-info">
        <h2>知识库管理</h2>
        <p>维护知识库配置、目录层级、文档入库和向量构建状态，作为后续 RAG 的基础底座。</p>
      </div>

      <div class="header-actions">
        <div class="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model.trim="baseSearch.keyword" placeholder="搜索知识库编码或名称..." @keyup.enter="fetchKnowledgeBases" />
        </div>
        <button class="btn-secondary" @click="fetchKnowledgeBases">搜索</button>
        <button class="btn-primary" @click="openBaseDialog()">新增知识库</button>
      </div>
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <span class="summary-label">知识库总数</span>
        <strong>{{ basePagination.total }}</strong>
      </div>
      <div class="summary-card">
        <span class="summary-label">当前选中</span>
        <strong>{{ selectedBase?.baseName || '未选择' }}</strong>
      </div>
      <div class="summary-card accent">
        <span class="summary-label">当前文档数</span>
        <strong>{{ documentPagination.total }}</strong>
      </div>
    </div>

    <div class="workspace-grid">
      <section class="panel panel-bases">
        <div class="panel-header">
          <div>
            <h3>知识库列表</h3>
            <p>先定义知识库边界，再维护目录和文档。</p>
          </div>
        </div>

        <div class="base-list" v-loading="baseLoading">
          <button
            v-for="base in knowledgeBases"
            :key="base.id"
            class="base-card"
            :class="{ active: String(selectedBaseId) === String(base.id) }"
            @click="selectKnowledgeBase(base)"
          >
            <div class="base-card__head">
              <div>
                <h4>{{ base.baseName }}</h4>
                <span>{{ base.baseCode }}</span>
              </div>
              <span class="status-pill" :class="Number(base.status) === 1 ? 'is-enabled' : 'is-disabled'">
                {{ Number(base.status) === 1 ? '启用' : '停用' }}
              </span>
            </div>

            <p class="base-card__desc">{{ base.baseDesc || '暂无知识库简介' }}</p>

            <div class="base-card__meta">
              <span>集合 {{ base.vectorCollection || '-' }}</span>
              <span>切片 {{ base.chunkSize }}/{{ base.chunkOverlap }}</span>
              <span>TopK {{ base.topK }}</span>
            </div>

            <div class="base-card__actions">
              <button class="action-btn edit" @click.stop="openBaseDialog(base)">编辑</button>
              <button
                v-if="Number(base.status) === 1"
                class="action-btn warning"
                @click.stop="toggleBaseStatus(base, 0)"
              >
                停用
              </button>
              <button
                v-else
                class="action-btn success"
                @click.stop="toggleBaseStatus(base, 1)"
              >
                启用
              </button>
            </div>
          </button>

          <div v-if="!baseLoading && knowledgeBases.length === 0" class="empty-state">
            还没有知识库，先新增一个知识库开始构建。
          </div>
        </div>
      </section>

      <section class="panel panel-catalog">
        <div class="panel-header">
          <div>
            <h3>目录树</h3>
            <p>{{ selectedBase ? `当前知识库：${selectedBase.baseName}` : '请先选择知识库' }}</p>
          </div>
          <button class="btn-secondary" :disabled="!selectedBase" @click="openCatalogDialog()">
            新增目录
          </button>
        </div>

        <div class="catalog-tree" v-loading="catalogLoading">
          <div v-if="!selectedBase" class="empty-state">选择知识库后可维护目录树。</div>
          <div v-else-if="catalogTree.length === 0" class="empty-state">当前知识库暂无目录，可直接新增根目录。</div>
          <div v-else class="catalog-tree__list">
            <CatalogNode
              v-for="node in catalogTree"
              :key="node.id"
              :node="node"
              :selected-catalog-id="selectedCatalogId"
              @select="selectCatalog"
              @edit="openCatalogDialog"
            />
          </div>
        </div>
      </section>
    </div>

    <section class="panel panel-documents">
      <div class="panel-header panel-header--documents">
        <div>
          <h3>知识文档</h3>
          <p>
            {{ selectedBase ? `归属知识库：${selectedBase.baseName}` : '请先选择知识库后再管理文档' }}
            <span v-if="selectedCatalogName"> / 目录：{{ selectedCatalogName }}</span>
          </p>
        </div>

        <div class="toolbar">
          <div class="search-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              v-model.trim="documentSearch.keyword"
              placeholder="搜索标题、编码或文件名..."
              :disabled="!selectedBase"
              @keyup.enter="fetchDocuments"
            />
          </div>

          <select v-model="documentSearch.parseStatus" class="toolbar-select" :disabled="!selectedBase" @change="fetchDocuments">
            <option value="">全部解析状态</option>
            <option :value="0">待处理</option>
            <option :value="1">处理中</option>
            <option :value="2">成功</option>
            <option :value="3">失败</option>
          </select>

          <select v-model="documentSearch.vectorStatus" class="toolbar-select" :disabled="!selectedBase" @change="fetchDocuments">
            <option value="">全部向量状态</option>
            <option :value="0">待处理</option>
            <option :value="1">处理中</option>
            <option :value="2">成功</option>
            <option :value="3">失败</option>
          </select>

          <button class="btn-secondary" :disabled="!selectedBase" @click="fetchDocuments">刷新</button>
          <button class="btn-secondary" :disabled="!selectedBase" @click="openTextDialog">新增文本</button>
          <button class="btn-primary" :disabled="!selectedBase" @click="triggerUpload">上传文件</button>
          <input ref="fileInputRef" type="file" class="hidden-file-input" @change="handleFileSelected" />
        </div>
      </div>

      <div class="table-container" v-loading="documentLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>文档信息</th>
              <th>来源/版本</th>
              <th>构建状态</th>
              <th>错误信息</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in documents" :key="doc.id">
              <td>
                <span class="id-badge">#{{ doc.id }}</span>
              </td>
              <td>
                <div class="doc-main">
                  <div class="doc-title-row">
                    <strong>{{ doc.title }}</strong>
                    <span class="source-tag">{{ formatSourceType(doc.sourceType) }}</span>
                  </div>
                  <span class="doc-code">{{ doc.docCode }}</span>
                  <span class="doc-file" v-if="doc.fileName">{{ doc.fileName }}</span>
                </div>
              </td>
              <td>
                <div class="meta-stack">
                  <span>版本 {{ doc.versionNo ?? 0 }}</span>
                  <span>分片 {{ doc.chunkCount ?? 0 }}</span>
                  <span v-if="doc.lastTaskId">任务 #{{ doc.lastTaskId }}</span>
                </div>
              </td>
              <td>
                <div class="status-group">
                  <span class="status-pill" :class="statusClass(doc.parseStatus)">
                    解析{{ formatProcessStatus(doc.parseStatus) }}
                  </span>
                  <span class="status-pill" :class="statusClass(doc.vectorStatus)">
                    向量{{ formatProcessStatus(doc.vectorStatus) }}
                  </span>
                </div>
              </td>
              <td>
                <span class="error-message">{{ doc.lastErrorMessage || '-' }}</span>
              </td>
              <td>
                <div class="meta-stack">
                  <span>{{ formatDateTime(doc.updateTime) }}</span>
                  <span>{{ formatDateTime(doc.createdTime) }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons-cell">
                  <button class="action-btn edit" @click="openDocumentDetail(doc)">详情</button>
                  <button class="action-btn success" @click="rebuildDocumentHandler(doc)">重建</button>
                  <button class="action-btn danger" @click="deleteDocumentHandler(doc)">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="!documentLoading && documents.length === 0">
              <td colspan="7" class="empty-cell">当前筛选条件下暂无知识文档。</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="documents.length > 0" class="pagination-container">
        <div class="pagination-info">
          共 {{ documentPagination.total }} 条，当前第 {{ documentPagination.pageNum }} / {{ totalDocumentPages }} 页
        </div>
        <div class="pagination-controls">
          <select v-model="documentPagination.pageSize" class="toolbar-select" @change="handleDocumentPageSizeChange">
            <option :value="10">10条/页</option>
            <option :value="20">20条/页</option>
            <option :value="50">50条/页</option>
          </select>
          <div class="page-buttons">
            <button class="page-btn" :disabled="documentPagination.pageNum === 1" @click="changeDocumentPage(documentPagination.pageNum - 1)">上一页</button>
            <span class="page-info">{{ documentPagination.pageNum }} / {{ totalDocumentPages }}</span>
            <button class="page-btn" :disabled="documentPagination.pageNum >= totalDocumentPages" @click="changeDocumentPage(documentPagination.pageNum + 1)">下一页</button>
          </div>
        </div>
      </div>
    </section>

    <section class="panel panel-debug">
      <div class="panel-header">
        <div>
          <h3>向量检索调试</h3>
          <p>验证知识片段是否正确入库，后续 RAG 会直接复用这部分索引结果。</p>
        </div>
      </div>

      <div class="debug-toolbar">
        <div class="search-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model.trim="debugQuery" placeholder="输入查询词验证入库效果..." @keyup.enter="runDebugSearch" />
        </div>
        <button class="btn-primary" :disabled="!selectedBase || !debugQuery.trim()" @click="runDebugSearch">开始检索</button>
      </div>

      <div class="debug-results" v-loading="debugLoading">
        <div v-if="debugResults.length === 0" class="empty-state">暂无检索结果，选择知识库后可输入查询词调试。</div>
        <div v-else class="result-list">
          <article v-for="item in debugResults" :key="item.vectorRecordId" class="result-card">
            <div class="result-card__head">
              <span>{{ item.vectorRecordId }}</span>
              <span class="score">score {{ formatScore(item.score) }}</span>
            </div>
            <p>{{ item.content }}</p>
            <div class="result-meta">
              <span>文档 {{ item.metadata?.documentTitle || '-' }}</span>
              <span>分片 {{ item.metadata?.chunkNo || '-' }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <transition name="modal">
      <div v-if="showBaseDialog" class="modal-overlay" @click.self="showBaseDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingBase ? '编辑知识库' : '新增知识库' }}</h3>
            <button class="modal-close" @click="showBaseDialog = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>知识库编码</label>
                <input v-model.trim="baseForm.baseCode" placeholder="例如：halo_platform_base" />
              </div>
              <div class="form-group">
                <label>知识库名称</label>
                <input v-model.trim="baseForm.baseName" placeholder="例如：平台基础知识库" />
              </div>
              <div class="form-group">
                <label>向量集合名</label>
                <input v-model.trim="baseForm.vectorCollection" placeholder="例如：knowledge_collection" />
              </div>
              <div class="form-group">
                <label>向量模型名</label>
                <input v-model.trim="baseForm.embeddingModel" placeholder="例如：text-embedding-v3" />
              </div>
              <div class="form-group">
                <label>切片大小</label>
                <input v-model.number="baseForm.chunkSize" type="number" min="100" max="4000" />
              </div>
              <div class="form-group">
                <label>切片重叠</label>
                <input v-model.number="baseForm.chunkOverlap" type="number" min="0" max="1000" />
              </div>
              <div class="form-group">
                <label>默认 TopK</label>
                <input v-model.number="baseForm.topK" type="number" min="1" max="50" />
              </div>
              <div class="form-group">
                <label>排序值</label>
                <input v-model.number="baseForm.sortNo" type="number" min="0" />
              </div>
              <div class="form-group form-group--full">
                <label>知识库简介</label>
                <textarea v-model.trim="baseForm.baseDesc" rows="4" placeholder="描述该知识库的覆盖范围和建设目标"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showBaseDialog = false">取消</button>
            <button class="btn-primary" @click="saveKnowledgeBase">保存</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showCatalogDialog" class="modal-overlay" @click.self="showCatalogDialog = false">
        <div class="modal-content modal-content--sm">
          <div class="modal-header">
            <h3>{{ editingCatalog ? '编辑目录' : '新增目录' }}</h3>
            <button class="modal-close" @click="showCatalogDialog = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-grid form-grid--single">
              <div class="form-group">
                <label>上级目录</label>
                <select v-model="catalogForm.parentId">
                  <option value="0">根目录</option>
                  <option v-for="item in catalogFlatOptions" :key="item.id" :value="String(item.id)">
                    {{ item.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>目录编码</label>
                <input v-model.trim="catalogForm.catalogCode" placeholder="不填则后端自动生成" />
              </div>
              <div class="form-group">
                <label>目录名称</label>
                <input v-model.trim="catalogForm.catalogName" placeholder="例如：Spring Boot 入门" />
              </div>
              <div class="form-group">
                <label>排序值</label>
                <input v-model.number="catalogForm.sortNo" type="number" min="0" />
              </div>
              <div class="form-group form-group--full">
                <label>目录说明</label>
                <textarea v-model.trim="catalogForm.catalogDesc" rows="4" placeholder="描述该目录存放的知识范围"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showCatalogDialog = false">取消</button>
            <button class="btn-primary" @click="saveCatalog">保存</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showTextDialog" class="modal-overlay" @click.self="showTextDialog = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>新增文本知识文档</h3>
            <button class="modal-close" @click="showTextDialog = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>文档标题</label>
                <input v-model.trim="textForm.title" placeholder="例如：平台登录流程说明" />
              </div>
              <div class="form-group">
                <label>归属目录</label>
                <select v-model="textForm.catalogId">
                  <option value="0">根目录</option>
                  <option v-for="item in catalogFlatOptions" :key="item.id" :value="String(item.id)">
                    {{ item.label }}
                  </option>
                </select>
              </div>
              <div class="form-group form-group--full">
                <label>备注</label>
                <input v-model.trim="textForm.remark" placeholder="可选，方便后续区分导入来源" />
              </div>
              <div class="form-group form-group--full">
                <label>正文内容</label>
                <textarea v-model="textForm.contentText" rows="12" placeholder="输入结构化知识内容，保存后会自动切片并进入向量构建流程"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showTextDialog = false">取消</button>
            <button class="btn-primary" @click="saveTextDocument">保存并构建</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showDocumentDetailDialog" class="modal-overlay" @click.self="showDocumentDetailDialog = false">
        <div class="modal-content modal-content--xl">
          <div class="modal-header">
            <h3>文档详情</h3>
            <button class="modal-close" @click="showDocumentDetailDialog = false">×</button>
          </div>
          <div class="modal-body" v-loading="detailLoading">
            <template v-if="documentDetail">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">文档标题</span>
                  <span class="detail-value">{{ documentDetail.title }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">文档编码</span>
                  <span class="detail-value">{{ documentDetail.docCode }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">来源类型</span>
                  <span class="detail-value">{{ formatSourceType(documentDetail.sourceType) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">文件名</span>
                  <span class="detail-value">{{ documentDetail.fileName || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">分片数量</span>
                  <span class="detail-value">{{ documentDetail.chunkCount ?? 0 }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">最近任务</span>
                  <span class="detail-value">{{ documentDetail.lastTaskId ? `#${documentDetail.lastTaskId}` : '-' }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4>正文内容</h4>
                <pre class="detail-pre">{{ documentDetail.contentText || '暂无正文内容' }}</pre>
              </div>

              <div class="detail-section">
                <h4>构建任务</h4>
                <div v-if="!documentDetail.recentTaskList?.length" class="empty-state">暂无任务记录</div>
                <div v-else class="task-list">
                  <div v-for="task in documentDetail.recentTaskList" :key="task.id" class="task-card">
                    <div class="task-card__head">
                      <span>{{ task.taskNo }}</span>
                      <span class="status-pill" :class="statusClass(task.status)">{{ formatTaskStatus(task.status) }}</span>
                    </div>
                    <div class="task-card__meta">
                      <span>{{ task.taskType }}</span>
                      <span>{{ task.triggerSource }}</span>
                      <span>成功 {{ task.successCount || 0 }} / 失败 {{ task.failCount || 0 }}</span>
                    </div>
                    <p>{{ task.errorMessage || '任务执行正常' }}</p>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>分片预览</h4>
                <div v-if="!documentDetail.chunkList?.length" class="empty-state">暂无分片记录</div>
                <div v-else class="chunk-list">
                  <div v-for="chunk in documentDetail.chunkList" :key="chunk.id" class="chunk-card">
                    <div class="chunk-card__head">
                      <span>Chunk {{ chunk.chunkNo }}</span>
                      <span class="status-pill" :class="statusClass(chunk.vectorStatus)">
                        {{ formatProcessStatus(chunk.vectorStatus) }}
                      </span>
                    </div>
                    <p>{{ chunk.chunkText }}</p>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showDocumentDetailDialog = false">关闭</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addKnowledgeBase,
  addKnowledgeCatalog,
  addKnowledgeTextDocument,
  debugKnowledgeSearch,
  deleteKnowledgeDocument,
  disableKnowledgeBase,
  enableKnowledgeBase,
  getKnowledgeBaseDetail,
  getKnowledgeBasePage,
  getKnowledgeCatalogTree,
  getKnowledgeDocumentDetail,
  getKnowledgeDocumentPage,
  rebuildKnowledgeDocument,
  updateKnowledgeBase,
  updateKnowledgeCatalog,
  uploadKnowledgeDocument
} from '@/api/modules/ai/knowledgeAdmin'

const CatalogNode = defineComponent({
  name: 'CatalogNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    selectedCatalogId: {
      type: [String, Number, null],
      default: null
    }
  },
  emits: ['select', 'edit'],
  setup(props, { emit }) {
    const handleSelect = () => emit('select', props.node)
    const handleEdit = () => emit('edit', props.node)

    return () => h('div', { class: 'catalog-node' }, [
      h('div', {
        class: ['catalog-node__row', String(props.selectedCatalogId) === String(props.node.id) ? 'active' : ''],
        onClick: handleSelect
      }, [
        h('div', { class: 'catalog-node__main' }, [
          h('span', { class: 'catalog-node__title' }, props.node.catalogName),
          h('span', { class: 'catalog-node__code' }, props.node.catalogCode || '-')
        ]),
        h('button', {
          class: 'catalog-node__edit',
          onClick: (event) => {
            event.stopPropagation()
            handleEdit()
          }
        }, '编辑')
      ]),
      Array.isArray(props.node.children) && props.node.children.length
        ? h('div', { class: 'catalog-node__children' }, props.node.children.map((child) =>
            h(CatalogNode, {
              key: child.id,
              node: child,
              selectedCatalogId: props.selectedCatalogId,
              onSelect: (value) => emit('select', value),
              onEdit: (value) => emit('edit', value)
            })
          ))
        : null
    ])
  }
})

const baseLoading = ref(false)
const catalogLoading = ref(false)
const documentLoading = ref(false)
const detailLoading = ref(false)
const debugLoading = ref(false)

const showBaseDialog = ref(false)
const showCatalogDialog = ref(false)
const showTextDialog = ref(false)
const showDocumentDetailDialog = ref(false)

const editingBase = ref(null)
const editingCatalog = ref(null)

const knowledgeBases = ref([])
const catalogTree = ref([])
const documents = ref([])
const documentDetail = ref(null)
const debugResults = ref([])

const selectedBase = ref(null)
const selectedBaseId = ref('')
const selectedCatalogId = ref('0')
const selectedCatalogName = ref('')

const fileInputRef = ref(null)

const baseSearch = reactive({
  keyword: ''
})

const basePagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const baseForm = reactive({
  baseCode: '',
  baseName: '',
  baseDesc: '',
  vectorCollection: 'knowledge_collection',
  embeddingModel: 'text-embedding-v3',
  chunkSize: 500,
  chunkOverlap: 100,
  topK: 5,
  sortNo: 0,
  status: 1
})

const catalogForm = reactive({
  parentId: '0',
  catalogCode: '',
  catalogName: '',
  catalogDesc: '',
  sortNo: 0,
  status: 1
})

const textForm = reactive({
  title: '',
  catalogId: '0',
  contentText: '',
  remark: ''
})

const documentSearch = reactive({
  keyword: '',
  parseStatus: '',
  vectorStatus: ''
})

const documentPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const debugQuery = ref('')

const catalogFlatOptions = computed(() => {
  const result = []
  const walk = (nodes, prefix = '') => {
    nodes.forEach((node) => {
      result.push({
        id: node.id,
        label: `${prefix}${node.catalogName}`
      })
      if (Array.isArray(node.children) && node.children.length) {
        walk(node.children, `${prefix}${node.catalogName} / `)
      }
    })
  }
  walk(catalogTree.value)
  return result
})

const totalDocumentPages = computed(() => Math.ceil(documentPagination.total / documentPagination.pageSize) || 1)

async function fetchKnowledgeBases() {
  baseLoading.value = true
  try {
    const res = await getKnowledgeBasePage({
      pageNum: basePagination.pageNum,
      pageSize: basePagination.pageSize,
      keyword: baseSearch.keyword || undefined
    })

    if (!res.success) {
      ElMessage.error(res.message || '获取知识库列表失败')
      return
    }

    knowledgeBases.value = res.data?.result || []
    basePagination.total = Number(res.data?.total || 0)

    if (!selectedBaseId.value && knowledgeBases.value.length) {
      selectKnowledgeBase(knowledgeBases.value[0])
      return
    }

    if (selectedBaseId.value) {
      const matched = knowledgeBases.value.find(item => String(item.id) === String(selectedBaseId.value))
      if (matched) {
        selectedBase.value = matched
      }
    }
  } catch (error) {
    console.error('获取知识库列表失败:', error)
    ElMessage.error('获取知识库列表失败')
  } finally {
    baseLoading.value = false
  }
}

async function selectKnowledgeBase(base) {
  selectedBase.value = base
  selectedBaseId.value = String(base.id)
  selectedCatalogId.value = '0'
  selectedCatalogName.value = ''
  documentSearch.keyword = ''
  documentSearch.parseStatus = ''
  documentSearch.vectorStatus = ''
  await Promise.all([fetchCatalogTree(), fetchDocuments()])
}

async function fetchCatalogTree() {
  if (!selectedBaseId.value) {
    catalogTree.value = []
    return
  }

  catalogLoading.value = true
  try {
    const res = await getKnowledgeCatalogTree(selectedBaseId.value)
    if (!res.success) {
      ElMessage.error(res.message || '获取目录树失败')
      return
    }
    catalogTree.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('获取目录树失败:', error)
    ElMessage.error('获取目录树失败')
  } finally {
    catalogLoading.value = false
  }
}

function selectCatalog(node) {
  selectedCatalogId.value = String(node.id)
  selectedCatalogName.value = node.catalogName
  documentPagination.pageNum = 1
  fetchDocuments()
}

async function fetchDocuments() {
  if (!selectedBaseId.value) {
    documents.value = []
    documentPagination.total = 0
    return
  }

  documentLoading.value = true
  try {
    const res = await getKnowledgeDocumentPage({
      knowledgeBaseId: selectedBaseId.value,
      catalogId: selectedCatalogId.value !== '0' ? selectedCatalogId.value : undefined,
      keyword: documentSearch.keyword || undefined,
      parseStatus: documentSearch.parseStatus === '' ? undefined : Number(documentSearch.parseStatus),
      vectorStatus: documentSearch.vectorStatus === '' ? undefined : Number(documentSearch.vectorStatus),
      pageNum: documentPagination.pageNum,
      pageSize: documentPagination.pageSize
    })

    if (!res.success) {
      ElMessage.error(res.message || '获取知识文档列表失败')
      return
    }

    documents.value = res.data?.result || []
    documentPagination.total = Number(res.data?.total || 0)
  } catch (error) {
    console.error('获取知识文档列表失败:', error)
    ElMessage.error('获取知识文档列表失败')
  } finally {
    documentLoading.value = false
  }
}

function openBaseDialog(base = null) {
  editingBase.value = base
  if (base) {
    baseForm.baseCode = base.baseCode || ''
    baseForm.baseName = base.baseName || ''
    baseForm.baseDesc = base.baseDesc || ''
    baseForm.vectorCollection = base.vectorCollection || 'knowledge_collection'
    baseForm.embeddingModel = base.embeddingModel || 'text-embedding-v3'
    baseForm.chunkSize = Number(base.chunkSize ?? 500)
    baseForm.chunkOverlap = Number(base.chunkOverlap ?? 100)
    baseForm.topK = Number(base.topK ?? 5)
    baseForm.sortNo = Number(base.sortNo ?? 0)
    baseForm.status = Number(base.status ?? 1)
  } else {
    baseForm.baseCode = ''
    baseForm.baseName = ''
    baseForm.baseDesc = ''
    baseForm.vectorCollection = 'knowledge_collection'
    baseForm.embeddingModel = 'text-embedding-v3'
    baseForm.chunkSize = 500
    baseForm.chunkOverlap = 100
    baseForm.topK = 5
    baseForm.sortNo = 0
    baseForm.status = 1
  }
  showBaseDialog.value = true
}

async function saveKnowledgeBase() {
  if (!baseForm.baseCode.trim()) {
    ElMessage.warning('请输入知识库编码')
    return
  }
  if (!baseForm.baseName.trim()) {
    ElMessage.warning('请输入知识库名称')
    return
  }

  const payload = {
    baseCode: baseForm.baseCode.trim(),
    baseName: baseForm.baseName.trim(),
    baseDesc: baseForm.baseDesc.trim() || null,
    vectorCollection: baseForm.vectorCollection.trim() || null,
    embeddingModel: baseForm.embeddingModel.trim() || null,
    chunkSize: Number(baseForm.chunkSize || 500),
    chunkOverlap: Number(baseForm.chunkOverlap || 100),
    topK: Number(baseForm.topK || 5),
    sortNo: Number(baseForm.sortNo || 0),
    status: Number(baseForm.status ?? 1)
  }

  try {
    const res = editingBase.value
      ? await updateKnowledgeBase(editingBase.value.id, payload)
      : await addKnowledgeBase(payload)

    if (!res.success) {
      ElMessage.error(res.message || '保存知识库失败')
      return
    }

    ElMessage.success(editingBase.value ? '知识库更新成功' : '知识库新增成功')
    showBaseDialog.value = false
    await fetchKnowledgeBases()
  } catch (error) {
    console.error('保存知识库失败:', error)
    ElMessage.error('保存知识库失败')
  }
}

async function toggleBaseStatus(base, status) {
  const actionText = status === 1 ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确定${actionText}知识库“${base.baseName}”吗？`, '提示', {
      confirmButtonText: actionText,
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = status === 1 ? await enableKnowledgeBase(base.id) : await disableKnowledgeBase(base.id)
    if (!res.success) {
      ElMessage.error(res.message || `${actionText}知识库失败`)
      return
    }

    ElMessage.success(`知识库已${actionText}`)
    await fetchKnowledgeBases()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${actionText}知识库失败:`, error)
    }
  }
}

function openCatalogDialog(catalog = null) {
  if (!selectedBaseId.value) {
    ElMessage.warning('请先选择知识库')
    return
  }

  editingCatalog.value = catalog
  if (catalog) {
    catalogForm.parentId = String(catalog.parentId ?? 0)
    catalogForm.catalogCode = catalog.catalogCode || ''
    catalogForm.catalogName = catalog.catalogName || ''
    catalogForm.catalogDesc = catalog.catalogDesc || ''
    catalogForm.sortNo = Number(catalog.sortNo ?? 0)
    catalogForm.status = Number(catalog.status ?? 1)
  } else {
    catalogForm.parentId = selectedCatalogId.value || '0'
    catalogForm.catalogCode = ''
    catalogForm.catalogName = ''
    catalogForm.catalogDesc = ''
    catalogForm.sortNo = 0
    catalogForm.status = 1
  }
  showCatalogDialog.value = true
}

async function saveCatalog() {
  if (!catalogForm.catalogName.trim()) {
    ElMessage.warning('请输入目录名称')
    return
  }

  const payload = {
    knowledgeBaseId: selectedBaseId.value,
    parentId: catalogForm.parentId || '0',
    catalogCode: catalogForm.catalogCode.trim() || null,
    catalogName: catalogForm.catalogName.trim(),
    catalogDesc: catalogForm.catalogDesc.trim() || null,
    sortNo: Number(catalogForm.sortNo || 0),
    status: Number(catalogForm.status ?? 1)
  }

  try {
    const res = editingCatalog.value
      ? await updateKnowledgeCatalog(editingCatalog.value.id, payload)
      : await addKnowledgeCatalog(payload)

    if (!res.success) {
      ElMessage.error(res.message || '保存目录失败')
      return
    }

    ElMessage.success(editingCatalog.value ? '目录更新成功' : '目录新增成功')
    showCatalogDialog.value = false
    await fetchCatalogTree()
  } catch (error) {
    console.error('保存目录失败:', error)
    ElMessage.error('保存目录失败')
  }
}

function openTextDialog() {
  if (!selectedBaseId.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  textForm.title = ''
  textForm.catalogId = selectedCatalogId.value || '0'
  textForm.contentText = ''
  textForm.remark = ''
  showTextDialog.value = true
}

async function saveTextDocument() {
  if (!selectedBaseId.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  if (!textForm.title.trim()) {
    ElMessage.warning('请输入文档标题')
    return
  }
  if (!textForm.contentText.trim()) {
    ElMessage.warning('请输入正文内容')
    return
  }

  try {
    const res = await addKnowledgeTextDocument({
      knowledgeBaseId: selectedBaseId.value,
      catalogId: textForm.catalogId || '0',
      title: textForm.title.trim(),
      contentText: textForm.contentText,
      remark: textForm.remark.trim() || null
    })

    if (!res.success) {
      ElMessage.error(res.message || '新增文本文档失败')
      return
    }

    ElMessage.success('文本文档已提交并开始构建')
    showTextDialog.value = false
    await fetchDocuments()
  } catch (error) {
    console.error('新增文本文档失败:', error)
    ElMessage.error('新增文本文档失败')
  }
}

function triggerUpload() {
  if (!selectedBaseId.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  fileInputRef.value?.click()
}

async function handleFileSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) {
    return
  }

  try {
    const res = await uploadKnowledgeDocument(file, {
      knowledgeBaseId: selectedBaseId.value,
      catalogId: selectedCatalogId.value || '0',
      title: file.name,
      remark: `前端上传于 ${new Date().toLocaleString('zh-CN')}`
    })

    if (!res.success) {
      ElMessage.error(res.message || '上传知识文件失败')
      return
    }

    ElMessage.success('知识文件上传成功，后台已开始构建')
    await fetchDocuments()
  } catch (error) {
    console.error('上传知识文件失败:', error)
    ElMessage.error('上传知识文件失败')
  }
}

async function openDocumentDetail(doc) {
  detailLoading.value = true
  showDocumentDetailDialog.value = true
  try {
    const res = await getKnowledgeDocumentDetail(doc.id)
    if (!res.success) {
      ElMessage.error(res.message || '获取文档详情失败')
      showDocumentDetailDialog.value = false
      return
    }
    documentDetail.value = res.data
  } catch (error) {
    console.error('获取文档详情失败:', error)
    ElMessage.error('获取文档详情失败')
    showDocumentDetailDialog.value = false
  } finally {
    detailLoading.value = false
  }
}

async function rebuildDocumentHandler(doc) {
  try {
    await ElMessageBox.confirm(`确定重建文档“${doc.title}”吗？会删除旧分片并重新向量化。`, '提示', {
      confirmButtonText: '重建',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await rebuildKnowledgeDocument(doc.id)
    if (!res.success) {
      ElMessage.error(res.message || '重建文档失败')
      return
    }

    ElMessage.success('文档重建已触发')
    await fetchDocuments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重建文档失败:', error)
    }
  }
}

async function deleteDocumentHandler(doc) {
  try {
    await ElMessageBox.confirm(`确定删除文档“${doc.title}”吗？对应向量记录也会一起删除。`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteKnowledgeDocument(doc.id)
    if (!res.success) {
      ElMessage.error(res.message || '删除文档失败')
      return
    }

    ElMessage.success('文档删除成功')
    await fetchDocuments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文档失败:', error)
    }
  }
}

function handleDocumentPageSizeChange() {
  documentPagination.pageNum = 1
  fetchDocuments()
}

function changeDocumentPage(pageNum) {
  if (pageNum < 1 || pageNum > totalDocumentPages.value) {
    return
  }
  documentPagination.pageNum = pageNum
  fetchDocuments()
}

async function runDebugSearch() {
  if (!selectedBaseId.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  if (!debugQuery.value.trim()) {
    ElMessage.warning('请输入查询词')
    return
  }

  debugLoading.value = true
  try {
    const res = await debugKnowledgeSearch({
      knowledgeBaseId: selectedBaseId.value,
      query: debugQuery.value.trim(),
      topK: 5
    })

    if (!res.success) {
      ElMessage.error(res.message || '调试检索失败')
      return
    }
    debugResults.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('调试检索失败:', error)
    ElMessage.error('调试检索失败')
  } finally {
    debugLoading.value = false
  }
}

function formatSourceType(value) {
  if (value === 'TEXT') {
    return '文本'
  }
  if (value === 'FILE') {
    return '文件'
  }
  return value || '-'
}

function formatProcessStatus(value) {
  const statusMap = {
    0: '待处理',
    1: '处理中',
    2: '成功',
    3: '失败'
  }
  return statusMap[Number(value)] || '未知'
}

function formatTaskStatus(value) {
  const statusMap = {
    0: '待处理',
    1: '执行中',
    2: '成功',
    3: '失败'
  }
  return statusMap[Number(value)] || '未知'
}

function statusClass(value) {
  const numericValue = Number(value)
  if (numericValue === 2) {
    return 'is-success'
  }
  if (numericValue === 3) {
    return 'is-danger'
  }
  if (numericValue === 1) {
    return 'is-warning'
  }
  return 'is-pending'
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatScore(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue.toFixed(4) : '-'
}

onMounted(async () => {
  await fetchKnowledgeBases()
  if (selectedBaseId.value) {
    await fetchCatalogTree()
    await fetchDocuments()
  }
})
</script>

<style scoped>
.knowledge-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.management-header,
.header-actions,
.summary-row,
.workspace-grid,
.panel-header,
.toolbar,
.pagination-controls,
.page-buttons,
.action-buttons-cell,
.detail-grid,
.detail-item,
.result-meta,
.base-card__meta,
.base-card__actions,
.doc-title-row,
.status-group {
  display: flex;
  gap: 12px;
}

.management-header,
.panel-header,
.pagination-controls {
  justify-content: space-between;
  align-items: center;
}

.management-header {
  flex-wrap: wrap;
}

.header-info h2,
.panel-header h3 {
  margin: 0 0 6px;
  color: #ffffff;
}

.header-info p,
.panel-header p,
.summary-label,
.meta-stack,
.result-meta,
.error-message,
.detail-label {
  color: rgba(255, 255, 255, 0.58);
}

.header-actions,
.toolbar {
  flex-wrap: wrap;
  align-items: center;
}

.search-input,
.toolbar-select,
.form-group input,
.form-group select,
.form-group textarea {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.search-input {
  display: flex;
  align-items: center;
  min-width: 240px;
  padding: 0 12px;
}

.search-input svg {
  color: rgba(255, 255, 255, 0.38);
}

.search-input input {
  width: 100%;
  padding: 11px 8px;
  border: none;
  outline: none;
  background: transparent;
  color: #ffffff;
}

.toolbar-select,
.form-group input,
.form-group select,
.form-group textarea {
  padding: 11px 12px;
}

.toolbar-select option,
.form-group select option {
  background: #0f172a;
}

.btn-primary,
.btn-secondary,
.action-btn,
.page-btn,
.catalog-node__edit {
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  padding: 10px 18px;
  color: #ffffff;
  background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%);
}

.btn-secondary {
  padding: 10px 18px;
  color: rgba(255, 255, 255, 0.84);
  background: rgba(255, 255, 255, 0.08);
}

.btn-primary:disabled,
.btn-secondary:disabled,
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-card,
.panel,
.result-card,
.task-card,
.chunk-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.summary-card {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 16px;
}

.summary-card strong {
  color: #ffffff;
  font-size: 28px;
}

.summary-card.accent {
  background: rgba(8, 145, 178, 0.12);
  border-color: rgba(34, 211, 238, 0.16);
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
}

.panel {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 18px;
  gap: 16px;
}

.panel-documents,
.panel-debug {
  gap: 18px;
}

.base-list,
.catalog-tree,
.debug-results {
  min-height: 220px;
}

.base-list {
  display: grid;
  gap: 14px;
}

.base-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  text-align: left;
  cursor: pointer;
}

.base-card.active {
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.25);
}

.base-card__head,
.result-card__head,
.chunk-card__head,
.task-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.base-card__head h4,
.doc-main strong {
  margin: 0;
  color: #ffffff;
}

.base-card__head span,
.doc-code,
.doc-file,
.catalog-node__code,
.score {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.base-card__desc {
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.6;
}

.base-card__meta,
.result-meta,
.task-card__meta {
  flex-wrap: wrap;
  font-size: 12px;
}

.base-card__actions {
  flex-wrap: wrap;
}

.catalog-tree__list,
.catalog-node__children {
  display: grid;
  gap: 10px;
}

.catalog-node__children {
  margin-left: 18px;
  padding-left: 14px;
  border-left: 1px dashed rgba(255, 255, 255, 0.1);
}

.catalog-node__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
}

.catalog-node__row.active {
  background: rgba(34, 211, 238, 0.12);
}

.catalog-node__main {
  display: grid;
  gap: 4px;
}

.catalog-node__title {
  color: #ffffff;
  font-weight: 600;
}

.catalog-node__edit {
  min-height: 32px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.84);
}

.table-container {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px 18px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.data-table th {
  color: rgba(255, 255, 255, 0.46);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.data-table td {
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
}

.data-table tbody tr:hover {
  background: rgba(34, 211, 238, 0.04);
}

.id-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
}

.doc-main,
.meta-stack {
  display: grid;
  gap: 6px;
}

.source-tag,
.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.source-tag {
  background: rgba(99, 102, 241, 0.16);
  color: #c7d2fe;
}

.status-pill.is-enabled,
.status-pill.is-success {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
}

.status-pill.is-disabled,
.status-pill.is-danger {
  background: rgba(239, 68, 68, 0.16);
  color: #fca5a5;
}

.status-pill.is-warning {
  background: rgba(245, 158, 11, 0.16);
  color: #fcd34d;
}

.status-pill.is-pending {
  background: rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
}

.action-buttons-cell,
.status-group {
  flex-wrap: wrap;
}

.action-btn {
  min-height: 34px;
  padding: 0 12px;
}

.action-btn.edit {
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
}

.action-btn.success {
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
}

.action-btn.warning {
  background: rgba(245, 158, 11, 0.14);
  color: #fcd34d;
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
}

.error-message {
  line-height: 1.6;
}

.pagination-container,
.task-list,
.chunk-list,
.result-list {
  display: grid;
  gap: 14px;
}

.page-buttons {
  align-items: center;
}

.page-btn {
  min-height: 34px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.86);
}

.debug-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.result-card,
.task-card,
.chunk-card {
  padding: 16px;
  border-radius: 14px;
}

.result-card p,
.task-card p,
.chunk-card p {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.7;
  white-space: pre-wrap;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
}

.modal-content {
  width: min(860px, 100%);
  max-height: 88vh;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, #132238 0%, #0f172a 100%);
}

.modal-content--sm {
  width: min(640px, 100%);
}

.modal-content--xl {
  width: min(1100px, 100%);
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
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  cursor: pointer;
  font-size: 20px;
}

.modal-body {
  max-height: calc(88vh - 140px);
  overflow-y: auto;
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-grid--single {
  grid-template-columns: 1fr;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-group label {
  color: rgba(255, 255, 255, 0.76);
  font-size: 13px;
  font-weight: 600;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.detail-item {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.detail-value {
  color: #ffffff;
  line-height: 1.6;
}

.detail-section {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.detail-section h4 {
  margin: 0;
  color: #ffffff;
}

.detail-pre {
  margin: 0;
  padding: 16px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.8);
  color: rgba(255, 255, 255, 0.86);
  white-space: pre-wrap;
  line-height: 1.7;
}

.modal-footer {
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.hidden-file-input {
  display: none;
}

.empty-state,
.empty-cell {
  color: rgba(255, 255, 255, 0.48);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  padding: 16px;
  text-align: center;
}

.empty-cell {
  text-align: center !important;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .workspace-grid,
  .summary-row,
  .detail-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .panel-header,
  .toolbar,
  .pagination-controls,
  .management-header,
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .toolbar-select,
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
