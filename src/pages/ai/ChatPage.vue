<template>
  <div class="chatbot-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="chatbot-main">
      <AIToolHeader
        title="AI 对话"
        badge="工作台"
      />

      <section class="chatbot-workspace">
        <aside class="sessions-panel" :class="{ collapsed: isSidebarCollapsed }">
          <div class="panel-header">
            <button class="new-session-btn" @click="createNewSession">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

          <div v-if="!isSidebarCollapsed" class="panel-meta">
            <span>会话</span>
            <strong>{{ sessions.length }}</strong>
          </div>

          <div v-if="!isSidebarCollapsed" class="sessions-list">
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
                  <div v-if="!session.editingTitle" class="session-title" @dblclick.stop="startEditingTitle(session)">
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
                  <span>{{ formatTime(session.updatedAt) }}</span>
                  <span>{{ session.messages?.length || 0 }} 条消息</span>
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

        <section class="chat-stage">
          <div class="messages-area" ref="messagesContainer">
            <div v-if="currentMessages.length === 0 && !isLoading" class="empty-state">
              <div class="empty-orb"></div>
              <h2 class="empty-title">开始一场新对话</h2>
              <div class="quick-prompts">
                <button class="prompt-chip" @click="setQuickPrompt('帮我设计一个带缓存的用户查询接口')">接口设计</button>
                <button class="prompt-chip" @click="setQuickPrompt('怎么判断一个服务要不要拆分成微服务？')">架构判断</button>
                <button class="prompt-chip" @click="setQuickPrompt('把这段技术经历整理成一篇博客提纲')">内容沉淀</button>
              </div>
            </div>

            <div v-if="isLoading && currentMessages.length === 0" class="loading-state">
              <div class="loader"><span></span><span></span><span></span></div>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
                  </svg>
                </div>
              </div>
              <div class="message-body">
                <div class="typing-dots"><span></span><span></span><span></span></div>
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
                <label class="toggle-label">
                  <input type="checkbox" v-model="isStreamingMode" />
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">流式输出</span>
                </label>
                <div class="action-buttons">
                  <button class="clear-btn" @click="clearCurrentSession" :disabled="!currentSessionId || currentMessages.length === 0">清空</button>
                  <button class="send-btn" @click="handleSendMessage" :disabled="!inputMessage.trim() || isLoading">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p class="disclaimer">AI 结果适合用于辅助思考，请结合真实业务场景判断。</p>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { useThemeStore } from '@/stores/modules/theme'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as aiApi from '@/api/modules/ai/chat'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import AIToolHeader from './components/AIToolHeader.vue'

marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  breaks: true,
  gfm: true
})

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

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
  if (!currentSession.value.messages) currentSession.value.messages = []
  const messages = Array.isArray(currentSession.value.messages) ? currentSession.value.messages : []
  return [...messages].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
})

const toggleSidebar = () => { isSidebarCollapsed.value = !isSidebarCollapsed.value }

