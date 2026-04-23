<template>
  <div class="learning-coach-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="coach-main">
      <AIToolHeader
        title="学习规划 Agent"
        badge="学习规划"
      />

      <section class="coach-workspace">
        <aside class="coach-sidebar">
          <section class="coach-sidebar__toolbar">
            <div class="coach-sidebar__toolbar-head">
              <strong>Coach</strong>
              <button class="primary-action primary-action--compact" type="button" @click="createNewSession()" title="新建学习规划会话">
                新建
              </button>
            </div>
            <div class="coach-sidebar__meta">
              <span class="sidebar-mini-pill">{{ sessions.length }} 会话</span>
              <span class="sidebar-mini-pill">{{ quickPrompts.length }} 快捷任务</span>
            </div>
          </section>

          <div class="coach-sidebar__scroll">
            <section class="sidebar-block sidebar-block--sessions">
              <div class="sidebar-title-row">
                <strong>会话</strong>
                <span>{{ sessions.length }}</span>
              </div>

              <div v-if="sessions.length" class="session-list">
                <div
                  v-for="session in sessions"
                  :key="session.sessionId"
                  class="session-item"
                  :class="{ active: session.sessionId === currentSessionId }"
                  @click="selectSession(session.sessionId)"
                >
                  <div v-if="editingSessionId !== session.sessionId" class="session-item__main">
                    <div class="session-item__title" @dblclick="startEditingTitle(session)">
                      {{ session.title || '学习规划' }}
                    </div>
                    <div class="session-item__meta">
                      <span>{{ formatSessionTime(session.updatedAt) }}</span>
                      <span>{{ session.messageCount || 0 }} 条</span>
                    </div>
                  </div>
                  <input
                    v-else
                    v-model="editingTitle"
                    class="session-item__input"
                    autofocus
                    @click.stop
                    @blur="finishEditingTitle(session)"
                    @keyup.enter="finishEditingTitle(session)"
                    @keyup.esc="cancelEditingTitle"
                  />
                  <div class="session-item__actions">
                    <button class="session-action-btn" type="button" title="编辑标题" @click.stop="startEditingTitle(session)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                      </svg>
                    </button>
                    <button class="session-action-btn session-action-btn--danger" type="button" title="删除会话" @click.stop="handleDeleteSession(session.sessionId)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="empty-sidebar">
                还没有学习规划会话。
              </div>
            </section>

            <section class="sidebar-block sidebar-block--prompts">
              <div class="sidebar-title-row">
                <strong>快捷输入</strong>
                <span>{{ quickPrompts.length }}</span>
              </div>
              <div class="prompt-list">
                <button
                  v-for="prompt in quickPrompts"
                  :key="prompt"
                  class="prompt-button"
                  type="button"
                  :title="prompt"
                  @click="usePrompt(prompt)"
                >
                  {{ prompt }}
                </button>
              </div>
            </section>
          </div>
        </aside>

        <section class="coach-stage">
          <div class="coach-stage__topbar">
            <div class="topbar-copy">
              <span class="topbar-label">当前会话</span>
              <strong :title="currentSession?.title || '新会话'">{{ currentSession?.title || '新会话' }}</strong>
            </div>
            <div class="topbar-meta">
              <span class="meta-pill">站内数据</span>
              <span class="meta-pill" :class="{ active: useStreaming }">{{ useStreaming ? '流式输出' : '同步输出' }}</span>
            </div>
          </div>

          <div ref="messageContainerRef" class="coach-messages">
            <div v-if="displayMessages.length === 0 && !isLoading" class="empty-stage">
              <div class="empty-stage__orb"></div>
              <h3>输入目标</h3>
            </div>

            <article
              v-for="(message, index) in displayMessages"
              :key="`${currentSessionId || 'new'}-${index}`"
              class="message-card"
              :class="message.role"
            >
              <div class="message-card__avatar">
                <div v-if="message.role === 'user'" class="avatar avatar--user">
                  {{ userInitial }}
                </div>
                <div v-else class="avatar avatar--agent">
                  LC
                </div>
              </div>

              <div class="message-card__body">
                <div class="message-card__head">
                  <strong>{{ message.role === 'user' ? '你' : '学习规划 Agent' }}</strong>
                  <span>{{ formatMessageTime(message.timestamp) }}</span>
                </div>

                <template v-if="message.role === 'assistant' && parseAgentContent(message.content)">
                  <div
                    class="message-card__reply ai-markdown"
                    v-html="renderAssistantReply(message.content)"
                  ></div>

                  <div class="analysis-grid">
                    <section
                      v-for="section in buildStructuredSections(parseAgentContent(message.content))"
                      :key="section.key"
                      class="analysis-panel"
                    >
                      <div class="analysis-panel__title">{{ section.title }}</div>
                      <div v-if="section.mode === 'text'" class="analysis-panel__text">
                        {{ section.value }}
                      </div>
                      <div v-else class="analysis-panel__list">
                        <span
                          v-for="item in section.value"
                          :key="item"
                          class="analysis-tag"
                        >
                          {{ item }}
                        </span>
                      </div>
                    </section>
                  </div>
                </template>

                <template v-else>
                  <div
                    class="message-card__reply ai-markdown"
                    v-html="renderFallbackReply(message.content)"
                  ></div>
                </template>
                <AIMessageActions
                  v-if="message.role === 'assistant' && !isLoading"
                  :content="message.content || ''"
                  :session-id="currentSessionId || ''"
                  :message-index="index"
                  @regenerate="handleRegenerate"
                />
              </div>
            </article>

            <div v-if="isLoading" class="loading-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div class="coach-composer">
            <div class="composer-toolbar">
              <div class="composer-options">
              <label class="option-field">
                <span>分析区间</span>
                <select v-model="timeRangeDays">
                  <option :value="3">近 3 天</option>
                  <option :value="7">近 7 天</option>
                  <option :value="14">近 14 天</option>
                </select>
              </label>

              <label class="option-field">
                <span>重点题型</span>
                <select v-model="focusSubjectType">
                  <option value="">自动判断</option>
                  <option value="单选题">单选题</option>
                  <option value="多选题">多选题</option>
                  <option value="判断题">判断题</option>
                  <option value="简答题">简答题</option>
                </select>
              </label>

              <label class="option-switch">
                <input v-model="includeQuestionRecommendations" type="checkbox">
                <span>附带题目推荐</span>
              </label>

              <label class="option-switch">
                <input v-model="useStreaming" type="checkbox">
                <span>流式输出</span>
              </label>
              </div>
              <div class="composer-buttons">
                <button class="ghost-button" type="button" @click="createNewSession()" :disabled="isLoading">
                  新会话
                </button>
                <button class="primary-button" type="button" @click="sendMessage" :disabled="!inputMessage.trim() || isLoading">
                  开始分析
                </button>
              </div>
            </div>

            <div class="composer-input">
              <textarea
                v-model="inputMessage"
                rows="2"
                :disabled="isLoading"
                placeholder="例如：帮我分析最近 7 天的练题情况"
                @keydown.enter.exact.prevent="sendMessage"
              ></textarea>
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'
import {
  createLearningCoachSession,
  deleteLearningCoachSession,
  getLearningCoachCapabilities,
  getLearningCoachSession,
  getLearningCoachSessions,
  runLearningCoach,
  runLearningCoachStream,
  updateLearningCoachSessionTitle
} from '@/api/modules/ai/agent'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import AIToolHeader from './components/AIToolHeader.vue'
import AIMessageActions from './components/AIMessageActions.vue'

