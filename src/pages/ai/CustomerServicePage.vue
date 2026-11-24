<template>
  <div class="ai-zone app-shell app-shell--internal">
    <main class="ai-zone__main">
      <AIToolHeader />

      <div class="ai-workbench service-workbench">
        <aside class="service-guide" :class="{ 'is-expanded': isGuideOpen }" aria-label="站内帮助目录">
          <div class="service-guide__heading">
            <h2>常见问题</h2>
            <p>选一个问题，或直接打开对应页面。</p>
          </div>
          <button
            class="service-guide__toggle"
            type="button"
            :aria-expanded="isGuideOpen"
            aria-controls="service-topics"
            @click="isGuideOpen = !isGuideOpen"
          >
            <el-icon aria-hidden="true"><Collection /></el-icon>
            浏览常见问题
            <el-icon class="service-chevron" aria-hidden="true"><ArrowDown /></el-icon>
          </button>

          <div id="service-topics" class="service-guide__body">
            <section v-for="topic in helpTopics" :key="topic.id" class="service-topic">
              <h3>
                <button
                  class="service-topic__toggle"
                  type="button"
                  :aria-expanded="activeTopic === topic.id"
                  :aria-controls="`service-topic-${topic.id}`"
                  @click="toggleTopic(topic.id)"
                >
                  <el-icon aria-hidden="true"><component :is="topic.icon" /></el-icon>
                  {{ topic.title }}
                  <el-icon class="service-chevron" aria-hidden="true"><ArrowDown /></el-icon>
                </button>
              </h3>
              <div v-show="activeTopic === topic.id" :id="`service-topic-${topic.id}`" class="service-topic__body">
                <ul class="service-questions">
                  <li v-for="question in topic.questions" :key="question">
                    <button type="button" :disabled="store.isReplying" @click="usePrompt(question)">{{ question }}</button>
                  </li>
                </ul>
                <div v-if="topic.links?.length" class="service-shortcuts" :aria-label="`${topic.title}快捷入口`">
                  <span>直接前往</span>
                  <RouterLink v-for="link in topic.links" :key="link.to" :to="link.to">{{ link.label }}</RouterLink>
                </div>
              </div>
            </section>
          </div>
        </aside>

        <section class="service-stage" aria-labelledby="service-title">
          <header class="service-stage__heading">
            <div>
              <h1 id="service-title">站内咨询</h1>
              <p>问功能在哪里、怎么用，或查自己的学习记录。</p>
            </div>
            <button
              class="ai-workbench__button service-reset"
              type="button"
              :disabled="store.isReplying || store.messages.length <= 1"
              @click="clearChat"
            >
              重置咨询
            </button>
          </header>

          <div ref="chatHistoryRef" class="service-thread" tabindex="0" role="region" aria-label="咨询记录">
            <div class="service-column">
              <div v-if="store.messages.length <= 1" class="service-welcome">
                <el-icon aria-hidden="true"><Service /></el-icon>
                <div>
                  <h2>需要帮忙找什么？</h2>
                  <p>可以从常见问题里选一个问法，也可以直接说你想完成什么。</p>
                </div>
              </div>

              <article
                v-for="(message, index) in store.messages.slice(1)"
                :key="`${message.role}-${index}`"
                class="service-entry"
                :class="{ 'service-entry--user': message.role === 'user' }"
              >
                <header class="service-entry__byline">
                  <strong>{{ message.role === 'user' ? '你' : 'Halo 客服' }}</strong>
                  <span>{{ formatTime(message.timestamp) }}</span>
                </header>
                <div
                  class="service-entry__text ai-markdown"
                  v-html="renderAiMarkdown(message.content)"
                  @click="followInternalLink"
                ></div>
                <AIMessageActions
                  v-if="message.role === 'assistant' && !store.isReplying"
                  :content="message.content || ''"
                  :message-index="index + 1"
                  @regenerate="handleRegenerate"
                />
              </article>

              <p v-if="store.isReplying && store.messages.at(-1)?.role === 'user'" class="service-reply-status" role="status">客服正在回复…</p>
              <div v-if="replyError" class="service-reply-error">
                <p role="alert">{{ replyError }}</p>
                <button class="ai-workbench__button" type="button" :disabled="store.isReplying" @click="retryLastQuestion">重试这条问题</button>
              </div>
            </div>
          </div>

          <div class="service-composer">
            <form class="service-column" @submit.prevent="sendMessage">
              <textarea
                ref="inputRef"
                v-model="inputMessage"
                class="ai-workbench__control"
                rows="2"
                :disabled="store.isReplying"
                aria-label="输入你的咨询问题"
                placeholder="例如：在哪里查看之前的刷题记录？"
                @keydown="handleInputKeydown"
              ></textarea>
              <div class="service-composer__tools">
                <label>
                  <input v-model="streamingEnabled" type="checkbox" :disabled="store.isReplying">
                  流式回复
                </label>
                <button class="ai-workbench__button ai-workbench__button--primary" type="submit" :disabled="!inputMessage.trim() || store.isReplying">
                  发送咨询
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ArrowDown, Collection, Compass, DataAnalysis, Reading, Service, Sunny } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { RouterLink, useRouter } from 'vue-router'
import { useCustomerServiceStore } from '@/stores/modules/customerService'
import { customerServiceChat, customerServiceChatStream } from '@/api/modules/ai/chat'
import { renderAiMarkdown } from '@/utils/aiMarkdown'
import AIToolHeader from './components/AIToolHeader.vue'
import AIMessageActions from './components/AIMessageActions.vue'

