<template>
  <div class="customer-service-container">
    <header class="service-header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z"></path>
            </svg>
          </div>
          <div class="brand-text">
            <h1>智能客服中心</h1>
            <span class="status-badge">
              <span class="status-dot"></span>
              7x24 在线
            </span>
          </div>
        </div>
        <nav class="header-nav">
          <button class="nav-item" @click="navigateTo('chatbot')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>AI对话</span>
          </button>
          <button class="nav-item" @click="navigateTo('practice-assistant')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>刷题助手</span>
          </button>
          <button class="nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>客服</span>
          </button>
          <button class="nav-item" @click="navigateTo('multimodal')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>多模态</span>
          </button>
        </nav>
        <button class="home-btn" @click="goHome">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>返回首页</span>
        </button>
      </div>
    </header>

    <main class="service-main">
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
          <h4>常见问题</h4>
          <div class="questions-grid">
            <button class="question-card" @click="askQuestion('如何修改个人信息？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              如何修改个人信息？
            </button>
            <button class="question-card" @click="askQuestion('忘记密码怎么办？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              忘记密码怎么办？
            </button>
            <button class="question-card" @click="askQuestion('如何查看刷题记录？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              如何查看刷题记录？
            </button>
            <button class="question-card" @click="askQuestion('题目有错误怎么反馈？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              题目有错误怎么反馈？
            </button>
          </div>
        </div>

        <div class="input-section">
          <div class="input-box">
            <textarea
              v-model="inputMessage"
              placeholder="描述您遇到的问题..."
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
          <p class="service-hours">客服工作时间：全天候智能服务 · 人工客服 9:00-21:00</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { customerServiceChat, customerServiceChatStream } from '@/api/ai'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

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

const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const chatHistoryRef = ref(null)
const textareaRef = ref(null)
const useStreaming = ref(false)

const userInitial = computed(() => {
  return userStore.userName?.charAt(0) || 'U'
})

const navigateTo = (feature) => {
  router.push(`/ai/${feature}`)
}

const goHome = () => {
  router.push('/home')
}

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
    content: '您好！我是智能客服小助手，很高兴为您服务。请问有什么我可以帮助您的吗？',
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
    content: '您好！我是智能客服小助手，很高兴为您服务。请问有什么我可以帮助您的吗？',
    timestamp: new Date()
  })
})
</script>

<style scoped>
.customer-service-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #f0fdfa 100%);
  display: flex;
  flex-direction: column;
}

.service-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.brand-text h1 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(20, 184, 166, 0.08);
  color: #0f766e;
}

.nav-item.active {
  background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  color: #0f766e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.home-btn:hover {
  background: rgba(20, 184, 166, 0.1);
  border-color: rgba(20, 184, 166, 0.3);
}

.service-main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 32px;
}

.chat-wrapper {
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 400px;
  max-height: calc(100vh - 380px);
}

.chat-area::-webkit-scrollbar {
  width: 6px;
}

.chat-area::-webkit-scrollbar-track {
  background: transparent;
}

.chat-area::-webkit-scrollbar-thumb {
  background: rgba(20, 184, 166, 0.2);
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
  background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
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
  background: #f8fafc;
  border: 1px solid rgba(20, 184, 166, 0.1);
  color: #334155;
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
  color: #94a3b8;
  margin-top: 6px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
  background: #f8fafc;
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #14b8a6;
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
  border-top: 1px solid rgba(20, 184, 166, 0.08);
  padding-top: 20px;
}

.quick-questions h4 {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
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
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%);
  border: 1px solid rgba(20, 184, 166, 0.15);
  border-radius: 12px;
  color: #0f766e;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.question-card:hover {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%);
  border-color: rgba(20, 184, 166, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.15);
}

.question-card svg {
  flex-shrink: 0;
  color: #14b8a6;
}

.input-section {
  padding: 20px 32px 24px;
  border-top: 1px solid rgba(20, 184, 166, 0.08);
  background: #fafcfc;
}

.input-box {
  background: white;
  border: 1px solid rgba(20, 184, 166, 0.15);
  border-radius: 16px;
  padding: 4px;
  transition: all 0.3s ease;
}

.input-box:focus-within {
  border-color: #14b8a6;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
}

.input-box textarea {
  width: 100%;
  background: transparent;
  border: none;
  padding: 14px 16px;
  color: #0f172a;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
}

.input-box textarea::placeholder {
  color: #94a3b8;
}

.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid rgba(20, 184, 166, 0.08);
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
  background: #e2e8f0;
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
  background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
}

.toggle-label input:checked + .toggle-slider::after {
  left: 18px;
}

.toggle-text {
  font-size: 12px;
  color: #64748b;
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
  background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.service-hours {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin: 12px 0 0 0;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    gap: 16px;
  }

  .header-nav {
    display: none;
  }

  .service-main {
    padding: 16px;
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
