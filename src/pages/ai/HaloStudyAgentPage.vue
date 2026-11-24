<template>
  <div class="ai-zone app-shell app-shell--internal">
    <main class="ai-zone__main">
      <AIToolHeader />

      <section class="ai-workbench partner-workbench" aria-label="学习搭子">
        <ChatHistory
          class="partner-history"
          :groups="historyGroups"
          :active-session-id="currentSessionId"
          :busy="busy"
          :loading="isHistoryLoading"
          :error="historyError"
          @select="openConversation"
          @create="newConversation"
          @rename="renameSession"
          @delete="deleteSession"
          @retry="loadHistory()"
        />

        <section class="partner-stage" aria-labelledby="partner-title">
          <header class="partner-stage__heading">
            <div class="partner-title-copy">
              <h1 id="partner-title">学习搭子</h1>
              <p :title="currentSession?.title">{{ currentSession?.title || '结合站内资料，把学习问题变成行动。' }}</p>
            </div>
            <div class="partner-tools">
              <button class="ai-workbench__button partner-history-trigger" type="button" aria-haspopup="dialog" @click="historyOpen = true">
                <el-icon aria-hidden="true"><Clock /></el-icon>
                历史
              </button>
              <button class="ai-workbench__button" type="button" aria-haspopup="dialog" @click="settingsOpen = true">
                <el-icon aria-hidden="true"><Setting /></el-icon>
                回答设置
              </button>
              <button class="ai-workbench__button" type="button" aria-haspopup="dialog" @click="traceOpen = true">
                <el-icon aria-hidden="true"><Operation /></el-icon>
                运行轨迹
                <span v-if="currentTrace?.steps.length" class="partner-tools__count">{{ currentTrace.steps.length }}</span>
              </button>
            </div>
          </header>

          <div ref="threadRef" class="partner-thread" tabindex="0" role="region" aria-label="学习搭子对话内容">
            <div class="partner-column">
              <p v-if="isHistoryLoading || isSelecting" class="partner-status" role="status">正在读取会话…</p>
              <div v-else-if="!messages.length" class="partner-welcome">
                <el-icon aria-hidden="true"><ChatLineRound /></el-icon>
                <h2>今天想练什么？</h2>
                <p>可以让学习搭子结合练习记录和站内资料帮你选题，也可以一起拆一个学习目标。</p>
                <div class="partner-prompts">
                  <button v-for="prompt in quickPrompts" :key="prompt" type="button" :disabled="busy" @click="usePrompt(prompt)">
                    {{ prompt }}
                    <el-icon aria-hidden="true"><ArrowRight /></el-icon>
                  </button>
                </div>
              </div>

              <template v-else>
                <article
                  v-for="(message, index) in messages"
                  :key="`${currentSessionId}-${index}`"
                  class="study-message"
                  :class="{ 'study-message--user': isUserMessage(message), 'study-message--anchor': index === latestStart }"
                >
                  <header class="study-message__byline">
                    <strong>{{ isUserMessage(message) ? '你' : 'Halo 学习搭子' }}</strong>
                    <span v-if="formatAgentTime(message)">{{ formatAgentTime(message) }}</span>
                  </header>
                  <div v-if="isUserMessage(message)" class="study-message__question ai-markdown" v-html="renderAiMarkdown(userGoal(message))"></div>
                  <StudyAnswer
                    v-else
                    :message="message"
                    :session-id="currentSessionId"
                    :index="index"
                    :busy="busy"
                    :allow-retry="index === messages.length - 1 && latestUserIndex >= 0"
                    @regenerate="regenerateAnswer"
                    @retry="retryAnswer"
                  />
                </article>
              </template>
            </div>
          </div>

          <div class="partner-dock">
            <form class="partner-column partner-compose" @submit.prevent="sendMessage">
              <textarea
                ref="inputRef"
                v-model="draft"
                class="ai-workbench__control"
                rows="2"
                :disabled="busy"
                aria-label="询问学习搭子"
                placeholder="例如：根据最近的练习，帮我选几道该复习的题。"
                @keydown="handleComposerKey"
              ></textarea>
              <div class="partner-compose__tools">
                <p :title="sourceSummary">{{ sourceSummary }}</p>
                <button class="ai-workbench__button ai-workbench__button--primary" type="submit" :disabled="!draft.trim() || busy">
                  {{ isRunning ? '正在回复…' : '发送问题' }}
                  <el-icon aria-hidden="true"><ArrowUp /></el-icon>
                </button>
              </div>
            </form>
          </div>
        </section>
      </section>

      <AgentSidePanel v-model="historyOpen" title="学习搭子历史会话" direction="ltr" size="min(326px, 90vw)" @opened="historyRef?.scrollToActive()">
        <ChatHistory
          ref="historyRef"
          :groups="historyGroups"
          :active-session-id="currentSessionId"
          :busy="busy"
          :loading="isHistoryLoading"
          :error="historyError"
          @select="openConversation"
          @create="newConversation"
          @rename="renameSession"
          @delete="deleteSession"
          @retry="loadHistory()"
        />
      </AgentSidePanel>

      <AgentSidePanel v-model="settingsOpen" title="回答设置">
        <div class="partner-settings">
          <p>设置仅影响下一次回答，不会改变已经生成的内容。</p>
          <fieldset :disabled="isRunning">
            <legend>参考资料</legend>
            <label class="partner-check"><input v-model="includeRecentPractice" type="checkbox"> 最近练习记录</label>
            <label class="partner-check"><input v-model="enableRag" type="checkbox"> 知识库</label>
            <label class="partner-check"><input v-model="includeCommunityContent" type="checkbox"> 博客和社区</label>
            <label v-if="enableRag" class="partner-setting-field">
              <span>知识库编号 <small>选填</small></span>
              <input
                v-model.trim="knowledgeBaseId"
                class="ai-workbench__control"
                type="text"
                inputmode="numeric"
                placeholder="留空时自动选择"
                :aria-invalid="!knowledgeIdValid"
                :aria-describedby="knowledgeIdValid ? undefined : 'study-knowledge-id-error'"
              >
            </label>
            <p v-if="!knowledgeIdValid" id="study-knowledge-id-error" class="partner-settings__error" role="alert">请填写有效的数字编号，或留空自动选择。</p>
          </fieldset>
          <fieldset :disabled="isRunning">
            <legend>回答内容</legend>
            <div class="partner-setting-fields">
              <label class="partner-setting-field">
                <span>练习分析区间</span>
                <select v-model.number="timeRangeDays" class="ai-workbench__control">
                  <option :value="3">近 3 天</option>
                  <option :value="7">近 7 天</option>
                  <option :value="14">近 14 天</option>
                </select>
              </label>
              <label class="partner-setting-field">
                <span>复习计划天数</span>
                <select v-model.number="planDays" class="ai-workbench__control">
                  <option :value="1">1 天</option>
                  <option :value="3">3 天</option>
                  <option :value="7">7 天</option>
                </select>
              </label>
            </div>
            <label class="partner-check"><input v-model="includeQuestionRecommendations" type="checkbox"> 附带推荐题目</label>
            <label class="partner-check"><input v-model="useStreaming" type="checkbox"> 流式回复</label>
          </fieldset>
          <button class="ai-workbench__button ai-workbench__button--primary" type="button" :disabled="!knowledgeIdValid" @click="settingsOpen = false">完成</button>
        </div>
      </AgentSidePanel>

      <AgentSidePanel v-model="traceOpen" title="运行轨迹">
        <StudyTrace :trace="currentTrace" />
      </AgentSidePanel>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ArrowRight, ArrowUp, ChatLineRound, Clock, Operation, Setting } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
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
import { formatAgentTime, isAssistantMessage, isUserMessage, runResultBody, userGoal } from './agentPresentation'
import { useAgentSessions } from './useAgentSessions'
import AgentSidePanel from './components/AgentSidePanel.vue'
import AIToolHeader from './components/AIToolHeader.vue'
import ChatHistory from './components/ChatHistory.vue'
import StudyAnswer from './components/StudyAnswer.vue'
import StudyTrace from './components/StudyTrace.vue'

