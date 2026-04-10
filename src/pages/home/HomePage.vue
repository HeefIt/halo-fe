<template>
  <div
    class="home app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main">
      <div class="container">
        <section class="hero animate-slide-up">
          <div class="hero-main">
            <div class="hero-kicker-row">
              <span class="hero-kicker">Halo Study Desk</span>
              <span class="hero-date">{{ currentMonth }} {{ currentDay }} 日 · {{ currentWeekday }}</span>
            </div>

            <h1 class="hero-title">
              {{ greetingText }}<span>{{ displayName }}</span>
            </h1>
            <p class="hero-copy">
              练习、内容、讨论和 AI，都在这一屏里。
            </p>

            <div class="hero-actions">
              <button class="btn-primary" @click="goTo('/home/questions')">
                去做题
              </button>
              <button class="btn-secondary" @click="goTo('/community')">
                看讨论
              </button>
              <button class="btn-tertiary" @click="goTo('/ai/role-chat')">
                进 AI
              </button>
            </div>

            <button
              v-if="activeNotice"
              class="notice-banner"
              type="button"
              @click="showNoticeDialog = true"
            >
              <span class="notice-banner__badge">1 条公告</span>
              <span class="notice-banner__title">{{ activeNotice.title }}</span>
              <span class="notice-banner__action">展开</span>
            </button>

            <div class="stats-strip">
              <div
                v-for="signal in leadSignals"
                :key="signal.label"
                class="stats-strip__item"
              >
                <span class="stats-strip__label">{{ signal.label }}</span>
                <strong class="stats-strip__value">{{ signal.value }}</strong>
              </div>
            </div>
          </div>

          <aside class="hero-side">
            <section class="profile-card">
              <div class="profile-card__avatar">
                <img
                  v-if="userStore.userAvatar"
                  :src="userStore.userAvatar"
                  alt="用户头像"
                  class="profile-card__avatar-image"
                />
                <span v-else>{{ displayInitial }}</span>
              </div>
              <div class="profile-card__main">
                <span class="profile-card__eyebrow">Today</span>
                <strong>{{ displayName }}</strong>
                <p>{{ profileSummary }}</p>
              </div>
            </section>

            <section class="focus-card">
              <div class="focus-card__head">
                <div>
                  <span class="focus-card__eyebrow">Now</span>
                  <h2>{{ nextActionTitle }}</h2>
                </div>
                <span class="focus-card__tag">{{ nextActionTag }}</span>
              </div>

              <div class="progress-list">
                <div class="progress-item">
                  <div class="progress-item__meta">
                    <span>题量</span>
                    <strong>{{ problemProgress }}%</strong>
                  </div>
                  <div class="progress-track">
                    <span class="progress-fill" :style="{ width: `${problemProgress}%` }"></span>
                  </div>
                </div>

                <div class="progress-item">
                  <div class="progress-item__meta">
                    <span>时长</span>
                    <strong>{{ studyProgress }}%</strong>
                  </div>
                  <div class="progress-track progress-track--soft">
                    <span class="progress-fill progress-fill--soft" :style="{ width: `${studyProgress}%` }"></span>
                  </div>
                </div>
              </div>

              <div class="focus-card__notes">
                <div class="focus-note">
                  <span>{{ focusInsight.title }}</span>
                </div>
                <div class="focus-note">
                  <span>{{ rhythmInsight.title }}</span>
                </div>
              </div>
            </section>
          </aside>
        </section>

        <section class="entry-zone animate-slide-up" style="animation-delay: 80ms">
          <div class="section-heading">
            <div>
              <span class="section-kicker">Main Entry</span>
              <h2 class="section-title">从这里进入</h2>
            </div>
          </div>

          <div class="entry-grid">
            <button
              v-for="entry in primaryEntries"
              :key="entry.title"
              class="entry-card"
              :class="[`entry-card--${entry.tone}`, { 'entry-card--wide': entry.featured }]"
              @click="goTo(entry.path)"
            >
              <div class="entry-card__head">
                <span class="entry-card__tag">{{ entry.tag }}</span>
                <span class="entry-card__arrow">进入</span>
              </div>
              <strong class="entry-card__title">{{ entry.title }}</strong>
              <div class="entry-card__meta">
                <span>{{ entry.meta }}</span>
              </div>
            </button>
          </div>
        </section>

        <section class="discovery-zone animate-slide-up" style="animation-delay: 160ms">
          <div class="discovery-grid">
            <article class="community-spotlight">
              <div class="community-spotlight__head">
                <span class="section-kicker">Community</span>
                <button class="text-link" @click="goTo('/community')">
                  进入
                </button>
              </div>

              <h2 class="community-spotlight__title">不想立刻做题，就先看看现在的讨论。</h2>
              <p class="community-spotlight__desc">
                轻一点说，也轻一点聊。
              </p>

              <div class="community-spotlight__visual" aria-hidden="true">
                <div class="community-bubble community-bubble--main">
                  <span class="community-bubble__avatar"></span>
                  <span class="community-bubble__line"></span>
                </div>
                <div class="community-bubble community-bubble--secondary">
                  <span class="community-bubble__avatar"></span>
                  <span class="community-bubble__line community-bubble__line--short"></span>
                </div>
                <div class="community-bubble community-bubble--chip"># 面试</div>
                <div class="community-bubble community-bubble--chip community-bubble--chip-alt"># 刚刷完</div>
              </div>

              <div class="community-spotlight__chips">
                <span v-for="chip in communityChips" :key="chip">{{ chip }}</span>
              </div>
            </article>

            <div class="side-panels">
              <article class="content-panel content-panel--blog">
                <div class="content-panel__head">
                  <span class="section-kicker">Blog</span>
                  <button class="text-link" @click="goTo('/blog')">
                    进入
                  </button>
                </div>
                <strong class="content-panel__title">有时一篇文章，比立刻开练更对味。</strong>
                <p class="content-panel__desc">这里放得下题解，也放得下判断。</p>
                <div class="content-panel__foot">
                  <span>Read</span>
                </div>
              </article>

              <article class="content-panel content-panel--ai">
                <div class="content-panel__head">
                  <span class="section-kicker">AI Zone</span>
                  <button class="text-link" @click="goTo('/ai/customer-service')">
                    进入
                  </button>
                </div>
                <strong class="content-panel__title">需要拆问题、跑模拟，或者只是想问一句时。</strong>
                <p class="content-panel__desc">AI 会把节奏接住。</p>
                <div class="content-panel__visual" aria-hidden="true">
                  <div class="ai-preview-card ai-preview-card--active">
                    <span class="ai-preview-card__dot"></span>
                    <span class="ai-preview-card__line"></span>
                  </div>
                  <div class="ai-preview-card">
                    <span class="ai-preview-card__dot ai-preview-card__dot--soft"></span>
                    <span class="ai-preview-card__line ai-preview-card__line--short"></span>
                  </div>
                  <div class="ai-preview-orb"></div>
                </div>
                <div class="mini-link-list">
                  <button
                    v-for="tool in aiTools"
                    :key="tool.title"
                    class="mini-link"
                    @click="goTo(tool.path)"
                  >
                    <span>{{ tool.title }}</span>
                    <span>{{ tool.badge }}</span>
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="footer-zone animate-slide-up" style="animation-delay: 240ms">
          <article class="footer-card footer-card--muted">
            <div class="footer-card__head">
              <span class="section-kicker">Keep Moving</span>
              <h2 class="section-title section-title--small">备用入口</h2>
            </div>
          </article>

          <div class="footer-links">
            <button
              v-for="item in supportEntries"
              :key="item.title"
              class="footer-link"
              :class="`footer-link--${item.tone}`"
              @click="goTo(item.path)"
            >
              <span class="footer-link__tag">{{ item.tag }}</span>
              <strong>{{ item.title }}</strong>
              <div class="footer-link__visual" aria-hidden="true">
                <div v-if="item.tone === 'ranking'" class="visual-bars">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div v-else-if="item.tone === 'history'" class="visual-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div v-else class="visual-chat">
                  <span class="visual-chat__dot"></span>
                  <span class="visual-chat__dot"></span>
                  <span class="visual-chat__line"></span>
                  <span class="visual-chat__line visual-chat__line--short"></span>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </main>

    <NoticeDialog
      v-model="showNoticeDialog"
      :notice="activeNotice"
      mode="view"
    />

    <NoticeDialog
      v-model="showPopupDialog"
      :notice="popupNotice"
      mode="popup"
      @close-today="handleCloseNoticeForToday"
      @close-forever="handleCloseNoticeForever"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDailyStatistics } from '@/api/modules/question/subject'
