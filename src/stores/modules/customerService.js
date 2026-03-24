import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEFAULT_WELCOME_MESSAGE = `你好，我是 Halo 智能客服。\n\n我可以帮你：\n- 查询账号、个人主页、最近刷题与排行榜信息\n- 找博客文章、社区圈子和常用页面入口\n- 说明站内功能怎么用，遇到问题该去哪里处理\n- 在需要时补充城市天气、城市距离这类简单实时信息\n\n你可以直接描述目标，我会尽量给你一步到位的答复。`

/**
 * 智能客服内存会话仓库。
 * 只在前端应用运行期间保留会话内容，不写入数据库，也不落到本地持久化存储。
 */
export const useCustomerServiceStore = defineStore('customerService', () => {
  const messages = ref([])
  const useStreaming = ref(true)
  const draftMessage = ref('')

  /**
   * 初始化欢迎语。
   * 仅在当前会话为空时写入，避免切换页面后重复覆盖历史消息。
   */
  const ensureInitialized = () => {
    if (messages.value.length > 0) {
      return
    }

    messages.value = [{
      role: 'assistant',
      content: DEFAULT_WELCOME_MESSAGE,
      timestamp: new Date()
    }]
  }

  /**
   * 追加一条会话消息。
   *
   * @param {Object} message 消息对象
   */
  const appendMessage = (message) => {
    messages.value.push({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp || new Date()
    })
  }

  /**
   * 更新最后一条助手消息内容。
   *
   * @param {string} content 最新消息内容
   */
  const updateLastAssistantMessage = (content) => {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content = content
      lastMessage.timestamp = new Date()
      return
    }

    appendMessage({
      role: 'assistant',
      content,
      timestamp: new Date()
    })
  }

  /**
   * 清空会话并恢复默认欢迎语。
   */
  const resetConversation = () => {
    messages.value = [{
      role: 'assistant',
      content: DEFAULT_WELCOME_MESSAGE,
      timestamp: new Date()
    }]
    draftMessage.value = ''
  }

  /**
   * 完整清除仓库状态。
   * 供退出登录等场景使用。
   */
  const clearStore = () => {
    messages.value = []
    draftMessage.value = ''
    useStreaming.value = true
  }

  /**
   * 更新输入草稿。
   *
   * @param {string} value 草稿内容
   */
  const setDraftMessage = (value) => {
    draftMessage.value = value ?? ''
  }

  /**
   * 设置流式输出开关。
   *
   * @param {boolean} enabled 是否启用流式输出
   */
  const setStreaming = (enabled) => {
    useStreaming.value = Boolean(enabled)
  }

  return {
    messages,
    useStreaming,
    draftMessage,
    ensureInitialized,
    appendMessage,
    updateLastAssistantMessage,
    resetConversation,
    clearStore,
    setDraftMessage,
    setStreaming
  }
})