const route = useRoute()
const user = useUserStore()
const {
  currentSession, currentSessionId, historyGroups, isHistoryLoading, historyError, isSelecting, sessionBusy,
  loadHistory, selectSession, createSession, renameSession, deleteSession, appendMessage, updateLastReply, syncAfterRun
} = useAgentSessions('学习搭子', {
  list: getHaloStudySessions,
  detail: getHaloStudySession,
  create: createHaloStudySession,
  rename: updateHaloStudySessionTitle,
  remove: deleteHaloStudySession
})

const draft = ref('')
const inputRef = ref(null)
const threadRef = ref(null)
const historyRef = ref(null)
const historyOpen = ref(false)
const settingsOpen = ref(false)
const traceOpen = ref(false)
const isRunning = ref(false)
const useStreaming = ref(true)
const enableRag = ref(true)
const includeRecentPractice = ref(true)
const includeQuestionRecommendations = ref(true)
const includeCommunityContent = ref(true)
const timeRangeDays = ref(7)
const planDays = ref(3)
const knowledgeBaseId = ref('')
const tracesBySession = reactive(new Map())

const busy = computed(() => sessionBusy.value || isRunning.value)
const messages = computed(() => currentSession.value?.messages || [])
const latestUserIndex = computed(() => messages.value.findLastIndex(isUserMessage))
const latestStart = computed(() => latestUserIndex.value < 0 ? messages.value.length - 1 : latestUserIndex.value)
const currentTrace = computed(() => tracesBySession.get(currentSessionId.value) || null)
const knowledgeIdValid = computed(() => {
  if (!enableRag.value || !knowledgeBaseId.value) return true
  const value = Number(knowledgeBaseId.value)
  return /^\d+$/.test(knowledgeBaseId.value) && Number.isSafeInteger(value) && value > 0
})

