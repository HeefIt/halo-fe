import request from './request'

const API_PREFIX = '/blog'

export const blogApi = {
  getCategoryList() {
    return request.get(`${API_PREFIX}/category/all`)
  },

  getCategoryTree() {
    return request.get(`${API_PREFIX}/category/tree`)
  },

  getCategoryPage(params) {
    return request.get(`${API_PREFIX}/category/selectPage`, { params })
  },

  addCategory(data) {
    return request.post(`${API_PREFIX}/category/add`, data)
  },

  updateCategory(id, data) {
    return request.put(`${API_PREFIX}/category/update/${id}`, data)
  },

  deleteCategory(id) {
    return request.delete(`${API_PREFIX}/category/delete/${id}`)
  },

  getTagList() {
    return request.get(`${API_PREFIX}/tag/all`)
  },

  getTagPage(params) {
    return request.get(`${API_PREFIX}/tag/selectPage`, { params })
  },

  addTag(data) {
    return request.post(`${API_PREFIX}/tag/add`, data)
  },

  updateTag(id, data) {
    return request.put(`${API_PREFIX}/tag/update/${id}`, data)
  },

  deleteTag(id) {
    return request.delete(`${API_PREFIX}/tag/delete/${id}`)
  },

  getArticlePage(params) {
    return request.get(`${API_PREFIX}/article/selectPageForUser`, { params })
  },

  getArticlePageAdmin(params) {
    return request.get(`${API_PREFIX}/article/selectPage`, { params })
  },

  getArticleDetail(id) {
    return request.get(`${API_PREFIX}/article/detail/${id}`)
  },

  addArticle(data) {
    return request.post(`${API_PREFIX}/article/add`, data)
  },

  updateArticle(id, data) {
    return request.post(`${API_PREFIX}/article/update/${id}`, data)
  },

  deleteArticle(id) {
    return request.delete(`${API_PREFIX}/article/delete/${id}`)
  },

  getHotArticles(limit = 10) {
    return request.get(`${API_PREFIX}/article/hot`, { params: { limit } })
  },

  getLatestArticles(limit = 10) {
    return request.get(`${API_PREFIX}/article/latest`, { params: { limit } })
  },

  getArticlesByCategory(categoryId, params) {
    return request.get(`${API_PREFIX}/article/byCategory/${categoryId}`, { params })
  },

  getArticlesByTag(tagId, params) {
    return request.get(`${API_PREFIX}/article/byTag/${tagId}`, { params })
  },

  likeArticle(articleId) {
    return request.post(`${API_PREFIX}/article/like/${articleId}`)
  },

  unlikeArticle(articleId) {
    return request.post(`${API_PREFIX}/article/unlike/${articleId}`)
  },

  isLiked(articleId) {
    return request.get(`${API_PREFIX}/article/isLiked/${articleId}`)
  },

  getCommentPage(articleId, params) {
    return request.get(`${API_PREFIX}/comment/selectPage/${articleId}`, { params })
  },

  addComment(data) {
    return request.post(`${API_PREFIX}/comment/add`, data)
  },

  deleteComment(id) {
    return request.delete(`${API_PREFIX}/comment/delete/${id}`)
  },

  recordViewLog(articleId) {
    return request.post(`${API_PREFIX}/viewLog/record/${articleId}`)
  },

  getAdminStatisticsOverview() {
    return request.get(`${API_PREFIX}/admin/statistics/overview`)
  },

  getAdminStatisticsTrend(days = 7) {
    return request.get(`${API_PREFIX}/admin/statistics/trend`, { params: { days } })
  },

  getAdminTopArticles(limit = 5) {
    return request.get(`${API_PREFIX}/admin/statistics/topArticles`, { params: { limit } })
  },

  getAdminActionSummary(days = 7) {
    return request.get(`${API_PREFIX}/admin/statistics/actionSummary`, { params: { days } })
  },

  getAdminActionTrend(days = 7) {
    return request.get(`${API_PREFIX}/admin/statistics/actionTrend`, { params: { days } })
  },

  getAdminRecentActions(limit = 8) {
    return request.get(`${API_PREFIX}/admin/statistics/recentActions`, { params: { limit } })
  }
}

export default blogApi
