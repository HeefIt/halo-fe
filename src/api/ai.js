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

// 发送聊天消息 - 流式输出版本
export const sendChatMessageStream = (sessionId, content, userId, onMessage, onError, onComplete) => {
  return new Promise((resolve, reject) => {
    console.log('发送流式消息请求:', { sessionId, content, userId });

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
      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (onComplete) onComplete();
            resolve();
            return;
          }

          buffer += decoder.decode(value, { stream: true });

          // 处理每一行数据
          const lines = buffer.split('\n');
          buffer = lines.pop(); // 保留最后一行（可能不完整）

          for (const line of lines) {
            console.log('处理行数据:', line);
            if (line.startsWith('data: ')) {
              try {
                const data = line.slice(6); // 移除 'data: ' 前缀
                console.log('解析数据:', data);
                if (data.trim()) {
                  const parsed = JSON.parse(data);
                  console.log('解析后的对象:', parsed);
                  if (onMessage) {
                    onMessage(parsed);
                  }
                }
              } catch (e) {
                console.error('解析流数据错误:', e, '原始数据:', line);
                // 尝试直接传递原始数据
                if (onMessage) {
                  onMessage(data.trim());
                }
                if (onError) onError(e);
              }
            } else if (line.trim() && !line.startsWith(':')) {
              // 处理不带data:前缀的纯数据
              console.log('处理纯数据行:', line);
              try {
                const parsed = JSON.parse(line);
                if (onMessage) {
                  onMessage(parsed);
                }
              } catch (e) {
                // 如果不是JSON，直接传递字符串
                if (onMessage && line.trim()) {
                  onMessage(line.trim());
                }
              }
            }
          }

          readStream();
        }).catch(err => {
          console.error('读取流错误:', err);
          if (onError) onError(err);
          reject(err);
        });
      };

      readStream();
    })
    .catch(err => {
      console.error('请求流式数据错误:', err);
      if (onError) onError(err);
      reject(err);
    });
  });
}