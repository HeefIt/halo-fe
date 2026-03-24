<template>
  <div
    class="home app-shell app-shell--internal"
    :class="{ 'is-dark': themeStore.isDark }"
  >
    <Header />

    <main class="main">
      <div class="container">
        <section class="page-lead animate-slide-up">
          <div class="lead-main">
            <span class="lead-kicker">Halo Study Desk</span>
            <p class="lead-prefix">{{ greetingPrefixText }}</p>
            <h1 class="lead-title">
              {{ greetingText }}<span>{{ displayName }}</span>
            </h1>

            <div class="lead-actions">
              <button class="action-primary" @click="goTo('/home/questions')">
                进入题库
              </button>
              <button class="action-secondary" @click="goTo('/community')">
                进入圈子社区
              </button>
            </div>

            <button
              v-if="activeNotice"
              class="notice-entry"
              type="button"
              @click="showNoticeDialog = true"
            >
              <span class="notice-entry__icon">公告</span>
              <span class="notice-entry__title">{{ activeNotice.title }}</span>
              <span class="notice-entry__arrow">查看</span>
            </button>

            <div class="signal-row">
              <div
                v-for="signal in leadSignals"
                :key="signal.label"
                class="signal-item"
              >
                <span class="signal-label">{{ signal.label }}</span>
                <strong class="signal-value">{{ signal.value }}</strong>
                <p class="signal-note">{{ signal.note }}</p>
              </div>
            </div>
          </div>

          <aside class="lead-rail">
            <div class="rail-head">
              <span class="rail-kicker">Today</span>
              <div class="rail-date">
                <strong>{{ currentMonth }} {{ currentDay }} 日</strong>
                <span>{{ currentWeekday }}</span>
              </div>
            </div>

            <div class="rail-body">
              <div class="rail-row">
                <span>刷题数</span>
                <strong>{{ dailyStats.problemCount }}</strong>
                <p>目标 {{ defaultProblemGoal }} 题，优先保证连续性。</p>
              </div>
              <div class="rail-row">
                <span>学习时长</span>
                <strong>{{ formatTime(dailyStats.totalTime) }}</strong>
                <p>以 60 分钟为一个完整练习单位。</p>
              </div>
              <div class="rail-row">
                <span>正确率</span>
                <strong>{{ dailyStats.accuracy }}%</strong>
                <p>{{ accuracyStatus }}</p>
              </div>
            </div>

            <div class="rail-note">
              <span>今日判断</span>
              <p>{{ focusInsight.desc }}</p>
            </div>
          </aside>
        </section>

        <section class="priority-zone animate-slide-up" style="animation-delay: 80ms">
          <div class="section-heading">
            <div>
              <span class="section-kicker">Priority</span>
              <h2 class="section-title">当前推进面板</h2>
            </div>
            <span class="section-tag">{{ nextActionTag }}</span>
          </div>

          <div class="priority-layout">
            <article class="priority-main">
              <div class="priority-copy">
                <span class="priority-mark">正在推进</span>
                <h3>{{ nextActionTitle }}</h3>
                <p>{{ nextActionDesc }}</p>
              </div>

              <div class="progress-board">
                <div class="progress-row">
                  <div class="progress-meta">
                    <span>练习进度</span>
                    <strong>{{ problemProgress }}%</strong>
                  </div>
                  <div class="progress-track">
                    <span class="progress-fill" :style="{ width: `${problemProgress}%` }"></span>
                  </div>
                </div>

                <div class="progress-row">
                  <div class="progress-meta">
                    <span>专注时长</span>
                    <strong>{{ studyProgress }}%</strong>
                  </div>
                  <div class="progress-track progress-track-neutral">
                    <span class="progress-fill progress-fill-neutral" :style="{ width: `${studyProgress}%` }"></span>
                  </div>
                </div>
              </div>

              <div class="priority-actions">
                <button class="action-primary" @click="goTo('/home/questions')">
                  继续练题
                </button>
                <button class="action-secondary" @click="goTo('/practice-history')">
                  查看练习记录
                </button>
              </div>
            </article>

            <aside class="priority-side">
              <div class="insight-block">
                <span class="insight-label">当前建议</span>
                <strong>{{ focusInsight.title }}</strong>
                <p>{{ focusInsight.desc }}</p>
              </div>

              <div class="insight-block">
                <span class="insight-label">节奏提醒</span>
                <strong>{{ rhythmInsight.title }}</strong>
                <p>{{ rhythmInsight.desc }}</p>
              </div>
            </aside>
          </div>
        </section>

        <section class="workflow-zone animate-slide-up" style="animation-delay: 160ms">
          <div class="section-heading section-heading-compact">
            <div>
              <span class="section-kicker">Workflow</span>
              <h2 class="section-title">常用工作流</h2>
            </div>
          </div>

          <div class="workflow-layout">
            <article class="workflow-primary">
              <span class="workflow-tag">主路径</span>
              <h3>题库练习</h3>

              <div class="workflow-facts">
                <div class="workflow-fact">
                  <span>今日目标</span>
                  <strong>{{ defaultProblemGoal }} 题</strong>
                </div>
                <div class="workflow-fact">
                  <span>建议时长</span>
                  <strong>60 分钟</strong>
                </div>
                <div class="workflow-fact">
                  <span>当前状态</span>
                  <strong>{{ dailyStats.problemCount > 0 ? '已开始' : '待开始' }}</strong>
                </div>
              </div>

              <button class="action-primary" @click="goTo('/home/questions')">
                进入题库练习
              </button>
            </article>

            <div class="workflow-secondary">
              <button
                v-for="item in supportEntries"
                :key="item.title"
                class="workflow-item"
                @click="goTo(item.path)"
              >
                <div class="workflow-item-head">
                  <span class="workflow-item-tag">{{ item.tag }}</span>
                  <span class="workflow-item-arrow">→</span>
                </div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
              </button>
            </div>
          </div>
        </section>

        <section class="utility-zone animate-slide-up" style="animation-delay: 240ms">
          <div class="section-heading section-heading-compact">
            <div>
              <span class="section-kicker">Utility</span>
              <h2 class="section-title">辅助工具</h2>
            </div>
          </div>

          <div class="utility-layout">
            <button
              class="utility-featured"
              @click="goTo(featuredAiTool.path)"
            >
              <div class="utility-featured__head">
                <div class="utility-featured__icon" :class="`is-${featuredAiTool.tone}`">
                  {{ featuredAiTool.icon }}
                </div>
                <div class="utility-featured__meta">
                  <span class="utility-row-badge">{{ featuredAiTool.badge }}</span>
                  <span class="utility-featured__arrow">进入</span>
                </div>
              </div>
              <strong class="utility-featured__title">{{ featuredAiTool.title }}</strong>
            </button>

            <div class="utility-list">
              <button
                v-for="tool in secondaryAiTools"
                :key="tool.title"
                class="utility-row"
                @click="goTo(tool.path)"
              >
                <div class="utility-row-mark" :class="`is-${tool.tone}`">
                  <span>{{ tool.icon }}</span>
                </div>
                <div class="utility-row-main">
                  <span class="utility-row-name">{{ tool.title }}</span>
                </div>
                <span class="utility-row-badge">{{ tool.badge }}</span>
              </button>
            </div>
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

