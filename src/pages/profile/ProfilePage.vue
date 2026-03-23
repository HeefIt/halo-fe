<template>
  <div class="profile-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <header class="profile-header">
      <button class="header-btn" @click="router.back()">
        <span class="header-btn-icon">←</span>
        <span>返回</span>
      </button>

      <div class="header-title-group">
        <span class="header-kicker">PROFILE WORKSPACE</span>
        <h1 class="header-title">个人中心</h1>
      </div>

      <button class="header-btn" @click="router.push('/home')">
        <span class="header-btn-icon">⌂</span>
        <span>首页</span>
      </button>
    </header>

    <main class="profile-main">
      <section class="profile-top">
        <article class="section-shell identity-panel">
          <div class="identity-head">
            <span class="identity-label">当前账号</span>
            <div class="identity-tags">
              <span
                v-for="tag in roleTags"
                :key="tag"
                class="identity-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="identity-body">
            <div class="avatar-rail">
              <button class="avatar-shell" @click="viewAvatar">
                <img
                  v-if="userStore.userAvatar"
                  :src="userStore.userAvatar"
                  :alt="displayName"
                  class="avatar-image"
                />
                <div v-else class="avatar-fallback">{{ avatarText }}</div>
              </button>
              <button class="avatar-action" @click="editAvatar">更换头像</button>
            </div>

            <div class="identity-copy">
              <div class="identity-title-row">
                <h2 class="identity-name">{{ displayName }}</h2>
                <span class="identity-handle">@{{ currentUser.userName || 'halo-user' }}</span>
              </div>

              <div class="identity-meta">
                <span>{{ currentUser.email || '未绑定邮箱' }}</span>
                <span>{{ currentUser.phone || '未填写手机号' }}</span>
                <span>{{ currentUser.status === 1 ? '账号已禁用' : '账号正常' }}</span>
              </div>

              <p class="identity-intro">
                {{ currentUser.introduce || '还没有填写个人简介，可以补充你的学习方向、技术栈或最近目标。' }}
              </p>
            </div>
          </div>
        </article>

        <aside class="section-shell control-panel">
          <div class="panel-head">
            <h3 class="panel-title">偏好与操作</h3>
            <span class="panel-meta">{{ themeModeText }}</span>
          </div>

          <div class="theme-switcher">
            <button
              v-for="option in themeOptions"
              :key="option.value"
              class="theme-chip"
              :class="{ active: themeStore.themePreference === option.value }"
              @click="changeTheme(option.value)"
            >
              <span class="theme-chip-icon">{{ option.icon }}</span>
              <span>{{ option.label }}</span>
            </button>
          </div>

          <div class="action-stack">
            <button class="primary-btn" @click="activeTab = 'settings'">编辑资料</button>
            <button class="secondary-btn" @click="activeTab = 'activity'">查看动态</button>
          </div>

          <div class="status-list">
            <div class="status-row">
              <span>最近更新</span>
              <strong>{{ formatDateTime(currentUser.updateTime) || '暂无记录' }}</strong>
            </div>
            <div class="status-row">
              <span>登录邮箱</span>
              <strong>{{ currentUser.email || '未设置' }}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section class="stats-strip">
        <article
          v-for="item in summaryCards"
          :key="item.label"
          class="stat-item"
        >
          <span class="stat-label">{{ item.label }}</span>
          <strong class="stat-value">{{ item.value }}</strong>
          <span class="stat-meta">{{ item.meta }}</span>
        </article>
      </section>

      <nav class="tab-rail">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <section v-if="activeTab === 'overview'" class="content-grid overview-grid">
        <article class="section-shell info-panel">
          <div class="section-head">
            <div>
              <h3 class="section-title">基础信息</h3>
            </div>
          </div>

          <dl class="detail-grid">
            <div
              v-for="item in profileDetails"
              :key="item.label"
              class="detail-item"
            >
              <dt class="detail-label">{{ item.label }}</dt>
              <dd class="detail-value">{{ item.value }}</dd>
            </div>
          </dl>
        </article>

        <article class="section-shell insight-panel">
          <div class="section-head">
            <div>
              <h3 class="section-title">近期概览</h3>
            </div>
          </div>

          <div class="insight-block">
            <div class="insight-header">
              <span class="insight-label">刷题完成度</span>
              <strong class="insight-number">{{ solvedRate }}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: solvedRate + '%' }"></div>
            </div>
          </div>

          <div class="snapshot-list">
            <div class="snapshot-item">
              <span class="snapshot-label">最近练习时间</span>
              <strong class="snapshot-value">
                {{ practiceRecords[0] ? formatDateTime(practiceRecords[0].practiceDate) : '暂无记录' }}
              </strong>
            </div>
            <div class="snapshot-item">
              <span class="snapshot-label">最近发文时间</span>
              <strong class="snapshot-value">
                {{ blogArticles[0] ? formatDateTime(blogArticles[0].publishTime || blogArticles[0].createdTime) : '暂无文章' }}
              </strong>
            </div>
            <div class="snapshot-item">
              <span class="snapshot-label">今日练习得分</span>
              <strong class="snapshot-value">{{ stats.todayScore }}</strong>
            </div>
          </div>
        </article>
      </section>

      <section v-if="activeTab === 'activity'" class="content-grid activity-grid">
        <article class="section-shell list-panel">
          <div class="section-head">
            <div>
              <h3 class="section-title">最近练习会话</h3>
            </div>
            <button class="text-btn" @click="router.push('/practice-history')">查看全部</button>
          </div>

          <div v-if="practiceRecords.length" class="record-list">
            <button
              v-for="record in practiceRecords"
              :key="record.id"
              class="record-item"
              @click="router.push(`/practice-history/${record.id}`)"
            >
              <div class="record-main">
                <div class="record-title-row">
                  <strong>{{ record.title }}</strong>
                  <span class="status-pill" :class="{ success: record.status === 1, danger: record.status !== 1 }">
                    {{ record.status === 1 ? '已完成' : '进行中' }}
                  </span>
                </div>
                <div class="record-meta">
                  <span>{{ record.categoryName || '题库练习' }}</span>
                  <span>{{ formatDateTime(record.practiceDate) }}</span>
                  <span>{{ formatDuration(record.timeCost) }}</span>
                  <span>正确率 {{ record.accuracyRate }}%</span>
                </div>
              </div>
            </button>
          </div>
          <div v-else class="empty-state">暂无刷题记录，先去题库完成几道题吧。</div>
        </article>

        <article class="section-shell list-panel">
          <div class="section-head">
            <div>
              <h3 class="section-title">博客文章</h3>
            </div>
            <button class="text-btn" @click="router.push('/blog/write')">写文章</button>
          </div>

          <div v-if="blogArticles.length" class="article-list">
            <button
              v-for="article in blogArticles"
              :key="article.id"
              class="article-item"
              @click="router.push(`/blog/article/${article.id}`)"
            >
              <div class="article-main">
                <strong class="article-title">{{ article.title }}</strong>
                <p class="article-summary">{{ article.summary || '这篇文章还没有填写摘要。' }}</p>
              </div>
              <div class="article-meta">
                <span>{{ article.categoryName || '未分类' }}</span>
                <span>{{ article.viewCount || 0 }} 浏览</span>
                <span>{{ formatDate(article.publishTime || article.createdTime) }}</span>
              </div>
            </button>
          </div>
          <div v-else class="empty-state">还没有发布文章，可以从这里直接进入写作页面。</div>
        </article>
      </section>

      <section v-if="activeTab === 'settings'" class="content-grid settings-grid">
        <article class="section-shell settings-panel">
          <div class="section-head">
            <div>
              <h3 class="section-title">资料修改</h3>
            </div>
          </div>

          <form class="settings-form" @submit.prevent="saveProfile">
            <label class="field">
              <span class="field-label">昵称</span>
              <input v-model.trim="settingsForm.nickName" class="field-input" maxlength="20" placeholder="请输入昵称" />
            </label>

            <label class="field">
              <span class="field-label">用户名</span>
              <input :value="currentUser.userName || ''" class="field-input readonly" readonly />
            </label>

            <label class="field">
              <span class="field-label">邮箱</span>
              <input :value="currentUser.email || ''" class="field-input readonly" readonly />
            </label>

            <label class="field">
              <span class="field-label">手机号</span>
              <input v-model.trim="settingsForm.phone" class="field-input" maxlength="20" placeholder="请输入手机号" />
            </label>

            <label class="field">
              <span class="field-label">性别</span>
              <select v-model="settingsForm.sex" class="field-input">
                <option :value="null">未设置</option>
                <option :value="1">男</option>
                <option :value="2">女</option>
              </select>
            </label>

            <label class="field field-full">
              <span class="field-label">个人简介</span>
              <textarea
                v-model.trim="settingsForm.introduce"
                class="field-input field-textarea"
                maxlength="160"
                placeholder="介绍一下你正在学习的方向、关注的主题或近期目标"
              ></textarea>
            </label>

            <div class="form-footer">
              <div class="form-tip">主题切换会立即生效，并保存在浏览器本地。</div>
              <button type="submit" class="primary-btn" :disabled="savingProfile">
                {{ savingProfile ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </form>
        </article>

        <aside class="section-shell notes-panel">
          <div class="section-head">
            <div>
              <h3 class="section-title">当前设置</h3>
            </div>
          </div>

          <div class="note-list">
            <div class="note-item">
              <strong>主题模式</strong>
              <span>{{ themeModeText }}</span>
            </div>
            <div class="note-item">
              <strong>登录邮箱</strong>
              <span>{{ currentUser.email || '未设置' }}</span>
            </div>
            <div class="note-item">
              <strong>账号状态</strong>
              <span>{{ currentUser.status === 1 ? '已禁用' : '正常' }}</span>
            </div>
            <div class="note-item">
              <strong>上次更新</strong>
              <span>{{ formatDateTime(currentUser.updateTime) || '暂无记录' }}</span>
            </div>
          </div>
        </aside>
      </section>
    </main>

    <el-dialog v-model="imagePreviewVisible" title="头像预览" width="420px">
      <img :src="previewImageUrl" alt="头像预览" class="preview-image" />
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElLoading, ElMessage } from 'element-plus'
import { blogApi } from '@/api/modules/blog'
import { fileApi } from '@/api/modules/file'
import { getPracticeSessionPage } from '@/api/modules/question/practiceSession'
import {
  getAttemptedProblemsCount,
  getDailyStatistics,
  getSolvedProblemsCount
} from '@/api/modules/question/subject'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const activeTab = ref('overview')
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')
const savingProfile = ref(false)

const stats = reactive({
  solvedCount: 0,
  attemptedCount: 0,
  articleCount: 0,
  todayProblemCount: 0,
  todayAccuracy: 0,
  todayScore: 0
})

const practiceRecords = ref([])
const blogArticles = ref([])

const settingsForm = reactive({
  nickName: '',
  phone: '',
  sex: null,
  introduce: ''
})

const tabs = [
  { key: 'overview', label: '资料概览', icon: '◎' },
  { key: 'activity', label: '动态记录', icon: '◌' },
  { key: 'settings', label: '资料设置', icon: '⚙' }
]

const themeOptions = [
  { value: 'light', label: '浅色', icon: '☀' },
  { value: 'dark', label: '深色', icon: '☾' },
  { value: 'system', label: '系统', icon: '◐' }
]

/**
 * 当前登录用户资料。
 * 使用计算属性统一读取，避免模板里重复判空。
 */
const currentUser = computed(() => userStore.userInfo || {})

/**
 * 展示名优先用昵称，昵称为空时回退到用户名。
 */
const displayName = computed(() => currentUser.value.nickName || currentUser.value.userName || '学习者')

/**
 * 头像缺失时取用户名首字作为占位字符。
 */
const avatarText = computed(() => displayName.value.charAt(0).toUpperCase())

/**
 * 角色标签列表。
 * 后端返回多个角色时直接展示，普通用户默认展示基础标识。
 */
const roleTags = computed(() => {
  if (Array.isArray(currentUser.value.roleKeys) && currentUser.value.roleKeys.length) {
    return currentUser.value.roleKeys.map(formatRoleLabel)
  }
  return ['普通用户']
})

/**
 * 当前主题模式的文案说明。
 */
const themeModeText = computed(() => {
  const map = {
    light: '浅色模式',
    dark: '深色模式',
    system: '跟随系统'
  }
  return map[themeStore.themePreference] || '跟随系统'
})

/**
 * 个人中心顶部统计卡片。
 * 全部来自真实接口数据，不再展示演示型随机指标。
 */
const summaryCards = computed(() => [
  {
    label: '已解决题目',
    value: stats.solvedCount,
    meta: `共尝试 ${stats.attemptedCount} 题`
  },
  {
    label: '今日练习',
    value: stats.todayProblemCount,
    meta: `正确率 ${stats.todayAccuracy}%`
  },
  {
    label: '博客文章',
    value: stats.articleCount,
    meta: '个人创作总数'
  },
  {
    label: '今日得分',
    value: stats.todayScore,
    meta: '来自今日练习统计'
  }
])

/**
 * 基础资料区使用的展示字段。
 * 只展示适合用户查看的非敏感信息。
 */
const profileDetails = computed(() => [
  { label: '用户 ID', value: currentUser.value.id || '--' },
  { label: '用户名', value: currentUser.value.userName || '--' },
  { label: '昵称', value: currentUser.value.nickName || '--' },
  { label: '邮箱', value: currentUser.value.email || '--' },
  { label: '手机号', value: currentUser.value.phone || '--' },
  { label: '性别', value: formatSex(currentUser.value.sex) },
  { label: '账号状态', value: currentUser.value.status === 1 ? '已禁用' : '正常' },
  { label: '注册时间', value: formatDateTime(currentUser.value.createdTime) || '--' },
  { label: '最近更新', value: formatDateTime(currentUser.value.updateTime) || '--' }
])

/**
 * 解题完成率。
 * 使用已解决 / 已尝试计算，避免展示没有业务意义的假进度。
 */
const solvedRate = computed(() => {
  if (!stats.attemptedCount) {
    return 0
  }
  return Math.min(100, Math.round((stats.solvedCount / stats.attemptedCount) * 100))
})

/**
 * 切换主题模式。
 * 主题立即落到全局 html 节点，不需要额外点击保存。
 */
const changeTheme = (mode) => {
  themeStore.setThemePreference(mode)
}

/**
 * 预览头像。
 * 已上传头像时通过弹窗放大查看。
 */
const viewAvatar = () => {
  if (!userStore.userAvatar) {
    ElMessage.info('当前还没有头像可预览')
    return
  }

  previewImageUrl.value = userStore.userAvatar
  imagePreviewVisible.value = true
}

/**
 * 上传头像并立即同步到当前用户资料。
 * 这里保留了原有上传逻辑，只是挪到新的页面结构中继续复用。
 */
const editAvatar = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      ElMessage.error('请上传 jpg、png、gif 或 webp 图片')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('头像大小不能超过 5MB')
      return
    }

    const loading = ElLoading.service({
      lock: true,
      text: '头像上传中...',
      background: 'rgba(15, 23, 42, 0.32)'
    })

    try {
      const response = await fileApi.uploadImage(file, '用户头像')
      const fileUrl = response?.data?.filePath

      if (!response || response.code !== 200 || !fileUrl) {
        ElMessage.error(response?.message || '头像上传失败')
        return
      }

      const success = await userStore.updateUserInfo({
        id: currentUser.value.id,
        avatar: fileUrl
      })

      if (success) {
        await refreshUserInfo()
        ElMessage.success('头像更新成功')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      ElMessage.error('头像上传失败，请稍后重试')
    } finally {
      loading.close()
    }
  }

  input.click()
}

