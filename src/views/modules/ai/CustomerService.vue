<!--
  智能客服页面
  功能描述：7x24小时智能客服，快速解答用户疑问
  主要功能：
    - 智能问答
    - 常见问题查询
    - 实时客服支持
    - 流式对话体验
  使用位置：路由 /ai/customer-service
-->
<template>
  <div class="customer-service-page">
    <div class="ai-nav">
      <div class="ai-nav-container">
        <div class="ai-nav-content">
          <div class="ai-logo" @click="goHome">
            <div class="logo-icon">
              <el-icon :size="24"><ChatDotRound /></el-icon>
            </div>
            <span class="logo-title">AI 智能助手</span>
          </div>
          
          <nav class="ai-nav-menu">
            <span class="ai-nav-item" @click="navigateTo('chatbot')">
              <el-icon><ChatLineRound /></el-icon>
              <span>机器人对话</span>
            </span>
            <span class="ai-nav-item" @click="navigateTo('practice-assistant')">
              <el-icon><Edit /></el-icon>
              <span>刷题助手</span>
            </span>
            <span class="ai-nav-item active">
              <el-icon><Service /></el-icon>
              <span>智能客服</span>
            </span>
            <span class="ai-nav-item" @click="navigateTo('multimodal')">
              <el-icon><Picture /></el-icon>
              <span>多模态解析</span>
            </span>
          </nav>
          
          <div class="back-home" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            <span>返回首页</span>
          </div>
        </div>
      </div>
    </div>
    
    <main class="main-content">
      <div class="chat-container">
        <!-- 聊天历史区域 -->
        <div class="chat-history" ref="chatHistoryRef">
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            :class="['message-item', message.role === 'user' ? 'user-message' : 'assistant-message']"
          >
            <div class="message-avatar">
              <el-icon v-if="message.role === 'user'" :size="20"><User /></el-icon>
              <el-icon v-else :size="20"><Service /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="message-item assistant-message">
            <div class="message-avatar">
              <el-icon :size="20"><Service /></el-icon>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-container">
            <el-input
              v-model="inputMessage"
              placeholder="请输入您的问题..."
              type="textarea"
              :rows="3"
              resize="none"
              @keydown.enter.exact.prevent="sendMessage"
              :disabled="isLoading"
            />
            <div class="input-options">
              <div class="streaming-option">
                <el-switch
                  v-model="useStreaming"
                  :disabled="isLoading"
                  active-text="流式输出"
                  inactive-text="普通输出"
                />
              </div>
              <div class="input-actions">
                <el-button 
                  type="primary" 
                  @click="sendMessage" 
                  :loading="isLoading"
                  :disabled="!inputMessage.trim()"
                >
                  <el-icon><Promotion /></el-icon>
                  发送
                </el-button>
                <el-button @click="clearChat" :disabled="isLoading">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound, ChatLineRound, Edit, Service, Picture, HomeFilled, User, Promotion, Delete, Switch } from '@element-plus/icons-vue'
import { customerServiceChat, customerServiceChatStream } from '@/api/ai'

const router = useRouter()

// 聊天相关数据
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const chatHistoryRef = ref(null)
const useStreaming = ref(false) // 流式输出开关，默认关闭

// 导航函数
const navigateTo = (feature) => {
  try {
    router.push(`/ai/${feature}`)
  } catch (error) {
    console.error('路由跳转失败:', error)
  }
}

const goHome = () => {
  router.push('/home')
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const userMessage = inputMessage.value.trim()
  const timestamp = new Date()
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: timestamp
  })
  
  // 清空输入框
  inputMessage.value = ''
  
  // 滚动到底部
  scrollToBottom()
  
  // 设置加载状态
  isLoading.value = true
  
  try {
    if (useStreaming.value) {
      // 使用流式输出
      let assistantReply = ''
      
      await customerServiceChatStream(
        userMessage,
        null, // userId可以设为null或从store获取
        (data) => {
          console.log('收到流式数据:', data);
          
          // 流式消息处理 - 增量内容处理（与机器人对话保持一致）
          let incrementalContent = ''
          if (typeof data === 'object') {
            // 优先使用增量内容（reply字段），这是后端直接发送的当前chunk
            incrementalContent = data.reply || data.content || ''
            console.log('增量内容详情:', {
              hasReply: !!data.reply,
              hasContent: !!data.content,
              replyLength: data.reply ? data.reply.length : 0,
              contentLength: data.content ? data.content.length : 0
            });
          } else if (typeof data === 'string') {
            incrementalContent = data
          }
          
          console.log('解析后的增量内容:', incrementalContent, '长度:', incrementalContent.length);
          
          // 累积增量内容
          assistantReply += incrementalContent
          
          // 更新或添加助手消息
          const lastMessage = messages.value[messages.value.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            // 更新现有消息，使用累积的内容
            lastMessage.content = assistantReply
            console.log('更新消息内容，总长度:', assistantReply.length, '新增长度:', incrementalContent.length);
          } else {
            // 添加新消息
            messages.value.push({
              role: 'assistant',
              content: assistantReply,
              timestamp: new Date()
            })
            console.log('添加新消息，内容长度:', assistantReply.length);
          }
          
          console.log('当前消息列表长度:', messages.value.length);
          scrollToBottom()
        },
        (error) => {
          console.error('客服消息发送失败:', error)
          ElMessage.error('消息发送失败，请稍后重试')
        },
        () => {
          // 完成回调
          isLoading.value = false
          scrollToBottom()
        }
      )
    } else {
      // 使用普通输出
      const response = await customerServiceChat(userMessage, null)
      
      if (response.data && response.data.reply) {
        // 后端已处理Unicode编码，直接使用
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

// 清空聊天
const clearChat = () => {
  messages.value = []
  inputMessage.value = ''
  ElMessage.success('聊天记录已清空')
}

// 导入Markdown相关依赖
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

// 配置marked
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  breaks: true,
  gfm: true
})

// 格式化消息内容（支持完整Markdown渲染）
const formatMessage = (content) => {
  if (!content) return ''
  // 使用marked解析Markdown，然后用DOMPurify进行安全过滤
  return DOMPurify.sanitize(marked.parse(content))
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

// 页面加载时添加欢迎消息
onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '您好！我是智能客服小助手，很高兴为您服务。请问有什么我可以帮助您的吗？',
    timestamp: new Date()
  })
})
</script>

