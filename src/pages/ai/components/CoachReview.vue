<template>
  <article class="coach-review">
    <div v-if="turn.goal" class="review-request">
      <p class="review-request__label">复盘目标 <span v-if="turn.scope">{{ turn.scope }}</span></p>
      <p>{{ turn.goal }}</p>
    </div>

    <div v-if="turn.answer?.state === 'pending'" class="review-state" role="status">
      {{ body || '正在分析练习记录…' }}
    </div>
    <div v-else-if="turn.answer?.state === 'failed'" class="review-state review-state--error">
      <p role="alert">{{ body || '未能完成复盘，请重试。' }}</p>
      <button v-if="allowRetry" class="ai-workbench__button" type="button" :disabled="busy" @click="$emit('retry', turn.goal)">重试分析</button>
    </div>
    <div v-else-if="!hasResult" class="review-state">
      <p role="status">这次没有生成可展示的结果。可以缩短分析区间，或换一个更具体的目标再试。</p>
      <button v-if="allowRetry" class="ai-workbench__button" type="button" :disabled="busy" @click="$emit('retry', turn.goal)">重试分析</button>
    </div>

    <template v-else>
      <section v-if="review.summary || review.diagnosis || review.overview || review.weakPoints.length" class="review-conclusion">
        <div class="review-conclusion__head">
          <h3>复盘结论</h3>
          <span v-if="review.confidence">置信度：{{ review.confidence }}</span>
        </div>
        <div v-if="review.summary" class="review-prose ai-markdown" v-html="renderAiMarkdown(review.summary)"></div>
        <p v-if="review.diagnosis" class="review-prose">{{ review.diagnosis }}</p>
        <p v-if="review.overview" class="review-overview">{{ review.overview }}</p>
        <div v-if="review.weakPoints.length" class="review-weakness">
          <strong>需要补强</strong>
          <ul><li v-for="(item, index) in review.weakPoints" :key="index">{{ item }}</li></ul>
        </div>
      </section>

      <section v-if="review.recommendations.length" class="review-section">
        <h3>下一步怎么练</h3>
        <ul class="review-list"><li v-for="(item, index) in review.recommendations" :key="index">{{ item }}</li></ul>
      </section>

      <section v-if="review.plan.length" class="review-section">
        <h3>短期计划</h3>
        <ol class="review-plan"><li v-for="(item, index) in review.plan" :key="index">{{ item }}</li></ol>
      </section>

      <details v-if="review.questions.length" class="review-extra">
        <summary>题目建议 <span>{{ review.questions.length }} 项</span></summary>
        <ul class="review-list"><li v-for="(item, index) in review.questions" :key="index">{{ item }}</li></ul>
      </details>

      <details v-if="review.dataBasis.length" class="review-extra">
        <summary>判断依据 <span>{{ review.dataBasis.length }} 项</span></summary>
        <ul class="review-list"><li v-for="(item, index) in review.dataBasis" :key="index">{{ item }}</li></ul>
      </details>

      <AIMessageActions
        v-if="!busy && body && turn.replyIndex > 0"
        :content="body"
        :session-id="sessionId"
        :message-index="turn.replyIndex"
        :share-path="`/ai/learning-coach?sessionId=${encodeURIComponent(sessionId)}`"
        @regenerate="$emit('regenerate', turn.goal)"
      />
    </template>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import { messageBody, readCoachReview } from '../agentPresentation'
import AIMessageActions from './AIMessageActions.vue'

const props = defineProps({
  turn: { type: Object, required: true },
  sessionId: { type: String, required: true },
  busy: Boolean,
  allowRetry: Boolean
})

defineEmits(['regenerate', 'retry'])

const body = computed(() => messageBody(props.turn.answer))
const review = computed(() => readCoachReview(body.value))
const hasResult = computed(() => {
  const { summary, diagnosis, overview, weakPoints, recommendations, plan, questions, dataBasis } = review.value
  return Boolean(summary || diagnosis || overview || weakPoints.length || recommendations.length || plan.length || questions.length || dataBasis.length)
})
</script>

<style scoped>
.coach-review {
  display: grid;
  min-width: 0;
  gap: 16px;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.7;
}

.review-request {
  display: grid;
  gap: 2px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: var(--internal-panel-bg-alt);
}

.review-request p:last-child {
  white-space: pre-wrap;
}

.review-request__label,
.review-overview {
  color: var(--text-2);
}

.review-request__label {
  font-size: 12px;
  font-weight: 650;
}

.review-request__label span {
  padding-left: 8px;
  font-weight: 500;
}

.review-conclusion {
  display: grid;
  gap: 8px;
  padding: 12px 0 12px 14px;
  border-left: 3px solid var(--color-accent-subtle);
}

.review-conclusion__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
}

.review-conclusion__head span {
  color: var(--text-2);
  font-size: 12px;
}

.review-conclusion h3,
.review-section h3 {
  font-size: 16px;
  font-weight: 700;
}

.review-prose {
  font-size: 15px;
}

.review-weakness {
  padding-top: 6px;
}

.review-weakness ul,
.review-list {
  padding-inline-start: 1.3em;
}

.review-weakness li + li,
.review-list li + li {
  margin-top: 4px;
}

.review-section {
  display: grid;
  gap: 7px;
  padding-top: 12px;
  border-top: 1px solid var(--internal-panel-border);
}

.review-plan {
  display: grid;
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.review-plan li {
  padding: 7px 12px;
  border-left: 2px solid var(--color-accent-subtle);
  background: var(--internal-panel-bg-alt);
}

.review-extra {
  padding: 7px 12px;
  border: 1px solid var(--internal-panel-border);
  border-radius: var(--radius-md);
}

.review-extra summary {
  font-weight: 650;
  cursor: pointer;
}

.review-extra summary span {
  margin-left: 5px;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 500;
}

.review-extra ul {
  padding-top: 6px;
}

.review-state {
  display: grid;
  justify-items: start;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--internal-panel-border);
  border-radius: var(--radius-md);
  color: var(--text-2);
}

.review-state--error {
  color: var(--color-error);
}

.coach-review :deep(.ai-message-actions) {
  margin-top: 0;
}

.coach-review :deep(.action-btn) {
  color: var(--text-2);
}
</style>