/**
 * 保存资料修改。
 * 第一版只开放昵称、手机号、性别和简介，避免影响邮箱登录链路。
 */
const saveProfile = async () => {
  if (!currentUser.value.id) {
    ElMessage.error('当前用户信息不存在，无法保存')
    return
  }

  if (!settingsForm.nickName) {
    ElMessage.warning('昵称不能为空')
    return
  }

  savingProfile.value = true
  try {
    const success = await userStore.updateUserInfo({
      id: currentUser.value.id,
      nickName: settingsForm.nickName,
      phone: settingsForm.phone,
      sex: settingsForm.sex,
      introduce: settingsForm.introduce
    })

    if (success) {
      await refreshUserInfo()
      ElMessage.success('个人资料已更新')
    }
  } catch (error) {
    console.error('保存资料失败:', error)
    ElMessage.error('保存资料失败，请稍后重试')
  } finally {
    savingProfile.value = false
  }
}

/**
 * 刷新当前用户资料，并同步到表单。
 * 这样能保证页面展示和编辑表单使用的是同一份最新数据。
 */
const refreshUserInfo = async () => {
  if (!currentUser.value.id) {
    return
  }

  await userStore.getUserInfo(currentUser.value.id)
  syncSettingsForm()
}

/**
 * 拉取统计数据。
 * 将刷题总量、今日数据拆开加载，保持个人中心展示口径一致。
 */