const greetingText = computed(() => {
  return greetingPreset.value.greeting
})

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
  return '题库是今天最合适的切入点。先完成第一轮输入，后面再回到计划和记录做整理。'
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

const leadSignals = computed(() => [
  {
    label: '今日题量',
    value: `${dailyStats.value.problemCount} / ${defaultProblemGoal}`,
    note: dailyStats.value.problemCount > 0 ? '已进入状态，优先保持连续性。' : '今天还没开始，建议先做一轮短练。'
  },
  {
    label: '学习时长',
    value: formatTime(dailyStats.value.totalTime),
    note: '默认按 60 分钟作为一轮完整训练。'
  },
  {
    label: '当前判断',
    value: `${dailyStats.value.accuracy}%`,
    note: accuracyStatus.value
  }
])

const supportEntries = [
  {
    title: '圈子社区',
    desc: '看看大家今天在吐槽什么、分享什么，也可以自己发动态参与讨论。',
    path: '/community',
    tag: '交流'
  },
  {
    title: '排行榜',
    desc: '观察阶段位置，但不让它替代真正的学习节奏。',
    path: '/ranking',
    tag: '参考'
  },
  {
    title: '练习记录',
    desc: '回看答题轨迹和错题分布，比只看分数更有价值。',
    path: '/practice-history',
    tag: '复盘'
  }
]

