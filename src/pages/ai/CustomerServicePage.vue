<template>
  <div class="customer-service-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="service-main">
      <AIToolHeader
        title="智能客服"
        badge="站内导航"
      />

      <section class="service-workspace">
        <aside class="service-sidebar">
          <section class="service-sidebar__toolbar">
            <div class="service-sidebar__toolbar-head">
              <strong>Guide</strong>
            </div>

            <div class="service-sidebar__meta">
              <span class="sidebar-mini-pill">{{ quickQuestions.length }} 快捷输入</span>
              <span class="sidebar-mini-pill">内存会话</span>
            </div>
          </section>

          <div class="service-sidebar__scroll">
            <section class="sidebar-block sidebar-block--prompts sidebar-block--prompts-full">
              <div class="sidebar-title-row">
                <strong>快捷输入</strong>
                <span>{{ quickQuestions.length }}</span>
              </div>

              <div class="prompt-list">
                <button
                  v-for="question in quickQuestions"
                  :key="question"
                  class="prompt-button"
                  :class="{ active: inputMessage === question }"
                  type="button"
                  :title="question"
                  @click="usePrompt(question)"
                >
                  {{ question }}
                </button>
              </div>
            </section>
          </div>
        </aside>

        <section class="service-stage">
          <div class="service-stage__topbar">
            <div class="topbar-copy">
              <span class="topbar-label">当前会话</span>
              <strong>站内咨询</strong>
            </div>

            <div class="topbar-meta">
              <span class="meta-pill">站内数据</span>
              <span class="meta-pill" :class="{ active: streamingEnabled }">
                {{ streamingEnabled ? '流式回复' : '同步回复' }}
              </span>
            </div>
          </div>

          <div ref="chatHistoryRef" class="service-messages">
            <article
              v-for="(message, index) in store.messages"
              :key="`${message.role}-${index}-${formatTime(message.timestamp)}`"
              class="message-card"
              :class="message.role"
            >
              <div class="message-card__avatar">
                <div v-if="message.role === 'user'" class="avatar avatar--user">
                  {{ userInitial }}
                </div>
                <div v-else class="avatar avatar--service">
                  CS
                </div>
              </div>

              <div class="message-card__body">
                <div class="message-card__head">
                  <strong>{{ message.role === 'user' ? '你' : '智能客服' }}</strong>
                  <span>{{ formatTime(message.timestamp) }}</span>
                </div>

                <div
                  class="message-card__reply ai-markdown"
                  v-html="formatMessage(message.content)"
                ></div>

                <AIMessageActions
                  v-if="message.role === 'assistant' && !isLoading"
                  :content="message.content || ''"
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

          <div class="service-composer">
            <div class="composer-toolbar">
              <label class="option-switch">
                <input v-model="streamingEnabled" type="checkbox">
                <span>流式回复</span>
              </label>

              <div class="composer-actions">
                <button
                  class="ghost-button"
                  type="button"
                  :disabled="isLoading || store.messages.length <= 1"
                  @click="clearChat"
                >
                  清空会话
                </button>
                <button
                  class="primary-button"
                  type="button"
                  :disabled="!inputMessage.trim() || isLoading"
                  @click="sendMessage"
                >
                  发送
                </button>
              </div>
            </div>

            <div class="composer-input">
              <textarea
                v-model="inputMessage"
                rows="2"
                :disabled="isLoading"
                placeholder="例如：帮我看看最近的刷题情况"
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import { useThemeStore } from '@/stores/modules/theme'
import { useCustomerServiceStore } from '@/stores/modules/customerService'
import { customerServiceChat, customerServiceChatStream } from '@/api/modules/ai/chat'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import AIToolHeader from './components/AIToolHeader.vue'
import AIMessageActions from './components/AIMessageActions.vue'

const userStore = useUserStore()
const themeStore = useThemeStore()
const store = useCustomerServiceStore()

