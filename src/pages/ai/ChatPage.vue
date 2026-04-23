<template>
  <div class="chatbot-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="chatbot-main">
      <AIToolHeader
        title="AI 对话"
        badge="智能对话"
      />

      <section class="chatbot-workspace">
        <aside class="sessions-panel" :class="{ collapsed: isSidebarCollapsed }">
          <div class="sessions-panel__top">
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
          </div>

          <div v-if="!isSidebarCollapsed" class="sessions-scroll">
            <div ref="sessionsListRef" class="sessions-list">
              <div
                v-for="session in sessions"
                :key="session.sessionId"
                :data-session-id="session.sessionId"
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
            <div class="sessions-fade-mask" aria-hidden="true"></div>
          </div>
        </aside>

        <section class="chat-stage">
          <div v-if="currentRoleMeta?.sceneType === 'ROLE_CHAT'" class="role-banner">
            <div class="role-banner__main">
              <span class="role-banner__avatar">{{ currentRoleMeta.roleAvatar || 'AI' }}</span>
              <div class="role-banner__copy">
                <strong>{{ currentRoleMeta.roleName || currentSession?.title || '角色会话' }}</strong>
                <span>{{ currentRoleMeta.roleCategory || 'role chat' }}</span>
              </div>
            </div>
            <div v-if="currentRoleVariables.length" class="role-banner__meta">
              <span
                v-for="[key, value] in currentRoleVariables"
                :key="key"
                class="role-banner__chip"
              >
                {{ key }}: {{ value }}
              </span>
            </div>
            <button class="role-banner__action" type="button" @click="router.push('/ai/role-chat')">
              换个角色
            </button>
          </div>

          <div class="messages-area" ref="messagesContainer" @scroll="handleMessagesScroll">
            <div v-if="currentMessages.length === 0 && !isLoading" class="empty-state">
              <div class="empty-orb"></div>
              <h2 class="empty-title">开始新对话</h2>
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
                <div class="message-content ai-markdown" v-html="formatMessage(message.content || '')"></div>
                <AIMessageActions
                  v-if="message.role === 'assistant' && !isLoading"
                  :content="message.content || ''"
                  :session-id="currentSessionId || ''"
                  :message-index="index"
                  @regenerate="handleRegenerate"
                />
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

          <button
            v-show="showScrollToBottom"
            class="scroll-bottom-btn"
            type="button"
            @click="scrollMessagesToBottom"
          >
            <span>回到底部</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

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
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { useThemeStore } from '@/stores/modules/theme'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as aiApi from '@/api/modules/ai/chat'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import AIToolHeader from './components/AIToolHeader.vue'
import AIMessageActions from './components/AIMessageActions.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

const isSidebarCollapsed = ref(false)
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
const textareaRef = ref(null)
const sessionsListRef = ref(null)
const isStreamingMode = ref(true)
const isUserNearBottom = ref(true)
const sessions = ref([])
const currentSessionId = ref(null)
const currentSession = ref(null)
const SCROLL_BOTTOM_THRESHOLD = 72

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

const currentRoleMeta = computed(() => parseSessionExt(currentSession.value?.extJson))

const currentRoleVariables = computed(() => {
  const variables = currentRoleMeta.value?.variables
  if (!variables || typeof variables !== 'object') {
    return []
  }

  return Object.entries(variables)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim())
    .slice(0, 4)
})

const showScrollToBottom = computed(() => currentMessages.value.length > 0 && !isUserNearBottom.value)

const toggleSidebar = () => { isSidebarCollapsed.value = !isSidebarCollapsed.value }

const parseSessionExt = (extJson) => {
  if (!extJson) {
    return null
  }

  try {
    return JSON.parse(extJson)
  } catch (error) {
    console.error('解析会话扩展信息失败:', error)
    return null
  }
}

const isRoleSession = (session) => {
  const sessionMeta = parseSessionExt(session?.extJson)
  return sessionMeta?.sceneType === 'ROLE_CHAT'
}

