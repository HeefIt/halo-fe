<template>
  <div class="customer-service-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="service-main">
      <AIToolHeader
        title="智能客服"
        badge="支持"
      />

      <div class="chat-wrapper">
        <div class="chat-area" ref="chatHistoryRef">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="chat-message"
            :class="message.role"
          >
            <div class="message-avatar">
              <div v-if="message.role === 'user'" class="avatar user">
                {{ userInitial }}
              </div>
              <div v-else class="avatar service">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"></path>
                </svg>
              </div>
            </div>
            <div class="message-body">
              <div class="message-content" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <div v-if="isLoading" class="chat-message assistant">
            <div class="message-avatar">
              <div class="avatar service">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"></path>
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

        <div class="quick-questions" v-if="messages.length <= 1">
          <h4>常见入口</h4>
          <div class="questions-grid">
            <button class="question-card" @click="askQuestion('如何修改个人资料？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              如何修改个人资料？
            </button>
            <button class="question-card" @click="askQuestion('忘记密码怎么办？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              忘记密码怎么办？
            </button>
            <button class="question-card" @click="askQuestion('如何查看练习轨迹？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              如何查看练习轨迹？
            </button>
            <button class="question-card" @click="askQuestion('如何发布或编辑博客文章？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              如何发布或编辑博客文章？
            </button>
            <button class="question-card" @click="askQuestion('发现题目或文章有问题怎么反馈？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              发现题目或文章有问题怎么反馈？
            </button>
          </div>
        </div>

        <div class="input-section">
          <div class="input-box">
            <textarea
              v-model="inputMessage"
              placeholder="描述你遇到的问题、功能疑问或使用诉求..."
              @keydown.enter.exact.prevent="sendMessage"
              :disabled="isLoading"
              rows="1"
              ref="textareaRef"
            ></textarea>
            <div class="input-toolbar">
              <div class="stream-toggle">
                <label class="toggle-label">
                  <input type="checkbox" v-model="useStreaming" />
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">流式输出</span>
                </label>
              </div>
              <div class="toolbar-actions">
                <button class="clear-btn" @click="clearChat" :disabled="isLoading || messages.length <= 1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  清空
                </button>
                <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim() || isLoading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <p class="service-hours">智能服务全天在线 · 人工支持 9:00-21:00</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import { useThemeStore } from '@/stores/modules/theme'
import { customerServiceChat, customerServiceChatStream } from '@/api/modules/ai/chat'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import AIToolHeader from './components/AIToolHeader.vue'

marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  breaks: true,
  gfm: true
})

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const chatHistoryRef = ref(null)
const textareaRef = ref(null)
const useStreaming = ref(false)

const userInitial = computed(() => {
  return userStore.userName?.charAt(0) || 'U'
})

const askQuestion = (question) => {
  inputMessage.value = question
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  const timestamp = new Date()

  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: timestamp
  })

  inputMessage.value = ''
  scrollToBottom()
  isLoading.value = true

  try {
    if (useStreaming.value) {
      let assistantReply = ''

      await customerServiceChatStream(
        userMessage,
        null,
        (data) => {
          let incrementalContent = ''
          if (typeof data === 'object') {
            incrementalContent = data.reply || data.content || ''
          } else if (typeof data === 'string') {
            incrementalContent = data
          }

          assistantReply += incrementalContent

          const lastMessage = messages.value[messages.value.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = assistantReply
          } else {
            messages.value.push({
              role: 'assistant',
              content: assistantReply,
              timestamp: new Date()
            })
          }
          scrollToBottom()
        },
        (error) => {
          console.error('客服消息发送失败:', error)
          ElMessage.error('消息发送失败，请稍后重试')
        },
        () => {
          isLoading.value = false
          scrollToBottom()
        }
      )
    } else {
      const response = await customerServiceChat(userMessage, null)

      if (response.data && response.data.reply) {
        messages.value.push({
          role: 'assistant',
          content: response.data.reply,
          timestamp: new Date()
        })
      }

      isLoading.value = false
      scrollToBottom()
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请稍后重试')
    isLoading.value = false
  }
}

const clearChat = () => {
  messages.value = [{
    role: 'assistant',
    content: '你好，我是 Halo 平台助手，可以帮你了解功能入口、使用流程、练习路径和常见问题。想先解决哪件事？',
    timestamp: new Date()
  }]
  inputMessage.value = ''
  ElMessage.success('聊天记录已清空')
}

const formatMessage = (content) => {
  if (!content) return ''
  return DOMPurify.sanitize(marked.parse(content))
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
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

onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '你好，我是 Halo 平台助手，可以帮你了解功能入口、使用流程、练习路径和常见问题。想先解决哪件事？',
    timestamp: new Date()
  })
})
</script>

