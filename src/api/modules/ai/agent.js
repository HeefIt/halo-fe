import request from '@/api/http'

/**
 * 学习规划 Agent 相关 API
 */

/**
 * 创建学习规划 Agent 会话
 *
 * @param {Object} payload 创建参数
 * @param {number} userId 用户 ID
 * @returns {Promise}
 */
export const createLearningCoachSession = (payload = {}, userId) => {
  const config = {
    url: '/ai/agent/learning-coach/session/create',
    method: 'POST',
    data: payload
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

/**
 * 获取学习规划 Agent 会话列表
 *
 * @param {number} userId 用户 ID
 * @returns {Promise}
 */
export const getLearningCoachSessions = (userId) => {
  const config = {
    url: '/ai/agent/learning-coach/session/list',
    method: 'GET'
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

/**
 * 获取学习规划 Agent 单个会话详情
 *
 * @param {string} sessionId 会话 ID
 * @param {number} userId 用户 ID
 * @returns {Promise}
 */
export const getLearningCoachSession = (sessionId, userId) => {
  const config = {
    url: `/ai/agent/learning-coach/session/${sessionId}`,
    method: 'GET'
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

/**
 * 获取学习规划 Agent 能力说明
 *
 * @returns {Promise}
 */
export const getLearningCoachCapabilities = () => request({
  url: '/ai/agent/learning-coach/capabilities',
  method: 'GET'
})

/**
 * 执行学习规划 Agent 同步分析
 *
 * @param {Object} payload 执行参数
 * @param {number} userId 用户 ID
 * @returns {Promise}
 */
export const runLearningCoach = (payload, userId) => {
  const config = {
    url: '/ai/agent/learning-coach/run',
    method: 'POST',
    data: payload
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

/**
 * 执行学习规划 Agent 流式分析
 *
 * @param {Object} payload 执行参数
 * @param {number} userId 用户 ID
 * @param {Function} onEvent 流式事件回调
 * @param {Function} onError 错误回调
 * @param {Function} onComplete 结束回调
 * @returns {Promise}
 */
export const runLearningCoachStream = (payload, userId, onEvent, onError, onComplete) => {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }

    if (userId) {
      headers.userId = userId
    }

    fetch('/api/ai/agent/learning-coach/run/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              if (onComplete) onComplete()
              resolve()
              return
            }

            buffer += decoder.decode(value, { stream: true })
            const events = buffer.split('\n\n')
            buffer = events.pop()

            for (const event of events) {
              if (!event.startsWith('data:')) {
                continue
              }

              const dataLine = event.replace(/^data:\s*/, '')
              if (!dataLine.trim()) {
                continue
              }

              try {
                const parsed = JSON.parse(dataLine)
                if (onEvent) {
                  onEvent(parsed)
                }
              } catch (error) {
                console.error('解析学习规划 Agent SSE 数据失败:', error)
              }
            }

            readStream()
          }).catch(error => {
            if (onError) onError(error)
            reject(error)
          })
        }

        readStream()
      })
      .catch(error => {
        if (onError) onError(error)
        reject(error)
      })
  })
}
