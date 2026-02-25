<!--
  机器人对话页面
  功能描述：AI机器人对话界面，支持会话记忆和历史会话管理
  主要功能：
    - 实时对话聊天界面
    - 显示对话历史
    - 支持创建新对话
    - 支持切换历史对话
    - 支持清空当前对话
    - 自动保存对话历史
  使用位置：路由 /ai/chatbot
-->
<template>
  <div class="chatbot-page">
    <!-- 左侧会话列表 -->
    <div class="chat-sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="createNewChat">
          <el-icon><Plus /></el-icon>
          <span v-if="!isSidebarCollapsed">新对话</span>
        </button>
        <button class="collapse-btn" @click="toggleSidebar">
          <el-icon v-if="isSidebarCollapsed"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
        </button>
      </div>
      
      <div class="chat-list">
        <div 
          v-for="session in sessions" 
          :key="session.sessionId"
          class="chat-item"
          :class="{ active: currentSessionId === session.sessionId }"
          @click="selectChat(session.sessionId)"
        >
          <div class="chat-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="chat-info" v-if="!isSidebarCollapsed">
            <div class="chat-title">{{ "新对话:"+getSessionDisplayTitle(session) }}</div>
            <div class="chat-time">{{ formatTime(session.updatedAt) }}</div>
          </div>
          <button 
            class="delete-chat-btn" 
            @click.stop="deleteChat(session.sessionId)"
            v-if="!isSidebarCollapsed"
          >
            <el-icon><Delete /></el-icon>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="currentMessages.length === 0 && !isLoading" class="empty-state">
          <div class="empty-icon">
            <el-icon :size="64"><ChatLineRound /></el-icon>
          </div>
          <h2 class="empty-title">开始新的对话</h2>
          <p class="empty-description">输入您的问题，我将为您提供智能回答</p>
        </div>
        
        <div v-if="isLoading && currentMessages.length === 0" class="loading-state">
          <div class="loading-spinner">
            <el-icon :size="32" spin><Loading /></el-icon>
          </div>
          <p>正在加载会话数据...</p>
        </div>
        
        <div 
          v-for="(message, index) in currentMessages" 
          :key="`${currentSessionId}-${index}`"
          class="message-wrapper"
          :class="{ 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }"
        >
          <div class="message-avatar">
            <el-avatar v-if="message.role === 'user'" :size="32">
              {{ userStore.userName?.charAt(0) || '用户' }}
            </el-avatar>
            <div v-else class="assistant-avatar">
              <el-icon :size="20"><Avatar /></el-icon>
            </div>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content || '')"></div>
            <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <!-- 发送消息时的加载状态 -->
        <div v-if="isLoading && currentMessages.length > 0" class="message-wrapper assistant-message">
          <div class="message-avatar">
            <div class="assistant-avatar">
              <el-icon :size="20"><Avatar /></el-icon>
            </div>
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
      <div class="chat-input-area">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="输入您的问题..."
            @keydown.enter.prevent="handleSendMessage"
            class="message-input"
          />
          <button 
            class="send-btn" 
            @click="handleSendMessage"
            :disabled="!inputMessage.trim() || isLoading"
          >
            <el-icon v-if="isLoading"><Loading /></el-icon>
            <el-icon v-else><Promotion /></el-icon>
          </button>
        </div>
        <div class="input-actions">
          <button 
            class="clear-session-btn" 
            @click="clearCurrentSession"
            :disabled="!currentSessionId || currentMessages.length === 0"
          >
            <el-icon><Delete /></el-icon>
            <span>清空会话</span>
          </button>
          <div class="input-tips">
            <span>AI生成的内容可能不准确，请谨慎参考</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { 
  Plus, 
  Fold, 
  Expand, 
  ChatDotRound, 
  ChatLineRound, 
  Delete, 
  Avatar, 
  Promotion, 
  Loading 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as aiApi from '@/api/ai'

const router = useRouter()
const userStore = useUserStore()

const isSidebarCollapsed = ref(false)
const currentChatId = ref(null)
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)

// 会话管理相关
const sessions = ref([])
const currentSessionId = ref(null)
const currentSession = ref(null)

