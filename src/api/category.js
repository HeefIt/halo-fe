import request from '@/api/request'

/**
 * 分页查询题目分类列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 当前页码，默认1
 * @param {number} params.pageSize - 每页记录数，默认10
 * @param {string} params.categoryName - 分类名称（模糊匹配）
 * @returns {Promise}
 */
export function getCategoryPage(params) {
  return request({
    url: '/subject/category/selectPage',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 10,
      ...params
    }
  })
}

/**
 * 获取所有题目分类列表
 * @returns {Promise}
 */
export function getCategoryList() {
  return request({
    url: '/subject/category/selectPage',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 999
    }
  })
}

/**
 * 根据分类ID获取子分类及其标签
 * @param {Object} data - 请求数据
 * @param {number} data.id - 分类ID
 * @returns {Promise}
 */
export function getCategoryAndLabel(data) {
  return request({
    url: '/subject/category/selectCategoryAndLabel',
    method: 'post',
    data
  })
}

/**
 * 新增分类
 * @param {Object} data - 分类数据
 * @param {string} data.categoryName - 分类名称
 * @param {number} data.categoryType - 分类类型
 * @param {string} data.imageUrl - 图标链接
 * @param {number} data.parentId - 父级ID
 * @returns {Promise}
 */
export function addCategory(data) {
  return request({
    url: '/subject/category/add',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 * @param {number} id - 分类ID
 * @param {Object} data - 分类数据
 * @param {string} data.categoryName - 分类名称
 * @param {number} data.categoryType - 分类类型
 * @param {string} data.imageUrl - 图标链接
 * @param {number} data.parentId - 父级ID
 * @returns {Promise}
 */
export function updateCategory(id, data) {
  return request({
    url: `/subject/category/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类
 * @param {number} id - 分类ID
 * @returns {Promise}
 */
export function deleteCategory(id) {
  return request({
    url: `/subject/category/delete/${id}`,
    method: 'delete'
  })
}