import { closeNotice, closeNoticeForToday, getCurrentNotice, getCurrentPopupNotice } from '@/api/modules/notice'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'
import NoticeDialog from '@/components/notice/NoticeDialog.vue'
import Header from '@/layouts/AppHeader.vue'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()

const dailyStats = ref({
  problemCount: 0,
  totalTime: 0,
  accuracy: 0,
  totalScore: 0
})

const currentTime = ref(new Date())
const activeNotice = ref(null)
const popupNotice = ref(null)
const showNoticeDialog = ref(false)
const showPopupDialog = ref(false)
let greetingTimer = null

const defaultProblemGoal = 10
const defaultTimeGoal = 3600
const greetingPresets = [
  {
    key: 'lateNight',
    start: 0,
    end: 5,
    greeting: '凌晨好，',
    prefixes: ['夜色还浓，慢一点也没关系。', '这么晚还在坚持，真的很不容易。', '先和今天打个照面，再慢慢进入状态。']
  },
  {
    key: 'morning',
    start: 5,
    end: 11,
    greeting: '早上好，',
    prefixes: ['新的一天开始了，我们慢慢热起来。', '先把节奏找回来，今天也会很顺。', '清晨的这段时间，很适合开个好头。']
  },
  {
    key: 'noon',
    start: 11,
    end: 13,
    greeting: '中午好，',
    prefixes: ['忙里也别忘了歇一会儿，再继续往前推。', '午间这段空档，刚好适合整理一下状态。', '先喘口气，再把下午的节奏续上。']
  },
  {
    key: 'afternoon',
    start: 13,
    end: 18,
    greeting: '下午好，',
    prefixes: ['这会儿正适合进入状态，继续稳稳推进。', '下午的专注力，最适合拿来做一轮完整练习。', '别急，按自己的节奏往前走就很好。']
  },
  {
    key: 'dusk',
    start: 18,
    end: 19,
    greeting: '傍晚好，',
    prefixes: ['天色慢慢柔和下来了，也该收一收白天的节奏。', '傍晚这会儿，适合把散掉的注意力重新拢起来。', '把白天留给你的杂音放一放，我们继续做自己的事。']
  },
  {
    key: 'evening',
    start: 19,
    end: 23,
    greeting: '晚上好，',
    prefixes: ['今晚也一起把节奏续上，慢慢沉下来。', '夜晚很适合专心做点属于自己的推进。', '白天再忙，晚上也能留一点时间给自己。']
  },
  {
    key: 'deepNight',
    start: 23,
    end: 24,
    greeting: '深夜好，',
    prefixes: ['夜深了也别太辛苦，能推进一点就很好。', '还在努力的你，先给自己一点肯定。', '深夜适合安静做事，也别忘了照顾自己。']
  }
]

