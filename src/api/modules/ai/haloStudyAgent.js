import request from '@/api/http'

/**
 * Halo 学习搭子 Agent 相关 API。
 */

export const createHaloStudySession = (payload = {}, userId) => {
  const config = {
    url: '/ai/agent/halo-study/session/create',
    method: 'POST',
    data: payload
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

export const getHaloStudySessions = (userId) => {
  const config = {
    url: '/ai/agent/halo-study/session/list',
    method: 'GET'
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

export const getHaloStudySession = (sessionId, userId) => {
  const config = {
    url: `/ai/agent/halo-study/session/${sessionId}`,
    method: 'GET'
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

export const getHaloStudyCapabilities = () => request({
  url: '/ai/agent/halo-study/capabilities',
  method: 'GET'
})

export const runHaloStudy = (payload, userId) => {
  const config = {
    url: '/ai/agent/halo-study/run',
    method: 'POST',
    data: payload
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

export const getHaloStudyRunSteps = (runId, userId) => {
  const config = {
    url: `/ai/agent/halo-study/run/${runId}/steps`,
    method: 'GET'
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

export const runHaloStudyStream = (payload, userId, onEvent, onError, onComplete) => {
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

    fetch('/api/ai/agent/halo-study/run/stream', {
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
                console.error('解析 Halo 学习搭子 SSE 数据失败:', error)
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

export const updateHaloStudySessionTitle = (sessionId, title, userId) => {
  const config = {
    url: `/ai/agent/halo-study/session/${sessionId}/title`,
    method: 'PATCH',
    data: { title }
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}

export const deleteHaloStudySession = (sessionId, userId) => {
  const config = {
    url: `/ai/agent/halo-study/session/${sessionId}`,
    method: 'DELETE'
  }

  if (userId) {
    config.headers = { userId }
  }

  return request(config)
}