const store = useCustomerServiceStore()
const router = useRouter()

const helpTopics = [
  {
    id: 'navigation', title: '站内入口', icon: Compass,
    questions: [
      '如何修改个人资料和头像？',
      '想发一条社区动态应该去哪里？',
      '如果我想看排行榜和社区，入口分别在哪？'
    ],
    links: [
      { label: '个人资料', to: '/profile' },
      { label: '社区', to: '/community' },
      { label: '排行榜', to: '/ranking' }
    ]
  },
  {
    id: 'activity', title: '我的学习数据', icon: DataAnalysis,
    questions: [
      '帮我看看我最近的刷题汇总',
      '我这周在排行榜上的情况怎么样？',
      '我的个人主页现在会展示哪些内容？'
    ],
    links: [
      { label: '练习记录', to: '/practice-history' },
      { label: '排行榜', to: '/ranking' }
    ]
  },
  {
    id: 'reading', title: '文章与推荐', icon: Reading,
    questions: [
      '推荐几篇最近比较热门的博客文章',
      '帮我找一下前端相关的博客文章',
      '博客里最近更新了什么内容？'
    ],
    links: [{ label: '博客列表', to: '/blog/list' }]
  },
  {
    id: 'live', title: '实时信息', icon: Sunny,
    questions: [
      '帮我查一下上海现在的天气',
      '北京到上海大概有多远？',
      '新加坡今天的天气怎么样？'
    ]
  }
]

const activeTopic = ref('navigation')
const isGuideOpen = ref(false)
const inputRef = ref(null)
const chatHistoryRef = ref(null)
const replyError = ref('')

const inputMessage = computed({
  get: () => store.draftMessage,
  set: value => store.setDraftMessage(value)
})

const streamingEnabled = computed({
  get: () => store.useStreaming,
  set: value => store.setStreaming(value)
})

const toggleTopic = (topicId) => {
  activeTopic.value = activeTopic.value === topicId ? '' : topicId
}

const usePrompt = async (question) => {
  if (store.isReplying) return
  inputMessage.value = question
  isGuideOpen.value = false
  await nextTick()
  inputRef.value?.focus()
}

const followInternalLink = (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  const link = event.target.closest?.('a[href]')
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return

  let url
  try {
    url = new URL(link.href)
  } catch {
    return
  }
  if (url.origin !== window.location.origin || url.protocol !== window.location.protocol) return
  if (url.pathname === window.location.pathname && url.search === window.location.search) return

  const destination = `${url.pathname}${url.search}${url.hash}`
  if (!router.resolve(destination).matched.length) return
  event.preventDefault()
  return router.push(destination)
}

