<template>
  <div class="chatbot-container">
    <aside class="sessions-panel" :class="{ collapsed: isSidebarCollapsed }">
      <div class="panel-header">
        <button class="new-session-btn" @click="createNewSession">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span v-if="!isSidebarCollapsed">新对话</span>
        </button>
        <button class="toggle-btn" @click="toggleSidebar">
          <svg v-if="isSidebarCollapsed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="sessions-list" v-if="!isSidebarCollapsed">
        <div
          v-for="session in sessions"
          :key="session.sessionId"
          class="session-card"
          :class="{ active: currentSessionId === session.sessionId }"
          @click="selectChat(session.sessionId)"
        >
          <div class="session-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="session-info">
            <div class="session-title-row">
              <div
                class="session-title"
                v-if="!session.editingTitle"
                @dblclick.stop="startEditingTitle(session)"
              >
                {{ getSessionDisplayTitle(session) }}
              </div>
              <input
                v-else
                v-model="session.tempTitle"
                class="title-input"
                autofocus
                @blur="finishEditingTitle(session)"
                @keyup.enter="finishEditingTitle(session)"
                @keyup.esc="cancelEditingTitle(session)"
              />
              <button
                v-if="!session.editingTitle"
                class="edit-btn"
                title="编辑标题"
                @click.stop="startEditingTitle(session)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                </svg>
              </button>
            </div>
            <div class="session-meta">
              <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
              <span class="session-count">{{ session.messages?.length || 0 }} 条消息</span>
            </div>
          </div>
          <button class="delete-btn" @click.stop="deleteChat(session.sessionId)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <main class="chat-main">
      <div class="messages-area" ref="messagesContainer">
        <div v-if="currentMessages.length === 0 && !isLoading" class="empty-state">
          <div class="empty-visual">
            <div class="ai-orb">
              <div class="orb-core"></div>
              <div class="orb-ring"></div>
              <div class="orb-ring delay"></div>
            </div>
          </div>
          <h2 class="empty-title">开始一场 AI 协作</h2>
          <p class="empty-desc">输入问题、需求或思路，AI 会帮你解释概念、拆解任务和整理答案</p>
          <div class="quick-prompts">
            <button class="prompt-chip" @click="setQuickPrompt('帮我设计一个带缓存的用户查询接口')">接口设计</button>
            <button class="prompt-chip" @click="setQuickPrompt('怎么判断一个服务要不要拆分成微服务？')">架构判断</button>
            <button class="prompt-chip" @click="setQuickPrompt('把这段技术经历整理成一篇博客提纲')">内容沉淀</button>
          </div>
        </div>

        <div v-if="isLoading && currentMessages.length === 0" class="loading-state">
          <div class="loader">
            <div class="loader-dot"></div>
            <div class="loader-dot"></div>
            <div class="loader-dot"></div>
          </div>
          <p>正在加载会话...</p>
        </div>

        <div
          v-for="(message, index) in currentMessages"
          :key="`${currentSessionId}-${index}`"
          class="message"
          :class="message.role"
        >
          <div class="message-avatar">
            <div v-if="message.role === 'user'" class="avatar user-avatar">
              {{ userStore.userName?.charAt(0) || 'U' }}
            </div>
            <div v-else class="avatar ai-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
                <circle cx="7.5" cy="14.5" r="1.5"></circle>
                <circle cx="16.5" cy="14.5" r="1.5"></circle>
              </svg>
            </div>
          </div>
          <div class="message-body">
            <div class="message-content" v-html="formatMessage(message.content || '')"></div>
            <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
          </div>
        </div>

        <div v-if="isLoading && currentMessages.length > 0" class="message assistant">
          <div class="message-avatar">
            <div class="avatar ai-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
              </svg>
            </div>
          </div>
          <div class="message-body">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <div class="input-wrapper">
          <textarea
            v-model="inputMessage"
            placeholder="输入你的问题、想法或需求..."
            @keydown.enter.prevent="handleSendMessage"
            :disabled="isLoading"
            rows="1"
            ref="textareaRef"
          ></textarea>
          <div class="input-actions">
            <div class="stream-toggle">
              <label class="toggle-label">
                <input type="checkbox" v-model="isStreamingMode" />
                <span class="toggle-slider"></span>
                <span class="toggle-text">流式输出</span>
              </label>
            </div>
            <div class="action-buttons">
              <button class="clear-btn" @click="clearCurrentSession" :disabled="!currentSessionId || currentMessages.length === 0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>清空</span>
              </button>
              <button class="send-btn" @click="handleSendMessage" :disabled="!inputMessage.trim() || isLoading">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <p class="disclaimer">AI 结果适合用于辅助思考，请结合实际场景自行判断</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as aiApi from '@/api/ai'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  breaks: true,
  gfm: true
})

