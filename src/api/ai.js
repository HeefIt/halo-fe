import request from './request'

/**
 * AI会话相关API
 */

/**
 * 智能客服相关API
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

/**
 * 发送聊天消息 - 修改为支持sessionId
 * @param {string} sessionId - 会话ID
 * @param {string} content - 消息内容
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export const sendChatMessage = (sessionId, content, userId) => {
  const config = {
    url: '/ai/chat',
    method: 'POST',
    data: {
      sessionID: sessionId,  // 必须传递sessionID（与后端字段名保持一致）
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    }
  }

  if (userId) {
    config.headers = { 'userId': userId }
  }

  console.log('发送消息请求:', { sessionId, content, userId })
  return request(config)
}

// 发送聊天消息 - 标准SSE流式输出版本（修复重复内容问题）
// 使用标准SSE解析逻辑，按"\n\n"分割完整事件
// 修复：每次只发送增量内容，避免重复累积
export const sendChatMessageStream = (sessionId, content, userId, onMessage, onError, onComplete) => {
  return new Promise((resolve, reject) => {
    console.log('发送标准SSE流式消息请求:', { sessionId, content, userId });

    const requestBody = {
      sessionID: sessionId,
      messages: [{
        role: 'user',
        content: content
      }]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    };

    if (userId) {
      headers['userId'] = userId;
    }

    fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8'); // 明确指定UTF-8编码
      let buffer = '';
      let accumulatedReply = ''; // 累积完整的回复内容
      let lastSentLength = 0; // 记录上次发送的内容长度

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            // 流结束时发送最后一次累积的内容（只发送新增部分）
            if (accumulatedReply.length > lastSentLength && onMessage) {
              const newContent = accumulatedReply.substring(lastSentLength);
              onMessage({
                reply: newContent,  // 只发送新增内容
                fullReply: accumulatedReply,  // 完整内容供参考
                sessionId: sessionId
              });
            }
            if (onComplete) onComplete();
            resolve();
            return;
          }

          // 使用UTF-8解码器处理字节流
          buffer += decoder.decode(value, { stream: true });

          // 按SSE标准：使用"\n\n"分割完整事件
          const events = buffer.split('\n\n');
          buffer = events.pop(); // 保留最后一个可能不完整的事件

          // 处理完整的事件
          for (const event of events) {
            if (event.startsWith('data:')) {
              try {
                // 提取data字段内容
                const dataLine = event.replace(/^data:\s*/, '');
                if (dataLine.trim()) {
                  // 解析JSON数据
                  const parsed = JSON.parse(dataLine);
                  console.log('解析SSE数据:', parsed);
                  
                  // 累积回复内容
                  if (parsed.reply) {
                    accumulatedReply += parsed.reply;
                    
                    // 只有当内容有新增时才触发回调
                    if (accumulatedReply.length > lastSentLength) {
                      const newContent = accumulatedReply.substring(lastSentLength);
                      lastSentLength = accumulatedReply.length;
                      
                      if (onMessage) {
                        onMessage({
                          reply: newContent,  // 只发送新增内容
                          fullReply: accumulatedReply,  // 完整内容供参考
                          sessionId: sessionId
                        });
                      }
                    }
                  } else if (parsed.content) {
                    accumulatedReply += parsed.content;
                    
                    if (accumulatedReply.length > lastSentLength) {
                      const newContent = accumulatedReply.substring(lastSentLength);
                      lastSentLength = accumulatedReply.length;
                      
                      if (onMessage) {
                        onMessage({
                          content: newContent,
                          fullContent: accumulatedReply,
                          sessionId: sessionId
                        });
                      }
                    }
                  }
                }
              } catch (e) {
                console.error('SSE数据解析错误:', e, '原始数据:', event);
                if (onError) onError(e);
              }
            }
            // 忽略其他类型的SSE字段（如event:, id:, retry:等）
          }

          readStream();
        }).catch(err => {
          console.error('读取SSE流错误:', err);
          if (onError) onError(err);
          reject(err);
        });
      };

      readStream();
    })
    .catch(err => {
      console.error('请求SSE流式数据错误:', err);
      if (onError) onError(err);
      reject(err);
    });
  });
}