const currentMessages = computed(() => {
  // 添加isLoading依赖，确保加载状态变化时重新计算
  isLoading.value
  
  if (!currentSession.value) return []
  
  // 确保消息数组存在且为数组
  if (!currentSession.value.messages) {
    console.warn('当前会话消息数组为空，创建新的空数组')
    currentSession.value.messages = []
  }
  
  const messages = Array.isArray(currentSession.value.messages) 
    ? currentSession.value.messages 
    : []
  
  console.log('计算当前消息，会话ID:', currentSessionId.value, '消息数量:', messages.length)
  
  // 按时间戳排序确保正确显示顺序
  return [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime()
    const timeB = new Date(b.timestamp || 0).getTime()
    return timeA - timeB
  })
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 会话管理方法
const loadSessions = async () => {
  try {
    console.log('开始加载会话列表，userId:', userStore.userInfo?.id)
    const response = await aiApi.getUserSessions(userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value = response.data || []
      
      console.log('从服务器获取到会话列表，数量:', sessions.value.length)
      sessions.value.forEach((session, index) => {
        console.log(`会话${index + 1}:`, session.sessionId, '标题:', session.title, '消息数量:', session.messages?.length || 0)
      })
      
      // 确保每个会话的消息数组存在并按时间排序
      sessions.value.forEach(session => {
        if (!session.messages || !Array.isArray(session.messages)) {
          session.messages = []
        }
        // 按时间戳排序消息
        session.messages.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime()
          const timeB = new Date(b.timestamp || 0).getTime()
          return timeA - timeB
        })
      })
      
      console.log('加载会话列表成功，共', sessions.value.length, '个会话')
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
    ElMessage.error('加载会话列表失败')
  }
}

const createNewSession = async () => {
  try {
    const response = await aiApi.createSession('', userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value.unshift(response.data)
      selectSession(response.data.sessionId)
      ElMessage.success('新会话创建成功')
    }
  } catch (error) {
    console.error('创建会话失败:', error)
    ElMessage.error('创建会话失败')
  }
}

const selectSession = async (sessionId) => {
  // 如果已经是当前会话，直接返回
  if (currentSessionId.value === sessionId) {
    await nextTick()
    scrollToBottom()
    return
  }
  
  try {
    // 显示加载状态
    isLoading.value = true
    
    // 先保存当前会话状态（如果存在）
    if (currentSessionId.value && currentSession.value) {
      await saveCurrentSessionState()
    }
    
    const response = await aiApi.getSession(sessionId, userStore.userInfo?.id)
    if (response.code === 200) {
      // 更新状态
      currentSessionId.value = sessionId
      currentSession.value = response.data
      
      // 确保消息数组存在且为数组
      if (!currentSession.value.messages || !Array.isArray(currentSession.value.messages)) {
        currentSession.value.messages = []
      }
      
      // 更新会话列表中的该会话信息
      const sessionIndex = sessions.value.findIndex(s => s.sessionId === sessionId)
      if (sessionIndex !== -1) {
        // 使用响应式更新，保持对象引用一致
        Object.assign(sessions.value[sessionIndex], response.data)
      }
      
      // 强制触发UI更新
      await nextTick()
      scrollToBottom()
      
      console.log('会话切换成功:', sessionId, '消息数量:', currentSession.value.messages.length)
    }
  } catch (error) {
    console.error('加载会话详情失败:', error)
    ElMessage.error('加载会话详情失败')
  } finally {
    isLoading.value = false
  }
}

const deleteSession = async (sessionId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？删除后将无法恢复。', '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await aiApi.deleteSession(sessionId, userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value = sessions.value.filter(s => s.sessionId !== sessionId)
      
      // 如果删除的是当前会话，切换到其他会话或创建新会话
      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          selectSession(sessions.value[0].sessionId)
        } else {
          currentSessionId.value = null
          currentSession.value = null
        }
      }
      
      ElMessage.success('会话已删除')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会话失败:', error)
      ElMessage.error('删除会话失败')
    }
  }
}

