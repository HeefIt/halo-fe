<template>
  <div class="halo-study-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="study-main">
      <AIToolHeader title="Halo 学习搭子 Agent" badge="学习搭子" />

      <section class="study-workspace">
        <aside class="study-sidebar">
          <section class="panel sidebar-toolbar">
            <div class="toolbar-head">
              <strong>Study Agent</strong>
              <button class="primary-action" type="button" title="新建学习搭子会话" @click="createNewSession()">
                新建
              </button>
            </div>
            <div class="mini-row">
              <span>{{ sessions.length }} 会话</span>
              <span>{{ quickPrompts.length }} 快捷任务</span>
            </div>
          </section>

          <section class="panel sidebar-list">
            <div class="panel-title">
              <strong>会话</strong>
              <span>{{ sessions.length }}</span>
            </div>
            <div v-if="sessions.length" class="session-list">
              <article
                v-for="session in sessions"
                :key="session.sessionId"
                class="session-item"
                :class="{ active: session.sessionId === currentSessionId }"
                @click="selectSession(session.sessionId)"
              >
                <template v-if="editingSessionId !== session.sessionId">
                  <div class="session-content">
                    <div class="session-title" :title="session.title || 'Halo 学习搭子'" @dblclick.stop="startEditingTitle(session)">
                      {{ session.title || 'Halo 学习搭子' }}
                    </div>
                    <div class="session-meta">
                      <span>{{ formatSessionTime(session.updatedAt) }}</span>
                      <span>{{ session.messageCount || 0 }} 条</span>
                    </div>
                  </div>
                </template>
                <input
                  v-else
                  v-model="editingTitle"
                  class="session-input"
                  autofocus
                  @click.stop
                  @blur="finishEditingTitle(session)"
                  @keyup.enter="finishEditingTitle(session)"
                  @keyup.esc="cancelEditingTitle"
                />
                <div class="session-actions">
                  <button class="icon-button" type="button" title="编辑标题" @click.stop="startEditingTitle(session)">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"></path>
                    </svg>
                  </button>
                  <button class="icon-button danger" type="button" title="删除会话" @click.stop="handleDeleteSession(session.sessionId)">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 6h18"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                    </svg>
                  </button>
                </div>
              </article>
            </div>
            <div v-else class="empty-small">还没有学习搭子会话。</div>
          </section>

          <section class="panel prompt-panel">
            <div class="panel-title">
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
        </aside>

        <section class="study-stage">
          <div class="stage-topbar panel">
            <div class="stage-title">
              <span>当前会话</span>
              <strong :title="currentSession?.title || '新会话'">{{ currentSession?.title || '新会话' }}</strong>
            </div>
            <div class="stage-meta">
              <span class="meta-pill" :class="{ active: enableRag }">RAG</span>
              <span class="meta-pill" :class="{ active: includeRecentPractice }">练习数据</span>
              <span class="meta-pill" :class="{ active: useStreaming }">流式</span>
            </div>
          </div>

          <div ref="messageContainerRef" class="message-area">
            <div v-if="displayMessages.length === 0 && !isLoading" class="empty-stage">
              <div class="empty-mark">H</div>
              <h3>把学习问题交给站内数据</h3>
              <p>它会结合刷题记录、题库和知识库一起回答。</p>
            </div>

            <article
              v-for="(message, index) in displayMessages"
              :key="`${currentSessionId || 'new'}-${index}`"
              class="message-card"
              :class="messageRoleClass(message)"
            >
              <div class="avatar" :class="isUserMessage(message) ? 'avatar-user' : 'avatar-agent'">
                {{ isUserMessage(message) ? userInitial : 'HA' }}
              </div>
              <div class="message-body">
                <div class="message-head">
                  <strong>{{ isUserMessage(message) ? '你' : 'Halo 学习搭子' }}</strong>
                  <span>{{ formatMessageTime(getMessageTime(message)) }}</span>
                </div>

                <template v-if="isAssistantMessage(message) && getAgentReport(message)">
                  <div class="message-reply ai-markdown" v-html="renderAssistantReply(getAgentReportContent(message))"></div>

                  <div class="agent-report">
                    <section class="report-summary">
                      <div>
                        <span class="report-kicker">学习诊断</span>
                        <strong>{{ getAgentReport(message).diagnosis.level || '学习建议' }}</strong>
                      </div>
                      <p>{{ getAgentReport(message).diagnosis.summary || getAgentReport(message).overview }}</p>
                      <span class="confidence-chip">置信度 {{ getAgentReport(message).confidence || '中' }}</span>
                    </section>

                    <section v-if="getAgentReport(message).evidence.length" class="report-section">
                      <div class="report-section-head">
                        <strong>判断依据</strong>
                        <span>{{ getAgentReport(message).evidence.length }} 项</span>
                      </div>
                      <div class="evidence-list">
                        <div v-for="item in getAgentReport(message).evidence" :key="`${item.label}-${item.value}`" class="evidence-item">
                          <span>{{ item.label }}</span>
                          <strong>{{ item.value }}</strong>
                        </div>
                      </div>
                    </section>

                    <section v-if="getAgentReport(message).questions.length" class="report-section">
                      <div class="report-section-head">
                        <strong>推荐题目</strong>
                        <span>{{ getAgentReport(message).questions.length }} 题</span>
                      </div>
                      <div class="question-list">
                        <article v-for="question in getAgentReport(message).questions" :key="`${question.questionId}-${question.title}`" class="question-card">
                          <div class="question-headline">
                            <span>{{ question.type || '练习题' }}</span>
                            <strong>{{ question.title }}</strong>
                          </div>
                          <p v-if="question.reason">{{ question.reason }}</p>
                          <button v-if="question.path" type="button" class="inline-link" @click="navigateReportAction(question)">
                            去练习
                          </button>
                        </article>
                      </div>
                    </section>

                    <section v-if="getAgentReport(message).knowledge.length" class="report-section">
                      <div class="report-section-head">
                        <strong>知识来源</strong>
                        <span>{{ getAgentReport(message).knowledge.length }} 条</span>
                      </div>
                      <div class="knowledge-list">
                        <article v-for="item in getAgentReport(message).knowledge" :key="`${item.source}-${item.title}`" class="knowledge-item">
                          <span>{{ item.source || '知识库' }}</span>
                          <strong>{{ item.title }}</strong>
                          <p v-if="item.summary">{{ item.summary }}</p>
                        </article>
                      </div>
                    </section>

                    <section v-if="getAgentReport(message).plan.length" class="report-section">
                      <div class="report-section-head">
                        <strong>复盘计划</strong>
                        <span>{{ getAgentReport(message).plan.length }} 天</span>
                      </div>
                      <div class="plan-list">
                        <article v-for="item in getAgentReport(message).plan" :key="`${item.day}-${item.title}`" class="plan-item">
                          <span>D{{ item.day || 1 }}</span>
                          <div>
                            <strong>{{ item.title }}</strong>
                            <ul>
                              <li v-for="task in item.tasks" :key="task">{{ task }}</li>
                            </ul>
                          </div>
                        </article>
                      </div>
                    </section>

                    <section v-if="getAgentReport(message).actions.length" class="report-section">
                      <div class="report-section-head">
                        <strong>下一步行动</strong>
                        <span>{{ getAgentReport(message).actions.length }} 个入口</span>
                      </div>
                      <div class="action-list">
                        <button
                          v-for="action in getAgentReport(message).actions"
                          :key="`${action.label}-${action.path}`"
                          type="button"
                          class="report-action"
                          @click="navigateReportAction(action)"
                        >
                          <span>{{ action.label }}</span>
                          <small v-if="action.description">{{ action.description }}</small>
                        </button>
                      </div>
                    </section>
                  </div>
                </template>

                <template v-else>
                  <div class="message-reply ai-markdown" v-html="renderFallbackReply(getMessageContent(message))"></div>
                </template>

                <AIMessageActions
                  v-if="isAssistantMessage(message) && !isLoading"
                  :content="getMessageContent(message)"
                  :session-id="currentSessionId || ''"
                  :message-index="index"
                  :share-path="currentSessionId ? `/ai/halo-study-agent?sessionId=${currentSessionId}` : '/ai/halo-study-agent'"
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

          <div class="composer panel">
            <div class="composer-options">
              <label class="option-switch">
                <input v-model="enableRag" type="checkbox">
                <span>知识库</span>
              </label>
              <label class="option-switch">
                <input v-model="includeRecentPractice" type="checkbox">
                <span>练习记录</span>
              </label>
              <label class="option-switch">
                <input v-model="includeQuestionRecommendations" type="checkbox">
                <span>推荐题目</span>
              </label>
              <label class="option-switch">
                <input v-model="includeCommunityContent" type="checkbox">
                <span>博客社区</span>
              </label>
              <label class="option-switch">
                <input v-model="useStreaming" type="checkbox">
                <span>流式</span>
              </label>
            </div>

            <div class="composer-controls">
              <label>
                <span>区间</span>
                <select v-model.number="timeRangeDays">
                  <option :value="3">近 3 天</option>
                  <option :value="7">近 7 天</option>
                  <option :value="14">近 14 天</option>
                </select>
              </label>
              <label>
                <span>计划</span>
                <select v-model.number="planDays">
                  <option :value="1">1 天</option>
                  <option :value="3">3 天</option>
                  <option :value="7">7 天</option>
                </select>
              </label>
              <label>
                <span>知识库ID</span>
                <input v-model.trim="knowledgeBaseId" type="text" inputmode="numeric" placeholder="自动" />
              </label>
              <button class="ghost-button" type="button" :disabled="isLoading" @click="createNewSession()">
                新会话
              </button>
              <button class="primary-button" type="button" :disabled="!inputMessage.trim() || isLoading" @click="sendMessage">
                发送
              </button>
            </div>

            <textarea
              v-model="inputMessage"
              rows="2"
              :disabled="isLoading"
              placeholder="例如：根据我最近刷题情况和知识库资料，给我三天 Java 后端复习计划"
              @keydown.enter.exact.prevent="sendMessage"
            ></textarea>
          </div>
        </section>

        <aside class="insight-rail">
          <section class="panel insight-panel">
            <div class="panel-title">
              <strong>运行轨迹</strong>
              <span>{{ traceSteps.length ? `${traceSteps.length} 步` : '等待' }}</span>
            </div>
            <div v-if="traceSteps.length" class="insight-list trace-list">
              <div
                v-for="step in traceSteps"
                :key="`${step.runId || currentRunId || 'run'}-${step.stepNo}-${step.actionName || step.stepType}`"
                class="trace-block"
                :class="`trace-${String(step.stepType || '').toLowerCase()}`"
              >
                <div class="trace-head">
                  <span>{{ formatStepType(step.stepType) }}</span>
                  <small>{{ step.costTimeMs ? `${step.costTimeMs}ms` : '完成' }}</small>
                </div>
                <strong>{{ step.actionName || 'Agent Step' }}</strong>
                <p>{{ step.decisionSummary || step.content || '-' }}</p>
                <p v-if="step.observation" class="trace-observation">{{ summarizeObservation(step) }}</p>
                <details v-if="step.observation">
                  <summary>原始观察</summary>
                  <pre>{{ formatObservation(step.observation) }}</pre>
                </details>
              </div>
            </div>
            <div v-else class="empty-small">发送问题后，这里会实时展示 Agent 的计划、工具、RAG 和最终步骤。</div>
          </section>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'