const getSessionActivityTime = (session) => {
  const updatedAt = session?.updatedAt ? new Date(session.updatedAt).getTime() : 0
  const createdAt = session?.createdAt ? new Date(session.createdAt).getTime() : 0
  const latestMessageTime = Array.isArray(session?.messages) && session.messages.length > 0
    ? new Date(session.messages[session.messages.length - 1]?.timestamp || 0).getTime()
    : 0

  const timestamp = Math.max(updatedAt || 0, createdAt || 0, latestMessageTime || 0)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortSessionsByRecent = () => {
  sessions.value = [...sessions.value].sort((left, right) => {
    const activityDiff = getSessionActivityTime(right) - getSessionActivityTime(left)
    if (activityDiff !== 0) {
      return activityDiff
    }

    return (right?.sessionId || '').localeCompare(left?.sessionId || '')
  })
}

const syncCurrentSessionState = ({ scrollIntoView = false } = {}) => {
  syncCurrentSessionToList()
  sortSessionsByRecent()

  if (scrollIntoView) {
    scrollActiveSessionIntoView()
  }
}

const isLearningCoachSession = (session) => {
  const extMeta = parseSessionExt(session?.extJson)
  return extMeta?.sceneType === 'AGENT_LEARNING_COACH'
}

const loadSessions = async () => {
  try {
    const response = await aiApi.getUserSessions(userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value = (response.data || [])
        .filter(session => !isLearningCoachSession(session))
        .map(normalizeSession)
      sessions.value.forEach(session => session.messages.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)))
      sortSessionsByRecent()
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
      sortSessionsByRecent()
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
    scrollToBottom({ force: true })
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
      sortSessionsByRecent()
      await nextTick()
      scrollActiveSessionIntoView()
      scrollToBottom({ force: true })
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
  if (isRoleSession(session)) return false
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
      sortSessionsByRecent()
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
  currentSession.value.updatedAt = userMessage.timestamp

  syncCurrentSessionState({ scrollIntoView: true })

  if (shouldGenerateTitle) {
    currentSession.value.title = buildDraftTitle(message)
    currentSession.value.titleSource = 'AUTO'
    syncCurrentSessionState({ scrollIntoView: true })
  }

  inputMessage.value = ''
  scrollToBottom({ force: true, behavior: 'smooth' })
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
      syncCurrentSessionState({ scrollIntoView: true })
    }
    if (shouldGenerateTitle) autoGenerateSessionTitle(currentSessionId.value, message)
  } catch (error) {
    ElMessage.error('发送消息失败: ' + error.message)
  } finally {
    isLoading.value = false
    scrollToBottom({ force: false })
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
          nextTick(() => scrollToBottom({ force: false }))
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
          currentSession.value.updatedAt = new Date().toISOString()
          syncCurrentSessionState({ scrollIntoView: true })
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

const formatMessage = (content) => renderAiMarkdown(content)

const handleRegenerate = async (messageIndex) => {
  if (isLoading.value || !currentSession.value?.messages) return

  const messages = currentSession.value.messages
  if (messageIndex <= 0 || messageIndex >= messages.length) return

  const userMessage = messages[messageIndex - 1]
  if (!userMessage || userMessage.role !== 'user' || !userMessage.content?.trim()) {
    ElMessage.warning('无法找到对应的用户消息')
    return
  }

  const userContent = userMessage.content.trim()
  messages.splice(messageIndex)
  currentSession.value.updatedAt = new Date().toISOString()
  syncCurrentSessionState({ scrollIntoView: true })

  isLoading.value = true
  scrollToBottom({ force: true, behavior: 'smooth' })

  try {
    const response = await sendMessageToAI(currentSessionId.value, userContent)
    if (!isStreamingMode.value) {
      currentSession.value.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      })
      currentSession.value.updatedAt = new Date().toISOString()
      syncCurrentSessionState({ scrollIntoView: true })
    }
  } catch (error) {
    ElMessage.error('重新生成失败: ' + error.message)
  } finally {
    isLoading.value = false
    scrollToBottom({ force: false })
  }
}

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
        sortSessionsByRecent()
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

const isMessagesNearBottom = () => {
  const container = messagesContainer.value
  if (!container) return true
  return container.scrollHeight - container.scrollTop - container.clientHeight <= SCROLL_BOTTOM_THRESHOLD
}

const handleMessagesScroll = () => {
  isUserNearBottom.value = isMessagesNearBottom()
}

const scrollToBottom = ({ force = false, behavior = 'auto' } = {}) => {
  nextTick(() => {
    const container = messagesContainer.value
    if (!container) return
    if (!force && !isUserNearBottom.value) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior
    })
    isUserNearBottom.value = true
  })
}

const scrollMessagesToBottom = () => {
  scrollToBottom({ force: true, behavior: 'smooth' })
}

const scrollActiveSessionIntoView = () => {
  nextTick(() => {
    const listElement = sessionsListRef.value
    if (!listElement || !currentSessionId.value) {
      return
    }

    const activeElement = listElement.querySelector(`[data-session-id="${currentSessionId.value}"]`)
    if (!activeElement) {
      return
    }

    activeElement.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth'
    })
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
    const preferredSessionId = typeof route.query.sessionId === 'string' ? route.query.sessionId : ''
    if (sessions.value.length === 0) await createNewSession()
    else if (preferredSessionId) await selectSession(preferredSessionId)
    else await selectSession(sessions.value[0].sessionId)
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败: ' + error.message)
  }
})