const loadSessions = async () => {
  try {
    const response = await aiApi.getUserSessions(userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value = (response.data || []).map(normalizeSession)
      sessions.value.forEach(session => session.messages.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)))
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
    const response = await aiApi.getSession(sessionId, userStore.userInfo?.id)
    if (response.code === 200) {
      currentSessionId.value = sessionId
      currentSession.value = normalizeSession(response.data)
      const sessionIndex = sessions.value.findIndex(s => s.sessionId === sessionId)
      if (sessionIndex !== -1) Object.assign(sessions.value[sessionIndex], normalizeSession(response.data))
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
        if (sessions.value.length > 0) await selectSession(sessions.value[0].sessionId)
        else {
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
  textareaRef.value?.focus()
}

const syncCurrentSessionToList = () => {
  if (!currentSession.value || !currentSessionId.value) return
  const sessionIndex = sessions.value.findIndex(s => s.sessionId === currentSessionId.value)
  if (sessionIndex !== -1) Object.assign(sessions.value[sessionIndex], normalizeSession(currentSession.value))
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
      if (sessionIndex !== -1) Object.assign(sessions.value[sessionIndex], updatedSession)
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
  const userMessage = { role: 'user', content: message, timestamp: new Date().toISOString() }

  if (!currentSession.value.messages) currentSession.value.messages = []
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
      currentSession.value.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      })
      currentSession.value.updatedAt = new Date().toISOString()
      syncCurrentSessionToList()
    }
    if (shouldGenerateTitle) autoGenerateSessionTitle(currentSessionId.value, message)
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
      let fullResponse = ''
      let hasAddedMessage = false

      aiApi.sendChatMessageStream(
        sessionId,
        content,
        userStore.userInfo?.id,
        (data) => {
          let replyContent = ''
          if (data && typeof data === 'object') replyContent = data.reply || data.fullReply || data.content || data.fullContent || data.message || ''
          else if (typeof data === 'string') replyContent = data
          if (!replyContent) return

          fullResponse += replyContent
          if (!currentSession.value.messages) currentSession.value.messages = []

          if (!hasAddedMessage) {
            currentSession.value.messages.push({
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date().toISOString()
            })
            hasAddedMessage = true
          } else {
            const lastIndex = currentSession.value.messages.length - 1
            if (lastIndex >= 0 && currentSession.value.messages[lastIndex].role === 'assistant') {
              currentSession.value.messages[lastIndex].content = fullResponse
            }
          }
          nextTick(scrollToBottom)
        },
        (error) => {
          console.error('AI流式请求错误:', error)
          reject(error)
        },
        () => {
          if (hasAddedMessage && currentSession.value.messages.length > 0) {
            const lastMessage = currentSession.value.messages[currentSession.value.messages.length - 1]
            if (lastMessage.role === 'assistant') lastMessage.content = fullResponse
          }
          resolve(fullResponse)
        }
      ).catch(error => {
        console.error('流式请求失败:', error)
        reject(error)
      })
    })
  }

  try {
    const response = await aiApi.sendChatMessage(sessionId, content, userStore.userInfo?.id)
    if (response.code === 200) return response.data.reply
    throw new Error(response.message || '请求失败')
  } catch (error) {
    console.error('AI请求错误:', error)
    return '抱歉，我遇到了一些问题，请稍后再试。'
  }
}

const formatMessage = (content) => content ? DOMPurify.sanitize(marked.parse(content)) : ''

const formatTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return new Date(date).toLocaleDateString()
}

const formatMessageTime = (timestamp) => new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

const getSessionDisplayTitle = (session) => {
  if (session?.title?.trim()) return session.title.trim()
  const firstUserMessage = session?.messages?.find(message => message.role === 'user' && message.content?.trim())
  if (firstUserMessage?.content) return firstUserMessage.content.trim().slice(0, 16)
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
        if (currentSessionId.value === session.sessionId && currentSession.value) Object.assign(currentSession.value, updatedSession)
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
    if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  })
}

onMounted(async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  try {
    await loadSessions()
    if (sessions.value.length === 0) await createNewSession()
    else await selectSession(sessions.value[0].sessionId)
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败: ' + error.message)
  }
})

watch([currentSessionId, sessions], () => {
  localStorage.setItem('ai_session_state', JSON.stringify({
    currentSessionId: currentSessionId.value,
    sessions: sessions.value.map(s => ({
      sessionId: s.sessionId,
      title: s.title,
      updatedAt: s.updatedAt,
      createdAt: s.createdAt
    }))
  }))
}, { deep: true })
</script>

<style scoped>
.chatbot-page {
  --ai-accent: var(--color-accent);
  --ai-accent-soft: var(--color-accent-light);
  --ai-accent-line: var(--color-accent-subtle);
  --ai-bg: var(--app-bg);
  --ai-surface: var(--internal-panel-bg);
  --ai-surface-alt: var(--internal-panel-bg-alt);
  --ai-muted: var(--internal-panel-bg-hover);
  --ai-border: var(--internal-panel-border);
  --ai-border-strong: var(--internal-panel-border-strong);
  --ai-text: var(--color-text);
  --ai-text-soft: var(--color-text-secondary);
  --ai-text-faint: var(--color-text-muted);
  --ai-chat-bg: rgba(255, 255, 255, 0.7);
  height: 100dvh;
  min-height: 100dvh;
  background: var(--ai-bg);
  overflow: hidden;
}