import {
  createHaloStudySession,
  deleteHaloStudySession,
  getHaloStudyCapabilities,
  getHaloStudyRunSteps,
  getHaloStudySession,
  getHaloStudySessions,
  runHaloStudy,
  runHaloStudyStream,
  updateHaloStudySessionTitle
} from '@/api/modules/ai/haloStudyAgent'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import AIToolHeader from './components/AIToolHeader.vue'
import AIMessageActions from './components/AIMessageActions.vue'

const themeStore = useThemeStore()
const userStore = useUserStore()
const router = useRouter()

const sessions = ref([])
const currentSession = ref(null)
const currentSessionId = ref('')
const capability = ref({})
const inputMessage = ref('')
const isLoading = ref(false)
const useStreaming = ref(true)
const enableRag = ref(true)
const includeRecentPractice = ref(true)
const includeQuestionRecommendations = ref(true)
const includeCommunityContent = ref(true)
const timeRangeDays = ref(7)
const planDays = ref(3)
const knowledgeBaseId = ref('')
const messageContainerRef = ref(null)
const editingSessionId = ref('')
const editingTitle = ref('')
const streamBuffer = ref('')
const currentRunId = ref('')
const traceSteps = ref([])

const defaultQuickPrompts = [
  '根据我最近一周刷题情况，推荐 5 道适合复习的题',
  '结合知识库资料，帮我复习 Spring Boot 自动配置',
  '我要准备 Java 后端面试，帮我制定三天学习计划',
  '平台里有哪些博客或社区内容适合我继续学习'
]