const displayName = computed(() => userStore.userName || '学习者')
const displayInitial = computed(() => displayName.value.charAt(0).toUpperCase())

const greetingPreset = computed(() => {
  const hour = currentTime.value.getHours()
  return greetingPresets.find(item => hour >= item.start && hour < item.end) || greetingPresets[0]
})

const greetingText = computed(() => greetingPreset.value.greeting)
const currentDay = computed(() => currentTime.value.getDate())

const currentMonth = computed(() => {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return months[currentTime.value.getMonth()]
})

const currentWeekday = computed(() => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekdays[currentTime.value.getDay()]
})

const problemProgress = computed(() => {
  return Math.min(100, Math.round(((dailyStats.value.problemCount || 0) / defaultProblemGoal) * 100))
})

const studyProgress = computed(() => {
  return Math.min(100, Math.round(((dailyStats.value.totalTime || 0) / defaultTimeGoal) * 100))
})

const accuracyStatus = computed(() => {
  const accuracy = Number(dailyStats.value.accuracy || 0)
  if (accuracy >= 85) return '手感不错，可以加一点强度。'
  if (accuracy >= 60) return '先把节奏稳住，再往上提。'
  return '先热身，状态会慢慢回来。'
})

const nextActionTag = computed(() => {
  return dailyStats.value.problemCount > 0 ? '继续练习' : '开始今日首题'
})

const nextActionTitle = computed(() => {
  if (dailyStats.value.problemCount >= defaultProblemGoal) {
    return '今天这轮已经够了，接下来该回头看看。'
  }
  if (dailyStats.value.problemCount > 0) {
    return '别换轨，先把这一轮收完。'
  }
  return '先做几题，把状态叫醒。'
})

const focusInsight = computed(() => {
  if (dailyStats.value.problemCount === 0) {
    return {
      title: '先开一轮短练',
      desc: '先热一下手。'
    }
  }
  if (dailyStats.value.accuracy >= 80) {
    return {
      title: '可以抬高一点强度',
      desc: '可以往上提一点。'
    }
  }
  return {
    title: '先把正确率稳住',
    desc: '先别频繁切换。'
  }
})

const rhythmInsight = computed(() => {
  if (dailyStats.value.totalTime >= defaultTimeGoal) {
    return {
      title: '适合进入复盘段',
      desc: '该复盘了。'
    }
  }
  return {
    title: '还在可推进区间',
    desc: '还能继续推。'
  }
})

const profileSummary = computed(() => {
  if (dailyStats.value.problemCount > 0) {
    return `今天已经做了 ${dailyStats.value.problemCount} 题。`
  }
  return '还没开始，先找一道熟悉的题。'
})

const leadSignals = computed(() => [
  {
    label: '今日题量',
    value: `${dailyStats.value.problemCount} / ${defaultProblemGoal}`,
    note: dailyStats.value.problemCount > 0 ? '继续保持。' : '先开一轮。'
  },
  {
    label: '学习时长',
    value: formatTime(dailyStats.value.totalTime),
    note: '保持节奏。'
  },
  {
    label: '当前正确率',
    value: `${dailyStats.value.accuracy}%`,
    note: accuracyStatus.value
  }
])