const themeStore = useThemeStore()
const userStore = useUserStore()

const sessions = ref([])
const currentSession = ref(null)
const currentSessionId = ref('')
const capability = ref({})
const inputMessage = ref('')
const isLoading = ref(false)
const useStreaming = ref(false)
const includeQuestionRecommendations = ref(true)
const timeRangeDays = ref(7)
const focusSubjectType = ref('')
const messageContainerRef = ref(null)
const editingSessionId = ref('')
const editingTitle = ref('')

const defaultQuickPrompts = [
  '帮我分析最近一周的刷题情况，并给我三天复习计划',
  '我最近简答题得分不太稳定，接下来应该怎么练',
  '如果我要准备前端面试，题库里我应该优先刷什么题型',
  '我这周练了不少题，但感觉效率一般，帮我找找原因'
]

const quickPrompts = computed(() => capability.value.examplePrompts?.length
  ? capability.value.examplePrompts
  : defaultQuickPrompts)

const displayMessages = computed(() => currentSession.value?.messages || [])
const userInitial = computed(() => userStore.userName?.charAt(0)?.toUpperCase() || 'U')

const loadCapabilities = async () => {
  try {
    const response = await getLearningCoachCapabilities()
    if (response.success) {
      capability.value = response.data || {}
    }
  } catch (error) {
    console.error('获取学习规划 Agent 能力失败:', error)
  }
}