const quickPrompts = computed(() => capability.value.examplePrompts?.length
  ? capability.value.examplePrompts
  : defaultQuickPrompts)

const displayMessages = computed(() => currentSession.value?.messages || [])
const userInitial = computed(() => userStore.userName?.charAt(0)?.toUpperCase() || 'U')

const normalizeRole = (role) => String(role || '').trim().toLowerCase()

const isUserMessage = (message) => normalizeRole(message?.role) === 'user'

const isAssistantMessage = (message) => {
  const role = normalizeRole(message?.role)
  return role === 'assistant' || role === 'ai' || role === 'agent'
}

const messageRoleClass = (message) => isUserMessage(message) ? 'user' : 'assistant'

const getAgentReport = (message) => normalizeAgentReport(parseAgentContent(getMessageContent(message)))

const getAgentReportContent = (message) => {
  const parsed = parseAgentContent(getMessageContent(message))
  return parsed?.reply || parsed?.overview || getMessageContent(message)
}

const getMessageContent = (message) => {
  const content = message?.content ?? message?.reply ?? message?.rawContent ?? ''
  if (typeof content === 'string') {
    return isUserMessage(message) ? extractUserDisplayContent(content) : content
  }
  if (content && typeof content === 'object') {
    return JSON.stringify(content)
  }
  return ''
}

const getMessageTime = (message) => message?.timestamp || message?.createdAt || message?.createdTime

const loadCapabilities = async () => {
  try {
    const response = await getHaloStudyCapabilities()
    if (response.success) {
      capability.value = response.data || {}
    }
  } catch (error) {
    console.error('获取 Halo 学习搭子能力失败:', error)
  }
}

const loadSessions = async (selectFirst = true) => {
  try {
    const response = await getHaloStudySessions(userStore.userId)
    if (!response.success) {
      throw new Error(response.message || '获取会话失败')
    }

    sessions.value = response.data || []
    if (selectFirst && sessions.value.length > 0) {
      await selectSession(currentSessionId.value || sessions.value[0].sessionId)
      return
    }

    if (sessions.value.length === 0) {
      currentSessionId.value = ''
      currentSession.value = null
    }
  } catch (error) {
    console.error('获取 Halo 学习搭子会话失败:', error)
    ElMessage.error(error.message || '获取会话失败')
  }
}

const selectSession = async (sessionId) => {
  if (!sessionId) return
  try {
    const response = await getHaloStudySession(sessionId, userStore.userId)
    if (!response.success || !response.data) {
      throw new Error(response.message || '获取会话详情失败')
    }
    currentSessionId.value = sessionId
    currentSession.value = response.data
    await scrollToBottom()
  } catch (error) {
    console.error('获取 Halo 学习搭子会话详情失败:', error)
    ElMessage.error(error.message || '获取会话详情失败')
  }
}