<style scoped>
.customer-service-page {
  min-height: 100vh;
  background: #ffffff;
  background-image: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
}

.ai-nav {
  background: #ffffff;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
}

.ai-nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.ai-nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  gap: 24px;
}

.ai-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border: 2px solid transparent;
}

.ai-logo:hover {
  background-color: #f0f0f0;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
  border: 2px solid #000000;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #000000;
  color: #ffffff;
  border-radius: 0;
}

.logo-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
}

.ai-nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.ai-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #000000;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 10px 20px;
  border: 2px solid #000000;
  border-radius: 0;
  cursor: pointer;
  white-space: nowrap;
  background: #ffffff;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.ai-nav-item .el-icon {
  font-size: 18px;
}

.ai-nav-item:hover {
  background-color: #000000;
  color: #ffffff;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}

.ai-nav-item.active {
  background-color: #000000;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 4px 4px 0px #000000;
  transform: translate(-2px, -2px);
}

.back-home {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #000000;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 10px 20px;
  border: 2px solid #000000;
  border-radius: 0;
  cursor: pointer;
  white-space: nowrap;
  background: #ffffff;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.back-home:hover {
  background-color: #000000;
  color: #ffffff;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}

.main-content {
  padding: 108px 24px 24px 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.chat-container {
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 4px solid #000000;
  box-shadow: 8px 8px 0px #000000;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.assistant-message {
  align-self: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #000000;
  color: #ffffff;
}

.user-message .message-avatar {
  background: #000000;
}

.assistant-message .message-avatar {
  background: #409eff;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.user-message .message-text {
  background: #000000;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.assistant-message .message-text {
  background: #f5f5f5;
  color: #333333;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #999999;
  padding: 0 8px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999999;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-area {
  border-top: 2px solid #000000;
  padding: 20px;
  background: #ffffff;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.streaming-option {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 0;
}

.streaming-option :deep(.el-switch__core) {
  border-radius: 0;
}

.streaming-option :deep(.el-switch__label) {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 12px;
}

.input-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.input-actions .el-button {
  border-radius: 0;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  font-weight: 500;
}

.input-actions .el-button:first-child {
  background: #000000;
  border-color: #000000;
}

.input-actions .el-button:first-child:hover {
  background: #333333;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}

/* Markdown渲染样式 */
.message-text {
  line-height: 1.6;
}

/* 代码块样式 */
.message-text pre {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid #333;
}

.message-text code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #333;
}

.message-text pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 13px;
}

/* 表格样式 */
.message-text table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.message-text th,
.message-text td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.message-text th {
  background: #f8f9fa;
  font-weight: 600;
}

.message-text tr:nth-child(even) {
  background: #f9f9f9;
}

/* 引用块样式 */
.message-text blockquote {
  border-left: 4px solid #007acc;
  margin: 12px 0;
  padding: 8px 16px;
  background: #f8f9fa;
  color: #555;
  border-radius: 0 4px 4px 0;
}

/* 列表样式 */
.message-text ul,
.message-text ol {
  padding-left: 24px;
  margin: 12px 0;
}

.message-text li {
  margin: 8px 0;
}

/* 标题样式 */
.message-text h1,
.message-text h2,
.message-text h3,
.message-text h4,
.message-text h5,
.message-text h6 {
  margin: 16px 0 12px 0;
  font-weight: 600;
  color: #333;
}

.message-text h1 { font-size: 24px; }
.message-text h2 { font-size: 22px; }
.message-text h3 { font-size: 20px; }
.message-text h4 { font-size: 18px; }
.message-text h5 { font-size: 16px; }
.message-text h6 { font-size: 14px; }

/* 链接样式 */
.message-text a {
  color: #007acc;
  text-decoration: none;
  border-bottom: 1px dotted #007acc;
}

.message-text a:hover {
  color: #005a9e;
  border-bottom: 1px solid #005a9e;
}

/* 滚动条样式 */
.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-history::-webkit-scrollbar-thumb {
  background: #cccccc;
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background: #999999;
}
</style>