const loadSessions = async (selectFirst = true) => {
  try {
    const response = await getLearningCoachSessions(userStore.userId)
    if (!response.success) {
      throw new Error(response.message || '获取会话失败')
    }

    sessions.value = response.data || []

    if (selectFirst && sessions.value.length > 0) {
      const targetSessionId = currentSessionId.value || sessions.value[0].sessionId
      await selectSession(targetSessionId)
      return
    }

    if (sessions.value.length === 0) {
      currentSessionId.value = ''
      currentSession.value = null
    }
  } catch (error) {
    console.error('获取学习规划会话失败:', error)
    ElMessage.error(error.message || '获取学习规划会话失败')
  }
}

const selectSession = async (sessionId) => {
  if (!sessionId) {
    return
  }

  try {
    const response = await getLearningCoachSession(sessionId, userStore.userId)
    if (!response.success || !response.data) {
      throw new Error(response.message || '获取会话详情失败')
    }

    currentSessionId.value = sessionId
    currentSession.value = response.data
    await scrollToBottom()
  } catch (error) {
    console.error('获取学习规划会话详情失败:', error)
    ElMessage.error(error.message || '获取会话详情失败')
  }
}

const createNewSession = async (initialGoal = '') => {
  try {
    const response = await createLearningCoachSession({
      title: initialGoal ? initialGoal.slice(0, 24) : '',
      initialGoal
    }, userStore.userId)

    if (!response.success || !response.data) {
      throw new Error(response.message || '创建会话失败')
    }

    const session = {
      ...response.data,
      messages: response.data.messages || []
    }

    sessions.value = [session, ...sessions.value.filter(item => item.sessionId !== session.sessionId)]
    currentSessionId.value = session.sessionId
    currentSession.value = session
    await scrollToBottom()
    return session
  } catch (error) {
    console.error('创建学习规划会话失败:', error)
    ElMessage.error(error.message || '创建学习规划会话失败')
    return null
  }
}

const usePrompt = (prompt) => {
  inputMessage.value = prompt
}