const quickPromptGroups = [
  {
    title: '我的数据',
    questions: [
      '帮我看看我最近的刷题汇总',
      '我这周在排行榜上的情况怎么样？',
      '我的个人主页现在会展示哪些内容？'
    ]
  },
  {
    title: '站内入口',
    questions: [
      '如何修改个人资料和头像？',
      '想发一条社区动态应该去哪里？',
      '如果我想看排行榜和社区，入口分别在哪？'
    ]
  },
  {
    title: '内容与推荐',
    questions: [
      '推荐几篇最近比较热门的博客文章',
      '帮我找一下前端相关的博客文章',
      '博客里最近更新了什么内容？'
    ]
  },
  {
    title: '实时信息',
    questions: [
      '帮我查一下上海现在的天气',
      '北京到上海大概有多远？',
      '新加坡今天的天气怎么样？'
    ]
  }
]

const isLoading = ref(false)
const chatHistoryRef = ref(null)

const userInitial = computed(() => userStore.userName?.charAt(0)?.toUpperCase() || 'U')
const quickQuestions = computed(() => quickPromptGroups.flatMap(group => group.questions))

const inputMessage = computed({
  get: () => store.draftMessage,
  set: (value) => store.setDraftMessage(value)
})

const streamingEnabled = computed({
  get: () => store.useStreaming,
  set: (value) => store.setStreaming(value)
})