const clearCurrentSession = async () => {
  if (!currentSessionId.value) return
  
  try {
    await ElMessageBox.confirm('确定要清空当前会话的所有消息吗？', '确认清空', {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await aiApi.clearSessionMessages(currentSessionId.value, userStore.userInfo?.id)
    if (response.code === 200) {
      currentSession.value.messages = []
      ElMessage.success('会话消息已清空')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空会话失败:', error)
      ElMessage.error('清空会话失败')
    }
  }
}

const createNewChat = async () => {
  // 确保用户已登录
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  await createNewSession()
}

const selectChat = async (sessionId) => {
  // 确保用户已登录
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  
  await selectSession(sessionId)
}

const deleteChat = async (sessionId) => {
  // 确保用户已登录
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  await deleteSession(sessionId)
}

const handleSendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return
  
  // 确保用户已登录
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  
  if (!currentSessionId.value) {
    await createNewSession()
    if (!currentSessionId.value) return
  }
  
  const userMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  }
  
  // 添加用户消息到当前会话
  if (!currentSession.value.messages) {
    currentSession.value.messages = []
  }
  currentSession.value.messages.push(userMessage)
  console.log('添加用户消息，当前会话消息总数:', currentSession.value.messages.length)
  inputMessage.value = ''
  
  // 如果是第一条消息，更新会话标题
  if (currentSession.value.messages.length === 1) {
    currentSession.value.title = message.substring(0, 20) + (message.length > 20 ? '...' : '')
  }
  
  scrollToBottom()
  
  isLoading.value = true
  
  try {
    const response = await sendMessageToAI(currentSession.value.messages)
    
    const assistantMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    }
    
    currentSession.value.messages.push(assistantMessage)
    currentSession.value.updatedAt = new Date().toISOString()
    
    console.log('添加AI回复消息，当前会话消息总数:', currentSession.value.messages.length)
    
    // 更新会话列表中的该会话
    const sessionIndex = sessions.value.findIndex(s => s.sessionId === currentSessionId.value)
    if (sessionIndex !== -1) {
      Object.assign(sessions.value[sessionIndex], currentSession.value)
    }
    
    // 立即保存会话状态到后端
    await saveCurrentSessionState()
    
  } catch (error) {
    ElMessage.error('发送消息失败: ' + error.message)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const sendMessageToAI = async (messages) => {
  try {
    const response = await aiApi.sendChatMessage(messages, userStore.userInfo?.id)
    if (response.code === 200) {
      return response.data.reply
    } else {
      throw new Error(response.message || '请求失败')
    }
  } catch (error) {
    console.error('AI请求错误:', error)
    return '抱歉，我遇到了一些问题，请稍后再试。'
  }
}

const formatMessage = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return new Date(date).toLocaleDateString()
  }
}

const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取会话显示标题
const getSessionDisplayTitle = (session) => {
  // 如果是默认标题"新对话"，显示会话ID的前8位
  if (session.title === '新对话' || !session.title) {
    return session.sessionId ? session.sessionId.substring(0, 8) : '未知会话'
  }
  return session.title
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 保存当前会话状态到后端
const saveCurrentSessionState = async () => {
  if (!currentSessionId.value || !currentSession.value) return
  
  try {
    // 构造完整的会话数据
    const sessionData = {
      sessionId: currentSessionId.value,
      userId: userStore.userInfo?.id,
      title: currentSession.value.title,
      messages: currentSession.value.messages || [],
      createdAt: currentSession.value.createdAt,
      updatedAt: new Date().toISOString()
    }
    
    console.log('准备保存会话状态:', currentSessionId.value, '消息数量:', sessionData.messages.length)
    console.log('用户信息:', userStore.userInfo)
    console.log('用户ID字段:', userStore.userInfo?.id)
    console.log('用户loginId字段:', userStore.userInfo?.loginId)
    console.log('发送的userId:', userStore.userInfo?.id || userStore.userInfo?.loginId)
    console.log('会话数据:', JSON.stringify(sessionData, null, 2))
    
    // 调用后端更新接口
    const response = await aiApi.updateSession(currentSessionId.value, sessionData, userStore.userInfo?.id)
    if (response.code === 200) {
      console.log('会话状态保存成功:', currentSessionId.value)
    } else {
      console.warn('会话状态保存失败:', response.message)
      // 保存到本地存储作为备份
      const localData = {
        currentSessionId: currentSessionId.value,
        sessionData: sessionData
      }
      localStorage.setItem(`ai_session_backup_${currentSessionId.value}`, JSON.stringify(localData))
    }
    
  } catch (error) {
    console.error('保存会话状态失败:', error)
    // 出错时也保存到本地存储作为备份
    try {
      const sessionData = {
        sessionId: currentSessionId.value,
        userId: userStore.userInfo?.id,
        title: currentSession.value.title,
        messages: currentSession.value.messages || [],
        createdAt: currentSession.value.createdAt,
        updatedAt: new Date().toISOString()
      }
      const localData = {
        currentSessionId: currentSessionId.value,
        sessionData: sessionData
      }
      localStorage.setItem(`ai_session_backup_${currentSessionId.value}`, JSON.stringify(localData))
      console.log('本地备份保存成功:', currentSessionId.value)
    } catch (localError) {
      console.error('本地备份也失败:', localError)
    }
  }
}

const saveSessionState = () => {
  const data = {
    currentSessionId: currentSessionId.value,
    sessions: sessions.value
  }
  localStorage.setItem('ai_session_state', JSON.stringify(data))
}

const loadSessionState = () => {
  const saved = localStorage.getItem('ai_session_state')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      currentSessionId.value = data.currentSessionId || null
      sessions.value = data.sessions || []
    } catch (error) {
      console.error('加载会话状态失败:', error)
    }
  }
}

