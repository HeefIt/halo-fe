<template>
  <div class="learning-coach-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="coach-main">
      <AIToolHeader
        title="学习规划 Agent"
        badge="Learning Coach"
        subtitle="结合最近练题记录，帮你整理下一步。"
      />

      <section class="coach-layout">
        <aside class="coach-sidebar">
          <section class="sidebar-block sidebar-block--intro">
            <div class="sidebar-kicker">策略入口</div>
            <h2>把最近的练题情况和目标交给我，我来整理下一步。</h2>
            <p>适合做阶段诊断、短期计划和题目推荐。</p>

            <div class="capability-list">
              <span
                v-for="tag in capabilityTags"
                :key="tag"
                class="capability-chip"
              >
                {{ tag }}
              </span>
            </div>

            <button class="primary-action" type="button" @click="createNewSession()">
              新建学习规划
            </button>
          </section>

          <section class="sidebar-block sidebar-block--prompts">
            <div class="sidebar-title-row">
              <strong>快捷任务</strong>
              <span>{{ quickPrompts.length }} 条</span>
            </div>
            <div class="prompt-list">
              <button
                v-for="prompt in quickPrompts"
                :key="prompt"
                class="prompt-button"
                type="button"
                @click="usePrompt(prompt)"
              >
                {{ prompt }}
              </button>
            </div>
          </section>

          <section class="sidebar-block sidebar-block--sessions">
            <div class="sidebar-title-row">
              <strong>历史会话</strong>
              <span>{{ sessions.length }}</span>
            </div>

            <div v-if="sessions.length" class="session-list">
              <button
                v-for="session in sessions"
                :key="session.sessionId"
                class="session-item"
                :class="{ active: session.sessionId === currentSessionId }"
                type="button"
                @click="selectSession(session.sessionId)"
              >
                <div class="session-item__title">{{ session.title || '学习规划' }}</div>
                <div class="session-item__meta">
                  <span>{{ formatSessionTime(session.updatedAt) }}</span>
                  <span>{{ session.messageCount || 0 }} 条</span>
                </div>
              </button>
            </div>

            <div v-else class="empty-sidebar">
              还没有学习规划会话。
            </div>
          </section>
        </aside>

        <section class="coach-stage">
          <div class="coach-stage__topbar">
            <div class="topbar-copy">
              <strong>{{ currentSession?.title || '学习规划工作台' }}</strong>
              <span>{{ capability.description || '围绕最近练题数据生成学习计划。' }}</span>
            </div>
            <div class="topbar-meta">
              <span class="meta-pill">默认只读工具</span>
              <span class="meta-pill">会话持久化</span>
              <span class="meta-pill" :class="{ active: useStreaming }">{{ useStreaming ? '流式输出' : '同步输出' }}</span>
            </div>
          </div>

          <div ref="messageContainerRef" class="coach-messages">
            <div v-if="displayMessages.length === 0 && !isLoading" class="empty-stage">
              <div class="empty-stage__orb"></div>
              <h3>先描述你的目标</h3>
              <p>例如：分析最近 7 天刷题情况，并给我 3 天复习计划。</p>
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
              </div>
            </article>

            <div v-if="isLoading" class="loading-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div class="coach-composer">
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

            <div class="composer-input">
              <textarea
                v-model="inputMessage"
                rows="3"
                :disabled="isLoading"
                placeholder="例如：帮我分析最近 7 天的练题情况"
                @keydown.enter.exact.prevent="sendMessage"
              ></textarea>

              <div class="composer-actions">
                <p class="composer-tip">会优先读取真实站内数据。</p>
                <div class="composer-buttons">
                  <button class="ghost-button" type="button" @click="createNewSession()" :disabled="isLoading">
                    新会话
                  </button>
                  <button class="primary-button" type="button" @click="sendMessage" :disabled="!inputMessage.trim() || isLoading">
                    开始分析
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'
import {
  createLearningCoachSession,
  getLearningCoachCapabilities,
  getLearningCoachSession,
  getLearningCoachSessions,
  runLearningCoach,
  runLearningCoachStream
} from '@/api/modules/ai/agent'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import AIToolHeader from './components/AIToolHeader.vue'

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

const defaultQuickPrompts = [
  '帮我分析最近一周的刷题情况，并给我三天复习计划',
  '我最近简答题得分不太稳定，接下来应该怎么练',
  '如果我要准备前端面试，题库里我应该优先刷什么题型',
  '我这周练了不少题，但感觉效率一般，帮我找找原因'
]

const capabilityTags = computed(() => capability.value.capabilityTags?.length
  ? capability.value.capabilityTags
  : ['学习诊断', '计划生成', '薄弱点分析'])

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
  min-height: 100vh;
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
  display: grid;
  gap: 14px;
  padding: 16px;
}

.coach-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.coach-sidebar,
.coach-stage {
  display: grid;
  gap: 12px;
}