const createNewSession = async (initialGoal = '') => {
  try {
    const response = await createHaloStudySession({
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
    console.error('创建 Halo 学习搭子会话失败:', error)
    ElMessage.error(error.message || '创建会话失败')
    return null
  }
}

const usePrompt = (prompt) => {
  inputMessage.value = prompt
}

const sendMessage = async () => {
  const goal = inputMessage.value.trim()
  if (!goal || isLoading.value) return

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
    content: '正在编排站内学习数据...',
    timestamp: new Date().toISOString()
  })

  const payload = buildRunPayload(goal, session.sessionId)
  inputMessage.value = ''
  streamBuffer.value = ''
  currentRunId.value = ''
  traceSteps.value = []
  await scrollToBottom()

  try {
    if (useStreaming.value) {
      await runHaloStudyStream(
        payload,
        userStore.userId,
        handleStreamEvent,
        (error) => {
          console.error('Halo 学习搭子流式执行失败:', error)
          replaceLastAssistantMessage('学习搭子生成失败，请稍后重试。')
          ElMessage.error('学习搭子生成失败')
        }
      )
    } else {
      const response = await runHaloStudy(payload, userStore.userId)
      if (!response.success || !response.data) {
        throw new Error(response.message || '学习搭子生成失败')
      }
      replaceLastAssistantMessage(resolveRunResponseContent(response.data))
      updateTraceFromRunResponse(response.data)
    }
    await refreshCurrentSession()
  } catch (error) {
    console.error('Halo 学习搭子执行失败:', error)
    replaceLastAssistantMessage('学习搭子生成失败，请稍后重试。')
    ElMessage.error(error.message || '学习搭子生成失败')
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const buildRunPayload = (goal, sessionId) => ({
  sessionId,
  goal,
  knowledgeBaseId: normalizeKnowledgeBaseId(),
  enableRag: enableRag.value,
  includeRecentPractice: includeRecentPractice.value,
  includeQuestionRecommendations: includeQuestionRecommendations.value,
  includeCommunityContent: includeCommunityContent.value,
  recommendedSubjectLimit: 5,
  timeRangeDays: timeRangeDays.value,
  planDays: planDays.value,
  enableTrace: true,
  maxSteps: 8
})

const normalizeKnowledgeBaseId = () => {
  if (!knowledgeBaseId.value) return null
  const value = Number(knowledgeBaseId.value)
  return Number.isFinite(value) && value > 0 ? value : null
}

const handleStreamEvent = (event) => {
  if (!event?.type) return

  if (event.type === 'start') {
    streamBuffer.value = ''
    currentRunId.value = event.runId || ''
    traceSteps.value = []
    replaceLastAssistantMessage(event.content || '正在编排站内学习数据...')
    return
  }

  if (['plan', 'tool', 'rag', 'final'].includes(event.type)) {
    appendTraceStep(event)
    return
  }

  if (event.type === 'chunk') {
    streamBuffer.value += event.content || ''
    replaceLastAssistantMessage(streamBuffer.value)
    scrollToBottom()
    return
  }

  if (event.type === 'done') {
    currentRunId.value = event.runId || currentRunId.value
    replaceLastAssistantMessage(resolveFinalEventContent(event))
    loadRunStepsIfNeeded()
    return
  }

  if (event.type === 'error') {
    replaceLastAssistantMessage(event.content || '学习搭子生成失败，请稍后重试。')
  }
}

const refreshCurrentSession = async () => {
  if (!currentSessionId.value) return
  await Promise.all([
    loadSessions(false),
    selectSession(currentSessionId.value)
  ])
}

const resolveFinalEventContent = (event) => {
  if (!event) return streamBuffer.value || ''
  if (event.structuredResult) return JSON.stringify(event.structuredResult)
  if (event.reply) return event.reply
  if (event.content) return event.content
  if (event.rawContent) return event.rawContent
  return streamBuffer.value || ''
}

const appendTraceStep = (event) => {
  if (!event) return
  currentRunId.value = event.runId || currentRunId.value
  const step = {
    runId: event.runId,
    stepNo: event.stepNo || traceSteps.value.length + 1,
    stepType: event.stepType || event.type?.toUpperCase(),
    actionName: event.actionName,
    actionInputJson: event.actionInputJson,
    observation: event.observation,
    decisionSummary: event.decisionSummary || event.content,
    status: event.status,
    costTimeMs: event.costTimeMs
  }
  const existsIndex = traceSteps.value.findIndex(item =>
    item.stepNo === step.stepNo && item.runId === step.runId
  )
  if (existsIndex >= 0) {
    traceSteps.value.splice(existsIndex, 1, step)
    return
  }
  traceSteps.value = [...traceSteps.value, step]
}

const updateTraceFromRunResponse = (data) => {
  currentRunId.value = data?.runId || currentRunId.value
  traceSteps.value = Array.isArray(data?.traceSteps) ? data.traceSteps : traceSteps.value
}

const loadRunStepsIfNeeded = async () => {
  if (!currentRunId.value || traceSteps.value.length > 0) return
  try {
    const response = await getHaloStudyRunSteps(currentRunId.value, userStore.userId)
    if (response.success && Array.isArray(response.data)) {
      traceSteps.value = response.data
    }
  } catch (error) {
    console.error('获取 Halo 学习搭子运行轨迹失败:', error)
  }
}

const startEditingTitle = (session) => {
  editingSessionId.value = session.sessionId
  editingTitle.value = session.title || 'Halo 学习搭子'
}

const finishEditingTitle = async (session) => {
  const newTitle = editingTitle.value.trim()
  if (!newTitle || newTitle === session.title) {
    cancelEditingTitle()
    return
  }

  try {
    const response = await updateHaloStudySessionTitle(session.sessionId, newTitle, userStore.userId)
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
    console.error('更新 Halo 学习搭子标题失败:', error)
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
    await ElMessageBox.confirm('确定要删除这个学习搭子会话吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await deleteHaloStudySession(sessionId, userStore.userId)
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
      console.error('删除 Halo 学习搭子会话失败:', error)
      ElMessage.error(error.message || '删除会话失败')
    }
  }
}

const handleRegenerate = async (messageIndex) => {
  if (isLoading.value || !currentSession.value?.messages) return
  const messages = currentSession.value.messages
  if (messageIndex <= 0 || messageIndex >= messages.length) return

  const userMessage = messages[messageIndex - 1]
  const userContent = getMessageContent(userMessage).trim()
  if (!userMessage || !isUserMessage(userMessage) || !userContent) {
    ElMessage.warning('无法找到对应的用户消息')
    return
  }

  currentSession.value = {
    ...currentSession.value,
    messages: messages.slice(0, messageIndex)
  }
  await scrollToBottom()

  isLoading.value = true
  streamBuffer.value = ''
  currentRunId.value = ''
  traceSteps.value = []
  appendLocalMessage({
    role: 'assistant',
    content: '正在重新编排站内学习数据...',
    timestamp: new Date().toISOString()
  })

  const payload = buildRunPayload(userContent, currentSessionId.value)

  try {
    if (useStreaming.value) {
      await runHaloStudyStream(
        payload,
        userStore.userId,
        handleStreamEvent,
        (error) => {
          console.error('Halo 学习搭子流式重新生成失败:', error)
          replaceLastAssistantMessage('学习搭子重新生成失败，请稍后重试。')
          ElMessage.error('重新生成失败')
        }
      )
    } else {
      const response = await runHaloStudy(payload, userStore.userId)
      if (!response.success || !response.data) {
        throw new Error(response.message || '学习搭子重新生成失败')
      }
      replaceLastAssistantMessage(resolveRunResponseContent(response.data))
      updateTraceFromRunResponse(response.data)
    }
    await refreshCurrentSession()
  } catch (error) {
    console.error('Halo 学习搭子重新生成失败:', error)
    replaceLastAssistantMessage('学习搭子重新生成失败，请稍后重试。')
    ElMessage.error(error.message || '重新生成失败')
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const appendLocalMessage = (message) => {
  if (!currentSession.value) {
    currentSession.value = {
      sessionId: currentSessionId.value,
      title: 'Halo 学习搭子',
      messages: []
    }
  }
  currentSession.value = {
    ...currentSession.value,
    messages: [...(currentSession.value.messages || []), message]
  }
}

const replaceLastAssistantMessage = (content) => {
  if (!currentSession.value?.messages?.length) return
  const messages = [...currentSession.value.messages]
  const lastIndex = messages.length - 1
  const lastMessage = messages[lastIndex]
  if (isAssistantMessage(lastMessage)) {
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

const resolveRunResponseContent = (data) => {
  if (!data) return ''
  if (data.structuredResult) return JSON.stringify(data.structuredResult)
  if (data.reply) return data.reply
  if (data.rawContent) return data.rawContent
  return ''
}

const extractUserDisplayContent = (content) => {
  if (!content || typeof content !== 'string') return content || ''
  const marker = '用户当前目标或问题：'
  const markerIndex = content.indexOf(marker)
  if (markerIndex < 0) return content
  const afterMarker = content.slice(markerIndex + marker.length)
  const lineBreakIndex = afterMarker.indexOf('\n')
  return (lineBreakIndex < 0 ? afterMarker : afterMarker.slice(0, lineBreakIndex)).trim() || content
}

const formatStepType = (stepType) => {
  const normalized = String(stepType || '').toUpperCase()
  const labelMap = {
    PLAN: '计划',
    TOOL: '工具',
    RAG: '知识库',
    FINAL: '最终'
  }
  return labelMap[normalized] || normalized || '步骤'
}

const formatObservation = (observation) => {
  if (!observation) return ''
  if (typeof observation !== 'string') return JSON.stringify(observation, null, 2)
  try {
    return JSON.stringify(JSON.parse(observation), null, 2)
  } catch (error) {
    return observation
  }
}

const parseAgentContent = (content) => {
  if (!content || typeof content !== 'string') return null
  let normalized = content.trim()
  if (normalized.startsWith('```')) {
    const firstBreak = normalized.indexOf('\n')
    if (firstBreak > -1) normalized = normalized.slice(firstBreak + 1)
    if (normalized.endsWith('```')) normalized = normalized.slice(0, -3)
    normalized = normalized.trim()
  }
  const firstBrace = normalized.indexOf('{')
  const lastBrace = normalized.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace <= firstBrace) return null

  try {
    return JSON.parse(normalized.slice(firstBrace, lastBrace + 1))
  } catch (error) {
    return null
  }
}

const normalizeAgentReport = (result) => {
  if (!result || typeof result !== 'object') return null
  const overview = cleanText(result.overview || result.reply || '本轮学习建议已生成。')
  const diagnosis = normalizeDiagnosis(result.diagnosis, overview)
  const evidence = normalizeEvidence(result.evidence?.length ? result.evidence : result.dataBasis)
  const questions = normalizeQuestions(result.recommendedQuestions)
  const knowledge = normalizeKnowledge(result.citedKnowledge)
  const plan = normalizePlan(result.plan)
  const actions = normalizeActions(result.nextActions)
  return {
    overview,
    diagnosis,
    evidence,
    questions,
    knowledge,
    plan,
    actions,
    confidence: cleanText(result.confidence || '中')
  }
}

const normalizeDiagnosis = (value, overview) => {
  const item = parseLooseValue(value)
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return {
      summary: cleanText(item.summary || item.value || overview),
      level: cleanText(item.level || item.status || '学习建议')
    }
  }
  return {
    summary: cleanText(item || overview),
    level: '学习建议'
  }
}

const normalizeEvidence = (value) => toLooseArray(value)
  .map((item, index) => {
    const parsed = parseLooseValue(item)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        label: cleanText(parsed.label || parsed.name || parsed.title || `依据 ${index + 1}`),
        value: cleanText(parsed.value || parsed.summary || parsed.content || humanizeObject(parsed))
      }
    }
    return {
      label: `依据 ${index + 1}`,
      value: cleanText(parsed)
    }
  })
  .filter(item => item.value)
  .slice(0, 6)

const normalizeQuestions = (value) => toLooseArray(value)
  .map((item) => {
    const parsed = parseLooseValue(item)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const id = cleanText(parsed.questionId || parsed.subjectId || parsed.id || '')
      return {
        questionId: id,
        title: cleanText(parsed.title || parsed.subjectName || parsed.name || parsed.question || parsed.content || '推荐练习题'),
        type: formatQuestionType(parsed.type || parsed.subjectType || parsed.typeName),
        reason: cleanText(parsed.reason || parsed.description || parsed.summary || parsed.explanation || ''),
        path: cleanText(parsed.path || parsed.url || (id ? `/practice/${id}` : ''))
      }
    }
    return {
      questionId: '',
      title: cleanText(parsed || '推荐练习题'),
      type: '练习题',
      reason: '',
      path: ''
    }
  })
  .filter(item => item.title)
  .slice(0, 6)

const normalizeKnowledge = (value) => toLooseArray(value)
  .map((item) => {
    const parsed = parseLooseValue(item)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        title: cleanText(parsed.title || parsed.docTitle || parsed.name || parsed.sourceTitle || '知识资料'),
        summary: cleanText(parsed.summary || parsed.content || parsed.text || parsed.reason || ''),
        source: cleanText(parsed.source || parsed.sourceType || parsed.knowledgeBaseName || '知识库'),
        path: cleanText(parsed.path || parsed.url || '')
      }
    }
    return {
      title: cleanText(parsed || '知识资料'),
      summary: '',
      source: '知识库',
      path: ''
    }
  })
  .filter(item => item.title)
  .slice(0, 5)

