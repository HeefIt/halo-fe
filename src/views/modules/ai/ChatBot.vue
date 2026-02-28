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
        <button class="new-chat-btn" @click="createNewChatWithCustomTitle">
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
          :data-session-id="session.sessionId"
        >
          <div class="chat-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="chat-info" v-if="!isSidebarCollapsed">
            <div
              class="chat-title"
              @dblclick="startEditingTitle(session)"
              v-if="!session.editingTitle"
            >
              {{ getSessionDisplayTitle(session) }}
            </div>
            <el-input
              v-else
              v-model="session.tempTitle"
              size="small"
              @blur="finishEditingTitle(session)"
              @keyup.enter="finishEditingTitle(session)"
              class="title-edit-input"
            />
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
          <!-- 添加流式/阻塞模式切换 -->
          <div class="mode-toggle">
            <label class="mode-label">
              <input
                type="checkbox"
                v-model="isStreamingMode"
                class="mode-checkbox"
              />
              <span class="mode-text">流式输出</span>
            </label>
          </div>
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
import { ElInput } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as aiApi from '@/api/ai'

const router = useRouter()
const userStore = useUserStore()

// 状态变量
const isSidebarCollapsed = ref(false)
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
// 添加流式输出控制开关
const isStreamingMode = ref(true)  // 默认启用流式输出

// 会话管理相关
const sessions = ref([])
const currentSessionId = ref(null)
const currentSession = ref(null)

// 计算属性：当前会话的消息列表
const currentMessages = computed(() => {
  if (!currentSession.value) return []

  if (!currentSession.value.messages) {
    currentSession.value.messages = []
  }

  const messages = Array.isArray(currentSession.value.messages)
      ? currentSession.value.messages
      : []

  console.log('计算当前消息，会话ID:', currentSessionId.value, '消息数量:', messages.length, '消息内容:', messages)

  // 按时间戳排序确保正确显示顺序
  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime()
    const timeB = new Date(b.timestamp || 0).getTime()
    return timeA - timeB
  })

  console.log('排序后的消息:', sortedMessages)
  return sortedMessages
})

// 方法：切换侧边栏
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 方法：加载会话列表
const loadSessions = async () => {
  try {
    console.log('开始加载会话列表，userId:', userStore.userInfo?.id)
    const response = await aiApi.getUserSessions(userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value = response.data || []

      console.log('从服务器获取到会话列表，数量:', sessions.value.length)

      // 确保每个会话的消息数组存在并按时间排序
      sessions.value.forEach(session => {
        if (!session.messages || !Array.isArray(session.messages)) {
          session.messages = []
        }
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

// 方法：创建新会话
const createNewSession = async () => {
  try {
    const response = await aiApi.createSession('', userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value.unshift(response.data)
      await selectSession(response.data.sessionId)
      ElMessage.success('新会话创建成功')
    }
  } catch (error) {
    console.error('创建会话失败:', error)
    ElMessage.error('创建会话失败')
  }
}

// 方法：选择会话
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

// 方法：删除会话
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
          await selectSession(sessions.value[0].sessionId)
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

// 方法：清空当前会话
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

// 方法：创建新对话（不带自定义标题）
const createNewChat = async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  await createNewSession()
}

// 方法：创建带自定义标题的新会话
const createNewChatWithCustomTitle = async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  try {
    const title = await showCustomInputDialog('请输入会话标题', '新对话')
    if (title !== null) {
      await createNewSessionWithTitle(title)
    }
  } catch (error) {
    console.log('用户取消了标题输入')
  }
}

// 方法：弹出自定义输入对话框
const showCustomInputDialog = (title, defaultValue) => {
  return new Promise((resolve) => {
    ElMessageBox.prompt('请输入会话标题:', title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: defaultValue,
      inputPlaceholder: '输入会话标题...',
      inputValidator: (value) => {
        if (!value) return '标题不能为空'
        if (value.trim().length > 50) return '标题不能超过50个字符'
        return true
      },
      inputErrorMessage: '标题格式不正确'
    }).then(({ value }) => {
      resolve(value.trim())
    }).catch(() => {
      resolve(null)
    })
  })
}

// 方法：创建带指定标题的新会话
const createNewSessionWithTitle = async (title) => {
  try {
    const response = await aiApi.createSession(title, userStore.userInfo?.id)
    if (response.code === 200) {
      sessions.value.unshift(response.data)
      await selectSession(response.data.sessionId)
      ElMessage.success('新会话创建成功')
    }
  } catch (error) {
    console.error('创建会话失败:', error)
    ElMessage.error('创建会话失败')
  }
}

// 方法：选择聊天（供模板调用）
const selectChat = async (sessionId) => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  await selectSession(sessionId)
}

// 方法：删除聊天（供模板调用）
const deleteChat = async (sessionId) => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }
  await deleteSession(sessionId)
}