const fetchStatistics = async () => {
  if (!currentUser.value.id) {
    return
  }

  try {
    const [solvedRes, attemptedRes, dailyRes] = await Promise.all([
      getSolvedProblemsCount(currentUser.value.id),
      getAttemptedProblemsCount(currentUser.value.id),
      getDailyStatistics(currentUser.value.id)
    ])

    if (solvedRes?.code === 200) {
      stats.solvedCount = solvedRes.data || 0
    }

    if (attemptedRes?.code === 200) {
      stats.attemptedCount = attemptedRes.data || 0
    }

    if (dailyRes?.code === 200 && dailyRes.data) {
      stats.todayProblemCount = dailyRes.data.problemCount || 0
      stats.todayAccuracy = dailyRes.data.accuracy || 0
      stats.todayScore = dailyRes.data.totalScore || 0
    }
  } catch (error) {
    console.error('获取个人统计失败:', error)
  }
}

/**
 * 拉取最近练习会话。
 * 只保留最新几条，保证个人中心内容紧凑。
 */
const fetchPracticeRecords = async () => {
  if (!currentUser.value.id) {
    return
  }

  try {
    const response = await getPracticeSessionPage({
      pageNo: 1,
      pageSize: 6
    })
    if (response?.code !== 200) {
      practiceRecords.value = []
      return
    }

    practiceRecords.value = (response.data?.result || []).map((item) => ({
      id: item.id,
      title: item.subjectType === 0 ? '混合练习' : `${formatSubjectType(item.subjectType)}专项练习`,
      status: Number(item.status ?? 0),
      categoryName: item.categoryNameSnapshot || '',
      practiceDate: item.completedTime || item.lastAnswerTime || item.startedTime,
      timeCost: Number(item.totalTime ?? 0),
      accuracyRate: Math.round(Number(item.accuracyRate ?? 0))
    }))
  } catch (error) {
    console.error('获取刷题记录失败:', error)
    practiceRecords.value = []
  }
}