<style scoped>
.customer-service-page {
  --ai-accent: #0f766e;
  --ai-accent-soft: rgba(15, 118, 110, 0.08);
  --ai-accent-line: rgba(15, 118, 110, 0.16);
  --ai-bg: #f4f6fa;
  --ai-surface: #ffffff;
  --ai-surface-alt: #f8fafc;
  --ai-surface-muted: #ecfeff;
  --ai-border: rgba(15, 23, 42, 0.1);
  --ai-text: var(--color-text);
  --ai-text-soft: var(--color-text-secondary);
  --ai-text-faint: var(--color-text-muted);
  height: 100dvh;
  min-height: 100dvh;
  background: var(--ai-bg);
  overflow: hidden;
}

.customer-service-page.is-dark {
  --ai-accent: #5eead4;
  --ai-accent-soft: rgba(94, 234, 212, 0.12);
  --ai-accent-line: rgba(94, 234, 212, 0.2);
  --ai-bg: #09111c;
  --ai-surface: #0f172a;
  --ai-surface-alt: #111c31;
  --ai-surface-muted: #13232d;
  --ai-border: rgba(148, 163, 184, 0.14);
  --ai-text: var(--text-1);
  --ai-text-soft: var(--text-2);
  --ai-text-faint: var(--text-3);
}

.service-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 16px 12px;
  width: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100dvh;
  gap: 18px;
}

.chat-wrapper {
  width: 100%;
  background: var(--ai-surface);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--ai-border);
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
}

.chat-area::-webkit-scrollbar {
  width: 6px;
}

.chat-area::-webkit-scrollbar-track {
  background: transparent;
}

.chat-area::-webkit-scrollbar-thumb {
  background: rgba(15, 118, 110, 0.18);
  border-radius: 3px;
}

.chat-message {
  display: flex;
  gap: 14px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.avatar.user {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  color: white;
}

.avatar.service {
  background: var(--ai-accent);
  color: white;
}

.message-body {
  flex: 1;
  max-width: 70%;
}

.chat-message.user .message-body {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-content {
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.6;
}

.chat-message.user .message-content {
  background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-message.assistant .message-content {
  background: var(--ai-surface-alt);
  border: 1px solid var(--ai-border);
  color: var(--ai-text);
  border-bottom-left-radius: 4px;
}

.message-content :deep(pre) {
  background: #1e293b;
  border-radius: 10px;
  padding: 14px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-content :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.message-content :deep(p) {
  margin: 0 0 10px 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-time {
  font-size: 11px;
  color: var(--ai-text-faint);
  margin-top: 6px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
  background: var(--ai-surface-alt);
  border: 1px solid var(--ai-border);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--ai-accent);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.quick-questions {
  padding: 0 32px 24px;
  border-top: 1px solid var(--ai-border);
  padding-top: 20px;
}

.quick-questions h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text-soft);
  margin: 0 0 12px 0;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.question-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--ai-surface-alt);
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  color: var(--ai-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.question-card:hover {
  border-color: var(--ai-accent-line);
  background: var(--ai-accent-soft);
}

.question-card svg {
  flex-shrink: 0;
  color: var(--ai-accent);
}

.input-section {
  padding: 20px 32px 24px;
  border-top: 1px solid var(--ai-border);
  background: var(--ai-surface-alt);
}

.input-box {
  background: var(--ai-surface);
  border: 1px solid var(--ai-border);
  border-radius: 16px;
  padding: 4px;
  transition: all 0.3s ease;
}

.input-box:focus-within {
  border-color: var(--ai-accent-line);
  box-shadow: 0 0 0 4px var(--ai-accent-soft);
}

.input-box textarea {
  width: 100%;
  background: transparent;
  border: none;
  padding: 14px 16px;
  color: var(--ai-text);
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
}

.input-box textarea::placeholder {
  color: var(--ai-text-faint);
}

.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid var(--ai-border);
}

.stream-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-label input {
  display: none;
}

.toggle-slider {
  width: 36px;
  height: 20px;
  background: rgba(148, 163, 184, 0.28);
  border-radius: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-label input:checked + .toggle-slider {
  background: var(--ai-accent);
}

.toggle-label input:checked + .toggle-slider::after {
  left: 18px;
}

.toggle-text {
  font-size: 12px;
  color: var(--ai-text-soft);
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 10px;
  color: #ef4444;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ai-accent);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.03);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.service-hours {
  text-align: center;
  font-size: 11px;
  color: var(--ai-text-faint);
  margin: 12px 0 0 0;
}

@media (max-width: 768px) {
  .service-main {
    padding: 8px 10px 10px;
  }

  .chat-wrapper {
    border-radius: 16px;
  }

  .chat-area {
    padding: 20px;
    min-height: 300px;
  }

  .quick-questions {
    padding: 0 20px 20px;
  }

  .questions-grid {
    grid-template-columns: 1fr;
  }

  .input-section {
    padding: 16px 20px 20px;
  }

  .message-body {
    max-width: 85%;
  }
}
</style>