// 方法：处理发送消息
const handleSendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return

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

  if (!currentSession.value.messages) {
    currentSession.value.messages = []
  }
  currentSession.value.messages.push(userMessage)
  console.log('添加用户消息，当前会话消息总数:', currentSession.value.messages.length)
  inputMessage.value = ''

  // 如果是第一条消息，自动设置会话标题
  if (currentSession.value.messages.length === 1) {
    const newTitle = message.substring(0, 20) + (message.length > 20 ? '...' : '')
    currentSession.value.title = newTitle

    const sessionInList = sessions.value.find(s => s.sessionId === currentSessionId.value)
    if (sessionInList) {
      sessionInList.title = newTitle
    }

    try {
      const sessionData = {
        sessionId: currentSessionId.value,
        userId: userStore.userInfo?.id,
        title: newTitle,
        messages: currentSession.value.messages,
        createdAt: currentSession.value.createdAt,
        updatedAt: new Date().toISOString()
      }

      await aiApi.updateSession(currentSessionId.value, sessionData, userStore.userInfo?.id)
    } catch (error) {
      console.error('自动更新标题失败:', error)
    }
  }

  scrollToBottom()
  isLoading.value = true

  try {
    const response = await sendMessageToAI(currentSessionId.value, message)

    // 在阻塞模式下，我们需要手动添加AI回复消息
    if (!isStreamingMode.value) {
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      currentSession.value.messages.push(assistantMessage)
      currentSession.value.updatedAt = new Date().toISOString()

      console.log('添加AI回复消息，当前会话消息总数:', currentSession.value.messages.length)

      const sessionIndex = sessions.value.findIndex(s => s.sessionId === currentSessionId.value)
      if (sessionIndex !== -1) {
        Object.assign(sessions.value[sessionIndex], currentSession.value)
      }
    }

    await saveCurrentSessionState()

    // 如果是第一条消息，尝试让AI生成一个合适的标题
    if (currentSession.value.messages.length === 2) {
      await generateTitleFromFirstExchange()
    }
  } catch (error) {
    ElMessage.error('发送消息失败: ' + error.message)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 方法：发送消息到AI
const sendMessageToAI = async (sessionId, content) => {
  if (isStreamingMode.value) {
    // 使用流式API
    return new Promise((resolve, reject) => {
      let fullResponse = '';
      let hasAddedMessage = false; // 标记是否已添加消息

      aiApi.sendChatMessageStream(
        sessionId,
        content,
        userStore.userInfo?.id,
        // onMessage - 每次接收到数据时调用
        (data) => {
          console.log('收到流式数据:', data);

          // 处理不同的数据格式 - 优先使用增量内容
          let replyContent = '';
          if (data && typeof data === 'object') {
            // 优先使用增量内容（reply字段），如果没有则使用完整内容
            replyContent = data.reply || data.fullReply || data.content || data.fullContent || data.message || '';
          } else if (typeof data === 'string') {
            // 如果是字符串格式
            replyContent = data;
          }

          if (replyContent) {
            // 将新的响应片段追加到完整响应中
            fullResponse += replyContent;

            // 确保消息数组存在
            if (!currentSession.value.messages) {
              currentSession.value.messages = [];
            }

            // 检查是否需要添加新的AI消息
            if (!hasAddedMessage) {
              const assistantMessage = {
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date().toISOString()
              };
              currentSession.value.messages.push(assistantMessage);
              hasAddedMessage = true;
              console.log('添加初始AI消息，内容长度:', fullResponse.length);
            } else {
              // 更新最后一条AI消息
              const lastMessageIndex = currentSession.value.messages.length - 1;
              if (lastMessageIndex >= 0 && currentSession.value.messages[lastMessageIndex].role === 'assistant') {
                // 使用Vue.set确保响应式更新
                currentSession.value.messages[lastMessageIndex].content = fullResponse;
                console.log('更新AI消息内容，总长度:', fullResponse.length, '新增内容长度:', replyContent.length);
              }
            }

            // 强制更新UI
            nextTick(() => {
              scrollToBottom();
            });
          }
        },
        // onError - 出错时调用
        (error) => {
          console.error('AI流式请求错误:', error);
          reject(error);
        },
        // onComplete - 完成时调用
        () => {
          console.log('AI流式响应完成，总长度:', fullResponse.length);
          // 确保最后更新一次
          if (hasAddedMessage && currentSession.value.messages.length > 0) {
            const lastMessage = currentSession.value.messages[currentSession.value.messages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = fullResponse;
            }
          }
          resolve(fullResponse);
        }
      ).catch(error => {
        console.error('流式请求失败:', error);
        reject(error);
      });
    });
  } else {
    // 使用传统的阻塞API
    try {
      const response = await aiApi.sendChatMessage(sessionId, content, userStore.userInfo?.id)
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

// 方法：格式化消息内容（支持完整Markdown渲染）
const formatMessage = (content) => {
  if (!content) return ''
  // 使用marked解析Markdown，然后用DOMPurify进行安全过滤
  return DOMPurify.sanitize(marked.parse(content))
}

// 方法：格式化时间
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

// 方法：格式化消息时间
const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 方法：获取会话显示标题
const getSessionDisplayTitle = (session) => {
  if (session.title === '新对话' || !session.title) {
    return session.sessionId ? session.sessionId.substring(0, 8) : '未知会话'
  }
  return session.title
}

// 方法：开始编辑标题
const startEditingTitle = (session) => {
  session.tempTitle = session.title
  session.editingTitle = true

  nextTick(() => {
    setTimeout(() => {
      const container = document.querySelector(`[data-session-id="${session.sessionId}"]`)
      if (container) {
        const inputElement = container.querySelector('.title-edit-input input')
        if (inputElement) {
          inputElement.focus()
          inputElement.select()
        }
      }
    }, 50)
  })
}

// 方法：完成编辑标题
const finishEditingTitle = async (session) => {
  const newTitle = session.tempTitle?.trim()

  if (newTitle && newTitle !== session.title) {
    session.title = newTitle

    if (currentSessionId.value === session.sessionId && currentSession.value) {
      currentSession.value.title = newTitle
    }

    try {
      const sessionData = {
        sessionId: session.sessionId,
        userId: userStore.userInfo?.id,
        title: newTitle,
        messages: session.messages || [],
        createdAt: session.createdAt,
        updatedAt: new Date().toISOString()
      }

      const response = await aiApi.updateSession(session.sessionId, sessionData, userStore.userInfo?.id)
      if (response.code === 200) {
        ElMessage.success('标题更新成功')
      } else {
        ElMessage.error('标题更新失败: ' + response.message)
      }
    } catch (error) {
      console.error('更新标题失败:', error)
      ElMessage.error('标题更新失败')
    }
  }

  session.editingTitle = false
}

// 方法：从首次对话生成标题
const generateTitleFromFirstExchange = async () => {
  if (currentSession.value.title &&
      !currentSession.value.title.includes('新对话') &&
      currentSession.value.title !== currentSession.value.sessionId?.substring(0, 8)) {
    return
  }

  try {
    const userMessage = currentSession.value.messages.find(msg => msg.role === 'user')
    const assistantMessage = currentSession.value.messages.find(msg => msg.role === 'assistant')

    if (userMessage && assistantMessage) {
      const titleGenerationPrompt = `请根据以下对话内容生成一个简洁的标题（不超过15个字），只需要返回标题内容，不要有任何其他文字：\n用户: ${userMessage.content}\nAI: ${assistantMessage.content}`

      const response = await aiApi.sendChatMessage(
          currentSessionId.value,
          titleGenerationPrompt,
          userStore.userInfo?.id
      )

      if (response.code === 200) {
        let generatedTitle = response.data.reply.trim()
        generatedTitle = generatedTitle.replace(/^"|"$/g, '').replace(/^'|'$/g, '')

        if (generatedTitle.length > 30) {
          generatedTitle = generatedTitle.substring(0, 30) + '...'
        }

        if (generatedTitle && generatedTitle !== currentSession.value.title) {
          currentSession.value.title = generatedTitle

          const sessionInList = sessions.value.find(s => s.sessionId === currentSessionId.value)
          if (sessionInList) {
            sessionInList.title = generatedTitle
          }

          try {
            const sessionData = {
              sessionId: currentSessionId.value,
              userId: userStore.userInfo?.id,
              title: generatedTitle,
              messages: currentSession.value.messages,
              createdAt: currentSession.value.createdAt,
              updatedAt: new Date().toISOString()
            }

            await aiApi.updateSession(currentSessionId.value, sessionData, userStore.userInfo?.id)
            console.log('AI生成标题成功:', generatedTitle)
          } catch (error) {
            console.error('保存AI生成的标题失败:', error)
          }
        }
      }
    }
  } catch (error) {
    console.error('生成标题失败:', error)
  }
}

// 方法：滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 方法：保存当前会话状态到后端
const saveCurrentSessionState = async () => {
  if (!currentSessionId.value || !currentSession.value) return

  try {
    const sessionData = {
      sessionId: currentSessionId.value,
      userId: userStore.userInfo?.id,
      title: currentSession.value.title,
      messages: currentSession.value.messages || [],
      createdAt: currentSession.value.createdAt,
      updatedAt: new Date().toISOString()
    }

    console.log('准备保存会话状态:', currentSessionId.value, '消息数量:', sessionData.messages.length)

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

// 方法：保存会话状态到本地存储
const saveSessionState = () => {
  const data = {
    currentSessionId: currentSessionId.value,
    sessions: sessions.value.map(s => ({
      sessionId: s.sessionId,
      title: s.title,
      updatedAt: s.updatedAt,
      createdAt: s.createdAt
    }))
  }
  localStorage.setItem('ai_session_state', JSON.stringify(data))
}

// 方法：从本地存储加载会话状态
const loadSessionState = () => {
  const saved = localStorage.getItem('ai_session_state')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      currentSessionId.value = data.currentSessionId || null
      // 注意：这里只加载会话列表的元数据，不加载完整消息
      if (data.sessions) {
        sessions.value = data.sessions
      }
    } catch (error) {
      console.error('加载会话状态失败:', error)
    }
  }
}

// 生命周期钩子：组件挂载
onMounted(async () => {
  console.log('ChatBot组件挂载开始')
  console.log('用户信息:', userStore.userInfo)
  console.log('用户登录状态:', userStore.isLoggedIn)

  if (!userStore.userInfo?.id) {
    console.log('用户未登录，跳转到登录页')
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  try {
    console.log('开始加载会话列表...')
    await loadSessions()
    console.log('会话列表加载完成:', sessions.value)

    // 加载本地保存的会话状态
    loadSessionState()

    // 检查是否有会话
    if (sessions.value.length === 0) {
      console.log('没有会话，创建新会话')
      await createNewSession()
    } else {
      console.log('已有会话，选择第一个')
      // 如果有保存的当前会话ID且该会话仍然存在，加载该会话
      if (currentSessionId.value && sessions.value.some(s => s.sessionId === currentSessionId.value)) {
        await selectSession(currentSessionId.value)
      } else {
        await selectSession(sessions.value[0].sessionId)
      }
    }
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败: ' + error.message)
  }

  console.log('ChatBot组件挂载完成')
})

// 监听器：保存会话状态
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

.title-edit-input {
  width: calc(100% - 20px);
  margin-bottom: 4px;
}

.title-edit-input :deep(.el-input__wrapper) {
  border-radius: 0;
  border: 2px solid #000000;
  padding: 2px 8px;
  font-size: 14px;
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

/* 新增模式切换样式 */
.mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666666;
  font-family: 'Courier New', monospace;
  cursor: pointer;
}

.mode-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #000000; /* 黑色主题样式 */
}

.mode-text {
  user-select: none;
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
