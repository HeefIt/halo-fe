import request from '@/api/request'

/**
 * 分页查询题目标签列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 当前页码，默认1
 * @param {number} params.pageSize - 每页记录数，默认10
 * @param {string} params.labelName - 标签名称（模糊匹配）
 * @param {number} params.sortNum - 排序号（精确匹配）
 * @param {string} params.categoryId - 分类ID（精确匹配）
 * @returns {Promise}
 */
export function getLabelPage(params) {
  return request({
    url: '/subject/label/selectPage',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 10,
      ...params
    }
  })
}

/**
 * 获取所有题目标签列表
 * @returns {Promise}
 */
export function getLabelList() {
  return request({
    url: '/subject/label/selectPage',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 999
    }
  })
}

/**
 * 新增题目标签
 * @param {Object} data - 标签数据
 * @param {string} data.labelName - 标签名称
 * @param {number} data.sortNum - 排序号
 * @param {string} data.categoryId - 分类ID
 * @returns {Promise}
 */
export function addLabel(data) {
  return request({
    url: '/subject/label/add',
    method: 'post',
    data
  })
}

/**
 * 更新题目标签
 * @param {number} id - 标签ID
 * @param {Object} data - 标签数据
 * @param {string} data.labelName - 标签名称
 * @param {number} data.sortNum - 排序号
 * @param {string} data.categoryId - 分类ID
 * @returns {Promise}
 */
export function updateLabel(id, data) {
  return request({
    url: `/subject/label/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除题目标签
 * @param {number} id - 标签ID
 * @returns {Promise}
 */
export function deleteLabel(id) {
  return request({
    url: `/subject/label/delete/${id}`,
    method: 'delete'
  })
}