import request from '@/api/http'

/**
 * 分页查询圈子后台列表。
 * @param {object} params 查询参数
 * @returns {Promise<any>}
 */
export function getCircleAdminPage(params) {
  return request({
    url: '/share/circle/admin/selectPage',
    method: 'get',
    params
  })
}

/**
 * 查询圈子后台详情。
 * @param {number|string} id 圈子 ID
 * @returns {Promise<any>}
 */
export function getCircleAdminDetail(id) {
  return request({
    url: `/share/circle/admin/queryById/${id}`,
    method: 'get'
  })
}

/**
 * 新增圈子。
 * @param {object} data 圈子数据
 * @returns {Promise<any>}
 */
export function addCircleAdmin(data) {
  return request({
    url: '/share/circle/admin/add',
    method: 'post',
    data
  })
}

/**
 * 更新圈子。
 * @param {number|string} id 圈子 ID
 * @param {object} data 圈子数据
 * @returns {Promise<any>}
 */
export function updateCircleAdmin(id, data) {
  return request({
    url: `/share/circle/admin/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除圈子。
 * @param {number|string} id 圈子 ID
 * @returns {Promise<any>}
 */
export function deleteCircleAdmin(id) {
  return request({
    url: `/share/circle/admin/delete/${id}`,
    method: 'delete'
  })
}