.chatbot-page.is-dark {
  --ai-chat-bg: rgba(9, 17, 29, 0.72);
}

.chatbot-main {
  max-width: 1380px;
  margin: 0 auto;
  padding: 10px 16px 12px;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
}

.chatbot-workspace {
  display: grid;
  grid-template-columns: 296px minmax(0, 1fr);
  min-height: 0;
  border: 1px solid var(--ai-border);
  border-radius: 16px;
  background: var(--ai-surface);
  overflow: hidden;
}

.sessions-panel {
  display: flex;
  flex-direction: column;
  background: var(--ai-surface-alt);
  border-right: 1px solid var(--ai-border);
  transition: width 0.2s ease, transform 0.2s ease;
}

.sessions-panel.collapsed {
  width: 76px;
}

.panel-header,
.panel-meta,
.input-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid var(--ai-border);
}

.panel-meta {
  justify-content: space-between;
  padding: 14px 16px 10px;
  color: var(--ai-text-faint);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.panel-meta strong {
  color: var(--ai-text);
  font-size: 13px;
}

.new-session-btn,
.toggle-btn,
.prompt-chip,
.clear-btn,
.send-btn,
.edit-btn,
.delete-btn {
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.new-session-btn,
.send-btn {
  border: 1px solid var(--ai-accent);
  background: var(--ai-accent);
  color: #fff;
}

.new-session-btn {
  flex: 1;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
}

.sessions-panel.collapsed .new-session-btn {
  padding: 0;
}

.toggle-btn,
.clear-btn,
.prompt-chip {
  border: 1px solid var(--ai-border);
  background: var(--ai-surface);
  color: var(--ai-text-soft);
}

.toggle-btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sessions-list,
.messages-area {
  overflow-y: auto;
  min-height: 0;
}

.sessions-list {
  flex: 1;
  padding: 8px;
}

.sessions-list::-webkit-scrollbar,
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.sessions-list::-webkit-scrollbar-thumb,
.messages-area::-webkit-scrollbar-thumb {
  background: var(--ai-border-strong);
  border-radius: 999px;
}

.session-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 12px;
}

.session-card + .session-card {
  margin-top: 4px;
}

.session-card:hover {
  background: var(--ai-surface);
  border-color: var(--ai-border);
}

.session-card.active {
  background: var(--ai-accent-soft);
  border-color: var(--ai-accent-line);
}

.session-icon,
.avatar,
.empty-orb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.session-icon {
  width: 34px;
  height: 34px;
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  background: var(--ai-surface);
  color: var(--ai-text-soft);
  flex-shrink: 0;
}

.session-card.active .session-icon {
  background: var(--ai-accent);
  border-color: var(--ai-accent);
  color: #fff;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.session-title {
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ai-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-input {
  width: 100%;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid var(--ai-accent-line);
  border-radius: 8px;
  background: var(--ai-surface);
  color: var(--ai-text);
  outline: none;
}

.session-meta,
.message-time,
.disclaimer {
  color: var(--ai-text-faint);
  font-size: 11px;
}

.session-meta {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.edit-btn,
.delete-btn {
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ai-text-faint);
  opacity: 0;
}

.session-card:hover .edit-btn,
.session-card:hover .delete-btn {
  opacity: 1;
}

.edit-btn:hover {
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
}

.delete-btn:hover {
  background: rgba(194, 59, 59, 0.08);
  color: var(--color-error);
}

.chat-stage {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--ai-chat-bg);
}

.messages-area {
  flex: 1;
  padding: 28px 28px 18px;
}

.empty-state,
.loading-state {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-orb {
  width: 78px;
  height: 78px;
  margin-bottom: 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.32), transparent 70%), var(--ai-accent);
}

