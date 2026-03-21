<template>
  <transition name="notice-dialog-fade">
    <div v-if="modelValue" class="notice-dialog" @click.self="emitClose">
      <div class="notice-card">
        <div class="notice-card__head">
          <div class="notice-card__meta">
            <span class="notice-card__badge">{{ mode === 'popup' ? '系统公告' : '公告详情' }}</span>
            <h3>{{ notice?.title || '公告' }}</h3>
            <p v-if="timeText">{{ timeText }}</p>
          </div>
          <button class="notice-card__close" type="button" @click="emitClose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="notice-card__body">
          <div class="notice-content" v-html="safeContent"></div>
        </div>

        <div class="notice-card__foot">
          <template v-if="mode === 'popup'">
            <button class="notice-btn notice-btn--ghost" type="button" @click="emitClose">稍后查看</button>
            <button class="notice-btn notice-btn--secondary" type="button" @click="emitCloseToday">今日关闭</button>
            <button class="notice-btn notice-btn--primary" type="button" @click="emitCloseForever">关闭公告</button>
          </template>
          <template v-else>
            <button class="notice-btn notice-btn--primary" type="button" @click="emitClose">我知道了</button>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  notice: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'view'
  }
})

const emit = defineEmits(['update:modelValue', 'close-today', 'close-forever'])

const safeContent = computed(() => {
  const content = props.notice?.content || ''
  return DOMPurify.sanitize(content.replace(/\n/g, '<br />'))
})

const timeText = computed(() => {
  const start = formatTime(props.notice?.startTime)
  const end = formatTime(props.notice?.endTime)
  if (start && end) {
    return `${start} - ${end}`
  }
  if (start) {
    return `开始时间：${start}`
  }
  if (end) {
    return `截止时间：${end}`
  }
  return ''
})

function emitClose() {
  emit('update:modelValue', false)
}

function emitCloseToday() {
  emit('close-today')
}

function emitCloseForever() {
  emit('close-forever')
}

function formatTime(value) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.notice-dialog {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(10px);
}

.notice-card {
  width: min(680px, 100%);
  max-height: min(80vh, 760px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.notice-card__head,
.notice-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
}

.notice-card__head {
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.notice-card__meta h3 {
  margin: 10px 0 4px;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.notice-card__meta p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.notice-card__badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #174ea6;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.notice-card__close {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
}

.notice-card__body {
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px;
}

.notice-content {
  color: #1e293b;
  font-size: 14px;
  line-height: 1.9;
}

.notice-content :deep(p) {
  margin: 0 0 12px;
}

.notice-content :deep(p:last-child) {
  margin-bottom: 0;
}

.notice-content :deep(h1),
.notice-content :deep(h2),
.notice-content :deep(h3) {
  margin: 0 0 12px;
  color: #0f172a;
}

.notice-content :deep(a) {
  color: #174ea6;
}

.notice-content :deep(ul),
.notice-content :deep(ol) {
  padding-left: 18px;
  margin: 0 0 12px;
}

.notice-content :deep(blockquote) {
  margin: 0 0 12px;
  padding: 10px 14px;
  border-left: 3px solid rgba(37, 99, 235, 0.2);
  background: rgba(148, 163, 184, 0.08);
}

.notice-content :deep(img) {
  max-width: 100%;
  border-radius: 10px;
}

.notice-card__foot {
  justify-content: flex-end;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  background: #f8fafc;
}

.notice-btn {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.notice-btn--ghost {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
  color: #334155;
}

.notice-btn--secondary {
  border: 1px solid rgba(37, 99, 235, 0.14);
  background: rgba(37, 99, 235, 0.08);
  color: #174ea6;
}

.notice-btn--primary {
  border: 1px solid #174ea6;
  background: #174ea6;
  color: #ffffff;
}

.notice-dialog-fade-enter-active,
.notice-dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.notice-dialog-fade-enter-from,
.notice-dialog-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .notice-dialog {
    padding: 12px;
  }

  .notice-card {
    max-height: min(88vh, 760px);
  }

  .notice-card__head,
  .notice-card__foot,
  .notice-card__body {
    padding-left: 16px;
    padding-right: 16px;
  }

  .notice-card__meta h3 {
    font-size: 20px;
  }

  .notice-card__foot {
    flex-wrap: wrap;
  }

  .notice-btn {
    width: 100%;
  }
}
</style>
