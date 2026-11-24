<template>
  <div class="chatbot-page ai-zone app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="ai-zone__main">
      <AIToolHeader />

      <section class="chatbot-workspace" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
        <ChatHistory
          v-if="!isCompactViewport"
          v-show="!isSidebarCollapsed"
          id="chat-history-panel"
          ref="desktopHistoryRef"
          class="desktop-history"
          :groups="historyGroups"
          :active-session-id="currentSessionId"
          :busy="isChatBusy"
          :loading="isLoadingHistory"
          @create="handleNewChat"
          @select="selectChat"
          @rename="renameSession"
          @delete="deleteChat"
        />

        <section class="chat-stage" aria-labelledby="chat-title">
          <header class="chat-stage__bar">
            <button
              class="chat-icon-button"
              type="button"
              :title="historyToggleLabel"
              :aria-label="historyToggleLabel"
              :aria-expanded="isCompactViewport ? isMobileHistoryOpen : !isSidebarCollapsed"
              :aria-controls="isCompactViewport ? undefined : 'chat-history-panel'"
              :aria-haspopup="isCompactViewport ? 'dialog' : undefined"
              @click="toggleSidebar"
            >
              <el-icon aria-hidden="true"><component :is="isCompactViewport || isSidebarCollapsed ? Expand : Fold" /></el-icon>
            </button>
            <h1 id="chat-title" :title="activeSessionTitle">{{ activeSessionTitle }}</h1>
            <button
              class="chat-icon-button chat-clear-button"
              type="button"
              title="清空消息"
              aria-label="清空当前会话的消息"
              :disabled="isChatBusy || !currentSessionId || !currentMessages.length"
              @click="clearCurrentSession"
            >
              <el-icon aria-hidden="true"><Delete /></el-icon>
              <span>清空消息</span>
            </button>
          </header>

          <div ref="messagesContainer" class="messages-area" tabindex="0" role="region" aria-label="对话消息" @scroll="handleMessagesScroll">
            <div v-if="isLoadingHistory || isSelectingSession" class="chat-loading" role="status">正在加载对话…</div>

            <div v-else class="chat-thread" :class="{ 'chat-thread--empty': !currentMessages.length }">
              <div v-if="isRoleSession(currentSession)" class="chat-role">
                <span class="chat-role__avatar" aria-hidden="true">{{ currentRoleMeta.roleAvatar || 'AI' }}</span>
                <div class="chat-role__copy">
                  <strong>{{ currentRoleMeta.roleName || '角色对话' }}</strong>
                  <span v-if="currentRoleMeta.roleCategory">{{ currentRoleMeta.roleCategory }}</span>
                  <dl v-if="currentRoleVariables.length">
                    <div v-for="[key, value] in currentRoleVariables" :key="key">
                      <dt>{{ key }}</dt><dd>{{ value }}</dd>
                    </div>
                  </dl>
                </div>
                <RouterLink to="/ai/role-chat">换个角色</RouterLink>
              </div>

              <div v-if="!currentMessages.length && !isLoading" class="chat-empty">
                <h2>{{ isRoleSession(currentSession) ? '开始角色对话' : '今天想聊什么？' }}</h2>
                <p>{{ isRoleSession(currentSession) ? '按当前设定发送一条消息。' : '问一个技术问题，或把手头的想法理清楚。' }}</p>
                <div v-if="!isRoleSession(currentSession)" class="chat-prompts">
                  <button
                    v-for="prompt in quickPrompts"
                    :key="prompt.label"
                    type="button"
                    :disabled="isChatBusy"
                    @click="setQuickPrompt(prompt.text)"
                  >
                    {{ prompt.label }}
                    <el-icon aria-hidden="true"><ArrowRight /></el-icon>
                  </button>
                </div>
              </div>

              <article
                v-for="(message, index) in currentMessages"
                :key="`${currentSessionId}-${index}`"
                class="chat-message"
                :class="{ 'chat-message--user': message.role === 'user' }"
              >
                <div v-if="message.role === 'user'" class="chat-message__author chat-sr-only">你</div>
                <div v-else class="chat-message__author">
                  <span class="chat-assistant-mark" aria-hidden="true"><el-icon><ChatLineRound /></el-icon></span>
                  {{ currentRoleMeta?.roleName || 'Halo 助手' }}
                </div>
                <div class="chat-message__content ai-markdown" v-html="formatMessage(message.content || '')"></div>
                <div v-if="message.role !== 'user' || message.timestamp" class="chat-message__meta">
                  <AIMessageActions
                    v-if="message.role === 'assistant' && !isLoading"
                    :content="message.content || ''"
                    :session-id="currentSessionId || ''"
                    :message-index="index"
                    @regenerate="handleRegenerate"
                  />
                  <time v-if="message.timestamp" :datetime="message.timestamp">{{ formatMessageTime(message.timestamp) }}</time>
                </div>
              </article>

              <div v-if="isLoading && currentMessages.at(-1)?.role !== 'assistant'" class="chat-message chat-reply-status" role="status">
                <span class="chat-assistant-mark" aria-hidden="true"><el-icon><ChatLineRound /></el-icon></span>
                正在回复…
              </div>
            </div>
          </div>

          <div class="chat-composer-dock">
            <div class="chat-column">
              <button v-if="showScrollToBottom && !isSelectingSession" class="chat-scroll-bottom" type="button" @click="scrollMessagesToBottom">
                <el-icon aria-hidden="true"><ArrowDown /></el-icon>
                回到最新消息
              </button>

              <form class="chat-composer" @submit.prevent="handleSendMessage">
                <textarea
                  ref="textareaRef"
                  v-model="inputMessage"
                  rows="2"
                  aria-label="输入消息"
                  placeholder="输入你的问题…"
                  :disabled="isChatBusy"
                  @keydown="handleComposerKeydown"
                ></textarea>
                <div class="chat-composer__actions">
                  <label class="chat-stream-option">
                    <input v-model="isStreamingMode" type="checkbox" :disabled="isChatBusy" />
                    流式输出
                  </label>
                  <button class="chat-send-button" type="submit" title="发送消息" aria-label="发送消息" :disabled="!inputMessage.trim() || isChatBusy">
                    <el-icon aria-hidden="true"><ArrowUp /></el-icon>
                  </button>
                </div>
              </form>
              <p class="chat-disclaimer">AI 可能出错，涉及实际业务的建议请先核实。</p>
            </div>
          </div>
        </section>
      </section>

      <el-drawer
        v-if="isCompactViewport"
        v-model="isMobileHistoryOpen"
        class="chat-history-drawer"
        title="历史会话"
        direction="ltr"
        size="min(320px, 88vw)"
        destroy-on-close
        @opened="mobileHistoryRef?.scrollToActive()"
      >
        <ChatHistory
          ref="mobileHistoryRef"
          :groups="historyGroups"
          :active-session-id="currentSessionId"
          :busy="isChatBusy"
          :loading="isLoadingHistory"
          @create="handleNewChat"
          @select="selectChat"
          @rename="renameSession"
          @delete="deleteChat"
        />
      </el-drawer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowDown, ArrowRight, ArrowUp, ChatLineRound, Delete, Expand, Fold } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useThemeStore } from '@/stores/modules/theme'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as aiApi from '@/api/modules/ai/chat'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import AIToolHeader from './components/AIToolHeader.vue'