const primaryEntries = computed(() => [
  {
    title: '题库练习',
    desc: '今天的主线入口，适合直接开练。',
    path: '/home/questions',
    tag: '主线',
    tone: 'question',
    meta: `${dailyStats.value.problemCount > 0 ? '继续' : '开始'}`,
    featured: true
  },
  {
    title: '角色对话',
    desc: '换个角色进入对练，表达会更贴近真实场景。',
    path: '/ai/role-chat',
    tag: 'AI',
    tone: 'role',
    meta: '模拟'
  },
  {
    title: '圈子社区',
    desc: '看看最近的讨论，也可以顺手发一条。',
    path: '/community',
    tag: '交流',
    tone: 'community',
    meta: '讨论'
  },
  {
    title: '博客内容',
    desc: '读文章，或者把自己的判断写下来。',
    path: '/blog',
    tag: '内容',
    tone: 'blog',
    meta: '阅读'
  }
])

const supportEntries = [
  {
    title: '排行榜',
    path: '/ranking',
    tag: '参考',
    tone: 'ranking'
  },
  {
    title: '练习记录',
    path: '/practice-history',
    tag: '复盘',
    tone: 'history'
  },
  {
    title: '智能客服',
    path: '/ai/customer-service',
    tag: '支持',
    tone: 'service'
  }
]

const communityChips = ['说说动态', '评论互动', '表情包', '用户主页', '轻松讨论']

const aiTools = [
  {
    title: '通用对话',
    badge: 'Chat',
    path: '/ai/chatbot'
  },
  {
    title: '角色对话',
    badge: 'Role',
    path: '/ai/role-chat'
  },
  {
    title: '智能客服',
    badge: 'Guide',
    path: '/ai/customer-service'
  },
  {
    title: '多模态解析',
    badge: 'Vision',
    path: '/ai/multimodal'
  }
]

function goTo(path) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  router.push(path).catch((err) => {
    console.error('路由跳转失败:', err)
    ElMessage.error('页面跳转失败')
  })
}

async function fetchDailyStatistics() {
  if (!userStore.userInfo?.id) {
    return
  }

  try {
    const res = await getDailyStatistics(userStore.userInfo.id)
    if (res.code === 200) {
      dailyStats.value = res.data
    }
  } catch (err) {
    console.error('获取每日统计信息失败:', err)
  }
}

async function fetchCurrentNotice() {
  try {
    const res = await getCurrentNotice(1)
    if (res.success) {
      activeNotice.value = res.data || null
    }
  } catch (error) {
    console.error('获取当前公告失败:', error)
  }
}

async function fetchPopupNotice() {
  try {
    const res = await getCurrentPopupNotice(1)
    if (res.success) {
      popupNotice.value = res.data || null
      showPopupDialog.value = !!res.data
    }
  } catch (error) {
    console.error('获取弹窗公告失败:', error)
  }
}

async function handleCloseNoticeForToday() {
  if (!popupNotice.value?.id) {
    showPopupDialog.value = false
    return
  }
  try {
    const res = await closeNoticeForToday(popupNotice.value.id)
    if (res.success) {
      ElMessage.success('今日内将不再弹出该公告')
      showPopupDialog.value = false
      return
    }
    ElMessage.error(res.message || '关闭公告失败')
  } catch (error) {
    console.error('今日关闭公告失败:', error)
    ElMessage.error('关闭公告失败')
  }
}

async function handleCloseNoticeForever() {
  if (!popupNotice.value?.id) {
    showPopupDialog.value = false
    return
  }
  try {
    const res = await closeNotice(popupNotice.value.id)
    if (res.success) {
      ElMessage.success('该公告后续将不再弹出')
      showPopupDialog.value = false
      return
    }
    ElMessage.error(res.message || '关闭公告失败')
  } catch (error) {
    console.error('关闭公告失败:', error)
    ElMessage.error('关闭公告失败')
  }
}

function formatTime(seconds) {
  if (!seconds) return '0 分钟'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const parts = []

  if (hours > 0) {
    parts.push(`${hours} 小时`)
  }
  if (minutes > 0) {
    parts.push(`${minutes} 分钟`)
  }

  return parts.join(' ') || '0 分钟'
}

onMounted(() => {
  currentTime.value = new Date()
  greetingTimer = window.setInterval(() => {
    currentTime.value = new Date()
  }, 30000)
  fetchDailyStatistics()
  fetchCurrentNotice()
  fetchPopupNotice()
})

onUnmounted(() => {
  if (greetingTimer) {
    window.clearInterval(greetingTimer)
    greetingTimer = null
  }
})

watch(
  () => userStore.userInfo,
  (newUserInfo) => {
    if (newUserInfo?.id) {
      fetchDailyStatistics()
    }
  },
  { immediate: false }
)
</script>