/**
 * 拉取当前用户的博客文章。
 * 直接按 authorId 过滤，避免再新增额外聚合接口。
 */
const fetchBlogArticles = async () => {
  if (!currentUser.value.id) {
    return
  }

  try {
    const response = await blogApi.getArticlePage({
      pageNum: 1,
      pageSize: 6,
      authorId: currentUser.value.id
    })

    if (response?.code !== 200) {
      blogArticles.value = []
      stats.articleCount = 0
      return
    }

    blogArticles.value = response.data?.result || []
    stats.articleCount = response.data?.total || 0
  } catch (error) {
    console.error('获取个人文章失败:', error)
    blogArticles.value = []
    stats.articleCount = 0
  }
}

/**
 * 将最新的用户资料同步到设置表单中。
 */
const syncSettingsForm = () => {
  settingsForm.nickName = currentUser.value.nickName || ''
  settingsForm.phone = currentUser.value.phone || ''
  settingsForm.sex = currentUser.value.sex ?? null
  settingsForm.introduce = currentUser.value.introduce || ''
}

/**
 * 初始化个人中心数据。
 * 将资料刷新、统计、博客和刷题记录一起加载，减少页面分散请求的时序问题。
 */
const initializeProfile = async () => {
  if (!currentUser.value.id && userStore.isLoggedIn) {
    await userStore.initUser()
  }

  if (!currentUser.value.id) {
    return
  }

  await refreshUserInfo()
  await Promise.all([fetchStatistics(), fetchPracticeRecords(), fetchBlogArticles()])
}

