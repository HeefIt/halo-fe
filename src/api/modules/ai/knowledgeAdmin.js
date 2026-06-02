import request from '@/api/http'

/**
 * 分页查询知识库。
 * @param {object} params 查询参数
 * @returns {Promise<any>}
 */
export function getKnowledgeBasePage(params) {
  return request({
    url: '/ai/knowledge/base/admin/selectPage',
    method: 'get',
    params
  })
}

/**
 * 查询知识库详情。
 * @param {number|string} id 知识库ID
 * @returns {Promise<any>}
 */
export function getKnowledgeBaseDetail(id) {
  return request({
    url: `/ai/knowledge/base/admin/queryById/${id}`,
    method: 'get'
  })
}

/**
 * 新增知识库。
 * @param {object} data 保存参数
 * @returns {Promise<any>}
 */
export function addKnowledgeBase(data) {
  return request({
    url: '/ai/knowledge/base/admin/add',
    method: 'post',
    data
  })
}

/**
 * 更新知识库。
 * @param {number|string} id 知识库ID
 * @param {object} data 保存参数
 * @returns {Promise<any>}
 */
export function updateKnowledgeBase(id, data) {
  return request({
    url: `/ai/knowledge/base/admin/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 启用知识库。
 * @param {number|string} id 知识库ID
 * @returns {Promise<any>}
 */
export function enableKnowledgeBase(id) {
  return request({
    url: `/ai/knowledge/base/admin/enable/${id}`,
    method: 'post'
  })
}

/**
 * 停用知识库。
 * @param {number|string} id 知识库ID
 * @returns {Promise<any>}
 */
export function disableKnowledgeBase(id) {
  return request({
    url: `/ai/knowledge/base/admin/disable/${id}`,
    method: 'post'
  })
}

/**
 * 查询目录树。
 * @param {number|string} knowledgeBaseId 知识库ID
 * @returns {Promise<any>}
 */
export function getKnowledgeCatalogTree(knowledgeBaseId) {
  return request({
    url: '/ai/knowledge/catalog/admin/tree',
    method: 'get',
    params: { knowledgeBaseId }
  })
}

/**
 * 新增目录。
 * @param {object} data 保存参数
 * @returns {Promise<any>}
 */
export function addKnowledgeCatalog(data) {
  return request({
    url: '/ai/knowledge/catalog/admin/add',
    method: 'post',
    data
  })
}

/**
 * 更新目录。
 * @param {number|string} id 目录ID
 * @param {object} data 保存参数
 * @returns {Promise<any>}
 */
export function updateKnowledgeCatalog(id, data) {
  return request({
    url: `/ai/knowledge/catalog/admin/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 分页查询知识文档。
 * @param {object} params 查询参数
 * @returns {Promise<any>}
 */
export function getKnowledgeDocumentPage(params) {
  return request({
    url: '/ai/knowledge/document/admin/selectPage',
    method: 'get',
    params
  })
}

/**
 * 查询知识文档详情。
 * @param {number|string} id 文档ID
 * @returns {Promise<any>}
 */
export function getKnowledgeDocumentDetail(id) {
  return request({
    url: `/ai/knowledge/document/admin/detail/${id}`,
    method: 'get'
  })
}

/**
 * 新增文本文档。
 * @param {object} data 文本知识参数
 * @returns {Promise<any>}
 */
export function addKnowledgeTextDocument(data) {
  return request({
    url: '/ai/knowledge/document/admin/add-text',
    method: 'post',
    data
  })
}

/**
 * 上传知识文件。
 * @param {File} file 上传文件
 * @param {object} payload 上传参数
 * @returns {Promise<any>}
 */
export function uploadKnowledgeDocument(file, payload) {
  const formData = new FormData()
  formData.append('file', file)
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  return request({
    url: '/ai/knowledge/document/admin/upload',
    method: 'post',
    data: formData
  })
}

/**
 * 删除知识文档。
 * @param {number|string} id 文档ID
 * @returns {Promise<any>}
 */
export function deleteKnowledgeDocument(id) {
  return request({
    url: `/ai/knowledge/document/admin/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 重建知识文档。
 * @param {number|string} id 文档ID
 * @returns {Promise<any>}
 */
export function rebuildKnowledgeDocument(id) {
  return request({
    url: `/ai/knowledge/document/admin/rebuild/${id}`,
    method: 'post'
  })
}

/**
 * 查询文档任务列表。
 * @param {number|string} id 文档ID
 * @param {number} limit 数量限制
 * @returns {Promise<any>}
 */
export function getKnowledgeDocumentTasks(id, limit = 10) {
  return request({
    url: `/ai/knowledge/document/admin/tasks/${id}`,
    method: 'get',
    params: { limit }
  })
}

/**
 * 调试向量检索。
 * @param {object} params 查询参数
 * @returns {Promise<any>}
 */
export function debugKnowledgeSearch(params) {
  return request({
    url: '/ai/knowledge/debug/search',
    method: 'get',
    params
  })
}