const aiTools = [
  {
    title: '通用对话',
    desc: '用于梳理概念、拆解问题和讨论思路。',
    badge: '基础',
    path: '/ai/chatbot',
    tone: 'chat',
    icon: '◌'
  },
  {
    title: '角色对话',
    desc: '选择系统角色，进入更稳定的模拟对话场景。',
    badge: '推荐',
    path: '/ai/role-chat',
    tone: 'role',
    icon: '◈'
  },
  {
    title: '智能客服',
    desc: '快速查询站内功能、使用路径和常见问题。',
    badge: '支持',
    path: '/ai/customer-service',
    tone: 'service',
    icon: '◇'
  },
  {
    title: '多模态解析',
    desc: '辅助阅读图片、资料和 PDF 内容。',
    badge: '扩展',
    path: '/ai/multimodal',
    tone: 'multimodal',
    icon: '▣'
  }
]

const featuredAiTool = computed(() => aiTools[1])
const secondaryAiTools = computed(() => aiTools.filter((_, index) => index !== 1))

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
  background: var(--app-bg);
}

.main {
  padding: 88px 0 52px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
}

.page-lead,
.priority-zone,
.workflow-zone {
  margin-bottom: 36px;
}

.page-lead {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.72fr);
  gap: 32px;
}

.lead-main {
  padding: 12px 0 0;
}