const sourceSummary = computed(() => {
  const sources = []
  if (includeRecentPractice.value) sources.push('练习记录')
  if (enableRag.value) sources.push('知识库')
  if (includeCommunityContent.value) sources.push('博客社区')
  return sources.length ? `回答可参考：${sources.join('、')}` : '没有选用额外参考资料'
})

const quickPrompts = ref([
  '根据我最近的练习记录，推荐几道应该复习的题',
  '结合知识库资料，帮我复习 Spring Boot 自动配置',
  '我要准备 Java 后端面试，帮我制定三天学习计划',
  '站内有哪些博客或社区内容适合我继续学习？'
])

const usePrompt = (prompt) => {
  if (busy.value) return
  draft.value = prompt
  inputRef.value?.focus()
}

const revealLatestTurn = async () => {
  await nextTick()
  const thread = threadRef.value
  const anchor = thread?.querySelector('.study-message--anchor')
  if (!thread || !anchor) return
  thread.scrollTop += anchor.getBoundingClientRect().top - thread.getBoundingClientRect().top - 16
}

const openConversation = async (sessionId) => {
  if (busy.value) return
  historyOpen.value = false
  if (await selectSession(sessionId)) await revealLatestTurn()
}

const newConversation = async () => {
  if (busy.value) return
  historyOpen.value = false
  if (await createSession()) draft.value = ''
}

const handleComposerKey = (event) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) return
  event.preventDefault()
  sendMessage()
}

const sendMessage = () => ask(draft.value, false, true)
const retryAnswer = () => ask(userGoal(messages.value[latestUserIndex.value]), true)

const regenerateAnswer = (index) => {
  const question = messages.value[index - 1]
  if (isUserMessage(question)) ask(userGoal(question))
}

const readTraceSteps = async (trace) => {
  if (!trace.runId || trace.steps.length) return
  try {
    const response = await getHaloStudyRunSteps(trace.runId, user.userId)
    if (response.success && Array.isArray(response.data)) trace.steps = response.data
  } catch {
    // 回答可先阅读，轨迹查询失败不影响结果。
  }
}

const recordTraceStep = (trace, event) => {
  const stepNo = event.stepNo ?? trace.steps.length + 1
  const step = {
    stepNo,
    stepType: event.stepType || event.type.toUpperCase(),
    actionName: event.actionName,
    observation: event.observation,
    decisionSummary: event.decisionSummary || event.content,
    status: event.status,
    costTimeMs: event.costTimeMs
  }
  const index = trace.steps.findIndex(item => item.stepNo === stepNo)
  if (index >= 0) trace.steps.splice(index, 1, step)
  else trace.steps.push(step)
  trace.steps.sort((left, right) => Number(left.stepNo) - Number(right.stepNo))
}