const router = useRouter()
const userStore = useUserStore()

const isSidebarCollapsed = ref(false)
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
const textareaRef = ref(null)
const isStreamingMode = ref(true)

const sessions = ref([])
const currentSessionId = ref(null)
const currentSession = ref(null)

const normalizeSession = (session) => {
  const normalizedSession = session || {}
  return {
    ...normalizedSession,
    title: normalizedSession.title || '',
    titleSource: normalizedSession.titleSource || 'SYSTEM',
    editingTitle: false,
    tempTitle: normalizedSession.title || '',
    messages: Array.isArray(normalizedSession.messages) ? normalizedSession.messages : []
  }
}

const currentMessages = computed(() => {
  if (!currentSession.value) return []
  if (!currentSession.value.messages) {
    currentSession.value.messages = []
  }
  const messages = Array.isArray(currentSession.value.messages) ? currentSession.value.messages : []
  return [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime()
    const timeB = new Date(b.timestamp || 0).getTime()
    return timeA - timeB
  })
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const loadSessions = async () => {
  try {
    const response = await aiApi.getUserSessions(userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value = (response.data || []).map(normalizeSession)
      sessions.value.forEach(session => {
        session.messages.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime()
          const timeB = new Date(b.timestamp || 0).getTime()
          return timeA - timeB
        })
      })
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
    ElMessage.error('加载会话列表失败')
  }
}

const createNewSession = async () => {
  try {
    const response = await aiApi.createSession('', userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value.unshift(normalizeSession(response.data))
      await selectSession(response.data.sessionId)
      ElMessage.success('新会话创建成功')
    }
  } catch (error) {
    console.error('创建会话失败:', error)
    ElMessage.error('创建会话失败')
  }
}

const selectSession = async (sessionId) => {
  if (currentSessionId.value === sessionId) {
    await nextTick()
    scrollToBottom()
    return
  }

  try {
    isLoading.value = true
    if (currentSessionId.value && currentSession.value) {
      await saveCurrentSessionState()
    }

    const response = await aiApi.getSession(sessionId, userStore.userInfo?.id)
    if (response.code === 200) {
      currentSessionId.value = sessionId
      currentSession.value = normalizeSession(response.data)
      const sessionIndex = sessions.value.findIndex(s => s.sessionId === sessionId)
      if (sessionIndex !== -1) {
        Object.assign(sessions.value[sessionIndex], normalizeSession(response.data))
      }
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('加载会话详情失败:', error)
    ElMessage.error('加载会话详情失败')
  } finally {
    isLoading.value = false
  }
}

const deleteSession = async (sessionId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await aiApi.deleteSession(sessionId, userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value = sessions.value.filter(s => s.sessionId !== sessionId)
      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          await selectSession(sessions.value[0].sessionId)
        } else {
          currentSessionId.value = null
          currentSession.value = null
        }
      }
      ElMessage.success('会话已删除')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会话失败:', error)
      ElMessage.error('删除会话失败')
    }
  }
}