onMounted(async () => {
  console.log('ChatBot组件挂载开始')
  
  // 确保用户已登录
  if (!userStore.userInfo?.id) {
    console.log('用户未登录，跳转到登录页')
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  
  console.log('用户ID:', userStore.userInfo?.id)
  
  try {
    // 先从服务器加载最新的会话列表
    await loadSessions()
    console.log('服务器会话列表加载完成，会话数量:', sessions.value.length)
    
    // 然后加载本地保存的会话状态
    loadSessionState()
    console.log('本地会话状态加载完成，currentSessionId:', currentSessionId.value)
    
    // 如果有保存的当前会话ID且该会话仍然存在，加载该会话的详细信息
    if (currentSessionId.value && sessions.value.some(s => s.sessionId === currentSessionId.value)) {
      console.log('加载保存的会话:', currentSessionId.value)
      await selectSession(currentSessionId.value)
    } else if (sessions.value.length > 0) {
      // 如果没有保存的会话或会话已不存在，选择第一个会话
      console.log('选择第一个会话:', sessions.value[0].sessionId)
      await selectSession(sessions.value[0].sessionId)
    }
    
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败: ' + error.message)
  }
  
  console.log('ChatBot组件挂载完成')
})

watch([currentSessionId, sessions], () => {
  saveSessionState()
}, { deep: true })
</script>

<style scoped>
.chatbot-page {
  display: flex;
  height: 100vh;
  background: #ffffff;
  background-image: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
  overflow: hidden;
}

/* 左侧会话列表 */
.chat-sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 4px solid #000000;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.chat-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 4px solid #000000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-chat-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
  border-radius: 0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.new-chat-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}

.collapse-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 2px solid #000000;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: #000000;
  color: #ffffff;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  position: relative;
  border: 2px solid transparent;
}

.chat-item:hover {
  background-color: #f0f0f0;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
  border: 2px solid #000000;
}

.chat-item.active {
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  transform: translate(-2px, -2px);
}

.chat-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  border: 2px solid #000000;
  border-radius: 0;
  color: #ffffff;
  flex-shrink: 0;
}

.chat-item.active .chat-icon {
  background: #ffffff;
  color: #000000;
}

.chat-info {
  flex: 1;
  margin-left: 12px;
  overflow: hidden;
}

.chat-title {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.chat-time {
  font-size: 12px;
  color: inherit;
  font-family: 'Courier New', monospace;
  opacity: 0.7;
}

.delete-chat-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  color: #666666;
}

.chat-item:hover .delete-chat-btn {
  opacity: 1;
}

.delete-chat-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000000;
}

/* 右侧聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.empty-icon {
  color: #000000;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 12px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
}

.empty-description {
  font-size: 14px;
  color: #666666;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  color: #666666;
}

.loading-spinner {
  margin-bottom: 16px;
  color: #000000;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.message-wrapper.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.assistant-avatar {
  width: 32px;
  height: 32px;
  background: #000000;
  border: 2px solid #000000;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.user-message .message-content {
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
  padding: 12px 16px;
  box-shadow: 4px 4px 0px #000000;
}

.assistant-message .message-content {
  background: #f0f0f0;
  color: #000000;
  border: 2px solid #000000;
  padding: 12px 16px;
  box-shadow: 4px 4px 0px #000000;
}

.message-text {
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
}

.message-time {
  font-size: 12px;
  color: #666666;
  margin-top: 8px;
  text-align: right;
  font-family: 'Courier New', monospace;
}

.user-message .message-time {
  color: #666666;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #000000;
  border-radius: 0;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 输入区域 */
.chat-input-area {
  border-top: 4px solid #000000;
  padding: 16px 24px;
  background: #ffffff;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 800px;
  margin: 0 auto;
}

.message-input {
  flex: 1;
}

.message-input :deep(.el-textarea__inner) {
  border-radius: 0;
  border: 2px solid #000000;
  resize: none;
  font-size: 14px;
  padding: 12px 16px;
  font-family: 'Courier New', monospace;
  background: #ffffff;
}

.message-input :deep(.el-textarea__inner):focus {
  border-color: #000000;
  outline: none;
  box-shadow: 4px 4px 0px #000000;
}

.send-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  border: 2px solid #000000;
  border-radius: 0;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.clear-session-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #ff4757;
  color: #ffffff;
  border: 2px solid #ff4757;
  border-radius: 0;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-session-btn:hover:not(:disabled) {
  background: #ff6b81;
  border-color: #ff6b81;
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0px #000000;
}

.clear-session-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.input-tips {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #666666;
  font-family: 'Courier New', monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.2);
  }

  .chat-sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .chat-main {
    width: 100%;
  }

  .message-wrapper {
    max-width: 90%;
  }

  .message-content {
    max-width: 85%;
  }
}
</style>
