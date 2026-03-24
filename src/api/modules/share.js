import request from '@/api/http'

const API_PREFIX = '/share'

export const shareApi = {
  getCircleList() {
    return request.get(`${API_PREFIX}/circle/list`)
  },

  getMomentPage(params) {
    return request.get(`${API_PREFIX}/moment/selectPage`, { params })
  },

  getMomentDetail(id) {
    return request.get(`${API_PREFIX}/moment/detail/${id}`)
  },

  createMoment(data) {
    return request.post(`${API_PREFIX}/moment/add`, data)
  },

  deleteMoment(id) {
    return request.delete(`${API_PREFIX}/moment/delete/${id}`)
  },

  getCommentList(momentId) {
    return request.get(`${API_PREFIX}/comment/list/${momentId}`)
  },

  addComment(data) {
    return request.post(`${API_PREFIX}/comment/add`, data)
  },

  deleteComment(id) {
    return request.delete(`${API_PREFIX}/comment/delete/${id}`)
  }
}

export default shareApi