import AIMessageActions from './components/AIMessageActions.vue'
import ChatHistory from './components/ChatHistory.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

const historyBreakpoint = window.matchMedia('(max-width: 860px)')
const isCompactViewport = ref(historyBreakpoint.matches)
const isSidebarCollapsed = ref(false)
const isMobileHistoryOpen = ref(false)
const desktopHistoryRef = ref(null)
const mobileHistoryRef = ref(null)
const inputMessage = ref('')
const isLoading = ref(false)
const isLoadingHistory = ref(true)
const isSelectingSession = ref(false)
const isCreatingSession = ref(false)
const messagesContainer = ref(null)
const textareaRef = ref(null)
const isStreamingMode = ref(true)
const isUserNearBottom = ref(true)
const sessions = ref([])
const currentSessionId = ref(null)
const currentSession = ref(null)
const SCROLL_BOTTOM_THRESHOLD = 72

const quickPrompts = [
  { label: '设计一个接口', text: '帮我设计一个带缓存的用户查询接口' },
  { label: '判断架构取舍', text: '怎么判断一个服务要不要拆分成微服务？' },
  { label: '整理博客提纲', text: '把这段技术经历整理成一篇博客提纲' }
]

const isChatBusy = computed(() => isLoading.value || isLoadingHistory.value || isSelectingSession.value || isCreatingSession.value)
const activeSessionTitle = computed(() => getSessionDisplayTitle(currentSession.value))
const historyToggleLabel = computed(() => {
  if (isCompactViewport.value) return '打开历史会话'
  return isSidebarCollapsed.value ? '展开历史会话' : '收起历史会话'
})