const ask = async (text, retry = false, consumeDraft = false) => {
  const goal = String(text || '').trim()
  if (!goal || busy.value) return
  if (!knowledgeIdValid.value) {
    settingsOpen.value = true
    return
  }

  isRunning.value = true
  let trace = null
  try {
    const session = currentSession.value || await createSession(goal)
    if (!session) return
    const sessionId = session.sessionId
    trace = reactive({ runId: '', steps: [], status: 'running' })
    tracesBySession.set(sessionId, trace)
    const payload = {
      sessionId,
      goal,
      knowledgeBaseId: enableRag.value && knowledgeBaseId.value ? Number(knowledgeBaseId.value) : null,
      enableRag: enableRag.value,
      includeRecentPractice: includeRecentPractice.value,
      includeQuestionRecommendations: includeQuestionRecommendations.value,
      includeCommunityContent: includeCommunityContent.value,
      recommendedSubjectLimit: 5,
      timeRangeDays: timeRangeDays.value,
      planDays: planDays.value,
      enableTrace: true,
      maxSteps: 8
    }

    if (retry && isAssistantMessage(messages.value.at(-1))) {
      updateLastReply('正在重新准备学习建议…', 'pending')
    } else {
      if (!retry) appendMessage('user', goal)
      appendMessage('assistant', '正在查找相关学习资料…', { state: 'pending' })
    }
    if (consumeDraft) draft.value = ''
    await revealLatestTurn()
    const initialPosition = threadRef.value?.scrollTop

    let packet = null
    let streamText = ''
    let errorText = ''
    if (useStreaming.value) {
      await runHaloStudyStream(payload, user.userId, (event) => {
        if (!event?.type) return
        if (event.runId) trace.runId = event.runId
        if (event.type === 'start') updateLastReply(event.content || '正在查找相关学习资料…', 'pending')
        else if (['plan', 'tool', 'rag', 'final'].includes(event.type)) recordTraceStep(trace, event)
        else if (event.type === 'chunk') {
          streamText += event.content || ''
          if (streamText.trim()) updateLastReply(streamText, 'streaming')
        } else if (event.type === 'done') packet = event
        else if (event.type === 'error') errorText = event.content || '回答未完成。'
      })
      if (!packet && !errorText) errorText = '回复中断。'
    } else {
      const response = await runHaloStudy(payload, user.userId)
      if (!response?.success) errorText = response?.message || '回答未完成。'
      else {
        packet = response.data
        trace.runId = packet?.runId || ''
        if (Array.isArray(packet?.traceSteps)) trace.steps = packet.traceSteps
      }
    }

    if (errorText) throw new Error(errorText)
    const stayAtLatest = threadRef.value?.scrollTop === initialPosition
    const answer = runResultBody(packet) || streamText
    updateLastReply(answer, 'complete')
    trace.status = 'complete'
    if (stayAtLatest) await revealLatestTurn()
    const savedId = String(packet?.sessionId || sessionId)
    tracesBySession.set(savedId, trace)
    const sessionRefresh = answer ? syncAfterRun(savedId) : null
    await Promise.all([sessionRefresh, readTraceSteps(trace)])
    if (savedId !== sessionId && currentSessionId.value === savedId) tracesBySession.delete(sessionId)
  } catch {
    if (trace) trace.status = 'failed'
    updateLastReply('这次未能完成回答，可以使用原问题重试。', 'failed')
  } finally {
    isRunning.value = false
  }
}

const loadCapabilities = async () => {
  try {
    const response = await getHaloStudyCapabilities()
    const prompts = response.data?.examplePrompts
    if (response.success && Array.isArray(prompts) && prompts.length) quickPrompts.value = prompts
  } catch {
    // 默认示例仍可用。
  }
}

onMounted(async () => {
  const preferredId = typeof route.query.sessionId === 'string' ? route.query.sessionId : ''
  loadCapabilities()
  await loadHistory(preferredId)
  await revealLatestTurn()
})
</script>

<style scoped>
.partner-workbench {
  grid-template-columns: 256px minmax(0, 1fr);
}

.partner-history {
  border-right: 1px solid var(--internal-panel-border);
}

.partner-stage {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-width: 0;
  min-height: 0;
}

.partner-stage__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 12px var(--workbench-padding);
  border-bottom: 1px solid var(--internal-panel-border);
}

.partner-title-copy {
  min-width: 0;
}

