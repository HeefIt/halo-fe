import request from '@/api/http'

/**
 * 查询角色模板列表
 * @returns {Promise}
 */
export const getRoleTemplateList = () => {
  return request({
    url: '/ai/role/template/list',
    method: 'GET'
  })
}

/**
 * 查询角色模板详情
 * @param {number} templateId 模板ID
 * @returns {Promise}
 */
export const getRoleTemplateDetail = (templateId) => {
  return request({
    url: `/ai/role/template/${templateId}`,
    method: 'GET'
  })
}

/**
 * 创建角色会话
 * @param {Object} data 请求体
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const createRoleSession = (data, userId) => {
  const config = {
    url: '/ai/role/session/create',
    method: 'POST',
    data
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}