<style scoped>
.home {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(60, 179, 113, 0.08), transparent 28%),
    radial-gradient(circle at 85% 18%, rgba(14, 165, 233, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.44), transparent 18%),
    var(--app-bg);
}

.main {
  padding: 90px 0 56px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
}

.hero,
.entry-zone,
.discovery-zone {
  margin-bottom: 38px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.78fr);
  gap: 28px;
  align-items: start;
}

.hero-main {
  padding-top: 10px;
}

.hero-kicker-row,
.section-heading,
.focus-card__head,
.content-panel__head,
.footer-card__head,
.community-spotlight__head,
.entry-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.hero-kicker,
.section-kicker,
.focus-card__eyebrow,
.profile-card__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  background: rgba(19, 78, 74, 0.08);
  color: #0f766e;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 999px;
}

.hero-date,
.section-copy,
.content-panel__foot,
.entry-card__meta span,
.text-link,
.notice-banner__action {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.hero-prefix {
  margin: 18px 0 0;
  max-width: 720px;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.hero-title {
  margin: 12px 0 18px;
  max-width: 800px;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: clamp(40px, 5.8vw, 68px);
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.hero-title span {
  color: #0f766e;
}

.hero-copy {
  max-width: 760px;
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.btn-primary,
.btn-secondary,
.btn-tertiary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.btn-primary {
  background: #0f766e;
  border: 1px solid #0f766e;
  color: #ffffff;
}

.btn-primary:hover {
  background: #0d665f;
  border-color: #0d665f;
  transform: translateY(-1px);
}

.btn-secondary,
.btn-tertiary {
  border: 1px solid var(--color-border);
}

.btn-secondary {
  background: var(--internal-panel-bg);
  color: var(--color-text);
}

.btn-secondary:hover,
.btn-tertiary:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.btn-tertiary {
  background: transparent;
  color: var(--color-text-secondary);
}

.notice-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  max-width: 840px;
  margin-top: 22px;
  padding: 14px 18px;
  border: 1px solid rgba(15, 118, 110, 0.14);
  border-radius: 8px;
  background: rgba(15, 118, 110, 0.05);
  text-align: left;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.notice-banner:hover {
  background: rgba(15, 118, 110, 0.08);
  border-color: rgba(15, 118, 110, 0.2);
}

.notice-banner__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 78px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.notice-banner__title {
  flex: 1;
  min-width: 0;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 34px;
  padding-top: 22px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.stats-strip__item {
  padding-right: 18px;
  border-right: 1px solid rgba(17, 24, 39, 0.08);
}

.stats-strip__item:last-child {
  padding-right: 0;
  border-right: none;
}

.stats-strip__label,
.progress-item__meta span,
.focus-card__tag,
.entry-card__tag,
.footer-link__tag {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.stats-strip__value {
  display: block;
  margin: 10px 0 8px;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 27px;
  line-height: 1.04;
}

.stats-strip__note,
.focus-card__desc,
.focus-note p,
.profile-card__main p,
.entry-card__desc,
.community-spotlight__desc,
.community-spotlight__item p,
.content-panel__desc,
.footer-link p {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.hero-side {
  display: grid;
  gap: 14px;
}

.profile-card,
.focus-card,
.entry-card,
.community-spotlight,
.content-panel,
.footer-card,
.footer-link {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}

.profile-card,
.focus-card,
.community-spotlight,
.content-panel,
.footer-card {
  border-radius: 10px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.profile-card__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f766e 0%, #38bdf8 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.profile-card__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-card__main {
  min-width: 0;
}

.profile-card__main strong,
.focus-card h2,
.entry-card__title,
.community-spotlight__title,
.content-panel__title,
.footer-link strong {
  color: var(--color-text);
}

.profile-card__main strong {
  display: block;
  margin: 8px 0 4px;
  font-size: 18px;
  line-height: 1.3;
}

.focus-card {
  padding: 22px 22px 20px;
}

.focus-card h2 {
  margin-top: 10px;
  font-size: 24px;
  line-height: 1.4;
  letter-spacing: -0.03em;
}

.focus-card__tag {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  white-space: nowrap;
}

.progress-list {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}

.progress-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.progress-item__meta strong {
  color: var(--color-text);
  font-size: 16px;
}

.progress-track {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
  overflow: hidden;
}

.progress-track--soft {
  background: rgba(56, 189, 248, 0.12);
}

.progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, #0f766e 0%, #14b8a6 100%);
  border-radius: inherit;
}

.progress-fill--soft {
  background: linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%);
}

.focus-card__notes {
  display: grid;
  gap: 12px;
  margin-top: 22px;
}

.focus-note {
  padding-top: 12px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.focus-note span {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 700;
}

.section-heading {
  align-items: end;
  margin-bottom: 18px;
}

.section-title {
  margin-top: 12px;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 30px;
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.section-title--small {
  font-size: 24px;
}

.entry-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(3, minmax(0, 0.85fr));
  gap: 14px;
}

.entry-card {
  display: grid;
  gap: 14px;
  padding: 20px 20px 18px;
  text-align: left;
  border-radius: 10px;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
}

.entry-card:hover,
.footer-link:hover,
.content-panel:hover {
  transform: translateY(-2px);
}

.entry-card--wide {
  min-height: 220px;
}

.entry-card__arrow {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.entry-card__title {
  font-size: 24px;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.entry-card__meta {
  margin-top: auto;
}

.entry-card--question {
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 32%),
    rgba(255, 255, 255, 0.88);
}

.entry-card--role {
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.14), transparent 34%),
    rgba(255, 255, 255, 0.86);
}

.entry-card--community {
  background:
    radial-gradient(circle at top right, rgba(244, 114, 182, 0.12), transparent 34%),
    rgba(255, 255, 255, 0.86);
}

.entry-card--blog {
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.14), transparent 34%),
    rgba(255, 255, 255, 0.86);
}

.discovery-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(330px, 0.82fr);
  gap: 18px;
}

.community-spotlight {
  padding: 24px;
}

.community-spotlight__title {
  max-width: 680px;
  margin: 18px 0 14px;
  font-family: var(--font-display);
  font-size: 36px;
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.community-spotlight__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 22px 0 24px;
}

.community-spotlight__visual {
  position: relative;
  min-height: 148px;
  margin-top: 22px;
  border-radius: 16px;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 26%, rgba(16, 185, 129, 0.16), transparent 22%),
    radial-gradient(circle at 84% 74%, rgba(56, 189, 248, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(236, 253, 245, 0.86));
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.community-bubble {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.community-bubble--main {
  top: 26px;
  left: 24px;
  min-width: 196px;
}

.community-bubble--secondary {
  top: 74px;
  right: 26px;
  min-width: 162px;
}

.community-bubble__avatar {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  flex-shrink: 0;
}

.community-bubble__line {
  display: block;
  width: 108px;
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.36);
}

.community-bubble__line--short {
  width: 74px;
}

.community-bubble--chip {
  left: 34px;
  bottom: 24px;
  min-height: 34px;
  padding: 0 12px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  background: rgba(236, 253, 245, 0.96);
}

.community-bubble--chip-alt {
  left: 126px;
  bottom: 24px;
  color: #0369a1;
  background: rgba(239, 246, 255, 0.96);
}

.community-spotlight__chips span {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  font-size: 13px;
  font-weight: 700;
}

.community-spotlight__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.community-spotlight__item {
  padding-top: 14px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.community-spotlight__item strong {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 17px;
}

.side-panels {
  display: grid;
  gap: 18px;
}

.content-panel {
  display: grid;
  gap: 14px;
  padding: 20px;
}

.content-panel__title {
  font-size: 22px;
  line-height: 1.4;
  letter-spacing: -0.03em;
}

.content-panel__visual {
  position: relative;
  min-height: 108px;
  border-radius: 14px;
  overflow: hidden;
  background:
    radial-gradient(circle at 82% 20%, rgba(45, 212, 191, 0.2), transparent 24%),
    linear-gradient(180deg, rgba(240, 253, 250, 0.96), rgba(236, 253, 245, 0.8));
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.ai-preview-card {
  position: absolute;
  left: 18px;
  right: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
}

.ai-preview-card--active {
  top: 18px;
}

.ai-preview-card:not(.ai-preview-card--active) {
  top: 58px;
}

.ai-preview-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #14b8a6;
  flex-shrink: 0;
}

.ai-preview-card__dot--soft {
  background: #60a5fa;
}

.ai-preview-card__line {
  display: block;
  width: 72%;
  height: 7px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.34);
}

.ai-preview-card__line--short {
  width: 54%;
}

.ai-preview-orb {
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.9), rgba(59, 130, 246, 0.88));
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.2);
}

