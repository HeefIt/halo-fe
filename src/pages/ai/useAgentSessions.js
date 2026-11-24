import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import { isAssistantMessage, messageBody } from './agentPresentation'

const accepted = response => response?.success !== false && (response?.success === true || response?.code === 200)

const normalizeSession = session => ({
  ...session,
  sessionId: String(session.sessionId),
  messages: Array.isArray(session.messages) ? session.messages : []
})

export const useAgentSessions = (name, api) => {
  const user = useUserStore()
  const sessions = ref([])
  const currentSession = ref(null)
  const isHistoryLoading = ref(true)
  const isSelecting = ref(false)
  const isMutating = ref(false)
  const historyError = ref('')
  let lastServerSnapshot = null
  const currentSessionId = computed(() => currentSession.value?.sessionId || '')
  const sessionBusy = computed(() => isHistoryLoading.value || isSelecting.value || isMutating.value)
  const historyGroups = computed(() => {
    if (!sessions.value.length) return []
    const entries = sessions.value.map(session => ({ sessionId: session.sessionId, title: session.title || name }))
    return [{ label: '最近会话', entries }]
  })

  const snapshotOf = (session) => {
    const last = session.messages.at(-1)
    return {
      id: session.sessionId,
      size: session.messages.length,
      timestamp: last?.timestamp ?? last?.createdAt ?? last?.createdTime,
      body: messageBody(last)
    }
  }

  const acceptSession = (session) => {
    currentSession.value = session
    lastServerSnapshot = session ? snapshotOf(session) : null
  }

  const fetchSession = async (sessionId) => {
    const response = await api.detail(sessionId, user.userId)
    if (!accepted(response) || !response.data?.sessionId) throw new Error(response?.message || '会话无法打开。')
    return normalizeSession(response.data)
  }

  const readHistory = async () => {
    const response = await api.list(user.userId)
    if (!accepted(response)) throw new Error(response?.message || '未能加载历史会话。')
    const items = Array.isArray(response.data) ? response.data : []
    return items.filter(item => item?.sessionId).map(normalizeSession)
  }

  const selectSession = async (sessionId) => {
    if (!sessionId || isSelecting.value) return false
    if (sessionId === currentSessionId.value) return true
    isSelecting.value = true
    try {
      acceptSession(await fetchSession(sessionId))
      return true
    } catch (error) {
      ElMessage.error(error.message || '会话无法打开，请重试。')
      return false
    } finally {
      isSelecting.value = false
    }
  }

  const loadHistory = async (preferredId = '') => {
    isHistoryLoading.value = true
    historyError.value = ''
    try {
      sessions.value = await readHistory()
    } catch {
      historyError.value = '未能加载历史会话。'
    }
    try {
      if (preferredId && await selectSession(preferredId)) return
      if (!currentSessionId.value && sessions.value.length) await selectSession(sessions.value[0].sessionId)
    } finally {
      isHistoryLoading.value = false
    }
  }

  const createSession = async (initialGoal = '') => {
    if (isMutating.value || isSelecting.value) return null
    isMutating.value = true
    try {
      const response = await api.create({ title: initialGoal.slice(0, 24), initialGoal }, user.userId)
      if (!accepted(response) || !response.data?.sessionId) throw new Error(response?.message || '未能创建会话。')
      const session = normalizeSession(response.data)
      sessions.value = [session, ...sessions.value.filter(item => item.sessionId !== session.sessionId)]
      acceptSession(session)
      return session
    } catch (error) {
      ElMessage.error(error.message || '未能创建会话，请重试。')
      return null
    } finally {
      isMutating.value = false
    }
  }

  const renameSession = async (sessionId) => {
    const session = sessions.value.find(item => item.sessionId === sessionId)
    if (!session || sessionBusy.value) return
    isMutating.value = true
    try {
      const { value } = await ElMessageBox.prompt('输入新的会话标题。', '重命名会话', {
        inputValue: session.title || name,
        inputValidator: value => Boolean(value?.trim()) || '请输入标题',
        confirmButtonText: '保存',
        cancelButtonText: '取消'
      })
      const title = value.trim()
      if (title === session.title) return
      const response = await api.rename(sessionId, title, user.userId)
      if (!accepted(response)) throw new Error(response?.message || '未能更新会话标题。')
      session.title = title
      if (currentSessionId.value === sessionId) currentSession.value.title = title
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') ElMessage.error(error.message || '未能更新会话标题。')
    } finally {
      isMutating.value = false
    }
  }

  const deleteSession = async (sessionId) => {
    if (sessionBusy.value) return
    isMutating.value = true
    try {
      await ElMessageBox.confirm(`确定要删除这个${name}会话吗？`, '删除会话', {
        confirmButtonText: '删除会话',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const response = await api.remove(sessionId, user.userId)
      if (!accepted(response)) throw new Error(response?.message || '未能删除会话。')
      sessions.value = sessions.value.filter(item => item.sessionId !== sessionId)
      if (currentSessionId.value !== sessionId) return
      acceptSession(null)
      if (sessions.value.length) await selectSession(sessions.value[0].sessionId)
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') ElMessage.error(error.message || '未能删除会话。')
    } finally {
      isMutating.value = false
    }
  }

  const appendMessage = (role, content, extra = {}) => {
    currentSession.value?.messages.push({ role, content, timestamp: new Date().toISOString(), ...extra })
  }

  const updateLastReply = (content, state) => {
    const message = currentSession.value?.messages.at(-1)
    if (isAssistantMessage(message)) Object.assign(message, { content, state })
  }

  const syncAfterRun = async (sessionId) => {
    const selectedId = currentSessionId.value
    const [detail, history] = await Promise.allSettled([fetchSession(sessionId), readHistory()])
    if (history.status === 'fulfilled' && history.value.length) sessions.value = history.value
    if (detail.status !== 'fulfilled' || selectedId !== currentSessionId.value) return
    const last = detail.value.messages.at(-1)
    if (!isAssistantMessage(last) || !messageBody(last).trim()) return

    const snapshot = snapshotOf(detail.value)
    const previous = lastServerSnapshot
    // A stale detail response must not replace the result just returned by the run.
    if (previous?.id === snapshot.id && previous.size === snapshot.size && previous.timestamp === snapshot.timestamp && previous.body === snapshot.body) return
    acceptSession(detail.value)
  }

  return {
    currentSession, currentSessionId, historyGroups, isHistoryLoading, historyError, isSelecting, sessionBusy,
    loadHistory, selectSession, createSession, renameSession, deleteSession, appendMessage, updateLastReply, syncAfterRun
  }
}