const normalizePlan = (value) => toLooseArray(value)
  .map((item, index) => {
    const parsed = parseLooseValue(item)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const tasks = toLooseArray(parsed.tasks || parsed.items || parsed.actions)
        .map(task => cleanText(task))
        .filter(Boolean)
      return {
        day: Number(parsed.day || parsed.step || index + 1),
        title: cleanText(parsed.title || parsed.name || `第 ${index + 1} 天`),
        tasks: tasks.length ? tasks : [cleanText(parsed.summary || parsed.content || '完成本阶段复盘任务')]
      }
    }
    return {
      day: index + 1,
      title: `第 ${index + 1} 天`,
      tasks: [cleanText(parsed)]
    }
  })
  .filter(item => item.title && item.tasks.length)
  .slice(0, 7)

const normalizeActions = (value) => toLooseArray(value)
  .map((item) => {
    const parsed = parseLooseValue(item)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const label = cleanText(parsed.label || parsed.title || parsed.name || parsed.text || '继续学习')
      return {
        label,
        path: cleanText(parsed.path || parsed.url || inferActionPath(label)),
        description: cleanText(parsed.description || parsed.reason || parsed.summary || '')
      }
    }
    const label = cleanText(parsed || '继续学习')
    return {
      label,
      path: inferActionPath(label),
      description: ''
    }
  })
  .filter(item => item.label)
  .slice(0, 5)

const toLooseArray = (value) => {
  const parsed = parseLooseValue(value)
  if (Array.isArray(parsed)) return parsed.flatMap(item => toLooseArray(item))
  if (parsed === null || parsed === undefined || parsed === '') return []
  return [parsed]
}

