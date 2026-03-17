<template>
  <div class="profile-page">
    <div class="profile-bg">
      <div class="bg-gradient"></div>
      <div class="bg-noise"></div>
    </div>

    <header class="profile-header">
      <button class="back-btn" @click="$router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>返回</span>
      </button>
      <h1 class="page-title">个人中心</h1>
      <button class="home-btn" @click="$router.push('/home')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>首页</span>
      </button>
    </header>

    <main class="profile-main">
      <div class="profile-layout">
        <aside class="profile-sidebar">
          <div class="profile-card glass-card">
            <div class="avatar-section">
              <div class="avatar-wrapper" @dblclick="viewAvatar">
                <img 
                  v-if="userStore.userAvatar" 
                  :src="userStore.userAvatar" 
                  :alt="userStore.userName"
                  class="avatar-img"
                />
                <div v-else class="avatar-placeholder">
                  {{ userStore.userName?.charAt(0) || 'U' }}
                </div>
                <div class="avatar-ring"></div>
              </div>
              <button class="change-avatar-btn" @click="editAvatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>更换头像</span>
              </button>
            </div>

            <div class="user-info">
              <h2 class="user-nickname">{{ userStore.userName }}</h2>
              <p class="user-name" v-if="userStore.userInfo?.userName">@{{ userStore.userInfo.userName }}</p>
              <p class="user-email" v-if="userInfo.email">{{ userInfo.email }}</p>
              <div class="user-meta">
                <span v-if="userInfo.gender !== undefined" class="meta-tag">
                  {{ userInfo.gender === 1 ? '♂ 男' : '♀ 女' }}
                </span>
                <span v-if="userInfo.joinDate" class="meta-tag">
                  加入于 {{ formatDate(userInfo.joinDate) }}
                </span>
              </div>
              <p class="user-bio" v-if="userInfo.bio">{{ userInfo.bio }}</p>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ userStats.totalSolved }}</div>
                <div class="stat-label">已解决</div>
                <div class="stat-bar"></div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ userStats.totalAttempted }}</div>
                <div class="stat-label">已尝试</div>
                <div class="stat-bar"></div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ userStats.streak }}</div>
                <div class="stat-label">天数</div>
                <div class="stat-bar"></div>
              </div>
            </div>
          </div>

          <div class="achievements-card glass-card">
            <h3 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
              成就徽章
            </h3>
            <div class="achievements-list">
              <div 
                v-for="achievement in achievements" 
                :key="achievement.id"
                class="achievement-item"
                :class="{ unlocked: achievement.unlocked }"
              >
                <div class="achievement-icon-wrapper">
                  <svg v-if="achievement.icon === 'Star'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <svg v-else-if="achievement.icon === 'Medal'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/>
                    <path d="M11 12 5.12 2.2"/>
                    <path d="m13 12 5.88-9.8"/>
                    <path d="M8 7h8"/>
                    <circle cx="12" cy="17" r="5"/>
                    <path d="M12 18v-2h-.5"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                  </svg>
                </div>
                <div class="achievement-content">
                  <div class="achievement-name">{{ achievement.name }}</div>
                  <div class="achievement-desc">{{ achievement.description }}</div>
                </div>
                <div v-if="achievement.unlocked" class="achievement-badge">✓</div>
              </div>
            </div>
          </div>
        </aside>

        <section class="profile-content">
          <div class="tabs-wrapper">
            <div class="tabs-header">
              <button 
                v-for="tab in tabs" 
                :key="tab.key"
                class="tab-btn"
                :class="{ active: activeTab === tab.key }"
                @click="activeTab = tab.key"
              >
                <component :is="tab.icon" />
                <span>{{ tab.label }}</span>
              </button>
            </div>

            <div class="tabs-content">
              <div v-if="activeTab === 'solutions'" class="solutions-panel">
                <div class="panel-header">
                  <h3>最近提交</h3>
                  <div class="filter-group">
                    <button 
                      v-for="filter in solutionFilters" 
                      :key="filter.value"
                      class="filter-btn"
                      :class="{ active: solutionFilter === filter.value }"
                      @click="solutionFilter = filter.value"
                    >
                      {{ filter.label }}
                    </button>
                  </div>
                </div>

                <div class="solutions-timeline">
                  <div 
                    v-for="(solution, index) in filteredSolutions" 
                    :key="solution.id"
                    class="solution-item"
                    :style="{ '--delay': index * 0.05 + 's' }"
                  >
                    <div class="timeline-marker" :class="solution.status">
                      <svg v-if="solution.status === 'accepted'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </div>
                    <div class="solution-card">
                      <div class="solution-header">
                        <h4 class="solution-title">{{ solution.problemTitle }}</h4>
                        <span class="solution-status" :class="solution.status">
                          {{ solution.status === 'accepted' ? '通过' : '未通过' }}
                        </span>
                      </div>
                      <div class="solution-meta">
                        <span v-if="solution.categoryName" class="meta-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                          </svg>
                          {{ solution.categoryName }}
                        </span>
                        <span class="meta-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {{ formatDateTime(solution.submitTime) }}
                        </span>
                      </div>
                      <div v-if="solution.status === 'accepted'" class="solution-metrics">
                        <div class="metric">
                          <span class="metric-value">{{ solution.runtime }}ms</span>
                          <span class="metric-label">运行时间</span>
                        </div>
                        <div class="metric">
                          <span class="metric-value">{{ solution.memory }}MB</span>
                          <span class="metric-label">内存消耗</span>
                        </div>
                      </div>
                      <div v-else class="solution-error">
                        <span class="error-type">{{ solution.errorType }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="filteredSolutions.length === 0" class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <line x1="10" y1="9" x2="8" y2="9"/>
                    </svg>
                    <p>暂无练习记录</p>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'statistics'" class="statistics-panel">
                <div class="stats-section">
                  <h3 class="section-title">题目难度分布</h3>
                  <div class="difficulty-bars">
                    <div class="difficulty-item easy">
                      <div class="difficulty-header">
                        <span class="difficulty-label">简单</span>
                        <span class="difficulty-count">{{ difficultyStats.easy.solved }} / {{ difficultyStats.easy.total }}</span>
                      </div>
                      <div class="difficulty-track">
                        <div 
                          class="difficulty-fill" 
                          :style="{ width: (difficultyStats.easy.solved / difficultyStats.easy.total * 100) + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div class="difficulty-item medium">
                      <div class="difficulty-header">
                        <span class="difficulty-label">中等</span>
                        <span class="difficulty-count">{{ difficultyStats.medium.solved }} / {{ difficultyStats.medium.total }}</span>
                      </div>
                      <div class="difficulty-track">
                        <div 
                          class="difficulty-fill" 
                          :style="{ width: (difficultyStats.medium.solved / difficultyStats.medium.total * 100) + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div class="difficulty-item hard">
                      <div class="difficulty-header">
                        <span class="difficulty-label">困难</span>
                        <span class="difficulty-count">{{ difficultyStats.hard.solved }} / {{ difficultyStats.hard.total }}</span>
                      </div>
                      <div class="difficulty-track">
                        <div 
                          class="difficulty-fill" 
                          :style="{ width: (difficultyStats.hard.solved / difficultyStats.hard.total * 100) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="stats-section">
                  <h3 class="section-title">提交日历</h3>
                  <div class="calendar-wrapper">
                    <div class="calendar-grid">
                      <div 
                        v-for="(day, index) in calendarData" 
                        :key="day.date"
                        class="calendar-day"
                        :class="getCalendarDayClass(day.count)"
                        :title="`${day.date}: ${day.count} 次提交`"
                        :style="{ '--delay': (index % 53) * 0.01 + 's' }"
                      ></div>
                    </div>
                    <div class="calendar-legend">
                      <span>少</span>
                      <div class="legend-colors">
                        <div class="legend-color level-0"></div>
                        <div class="legend-color level-1"></div>
                        <div class="legend-color level-2"></div>
                        <div class="legend-color level-3"></div>
                        <div class="legend-color level-4"></div>
                      </div>
                      <span>多</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'settings'" class="settings-panel">
                <div class="settings-section">
                  <h3 class="section-title">个人信息</h3>
                  <div class="settings-form">
                    <div class="form-group">
                      <label class="form-label">昵称</label>
                      <input 
                        v-model="settingsForm.nickname" 
                        type="text" 
                        class="form-input"
                        placeholder="请输入昵称"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">邮箱</label>
                      <input 
                        v-model="settingsForm.email" 
                        type="email" 
                        class="form-input"
                        placeholder="请输入邮箱"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">性别</label>
                      <div class="radio-group">
                        <label class="radio-item" :class="{ active: settingsForm.gender === 1 }">
                          <input type="radio" :value="1" v-model="settingsForm.gender" />
                          <span>男</span>
                        </label>
                        <label class="radio-item" :class="{ active: settingsForm.gender === 0 }">
                          <input type="radio" :value="0" v-model="settingsForm.gender" />
                          <span>女</span>
                        </label>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">个人简介</label>
                      <textarea 
                        v-model="settingsForm.bio" 
                        class="form-textarea"
                        placeholder="介绍一下你自己..."
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div class="settings-section">
                  <h3 class="section-title">偏好设置</h3>
                  <div class="settings-form">
                    <div class="form-group">
                      <label class="form-label">默认编程语言</label>
                      <select v-model="settingsForm.defaultLanguage" class="form-select">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">主题模式</label>
                      <div class="radio-group">
                        <label class="radio-item" :class="{ active: settingsForm.theme === 'light' }">
                          <input type="radio" value="light" v-model="settingsForm.theme" />
                          <span>浅色</span>
                        </label>
                        <label class="radio-item" :class="{ active: settingsForm.theme === 'dark' }">
                          <input type="radio" value="dark" v-model="settingsForm.theme" />
                          <span>深色</span>
                        </label>
                        <label class="radio-item" :class="{ active: settingsForm.theme === 'auto' }">
                          <input type="radio" value="auto" v-model="settingsForm.theme" />
                          <span>跟随系统</span>
                        </label>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">邮件通知</label>
                      <div class="toggle-switch" :class="{ active: settingsForm.emailNotification }" @click="settingsForm.emailNotification = !settingsForm.emailNotification">
                        <div class="toggle-thumb"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button class="save-btn" @click="saveSettings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  <span>保存设置</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Transition name="modal">
      <div v-if="imagePreviewVisible" class="modal-overlay" @click="imagePreviewVisible = false">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="imagePreviewVisible = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <img :src="previewImageUrl" alt="头像预览" class="preview-image" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, h } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { ElMessage, ElLoading } from 'element-plus'
import { getPracticeRecordsByUser, getSolvedProblemsCount, getAttemptedProblemsCount } from '@/api/subject.js'
import { fileApi } from '@/api/file.js'

const userStore = useUserStore()

const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')
const activeTab = ref('solutions')

const userInfo = reactive({
  email: '',
  gender: undefined,
  joinDate: '',
  bio: ''
})

const userStats = reactive({
  totalSolved: 0,
  totalAttempted: 0,
  streak: 0
})

const achievements = ref([
  { id: 1, name: '探索者', description: '完成第一组工程主题练习', icon: 'Star', unlocked: true },
  { id: 2, name: '节奏者', description: '连续 7 天保持学习节奏', icon: 'Medal', unlocked: true },
  { id: 3, name: '破局者', description: '累计完成 100 次高质量练习', icon: 'Trophy', unlocked: false }
])

const solutionFilter = ref('all')
const solutions = ref([])

const solutionFilters = [
  { label: '全部', value: 'all' },
  { label: '已通过', value: 'accepted' },
  { label: '未通过', value: 'failed' }
]

const filteredSolutions = computed(() => {
  if (solutionFilter.value === 'all') return solutions.value
  return solutions.value.filter(s => s.status === solutionFilter.value)
})

const difficultyStats = reactive({
  easy: { solved: 25, total: 50 },
  medium: { solved: 18, total: 60 },
  hard: { solved: 5, total: 25 }
})

const calendarData = ref([])

const settingsForm = reactive({
  nickname: '',
  email: '',
  gender: undefined,
  bio: '',
  defaultLanguage: 'javascript',
  theme: 'light',
  emailNotification: true
})

const tabs = [
  { 
    key: 'solutions', 
    label: '练习轨迹',
    icon: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
      h('line', { x1: 16, y1: 17, x2: 8, y2: 17 }),
      h('line', { x1: 10, y1: 9, x2: 8, y2: 9 })
    ])
  },
  { 
    key: 'statistics', 
    label: '成长统计',
    icon: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
      h('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
      h('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
    ])
  },
  { 
    key: 'settings', 
    label: '设置',
    icon: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('circle', { cx: 12, cy: 12, r: 3 }),
      h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
    ])
  }
]

