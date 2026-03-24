<template>
  <div class="customer-service-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="service-main">
      <AIToolHeader
        title="智能客服"
        badge="实时协助"
      />

      <div class="workspace-shell">
        <aside class="service-sidebar">
          <section class="sidebar-card prompt-card">
            <div class="sidebar-header">
              <p class="card-eyebrow">快捷提问</p>
              <h1>常见问题可以直接点，左侧滚动找，右侧立即对话。</h1>
              <p class="card-description">
                适合问账号资料、刷题情况、博客推荐、社区入口、排行榜和简单实时信息。
              </p>

              <div class="capability-inline-list">
                <span
                  v-for="item in capabilityCards"
                  :key="item.title"
                  class="capability-badge"
                >
                  <span class="capability-badge-icon">{{ item.icon }}</span>
                  {{ item.title }}
                </span>
              </div>

              <div class="sidebar-meta">
                <span class="memory-tag">切页不丢会话</span>
                <span class="sidebar-tip">快捷问题区可独立滚动</span>
              </div>
            </div>

            <div class="prompt-groups">
              <div
                v-for="group in quickPromptGroups"
                :key="group.title"
                class="prompt-group"
              >
                <div class="prompt-group-title">{{ group.title }}</div>
                <div class="prompt-chip-list">
                  <button
                    v-for="question in group.questions"
                    :key="question"
                    class="prompt-chip"
                    @click="sendPresetQuestion(question)"
                  >
                    {{ question }}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section class="conversation-panel">
          <div class="conversation-topbar">
            <div class="topbar-copy">
              <strong>站内问题优先查真实数据</strong>
              <span>账号、刷题、榜单、博客、社区与页面入口都可以直接问。</span>
            </div>
            <div class="topbar-meta">
              <span class="meta-pill is-active">
                <span class="meta-dot"></span>
                默认流式回复
              </span>
              <span class="meta-pill">
                当前会话仅保存在前端内存
              </span>
            </div>
          </div>

          <div class="chat-area" ref="chatHistoryRef">
            <div
              v-for="(message, index) in store.messages"
              :key="index"
              class="chat-message"
              :class="message.role"
            >
              <div class="message-avatar">
                <div v-if="message.role === 'user'" class="avatar user">
                  {{ userInitial }}
                </div>
                <div v-else class="avatar service">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4"></path>
                    <path d="M12 18v4"></path>
                    <path d="M2 12h4"></path>
                    <path d="M18 12h4"></path>
                  </svg>
                </div>
              </div>
              <div class="message-body">
                <div class="message-content ai-markdown" v-html="formatMessage(message.content)"></div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>

            <div v-if="isLoading" class="chat-message assistant">
              <div class="message-avatar">
                <div class="avatar service">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4"></path>
                    <path d="M12 18v4"></path>
                    <path d="M2 12h4"></path>
                    <path d="M18 12h4"></path>
                  </svg>
                </div>
              </div>
              <div class="message-body">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <div class="input-section">
            <div class="input-box">
              <textarea
                v-model="inputMessage"
                placeholder="例如：帮我看下我最近的刷题情况，或者推荐几篇适合前端面试复习的博客文章"
                @keydown.enter.exact.prevent="sendMessage"
                :disabled="isLoading"
                rows="1"
              ></textarea>

              <div class="input-toolbar">
                <div class="toolbar-left">
                  <label class="toggle-label">
                    <input type="checkbox" v-model="streamingEnabled" />
                    <span class="toggle-slider"></span>
                    <span class="toggle-text">流式输出</span>
                  </label>
                  <span class="helper-text">切换组件后当前会话仍保留，刷新页面后会重置。</span>
                </div>

                <div class="toolbar-actions">
                  <button class="clear-btn" @click="clearChat" :disabled="isLoading || store.messages.length <= 1">
                    清空会话
                  </button>
                  <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim() || isLoading">
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
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

const userStore = useUserStore()
const themeStore = useThemeStore()
const store = useCustomerServiceStore()