.empty-title {
  color: var(--ai-text);
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.empty-desc {
  max-width: 560px;
  margin-top: 10px;
  color: var(--ai-text-soft);
  font-size: 15px;
  line-height: 1.7;
}

.quick-prompts {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 22px;
}

.prompt-chip {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.loader,
.typing-dots {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.loader {
  margin-bottom: 14px;
}

.loader span,
.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ai-accent);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loader span:nth-child(1),
.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loader span:nth-child(2),
.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.35; }
  40% { transform: scale(1); opacity: 1; }
}

.message {
  display: flex;
  gap: 14px;
  max-width: 920px;
  margin: 0 auto;
}

.message + .message {
  margin-top: 22px;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
}

.user-avatar {
  background: var(--ai-accent);
  color: #fff;
}

.ai-avatar {
  border: 1px solid var(--ai-border);
  background: var(--ai-surface);
  color: var(--ai-text);
}

.message-body {
  max-width: min(72%, 720px);
}

.message.user .message-body {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-content,
.typing-dots {
  border-radius: 14px;
}

.message-content {
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
}

.message.user .message-content {
  background: var(--ai-accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  border: 1px solid var(--ai-border);
  background: var(--ai-surface);
  color: var(--ai-text);
  border-bottom-left-radius: 4px;
}

.message-content :deep(pre) {
  margin: 12px 0;
  padding: 14px;
  border-radius: 10px;
  background: #111827;
  overflow-x: auto;
}

.message-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 13px;
}

.message-content :deep(p) {
  margin: 0 0 10px;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-content :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.message-time {
  margin-top: 7px;
}

.typing-dots {
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid var(--ai-border);
  background: var(--ai-surface);
  border-bottom-left-radius: 4px;
}

.input-area {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--ai-border);
  background: var(--ai-surface);
}

.input-wrapper {
  max-width: 920px;
  margin: 0 auto;
  border: 1px solid var(--ai-border);
  border-radius: 14px;
  background: var(--ai-surface-alt);
}

.input-wrapper:focus-within {
  border-color: var(--ai-accent-line);
  box-shadow: 0 0 0 3px var(--ai-accent-soft);
}

.input-wrapper textarea {
  width: 100%;
  min-height: 58px;
  padding: 16px 16px 10px;
  border: none;
  background: transparent;
  color: var(--ai-text);
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  font-family: inherit;
}

.input-wrapper textarea::placeholder {
  color: var(--ai-text-faint);
}

.input-actions {
  justify-content: space-between;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--ai-border);
}

.toggle-label,
.action-buttons {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  cursor: pointer;
}

.toggle-label input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: var(--ai-border-strong);
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s ease;
}

.toggle-label input:checked + .toggle-slider {
  background: var(--ai-accent);
}

.toggle-label input:checked + .toggle-slider::after {
  left: 18px;
}

.toggle-text {
  color: var(--ai-text-soft);
  font-size: 12px;
  font-weight: 600;
}

.clear-btn {
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
}

.send-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:disabled,
.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.disclaimer {
  margin-top: 10px;
  text-align: center;
}

@media (max-width: 1024px) {
  .chatbot-workspace {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .message-body {
    max-width: min(82%, 720px);
  }
}

@media (max-width: 768px) {
  .chatbot-main {
    padding: 8px 10px 10px;
  }

  .chatbot-workspace {
    min-height: auto;
    grid-template-columns: 1fr;
    position: relative;
  }

  .sessions-panel {
    position: absolute;
    inset: 0 auto 0 0;
    width: min(280px, 82vw);
    z-index: 20;
    box-shadow: var(--shadow-elevated);
  }

  .sessions-panel.collapsed {
    transform: translateX(-100%);
    width: min(280px, 82vw);
  }

  .messages-area {
    padding: 20px 14px 14px;
  }

  .message-body {
    max-width: 86%;
  }

  .input-area {
    padding: 12px;
  }

  .input-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: flex-end;
  }
}
</style>