.lead-kicker,
.section-kicker,
.rail-kicker,
.priority-mark,
.workflow-tag,
.workflow-item-tag,
.insight-label {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.lead-title {
  max-width: 720px;
  margin: 10px 0 16px;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: clamp(38px, 5vw, 62px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.lead-prefix {
  max-width: 760px;
  margin: 18px 0 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.7;
}

.lead-title span {
  color: var(--color-accent);
}

.lead-copy {
  max-width: 760px;
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1.8;
}

.lead-actions,
.priority-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.notice-entry {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(37, 99, 235, 0.04);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
}

.notice-entry__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
}

.notice-entry__title {
  max-width: 380px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}

.notice-entry__arrow {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.action-primary,
.action-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 700;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.action-primary {
  background: var(--color-accent);
  color: #ffffff;
  border: 1px solid var(--color-accent);
}

.action-primary:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.action-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.action-secondary:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.signal-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 44px;
  padding-top: 22px;
  border-top: 1px solid var(--color-border);
}

.signal-item {
  padding-right: 18px;
  border-right: 1px solid var(--color-border);
}

.signal-item:last-child {
  border-right: none;
  padding-right: 0;
}

.signal-label,
.rail-row span,
.workflow-fact span,
.utility-row-badge {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.signal-value,
.rail-row strong,
.workflow-fact strong {
  display: block;
  margin: 10px 0 8px;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 26px;
  line-height: 1.05;
}

.signal-note,
.rail-row p,
.rail-note p,
.priority-copy p,
.insight-block p,
.workflow-primary p,
.workflow-item p,
.utility-row p,
.section-copy {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.lead-rail {
  align-self: start;
  padding: 18px 0 0 24px;
  border-left: 1px solid var(--color-border);
}

.rail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.rail-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.rail-date strong {
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 22px;
  line-height: 1.1;
}

.rail-date span {
  color: var(--color-text-muted);
  font-size: 13px;
}

.rail-body {
  display: grid;
  gap: 12px;
}

.rail-row {
  padding: 14px 0;
  border-top: 1px solid var(--color-border);
}

.rail-row:first-child {
  border-top: none;
  padding-top: 0;
}

.rail-note {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.rail-note span {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.section-heading-compact {
  align-items: center;
}

.section-title {
  margin-top: 12px;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 28px;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.priority-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.38fr) minmax(280px, 0.7fr);
  gap: 0;
  border: 1px solid var(--color-border);
  background: var(--internal-panel-bg);
}

.priority-main {
  padding: 26px 28px 30px;
}

.priority-side {
  display: grid;
  grid-template-rows: 1fr 1fr;
  border-left: 1px solid var(--color-border);
}

.priority-copy h3 {
  margin: 12px 0 12px;
  color: var(--color-text);
  font-size: 26px;
  line-height: 1.35;
}

.progress-board {
  display: grid;
  gap: 18px;
  margin-top: 30px;
}

.progress-row {
  padding: 18px 0 0;
  border-top: 1px solid var(--color-border);
}

.progress-row:first-child {
  border-top: none;
  padding-top: 0;
}

.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.progress-meta strong {
  color: var(--color-text);
  font-size: 16px;
}

.progress-track {
  position: relative;
  height: 8px;
  background: var(--color-accent-light);
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--color-accent);
}

.progress-track-neutral {
  background: var(--color-bg-muted);
}

.progress-fill-neutral {
  background: #2e3e58;
}

.insight-block {
  padding: 22px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
}

.insight-block:last-child {
  border-bottom: none;
}

.insight-block strong {
  display: block;
  margin: 12px 0 10px;
  color: var(--color-text);
  font-size: 19px;
  line-height: 1.4;
}

.workflow-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.92fr);
  gap: 0;
  border: 1px solid var(--color-border);
  background: var(--internal-panel-bg);
}

.workflow-primary {
  padding: 26px 28px 28px;
  border-right: 1px solid var(--color-border);
}

.workflow-primary h3 {
  margin: 16px 0 12px;
  color: var(--color-text);
  font-size: 30px;
  line-height: 1.05;
}

.workflow-facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 28px 0;
}

.workflow-fact {
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.workflow-secondary {
  display: grid;
  grid-template-rows: repeat(3, minmax(0, 1fr));
}

.workflow-item {
  display: block;
  padding: 20px 22px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
  transition: background-color var(--transition-fast);
}

.workflow-item:last-child {
  border-bottom: none;
}

.workflow-item:hover {
  background: var(--internal-panel-bg-hover);
}

.workflow-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.workflow-item-arrow {
  color: var(--color-text-muted);
  font-size: 16px;
}

.workflow-item strong {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 18px;
}

.utility-zone {
  margin-top: 52px;
}

.utility-layout {
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(0, 1fr);
  gap: 20px;
}

.utility-featured {
  display: grid;
  gap: 14px;
  align-content: start;
  padding: 20px 22px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.03), transparent 72%);
  text-align: left;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
}

.utility-featured:hover {
  transform: translateY(-2px);
  border-color: rgba(37, 99, 235, 0.16);
}

.utility-featured__head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: start;
}

.utility-featured__icon,
.utility-row-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.utility-featured__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  font-size: 16px;
}