const updateHistoryLayout = (event) => {
  isCompactViewport.value = event.matches
  if (!event.matches) isMobileHistoryOpen.value = false
}

const normalizeSession = (session) => {
  const normalizedSession = session || {}
  return {
    ...normalizedSession,
    title: normalizedSession.title || '',
    titleSource: normalizedSession.titleSource || 'SYSTEM',
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

const toggleSidebar = () => {
  if (isCompactViewport.value) {
    isMobileHistoryOpen.value = !isMobileHistoryOpen.value
    return
  }

  isSidebarCollapsed.value = !isSidebarCollapsed.value
  if (!isSidebarCollapsed.value) scrollActiveSessionIntoView()
}

const parseSessionExt = (extJson) => {
  if (!extJson) {
    return null
  }

  if (typeof extJson === 'object') {
    return extJson
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

const isExcludedAgentSession = (session) => {
  const extMeta = parseSessionExt(session?.extJson)
  const sceneType = String(extMeta?.sceneType || '')
  return sceneType.startsWith('AGENT_')
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

const loadSessions = async () => {
  try {
    const response = await aiApi.getUserSessions(userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value = (response.data || [])
        .filter(session => !isExcludedAgentSession(session))
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
  if (isCreatingSession.value) return
  isCreatingSession.value = true
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
  } finally {
    isCreatingSession.value = false
  }
}

const handleNewChat = async () => {
  if (isChatBusy.value) return
  isMobileHistoryOpen.value = false
  await createNewSession()
  await nextTick()
  if (!isCompactViewport.value) textareaRef.value?.focus()
}

let latestSelection = 0

const selectSession = async (sessionId) => {
  const selection = ++latestSelection
  if (currentSessionId.value === sessionId) {
    isSelectingSession.value = false
    scrollToBottom({ force: true })
    return
  }

  try {
    isSelectingSession.value = true
    const response = await aiApi.getSession(sessionId, userStore.userInfo?.id)
    if (selection !== latestSelection) return
    if (response.code !== 200) throw new Error(response.message || '加载会话详情失败')

    currentSessionId.value = sessionId
    currentSession.value = normalizeSession(response.data)
    syncCurrentSessionState({ scrollIntoView: true })
  } catch (error) {
    if (selection !== latestSelection) return
    console.error('加载会话详情失败:', error)
    ElMessage.error('加载会话详情失败')
  } finally {
    if (selection === latestSelection) {
      isSelectingSession.value = false
      if (currentSessionId.value === sessionId) scrollToBottom({ force: true })
    }
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
  if (isChatBusy.value || !currentSessionId.value) return
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
  if (isChatBusy.value) return
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  isMobileHistoryOpen.value = false
  await selectSession(sessionId)
}

const deleteChat = async (sessionId) => {
  if (isChatBusy.value) return
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

const generateChatRequestId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
const handleComposerKeydown = (event) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) return
  event.preventDefault()
  handleSendMessage()
}

const handleSendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message || isChatBusy.value) return

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
    const response = await sendMessageToAI(currentSessionId.value, message, generateChatRequestId())
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

const sendMessageToAI = async (sessionId, content, requestId) => {
  if (isStreamingMode.value) {
    return new Promise((resolve, reject) => {
      let fullResponse = ''
      let hasAddedMessage = false

      aiApi.sendChatMessageStream(
        sessionId,
        content,
        userStore.userInfo?.id,
        requestId,
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
    const response = await aiApi.sendChatMessage(sessionId, content, userStore.userInfo?.id, requestId)
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
    const response = await sendMessageToAI(currentSessionId.value, userContent, generateChatRequestId())
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

const formatMessageTime = (timestamp) => new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

const getSessionDisplayTitle = (session) => {
  if (session?.title?.trim()) return session.title.trim()
  const firstUserMessage = session?.messages?.find(message => message.role === 'user' && message.content?.trim())
  if (firstUserMessage?.content) return firstUserMessage.content.trim().slice(0, 16)
  return '新对话'
}

const historyGroups = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  const todayEntries = []
  const weekEntries = []
  const olderEntries = []

  for (const session of sessions.value) {
    const entry = { sessionId: session.sessionId, title: getSessionDisplayTitle(session) }
    const timestamp = getSessionActivityTime(session)
    if (timestamp >= today.getTime()) todayEntries.push(entry)
    else if (timestamp >= weekStart.getTime()) weekEntries.push(entry)
    else olderEntries.push(entry)
  }

  return [
    { label: '今天', entries: todayEntries },
    { label: '过去 7 天', entries: weekEntries },
    { label: '更早', entries: olderEntries }
  ].filter(group => group.entries.length > 0)
})

const renameSession = async (sessionId) => {
  if (isChatBusy.value) return
  const session = sessions.value.find(item => item.sessionId === sessionId)
  if (!session) return

  try {
    const { value } = await ElMessageBox.prompt('输入新的会话标题。', '重命名会话', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputValue: getSessionDisplayTitle(session),
      inputValidator: title => Boolean(title?.trim()) || '请输入会话标题'
    })
    const newTitle = value.trim()
    if (newTitle === session.title) return

    const response = await aiApi.updateSessionTitle(sessionId, newTitle, userStore.userInfo?.id)
    if (response.code !== 200 || !response.data) throw new Error(response.message || '标题更新失败')
    Object.assign(session, normalizeSession(response.data))
    if (currentSessionId.value === sessionId && currentSession.value) {
      currentSession.value.title = session.title
      currentSession.value.titleSource = session.titleSource
      currentSession.value.updatedAt = session.updatedAt
    }
    sortSessionsByRecent()
    ElMessage.success('标题更新成功')
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    console.error('更新标题失败:', error)
    ElMessage.error('标题更新失败')
  }
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
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    container.scrollTo({
      top: container.scrollHeight,
      behavior: reduceMotion ? 'auto' : behavior
    })
    isUserNearBottom.value = true
  })
}

const scrollMessagesToBottom = () => {
  scrollToBottom({ force: true, behavior: 'smooth' })
}

const scrollActiveSessionIntoView = () => {
  nextTick(() => {
    if (!isSidebarCollapsed.value) desktopHistoryRef.value?.scrollToActive()
    if (isMobileHistoryOpen.value) mobileHistoryRef.value?.scrollToActive()
  })
}

onMounted(async () => {
  historyBreakpoint.addEventListener('change', updateHistoryLayout)
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  try {
    await loadSessions()
    const preferredSessionId = typeof route.query.sessionId === 'string' ? route.query.sessionId : ''
    if (preferredSessionId) await selectSession(preferredSessionId)
    else if (sessions.value.length > 0) await selectSession(sessions.value[0].sessionId)
    else await createNewSession()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败: ' + error.message)
  } finally {
    isLoadingHistory.value = false
    scrollToBottom({ force: true })
  }
})

onUnmounted(() => {
  historyBreakpoint.removeEventListener('change', updateHistoryLayout)
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
  --ai-accent-line: var(--color-accent-subtle);
  --chat-reading-width: 760px;
  --chat-gutter: clamp(16px, 4vw, 42px);
  color: var(--text-1);
}

.chatbot-workspace {
  display: grid;
  grid-template-columns: 256px minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--internal-panel-border);
  border-radius: var(--radius-lg);
  background: var(--internal-panel-bg);
}

.chatbot-workspace.is-sidebar-collapsed {
  grid-template-columns: minmax(0, 1fr);
}

.desktop-history {
  border-right: 1px solid var(--internal-panel-border);
}

.chat-stage {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-width: 0;
  min-height: 0;
}

.chat-stage__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--internal-panel-border);
}

.chat-stage__bar h1 {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--text-1);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-icon-button,
.chat-send-button {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-2);
  font-size: 18px;
  cursor: pointer;
}

.chat-icon-button:hover:not(:disabled) {
  background: var(--internal-panel-bg-hover);
  color: var(--text-1);
}

.chat-icon-button:disabled,
.chat-prompts button:disabled {
  opacity: 0.45;
  cursor: default;
}

.chat-clear-button {
  width: auto;
  padding: 0 8px;
}

.chat-clear-button span {
  font-size: 12px;
  white-space: nowrap;
}

.chatbot-page :where(button, a, input, .messages-area):focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.messages-area {
  min-height: 0;
  padding: 0 var(--chat-gutter);
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.chat-thread,
.chat-column {
  width: 100%;
  max-width: var(--chat-reading-width);
  margin-inline: auto;
}

.chat-thread {
  padding: 28px 0 24px;
}

.chat-thread--empty {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.chat-empty,
.chat-loading {
  padding-block: 20px;
  text-align: center;
}

.chat-empty {
  margin-block: auto;
}

.chat-empty h2 {
  margin: 0;
  font-size: clamp(24px, 3.2vw, 34px);
  font-weight: 700;
  line-height: 1.28;
}

.chat-empty p,
.chat-loading {
  color: var(--text-2);
  font-size: 14px;
}

.chat-empty p {
  margin: 10px 0 18px;
}

.chat-prompts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.chat-prompts button,
.chat-scroll-bottom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 4px 10px;
  border: 1px solid var(--internal-panel-border-strong);
  border-radius: var(--radius-md);
  background: var(--internal-panel-bg);
  color: var(--text-2);
  font-size: 13px;
  cursor: pointer;
}

.chat-prompts button:hover:not(:disabled),
.chat-scroll-bottom:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.chat-message {
  position: relative;
}

.chat-message + .chat-message {
  margin-top: 26px;
}

.chat-message--user {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

.chat-message__author,
.chat-reply-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 650;
}

.chat-assistant-mark,
.chat-role__avatar {
  display: inline-grid;
  flex: none;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-size: 15px;
}

.chat-message__content {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-size: 15px;
  line-height: 1.75;
}

.chat-message--user .chat-message__content {
  width: fit-content;
  max-width: min(100%, 39rem);
  padding: 9px 13px;
  border-radius: 14px 14px 4px 14px;
  background: var(--color-accent-light);
}

.chat-message__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: var(--text-2);
  font-size: 11px;
}

.chat-message__meta :deep(.ai-message-actions) {
  margin-top: 0;
}

.chat-message__meta :deep(.action-btn) {
  color: var(--text-2);
}

.chat-reply-status {
  color: var(--text-2);
}

.chat-role {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 24px;
  padding: 12px;
  border: 1px solid var(--internal-panel-border);
  border-radius: var(--radius-md);
  background: var(--internal-panel-bg-alt);
  font-size: 13px;
}

.chat-role__copy {
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
}

.chat-role__copy > span {
  margin-left: 6px;
  color: var(--text-2);
  font-size: 12px;
}

.chat-role dl {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 4px 0 0;
  color: var(--text-2);
  font-size: 12px;
}

.chat-role dl div {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
}

.chat-role dd {
  min-width: 0;
  margin: 0;
}

.chat-role a {
  flex: none;
  color: var(--color-accent);
}

.chat-composer-dock {
  padding: 4px var(--chat-gutter) 8px;
}

.chat-column {
  position: relative;
}

.chat-scroll-bottom {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.chat-composer {
  padding: 10px 10px 8px;
  border: 1px solid var(--internal-panel-border-strong);
  border-radius: var(--radius-2xl);
  background: var(--internal-panel-bg-alt);
}

.chat-composer:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-light);
}

.chat-composer textarea {
  display: block;
  width: 100%;
  min-height: 44px;
  max-height: min(24dvh, 170px);
  padding: 3px 4px 6px;
  resize: none;
  field-sizing: content;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-1);
  font: inherit;
  font-size: 15px;
  line-height: 1.5;
}

