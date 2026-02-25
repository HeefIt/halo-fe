import request from './request'

/**
 * AI会话相关API
 */

// 创建新会话
export const createSession = (title, userId) => {
  const config = {
    url: '/ai/session/create',
    method: 'POST'
  }
  
  if (title) {
    config.params = { title }
  }
  
  if (userId) {
    config.headers = { 'userId': userId }
  }
  
  return request(config)
}

// 获取用户会话列表
export const getUserSessions = (userId) => {
  const config = {
    url: '/ai/session/list',
    method: 'GET'
  }
  
  if (userId) {
    config.headers = { 'userId': userId }
  }
  
  return request(config)
}

// 获取会话详情
export const getSession = (sessionId, userId) => {
  const config = {
    url: `/ai/session/${sessionId}`,
    method: 'GET'
  }
  
  if (userId) {
    config.headers = { 'userId': userId }
  }
  
  return request(config)
}

// 删除会话
export const deleteSession = (sessionId, userId) => {
  const config = {
    url: `/ai/session/${sessionId}`,
    method: 'DELETE'
  }
  
  if (userId) {
    config.headers = { 'userId': userId }
  }
  
  return request(config)
}

// 清空会话消息
export const clearSessionMessages = (sessionId, userId) => {
  const config = {
    url: `/ai/session/${sessionId}/clear`,
    method: 'POST'
  }
  
  if (userId) {
    config.headers = { 'userId': userId }
  }
  
  return request(config)
}

// 更新会话状态
export const updateSession = (sessionId, sessionData, userId) => {
  console.log('API调用updateSession:', { sessionId, userId, sessionData })
  
  const config = {
    url: `/ai/session/${sessionId}`,
    method: 'PUT',
    data: sessionData
  }
  
  if (userId) {
    config.headers = { 'userId': userId }
    console.log('设置请求头userId:', userId)
  } else {
    console.warn('userId为空，可能影响会话权限验证')
  }
  
  return request(config)
}

// 发送聊天消息
export const sendChatMessage = (messages, userId) => {
  const config = {
    url: '/ai/chat',
    method: 'POST',
    data: { messages }
  }
  
  if (userId) {
    config.headers = { 'userId': userId }
  }
  
  return request(config)
}