.utility-featured__icon.is-chat,
.utility-row-mark.is-chat {
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

.utility-featured__icon.is-role,
.utility-row-mark.is-role {
  background: rgba(217, 119, 6, 0.1);
  color: #b45309;
}

.utility-featured__icon.is-service,
.utility-row-mark.is-service {
  background: rgba(13, 148, 136, 0.1);
  color: #0f766e;
}

.utility-featured__icon.is-multimodal,
.utility-row-mark.is-multimodal {
  background: rgba(79, 70, 229, 0.1);
  color: #4338ca;
}

.utility-featured__meta {
  display: grid;
  gap: 10px;
  justify-items: end;
}

.utility-featured__arrow {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.utility-featured__title {
  color: var(--color-text);
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.utility-featured p {
  margin: 0;
}

.utility-list {
  border-top: 1px solid var(--color-border);
}

.utility-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  padding: 18px 16px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  border-radius: 14px;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.utility-row:hover {
  background: rgba(23, 78, 166, 0.03);
  transform: translateX(2px);
}

.utility-row-mark {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 14px;
}

.utility-row-main {
  min-width: 0;
  flex: 1;
}

.utility-row-name {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 17px;
  font-weight: 700;
}

.utility-row-badge {
  flex-shrink: 0;
  padding-top: 2px;
}

.home.is-dark .lead-title,
.home.is-dark .section-title,
.home.is-dark .priority-copy h3,
.home.is-dark .workflow-primary h3,
.home.is-dark .workflow-item strong,
.home.is-dark .signal-value,
.home.is-dark .rail-row strong,
.home.is-dark .workflow-fact strong,
.home.is-dark .insight-block strong,
.home.is-dark .rail-date strong,
.home.is-dark .progress-meta strong,
.home.is-dark .utility-row-name {
  color: var(--text-1);
}

.home.is-dark .lead-prefix,
.home.is-dark .lead-copy,
.home.is-dark .signal-note,
.home.is-dark .rail-row p,
.home.is-dark .rail-note p,
.home.is-dark .priority-copy p,
.home.is-dark .insight-block p,
.home.is-dark .workflow-primary p,
.home.is-dark .workflow-item p,
.home.is-dark .utility-row p,
.home.is-dark .section-copy,
.home.is-dark .progress-meta {
  color: var(--text-2);
}

.home.is-dark .lead-rail,
.home.is-dark .signal-row,
.home.is-dark .signal-item,
.home.is-dark .rail-row,
.home.is-dark .rail-note,
.home.is-dark .priority-layout,
.home.is-dark .priority-side,
.home.is-dark .insight-block,
.home.is-dark .workflow-layout,
.home.is-dark .workflow-primary,
.home.is-dark .workflow-fact,
.home.is-dark .workflow-item,
.home.is-dark .utility-list,
.home.is-dark .utility-row {
  border-color: var(--color-border);
}

.home.is-dark .priority-layout,
.home.is-dark .workflow-layout {
  background: var(--internal-panel-bg);
}

.home.is-dark .utility-featured {
  background: linear-gradient(180deg, rgba(108, 159, 255, 0.06), transparent 72%);
  border-color: var(--color-border);
}

.home.is-dark .insight-block,
.home.is-dark .workflow-item {
  background: var(--color-bg-subtle);
}

.home.is-dark .utility-featured__icon.is-chat,
.home.is-dark .utility-row-mark.is-chat {
  color: #93c5fd;
}

.home.is-dark .utility-featured__icon.is-role,
.home.is-dark .utility-row-mark.is-role {
  color: #fdba74;
}

.home.is-dark .utility-featured__icon.is-service,
.home.is-dark .utility-row-mark.is-service {
  color: #5eead4;
}

.home.is-dark .utility-featured__icon.is-multimodal,
.home.is-dark .utility-row-mark.is-multimodal {
  color: #a5b4fc;
}

.home.is-dark .workflow-item:hover,
.home.is-dark .utility-row:hover {
  background: rgba(108, 159, 255, 0.05);
}

.home.is-dark .progress-fill-neutral {
  background: #9fb3d4;
}

@media (max-width: 1120px) {
  .page-lead,
  .priority-layout,
  .workflow-layout,
  .utility-layout {
    grid-template-columns: 1fr;
  }

  .lead-rail {
    padding: 20px 0 0;
    border-left: none;
    border-top: 1px solid var(--color-border);
  }

  .priority-side {
    border-left: none;
    border-top: 1px solid var(--color-border);
  }

  .workflow-primary {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
}

@media (max-width: 768px) {
  .main {
    padding: 84px 0 36px;
  }

  .container {
    padding: 0 16px;
  }

  .lead-title {
    font-size: 38px;
  }

  .signal-row,
  .workflow-facts {
    grid-template-columns: 1fr;
  }

  .signal-item {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 16px;
  }

  .signal-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .lead-actions,
  .priority-actions,
  .section-heading,
  .utility-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .utility-row {
    padding: 16px 0;
  }

  .action-primary,
  .action-secondary {
    width: 100%;
  }
}
</style>