const parseLooseValue = (value) => {
  if (typeof value !== 'string') return value
  const normalized = value.trim()
  if (!normalized) return ''
  if (!looksLikeJson(normalized)) return normalized
  try {
    return JSON.parse(normalized)
  } catch (error) {
    return normalized
  }
}

const looksLikeJson = (value) => (
  (value.startsWith('{') && value.endsWith('}')) ||
  (value.startsWith('[') && value.endsWith(']'))
)

const cleanText = (value) => {
  const parsed = parseLooseValue(value)
  if (parsed === null || parsed === undefined) return ''
  if (typeof parsed === 'object') return humanizeObject(parsed)
  return extractReadableReportText(String(parsed)).replace(/\s+/g, ' ').trim()
}

const extractReadableReportText = (value) => {
  const text = String(value || '')
  const parsed = parseAgentContent(text)
  if (!parsed || typeof parsed !== 'object') return text
  if (parsed.reply) return cleanText(parsed.reply)
  if (parsed.overview) return cleanText(parsed.overview)
  if (parsed.diagnosis?.summary) return cleanText(parsed.diagnosis.summary)
  if (parsed.summary) return cleanText(parsed.summary)
  return humanizeObject(parsed)
}

const humanizeObject = (value) => {
  if (!value || typeof value !== 'object') return cleanText(value)
  const preferredKeys = ['label', 'value', 'title', 'name', 'summary', 'content', 'reason', 'description']
  const parts = preferredKeys
    .map(key => value[key])
    .filter(item => item !== null && item !== undefined && item !== '')
    .map(item => String(item).replace(/\s+/g, ' ').trim())
  if (parts.length) return parts.slice(0, 2).join('：')
  return Object.entries(value)
    .slice(0, 3)
    .map(([key, item]) => `${key}: ${typeof item === 'object' ? '已读取' : item}`)
    .join('，')
}

const formatQuestionType = (value) => {
  const normalized = cleanText(value)
  const typeMap = {
    0: '综合',
    1: '单选',
    2: '多选',
    3: '判断',
    4: '简答'
  }
  return typeMap[normalized] || normalized || '练习题'
}

const inferActionPath = (label = '') => {
  if (/刷题|练习|做题/.test(label)) return '/practice'
  if (/题库|选题/.test(label)) return '/home/questions'
  if (/历史|复盘/.test(label)) return '/practice-history'
  if (/博客|文章/.test(label)) return '/blog/list'
  if (/社区|讨论/.test(label)) return '/community'
  return ''
}