/**
 * 智能客服相关API
 */

// 智能客服问答
export const customerServiceChat = (content, userId) => {
  const config = {
    url: '/ai/customer/chat',
    method: 'POST',
    data: {
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    }
  }

  if (userId) {
    config.headers = { 'userId': userId }
  }

  console.log('发送智能客服消息请求:', { content, userId })
  return request(config)
}

// 智能客服问答 - 标准SSE流式输出版本（修复重复内容问题）
// 使用标准SSE解析逻辑，统一处理方式
// 修复：每次只发送增量内容，避免重复累积
export const customerServiceChatStream = (content, userId, onMessage, onError, onComplete) => {
  return new Promise((resolve, reject) => {
    console.log('发送标准SSE客服流式消息请求:', { content, userId });

    const requestBody = {
      messages: [{
        role: 'user',
        content: content
      }]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    };

    if (userId) {
      headers['userId'] = userId;
    }

    fetch('/api/ai/customer/chat/stream', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8'); // 明确指定UTF-8编码
      let buffer = '';
      let accumulatedReply = ''; // 累积完整的回复内容
      let lastSentLength = 0; // 记录上次发送的内容长度

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            // 流结束时发送最后一次累积的内容（只发送新增部分）
            if (accumulatedReply.length > lastSentLength && onMessage) {
              const newContent = accumulatedReply.substring(lastSentLength);
              onMessage({
                reply: newContent,  // 只发送新增内容
                fullReply: accumulatedReply  // 完整内容供参考
              });
            }
            if (onComplete) onComplete();
            resolve();
            return;
          }

          // 使用UTF-8解码器处理字节流
          buffer += decoder.decode(value, { stream: true });

          // 按SSE标准：使用"\n\n"分割完整事件
          const events = buffer.split('\n\n');
          buffer = events.pop(); // 保留最后一个可能不完整的事件

          // 处理完整的事件
          for (const event of events) {
            if (event.startsWith('data:')) {
              try {
                // 提取data字段内容
                const dataLine = event.replace(/^data:\s*/, '');
                if (dataLine.trim()) {
                  // 解析JSON数据
                  const parsed = JSON.parse(dataLine);
                  console.log('解析客服SSE数据:', parsed);
                  
                  // 累积回复内容
                  if (parsed.reply) {
                    accumulatedReply += parsed.reply;
                    
                    // 只有当内容有新增时才触发回调
                    if (accumulatedReply.length > lastSentLength) {
                      const newContent = accumulatedReply.substring(lastSentLength);
                      lastSentLength = accumulatedReply.length;
                      
                      if (onMessage) {
                        onMessage({
                          reply: newContent,  // 只发送新增内容
                          fullReply: accumulatedReply  // 完整内容供参考
                        });
                      }
                    }
                  } else if (parsed.content) {
                    accumulatedReply += parsed.content;
                    
                    if (accumulatedReply.length > lastSentLength) {
                      const newContent = accumulatedReply.substring(lastSentLength);
                      lastSentLength = accumulatedReply.length;
                      
                      if (onMessage) {
                        onMessage({
                          content: newContent,
                          fullContent: accumulatedReply
                        });
                      }
                    }
                  }
                }
              } catch (e) {
                console.error('客服SSE数据解析错误:', e, '原始数据:', event);
                if (onError) onError(e);
              }
            }
            // 忽略其他类型的SSE字段
          }

          readStream();
        }).catch(err => {
          console.error('读取客服SSE流错误:', err);
          if (onError) onError(err);
          reject(err);
        });
      };

      readStream();
    })
    .catch(err => {
      console.error('请求客服SSE流式数据错误:', err);
      if (onError) onError(err);
      reject(err);
    });
  });
}