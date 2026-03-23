import request from '@/api/http'

/**
 * 创建练习会话
 * @param {Object} data 练习上下文
 */
export function startPracticeSession(data) {
  return request({
    url: '/practice/session/start',
    method: 'post',
    data
  })
}

/**
 * 提交练习答案
 * @param {Object} data 作答数据
 */
export function submitPracticeAnswer(data) {
  return request({
    url: '/practice/session/answer',
    method: 'post',
    data
  })
}

/**
 * 结束练习会话
 * @param {number} sessionId 会话ID
 */
export function finishPracticeSession(sessionId) {
  return request({
    url: `/practice/session/${sessionId}/finish`,
    method: 'post'
  })
}

/**
 * 获取练习记录汇总
 */
export function getPracticeSessionSummary() {
  return request({
    url: '/practice/session/summary',
    method: 'get'
  })
}

/**
 * 分页获取练习记录
 * @param {Object} params 查询参数
 */
export function getPracticeSessionPage(params) {
  return request({
    url: '/practice/session/page',
    method: 'get',
    params
  })
}

/**
 * 获取练习记录详情
 * @param {number} sessionId 会话ID
 */
export function getPracticeSessionDetail(sessionId) {
  return request({
    url: `/practice/session/${sessionId}`,
    method: 'get'
  })
}

/**
 * 导出练习记录
 * @param {Object} params 查询参数
 */
export function exportPracticeSessionHistory(params) {
  return request({
    url: '/practice/session/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