const clearCurrentSession = async () => {
  if (!currentSessionId.value) return
  try {
    await ElMessageBox.confirm('确定要清空当前会话的所有消息吗？', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await aiApi.clearSessionMessages(currentSessionId.value, userStore.userInfo?.id)
    if (response.code === 200) {
      currentSession.value.messages = []
      ElMessage.success('会话消息已清空')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空会话失败:', error)
      ElMessage.error('清空会话失败')
    }
  }
}

const selectChat = async (sessionId) => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  await selectSession(sessionId)
}

const deleteChat = async (sessionId) => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  await deleteSession(sessionId)
}

const setQuickPrompt = (prompt) => {
  inputMessage.value = prompt
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
}

const syncCurrentSessionToList = () => {
  if (!currentSession.value || !currentSessionId.value) return
  const sessionIndex = sessions.value.findIndex(s => s.sessionId === currentSessionId.value)
  if (sessionIndex !== -1) {
    Object.assign(sessions.value[sessionIndex], normalizeSession(currentSession.value))
  }
}

const buildDraftTitle = (message) => {
  const normalizedMessage = (message || '').replace(/\s+/g, ' ').trim()
  if (!normalizedMessage) return '新对话'
  return normalizedMessage.length > 14 ? `${normalizedMessage.slice(0, 14)}...` : normalizedMessage
}

const shouldAutoGenerateTitle = (session) => {
  if (!session || session.titleSource === 'MANUAL') return false
  const messages = Array.isArray(session.messages) ? session.messages : []
  return !messages.some(item => item.role === 'user' && item.content?.trim())
}

const autoGenerateSessionTitle = async (sessionId, question) => {
  try {
    const response = await aiApi.generateSessionTitle(sessionId, question, userStore.userInfo?.id)
    if (response.code === 200 && response.data) {
      const updatedSession = normalizeSession(response.data)
      const sessionIndex = sessions.value.findIndex(s => s.sessionId === sessionId)
      if (sessionIndex !== -1) {
        Object.assign(sessions.value[sessionIndex], updatedSession)
      }
      if (currentSessionId.value === sessionId && currentSession.value?.titleSource !== 'MANUAL') {
        Object.assign(currentSession.value, updatedSession)
      }
    }
  } catch (error) {
    console.error('自动生成会话标题失败:', error)
  }
}

const handleSendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return

  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  if (!currentSessionId.value) {
    await createNewSession()
    if (!currentSessionId.value) return
  }

  const shouldGenerateTitle = shouldAutoGenerateTitle(currentSession.value)

  const userMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  }

  if (!currentSession.value.messages) {
    currentSession.value.messages = []
  }
  currentSession.value.messages.push(userMessage)

  if (shouldGenerateTitle) {
    currentSession.value.title = buildDraftTitle(message)
    currentSession.value.titleSource = 'AUTO'
    syncCurrentSessionToList()
  }

  inputMessage.value = ''

  scrollToBottom()
  isLoading.value = true

  try {
    const response = await sendMessageToAI(currentSessionId.value, message)

    if (!isStreamingMode.value) {
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }
      currentSession.value.messages.push(assistantMessage)
      currentSession.value.updatedAt = new Date().toISOString()
      syncCurrentSessionToList()
    }

    await saveCurrentSessionState()

    if (shouldGenerateTitle) {
      autoGenerateSessionTitle(currentSessionId.value, message)
    }
  } catch (error) {
    ElMessage.error('发送消息失败: ' + error.message)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const sendMessageToAI = async (sessionId, content) => {
  if (isStreamingMode.value) {
    return new Promise((resolve, reject) => {
      let fullResponse = '';
      let hasAddedMessage = false;

      aiApi.sendChatMessageStream(
        sessionId,
        content,
        userStore.userInfo?.id,
        (data) => {
          let replyContent = '';
          if (data && typeof data === 'object') {
            replyContent = data.reply || data.fullReply || data.content || data.fullContent || data.message || '';
          } else if (typeof data === 'string') {
            replyContent = data;
          }

          if (replyContent) {
            fullResponse += replyContent;

            if (!currentSession.value.messages) {
              currentSession.value.messages = [];
            }

            if (!hasAddedMessage) {
              const assistantMessage = {
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date().toISOString()
              };
              currentSession.value.messages.push(assistantMessage);
              hasAddedMessage = true;
            } else {
              const lastMessageIndex = currentSession.value.messages.length - 1;
              if (lastMessageIndex >= 0 && currentSession.value.messages[lastMessageIndex].role === 'assistant') {
                currentSession.value.messages[lastMessageIndex].content = fullResponse;
              }
            }

            nextTick(() => {
              scrollToBottom();
            });
          }
        },
        (error) => {
          console.error('AI流式请求错误:', error);
          reject(error);
        },
        () => {
          if (hasAddedMessage && currentSession.value.messages.length > 0) {
            const lastMessage = currentSession.value.messages[currentSession.value.messages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = fullResponse;
            }
          }
          resolve(fullResponse);
        }
      ).catch(error => {
        console.error('流式请求失败:', error);
        reject(error);
      });
    });
  } else {
    try {
      const response = await aiApi.sendChatMessage(sessionId, content, userStore.userInfo?.id)
      if (response.code === 200) {
        return response.data.reply
      } else {
        throw new Error(response.message || '请求失败')
      }
    } catch (error) {
      console.error('AI请求错误:', error)
      return '抱歉，我遇到了一些问题，请稍后再试。'
    }
  }
}

const formatMessage = (content) => {
  if (!content) return ''
  return DOMPurify.sanitize(marked.parse(content))
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return new Date(date).toLocaleDateString()
  }
}

const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getSessionDisplayTitle = (session) => {
  if (session?.title?.trim()) {
    return session.title.trim()
  }

  const firstUserMessage = session?.messages?.find(message => message.role === 'user' && message.content?.trim())
  if (firstUserMessage?.content) {
    return firstUserMessage.content.trim().slice(0, 16)
  }

  return '新对话'
}

const startEditingTitle = (session) => {
  session.tempTitle = session.title || getSessionDisplayTitle(session)
  session.editingTitle = true
}

const finishEditingTitle = async (session) => {
  const newTitle = session.tempTitle?.trim()

  if (newTitle && newTitle !== session.title) {
    try {
      const response = await aiApi.updateSessionTitle(session.sessionId, newTitle, userStore.userInfo?.id)
      if (response.code === 200 && response.data) {
        const updatedSession = normalizeSession(response.data)
        Object.assign(session, updatedSession)

        if (currentSessionId.value === session.sessionId && currentSession.value) {
          Object.assign(currentSession.value, updatedSession)
        }

        ElMessage.success('标题更新成功')
      }
    } catch (error) {
      console.error('更新标题失败:', error)
      ElMessage.error('标题更新失败')
    }
  }

  session.editingTitle = false
}

const cancelEditingTitle = (session) => {
  session.tempTitle = session.title || ''
  session.editingTitle = false
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const saveCurrentSessionState = async () => {
  if (!currentSessionId.value || !currentSession.value) return

  try {
    const sessionData = {
      sessionId: currentSessionId.value,
      userId: userStore.userInfo?.id,
      title: currentSession.value.title,
      titleSource: currentSession.value.titleSource,
      messages: currentSession.value.messages || [],
      createdAt: currentSession.value.createdAt,
      updatedAt: new Date().toISOString()
    }

    await aiApi.updateSession(currentSessionId.value, sessionData, userStore.userInfo?.id)
  } catch (error) {
    console.error('保存会话状态失败:', error)
  }
}

onMounted(async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  try {
    await loadSessions()

    if (sessions.value.length === 0) {
      await createNewSession()
    } else {
      await selectSession(sessions.value[0].sessionId)
    }
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败: ' + error.message)
  }
})

