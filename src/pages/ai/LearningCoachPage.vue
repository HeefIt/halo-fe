<template>
  <div class="ai-zone app-shell app-shell--internal">
    <main class="ai-zone__main coach-main">
      <AIToolHeader />

      <section class="ai-workbench coach-workbench" aria-label="学习规划">
        <section class="coach-settings" aria-labelledby="coach-title">
          <header class="coach-settings__heading">
            <h1 id="coach-title">学习规划</h1>
            <p>回顾最近的练习，定下接下来三天怎么练。</p>
          </header>

          <div class="coach-settings__scroll">
            <form @submit.prevent="startAnalysis">
              <fieldset class="coach-controls" :disabled="busy">
                <legend>下一次复盘的条件</legend>
                <label class="coach-field">
                  <span>分析区间</span>
                  <select v-model.number="timeRangeDays" class="ai-workbench__control">
                    <option :value="3">近 3 天</option>
                    <option :value="7">近 7 天</option>
                    <option :value="14">近 14 天</option>
                  </select>
                </label>
                <label class="coach-field">
                  <span>重点题型</span>
                  <select v-model="focusSubjectType" class="ai-workbench__control">
                    <option value="">由学习规划判断</option>
                    <option value="单选题">单选题</option>
                    <option value="多选题">多选题</option>
                    <option value="判断题">判断题</option>
                    <option value="简答题">简答题</option>
                  </select>
                </label>
                <label class="coach-field">
                  <span>复盘目标</span>
                  <textarea
                    ref="goalInput"
                    v-model="goal"
                    class="ai-workbench__control"
                    rows="3"
                    placeholder="例如：找出我最近简答题容易丢分的地方。"
                    @keydown="handleGoalKeydown"
                  ></textarea>
                </label>
                <details class="coach-examples">
                  <summary>用示例填入目标</summary>
                  <button v-for="prompt in quickPrompts" :key="prompt" type="button" @click="usePrompt(prompt)">{{ prompt }}</button>
                </details>
                <div class="coach-options">
                  <label><input v-model="includeQuestionRecommendations" type="checkbox"> 附带题目建议</label>
                  <label><input v-model="useStreaming" type="checkbox"> 流式分析</label>
                </div>
              </fieldset>
              <button
                class="ai-workbench__button ai-workbench__button--primary coach-start"
                type="submit"
                :disabled="!goal.trim() || busy"
              >
                {{ isRunning ? '正在分析…' : '开始分析' }}
                <el-icon aria-hidden="true"><ArrowRight /></el-icon>
              </button>
            </form>
          </div>
        </section>

        <section ref="reviewPane" class="coach-result" aria-labelledby="coach-result-title">
          <header class="coach-result__heading">
            <div>
              <h2 id="coach-result-title">复盘报告</h2>
              <p :title="currentSession?.title">{{ currentSession?.title || '当前复盘' }}</p>
            </div>
            <button class="ai-workbench__button" type="button" aria-haspopup="dialog" @click="historyOpen = true">
              <el-icon aria-hidden="true"><Clock /></el-icon>
              历史会话
            </button>
          </header>

          <div ref="reviewScroll" class="coach-result__scroll" tabindex="0" role="region" aria-label="复盘报告内容">
            <div class="coach-result__column">
              <p v-if="isHistoryLoading || isSelecting" class="coach-result__status" role="status">正在加载复盘记录…</p>
              <CoachReview
                v-else-if="latestTurn"
                :key="`${currentSessionId}-${latestTurn.key}`"
                :turn="latestTurn"
                :session-id="currentSessionId"
                :busy="busy"
                :allow-retry="Boolean(latestTurn.goal)"
                @retry="retryAnalysis"
                @regenerate="runAnalysis"
              />
              <div v-else class="coach-empty">
                <el-icon aria-hidden="true"><Notebook /></el-icon>
                <div>
                  <h3>从最近的练习开始</h3>
                  <p>设置区间并写下想复盘的问题。完成后，这里会展示结论、练习建议和短期计划。</p>
                </div>
              </div>

              <details v-if="earlierTurns.length && !isSelecting" :key="currentSessionId" class="coach-previous">
                <summary>之前的复盘 <span>{{ earlierTurns.length }} 轮</span></summary>
                <CoachReview
                  v-for="turn in earlierTurns"
                  :key="turn.key"
                  :turn="turn"
                  :session-id="currentSessionId"
                  :busy="busy"
                  @regenerate="runAnalysis"
                />
              </details>
            </div>
          </div>
        </section>
      </section>

      <AgentSidePanel v-model="historyOpen" title="学习规划历史会话" direction="ltr" size="min(326px, 90vw)" @opened="historyRef?.scrollToActive()">
        <ChatHistory
          ref="historyRef"
          :groups="historyGroups"
          :active-session-id="currentSessionId"
          :busy="busy"
          :loading="isHistoryLoading"
          :error="historyError"
          new-label="新建复盘"
          @select="openReview"
          @create="newReview"
          @rename="renameSession"
          @delete="deleteSession"
          @retry="loadHistory()"
        />
      </AgentSidePanel>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ArrowRight, Clock, Notebook } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
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
import { coachScope, isAssistantMessage, isUserMessage, runResultBody, userGoal } from './agentPresentation'
import { useAgentSessions } from './useAgentSessions'
import AgentSidePanel from './components/AgentSidePanel.vue'
import AIToolHeader from './components/AIToolHeader.vue'
import ChatHistory from './components/ChatHistory.vue'
import CoachReview from './components/CoachReview.vue'

