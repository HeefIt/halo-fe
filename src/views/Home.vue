<template>
  <div class="home">
    <Header />
    
    <main class="main">
      <div class="container">
        <section class="welcome animate-slide-up">
          <div class="welcome-content">
            <h1 class="welcome-title">
              {{ greetingText }}<span class="text-gradient">{{ displayName }}</span>
            </h1>
            <p class="welcome-subtitle">今天想推进哪一段能力？</p>
          </div>
          <div class="welcome-date">
            <span class="date-day">{{ currentDay }}</span>
            <span class="date-month">{{ currentMonth }}</span>
          </div>
        </section>

        <section class="stats animate-slide-up" style="animation-delay: 100ms">
          <div class="stats-card">
            <div class="stats-header">
              <span class="stats-title">今日进度</span>
              <span class="stats-badge">每日凌晨1点结算</span>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon stat-icon-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ dailyStats.problemCount }}</span>
                  <span class="stat-label">刷题数</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon stat-icon-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ formatTime(dailyStats.totalTime) }}</span>
                  <span class="stat-label">学习时长</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon stat-icon-warning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ dailyStats.accuracy }}%</span>
                  <span class="stat-label">正确率</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon stat-icon-accent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ dailyStats.totalScore }}</span>
                  <span class="stat-label">今日得分</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="features animate-slide-up" style="animation-delay: 200ms">
          <div class="section-header">
            <h2 class="section-title">继续前进</h2>
            <p class="section-desc">从题库、博客、计划和 AI 工具里选择一个入口</p>
          </div>
          
          <div class="features-grid">
            <button class="feature-card" @click="goTo('/home/questions')">
              <div class="feature-icon feature-icon-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M8 7h8M8 11h8M8 15h4"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">题库练习</h3>
                <p class="feature-desc">按主题推进，边练边查漏</p>
              </div>
              <svg class="feature-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <button class="feature-card" @click="goTo('/study-plan')">
              <div class="feature-icon feature-icon-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">学习计划</h3>
                <p class="feature-desc">把目标拆成可执行节点</p>
              </div>
              <svg class="feature-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <button class="feature-card" @click="goTo('/ranking')">
              <div class="feature-icon feature-icon-warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
                  <circle cx="12" cy="8" r="7"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">排行榜</h3>
                <p class="feature-desc">查看当前节奏与阶段位置</p>
              </div>
              <svg class="feature-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <button class="feature-card" @click="goTo('/practice-history')">
              <div class="feature-icon feature-icon-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">练习记录</h3>
                <p class="feature-desc">回看答题轨迹与薄弱点</p>
              </div>
              <svg class="feature-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </section>

        <section class="ai-section animate-slide-up" style="animation-delay: 300ms">
          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">AI 协作区</h2>
              <p class="section-desc">把提问、拆解、理解和复盘放到一起</p>
            </div>
            <span class="section-tag">NEW</span>
          </div>
          
          <div class="ai-grid">
            <button class="ai-card" @click="goTo('/ai/chatbot')">
              <div class="ai-header">
                <span class="ai-icon">💬</span>
                <span class="ai-badge ai-badge-hot">HOT</span>
              </div>
              <h3 class="ai-title">通用对话</h3>
              <p class="ai-desc">聊概念、排思路、拆需求，保留上下文持续协作</p>
              <div class="ai-arrow">→</div>
            </button>
            
            <button class="ai-card" @click="goTo('/ai/practice-assistant')">
              <div class="ai-header">
                <span class="ai-icon">📝</span>
                <span class="ai-badge ai-badge-new">NEW</span>
              </div>
              <h3 class="ai-title">练习助手</h3>
              <p class="ai-desc">按你的表现推荐练习，并给出下一步建议</p>
              <div class="ai-arrow">→</div>
            </button>
            
            <button class="ai-card" @click="goTo('/ai/customer-service')">
              <div class="ai-header">
                <span class="ai-icon">🎧</span>
                <span class="ai-badge ai-badge-default">24/7</span>
              </div>
              <h3 class="ai-title">智能客服</h3>
              <p class="ai-desc">快速了解平台功能、使用路径和常见问题</p>
              <div class="ai-arrow">→</div>
            </button>
            
            <button class="ai-card" @click="goTo('/ai/multimodal')">
              <div class="ai-header">
                <span class="ai-icon">📄</span>
                <span class="ai-badge ai-badge-pro">PRO</span>
              </div>
              <h3 class="ai-title">多模态解析</h3>
              <p class="ai-desc">识别图片、PDF 与资料内容，辅助阅读和整理</p>
              <div class="ai-arrow">→</div>
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getDailyStatistics } from '@/api/subject'
import { ElMessage } from 'element-plus'
import Header from '@/views/components/layout/Header.vue'

