import request from '@/api/http'

/**
 * 分页查询角色模板。
 * @param {object} params 查询参数
 * @returns {Promise<any>}
 */
export function getRoleTemplatePage(params) {
  return request({
    url: '/ai/role/admin/selectPage',
    method: 'get',
    params
  })
}

/**
 * 查询角色模板详情。
 * @param {number} id 模板ID
 * @returns {Promise<any>}
 */
export function getRoleTemplateAdminDetail(id) {
  return request({
    url: `/ai/role/admin/queryById/${id}`,
    method: 'get'
  })
}

/**
 * 新增角色模板。
 * @param {object} data 模板数据
 * @returns {Promise<any>}
 */
export function addRoleTemplate(data) {
  return request({
    url: '/ai/role/admin/add',
    method: 'post',
    data
  })
}

/**
 * 更新角色模板。
 * @param {number} id 模板ID
 * @param {object} data 模板数据
 * @returns {Promise<any>}
 */
export function updateRoleTemplate(id, data) {
  return request({
    url: `/ai/role/admin/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 启用角色模板。
 * @param {number} id 模板ID
 * @returns {Promise<any>}
 */
export function enableRoleTemplate(id) {
  return request({
    url: `/ai/role/admin/enable/${id}`,
    method: 'post'
  })
}

/**
 * 停用角色模板。
 * @param {number} id 模板ID
 * @returns {Promise<any>}
 */
export function disableRoleTemplate(id) {
  return request({
    url: `/ai/role/admin/disable/${id}`,
    method: 'post'
  })
}

/**
 * 删除角色模板。
 * @param {number} id 模板ID
 * @returns {Promise<any>}
 */
export function deleteRoleTemplate(id) {
  return request({
    url: `/ai/role/admin/delete/${id}`,
    method: 'delete'
  })
}