.content-panel--blog {
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 32%),
    rgba(255, 255, 255, 0.8);
}

.content-panel--ai {
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.1), transparent 30%),
    rgba(255, 255, 255, 0.8);
}

.mini-link-list {
  display: grid;
  gap: 10px;
  margin-top: 4px;
}

.mini-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 700;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.mini-link:hover,
.text-link:hover {
  background: var(--color-bg-subtle);
  border-color: rgba(15, 118, 110, 0.12);
}

.mini-link span:last-child {
  color: var(--color-text-muted);
  font-size: 12px;
}

.text-link {
  border: none;
  background: transparent;
  font-weight: 700;
}

.footer-zone {
  display: grid;
  grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}

.footer-card {
  padding: 20px;
}

.footer-card--muted {
  background:
    linear-gradient(180deg, rgba(15, 118, 110, 0.05), transparent 72%),
    rgba(255, 255, 255, 0.72);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.footer-link {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 10px;
  text-align: left;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
}

.footer-link strong {
  font-size: 18px;
  line-height: 1.3;
}

.footer-link__visual {
  position: relative;
  min-height: 62px;
  margin-top: 6px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(241, 245, 249, 0.92));
}

.footer-link--ranking .footer-link__visual {
  background:
    radial-gradient(circle at 18% 22%, rgba(251, 146, 60, 0.16), transparent 26%),
    linear-gradient(180deg, rgba(255, 247, 237, 0.95), rgba(255, 237, 213, 0.82));
}