const handleInputKeydown = (event) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing || event.keyCode === 229) return
  event.preventDefault()
  sendMessage()
}

const sendMessage = () => {
  const question = inputMessage.value.trim()
  if (!question || store.isReplying) return
  store.appendMessage({ role: 'user', content: question })
  inputMessage.value = ''
  scrollToBottom(true)
  requestReply(question)
}

const requestReply = async (question) => {
  const version = store.beginReply()
  if (version === null) return
  replyError.value = ''

  try {
    if (streamingEnabled.value) {
      let reply = ''
      let streamError = null
      await customerServiceChatStream(question, null, (chunk) => {
        if (!store.isActiveReply(version)) return
        reply += typeof chunk === 'string' ? chunk : (chunk?.reply || chunk?.content || '')
        if (reply) store.updateLastAssistantMessage(reply)
      }, (error) => {
        streamError = error
      })
      if (streamError) throw streamError
      if (!reply.trim()) throw new Error('客服没有返回内容。')
    } else {
      const response = await customerServiceChat(question, null)
      if (!store.isActiveReply(version)) return
      const reply = response.data?.reply
      if (response.success === false || typeof reply !== 'string' || !reply.trim()) {
        throw new Error(response.message || '客服没有返回内容。')
      }
      store.appendMessage({ role: 'assistant', content: reply })
    }
  } catch (error) {
    if (store.isActiveReply(version)) {
      console.error('客服回复失败:', error)
      replyError.value = '没有收到完整回复，可以重试这条问题。'
    }
  } finally {
    store.finishReply(version)
    scrollToBottom()
  }
}

const handleRegenerate = (messageIndex) => {
  if (store.isReplying || messageIndex <= 1) return
  const question = store.messages[messageIndex - 1]
  if (question?.role !== 'user' || !question.content?.trim()) return
  store.messages.splice(messageIndex)
  scrollToBottom(true)
  requestReply(question.content.trim())
}

const retryLastQuestion = () => {
  const index = store.messages.findLastIndex(message => message.role === 'user')
  if (index > 0) handleRegenerate(index + 1)
}