/**
 * 格式化日期。
 */
function formatDate(value) {
  if (!value) {
    return ''
  }
  return new Date(value).toLocaleDateString('zh-CN')
}

/**
 * 格式化日期时间。
 */
function formatDateTime(value) {
  if (!value) {
    return ''
  }
  return new Date(value).toLocaleString('zh-CN')
}

/**
 * 将秒数转成更易读的耗时文案。
 */
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) {
    return '耗时未知'
  }
  if (seconds < 60) {
    return `${seconds} 秒`
  }

  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return remainSeconds ? `${minutes} 分 ${remainSeconds} 秒` : `${minutes} 分钟`
}

/**
 * 性别展示文案。
 */
function formatSex(value) {
  if (value === 1) {
    return '男'
  }
  if (value === 2) {
    return '女'
  }
  return '未设置'
}

/**
 * 将后端角色标识转换为更友好的中文标签。
 */
function formatRoleLabel(roleKey) {
  if (roleKey === 'admin_user') {
    return '管理员'
  }
  if (roleKey === 'normal_user') {
    return '普通用户'
  }
  return roleKey
}

/**
 * 将题型值转成更友好的展示文案。
 */
function formatSubjectType(value) {
  const map = {
    0: '混合题型',
    1: '单选题',
    2: '多选题',
    3: '判断题',
    4: '简答题'
  }
  return map[value] || '练习'
}