const route = useRoute()
const user = useUserStore()
const {
  currentSession, currentSessionId, historyGroups, isHistoryLoading, historyError, isSelecting, sessionBusy,
  loadHistory, selectSession, createSession, renameSession, deleteSession, appendMessage, updateLastReply, syncAfterRun
} = useAgentSessions('学习规划', {
  list: getLearningCoachSessions,
  detail: getLearningCoachSession,
  create: createLearningCoachSession,
  rename: updateLearningCoachSessionTitle,
  remove: deleteLearningCoachSession
})

const goal = ref('')
const goalInput = ref(null)
const reviewPane = ref(null)
const reviewScroll = ref(null)
const timeRangeDays = ref(7)
const focusSubjectType = ref('')
const includeQuestionRecommendations = ref(true)
const useStreaming = ref(false)
const isRunning = ref(false)
const historyOpen = ref(false)
const historyRef = ref(null)
const busy = computed(() => sessionBusy.value || isRunning.value)

const quickPrompts = ref([
  '帮我复盘最近一周的练习，并给我三天计划',
  '我最近简答题不太稳定，接下来该怎么练？',
  '准备前端面试时，我应该优先练哪些题型？'
])

const turns = computed(() => {
  const messages = currentSession.value?.messages || []
  const result = []
  for (const [index, message] of messages.entries()) {
    if (isUserMessage(message)) {
      result.push({ key: index, goal: userGoal(message), scope: coachScope(message), answer: null, replyIndex: -1 })
    } else if (isAssistantMessage(message)) {
      let turn = result.at(-1)
      if (!turn || turn.answer) {
        turn = { key: index, goal: '', scope: '', answer: null, replyIndex: -1 }
        result.push(turn)
      }
      turn.answer = message
      turn.replyIndex = index
    }
  }
  return result
})

const latestTurn = computed(() => turns.value.at(-1))
const earlierTurns = computed(() => turns.value.slice(0, -1).reverse())

const usePrompt = (prompt) => {
  if (busy.value) return
  goal.value = prompt
  goalInput.value?.focus()
}

const showReview = async ({ reveal = false } = {}) => {
  await nextTick()
  if (reviewScroll.value) reviewScroll.value.scrollTop = 0
  if (reveal && window.matchMedia('(max-width: 860px)').matches) {
    reviewPane.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
}

const openReview = async (sessionId) => {
  if (busy.value) return
  historyOpen.value = false
  if (await selectSession(sessionId)) await showReview({ reveal: true })
}

const newReview = async () => {
  if (busy.value) return
  historyOpen.value = false
  if (await createSession()) {
    goal.value = ''
    await showReview()
  }
}

const handleGoalKeydown = (event) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) return
  event.preventDefault()
  startAnalysis()
}

const startAnalysis = () => runAnalysis(goal.value, false, true)
const retryAnalysis = text => runAnalysis(text, true)

const runAnalysis = async (text, retry = false, consumeDraft = false) => {
  const target = String(text || '').trim()
  if (!target || busy.value) return
  isRunning.value = true
  try {
    const session = currentSession.value || await createSession(target)
    if (!session) return

    const payload = {
      sessionId: session.sessionId,
      goal: target,
      timeRangeDays: timeRangeDays.value,
      focusSubjectType: focusSubjectType.value,
      includeRecentPractice: true,
      includeQuestionRecommendations: includeQuestionRecommendations.value,
      recommendedSubjectLimit: 5,
      planDays: 3
    }
    const scope = [`近 ${payload.timeRangeDays} 天`, payload.focusSubjectType].filter(Boolean).join(' / ')
    const mayReplace = retry && latestTurn.value?.goal === target && latestTurn.value?.answer
    if (mayReplace) {
      session.messages[latestTurn.value.key].scope = scope
      updateLastReply('正在重新分析练习记录…', 'pending')
    } else {
      appendMessage('user', target, { scope })
      appendMessage('assistant', '正在分析练习记录…', { state: 'pending' })
    }
    if (consumeDraft) goal.value = ''
    await showReview({ reveal: true })

    let packet = null
    let errorText = ''
    if (useStreaming.value) {
      await runLearningCoachStream(payload, user.userId, (event) => {
        if (event?.type === 'start') updateLastReply(event.content || '正在分析练习记录…', 'pending')
        if (event?.type === 'done') packet = event
        if (event?.type === 'error') errorText = event.content || '分析未完成。'
      })
      if (!packet && !errorText) errorText = '回复中断。'
    } else {
      const response = await runLearningCoach(payload, user.userId)
      if (response?.success) packet = response.data
      else errorText = response?.message || '分析未完成。'
    }

    if (errorText) throw new Error(errorText)
    const answer = runResultBody(packet)
    updateLastReply(answer, 'complete')
    if (answer) await syncAfterRun(packet?.sessionId || session.sessionId)
  } catch {
    updateLastReply('这次没能完成分析，可以使用原目标重试。', 'failed')
  } finally {
    isRunning.value = false
  }
}