.footer-link--history .footer-link__visual {
  background:
    radial-gradient(circle at 84% 20%, rgba(59, 130, 246, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 0.82));
}

.footer-link--service .footer-link__visual {
  background:
    radial-gradient(circle at 18% 78%, rgba(168, 85, 247, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(250, 245, 255, 0.95), rgba(243, 232, 255, 0.82));
}

.visual-bars,
.visual-lines,
.visual-chat {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: end;
  padding: 14px;
}

.visual-bars {
  gap: 8px;
}

.visual-bars span {
  flex: 1;
  border-radius: 8px 8px 3px 3px;
  background: linear-gradient(180deg, #fdba74, #fb923c);
  opacity: 0.88;
}

.visual-bars span:nth-child(1) { height: 18px; }
.visual-bars span:nth-child(2) { height: 28px; }
.visual-bars span:nth-child(3) { height: 42px; }
.visual-bars span:nth-child(4) { height: 24px; }
.visual-bars span:nth-child(5) { height: 20px; }

.visual-lines {
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.visual-lines span {
  display: block;
  height: 7px;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.visual-lines span:nth-child(1) { width: 72%; }
.visual-lines span:nth-child(2) { width: 90%; }
.visual-lines span:nth-child(3) { width: 64%; }

.visual-chat {
  display: grid;
  grid-template-columns: 10px 1fr;
  grid-template-rows: repeat(2, 1fr);
  align-items: center;
  column-gap: 10px;
  row-gap: 8px;
}

.visual-chat__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c084fc;
}

.visual-chat__dot:last-of-type {
  background: #4ade80;
}

.visual-chat__line {
  display: block;
  height: 7px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.34);
}

.visual-chat__line--short {
  width: 78%;
}

.home.is-dark {
  background:
    radial-gradient(circle at top left, rgba(45, 212, 191, 0.1), transparent 26%),
    radial-gradient(circle at 85% 18%, rgba(96, 165, 250, 0.1), transparent 24%),
    linear-gradient(180deg, rgba(17, 27, 45, 0.5), transparent 20%),
    var(--app-bg);
}

.home.is-dark .hero-kicker,
.home.is-dark .section-kicker,
.home.is-dark .focus-card__eyebrow,
.home.is-dark .profile-card__eyebrow,
.home.is-dark .focus-card__tag,
.home.is-dark .community-spotlight__chips span,
.home.is-dark .notice-banner__badge {
  color: #7dd3c8;
  background: rgba(45, 212, 191, 0.12);
}

.home.is-dark .hero-title,
.home.is-dark .profile-card__main strong,
.home.is-dark .focus-card h2,
.home.is-dark .stats-strip__value,
.home.is-dark .section-title,
.home.is-dark .entry-card__title,
.home.is-dark .community-spotlight__title,
.home.is-dark .community-spotlight__item strong,
.home.is-dark .content-panel__title,
.home.is-dark .footer-link strong,
.home.is-dark .progress-item__meta strong,
.home.is-dark .notice-banner__title {
  color: var(--text-1);
}

.home.is-dark .hero-title span {
  color: #7dd3c8;
}

.home.is-dark .hero-prefix,
.home.is-dark .hero-copy,
.home.is-dark .stats-strip__note,
.home.is-dark .focus-card__desc,
.home.is-dark .focus-note p,
.home.is-dark .profile-card__main p,
.home.is-dark .entry-card__desc,
.home.is-dark .section-copy,
.home.is-dark .community-spotlight__desc,
.home.is-dark .community-spotlight__item p,
.home.is-dark .content-panel__desc,
.home.is-dark .content-panel__foot,
.home.is-dark .footer-link p,
.home.is-dark .hero-date,
.home.is-dark .text-link,
.home.is-dark .notice-banner__action {
  color: var(--text-2);
}

.home.is-dark .profile-card,
.home.is-dark .focus-card,
.home.is-dark .entry-card,
.home.is-dark .community-spotlight,
.home.is-dark .content-panel,
.home.is-dark .footer-card,
.home.is-dark .footer-link,
.home.is-dark .mini-link {
  background: rgba(17, 27, 45, 0.82);
  border-color: rgba(148, 163, 184, 0.14);
}

.home.is-dark .entry-card--question {
  background:
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.12), transparent 34%),
    rgba(17, 27, 45, 0.88);
}