.partner-title-copy h1 {
  margin: 0 0 2px;
  font-size: 20px;
  line-height: 1.3;
}

.partner-title-copy p {
  overflow: hidden;
  color: var(--text-2);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.partner-tools {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 6px;
}

.partner-tools__count {
  color: var(--color-accent);
  font-size: 12px;
}

.partner-history-trigger {
  display: none;
}

.partner-thread {
  min-height: 0;
  padding: 18px var(--workbench-padding);
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.partner-thread:focus-visible {
  outline-offset: -2px;
}

.partner-column {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
}

.partner-status,
.partner-welcome p {
  color: var(--text-2);
  font-size: 14px;
}

.partner-welcome {
  max-width: 650px;
  margin: clamp(0px, 6vh, 54px) auto 12px;
  text-align: left;
}

.partner-welcome > .el-icon {
  color: var(--color-accent);
  font-size: 24px;
}

.partner-welcome h2 {
  margin: 3px 0 6px;
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.3;
}

.partner-prompts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  margin-top: 14px;
}

.partner-prompts button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  padding: 7px 9px;
  border: 1px solid var(--internal-panel-border-strong);
  border-radius: var(--radius-md);
  color: var(--text-1);
  font-size: 13px;
  line-height: 1.45;
  text-align: left;
}

.partner-prompts button:hover:not(:disabled) {
  border-color: var(--color-accent-subtle);
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.partner-prompts button:disabled {
  cursor: default;
  opacity: 0.55;
}

.partner-prompts button .el-icon {
  flex: none;
  color: var(--color-accent);
}

.study-message {
  min-width: 0;
  overflow-wrap: anywhere;
}

.study-message + .study-message {
  margin-top: 18px;
}

.study-message--user {
  width: fit-content;
  max-width: min(100%, 36rem);
  margin-left: auto;
  padding: 8px 12px;
  border-radius: 12px 12px 4px 12px;
  background: var(--color-accent-light);
}

.study-message__byline {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
  color: var(--color-accent);
  font-size: 13px;
}

.study-message__byline span {
  color: var(--text-2);
  font-size: 11px;
}

.study-message__question {
  font-size: 14px;
}

.partner-dock {
  padding: 10px var(--workbench-padding) 13px;
  border-top: 1px solid var(--internal-panel-border);
  background: var(--internal-panel-bg-alt);
}

.partner-compose textarea {
  display: block;
  min-height: 48px;
  max-height: min(21dvh, 150px);
  field-sizing: content;
  resize: none;
}

.partner-compose__tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
  margin-top: 8px;
}

.partner-compose__tools p {
  color: var(--text-2);
  font-size: 12px;
  line-height: 1.45;
}

.partner-compose__tools button {
  flex: none;
}

.partner-settings {
  padding: 16px 18px 24px;
  font-size: 14px;
}

.partner-settings > p {
  margin-bottom: 14px;
  color: var(--text-2);
}

.partner-settings fieldset {
  display: grid;
  min-width: 0;
  gap: 8px;
  margin: 0 0 14px;
  padding: 10px 12px 12px;
  border: 1px solid var(--internal-panel-border-strong);
  border-radius: var(--radius-md);
}

.partner-settings legend {
  padding-inline: 4px;
  font-weight: 700;
}

.partner-check {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 26px;
}

.partner-check input {
  accent-color: var(--color-accent);
}

.partner-setting-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.partner-setting-field {
  display: grid;
  min-width: 0;
  gap: 4px;
  font-size: 13px;
}

.partner-setting-field small {
  color: var(--text-2);
  font-weight: 500;
}

.partner-settings__error {
  color: var(--color-error);
  font-size: 13px;
}

@media (max-width: 860px) {
  .partner-workbench {
    grid-template-columns: minmax(0, 1fr);
  }

  .partner-history {
    display: none;
  }

  .partner-history-trigger {
    display: inline-flex;
  }
}

@media (max-width: 560px) {
  .partner-stage__heading {
    align-items: flex-start;
    flex-direction: column;
    padding-block: 8px;
  }

  .partner-title-copy {
    max-width: 100%;
  }

  .partner-title-copy p {
    font-size: 12px;
  }

  .partner-tools {
    max-width: 100%;
  }

  .partner-tools button {
    min-height: 34px;
    padding-inline: 8px;
  }

  .partner-prompts {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