const sendMessage = async () => {
  const goal = inputMessage.value.trim()
  if (!goal || isLoading.value) {
    return
  }

  isLoading.value = true
  let session = currentSession.value
  if (!session?.sessionId) {
    session = await createNewSession(goal)
    if (!session?.sessionId) {
      isLoading.value = false
      return
    }
  }

  appendLocalMessage({
    role: 'user',
    content: goal,
    timestamp: new Date().toISOString()
  })

  appendLocalMessage({
    role: 'assistant',
    content: useStreaming.value ? '正在生成学习规划，请稍候...' : '',
    timestamp: new Date().toISOString()
  })

  const payload = {
    sessionId: session.sessionId,
    goal,
    timeRangeDays: timeRangeDays.value,
    focusSubjectType: focusSubjectType.value,
    includeRecentPractice: true,
    includeQuestionRecommendations: includeQuestionRecommendations.value,
    recommendedSubjectLimit: 5,
    planDays: 3
  }

  inputMessage.value = ''
  await scrollToBottom()

  try {
    if (useStreaming.value) {
      await runLearningCoachStream(
        payload,
        userStore.userId,
        handleStreamEvent,
        (error) => {
          console.error('学习规划 Agent 流式执行失败:', error)
          replaceLastAssistantMessage('学习规划生成失败，请稍后重试。')
          ElMessage.error('学习规划生成失败')
        }
      )
    } else {
      const response = await runLearningCoach(payload, userStore.userId)
      if (!response.success || !response.data) {
        throw new Error(response.message || '学习规划生成失败')
      }
      replaceLastAssistantMessage(response.data.rawContent || response.data.reply || '')
    }

    await refreshCurrentSession()
  } catch (error) {
    console.error('学习规划 Agent 执行失败:', error)
    replaceLastAssistantMessage('学习规划生成失败，请稍后重试。')
    ElMessage.error(error.message || '学习规划生成失败')
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const handleStreamEvent = (event) => {
  if (!event?.type) {
    return
  }

  if (event.type === 'start') {
    replaceLastAssistantMessage('正在读取你的练题数据并生成计划...')
    return
  }

  if (event.type === 'done') {
    replaceLastAssistantMessage(event.content || '')
    return
  }

  if (event.type === 'error') {
    replaceLastAssistantMessage(event.content || '学习规划生成失败，请稍后重试。')
  }
}

const refreshCurrentSession = async () => {
  if (!currentSessionId.value) {
    return
  }
  await Promise.all([
    loadSessions(false),
    selectSession(currentSessionId.value)
  ])
}

const startEditingTitle = (session) => {
  editingSessionId.value = session.sessionId
  editingTitle.value = session.title || '学习规划'
}

const finishEditingTitle = async (session) => {
  const newTitle = editingTitle.value.trim()
  if (!newTitle || newTitle === session.title) {
    cancelEditingTitle()
    return
  }

  try {
    const response = await updateLearningCoachSessionTitle(session.sessionId, newTitle, userStore.userId)
    if (response.success || response.code === 200) {
      session.title = newTitle
      if (currentSessionId.value === session.sessionId && currentSession.value) {
        currentSession.value.title = newTitle
      }
      ElMessage.success('标题已更新')
    } else {
      throw new Error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新会话标题失败:', error)
    ElMessage.error(error.message || '更新标题失败')
  } finally {
    cancelEditingTitle()
  }
}

const cancelEditingTitle = () => {
  editingSessionId.value = ''
  editingTitle.value = ''
}

const handleDeleteSession = async (sessionId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个学习规划会话吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await deleteLearningCoachSession(sessionId, userStore.userId)
    if (response.success || response.code === 200) {
      sessions.value = sessions.value.filter(s => s.sessionId !== sessionId)
      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          await selectSession(sessions.value[0].sessionId)
        } else {
          currentSessionId.value = ''
          currentSession.value = null
        }
      }
      ElMessage.success('会话已删除')
    } else {
      throw new Error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会话失败:', error)
      ElMessage.error(error.message || '删除会话失败')
    }
  }
}

const appendLocalMessage = (message) => {
  if (!currentSession.value) {
    currentSession.value = {
      sessionId: currentSessionId.value,
      title: '学习规划',
      messages: []
    }
  }

  currentSession.value = {
    ...currentSession.value,
    messages: [...(currentSession.value.messages || []), message]
  }
}

const replaceLastAssistantMessage = (content) => {
  if (!currentSession.value?.messages?.length) {
    return
  }

  const messages = [...currentSession.value.messages]
  const lastIndex = messages.length - 1
  const lastMessage = messages[lastIndex]
  if (lastMessage.role === 'assistant') {
    messages[lastIndex] = {
      ...lastMessage,
      content,
      timestamp: new Date().toISOString()
    }
  }

  currentSession.value = {
    ...currentSession.value,
    messages
  }
}

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
  currentSession.value.messages.splice(messageIndex)
  await scrollToBottom()

  isLoading.value = true

  appendLocalMessage({
    role: 'assistant',
    content: '正在重新生成学习规划...',
    timestamp: new Date().toISOString()
  })

  const payload = {
    sessionId: currentSessionId.value,
    goal: userContent,
    timeRangeDays: timeRangeDays.value,
    focusSubjectType: focusSubjectType.value,
    includeRecentPractice: true,
    includeQuestionRecommendations: includeQuestionRecommendations.value,
    recommendedSubjectLimit: 5,
    planDays: 3
  }

  try {
    if (useStreaming.value) {
      await runLearningCoachStream(
        payload,
        userStore.userId,
        handleStreamEvent,
        (error) => {
          console.error('学习规划 Agent 流式执行失败:', error)
          replaceLastAssistantMessage('学习规划生成失败，请稍后重试。')
          ElMessage.error('重新生成失败')
        }
      )
    } else {
      const response = await runLearningCoach(payload, userStore.userId)
      if (!response.success || !response.data) {
        throw new Error(response.message || '学习规划生成失败')
      }
      replaceLastAssistantMessage(response.data.rawContent || response.data.reply || '')
    }

    await refreshCurrentSession()
  } catch (error) {
    console.error('学习规划 Agent 执行失败:', error)
    replaceLastAssistantMessage('学习规划生成失败，请稍后重试。')
    ElMessage.error(error.message || '重新生成失败')
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const parseAgentContent = (content) => {
  if (!content || typeof content !== 'string') {
    return null
  }

  let normalized = content.trim()
  if (normalized.startsWith('```')) {
    const firstBreak = normalized.indexOf('\n')
    if (firstBreak > -1) {
      normalized = normalized.slice(firstBreak + 1)
    }
    if (normalized.endsWith('```')) {
      normalized = normalized.slice(0, -3)
    }
    normalized = normalized.trim()
  }

  const firstBrace = normalized.indexOf('{')
  const lastBrace = normalized.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace <= firstBrace) {
    return null
  }

  try {
    return JSON.parse(normalized.slice(firstBrace, lastBrace + 1))
  } catch (error) {
    return null
  }
}