const usePrompt = (question) => {
  store.setDraftMessage(question)
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) {
    return
  }

  const userMessage = inputMessage.value.trim()
  store.appendMessage({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  })
  store.setDraftMessage('')
  scrollToBottom()
  isLoading.value = true

  try {
    if (streamingEnabled.value) {
      let assistantReply = ''

      await customerServiceChatStream(
        userMessage,
        null,
        (data) => {
          const incrementalContent =
            typeof data === 'object'
              ? data.reply || data.content || ''
              : typeof data === 'string'
                ? data
                : ''

          assistantReply += incrementalContent
          store.updateLastAssistantMessage(assistantReply)
          scrollToBottom()
        },
        (error) => {
          console.error('客服消息发送失败:', error)
          ElMessage.error('消息发送失败，请稍后重试')
          isLoading.value = false
        },
        () => {
          isLoading.value = false
          scrollToBottom()
        }
      )
      return
    }

    const response = await customerServiceChat(userMessage, null)
    if (response.data?.reply) {
      store.appendMessage({
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date()
      })
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请稍后重试')
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const clearChat = () => {
  store.resetConversation()
  ElMessage.success('会话已重置')
  scrollToBottom()
}

const handleRegenerate = async (messageIndex) => {
  if (isLoading.value) return

  const messages = store.messages
  if (messageIndex <= 0 || messageIndex >= messages.length) return

  const userMessage = messages[messageIndex - 1]
  if (!userMessage || userMessage.role !== 'user' || !userMessage.content?.trim()) {
    ElMessage.warning('无法找到对应的用户消息')
    return
  }

  const userContent = userMessage.content.trim()
  store.messages.splice(messageIndex)
  scrollToBottom()

  isLoading.value = true

  try {
    if (streamingEnabled.value) {
      let assistantReply = ''

      await customerServiceChatStream(
        userContent,
        null,
        (data) => {
          const incrementalContent =
            typeof data === 'object'
              ? data.reply || data.content || ''
              : typeof data === 'string'
                ? data
                : ''

          assistantReply += incrementalContent
          store.updateLastAssistantMessage(assistantReply)
          scrollToBottom()
        },
        (error) => {
          console.error('客服消息发送失败:', error)
          ElMessage.error('重新生成失败')
          isLoading.value = false
        },
        () => {
          isLoading.value = false
          scrollToBottom()
        }
      )
    } else {
      const response = await customerServiceChat(userContent, null)
      if (response.data?.reply) {
        store.appendMessage({
          role: 'assistant',
          content: response.data.reply,
          timestamp: new Date()
        })
      }
    }
  } catch (error) {
    console.error('重新生成失败:', error)
    ElMessage.error('重新生成失败')
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const formatMessage = (content) => renderAiMarkdown(content)

const formatTime = (timestamp) => {
  if (!timestamp) {
    return ''
  }

  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

watch(
  () => store.messages.length,
  () => {
    scrollToBottom()
  }
)

onMounted(() => {
  store.ensureInitialized()
  scrollToBottom()
})
</script>

<style scoped>
.customer-service-page {
  height: 100dvh;
  min-height: 100dvh;
  --ai-accent: #0f766e;
  --ai-accent-soft: rgba(15, 118, 110, 0.08);
  --ai-accent-line: rgba(15, 118, 110, 0.16);
  --ai-surface: rgba(255, 255, 255, 0.92);
  --ai-surface-strong: #ffffff;
  --ai-surface-alt: rgba(248, 250, 252, 0.96);
  --ai-border: rgba(15, 23, 42, 0.08);
  --ai-text: var(--color-text);
  --ai-text-soft: var(--color-text-secondary);
  --ai-text-faint: var(--color-text-muted);
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), transparent 24%),
    linear-gradient(180deg, #f7fafc 0%, #f3f6f8 100%);
  overflow: hidden;
}

.customer-service-page.is-dark {
  --ai-accent: #5eead4;
  --ai-accent-soft: rgba(94, 234, 212, 0.12);
  --ai-accent-line: rgba(94, 234, 212, 0.2);
  --ai-surface: rgba(15, 23, 42, 0.94);
  --ai-surface-strong: rgba(9, 17, 28, 0.94);
  --ai-surface-alt: rgba(16, 26, 45, 0.92);
  --ai-border: rgba(148, 163, 184, 0.14);
  --ai-text: var(--text-1);
  --ai-text-soft: var(--text-2);
  --ai-text-faint: var(--text-3);
  background:
    radial-gradient(circle at top left, rgba(94, 234, 212, 0.1), transparent 26%),
    linear-gradient(180deg, #07101b 0%, #09111c 100%);
}

.service-main {
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

.service-workspace {
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

.service-sidebar,
.service-stage {
  min-height: 0;
}

.service-sidebar {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
}

.service-sidebar__toolbar,
.sidebar-block,
.service-stage,
.service-stage__topbar,
.service-composer {
  border: 1px solid var(--ai-border);
  background: var(--ai-surface);
  border-radius: 12px;
}

.service-sidebar__toolbar,
.sidebar-block {
  padding: 12px;
}

.service-sidebar__toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-sidebar__toolbar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.service-sidebar__toolbar-head strong {
  color: var(--ai-accent);
  font-size: 15px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-shadow: 0 0 18px rgba(15, 118, 110, 0.16);
}

.service-sidebar__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sidebar-mini-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border: 1px solid var(--ai-border);
  border-radius: 999px;
  background: var(--ai-surface-alt);
  color: var(--ai-text-soft);
  font-size: 11px;
  font-weight: 700;
}

.service-sidebar__scroll {
  min-height: 0;
  overflow: hidden;
  display: block;
}

.sidebar-block--prompts-full {
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.sidebar-title-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  color: var(--ai-text-soft);
  font-size: 11px;
}

.sidebar-title-row strong {
  color: var(--ai-accent);
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
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  padding-right: 2px;
}

.prompt-button,
.session-item {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--ai-border);
  background: var(--ai-surface-alt);
  border-radius: 10px;
  text-align: left;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.prompt-button,
.session-item__title {
  color: var(--ai-text);
  font-size: 12px;
  line-height: 1.4;
}

.prompt-button {
  min-height: 38px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prompt-button.active,
.session-item.active {
  border-color: var(--ai-accent-line);
  background: var(--ai-accent-soft);
}

.session-item {
  min-height: 52px;
}

.session-item__title {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  color: var(--ai-text-faint);
  font-size: 10px;
}

.empty-sidebar {
  margin-top: 12px;
  color: var(--ai-text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.service-stage {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
}

.service-stage__topbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 7px 10px;
  background: var(--ai-surface-alt);
}

.topbar-copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.topbar-label {
  color: var(--ai-text-faint);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.topbar-copy strong {
  color: var(--ai-text);
  font-size: 12px;
  letter-spacing: -0.01em;
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
  background: var(--ai-surface-alt);
  color: var(--ai-text-soft);
  font-size: 10px;
  font-weight: 700;
}

.meta-pill.active {
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
}

.service-messages {
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  display: grid;
  gap: 12px;
  border: 1px solid var(--ai-border);
  background: linear-gradient(180deg, rgba(15, 118, 110, 0.03), transparent 18%), var(--ai-surface);
  border-radius: 12px;
}

.message-card {
  display: flex;
  gap: 10px;
  max-width: min(76%, 820px);
}

.message-card.user {
  flex-direction: row-reverse;
  justify-self: end;
  max-width: min(76%, 820px);
}

.message-card.assistant {
  justify-self: start;
  max-width: min(84%, 960px);
}

.message-card.assistant .message-card__body {
  border-color: var(--ai-accent-line);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.04);
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
  background: var(--ai-surface-alt);
  color: var(--ai-text);
}

.avatar--service {
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
}

.message-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--ai-border);
  background: var(--ai-surface-strong);
  border-radius: 12px;
  min-width: 0;
  width: fit-content;
  max-width: 100%;
}

.message-card.user .message-card__body {
  background: var(--ai-surface-alt);
}

.message-card__head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  color: var(--ai-text-faint);
  font-size: 11px;
}

.message-card__head strong {
  color: var(--ai-text);
  font-size: 12px;
}

.message-card__reply {
  color: var(--ai-text);
  font-size: 14px;
  line-height: 1.75;
  word-break: break-word;
}

.message-card__body :deep(.ai-message-actions) {
  margin-top: 10px;
}

.message-card__body :deep(.action-btn) {
  color: var(--ai-text-faint);
}

.message-card__body :deep(.action-btn:hover:not(:disabled)) {
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
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
  background: var(--ai-accent);
  animation: pulse 1.2s infinite ease-in-out;
}

.loading-bar span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-bar span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0.7);
    opacity: 0.4;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.service-composer {
  display: grid;
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(180deg, var(--ai-surface), var(--ai-surface-alt));
}

.composer-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.composer-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ai-text-soft);
  font-size: 11px;
  font-weight: 700;
}

.option-switch input {
  accent-color: var(--ai-accent);
}

.composer-input textarea {
  width: 100%;
  min-height: 58px;
  resize: none;
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  background: var(--ai-surface-alt);
  color: var(--ai-text);
  padding: 12px 14px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.65;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.composer-input textarea:focus {
  border-color: var(--ai-accent-line);
  box-shadow: 0 0 0 4px var(--ai-accent-soft);
}

.composer-input textarea::placeholder {
  color: var(--ai-text-faint);
}

.primary-button,
.ghost-button {
  min-height: 34px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
}

.primary-button {
  min-width: 84px;
  border: 1px solid transparent;
  background: var(--ai-accent);
  color: #ffffff;
}

.ghost-button {
  border: 1px solid var(--ai-border);
  background: transparent;
  color: var(--ai-text);
  padding: 0 14px;
}

.service-sidebar__scroll::-webkit-scrollbar,
.prompt-list::-webkit-scrollbar,
.session-list::-webkit-scrollbar,
.service-messages::-webkit-scrollbar {
  width: 6px;
}

.service-sidebar__scroll::-webkit-scrollbar-thumb,
.prompt-list::-webkit-scrollbar-thumb,
.session-list::-webkit-scrollbar-thumb,
.service-messages::-webkit-scrollbar-thumb {
  background: rgba(15, 118, 110, 0.18);
  border-radius: 999px;
}

@media (max-width: 1160px) {
  .service-workspace {
    grid-template-columns: 276px minmax(0, 1fr);
  }
}

@media (max-width: 900px) {
  .service-main {
    padding: 8px 10px 10px;
  }

  .service-workspace {
    grid-template-columns: 1fr;
    grid-template-rows: 300px minmax(0, 1fr);
  }

  .service-stage__topbar,
  .composer-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .topbar-meta {
    justify-content: flex-start;
  }

.message-card,
.message-card.assistant,
.message-card.user {
  max-width: 100%;
}

.message-card.assistant .message-card__body {
  max-width: 85%;
}
}

@media (max-width: 640px) {
  .service-workspace {
    grid-template-rows: 268px minmax(0, 1fr);
  }

  .service-sidebar__toolbar,
  .sidebar-block,
  .service-stage,
  .service-messages,
  .service-composer {
    padding-left: 10px;
    padding-right: 10px;
  }

  .service-stage {
    padding: 8px;
  }
}
</style>