.chat-composer textarea::placeholder {
  color: var(--text-2);
}

.chat-composer__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.chat-stream-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding-inline: 4px;
  color: var(--text-2);
  font-size: 12px;
  cursor: pointer;
}

.chat-stream-option input {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--color-accent);
}

.chat-send-button {
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--app-bg-elevated);
  font-size: 20px;
}

.chat-send-button:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.chat-send-button:focus-visible {
  outline-offset: 2px;
}

.chat-send-button:disabled {
  background: var(--color-bg-muted);
  color: var(--text-2);
  cursor: default;
}

.chat-disclaimer {
  margin: 6px 0 0;
  color: var(--text-2);
  font-size: 11px;
  line-height: 1.4;
  text-align: center;
}

.chat-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.chatbot-page :deep(.chat-history-drawer) {
  background: var(--internal-panel-bg-alt);
  color: var(--text-1);
}

.chatbot-page :deep(.chat-history-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 14px 16px 8px;
  color: var(--text-1);
}

.chatbot-page :deep(.chat-history-drawer .el-drawer__body) {
  min-height: 0;
  padding: 0;
}

@media (max-width: 860px) {
  .chatbot-workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 560px) {
  .chatbot-page {
    --chat-gutter: 12px;
  }

  .chat-stage__bar {
    padding-inline: 6px;
  }

  .chat-clear-button span {
    display: none;
  }

  .chat-thread {
    padding-block: 18px;
  }

  .chat-message + .chat-message {
    margin-top: 18px;
  }

  .chat-composer textarea {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chatbot-page :deep(.el-overlay),
  .chatbot-page :deep(.chat-history-drawer),
  .chatbot-page :deep(.action-btn) {
    animation-duration: 1ms;
    transition-duration: 1ms;
  }
}
</style>