.sidebar-block,
.coach-stage__topbar,
.coach-messages,
.coach-composer {
  border: 1px solid var(--coach-border);
  background: var(--coach-surface);
  border-radius: 12px;
}

.sidebar-block {
  padding: 14px;
}

.sidebar-kicker {
  color: var(--coach-text-faint);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sidebar-block--intro h2 {
  margin: 8px 0 6px;
  color: var(--coach-text);
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.sidebar-block--intro p {
  margin: 0;
  color: var(--coach-text-soft);
  font-size: 13px;
  line-height: 1.7;
}

.capability-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.capability-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--coach-accent-soft);
  color: var(--coach-accent);
  font-size: 12px;
  font-weight: 700;
}

.primary-action,
.primary-button,
.ghost-button {
  min-height: 38px;
  border-radius: 10px;
  font-size: 13px;
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

.sidebar-title-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  color: var(--coach-text-soft);
  font-size: 12px;
}

.prompt-list,
.session-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.prompt-button,
.session-item {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-muted);
  border-radius: 10px;
  text-align: left;
}

.prompt-button {
  color: var(--coach-text);
  font-size: 13px;
  line-height: 1.5;
}

.session-item.active {
  border-color: var(--coach-accent-line);
  background: var(--coach-accent-soft);
}

.session-item__title {
  color: var(--coach-text);
  font-size: 13px;
  font-weight: 700;
}

.session-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  color: var(--coach-text-faint);
  font-size: 11px;
}

.empty-sidebar {
  margin-top: 12px;
  color: var(--coach-text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.coach-stage__topbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
  padding: 14px 16px;
}

.topbar-copy {
  display: grid;
  gap: 4px;
}

.topbar-copy strong {
  color: var(--coach-text);
  font-size: 18px;
  letter-spacing: -0.03em;
}

.topbar-copy span {
  color: var(--coach-text-soft);
  font-size: 13px;
  line-height: 1.6;
}

.topbar-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--coach-surface-muted);
  color: var(--coach-text-soft);
  font-size: 12px;
  font-weight: 700;
}

.meta-pill.active {
  background: var(--coach-accent-soft);
  color: var(--coach-accent);
}

.coach-messages {
  min-height: 480px;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
  padding: 16px;
  display: grid;
  gap: 14px;
}

.empty-stage {
  display: grid;
  place-items: center;
  min-height: 320px;
  text-align: center;
  color: var(--coach-text-soft);
}

.empty-stage__orb {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: radial-gradient(circle at 30% 30%, rgba(15, 118, 110, 0.22), rgba(15, 118, 110, 0.04));
  margin-bottom: 14px;
}

.empty-stage h3 {
  margin: 0;
  color: var(--coach-text);
  font-size: 22px;
}

.empty-stage p {
  margin: 6px 0 0;
  max-width: 520px;
  line-height: 1.7;
}

.message-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
}

.message-card__avatar {
  padding-top: 4px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 12px;
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
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-strong);
  border-radius: 12px;
}

.message-card.user .message-card__body {
  background: var(--coach-surface-muted);
}

.message-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  color: var(--coach-text-faint);
  font-size: 12px;
}

.message-card__head strong {
  color: var(--coach-text);
  font-size: 13px;
}

.message-card__reply {
  color: var(--coach-text);
  font-size: 14px;
  line-height: 1.8;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.analysis-panel {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-muted);
  border-radius: 10px;
}

.analysis-panel__title {
  color: var(--coach-text);
  font-size: 12px;
  font-weight: 800;
}

.analysis-panel__text {
  color: var(--coach-text-soft);
  font-size: 13px;
  line-height: 1.7;
}

.analysis-panel__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.analysis-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--coach-surface-strong);
  color: var(--coach-text-soft);
  font-size: 12px;
  line-height: 1.5;
}

.loading-bar {
  display: inline-flex;
  gap: 8px;
  padding: 0 4px 12px;
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
  gap: 12px;
  padding: 14px 16px;
}

.composer-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.option-field,
.option-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--coach-text-soft);
  font-size: 12px;
  font-weight: 700;
}

.option-field select {
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-muted);
  border-radius: 8px;
  color: var(--coach-text);
}

.option-switch input {
  accent-color: var(--coach-accent);
}

.composer-input textarea {
  width: 100%;
  resize: vertical;
  min-height: 120px;
  padding: 12px 14px;
  border: 1px solid var(--coach-border);
  background: var(--coach-surface-muted);
  border-radius: 10px;
  color: var(--coach-text);
  font-size: 14px;
  line-height: 1.7;
}

.composer-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-top: 10px;
}

.composer-tip {
  margin: 0;
  color: var(--coach-text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.composer-buttons {
  display: flex;
  gap: 8px;
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
  .coach-layout {
    grid-template-columns: 1fr;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .coach-main {
    padding: 12px;
  }

  .coach-stage__topbar,
  .composer-actions {
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