const router = useRouter()
const userStore = useUserStore()

const dailyStats = ref({
  problemCount: 0,
  totalTime: 0,
  accuracy: 0.0,
  totalScore: 0
})

const currentTime = ref(new Date())
let greetingTimer = null

const displayName = computed(() => userStore.userName || '\u5b66\u4e60\u8005')

const greetingText = computed(() => {
  const hour = currentTime.value.getHours()

  if (hour < 5) return '\u591c\u6df1\u4e86\uff0c'
  if (hour < 11) return '\u65e9\u4e0a\u597d\uff0c'
  if (hour < 13) return '\u4e2d\u5348\u597d\uff0c'
  if (hour < 18) return '\u4e0b\u5348\u597d\uff0c'
  return '\u665a\u4e0a\u597d\uff0c'
})

const currentDay = computed(() => {
  return currentTime.value.getDate()
})

const currentMonth = computed(() => {
  const months = ['\u4e00\u6708', '\u4e8c\u6708', '\u4e09\u6708', '\u56db\u6708', '\u4e94\u6708', '\u516d\u6708', '\u4e03\u6708', '\u516b\u6708', '\u4e5d\u6708', '\u5341\u6708', '\u5341\u4e00\u6708', '\u5341\u4e8c\u6708']
  return months[currentTime.value.getMonth()]
})

const goTo = (path) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push(path).catch(err => {
    console.error('路由跳转失败:', err)
    ElMessage.error('页面跳转失败')
  })
}

const fetchDailyStatistics = async () => {
  try {
    const res = await getDailyStatistics(userStore.userInfo.id)
    if (res.code === 200) {
      dailyStats.value = res.data
    }
  } catch (err) {
    console.error('获取每日统计信息失败:', err)
  }
}

const formatTime = (seconds) => {
  if (!seconds) return '0分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  let result = ''
  if (hours > 0) result += `${hours}小时`
  if (minutes > 0) result += `${minutes}分钟`
  return result || '0分钟'
}

onMounted(() => {
  currentTime.value = new Date()
  greetingTimer = window.setInterval(() => {
    currentTime.value = new Date()
  }, 30000)
  fetchDailyStatistics()
})

onUnmounted(() => {
  if (greetingTimer) {
    window.clearInterval(greetingTimer)
    greetingTimer = null
  }
})

watch(() => userStore.userInfo, (newUserInfo) => {
  if (newUserInfo && newUserInfo.id) {
    fetchDailyStatistics()
  }
}, { immediate: false })
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--color-bg);
}

.main {
  padding: 88px 0 var(--spacing-2xl);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
}

.welcome-title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.welcome-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
}

.welcome-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.date-day {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-accent);
  line-height: 1;
}

.date-month {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}

.stats {
  margin-bottom: var(--spacing-3xl);
}

.stats-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.stats-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.stats-badge {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-full);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stat-icon-primary {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.stat-icon-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.stat-icon-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.stat-icon-accent {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  color: var(--color-accent);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.section-header {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.section-desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}

.features {
  margin-bottom: var(--spacing-3xl);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
}

.feature-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}

.feature-icon-primary {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.feature-icon-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.feature-icon-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.feature-icon-accent {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  color: var(--color-accent);
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.feature-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.feature-arrow {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.feature-card:hover .feature-arrow {
  transform: translateX(4px);
  color: var(--color-accent);
}

.ai-section {
  margin-bottom: var(--spacing-2xl);
}

.ai-section .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--text-xs);
  font-weight: 600;
  color: white;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.ai-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
}

.ai-card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-lg), 0 0 20px rgba(99, 102, 241, 0.1);
  transform: translateY(-4px);
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.ai-icon {
  font-size: 28px;
}

.ai-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-sm);
}

.ai-badge-hot {
  background: #fef2f2;
  color: #ef4444;
}

.ai-badge-new {
  background: #f0fdf4;
  color: #10b981;
}

.ai-badge-default {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
}

.ai-badge-pro {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
}

.ai-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.ai-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.ai-arrow {
  position: absolute;
  right: var(--spacing-lg);
  bottom: var(--spacing-lg);
  font-size: var(--text-xl);
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.ai-card:hover .ai-arrow {
  color: var(--color-accent);
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ai-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .welcome {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }
  
  .welcome-title {
    font-size: var(--text-2xl);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .ai-grid {
    grid-template-columns: 1fr;
  }
  
  .ai-section .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>
