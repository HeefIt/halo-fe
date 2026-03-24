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

            <p class="hero-prefix">{{ greetingPrefixText }}</p>
            <h1 class="hero-title">
              {{ greetingText }}<span>{{ displayName }}</span>
            </h1>
            <p class="hero-copy">
              今天不用把所有事情都塞进同一个页面。先从最顺手的入口开始，题库、圈子、AI 和博客都在这里，
              你可以认真推进，也可以先轻松热一下状态。
            </p>

            <div class="hero-actions">
              <button class="btn-primary" @click="goTo('/home/questions')">
                开始今天的练习
              </button>
              <button class="btn-secondary" @click="goTo('/community')">
                去圈子逛逛
              </button>
              <button class="btn-tertiary" @click="goTo('/ai/role-chat')">
                打开角色对话
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
              <span class="notice-banner__action">查看详情</span>
            </button>

            <div class="stats-strip">
              <div
                v-for="signal in leadSignals"
                :key="signal.label"
                class="stats-strip__item"
              >
                <span class="stats-strip__label">{{ signal.label }}</span>
                <strong class="stats-strip__value">{{ signal.value }}</strong>
                <p class="stats-strip__note">{{ signal.note }}</p>
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
                <span class="profile-card__eyebrow">今日状态</span>
                <strong>{{ displayName }}</strong>
                <p>{{ profileSummary }}</p>
              </div>
            </section>

            <section class="focus-card">
              <div class="focus-card__head">
                <div>
                  <span class="focus-card__eyebrow">Today Focus</span>
                  <h2>{{ nextActionTitle }}</h2>
                </div>
                <span class="focus-card__tag">{{ nextActionTag }}</span>
              </div>

              <p class="focus-card__desc">{{ nextActionDesc }}</p>

              <div class="progress-list">
                <div class="progress-item">
                  <div class="progress-item__meta">
                    <span>练习进度</span>
                    <strong>{{ problemProgress }}%</strong>
                  </div>
                  <div class="progress-track">
                    <span class="progress-fill" :style="{ width: `${problemProgress}%` }"></span>
                  </div>
                </div>

                <div class="progress-item">
                  <div class="progress-item__meta">
                    <span>专注时长</span>
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
                  <p>{{ focusInsight.desc }}</p>
                </div>
                <div class="focus-note">
                  <span>{{ rhythmInsight.title }}</span>
                  <p>{{ rhythmInsight.desc }}</p>
                </div>
              </div>
            </section>
          </aside>
        </section>

        <section class="entry-zone animate-slide-up" style="animation-delay: 80ms">
          <div class="section-heading">
            <div>
              <span class="section-kicker">Main Entry</span>
              <h2 class="section-title">今天可以从这里开始</h2>
            </div>
            <p class="section-copy">把最常用的路径收成更清楚的四个入口，减少来回切页的成本。</p>
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
              <p class="entry-card__desc">{{ entry.desc }}</p>
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
                  查看圈子
                </button>
              </div>

              <h2 class="community-spotlight__title">不是只有刷题，今天也可以去看看大家在聊什么</h2>
              <p class="community-spotlight__desc">
                圈子更适合放轻一点的表达和讨论。你可以发动态、吐槽、丢表情包，也可以顺手点进别人主页，
                看看最近谁在分享心得、谁又在为一道题吵起来。
              </p>

              <div class="community-spotlight__chips">
                <span v-for="chip in communityChips" :key="chip">{{ chip }}</span>
              </div>

              <div class="community-spotlight__list">
                <div
                  v-for="item in communityHighlights"
                  :key="item.title"
                  class="community-spotlight__item"
                >
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </article>

            <div class="side-panels">
              <article class="content-panel content-panel--blog">
                <div class="content-panel__head">
                  <span class="section-kicker">Blog</span>
                  <button class="text-link" @click="goTo('/blog')">
                    看文章
                  </button>
                </div>
                <strong class="content-panel__title">先读一篇文章，也是一种很好的开场</strong>
                <p class="content-panel__desc">
                  把题解、经验和一点自己的判断沉淀下来，首页不再只强调效率，也给内容留了更舒服的位置。
                </p>
                <div class="content-panel__foot">
                  <span>适合阅读、整理思路、顺手写点什么</span>
                </div>
              </article>

              <article class="content-panel content-panel--ai">
                <div class="content-panel__head">
                  <span class="section-kicker">AI Zone</span>
                  <button class="text-link" @click="goTo('/ai/customer-service')">
                    打开客服
                  </button>
                </div>
                <strong class="content-panel__title">需要陪聊、模拟、问路或者拆解问题时，AI 都能接上</strong>
                <p class="content-panel__desc">
                  通用对话适合梳理概念，角色对话适合模拟场景，智能客服适合问站内功能，多模态则更适合资料解析。
                </p>
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
              <h2 class="section-title section-title--small">轻量辅助区</h2>
            </div>
            <p class="section-copy">
              不再额外堆很多功能块，只留下几个真的常用的去处，方便你回看、比较和继续推进。
            </p>
          </article>

          <div class="footer-links">
            <button
              v-for="item in supportEntries"
              :key="item.title"
              class="footer-link"
              @click="goTo(item.path)"
            >
              <span class="footer-link__tag">{{ item.tag }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
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

const greetingSeed = computed(() => {
  return currentTime.value.getDate() + currentTime.value.getMonth() + currentTime.value.getFullYear() + currentTime.value.getHours()
})

const greetingPrefixText = computed(() => {
  const prefixes = greetingPreset.value.prefixes || []
  if (!prefixes.length) {
    return ''
  }
  return prefixes[greetingSeed.value % prefixes.length]
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
  if (accuracy >= 85) return '状态稳定，可以适当提高练习难度。'
  if (accuracy >= 60) return '继续稳住中段题，先保证连续答题手感。'
  return '建议先做一轮热身题，把状态拉起来。'
})

const nextActionTag = computed(() => {
  return dailyStats.value.problemCount > 0 ? '继续练习' : '开始今日首题'
})

const nextActionTitle = computed(() => {
  if (dailyStats.value.problemCount >= defaultProblemGoal) {
    return '今天的基础练习已经够了，接下来更适合做复盘。'
  }
  if (dailyStats.value.problemCount > 0) {
    return '保持当前节奏，把这一轮练习完整做完。'
  }
  return '先从一轮短练开始，把注意力快速收回来。'
})

const nextActionDesc = computed(() => {
  if (dailyStats.value.problemCount >= defaultProblemGoal) {
    return '题量达到基础目标后，继续堆数量的收益会下降，先看错题和答题路径更有价值。'
  }
  if (dailyStats.value.problemCount > 0) {
    return '不要频繁切换入口，保持当前分类和手感，把这一轮完整结束再转到其它模块。'
  }
  return '题库是今天最合适的切入点。先完成第一轮输入，后面再回到记录和社区整理自己的节奏。'
})

const focusInsight = computed(() => {
  if (dailyStats.value.problemCount === 0) {
    return {
      title: '先开一轮短练',
      desc: '今天还没进入题目状态，建议先做 5 到 10 题，把注意力收拢起来。'
    }
  }
  if (dailyStats.value.accuracy >= 80) {
    return {
      title: '可以抬高一点强度',
      desc: '正确率已经比较稳，下一轮可以适当增加中等或困难题的占比。'
    }
  }
  return {
    title: '先把正确率稳住',
    desc: '当前更适合沿着已有分类继续做，而不是频繁切换模块。'
  }
})

const rhythmInsight = computed(() => {
  if (dailyStats.value.totalTime >= defaultTimeGoal) {
    return {
      title: '适合进入复盘段',
      desc: '学习时长已经基本够用，后半段可以留给总结和查漏。'
    }
  }
  return {
    title: '还在可推进区间',
    desc: '当前总时长不重，继续一轮集中练习会更顺手。'
  }
})

const profileSummary = computed(() => {
  if (dailyStats.value.problemCount > 0) {
    return `今天已经开始了 ${dailyStats.value.problemCount} 题，节奏不错，继续往前推就好。`
  }
  return '今天还没开始正式练习，可以先找一道熟悉的题，把手感热起来。'
})

const leadSignals = computed(() => [
  {
    label: '今日题量',
    value: `${dailyStats.value.problemCount} / ${defaultProblemGoal}`,
    note: dailyStats.value.problemCount > 0 ? '已经进入状态，优先保持连续性。' : '还没开始，建议先做一轮短练。'
  },
  {
    label: '学习时长',
    value: formatTime(dailyStats.value.totalTime),
    note: '默认按 60 分钟作为一轮完整训练。'
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
    desc: '今天最适合先推进的主路径，适合热身、刷题和稳定节奏。',
    path: '/home/questions',
    tag: '主线',
    tone: 'question',
    meta: `${dailyStats.value.problemCount > 0 ? '继续今日进度' : '开启今日首题'}`,
    featured: true
  },
  {
    title: '角色对话',
    desc: '切到女朋友、面试官或其它系统角色，做更有场景感的模拟对话。',
    path: '/ai/role-chat',
    tag: 'AI',
    tone: 'role',
    meta: '适合陪练、模拟和对练'
  },
  {
    title: '圈子社区',
    desc: '看看大家在分享什么，也可以自己发动态、评论、接话和围观。',
    path: '/community',
    tag: '交流',
    tone: 'community',
    meta: '适合表达、吐槽和讨论'
  },
  {
    title: '博客内容',
    desc: '把题解、心得和判断写下来，也可以先读点别人整理好的内容。',
    path: '/blog',
    tag: '内容',
    tone: 'blog',
    meta: '适合阅读、沉淀和输出'
  }
])

const supportEntries = [
  {
    title: '排行榜',
    desc: '看看阶段位置，但不要让排名替代自己的学习节奏。',
    path: '/ranking',
    tag: '参考'
  },
  {
    title: '练习记录',
    desc: '回看答题轨迹和错题分布，比只看分数更有价值。',
    path: '/practice-history',
    tag: '复盘'
  },
  {
    title: '智能客服',
    desc: '快速查询站内功能、常见页面和一些使用上的问题。',
    path: '/ai/customer-service',
    tag: '支持'
  }
]

const communityChips = ['说说动态', '评论互动', '表情包', '用户主页', '轻松讨论']

const communityHighlights = [
  {
    title: '轻量表达更容易留下来',
    desc: '比起正式文章，动态更适合记录一瞬间的想法、吐槽和今天遇到的小问题。'
  },
  {
    title: '讨论关系会自然长出来',
    desc: '头像、昵称和用户主页让互动更有人味，社区不会像匿名留言板一样飘。'
  }
]

const aiTools = [
  {
    title: '通用对话',
    badge: '基础',
    path: '/ai/chatbot'
  },
  {
    title: '角色对话',
    badge: '推荐',
    path: '/ai/role-chat'
  },
  {
    title: '智能客服',
    badge: '导航',
    path: '/ai/customer-service'
  },
  {
    title: '多模态解析',
    badge: '扩展',
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
  gap: 12px;
  padding: 18px;
  border-radius: 10px;
  text-align: left;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
}

.footer-link strong {
  font-size: 18px;
  line-height: 1.3;
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