onMounted(() => {
  initializeProfile()
})
</script>

<style scoped>
.profile-page {
  --profile-bg: #f4f6fa;
  --profile-surface: #ffffff;
  --profile-surface-alt: #f8fafc;
  --profile-surface-hover: #eef2f7;
  --profile-surface-muted: #f1f5f9;
  --profile-text: var(--text-1, #0f172a);
  --profile-text-soft: var(--text-2, #475569);
  --profile-text-faint: var(--text-3, #64748b);
  --profile-border: rgba(15, 23, 42, 0.1);
  --profile-line: rgba(15, 23, 42, 0.06);
  --profile-accent: #1d4ed8;
  --profile-accent-soft: rgba(29, 78, 216, 0.08);
  --profile-accent-line: rgba(29, 78, 216, 0.18);
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(29, 78, 216, 0.06), transparent 24%),
    radial-gradient(circle at top right, rgba(15, 23, 42, 0.04), transparent 26%),
    var(--profile-bg);
  color: var(--profile-text);
}

.profile-page.is-dark {
  --profile-bg: #09111f;
  --profile-surface: #0f172a;
  --profile-surface-alt: #111c31;
  --profile-surface-hover: #162338;
  --profile-surface-muted: #0c1628;
  --profile-text: var(--text-1);
  --profile-text-soft: var(--text-2);
  --profile-text-faint: var(--text-3);
  --profile-border: rgba(148, 163, 184, 0.14);
  --profile-line: rgba(148, 163, 184, 0.1);
  --profile-accent: #60a5fa;
  --profile-accent-soft: rgba(96, 165, 250, 0.12);
  --profile-accent-line: rgba(96, 165, 250, 0.24);
}

.profile-header,
.profile-main {
  max-width: 1260px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.header-title-group {
  text-align: center;
}

.header-kicker {
  display: block;
  margin-bottom: 4px;
  color: var(--profile-text-faint);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.header-title {
  margin: 0;
  font-size: clamp(28px, 4vw, 38px);
  line-height: 1;
  letter-spacing: -0.03em;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--profile-border);
  background: var(--profile-surface);
  color: var(--profile-text);
  font-size: 13px;
  font-weight: 700;
  border-radius: 14px;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.header-btn:hover,
.theme-chip:hover,
.tab-btn:hover,
.record-item:hover,
.article-item:hover,
.text-btn:hover {
  background: var(--profile-surface-hover);
}

.header-btn-icon {
  font-size: 16px;
}

.profile-main {
  display: grid;
  gap: 18px;
}

.section-shell {
  background: var(--profile-surface);
  border: 1px solid var(--profile-border);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset;
}

.profile-top {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
  gap: 16px;
  align-items: start;
}

.identity-panel {
  position: relative;
  padding: 22px 24px 20px;
  border-radius: 22px 22px 18px 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.94)),
    var(--profile-surface);
  overflow: hidden;
}

.profile-page.is-dark .identity-panel {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94)),
    var(--profile-surface);
}

.identity-panel::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 96px;
  background: linear-gradient(135deg, var(--profile-accent-soft), transparent 70%);
  pointer-events: none;
}

.identity-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--profile-line);
}

