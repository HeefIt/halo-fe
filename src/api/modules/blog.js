import request from '@/api/http'

const API_PREFIX = '/blog'

const isSuccessResult = (response) => response?.success === true && response?.code === 200

const buildBusinessError = (response, fallbackMessage) => {
  const error = new Error(response?.message || fallbackMessage)
  error.response = { data: response }
  return error
}

const ensureBlogResult = async (promise, options = {}) => {
  const { fallbackMessage = '请求失败', requireTruthyData = false } = options
  const response = await promise

  if (!isSuccessResult(response)) {
    throw buildBusinessError(response, fallbackMessage)
  }

  if (requireTruthyData && response?.data !== true) {
    throw buildBusinessError(response, fallbackMessage)
  }

  return response
}

export const blogApi = {
  getCategoryList() {
    return ensureBlogResult(request.get(`${API_PREFIX}/category/all`), { fallbackMessage: '获取分类列表失败' })
  },

  getCategoryTree() {
    return ensureBlogResult(request.get(`${API_PREFIX}/category/tree`), { fallbackMessage: '获取分类树失败' })
  },

  getCategoryPage(params) {
    return ensureBlogResult(request.get(`${API_PREFIX}/category/selectPage`, { params }), { fallbackMessage: '获取分类分页失败' })
  },

  addCategory(data) {
    return ensureBlogResult(request.post(`${API_PREFIX}/category/add`, data), { fallbackMessage: '新增分类失败', requireTruthyData: true })
  },

  updateCategory(id, data) {
    return ensureBlogResult(request.put(`${API_PREFIX}/category/update/${id}`, data), { fallbackMessage: '更新分类失败', requireTruthyData: true })
  },

  deleteCategory(id) {
    return ensureBlogResult(request.delete(`${API_PREFIX}/category/delete/${id}`), { fallbackMessage: '删除分类失败', requireTruthyData: true })
  },

  getTagList() {
    return ensureBlogResult(request.get(`${API_PREFIX}/tag/all`), { fallbackMessage: '获取标签列表失败' })
  },

  getTagPage(params) {
    return ensureBlogResult(request.get(`${API_PREFIX}/tag/selectPage`, { params }), { fallbackMessage: '获取标签分页失败' })
  },

  addTag(data) {
    return ensureBlogResult(request.post(`${API_PREFIX}/tag/add`, data), { fallbackMessage: '新增标签失败', requireTruthyData: true })
  },

  updateTag(id, data) {
    return ensureBlogResult(request.put(`${API_PREFIX}/tag/update/${id}`, data), { fallbackMessage: '更新标签失败', requireTruthyData: true })
  },

  deleteTag(id) {
    return ensureBlogResult(request.delete(`${API_PREFIX}/tag/delete/${id}`), { fallbackMessage: '删除标签失败', requireTruthyData: true })
  },

  getArticlePage(params) {
    return ensureBlogResult(request.get(`${API_PREFIX}/article/selectPageForUser`, { params }), { fallbackMessage: '获取文章列表失败' })
  },

  getArticlePageAdmin(params) {
    return ensureBlogResult(request.get(`${API_PREFIX}/article/selectPage`, { params }), { fallbackMessage: '获取后台文章列表失败' })
  },

  getArticleDetail(id) {
    return ensureBlogResult(request.get(`${API_PREFIX}/article/detail/${id}`), { fallbackMessage: '获取文章详情失败' })
  },

  addArticle(data) {
    return ensureBlogResult(request.post(`${API_PREFIX}/article/add`, data), { fallbackMessage: '发布文章失败', requireTruthyData: true })
  },

  updateArticle(id, data) {
    return ensureBlogResult(request.post(`${API_PREFIX}/article/update/${id}`, data), { fallbackMessage: '更新文章失败', requireTruthyData: true })
  },

  deleteArticle(id) {
    return ensureBlogResult(request.delete(`${API_PREFIX}/article/delete/${id}`), { fallbackMessage: '删除文章失败', requireTruthyData: true })
  },

  getHotArticles(limit = 10) {
    return ensureBlogResult(request.get(`${API_PREFIX}/article/hot`, { params: { limit } }), { fallbackMessage: '获取热门文章失败' })
  },

  getLatestArticles(limit = 10) {
    return ensureBlogResult(request.get(`${API_PREFIX}/article/latest`, { params: { limit } }), { fallbackMessage: '获取最新文章失败' })
  },

  getArticlesByCategory(categoryId, params) {
    return ensureBlogResult(request.get(`${API_PREFIX}/article/byCategory/${categoryId}`, { params }), { fallbackMessage: '按分类获取文章失败' })
  },

  getArticlesByTag(tagId, params) {
    return ensureBlogResult(request.get(`${API_PREFIX}/article/byTag/${tagId}`, { params }), { fallbackMessage: '按标签获取文章失败' })
  },

  likeArticle(articleId) {
    return ensureBlogResult(request.post(`${API_PREFIX}/article/like/${articleId}`), { fallbackMessage: '点赞失败', requireTruthyData: true })
  },

  unlikeArticle(articleId) {
    return ensureBlogResult(request.post(`${API_PREFIX}/article/like/unlike/${articleId}`), { fallbackMessage: '取消点赞失败', requireTruthyData: true })
  },

  isLiked(articleId) {
    return ensureBlogResult(request.get(`${API_PREFIX}/article/like/isLiked/${articleId}`), { fallbackMessage: '获取点赞状态失败' })
  },

  getCommentPage(articleId, params) {
    return ensureBlogResult(request.get(`${API_PREFIX}/comment/selectPage/${articleId}`, { params }), { fallbackMessage: '获取评论列表失败' })
  },

  addComment(data) {
    return ensureBlogResult(request.post(`${API_PREFIX}/comment/add`, data), { fallbackMessage: '评论失败', requireTruthyData: true })
  },

  deleteComment(id) {
    return ensureBlogResult(request.delete(`${API_PREFIX}/comment/delete/${id}`), { fallbackMessage: '删除评论失败', requireTruthyData: true })
  },

  recordViewLog(articleId) {
    return request.post(`${API_PREFIX}/viewLog/record/${articleId}`)
  },

  getAdminStatisticsOverview() {
    return ensureBlogResult(request.get(`${API_PREFIX}/admin/statistics/overview`), { fallbackMessage: '获取博客统计概览失败' })
  },

  getAdminStatisticsTrend(days = 7) {
    return ensureBlogResult(request.get(`${API_PREFIX}/admin/statistics/trend`, { params: { days } }), { fallbackMessage: '获取博客趋势失败' })
  },

  getAdminTopArticles(limit = 5) {
    return ensureBlogResult(request.get(`${API_PREFIX}/admin/statistics/topArticles`, { params: { limit } }), { fallbackMessage: '获取热门文章榜单失败' })
  },

  getAdminActionSummary(days = 7) {
    return ensureBlogResult(request.get(`${API_PREFIX}/admin/statistics/actionSummary`, { params: { days } }), { fallbackMessage: '获取博客行为汇总失败' })
  },

  getAdminActionTrend(days = 7) {
    return ensureBlogResult(request.get(`${API_PREFIX}/admin/statistics/actionTrend`, { params: { days } }), { fallbackMessage: '获取博客行为趋势失败' })
  },

  getAdminRecentActions(limit = 8) {
    return ensureBlogResult(request.get(`${API_PREFIX}/admin/statistics/recentActions`, { params: { limit } }), { fallbackMessage: '获取最近博客操作失败' })
  }
}

export default blogApi