const navigateReportAction = (action) => {
  const path = action?.path
  if (!path) return
  if (/^https?:\/\//i.test(path)) {
    window.open(path, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(path)
}

const summarizeObservation = (step) => {
  if (!step?.observation) return ''
  const actionName = step.actionName || ''
  const parsed = parseLooseValue(step.observation)
  if (Array.isArray(parsed)) return `已读取 ${parsed.length} 条结果。`
  if (parsed && typeof parsed === 'object') {
    const result = parsed.data || parsed.result || parsed.records || parsed.list
    if (Array.isArray(result)) return `已读取 ${result.length} 条结果。`
    const total = parsed.total || parsed.count || parsed.totalCount
    if (total !== undefined) return `已读取统计结果，共 ${total} 条。`
    return '已读取结构化业务数据。'
  }
  if (actionName.includes('Knowledge')) return '已完成知识库检索。'
  if (actionName.includes('Practice')) return '已读取练习相关数据。'
  if (actionName.includes('Subject')) return '已读取题库相关数据。'
  return cleanText(step.observation).slice(0, 80)
}

const renderAssistantReply = (content) => {
  const parsed = parseAgentContent(content)
  return renderAiMarkdown(parsed?.reply || parsed?.overview || content || '')
}

const renderFallbackReply = (content) => renderAiMarkdown(content || '')

const formatSessionTime = (value) => {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatMessageTime = (value) => {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const scrollToBottom = async () => {
  await nextTick()
  const container = messageContainerRef.value
  if (!container) return
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
.halo-study-page {
  height: 100dvh;
  min-height: 100dvh;
  --study-bg: linear-gradient(180deg, #f8fbfc 0%, #eef4f6 100%);
  --study-surface: rgba(255, 255, 255, 0.92);
  --study-surface-strong: #ffffff;
  --study-muted: rgba(241, 245, 249, 0.92);
  --study-border: rgba(15, 23, 42, 0.08);
  --study-text: #0f172a;
  --study-soft: #475569;
  --study-faint: #64748b;
  --study-accent: #0f766e;
  --study-accent-soft: rgba(15, 118, 110, 0.1);
  --study-accent-line: rgba(15, 118, 110, 0.2);
  background: var(--study-bg);
  overflow: hidden;
}

.halo-study-page.is-dark {
  --study-bg: linear-gradient(180deg, #08111f 0%, #0d1726 100%);
  --study-surface: rgba(15, 23, 42, 0.92);
  --study-surface-strong: rgba(8, 13, 24, 0.96);
  --study-muted: rgba(30, 41, 59, 0.82);
  --study-border: rgba(148, 163, 184, 0.15);
  --study-text: #e2e8f0;
  --study-soft: #cbd5e1;
  --study-faint: #94a3b8;
  --study-accent: #5eead4;
  --study-accent-soft: rgba(94, 234, 212, 0.12);
  --study-accent-line: rgba(94, 234, 212, 0.2);
}

.study-main {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 1500px;
  height: 100dvh;
  margin: 0 auto;
  padding: 10px 16px 14px;
}

.study-workspace {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 300px;
  gap: 12px;
  min-height: 0;
}

.study-sidebar,
.study-stage,
.insight-rail {
  min-height: 0;
}

.study-sidebar {
  display: grid;
  grid-template-rows: auto minmax(150px, 0.68fr) minmax(132px, 0.58fr);
  gap: 10px;
  min-width: 0;
  overflow: hidden;
}

.study-stage {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 10px;
  min-width: 0;
}

.insight-rail {
  min-width: 0;
}

.panel,
.message-area {
  border: 1px solid var(--study-border);
  background: var(--study-surface);
  border-radius: 12px;
}

.panel {
  min-width: 0;
  padding: 12px;
}

.toolbar-head,
.panel-title,
.stage-topbar,
.stage-meta,
.mini-row,
.composer-options,
.composer-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-head,
.panel-title,
.stage-topbar {
  justify-content: space-between;
}

.toolbar-head strong,
.panel-title strong {
  color: var(--study-accent);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.panel-title span,
.mini-row span {
  color: var(--study-faint);
  font-size: 11px;
  font-weight: 700;
}

.mini-row {
  margin-top: 10px;
  flex-wrap: wrap;
}

.mini-row span,
.meta-pill {
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--study-muted);
}

.primary-action,
.primary-button,
.ghost-button,
.prompt-button,
.icon-button {
  border: none;
  cursor: pointer;
  font-weight: 700;
}

.primary-action,
.primary-button {
  min-height: 34px;
  border-radius: 9px;
  background: var(--study-accent);
  color: #ffffff;
}

.primary-action {
  padding: 0 12px;
}

.primary-button {
  min-width: 78px;
  padding: 0 14px;
}

.ghost-button {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--study-border);
  border-radius: 9px;
  background: transparent;
  color: var(--study-text);
}

.sidebar-list,
.prompt-panel,
.insight-panel {
  min-height: 0;
  overflow: hidden;
}

.session-list,
.prompt-list,
.insight-list {
  display: grid;
  gap: 8px;
  min-height: 0;
  max-height: calc(100% - 30px);
  margin-top: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
}

.session-item,
.prompt-button {
  border: 1px solid var(--study-border);
  background: var(--study-muted);
  border-radius: 10px;
  text-align: left;
}

.session-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 56px;
  width: 100%;
  min-width: 0;
  padding: 10px 44px 10px 10px;
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.session-item.active {
  border-color: var(--study-accent-line);
  background: var(--study-accent-soft);
}

.session-item:hover {
  transform: translateY(-1px);
}

.session-content {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.session-title,
.prompt-button {
  color: var(--study-text);
  font-size: 12px;
  line-height: 1.45;
}

.session-title {
  overflow: hidden;
  display: -webkit-box;
  font-weight: 800;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}

.session-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  color: var(--study-faint);
  font-size: 10px;
}

.session-meta span {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-input {
  width: 100%;
  min-height: 32px;
  border: 1px solid var(--study-accent-line);
  border-radius: 8px;
  background: var(--study-surface-strong);
  color: var(--study-text);
  padding: 0 8px;
  outline: none;
}

.session-actions {
  position: absolute;
  top: 50%;
  right: 7px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.16s ease;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--study-surface);
  color: var(--study-faint);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.icon-button svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon-button:hover {
  background: var(--study-accent-soft);
  color: var(--study-accent);
}

.icon-button:active {
  transform: scale(0.94);
}

.icon-button.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.prompt-button {
  min-height: 40px;
  padding: 9px 10px;
  width: 100%;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stage-topbar {
  padding: 8px 12px;
}

.stage-title {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.stage-title span {
  color: var(--study-faint);
  font-size: 10px;
  font-weight: 800;
}

.stage-title strong {
  overflow: hidden;
  color: var(--study-text);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-meta {
  flex-wrap: wrap;
}

.meta-pill {
  color: var(--study-soft);
  font-size: 11px;
  font-weight: 800;
}

.meta-pill.active {
  color: var(--study-accent);
  background: var(--study-accent-soft);
}

.message-area {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  background: linear-gradient(180deg, rgba(15, 118, 110, 0.04), transparent 18%), var(--study-surface);
}

.empty-stage {
  display: grid;
  place-items: center;
  min-height: 100%;
  color: var(--study-soft);
  text-align: center;
}

.empty-mark {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 10px;
  border-radius: 15px;
  background: var(--study-accent-soft);
  color: var(--study-accent);
  font-weight: 900;
}

.empty-stage h3 {
  margin: 0 0 6px;
  color: var(--study-text);
  font-size: 18px;
}

.empty-stage p,
.empty-small {
  margin: 0;
  color: var(--study-faint);
  font-size: 12px;
  line-height: 1.6;
}

.message-card {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 10px;
  max-width: min(86%, 920px);
}

.message-card.user {
  justify-self: end;
  grid-template-columns: minmax(0, 1fr) 32px;
}

.message-card.user .avatar {
  grid-column: 2;
}

.message-card.user .message-body {
  grid-column: 1;
}

.message-card.assistant {
  justify-self: start;
}

.avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 900;
}

.avatar-user {
  background: var(--study-muted);
  color: var(--study-text);
}

.avatar-agent {
  background: var(--study-accent-soft);
  color: var(--study-accent);
}

.message-body {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--study-border);
  border-radius: 12px;
  background: var(--study-surface-strong);
}

.message-card.assistant .message-body {
  border-color: var(--study-accent-line);
}

.message-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--study-faint);
  font-size: 11px;
}

.message-head strong {
  color: var(--study-text);
  font-size: 12px;
}

.message-reply {
  color: var(--study-text);
  font-size: 14px;
  line-height: 1.75;
  word-break: break-word;
}

.message-body :deep(.ai-message-actions) {
  margin-top: 8px;
}

.message-body :deep(.action-btn) {
  color: var(--study-faint);
}

.message-body :deep(.action-btn:hover:not(:disabled)) {
  background: var(--study-accent-soft);
  color: var(--study-accent);
}

.agent-report {
  display: grid;
  gap: 10px;
}

.report-summary {
  position: relative;
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--study-accent-line);
  border-radius: 10px;
  background: linear-gradient(135deg, var(--study-accent-soft), rgba(255, 255, 255, 0.42));
}

.halo-study-page.is-dark .report-summary {
  background: linear-gradient(135deg, var(--study-accent-soft), rgba(15, 23, 42, 0.32));
}

.report-summary > div {
  display: grid;
  gap: 3px;
}

.report-kicker {
  color: var(--study-accent);
  font-size: 10px;
  font-weight: 900;
}

.report-summary strong {
  color: var(--study-text);
  font-size: 16px;
  line-height: 1.35;
}

.report-summary p {
  max-width: 720px;
  margin: 0;
  color: var(--study-soft);
  font-size: 13px;
  line-height: 1.65;
}

.confidence-chip {
  justify-self: start;
  min-height: 24px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--study-surface-strong);
  color: var(--study-accent);
  font-size: 11px;
  font-weight: 900;
}

.report-section {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.report-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.report-section-head strong,
.insight-block span {
  color: var(--study-text);
  font-size: 11px;
  font-weight: 900;
}

.report-section-head span {
  color: var(--study-faint);
  font-size: 11px;
  font-weight: 800;
}

.evidence-list,
.question-list,
.knowledge-list,
.plan-list,
.action-list {
  display: grid;
  gap: 8px;
}

.evidence-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.evidence-item,
.question-card,
.knowledge-item,
.plan-item,
.report-action {
  min-width: 0;
  border: 1px solid var(--study-border);
  border-radius: 10px;
  background: var(--study-muted);
}

.evidence-item {
  display: grid;
  gap: 4px;
  padding: 9px 10px;
}

.evidence-item span,
.question-headline span,
.knowledge-item span {
  color: var(--study-accent);
  font-size: 10px;
  font-weight: 900;
}

.evidence-item strong,
.question-headline strong,
.knowledge-item strong,
.plan-item strong {
  color: var(--study-text);
  font-size: 12px;
  line-height: 1.45;
}

.question-card,
.knowledge-item {
  display: grid;
  gap: 7px;
  padding: 10px;
}

.question-headline {
  display: grid;
  gap: 4px;
}

.question-card p,
.knowledge-item p,
.plan-item li,
.insight-block p {
  margin: 0;
  color: var(--study-soft);
  font-size: 12px;
  line-height: 1.65;
}

.inline-link {
  justify-self: start;
  border: none;
  background: transparent;
  color: var(--study-accent);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
}

.plan-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 9px;
  padding: 10px;
}

.plan-item > span {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--study-accent-soft);
  color: var(--study-accent);
  font-size: 11px;
  font-weight: 900;
}

.plan-item div {
  display: grid;
  gap: 5px;
}

.plan-item ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 16px;
}

.report-action {
  display: grid;
  gap: 3px;
  padding: 10px;
  color: var(--study-text);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.report-action:hover {
  border-color: var(--study-accent-line);
  background: var(--study-accent-soft);
  transform: translateY(-1px);
}

.report-action span {
  color: var(--study-text);
  font-size: 12px;
  font-weight: 900;
}

.report-action small {
  color: var(--study-soft);
  font-size: 11px;
  line-height: 1.45;
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
  background: var(--study-accent);
  animation: pulse 1.2s infinite ease-in-out;
}

.loading-bar span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-bar span:nth-child(3) {
  animation-delay: 0.3s;
}

.composer {
  display: grid;
  gap: 10px;
}

.composer-options,
.composer-controls {
  flex-wrap: wrap;
}

.option-switch,
.composer-controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--study-soft);
  font-size: 11px;
  font-weight: 800;
}

.option-switch input {
  accent-color: var(--study-accent);
}

.composer-controls select,
.composer-controls input {
  min-height: 32px;
  max-width: 100px;
  padding: 0 8px;
  border: 1px solid var(--study-border);
  border-radius: 8px;
  background: var(--study-muted);
  color: var(--study-text);
}

.composer textarea {
  width: 100%;
  min-height: 74px;
  resize: none;
  border: 1px solid var(--study-border);
  border-radius: 10px;
  background: var(--study-muted);
  color: var(--study-text);
  padding: 11px 12px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  outline: none;
}

.insight-panel {
  height: 100%;
}

.insight-list {
  max-height: calc(100% - 34px);
}

.insight-block {
  display: grid;
  gap: 7px;
  padding: 10px;
  border: 1px solid var(--study-border);
  border-radius: 10px;
  background: var(--study-muted);
}

.insight-block ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 16px;
  color: var(--study-soft);
  font-size: 12px;
  line-height: 1.55;
}