const capabilityCards = [
  { icon: '◎', title: '站内数据答疑', desc: '账号、刷题、榜单、社区和博客都能串起来问。' },
  { icon: '◇', title: '功能入口导航', desc: '告诉你应该去哪个页面、下一步怎么做。' },
  { icon: '△', title: '步骤说明', desc: '找回密码、发动态、写博客这类操作都能分步讲清。' },
  { icon: '○', title: '轻量实时信息', desc: '支持简单天气和城市距离查询，为后续扩展留好接口。' }
]

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

const inputMessage = computed({
  get: () => store.draftMessage,
  set: (value) => store.setDraftMessage(value)
})

const streamingEnabled = computed({
  get: () => store.useStreaming,
  set: (value) => store.setStreaming(value)
})

const sendPresetQuestion = (question) => {
  store.setDraftMessage(question)
  sendMessage()
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
  --ai-accent: #0f766e;
  --ai-accent-soft: rgba(15, 118, 110, 0.08);
  --ai-accent-line: rgba(15, 118, 110, 0.16);
  --ai-bg: #f3f6f8;
  --ai-surface: rgba(255, 255, 255, 0.96);
  --ai-surface-alt: #f8fbfc;
  --ai-border: rgba(15, 23, 42, 0.09);
  --ai-text: var(--color-text);
  --ai-text-soft: var(--color-text-secondary);
  --ai-text-faint: var(--color-text-muted);
  min-height: 100dvh;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), transparent 24%),
    linear-gradient(180deg, #f7fafc 0%, #f3f6f8 100%);
  overflow: hidden;
}

.customer-service-page.is-dark {
  --ai-accent: #5eead4;
  --ai-accent-soft: rgba(94, 234, 212, 0.12);
  --ai-accent-line: rgba(94, 234, 212, 0.2);
  --ai-bg: #09111c;
  --ai-surface: rgba(15, 23, 42, 0.96);
  --ai-surface-alt: #101a2d;
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
  padding: 10px 18px 14px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
}

.workspace-shell {
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 14px;
  overflow: hidden;
}

.service-sidebar {
  min-height: 0;
  height: 100%;
}

.sidebar-card,
.conversation-panel {
  background: var(--ai-surface);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
}

.prompt-card {
  height: 100%;
  padding: 18px 18px 16px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
}

.card-eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ai-accent);
  font-weight: 700;
}

.prompt-card h1 {
  margin: 0;
  color: var(--ai-text);
}

.prompt-card h1 {
  font-size: 22px;
  line-height: 1.22;
}

.card-description {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ai-text-soft);
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--ai-border);
}

.capability-inline-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.capability-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--ai-surface-alt);
  border: 1px solid var(--ai-border);
  color: var(--ai-text-soft);
  font-size: 11px;
  font-weight: 600;
}

.capability-badge-icon {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
  font-size: 11px;
}

.sidebar-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.memory-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--ai-accent-soft);
  color: var(--ai-accent);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-tip {
  font-size: 11px;
  color: var(--ai-text-faint);
}

.prompt-groups {
  margin-top: 14px;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-right: 4px;
}

.prompt-groups::-webkit-scrollbar,
.chat-area::-webkit-scrollbar {
  width: 6px;
}

.prompt-groups::-webkit-scrollbar-thumb,
.chat-area::-webkit-scrollbar-thumb {
  background: rgba(15, 118, 110, 0.18);
  border-radius: 999px;
}

.prompt-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-group-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--ai-text-soft);
}

.prompt-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prompt-chip {
  border: 1px solid var(--ai-border);
  background: var(--ai-surface-alt);
  color: var(--ai-text);
  border-radius: 999px;
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.prompt-chip:hover {
  border-color: var(--ai-accent-line);
  background: var(--ai-accent-soft);
  transform: translateY(-1px);
}

.conversation-panel {
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
}

.conversation-topbar {
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--ai-border);
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  background: linear-gradient(180deg, var(--ai-surface-alt), var(--ai-surface));
}

.topbar-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.topbar-copy strong {
  color: var(--ai-text);
  font-size: 14px;
}