const buildStructuredSections = (result) => {
  if (!result) {
    return []
  }

  return [
    { key: 'overview', title: '当前概况', mode: 'text', value: result.overview },
    { key: 'diagnosis', title: '问题诊断', mode: 'text', value: result.diagnosis },
    { key: 'weakPoints', title: '薄弱点', mode: 'list', value: result.weakPoints },
    { key: 'recommendations', title: '建议动作', mode: 'list', value: result.recommendations },
    { key: 'nextPlan', title: '短期计划', mode: 'list', value: result.nextPlan },
    { key: 'recommendedQuestions', title: '推荐题目', mode: 'list', value: result.recommendedQuestions },
    { key: 'dataBasis', title: '数据依据', mode: 'list', value: result.dataBasis }
  ].filter(section => Array.isArray(section.value) ? section.value.length > 0 : Boolean(section.value))
}

const renderAssistantReply = (content) => {
  const parsed = parseAgentContent(content)
  return renderAiMarkdown(parsed?.reply || parsed?.overview || content || '')
}

const renderFallbackReply = (content) => renderAiMarkdown(content || '')

const formatSessionTime = (value) => {
  if (!value) {
    return '刚刚'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }

  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatMessageTime = (value) => {
  if (!value) {
    return '刚刚'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const scrollToBottom = async () => {
  await nextTick()
  const container = messageContainerRef.value
  if (!container) {
    return
  }
  container.scrollTop = container.scrollHeight
}

onMounted(async () => {
  await Promise.all([
    loadCapabilities(),
    loadSessions()
  ])
})
</script>

<style scoped>
.learning-coach-page {
  height: 100dvh;
  min-height: 100dvh;
  --coach-bg: linear-gradient(180deg, rgba(245, 247, 250, 0.98) 0%, rgba(236, 240, 244, 0.96) 100%);
  --coach-surface: rgba(255, 255, 255, 0.9);
  --coach-surface-strong: #ffffff;
  --coach-surface-muted: rgba(248, 250, 252, 0.92);
  --coach-border: rgba(15, 23, 42, 0.08);
  --coach-text: #0f172a;
  --coach-text-soft: #475569;
  --coach-text-faint: #64748b;
  --coach-accent: #0f766e;
  --coach-accent-soft: rgba(15, 118, 110, 0.1);
  --coach-accent-line: rgba(15, 118, 110, 0.18);
  background: var(--coach-bg);
  overflow: hidden;
}

.learning-coach-page.is-dark {
  --coach-bg: linear-gradient(180deg, rgba(12, 18, 28, 0.98) 0%, rgba(8, 12, 20, 0.98) 100%);
  --coach-surface: rgba(17, 24, 39, 0.88);
  --coach-surface-strong: rgba(15, 23, 42, 0.98);
  --coach-surface-muted: rgba(30, 41, 59, 0.8);
  --coach-border: rgba(148, 163, 184, 0.16);
  --coach-text: #e2e8f0;
  --coach-text-soft: #cbd5e1;
  --coach-text-faint: #94a3b8;
  --coach-accent: #5eead4;
  --coach-accent-soft: rgba(94, 234, 212, 0.12);
  --coach-accent-line: rgba(94, 234, 212, 0.18);
}

.coach-main {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  height: 100dvh;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  padding: 10px 16px 14px;
}

.coach-workspace {
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

.coach-sidebar,
.coach-stage {
  min-height: 0;
}

.coach-sidebar {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
}

.coach-sidebar__toolbar,
.sidebar-block,
.coach-stage,
.coach-stage__topbar,
.coach-composer {
  border: 1px solid var(--coach-border);
  background: var(--coach-surface);
  border-radius: 12px;
}

.coach-sidebar__toolbar,
.sidebar-block {
  padding: 12px;
}

.coach-sidebar__toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coach-sidebar__toolbar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.coach-sidebar__toolbar-head strong {
  color: var(--coach-accent);
  font-size: 15px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-shadow: 0 0 18px rgba(15, 118, 110, 0.16);
}

.coach-sidebar__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sidebar-mini-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border: 1px solid var(--coach-border);
  border-radius: 999px;
  background: var(--coach-surface-muted);
  color: var(--coach-text-soft);
  font-size: 11px;
  font-weight: 700;
}

.primary-action,
.primary-button,
.ghost-button {
  min-height: 34px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
}

.primary-action,
.primary-button {
  border: 1px solid transparent;
  background: var(--coach-accent);
  color: #ffffff;
}

.ghost-button {
  border: 1px solid var(--coach-border);
  background: transparent;
  color: var(--coach-text);
  padding: 0 14px;
}

.primary-action {
  width: 100%;
  margin-top: 14px;
}

.primary-action--compact {
  width: auto;
  margin-top: 0;
  min-width: 68px;
  padding: 0 12px;
}

.coach-sidebar__scroll {
  min-height: 0;
  overflow: hidden;
  display: grid;
  grid-template-rows: minmax(0, auto) minmax(0, auto);
  gap: 10px;
  align-content: start;
}

.sidebar-title-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  color: var(--coach-text-soft);
  font-size: 11px;
}

.sidebar-title-row strong {
  color: var(--coach-accent);
  font-size: 12px;
  letter-spacing: 0.03em;
}

.prompt-list,
.session-list {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  min-width: 0;
  overflow-x: hidden;
}

.prompt-list {
  max-height: 138px;
  overflow-y: auto;
  padding-right: 2px;
}

.session-list {
  max-height: 248px;
  overflow-y: auto;
  padding-right: 2px;
}

.prompt-button,
.session-item {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-muted);
  border-radius: 10px;
  text-align: left;
}

.prompt-button {
  color: var(--coach-text);
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  min-height: 38px;
}

.session-item.active {
  border-color: var(--coach-accent-line);
  background: var(--coach-accent-soft);
}

.session-item {
  padding: 10px 11px;
  min-height: 52px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.session-item__main {
  min-width: 0;
  flex: 1;
}

.session-item__actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.session-item:hover .session-item__actions {
  opacity: 1;
}

.session-action-btn {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: var(--coach-surface);
  color: var(--coach-text-faint);
  cursor: pointer;
  transition: all 0.15s ease;
}

.session-action-btn:hover {
  background: var(--coach-surface-muted);
  color: var(--coach-text);
}

.session-action-btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.session-item__input {
  width: 100%;
  min-height: 32px;
  padding: 0 8px;
  border: 1px solid var(--coach-accent-line);
  border-radius: 6px;
  background: var(--coach-surface);
  color: var(--coach-text);
  font-size: 12px;
  outline: none;
}

.session-item__title {
  color: var(--coach-text);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.session-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  color: var(--coach-text-faint);
  font-size: 10px;
}

.empty-sidebar {
  margin-top: 12px;
  color: var(--coach-text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.coach-stage {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
}

.coach-stage__topbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 7px 10px;
  background: var(--coach-surface-muted);
}

.topbar-copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.topbar-label {
  color: var(--coach-text-faint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.topbar-copy strong {
  color: var(--coach-text);
  font-size: 12px;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--coach-surface-muted);
  color: var(--coach-text-soft);
  font-size: 10px;
  font-weight: 700;
}

.meta-pill.active {
  background: var(--coach-accent-soft);
  color: var(--coach-accent);
}

.coach-messages {
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  display: grid;
  gap: 12px;
  border: 1px solid var(--coach-border);
  background: linear-gradient(180deg, rgba(15, 118, 110, 0.03), transparent 18%), var(--coach-surface);
  border-radius: 12px;
}

.empty-stage {
  display: grid;
  place-items: center;
  min-height: 100%;
  text-align: center;
  color: var(--coach-text-soft);
  gap: 10px;
}

.empty-stage__orb {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: radial-gradient(circle at 30% 30%, rgba(15, 118, 110, 0.22), rgba(15, 118, 110, 0.04));
}

.empty-stage h3 {
  margin: 0;
  color: var(--coach-text);
  font-size: 18px;
}

.message-card {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  max-width: min(78%, 860px);
}

.message-card__avatar {
  padding-top: 2px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 800;
}

.avatar--user {
  background: var(--coach-surface-muted);
  color: var(--coach-text);
}

.avatar--agent {
  background: var(--coach-accent-soft);
  color: var(--coach-accent);
}

.message-card__body {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-strong);
  border-radius: 12px;
}

.message-card.user .message-card__body {
  background: var(--coach-surface-muted);
}

.message-card.user {
  justify-self: end;
  grid-template-columns: minmax(0, 1fr) 34px;
  max-width: min(78%, 860px);
}

.message-card.user .message-card__avatar {
  grid-column: 2;
}

.message-card.user .message-card__body {
  grid-column: 1;
}

.message-card.assistant {
  justify-self: start;
  max-width: min(84%, 940px);
}

.message-card.assistant .message-card__body {
  border-color: var(--coach-accent-line);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.04);
}

.message-card__head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  color: var(--coach-text-faint);
  font-size: 11px;
}

.message-card__head strong {
  color: var(--coach-text);
  font-size: 12px;
}

.message-card__reply {
  color: var(--coach-text);
  font-size: 14px;
  line-height: 1.75;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.analysis-panel {
  display: grid;
  gap: 6px;
  padding: 10px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-muted);
  border-radius: 10px;
}

.analysis-panel__title {
  color: var(--coach-text);
  font-size: 11px;
  font-weight: 800;
}

.analysis-panel__text {
  color: var(--coach-text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.analysis-panel__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.analysis-tag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--coach-surface-strong);
  color: var(--coach-text-soft);
  font-size: 11px;
  line-height: 1.5;
}

.message-card__body :deep(.ai-message-actions) {
  margin-top: 10px;
}

.message-card__body :deep(.action-btn) {
  color: var(--coach-text-faint);
}

.message-card__body :deep(.action-btn:hover:not(:disabled)) {
  background: var(--coach-accent-soft);
  color: var(--coach-accent);
}

.loading-bar {
  display: inline-flex;
  gap: 8px;
  padding: 0 4px 12px;
  justify-self: start;
}

.loading-bar span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--coach-accent);
  animation: pulse 1.2s infinite ease-in-out;
}