.trace-list {
  align-content: start;
}

.trace-block {
  display: grid;
  gap: 7px;
  padding: 10px;
  border: 1px solid var(--study-border);
  border-left: 3px solid var(--study-accent);
  border-radius: 10px;
  background: var(--study-muted);
}

.trace-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.trace-head span {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--study-accent-soft);
  color: var(--study-accent);
  font-size: 11px;
  font-weight: 900;
}

.trace-head small {
  color: var(--study-faint);
  font-size: 10px;
  font-weight: 800;
}

.trace-block strong {
  overflow: hidden;
  color: var(--study-text);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trace-block p {
  margin: 0;
  color: var(--study-soft);
  font-size: 12px;
  line-height: 1.55;
}

.trace-block details {
  color: var(--study-faint);
  font-size: 11px;
}

.trace-block summary {
  cursor: pointer;
  font-weight: 800;
}

.trace-block pre {
  max-height: 160px;
  margin: 8px 0 0;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--study-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.5;
}

.trace-rag {
  border-left-color: #2563eb;
}

.trace-tool {
  border-left-color: #d97706;
}

.trace-final {
  border-left-color: #16a34a;
}

.message-area::-webkit-scrollbar,
.session-list::-webkit-scrollbar,
.prompt-list::-webkit-scrollbar,
.insight-list::-webkit-scrollbar {
  width: 6px;
}

.message-area::-webkit-scrollbar-thumb,
.session-list::-webkit-scrollbar-thumb,
.prompt-list::-webkit-scrollbar-thumb,
.insight-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.18);
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

@media (max-width: 1220px) {
  .study-workspace {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .insight-rail {
    display: none;
  }
}

@media (max-width: 900px) {
  .halo-study-page,
  .study-main {
    height: auto;
    min-height: 100dvh;
  }

  .study-workspace {
    grid-template-columns: 1fr;
  }

  .study-sidebar {
    grid-template-rows: auto auto auto;
  }

  .session-actions {
    opacity: 1;
  }

  .evidence-list {
    grid-template-columns: 1fr;
  }

  .message-card,
  .message-card.user {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .study-main {
    padding: 8px 10px 12px;
  }

  .stage-topbar,
  .composer-controls {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .ghost-button,
  .composer-controls label,
  .composer-controls select,
  .composer-controls input {
    width: 100%;
    max-width: none;
  }
}
</style>
