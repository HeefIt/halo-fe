import request from '@/api/http'

/**
 * 获取当前生效公告。
 * @param {number} scopeType 公告作用域
 * @returns {Promise<any>}
 */
export function getCurrentNotice(scopeType = 1) {
  return request({
    url: '/notice/current',
    method: 'get',
    params: { scopeType }
  })
}

/**
 * 获取当前需要弹窗的公告。
 * @param {number} scopeType 公告作用域
 * @returns {Promise<any>}
 */
export function getCurrentPopupNotice(scopeType = 1) {
  return request({
    url: '/notice/current/popup',
    method: 'get',
    params: { scopeType }
  })
}

/**
 * 今日关闭公告弹窗。
 * @param {number} id 公告ID
 * @returns {Promise<any>}
 */
export function closeNoticeForToday(id) {
  return request({
    url: `/notice/close/today/${id}`,
    method: 'post'
  })
}

/**
 * 关闭公告弹窗直到公告失效。
 * @param {number} id 公告ID
 * @returns {Promise<any>}
 */
export function closeNotice(id) {
  return request({
    url: `/notice/close/${id}`,
    method: 'post'
  })
}

/**
 * 分页查询公告列表。
 * @param {object} params 查询参数
 * @returns {Promise<any>}
 */
export function getNoticePage(params) {
  return request({
    url: '/notice/admin/selectPage',
    method: 'get',
    params
  })
}

/**
 * 查询公告详情。
 * @param {number} id 公告ID
 * @returns {Promise<any>}
 */
export function getNoticeDetail(id) {
  return request({
    url: `/notice/admin/queryById/${id}`,
    method: 'get'
  })
}

/**
 * 新增公告。
 * @param {object} data 公告数据
 * @returns {Promise<any>}
 */
export function addNotice(data) {
  return request({
    url: '/notice/admin/add',
    method: 'post',
    data
  })
}

/**
 * 更新公告。
 * @param {number} id 公告ID
 * @param {object} data 公告数据
 * @returns {Promise<any>}
 */
export function updateNotice(id, data) {
  return request({
    url: `/notice/admin/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 发布公告。
 * @param {number} id 公告ID
 * @returns {Promise<any>}
 */
export function publishNotice(id) {
  return request({
    url: `/notice/admin/publish/${id}`,
    method: 'post'
  })
}

/**
 * 下线公告。
 * @param {number} id 公告ID
 * @returns {Promise<any>}
 */
export function offlineNotice(id) {
  return request({
    url: `/notice/admin/offline/${id}`,
    method: 'post'
  })
}

/**
 * 删除公告。
 * @param {number} id 公告ID
 * @returns {Promise<any>}
 */
export function deleteNotice(id) {
  return request({
    url: `/notice/admin/delete/${id}`,
    method: 'delete'
  })
}