.loading-bar span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-bar span:nth-child(3) {
  animation-delay: 0.3s;
}

.coach-composer {
  display: grid;
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(180deg, var(--coach-surface), var(--coach-surface-muted));
}

.composer-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.composer-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.option-field,
.option-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--coach-text-soft);
  font-size: 11px;
  font-weight: 700;
}

.option-field select {
  min-height: 30px;
  padding: 0 9px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-muted);
  border-radius: 8px;
  color: var(--coach-text);
  font-size: 12px;
}

.option-switch input {
  accent-color: var(--coach-accent);
}

.composer-input textarea {
  width: 100%;
  resize: none;
  min-height: 72px;
  max-height: 112px;
  padding: 10px 12px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-muted);
  border-radius: 10px;
  color: var(--coach-text);
  font-size: 13px;
  line-height: 1.55;
}

.composer-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.coach-sidebar__scroll::-webkit-scrollbar,
.prompt-list::-webkit-scrollbar,
.session-list::-webkit-scrollbar,
.coach-messages::-webkit-scrollbar {
  width: 6px;
}

.coach-sidebar__scroll::-webkit-scrollbar-thumb,
.prompt-list::-webkit-scrollbar-thumb,
.session-list::-webkit-scrollbar-thumb,
.coach-messages::-webkit-scrollbar-thumb {
  background: rgba(15, 118, 110, 0.18);
  border-radius: 999px;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

@media (max-width: 1080px) {
  .learning-coach-page,
  .coach-main {
    height: auto;
    min-height: 100dvh;
  }

  .coach-workspace {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .coach-sidebar {
    grid-template-rows: auto;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .coach-main {
    padding: 8px 10px 12px;
  }

  .coach-stage__topbar,
  .composer-toolbar {
    flex-direction: column;
    align-items: start;
  }

  .composer-buttons {
    width: 100%;
  }

  .ghost-button,
  .primary-button {
    flex: 1;
  }
}
</style>