watch([currentSessionId, sessions], () => {
  const data = {
    currentSessionId: currentSessionId.value,
    sessions: sessions.value.map(s => ({
      sessionId: s.sessionId,
      title: s.title,
      updatedAt: s.updatedAt,
      createdAt: s.createdAt
    }))
  }
  localStorage.setItem('ai_session_state', JSON.stringify(data))
}, { deep: true })
</script>

<style scoped>
.chatbot-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
  overflow: hidden;
  position: relative;
}

.chatbot-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.sessions-panel {
  width: 320px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.sessions-panel.collapsed {
  width: 72px;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 12px;
}

.new-session-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.new-session-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.toggle-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.sessions-list::-webkit-scrollbar {
  width: 4px;
}

.sessions-list::-webkit-scrollbar-track {
  background: transparent;
}

.sessions-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.session-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  position: relative;
}

.session-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.session-card.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
  border-color: rgba(99, 102, 241, 0.3);
}

.session-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
  color: #a5b4fc;
  flex-shrink: 0;
}

.session-card.active .session-icon {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.session-info {
  flex: 1;
  margin-left: 12px;
  overflow: hidden;
}

.session-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.5);
  border-radius: 6px;
  padding: 4px 8px;
  color: white;
  font-size: 14px;
  outline: none;
}

.edit-btn {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.34);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.session-card:hover .edit-btn {
  opacity: 1;
}

.edit-btn:hover {
  background: rgba(99, 102, 241, 0.16);
  color: #c4b5fd;
}

.session-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.session-time,
.session-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.session-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 5;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.empty-visual {
  margin-bottom: 32px;
}

.ai-orb {
  width: 120px;
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-core {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.orb-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  animation: ring-pulse 3s ease-in-out infinite;
}

.orb-ring.delay {
  width: 100px;
  height: 100px;
  animation-delay: 0.5s;
  border-color: rgba(139, 92, 246, 0.2);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.2; }
}

.empty-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.empty-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 32px;
}

.quick-prompts {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.prompt-chip {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prompt-chip:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
  color: white;
  transform: translateY(-2px);
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}

.loader {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.loader-dot {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loader-dot:nth-child(1) { animation-delay: -0.32s; }
.loader-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.message {
  display: flex;
  gap: 16px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 600;
}

.user-avatar {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  color: white;
  font-size: 16px;
}

.ai-avatar {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.message-body {
  flex: 1;
  max-width: 70%;
}

.message.user .message-body {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-content {
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.7;
  word-wrap: break-word;
}

.message.user .message-content {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-bottom-left-radius: 4px;
}

.message-content :deep(pre) {
  background: #1e1e2e;
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-content :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
}

.message-content :deep(p) {
  margin: 0 0 12px 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.message-content :deep(li) {
  margin: 4px 0;
}

.message-content :deep(a) {
  color: #a5b4fc;
  text-decoration: none;
}

.message-content :deep(a:hover) {
  text-decoration: underline;
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 8px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: rgba(99, 102, 241, 0.6);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.input-area {
  padding: 24px 32px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.input-wrapper {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 4px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-wrapper textarea {
  width: 100%;
  background: transparent;
  border: none;
  padding: 14px 16px;
  color: white;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
}

.input-wrapper textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.stream-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-label input {
  display: none;
}

.toggle-slider {
  width: 36px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.toggle-label input:checked + .toggle-slider {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.toggle-label input:checked + .toggle-slider::after {
  left: 18px;
}

.toggle-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: #f87171;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.disclaimer {
  text-align: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 12px;
}

@media (max-width: 768px) {
  .sessions-panel {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
  }

  .sessions-panel:not(.collapsed) {
    transform: translateX(0);
  }

  .message-body {
    max-width: 85%;
  }
}
</style>