const loadCapabilities = async () => {
  try {
    const response = await getLearningCoachCapabilities()
    const prompts = response.data?.examplePrompts
    if (response.success && Array.isArray(prompts) && prompts.length) quickPrompts.value = prompts
  } catch {
    // 默认示例仍可用。
  }
}

onMounted(() => {
  const preferredId = typeof route.query.sessionId === 'string' ? route.query.sessionId : ''
  loadHistory(preferredId)
  loadCapabilities()
})
</script>

<style scoped>
.coach-workbench {
  grid-template-columns: 318px minmax(0, 1fr);
}

.coach-settings,
.coach-result {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
}

.coach-settings {
  border-right: 1px solid var(--internal-panel-border);
  background: var(--internal-panel-bg-alt);
}

.coach-settings__heading,
.coach-result__heading {
  padding: 16px var(--workbench-padding);
  border-bottom: 1px solid var(--internal-panel-border);
}

.coach-settings__heading h1,
.coach-result__heading h2 {
  margin: 0 0 4px;
  font-size: 21px;
  line-height: 1.3;
}

.coach-settings__heading p,
.coach-result__heading p {
  color: var(--text-2);
  font-size: 13px;
}

.coach-result__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.coach-result__heading div {
  min-width: 0;
}

.coach-result__heading p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coach-result__heading button {
  flex: none;
}

.coach-settings__scroll,
.coach-result__scroll {
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.coach-settings__scroll {
  padding: 16px var(--workbench-padding) 24px;
}

.coach-controls {
  display: grid;
  min-width: 0;
  gap: 12px;
  border: 0;
}

.coach-controls legend {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 700;
}

.coach-field {
  display: grid;
  gap: 4px;
  font-size: 13px;
  font-weight: 650;
}

.coach-field textarea {
  min-height: 72px;
  resize: vertical;
}

.coach-examples {
  font-size: 13px;
}

.coach-examples summary {
  padding: 4px 2px;
  color: var(--color-accent);
  cursor: pointer;
}

.coach-examples button {
  display: block;
  width: 100%;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  color: var(--text-1);
  font-size: 13px;
  line-height: 1.45;
  text-align: left;
}

.coach-examples button:hover:not(:disabled) {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.coach-options {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 12px;
}

.coach-options label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-2);
  font-size: 12px;
}

.coach-options input {
  accent-color: var(--color-accent);
}

.coach-start {
  width: 100%;
  margin-top: 16px;
}

.coach-result__scroll:focus-visible {
  outline-offset: -2px;
}

.coach-result__column {
  width: 100%;
  max-width: 820px;
  margin-inline: auto;
  padding: 18px var(--workbench-padding) 28px;
}

.coach-empty {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-left: 3px solid var(--color-accent-subtle);
  background: var(--internal-panel-bg-alt);
}

.coach-empty .el-icon {
  flex: none;
  margin-top: 3px;
  color: var(--color-accent);
  font-size: 22px;
}

.coach-empty h3 {
  margin: 0 0 4px;
  font-size: 17px;
}

.coach-empty p,
.coach-result__status {
  color: var(--text-2);
  font-size: 14px;
}

.coach-previous {
  margin-top: 22px;
  border-top: 1px solid var(--internal-panel-border);
}

.coach-previous summary {
  padding: 10px 2px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.coach-previous summary span {
  margin-left: 4px;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
}

.coach-previous :deep(.coach-review) {
  padding-block: 12px;
  border-top: 1px solid var(--internal-panel-border);
}

@media (max-width: 860px) {
  .coach-main {
    height: auto;
    min-height: 100dvh;
  }

  .coach-workbench {
    grid-template-columns: minmax(0, 1fr);
  }

  .coach-settings {
    border-right: 0;
    border-bottom: 1px solid var(--internal-panel-border);
  }

  .coach-settings__scroll,
  .coach-result__scroll {
    overflow: visible;
  }

  .coach-result__heading {
    padding-block: 12px;
  }
}
</style>