.home.is-dark .entry-card--role {
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.16), transparent 34%),
    rgba(17, 27, 45, 0.88);
}

.home.is-dark .entry-card--community {
  background:
    radial-gradient(circle at top right, rgba(244, 114, 182, 0.16), transparent 34%),
    rgba(17, 27, 45, 0.88);
}

.home.is-dark .entry-card--blog {
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.16), transparent 34%),
    rgba(17, 27, 45, 0.88);
}

.home.is-dark .content-panel--blog,
.home.is-dark .content-panel--ai,
.home.is-dark .footer-card--muted {
  background:
    linear-gradient(180deg, rgba(108, 159, 255, 0.06), transparent 72%),
    rgba(17, 27, 45, 0.84);
}

.home.is-dark .btn-primary {
  background: #5eead4;
  border-color: #5eead4;
  color: #082f49;
}

.home.is-dark .btn-primary:hover {
  background: #7dd3c8;
  border-color: #7dd3c8;
}

.home.is-dark .btn-secondary,
.home.is-dark .btn-tertiary {
  background: rgba(17, 27, 45, 0.7);
  border-color: rgba(148, 163, 184, 0.16);
}

.home.is-dark .notice-banner {
  background: rgba(45, 212, 191, 0.08);
  border-color: rgba(45, 212, 191, 0.16);
}

.home.is-dark .stats-strip,
.home.is-dark .stats-strip__item,
.home.is-dark .focus-note,
.home.is-dark .community-spotlight__item {
  border-color: rgba(148, 163, 184, 0.14);
}

.home.is-dark .footer-link__visual {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.8));
}

.home.is-dark .community-spotlight__visual {
  background:
    radial-gradient(circle at 18% 26%, rgba(45, 212, 191, 0.16), transparent 22%),
    radial-gradient(circle at 84% 74%, rgba(96, 165, 250, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(17, 27, 45, 0.88));
}

.home.is-dark .community-bubble,
.home.is-dark .ai-preview-card {
  background: rgba(15, 23, 42, 0.84);
  box-shadow: none;
}

.home.is-dark .community-bubble__line,
.home.is-dark .ai-preview-card__line {
  background: rgba(148, 163, 184, 0.2);
}

.home.is-dark .community-bubble--chip {
  background: rgba(20, 184, 166, 0.14);
  color: #7dd3c8;
}

.home.is-dark .community-bubble--chip-alt {
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
}

.home.is-dark .content-panel__visual {
  background:
    radial-gradient(circle at 82% 20%, rgba(45, 212, 191, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(17, 27, 45, 0.88));
}

.home.is-dark .footer-link--ranking .footer-link__visual {
  background:
    radial-gradient(circle at 18% 22%, rgba(251, 146, 60, 0.18), transparent 26%),
    linear-gradient(180deg, rgba(69, 26, 3, 0.36), rgba(30, 41, 59, 0.92));
}

.home.is-dark .footer-link--history .footer-link__visual {
  background:
    radial-gradient(circle at 84% 20%, rgba(96, 165, 250, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(30, 58, 138, 0.24), rgba(30, 41, 59, 0.92));
}

.home.is-dark .footer-link--service .footer-link__visual {
  background:
    radial-gradient(circle at 18% 78%, rgba(192, 132, 252, 0.2), transparent 24%),
    linear-gradient(180deg, rgba(88, 28, 135, 0.2), rgba(30, 41, 59, 0.92));
}

.home.is-dark .visual-chat__line {
  background: rgba(148, 163, 184, 0.2);
}

.home.is-dark .progress-track {
  background: rgba(45, 212, 191, 0.14);
}

.home.is-dark .progress-track--soft {
  background: rgba(96, 165, 250, 0.14);
}

@media (max-width: 1180px) {
  .hero,
  .discovery-grid,
  .footer-zone {
    grid-template-columns: 1fr;
  }

  .entry-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .entry-card--wide {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .main {
    padding: 84px 0 40px;
  }

  .container {
    padding: 0 16px;
  }

  .hero-title {
    font-size: 38px;
  }

  .hero-actions,
  .section-heading,
  .hero-kicker-row,
  .notice-banner,
  .focus-card__head,
  .community-spotlight__head,
  .content-panel__head,
  .footer-card__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-strip,
  .entry-grid,
  .community-spotlight__list,
  .footer-links {
    grid-template-columns: 1fr;
  }

  .stats-strip__item {
    padding-right: 0;
    padding-bottom: 14px;
    border-right: none;
    border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  }

  .stats-strip__item:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .entry-card--wide {
    grid-column: span 1;
    min-height: 0;
  }

  .btn-primary,
  .btn-secondary,
  .btn-tertiary {
    width: 100%;
  }

  .notice-banner__title {
    white-space: normal;
  }
}
</style>