const formatDate = (dateString) => {
  if (!dateString) return ''
  if (typeof dateString === 'number') return new Date(dateString).toLocaleDateString('zh-CN')
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  if (typeof dateString === 'number') return new Date(dateString).toLocaleString('zh-CN')
  return new Date(dateString).toLocaleString('zh-CN')
}

const getCalendarDayClass = (count) => {
  if (count === 0) return 'level-0'
  if (count <= 2) return 'level-1'
  if (count <= 4) return 'level-2'
  if (count <= 6) return 'level-3'
  return 'level-4'
}

const generateCalendarData = () => {
  const data = []
  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - 11, today.getDate())
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 8)
    })
  }
  calendarData.value = data
}

const calculateStreak = (joinDate) => {
  if (!joinDate) return 0
  const join = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now - join)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const fetchUserStatistics = async () => {
  try {
    if (!userStore.userInfo?.id) return
    
    const solvedRes = await getSolvedProblemsCount(userStore.userInfo.id)
    if (solvedRes.code === 200) userStats.totalSolved = solvedRes.data
    
    const attemptedRes = await getAttemptedProblemsCount(userStore.userInfo.id)
    if (attemptedRes.code === 200) userStats.totalAttempted = attemptedRes.data
    
    userStats.streak = calculateStreak(userStore.userInfo.createdTime)
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
  }
}