const clearChat = async () => {
  if (store.isReplying) return
  try {
    await ElMessageBox.confirm('重置后，本次咨询的消息将被清空。', '重置咨询', {
      confirmButtonText: '重置咨询',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  if (store.isReplying) return
  store.resetConversation()
  replyError.value = ''
  scrollToBottom(true)
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = (force = false) => {
  const thread = chatHistoryRef.value
  if (!thread) return
  if (!force && thread.scrollHeight - thread.clientHeight - thread.scrollTop > 64) return
  nextTick(() => { thread.scrollTop = thread.scrollHeight })
}

watch([() => store.messages.length, () => store.messages.at(-1)?.content], () => scrollToBottom())

onMounted(() => {
  store.ensureInitialized()
  scrollToBottom(true)
})
</script>

<style scoped>
.service-workbench {
  grid-template-columns: 290px minmax(0, 1fr);
}

.service-guide {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  border-right: 1px solid var(--internal-panel-border);
  background: var(--internal-panel-bg-alt);
}

.service-guide__heading {
  padding: 20px 16px 12px;
}

.service-guide__heading h2,
.service-stage__heading h1 {
  margin: 0 0 4px;
  font-size: 21px;
  line-height: 1.35;
}

.service-guide__heading p,
.service-stage__heading p {
  color: var(--text-2);
  font-size: 13px;
}

.service-guide__body {
  min-height: 0;
  padding: 4px 10px 12px;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.service-guide__toggle {
  display: none;
}

.service-topic + .service-topic {
  border-top: 1px solid var(--internal-panel-border);
}

.service-topic__toggle,
.service-guide__toggle {
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 44px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  color: var(--text-1);
  font-size: 14px;
  font-weight: 650;
  text-align: left;
}

.service-topic__toggle {
  display: flex;
}

.service-topic__toggle .el-icon:first-child,
.service-guide__toggle .el-icon:first-child {
  font-size: 16px;
}

.service-topic__toggle:hover,
.service-guide__toggle:hover {
  background: var(--internal-panel-bg-hover);
}

.service-topic__toggle[aria-expanded='true'] {
  color: var(--color-accent);
}

.service-chevron {
  flex: none;
  margin-left: auto;
  color: var(--text-2);
}

[aria-expanded='true'] > .service-chevron {
  transform: rotate(180deg);
}

.service-topic__body {
  padding: 0 4px 12px;
}

.service-questions {
  padding: 0;
  list-style: none;
}

.service-questions button {
  width: 100%;
  min-height: 34px;
  padding: 6px 8px 6px 15px;
  border-radius: var(--radius-sm);
  color: var(--text-1);
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
}

.service-questions button:hover:not(:disabled) {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.service-questions button:disabled {
  cursor: default;
  opacity: 0.55;
}

.service-shortcuts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  padding: 8px 4px 0 15px;
  color: var(--text-2);
  font-size: 12px;
}

.service-shortcuts a {
  padding-block: 4px;
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.service-stage {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  min-width: 0;
  min-height: 0;
}

.service-stage__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px var(--workbench-padding);
  border-bottom: 1px solid var(--internal-panel-border);
}

.service-reset {
  flex: none;
}

.service-thread {
  min-height: 0;
  padding: 18px var(--workbench-padding);
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.service-thread:focus-visible {
  outline-offset: -2px;
}

.service-column {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
}

.service-welcome {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-left: 3px solid var(--color-accent-subtle);
  background: var(--internal-panel-bg-alt);
}

.service-welcome .el-icon {
  flex: none;
  margin-top: 2px;
  color: var(--color-accent);
  font-size: 22px;
}

.service-welcome h2 {
  margin: 0 0 4px;
  font-size: 17px;
}

.service-welcome p,
.service-reply-status {
  color: var(--text-2);
  font-size: 14px;
}

.service-entry + .service-entry {
  margin-top: 16px;
}

.service-entry--user {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--internal-panel-bg-alt);
}

.service-entry__byline {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
  color: var(--color-accent);
  font-size: 13px;
}

.service-entry--user .service-entry__byline {
  color: var(--text-1);
}

.service-entry__byline span {
  color: var(--text-2);
  font-size: 11px;
}

.service-entry__text {
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.service-entry :deep(.action-btn) {
  color: var(--text-2);
}

.service-reply-status,
.service-reply-error {
  margin-top: 12px;
}

.service-reply-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--color-error);
  font-size: 13px;
}

.service-composer {
  padding: 10px var(--workbench-padding) 14px;
  border-top: 1px solid var(--internal-panel-border);
  background: var(--internal-panel-bg-alt);
}

.service-composer textarea {
  display: block;
  max-height: min(20dvh, 150px);
  min-height: 50px;
  field-sizing: content;
  resize: none;
}

.service-composer__tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.service-composer__tools label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-2);
  font-size: 13px;
  cursor: pointer;
}

.service-composer__tools input {
  accent-color: var(--color-accent);
}

@media (max-width: 860px) {
  .service-workbench {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .service-guide {
    grid-template-rows: auto auto;
    border-right: 0;
    border-bottom: 1px solid var(--internal-panel-border);
  }

  .service-guide__heading,
  .service-guide:not(.is-expanded) .service-guide__body {
    display: none;
  }

  .service-guide__toggle {
    display: flex;
    width: auto;
    margin: 2px 8px;
  }

  .service-guide__body {
    max-height: min(300px, 30dvh);
  }

  .service-stage__heading {
    padding-block: 10px;
  }

  .service-stage__heading h1 {
    font-size: 18px;
  }

  .service-thread {
    padding-block: 12px;
  }
}
</style>
