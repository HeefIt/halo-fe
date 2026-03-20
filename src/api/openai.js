import request from './request'

/**
 * AI解析题目
 * @param {Object} data 题目信息
 * @param {String} data.subjectName 题目名称
 * @param {Integer} data.subjectType 题目类型 (1-单选, 2-多选, 3-判断, 4-简答)
 * @param {String} data.subjectParse 题目解析
 * @param {String} data.subjectAnswer 题目答案 (主要用于简答题)
 * @param {Array<SubjectAnswerDTO>} data.optionList 选择题的答案选项
 */
export function analyzeSubjectWithAI(data) {
  return request({
    url: '/ai/practice/analyze',
    method: 'post',
    data,
    timeout: 90000 // 设置90秒超时
  }).then((response) => {
    if (response.code === 200) {
      return response.data?.reply || ''
    }
    throw new Error(response.message || 'AI解析失败')
  })
}

/**
 * 流式AI解析题目
 * @param {Object} data 题目信息
 * @param {Object} callbacks 回调集合
 * @param {Function} callbacks.onStart 开始回调
 * @param {Function} callbacks.onChunk 增量输出回调
 * @param {Function} callbacks.onDone 完成回调
 * @param {Function} callbacks.onError 错误回调
 * @param {AbortSignal} callbacks.signal 中断信号
 */
export function analyzeSubjectWithAIStream(data, callbacks = {}) {
  const { onStart, onChunk, onDone, onError, signal } = callbacks
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  }

  const token = localStorage.getItem('halo_token')
  if (token) {
    headers.satoken = token
  }

  return fetch('/api/ai/practice/analyze/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    signal
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullContent = ''

    const processEvent = (rawEvent) => {
      const lines = rawEvent
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      const dataLine = lines.find((line) => line.startsWith('data:'))

      if (!dataLine) {
        return
      }

      const payload = JSON.parse(dataLine.replace(/^data:\s*/, ''))
      const eventType = payload.type

      if (eventType === 'start') {
        onStart?.(payload)
        return
      }

      if (eventType === 'chunk') {
        const content = payload.content || ''
        fullContent += content
        onChunk?.({
          content,
          fullContent,
          subjectId: payload.subjectId
        })
        return
      }

      if (eventType === 'done') {
        if (payload.fullContent) {
          fullContent = payload.fullContent
        }
        onDone?.({
          fullContent,
          subjectId: payload.subjectId
        })
        return
      }

      if (eventType === 'error') {
        const error = new Error(payload.content || 'AI解析失败')
        onError?.(error)
        throw error
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const event of events) {
        if (!event.trim()) {
          continue
        }
        processEvent(event)
      }
    }

    if (buffer.trim()) {
      processEvent(buffer)
    }
  }).catch((error) => {
    if (error.name !== 'AbortError') {
      onError?.(error)
    }
    throw error
  })
}

/**
 * 获取选项标签
 * @param {Integer} optionType 选项类型
 * @returns {String} 选项标签(A,B,C,D...)
 */
function getOptionLabel(optionType) {
  const labelMap = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F'
  }
  return labelMap[optionType] || ''
}