.identity-label,
.stat-label,
.detail-label,
.snapshot-label,
.field-label {
  color: var(--profile-text-faint);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.identity-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.identity-tag {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 8px;
  border: 1px solid var(--profile-border);
  background: var(--profile-surface-muted);
  color: var(--profile-text-soft);
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.identity-body {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  padding-top: 16px;
}

.avatar-rail {
  display: grid;
  gap: 10px;
}

.avatar-shell {
  width: 96px;
  height: 96px;
  overflow: hidden;
  border: 1px solid var(--profile-border);
  background: var(--profile-surface-alt);
  border-radius: 20px;
}

.avatar-image,
.avatar-fallback {
  width: 100%;
  height: 100%;
}

.avatar-image {
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 34px;
  font-weight: 800;
}

.avatar-action,
.text-btn,
.tab-btn,
.theme-chip,
.primary-btn,
.secondary-btn {
  font: inherit;
}

.avatar-action {
  min-height: 34px;
  border: 1px solid var(--profile-border);
  background: transparent;
  color: var(--profile-text-soft);
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
}

.identity-title-row {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
}

.identity-name {
  margin: 0;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.identity-handle {
  color: var(--profile-text-faint);
  font-size: 14px;
  font-weight: 600;
}

.identity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 10px;
  color: var(--profile-text-soft);
  font-size: 13px;
}

.identity-intro {
  margin: 18px 0 0;
  max-width: 700px;
  color: var(--profile-text-soft);
  font-size: 15px;
  line-height: 1.75;
}

.control-panel {
  display: grid;
  gap: 14px;
  padding: 18px;
  align-content: start;
  background: linear-gradient(180deg, var(--profile-surface-alt), var(--profile-surface));
  border-radius: 18px;
}

.panel-head,
.section-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.panel-title,
.section-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
}

.panel-meta,
.section-desc,
.form-tip {
  color: var(--profile-text-soft);
  font-size: 13px;
}

.section-desc {
  margin: 6px 0 0;
  line-height: 1.6;
}

.theme-switcher {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.theme-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid var(--profile-border);
  background: var(--profile-surface);
  color: var(--profile-text-soft);
  font-size: 13px;
  font-weight: 700;
  border-radius: 12px;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.theme-chip.active {
  border-color: var(--profile-accent-line);
  background: var(--profile-accent-soft);
  color: var(--profile-accent);
}

.action-stack {
  display: grid;
  gap: 8px;
}

.primary-btn,
.secondary-btn,
.text-btn {
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--profile-border);
  background: transparent;
  color: var(--profile-text);
  font-size: 13px;
  font-weight: 700;
  border-radius: 12px;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.primary-btn {
  border-color: var(--profile-accent);
  background: var(--profile-accent);
  color: #ffffff;
}

.primary-btn:hover {
  background: #1e40af;
  border-color: #1e40af;
}

.status-list {
  display: grid;
  gap: 8px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--profile-line);
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--profile-text-soft);
  font-size: 13px;
}

.status-row strong {
  color: var(--profile-text);
  font-size: 13px;
  text-align: right;
}

.stats-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) repeat(3, minmax(0, 1fr));
  border: 1px solid var(--profile-border);
  background: var(--profile-surface);
  border-radius: 20px;
  overflow: hidden;
}

.stat-item {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-right: 1px solid var(--profile-line);
}

.stat-item:first-child {
  background: linear-gradient(135deg, var(--profile-accent-soft), transparent 70%);
}

.stat-item:last-child {
  border-right: none;
}

.stat-value {
  font-size: clamp(28px, 3vw, 38px);
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.stat-meta {
  color: var(--profile-text-soft);
  font-size: 13px;
}

.tab-rail {
  display: inline-flex;
  gap: 8px;
  width: fit-content;
  padding: 6px;
  background: var(--profile-surface-alt);
  border: 1px solid var(--profile-border);
  border-radius: 16px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--profile-text-soft);
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
}

.tab-btn.active {
  color: var(--profile-text);
  background: var(--profile-surface);
  border-color: var(--profile-border);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset;
}

.content-grid {
  display: grid;
  gap: 16px;
}

.overview-grid {
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.82fr);
}

.activity-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.settings-grid {
  grid-template-columns: minmax(0, 1.38fr) minmax(300px, 0.82fr);
}

.info-panel,
.insight-panel,
.list-panel,
.settings-panel,
.notes-panel {
  padding: 20px;
}

.info-panel {
  border-radius: 20px 16px 18px 18px;
}

.insight-panel {
  border-radius: 16px 20px 18px 18px;
  background: linear-gradient(180deg, var(--profile-surface), var(--profile-surface-alt));
}

.list-panel {
  border-radius: 18px;
}

.settings-panel {
  border-radius: 22px 16px 18px 18px;
}

.notes-panel {
  border-radius: 16px 22px 18px 18px;
  background: linear-gradient(180deg, var(--profile-surface-alt), var(--profile-surface));
}