const fetchUserPracticeRecords = async () => {
  try {
    if (!userStore.userInfo?.id) return
    
    const res = await getPracticeRecordsByUser(userStore.userInfo.id)
    if (res.code === 200) {
      solutions.value = res.data.map(record => ({
        id: record.id,
        problemTitle: record.subjectName || `题目ID: ${record.subjectId}`,
        categoryName: record.categoryName,
        language: 'Java',
        status: record.isCorrect === 1 ? 'accepted' : 'failed',
        runtime: record.timeCost ? `${record.timeCost * 1000}` : '0',
        memory: '0',
        submitTime: record.answerTime,
        errorType: record.isCorrect === 1 ? '' : '答案错误'
      }))
    }
  } catch (error) {
    console.error('获取刷题记录失败:', error)
  }
}

const editAvatar = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      ElMessage.error('请上传有效的图片格式')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过5MB')
      return
    }
    
    try {
      const loading = ElLoading.service({
        lock: true,
        text: '头像上传中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      const res = await fileApi.uploadImage(file, '用户头像')
      loading.close()
      
      if (res && res.code === 200 && res.data) {
        const fileUrl = res.data.filePath
        if (!fileUrl) {
          ElMessage.error('上传回复数据错误')
          return
        }
        
        const success = await userStore.updateUserInfo({
          id: userStore.userInfo?.id,
          avatar: fileUrl
        })
        
        if (success) {
          ElMessage.success('头像上传成功！')
          await refreshUserInfo()
        }
      } else {
        ElMessage.error(res?.message || '图片上传失败')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      ElMessage.error('头像上传失败')
    }
  }
  input.click()
}

const viewAvatar = () => {
  if (userStore.userAvatar) {
    previewImageUrl.value = userStore.userAvatar
    imagePreviewVisible.value = true
  } else {
    ElMessage.info('暂无头像可查看')
  }
}

const saveSettings = async () => {
  try {
    const userData = {
      id: userStore.userInfo?.id,
      nickName: settingsForm.nickname,
      email: settingsForm.email,
      sex: settingsForm.gender,
      introduce: settingsForm.bio
    }
    
    const success = await userStore.updateUserInfo(userData)
    if (success) {
      await refreshUserInfo()
      ElMessage.success('设置保存成功！')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

const refreshUserInfo = async () => {
  if (userStore.isLoggedIn && userStore.userInfo?.id) {
    try {
      await userStore.getUserInfo(userStore.userInfo.id)
      settingsForm.nickname = userStore.userName
      settingsForm.email = userStore.userInfo?.email || userInfo.email
      settingsForm.gender = userStore.userInfo?.sex !== undefined ? userStore.userInfo.sex : userInfo.gender
      settingsForm.bio = userStore.userInfo?.introduce || userInfo.bio
      
      userInfo.email = userStore.userInfo?.email || ''
      userInfo.gender = userStore.userInfo?.sex !== undefined ? userStore.userInfo.sex : undefined
      userInfo.joinDate = userStore.userInfo?.createdTime || ''
      userInfo.bio = userStore.userInfo?.introduce || ''
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
}

watch(() => userStore.isLoggedIn, (newVal) => {
  if (newVal) fetchUserPracticeRecords()
})

onMounted(() => {
  settingsForm.nickname = userStore.userName
  settingsForm.email = userStore.userInfo?.email || userInfo.email
  settingsForm.gender = userStore.userInfo?.sex !== undefined ? userStore.userInfo.sex : userInfo.gender
  settingsForm.bio = userStore.userInfo?.introduce || userInfo.bio
  
  userInfo.email = userStore.userInfo?.email || ''
  userInfo.gender = userStore.userInfo?.sex !== undefined ? userStore.userInfo.sex : undefined
  userInfo.joinDate = userStore.userInfo?.createdTime || ''
  userInfo.bio = userStore.userInfo?.introduce || ''
  
  generateCalendarData()
  refreshUserInfo()
  
  if (userStore.isLoggedIn) {
    fetchUserStatistics()
    fetchUserPracticeRecords()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.profile-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
}

.bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn, .home-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover, .home-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.5);
  color: #fff;
  transform: translateY(-1px);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.profile-main {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.profile-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 32px;
  align-items: start;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 100px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 28px;
}

.profile-card {
  text-align: center;
}

.avatar-section {
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  cursor: pointer;
}

.avatar-img, .avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: #fff;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #8b5cf6, #6366f1, #8b5cf6) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: ring-rotate 4s linear infinite;
}

@keyframes ring-rotate {
  to { transform: rotate(360deg); }
}

.change-avatar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  color: #a78bfa;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-1px);
}

.user-info {
  margin-bottom: 24px;
}

.user-nickname {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
}

.user-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px;
}

.user-email {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px;
}

.user-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.meta-tag {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.user-bio {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-card {
  text-align: center;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.stat-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px;
}

.card-title svg {
  color: #8b5cf6;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  background: rgba(139, 92, 246, 0.08);
  border-color: rgba(139, 92, 246, 0.2);
}

.achievement-item:not(.unlocked) {
  opacity: 0.5;
}

.achievement-item:hover {
  transform: translateX(4px);
  border-color: rgba(139, 92, 246, 0.3);
}

.achievement-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 10px;
  color: #a78bfa;
}

.achievement-content {
  flex: 1;
}

.achievement-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.achievement-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.achievement-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50%;
  font-size: 12px;
  color: #fff;
}

.profile-content {
  min-height: 600px;
}

.tabs-wrapper {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.tabs-content {
  padding: 28px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.filter-btn.active {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
  color: #a78bfa;
}

.solutions-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.solution-item {
  display: flex;
  gap: 16px;
  animation: slideIn 0.4s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.timeline-marker {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-marker.accepted {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.timeline-marker.failed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.solution-card {
  flex: 1;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.solution-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(139, 92, 246, 0.2);
  transform: translateX(4px);
}

.solution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.solution-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.solution-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.solution-status.accepted {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.solution-status.failed {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.solution-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.solution-metrics {
  display: flex;
  gap: 24px;
}

.metric {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #22c55e;
}

.metric-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.solution-error {
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}

.error-type {
  font-size: 13px;
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.stats-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px;
}

.difficulty-bars {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.difficulty-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.difficulty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.difficulty-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.difficulty-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.difficulty-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.difficulty-item.easy .difficulty-fill {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.difficulty-item.medium .difficulty-fill {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.difficulty-item.hard .difficulty-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.calendar-wrapper {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(53, 1fr);
  gap: 3px;
  margin-bottom: 16px;
}

.calendar-day {
  aspect-ratio: 1;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: fadeIn 0.3s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.calendar-day:hover {
  transform: scale(1.5);
  z-index: 1;
}

.calendar-day.level-0 { background: rgba(255, 255, 255, 0.03); }
.calendar-day.level-1 { background: rgba(139, 92, 246, 0.2); }
.calendar-day.level-2 { background: rgba(139, 92, 246, 0.4); }
.calendar-day.level-3 { background: rgba(139, 92, 246, 0.6); }
.calendar-day.level-4 { background: rgba(139, 92, 246, 0.8); }

.calendar-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.legend-colors {
  display: flex;
  gap: 3px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.level-0 { background: rgba(255, 255, 255, 0.03); }
.legend-color.level-1 { background: rgba(139, 92, 246, 0.2); }
.legend-color.level-2 { background: rgba(139, 92, 246, 0.4); }
.legend-color.level-3 { background: rgba(139, 92, 246, 0.6); }
.legend-color.level-4 { background: rgba(139, 92, 246, 0.8); }

.settings-panel {
  max-width: 600px;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.form-input, .form-textarea, .form-select {
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-select {
  cursor: pointer;
}

.form-select option {
  background: #1a1a2e;
  color: #fff;
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-item input {
  display: none;
}

.radio-item span {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.radio-item:hover {
  border-color: rgba(139, 92, 246, 0.3);
}

.radio-item.active {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
}

.radio-item.active span {
  color: #a78bfa;
}

.toggle-switch {
  width: 48px;
  height: 26px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: rgba(139, 92, 246, 0.3);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch.active .toggle-thumb {
  left: 25px;
  background: #8b5cf6;
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
  
  .profile-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .profile-header {
    padding: 16px 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .page-title {
    order: -1;
    width: 100%;
    text-align: center;
  }
  
  .profile-main {
    padding: 20px;
  }
  
  .tabs-header {
    flex-wrap: wrap;
  }
  
  .calendar-grid {
    grid-template-columns: repeat(26, 1fr);
  }
}
</style>
