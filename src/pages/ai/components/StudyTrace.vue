<template>
  <div class="study-trace">
    <p v-if="!trace" class="study-trace__notice">当前没有可查看的轨迹。发送一条学习问题后，这里会显示本轮用到的资料和执行步骤。</p>
    <template v-else>
      <p v-if="trace.status === 'running'" class="study-trace__notice" role="status">正在执行，步骤会随请求更新。</p>
      <p v-else-if="trace.status === 'failed'" class="study-trace__notice" role="status">这次请求未完成。已收到的步骤仍可查看。</p>
      <p v-else-if="!trace.steps.length" class="study-trace__notice">这次请求没有返回可展示的轨迹。</p>

      <ol v-if="trace.steps.length" class="study-trace__list">
        <li v-for="(step, index) in trace.steps" :key="step.stepNo ?? index" class="study-trace__step">
          <span class="study-trace__number" aria-hidden="true">{{ step.stepNo ?? index + 1 }}</span>
          <div class="study-trace__body">
            <div class="study-trace__byline">
              <strong>{{ stepLabel(step.stepType) }}</strong>
              <span v-if="step.status">{{ statusLabel(step.status) }}</span>
              <span v-if="step.costTimeMs != null">{{ step.costTimeMs }} ms</span>
            </div>
            <p v-if="step.decisionSummary">{{ step.decisionSummary }}</p>
            <p v-if="step.actionName" class="study-trace__action">{{ step.actionName }}</p>
            <p v-if="step.observation" class="study-trace__note">{{ summarizeTraceObservation(step.observation) }}</p>
            <details v-if="step.observation">
              <summary>查看原始观察</summary>
              <pre>{{ formatTraceObservation(step.observation) }}</pre>
            </details>
          </div>
        </li>
      </ol>
    </template>
  </div>
</template>

<script setup>
import { formatTraceObservation, summarizeTraceObservation } from '../agentPresentation'

defineProps({ trace: { type: Object, default: null } })

const stepNames = new Map([['PLAN', '计划'], ['TOOL', '工具调用'], ['RAG', '知识库检索'], ['FINAL', '生成回答']])
const statusNames = new Map([['SUCCESS', '完成'], ['FAILED', '未完成'], ['REJECTED', '已跳过'], ['RUNNING', '进行中']])
const stepLabel = value => stepNames.get(String(value || '').toUpperCase()) || value || '步骤'
const statusLabel = value => statusNames.get(String(value || '').toUpperCase()) || value
</script>

<style scoped>
.study-trace {
  padding: 16px 18px 24px;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.study-trace__notice {
  margin-bottom: 12px;
  color: var(--text-2);
}

.study-trace__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.study-trace__step {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 10px;
}

.study-trace__step + .study-trace__step {
  margin-top: 10px;
}

.study-trace__number {
  display: grid;
  height: 24px;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 650;
}

.study-trace__body {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--internal-panel-border);
}

.study-trace__byline {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
}

.study-trace__byline span,
.study-trace__note,
.study-trace__action {
  color: var(--text-2);
  font-size: 12px;
}

.study-trace__action {
  font-family: var(--font-mono);
}

.study-trace__body p,
.study-trace__body details {
  margin-top: 5px;
}

.study-trace__body summary {
  color: var(--color-accent);
  cursor: pointer;
  font-size: 13px;
}

.study-trace__body pre {
  max-height: 200px;
  margin-top: 5px;
  padding: 10px;
  overflow: auto;
  border-radius: var(--radius-sm);
  background: var(--internal-panel-bg-alt);
  color: var(--text-1);
  font-family: var(--font-mono);
  font-size: 12px;
  white-space: pre-wrap;
}
</style>
