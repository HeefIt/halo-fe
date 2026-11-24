<template>
  <div class="study-answer">
    <p v-if="message.state === 'pending'" class="study-answer__state" role="status">{{ body || '正在准备学习建议…' }}</p>
    <div v-else-if="message.state === 'failed' || !hasContent" class="study-answer__state">
      <p v-if="message.state === 'failed'" class="study-answer__error" role="alert">{{ body || '未能生成学习建议，请重试。' }}</p>
      <p v-else role="status">这次没有返回可展示的建议。可以换一个具体的问题，或调整回答设置后再试。</p>
      <button v-if="allowRetry" class="ai-workbench__button" type="button" :disabled="busy" @click="$emit('retry')">重试这条问题</button>
    </div>

    <template v-else>
      <div v-if="reply" class="study-answer__prose ai-markdown" v-html="renderAiMarkdown(reply)"></div>
      <template v-if="report">
        <div v-if="report.summary || report.level" class="study-diagnosis">
          <div>
            <strong>{{ report.level || '学习判断' }}</strong>
            <p v-if="report.summary">{{ report.summary }}</p>
          </div>
          <span v-if="report.confidence">置信度：{{ report.confidence }}</span>
        </div>

        <section v-if="report.evidence.length" class="study-report-section">
          <h3>判断依据</h3>
          <ul class="study-evidence">
            <li v-for="(item, index) in report.evidence" :key="index">
              <strong v-if="item.label">{{ item.label }}</strong>
              <span>{{ item.value }}</span>
            </li>
          </ul>
        </section>

        <section v-if="report.questions.length" class="study-report-section">
          <h3>推荐题目</h3>
          <ul class="study-questions">
            <li v-for="(question, index) in report.questions" :key="index">
              <div>
                <span v-if="question.type" class="study-question__type">{{ question.type }}</span>
                <strong>{{ question.title }}</strong>
                <p v-if="question.reason">{{ question.reason }}</p>
              </div>
              <AgentReportLink class="ai-workbench__button study-question__link" :path="question.path" :aria-label="`去练习：${question.title}`">
                去练习 <el-icon aria-hidden="true"><ArrowRight /></el-icon>
              </AgentReportLink>
            </li>
          </ul>
        </section>

        <section v-if="report.plan.length" class="study-report-section">
          <h3>复习安排</h3>
          <ol class="study-plan">
            <li v-for="(item, index) in report.plan" :key="index">
              <span class="study-plan__day">第 {{ item.day }} 天</span>
              <div>
                <strong v-if="item.title">{{ item.title }}</strong>
                <ul v-if="item.tasks.length">
                  <li v-for="(task, taskIndex) in item.tasks" :key="taskIndex">{{ task }}</li>
                </ul>
              </div>
            </li>
          </ol>
        </section>

        <section v-if="report.actions.length" class="study-report-section">
          <h3>下一步行动</h3>
          <ul class="study-actions">
            <li v-for="(item, index) in report.actions" :key="index">
              <AgentReportLink :path="item.path">
                {{ item.label }}
                <template #fallback><strong>{{ item.label }}</strong></template>
              </AgentReportLink>
              <p v-if="item.description">{{ item.description }}</p>
            </li>
          </ul>
        </section>

        <details v-if="report.knowledge.length" class="study-sources">
          <summary>知识来源 <span>{{ report.knowledge.length }} 条</span></summary>
          <ul>
            <li v-for="(item, index) in report.knowledge" :key="index">
              <AgentReportLink :path="item.path">
                {{ item.title }}
                <template #fallback><strong>{{ item.title }}</strong></template>
              </AgentReportLink>
              <span class="study-sources__origin">{{ item.source }}</span>
              <p v-if="item.summary">{{ item.summary }}</p>
            </li>
          </ul>
        </details>
      </template>

      <p v-if="message.state === 'streaming'" class="study-answer__state" role="status">仍在生成…</p>
      <AIMessageActions
        v-if="!busy && index > 0"
        :content="body"
        :session-id="sessionId"
        :message-index="index"
        :share-path="`/ai/halo-study-agent?sessionId=${encodeURIComponent(sessionId)}`"
        @regenerate="$emit('regenerate', index)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import { messageBody, readStudyReport } from '../agentPresentation'
import AgentReportLink from './AgentReportLink.vue'
import AIMessageActions from './AIMessageActions.vue'

const props = defineProps({
  message: { type: Object, required: true },
  sessionId: { type: String, required: true },
  index: { type: Number, required: true },
  busy: Boolean,
  allowRetry: Boolean
})

defineEmits(['regenerate', 'retry'])

const body = computed(() => messageBody(props.message))
const report = computed(() => readStudyReport(body.value))
const reply = computed(() => report.value ? report.value.reply : body.value)
const hasContent = computed(() => {
  if (!report.value) return Boolean(body.value.trim())
  const { reply, summary, evidence, questions, plan, actions, knowledge } = report.value
  return Boolean(reply || summary || evidence.length || questions.length || plan.length || actions.length || knowledge.length)
})
</script>

<style scoped>
.study-answer {
  display: grid;
  gap: 14px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.study-answer__prose {
  font-size: 15px;
  line-height: 1.75;
}

.study-diagnosis {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  border-left: 3px solid var(--color-accent-subtle);
  background: var(--internal-panel-bg-alt);
  font-size: 14px;
}

.study-diagnosis > div {
  flex: 1 1 180px;
}

.study-diagnosis p {
  margin-top: 3px;
}

.study-diagnosis span,
.study-question__type,
.study-plan__day,
.study-sources__origin {
  color: var(--text-2);
  font-size: 12px;
}

.study-report-section {
  display: grid;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--internal-panel-border);
  font-size: 14px;
}

.study-report-section h3 {
  font-size: 15px;
}

.study-evidence,
.study-actions {
  padding-left: 1.25em;
}

.study-evidence li + li,
.study-actions li + li {
  margin-top: 5px;
}

.study-evidence strong {
  margin-right: 0.5em;
}

.study-questions,
.study-plan,
.study-sources ul {
  padding: 0;
  list-style: none;
}

.study-questions,
.study-plan {
  display: grid;
  gap: 6px;
}

.study-questions li,
.study-plan > li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-md);
  background: var(--internal-panel-bg-alt);
}

.study-questions li > div {
  min-width: 0;
}

.study-question__type {
  margin-right: 6px;
}

.study-questions p,
.study-actions p,
.study-sources p {
  margin-top: 3px;
  color: var(--text-2);
  font-size: 13px;
}

.study-question__link {
  flex: none;
  min-height: 34px;
  padding: 4px 9px;
  color: var(--color-accent);
  white-space: nowrap;
}

.study-plan > li {
  justify-content: flex-start;
}

.study-plan__day {
  flex: none;
  padding-top: 1px;
}

.study-plan ul {
  padding-left: 1.2em;
}

.study-actions a,
.study-sources a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.study-sources {
  padding: 8px 12px;
  border: 1px solid var(--internal-panel-border);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.study-sources summary {
  cursor: pointer;
  font-weight: 650;
}

.study-sources summary span,
.study-sources__origin {
  margin-left: 5px;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
}

.study-sources li {
  margin-top: 6px;
}

.study-answer__state {
  color: var(--text-2);
  font-size: 14px;
}

.study-answer__state button {
  margin-top: 8px;
}

.study-answer__error {
  color: var(--color-error);
}

.study-answer :deep(.ai-message-actions) {
  margin-top: 0;
}

.study-answer :deep(.action-btn) {
  color: var(--text-2);
}

@media (max-width: 480px) {
  .study-questions li {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