.topbar-copy span {
  color: var(--ai-text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.topbar-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--ai-border);
  background: var(--ai-surface);
  color: var(--ai-text-soft);
  font-size: 11px;
}

.meta-pill.is-active {
  color: var(--ai-accent);
  border-color: var(--ai-accent-line);
  background: var(--ai-accent-soft);
}

.meta-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.chat-area {
  min-height: 0;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background:
    linear-gradient(180deg, rgba(15, 118, 110, 0.025), transparent 18%),
    var(--ai-surface);
}

.chat-message {
  display: flex;
  gap: 12px;
  animation: slideIn 0.22s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.avatar.user {
  background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
  color: #fff;
}

.avatar.service {
  background: var(--ai-accent);
  color: #fff;
}

.message-body {
  flex: 1;
  max-width: 78%;
}

.chat-message.user .message-body {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-content {
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.7;
}

.chat-message.user .message-content {
  background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
  color: #fff;
}

.chat-message.assistant .message-content {
  background: var(--ai-surface-alt);
  border: 1px solid var(--ai-border);
  color: var(--ai-text);
}

.message-content :deep(p) {
  margin: 0 0 10px;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.chat-message.user .message-content :deep(a) {
  color: inherit;
}

.chat-message.user .message-content :deep(code):not(pre code) {
  background: rgba(255, 255, 255, 0.14);
  color: #fff7ed;
}

.chat-message.user .message-content :deep(blockquote) {
  background: rgba(255, 255, 255, 0.12);
  border-left-color: rgba(255, 255, 255, 0.34);
}

.message-time {
  margin-top: 6px;
  font-size: 11px;
  color: var(--ai-text-faint);
}

.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 14px 16px;
  background: var(--ai-surface-alt);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--ai-accent);
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.42;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-section {
  padding: 14px 18px 18px;
  border-top: 1px solid var(--ai-border);
  background: var(--ai-surface);
}

.input-box {
  background: var(--ai-surface-alt);
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-box:focus-within {
  border-color: var(--ai-accent-line);
  box-shadow: 0 0 0 4px var(--ai-accent-soft);
}

.input-box textarea {
  width: 100%;
  min-height: 56px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  padding: 14px 16px 10px;
  font-family: inherit;
  color: var(--ai-text);
  font-size: 14px;
  line-height: 1.7;
}

.input-box textarea::placeholder {
  color: var(--ai-text-faint);
}

.input-toolbar {
  padding: 10px 12px 12px;
  border-top: 1px solid var(--ai-border);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-label input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.28);
  transition: all 0.2s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: all 0.2s ease;
}

.toggle-label input:checked + .toggle-slider {
  background: var(--ai-accent);
}

.toggle-label input:checked + .toggle-slider::after {
  left: 18px;
}

.toggle-text,
.helper-text {
  font-size: 12px;
  color: var(--ai-text-soft);
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.clear-btn,
.send-btn {
  min-width: 86px;
  height: 38px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.clear-btn {
  border: 1px solid rgba(239, 68, 68, 0.15);
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.clear-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.14);
}

.send-btn {
  border: none;
  background: var(--ai-accent);
  color: #fff;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.clear-btn:disabled,
.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 1160px) {
  .workspace-shell {
    grid-template-columns: 320px minmax(0, 1fr);
  }

  .conversation-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar-meta {
    justify-content: flex-start;
  }
}

@media (max-width: 900px) {
  .service-main {
    padding: 8px 10px 10px;
    height: 100dvh;
  }

  .workspace-shell {
    grid-template-columns: 1fr;
    grid-template-rows: 280px minmax(0, 1fr);
  }

  .conversation-panel {
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .prompt-card,
  .conversation-topbar,
  .chat-area,
  .input-section {
    padding-left: 14px;
    padding-right: 14px;
  }

  .message-body {
    max-width: 88%;
  }

  .workspace-shell {
    grid-template-rows: 250px minmax(0, 1fr);
  }

  .input-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: flex-end;
  }
}
</style>