.detail-grid {
  display: grid;
  gap: 0;
  margin: 0;
}

.detail-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 18px;
  padding: 13px 0;
  border-bottom: 1px solid var(--profile-line);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-value {
  margin: 0;
  color: var(--profile-text);
  font-size: 14px;
  line-height: 1.6;
}

.insight-block {
  padding: 14px 0 18px;
  border-bottom: 1px solid var(--profile-line);
}

.insight-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
}

.insight-label {
  color: var(--profile-text-faint);
  font-size: 12px;
  font-weight: 700;
}

.insight-number {
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.03em;
}

.progress-track {
  width: 100%;
  height: 8px;
  margin-top: 10px;
  background: var(--profile-surface-alt);
  overflow: hidden;
  border-radius: 999px;
}

.progress-fill {
  height: 100%;
  background: var(--profile-accent);
  border-radius: 999px;
}

.insight-foot {
  margin: 10px 0 0;
  color: var(--profile-text-soft);
  font-size: 13px;
}

.snapshot-list {
  display: grid;
  gap: 0;
}

.snapshot-item {
  display: grid;
  gap: 6px;
  padding: 14px 0;
  border-bottom: 1px solid var(--profile-line);
}

.snapshot-item:last-child {
  border-bottom: none;
}

.snapshot-value {
  color: var(--profile-text);
  font-size: 15px;
  line-height: 1.55;
}

.record-list,
.article-list,
.note-list {
  display: grid;
  gap: 10px;
}

.record-item,
.article-item {
  width: 100%;
  padding: 14px 12px;
  border: none;
  border-bottom: 1px solid var(--profile-line);
  background: transparent;
  text-align: left;
  border-radius: 12px;
}

.record-item:last-child,
.article-item:last-child {
  border-bottom: none;
}

.record-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.record-meta,
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 10px;
  color: var(--profile-text-soft);
  font-size: 13px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border: 1px solid var(--profile-border);
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
}

.status-pill.success {
  color: #059669;
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.16);
}

.status-pill.danger {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.16);
}

.profile-page.is-dark .status-pill.success {
  color: #86efac;
}

.profile-page.is-dark .status-pill.danger {
  color: #fdba74;
}

.article-title {
  display: block;
  font-size: 16px;
  line-height: 1.5;
}

.article-summary {
  margin: 8px 0 0;
  color: var(--profile-text-soft);
  font-size: 14px;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  padding: 20px 0;
  color: var(--profile-text-soft);
  font-size: 14px;
}

.settings-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-full {
  grid-column: 1 / -1;
}

.field-input {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--profile-border);
  background: var(--profile-surface-alt);
  color: var(--profile-text);
  font: inherit;
  outline: none;
  border-radius: 12px;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.field-input:focus {
  border-color: var(--profile-accent-line);
  background: var(--profile-surface);
}

.readonly {
  color: var(--profile-text-soft);
}

.field-textarea {
  min-height: 128px;
  padding: 12px;
  resize: vertical;
}

.form-footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 6px;
}

.note-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--profile-line);
}

.note-item:last-child {
  border-bottom: none;
}

.note-item strong {
  color: var(--profile-text-faint);
  font-size: 13px;
}

.note-item span {
  color: var(--profile-text);
  font-size: 13px;
  text-align: right;
}

.preview-image {
  width: 100%;
  object-fit: cover;
  border: 1px solid var(--profile-border);
  border-radius: 16px;
}

@media (max-width: 1080px) {
  .profile-page {
    padding: 18px;
  }

  .profile-top,
  .overview-grid,
  .activity-grid,
  .settings-grid,
  .stats-strip {
    grid-template-columns: 1fr;
  }

  .stat-item {
    border-right: none;
    border-bottom: 1px solid var(--profile-line);
  }

  .stat-item:last-child {
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-wrap: wrap;
    justify-content: center;
  }

  .identity-body,
  .settings-form {
    grid-template-columns: 1fr;
  }

  .tab-rail {
    display: grid;
    width: 100%;
  }

  .tab-btn {
    justify-content: flex-start;
    border-right: none;
    border-bottom: none;
  }

  .form-footer,
  .note-item,
  .record-title-row,
  .status-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .note-item span,
  .status-row strong {
    text-align: left;
  }
}
</style>