watch(() => route.query.sessionId, async (newSessionId) => {
  if (typeof newSessionId !== 'string' || !newSessionId || newSessionId === currentSessionId.value) {
    return
  }

  const exists = sessions.value.some(session => session.sessionId === newSessionId)
  if (!exists) {
    await loadSessions()
  }

  await selectSession(newSessionId)
})

watch(currentSessionId, () => {
  scrollActiveSessionIntoView()
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
  padding: 8px 14px 10px;
  height: 100dvh;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
}

.chatbot-workspace {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  border: 1px solid var(--ai-border);
  border-radius: 16px;
  background: var(--ai-surface);
  overflow: hidden;
}

.sessions-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--ai-surface-alt);
  border-right: 1px solid var(--ai-border);
  overflow: hidden;
  transition: width 0.2s ease, transform 0.2s ease;
}

.sessions-panel__top {
  position: sticky;
  top: 0;
  z-index: 2;
  background: linear-gradient(180deg, var(--ai-surface-alt) 0%, rgba(255, 255, 255, 0) 100%);
  backdrop-filter: blur(10px);
}

.chatbot-page.is-dark .sessions-panel__top {
  background: linear-gradient(180deg, rgba(13, 21, 34, 0.98) 0%, rgba(13, 21, 34, 0.78) 72%, rgba(13, 21, 34, 0) 100%);
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
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--ai-border);
}

.panel-meta {
  justify-content: space-between;
  padding: 12px 14px 8px;
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

.sessions-scroll {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.sessions-list {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  padding: 8px 8px 18px;
  overscroll-behavior: contain;
}

.sessions-fade-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.96) 100%);
}

.chatbot-page.is-dark .sessions-fade-mask {
  background: linear-gradient(180deg, rgba(13, 21, 34, 0) 0%, rgba(13, 21, 34, 0.96) 100%);
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
  min-width: 0;
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
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: var(--ai-chat-bg);
  overflow: hidden;
}

.role-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ai-border);
  background: linear-gradient(180deg, var(--ai-surface), var(--ai-surface-alt));
}

.role-banner__main,
.role-banner__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-banner__main {
  min-width: 0;
}

.role-banner__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
  font-size: 16px;
  font-weight: 700;
}

.role-banner__copy {
  display: grid;
  min-width: 0;
}

.role-banner__copy strong {
  color: var(--ai-text);
  font-size: 14px;
}

.role-banner__copy span {
  color: var(--ai-text-faint);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-banner__meta {
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.role-banner__chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
  font-size: 12px;
  font-weight: 700;
}

.role-banner__action {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--ai-border);
  background: var(--ai-surface);
  color: var(--ai-text);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.messages-area {
  flex: 1;
  min-height: 0;
  padding: 18px 20px 10px;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
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
  max-width: 1080px;
  margin: 0 auto;
}

.message + .message {
  margin-top: 16px;
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
  max-width: min(78%, 860px);
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

.message-content :deep(p) {
  margin: 0 0 10px;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message.user .message-content :deep(a) {
  color: inherit;
}

.message.user .message-content :deep(code):not(pre code) {
  background: rgba(255, 255, 255, 0.16);
  color: #fff7ed;
}

.message.user .message-content :deep(blockquote) {
  background: rgba(255, 255, 255, 0.12);
  border-left-color: rgba(255, 255, 255, 0.35);
}

.message.user .message-content :deep(hr) {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.message-time {
  margin-top: 7px;
}

.message-body :deep(.ai-message-actions) {
  margin-top: 10px;
}

.message-body :deep(.action-btn) {
  color: var(--ai-text-faint);
}

.message-body :deep(.action-btn:hover:not(:disabled)) {
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
}

.typing-dots {
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid var(--ai-border);
  background: var(--ai-surface);
  border-bottom-left-radius: 4px;
}

.scroll-bottom-btn {
  position: absolute;
  right: 24px;
  bottom: 96px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--ai-accent-line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--ai-accent);
  box-shadow: var(--shadow-md);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  z-index: 3;
}

.chatbot-page.is-dark .scroll-bottom-btn {
  background: rgba(17, 27, 45, 0.94);
}

.input-area {
  padding: 10px 18px 12px;
  border-top: 1px solid var(--ai-border);
  background: var(--ai-surface);
}

.input-wrapper {
  max-width: 1080px;
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
  min-height: 52px;
  padding: 14px 16px 8px;
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
  margin-top: 6px;
  text-align: center;
}

@media (max-width: 1024px) {
  .chatbot-workspace {
    grid-template-columns: 248px minmax(0, 1fr);
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
    padding: 16px 12px 10px;
  }

  .role-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .scroll-bottom-btn {
    right: 14px;
    bottom: 86px;
  }

  .message-body {
    max-width: 86%;
  }

  .input-area {
    padding: 10px 12px;
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
