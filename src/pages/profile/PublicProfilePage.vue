<template>
  <div class="public-profile-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <Header />

    <main class="profile-main">
      <div class="back-row">
        <button type="button" class="back-btn" @click="goBack()">{{ backLabel }}</button>
      </div>

      <section v-if="profile" class="hero-panel">
        <div class="hero-main">
          <div class="identity-block">
            <img v-if="profile.avatar" :src="profile.avatar" :alt="displayName" class="hero-avatar" />
            <div v-else class="hero-avatar hero-avatar--fallback">{{ displayName.charAt(0).toUpperCase() }}</div>

            <div class="identity-copy">
              <div class="identity-title-row">
                <h1>{{ displayName }}</h1>
                <span class="identity-handle">@{{ profile.userName || 'unknown' }}</span>
              </div>
              <div class="identity-tags">
                <span v-for="tag in roleTags" :key="tag" class="identity-tag">{{ tag }}</span>
              </div>
              <p class="identity-intro">{{ profile.introduce || '这个用户还没有填写个人简介。' }}</p>
            </div>
          </div>

          <div class="hero-aside">
            <div class="summary-item">
              <span>注册时间</span>
              <strong>{{ formatDate(profile.createdTime) || '--' }}</strong>
            </div>
            <div class="summary-item">
              <span>最近更新</span>
              <strong>{{ formatDateTime(profile.updateTime) || '--' }}</strong>
            </div>
            <div class="summary-item">
              <span>账号状态</span>
              <strong>{{ profile.status === 1 ? '已禁用' : '正常' }}</strong>
            </div>
          </div>
        </div>

        <div class="hero-metrics">
          <button type="button" class="metric-card" @click="scrollToSection(blogSectionRef)">
            <span>已发布博客</span>
            <strong>{{ totalArticles }}</strong>
            <small>继续读 TA 写过的文章</small>
          </button>
          <button type="button" class="metric-card" @click="scrollToSection(momentSectionRef)">
            <span>社区动态</span>
            <strong>{{ totalMoments }}</strong>
            <small>查看最近的讨论和更新</small>
          </button>
          <div class="metric-card metric-card--info">
            <span>公开资料</span>
            <strong>{{ profile.email || '--' }}</strong>
            <small>只展示公开可见的信息</small>
          </div>
        </div>
      </section>

      <div class="profile-layout">
        <section class="content-column">
          <section ref="blogSectionRef" class="content-panel">
            <div class="panel-head">
              <div>
                <p class="panel-eyebrow">Blog Archive</p>
                <h2>TA 的博客</h2>
              </div>
              <div class="panel-actions">
                <span>{{ recentBlogs.length }} / {{ totalArticles }} 篇</span>
                <button
                  v-if="totalArticles > 0"
                  type="button"
                  class="panel-link"
                  @click="goToAllBlogs"
                >
                  查看全部
                </button>
              </div>
            </div>

            <div v-if="loading" class="empty-state">
              <strong>资料加载中</strong>
              <span>正在整理博客与动态内容。</span>
            </div>

            <template v-else-if="recentBlogs.length">
              <article
                v-for="blog in recentBlogs"
                :key="blog.id"
                class="blog-entry"
                @click="goToArticle(blog.id)"
              >
                <div class="blog-cover" :class="{ 'blog-cover--placeholder': !blog.coverImage }">
                  <img v-if="blog.coverImage" :src="blog.coverImage" :alt="getDisplayTitle(blog.title)" />
                  <span v-else>{{ blog.categoryName || '博客' }}</span>
                </div>

                <div class="blog-main">
                  <div class="blog-meta">
                    <span class="meta-chip">{{ blog.categoryName || '未分类' }}</span>
                    <span>{{ formatDate(blog.publishTime) || '待发布' }}</span>
                    <span>{{ formatNumber(blog.viewCount) }} 阅读</span>
                  </div>
                  <h3>{{ getDisplayTitle(blog.title) }}</h3>
                  <p>{{ getSummaryPreview(blog.summary) || '这篇文章还没有摘要。' }}</p>
                  <div class="blog-foot">
                    <span>点赞 {{ formatNumber(blog.likeCount) }}</span>
                    <span>评论 {{ formatNumber(blog.commentCount) }}</span>
                  </div>
                </div>

                <div class="entry-actions">
                  <button
                    v-if="isOwnProfile"
                    type="button"
                    class="inline-action"
                    @click.stop="goToEditArticle(blog.id)"
                  >
                    编辑
                  </button>
                  <span class="entry-arrow">查看文章</span>
                </div>
              </article>

              <div v-if="hasMoreBlogs" class="load-more-row">
                <button type="button" class="load-more-btn" :disabled="blogLoadingMore" @click="loadMoreBlogs">
                  {{ blogLoadingMore ? '加载中...' : '加载更多博客' }}
                </button>
              </div>
            </template>

            <div v-else class="empty-state">
              <strong>还没有公开博客</strong>
              <span>等 TA 发布文章后，这里会出现最近更新的内容。</span>
            </div>
          </section>

          <section ref="momentSectionRef" class="content-panel">
            <div class="panel-head">
              <div>
                <p class="panel-eyebrow">Community Feed</p>
                <h2>TA 的社区动态</h2>
              </div>
              <div class="panel-actions">
                <span>{{ momentList.length }} / {{ totalMoments }} 条</span>
              </div>
            </div>

            <div v-if="loading" class="empty-state">
              <strong>资料加载中</strong>
              <span>正在整理最近的社区动态。</span>
            </div>

            <template v-else-if="momentList.length">
              <article v-for="moment in momentList" :key="moment.id" class="moment-entry" @click="goToMoment(moment.id)">
                <div class="moment-top">
                  <span class="circle-badge">
                    <span class="circle-badge__visual" :class="{ 'is-image': isCircleImage(moment.circleIcon) }">
                      <img
                        v-if="isCircleImage(moment.circleIcon)"
                        :src="moment.circleIcon"
                        :alt="moment.circleName || '圈子'"
                        class="circle-badge__image"
                      />
                      <span v-else class="circle-badge__emoji">{{ getCircleVisualText(moment.circleIcon, moment.circleName) }}</span>
                    </span>
                    <span>{{ moment.circleName || '默认圈子' }}</span>
                  </span>
                  <span class="moment-time">{{ formatDateTime(moment.createdTime) }}</span>
                </div>
                <p class="moment-content">{{ moment.content || '分享了一张图片' }}</p>
                <div v-if="moment.pictures?.length" class="moment-grid">
                  <img
                    v-for="(picture, index) in moment.pictures.slice(0, 3)"
                    :key="`${moment.id}-${index}`"
                    :src="picture"
                    :alt="`${displayName} 的动态图片`"
                    class="moment-grid__image"
                  />
                </div>
                <div class="moment-foot">
                  <span>评论 {{ moment.commentCount || 0 }}</span>
                  <span>进入讨论</span>
                </div>
              </article>

              <div v-if="hasMoreMoments" class="load-more-row">
                <button type="button" class="load-more-btn" :disabled="momentLoadingMore" @click="loadMoreMoments">
                  {{ momentLoadingMore ? '加载中...' : '加载更多动态' }}
                </button>
              </div>
            </template>

            <div v-else class="empty-state">
              <strong>还没有公开动态</strong>
              <span>等 TA 在圈子里发新内容后，这里会同步展示。</span>
            </div>
          </section>
        </section>

        <aside class="side-column">
          <section class="side-panel">
            <div class="panel-head panel-head--compact">
              <h3>内容导航</h3>
            </div>
            <div class="nav-list">
              <button type="button" class="nav-item" @click="scrollToSection(blogSectionRef)">
                <span>博客列表</span>
                <strong>{{ totalArticles }}</strong>
              </button>
              <button type="button" class="nav-item" @click="scrollToSection(momentSectionRef)">
                <span>动态列表</span>
                <strong>{{ totalMoments }}</strong>
              </button>
              <button
                v-if="totalArticles > 0"
                type="button"
                class="nav-item nav-item--link"
                @click="goToAllBlogs"
              >
                <span>查看全部博客</span>
                <strong>进入列表</strong>
              </button>
            </div>
          </section>

          <section class="side-panel">
            <div class="panel-head panel-head--compact">
              <h3>资料信息</h3>
            </div>
            <div v-if="profile" class="info-list">
              <div class="info-row">
                <span>昵称</span>
                <strong>{{ profile.nickName || '--' }}</strong>
              </div>
              <div class="info-row">
                <span>用户名</span>
                <strong>{{ profile.userName || '--' }}</strong>
              </div>
              <div class="info-row">
                <span>邮箱</span>
                <strong>{{ profile.email || '--' }}</strong>
              </div>
              <div class="info-row">
                <span>最近更新</span>
                <strong>{{ formatDateTime(profile.updateTime) || '--' }}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '@/layouts/AppHeader.vue'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'
import { authApi } from '@/api/modules/auth'
import { shareApi } from '@/api/modules/share'
import { blogApi } from '@/api/modules/blog'
import { useSmartBack } from '@/composables/useSmartBack'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const { backLabel, goBack } = useSmartBack(route, router, { fallback: '/home' })

const loading = ref(false)
const blogLoadingMore = ref(false)
const momentLoadingMore = ref(false)
const profile = ref(null)
const momentList = ref([])
const recentBlogs = ref([])
const totalMoments = ref(0)
const totalBlogRecords = ref(0)

const blogPageNum = ref(0)
const momentPageNum = ref(0)
const blogPageSize = 6
const momentPageSize = 6

const blogSectionRef = ref(null)
const momentSectionRef = ref(null)

const displayName = computed(() => profile.value?.nickName || profile.value?.userName || '用户')
const totalArticles = computed(() => Number(profile.value?.articleCount) || totalBlogRecords.value || recentBlogs.value.length || 0)
const isOwnProfile = computed(() => Number(userStore.userId) === Number(route.params.id))
const hasMoreBlogs = computed(() => recentBlogs.value.length < totalArticles.value)
const hasMoreMoments = computed(() => momentList.value.length < totalMoments.value)

const roleTags = computed(() => {
  const roleKeys = profile.value?.roleKeys || []
  if (!roleKeys.length) return ['普通用户']
  return roleKeys.map(roleKey => {
    if (roleKey === 'admin_user') return '管理员'
    if (roleKey === 'normal_user') return '普通用户'
    return roleKey
  })
})

const loadBlogs = async ({ reset = false } = {}) => {
  const targetPage = reset ? 1 : blogPageNum.value + 1
  if (!reset) {
    blogLoadingMore.value = true
  }

  try {
    const blogResponse = await blogApi.getArticlePage({
      authorId: route.params.id,
      pageNum: targetPage,
      pageSize: blogPageSize
    })

    if (blogResponse?.code !== 200) {
      throw new Error(blogResponse?.message || '获取用户博客失败')
    }

    const nextList = blogResponse.data?.result || []
    totalBlogRecords.value = blogResponse.data?.total || 0
    recentBlogs.value = reset ? nextList : [...recentBlogs.value, ...nextList]
    blogPageNum.value = targetPage
  } finally {
    if (!reset) {
      blogLoadingMore.value = false
    }
  }
}

const loadMoments = async ({ reset = false } = {}) => {
  const targetPage = reset ? 1 : momentPageNum.value + 1
  if (!reset) {
    momentLoadingMore.value = true
  }

  try {
    const momentResponse = await shareApi.getMomentPage({
      userId: route.params.id,
      pageNum: targetPage,
      pageSize: momentPageSize
    })

    if (momentResponse?.code !== 200) {
      throw new Error(momentResponse?.message || '获取用户动态失败')
    }

    const nextList = momentResponse.data?.result || []
    totalMoments.value = momentResponse.data?.total || 0
    momentList.value = reset ? nextList : [...momentList.value, ...nextList]
    momentPageNum.value = targetPage
  } finally {
    if (!reset) {
      momentLoadingMore.value = false
    }
  }
}

const loadProfile = async () => {
  if (!route.params.id) {
    ElMessage.error('用户 ID 不存在')
    router.push('/home')
    return
  }

  blogLoadingMore.value = false
  momentLoadingMore.value = false
  recentBlogs.value = []
  momentList.value = []
  totalMoments.value = 0
  totalBlogRecords.value = 0
  blogPageNum.value = 0
  momentPageNum.value = 0
  try {
    const profileResponse = await authApi.getUserInfo(route.params.id)

    if (profileResponse?.code !== 200) {
      throw new Error(profileResponse?.message || '获取用户资料失败')
    }

    profile.value = profileResponse.data

    await Promise.all([
      loadMoments({ reset: true }),
      loadBlogs({ reset: true })
    ])
  } catch (error) {
    console.error('加载公开用户资料失败:', error)
    ElMessage.error(error.message || '加载用户资料失败')
  } finally {
    loading.value = false
  }
}

const loadMoreBlogs = async () => {
  if (!hasMoreBlogs.value || blogLoadingMore.value) return
  try {
    await loadBlogs()
  } catch (error) {
    console.error('加载更多博客失败:', error)
    ElMessage.error(error.message || '加载更多博客失败')
  }
}

const loadMoreMoments = async () => {
  if (!hasMoreMoments.value || momentLoadingMore.value) return
  try {
    await loadMoments()
  } catch (error) {
    console.error('加载更多动态失败:', error)
    ElMessage.error(error.message || '加载更多动态失败')
  }
}

const goToAllBlogs = () => {
  if (!route.params.id) return
  router.push({
    path: '/blog/list',
    query: {
      authorId: route.params.id,
      authorName: displayName.value,
      back: route.fullPath
    }
  })
}

const goToArticle = (id) => {
  if (!id) return
  router.push({
    path: `/blog/article/${id}`,
    query: {
      back: route.fullPath
    }
  })
}

const goToEditArticle = (id) => {
  if (!id) return
  router.push({
    path: `/blog/edit/${id}`,
    query: {
      back: route.fullPath
    }
  })
}

const goToMoment = (id) => {
  if (!id) return
  router.push({
    path: `/community/${id}`,
    query: {
      back: route.fullPath
    }
  })
}

const scrollToSection = (sectionRef) => {
  sectionRef?.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('zh-CN')
}

const formatDateTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN')
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}

const decodeHtmlEntities = (value) => {
  if (!value) return ''
  if (typeof document === 'undefined') {
    return String(value)
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = String(value)
  return textarea.value
}

const extractTextFromHtml = (value) => {
  if (!value) return ''
  const doc = new DOMParser().parseFromString(String(value), 'text/html')
  return (doc.body?.textContent || '').replace(/\u00a0/g, ' ').trim()
}

const getPlainText = (value) => {
  const rawValue = String(value || '').trim()
  if (!rawValue) return ''

  const decoded = decodeHtmlEntities(rawValue)
  const text = /<\/?[a-z][\s\S]*>/i.test(decoded) ? extractTextFromHtml(decoded) : decoded

  return text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

const getDisplayTitle = (value) => getPlainText(value)

const getSummaryPreview = (value) => getPlainText(value)

const isCircleImage = (icon) => {
  if (!icon || typeof icon !== 'string') return false
  const normalizedIcon = icon.trim()
  return /^https?:\/\//i.test(normalizedIcon) || /^data:image\//i.test(normalizedIcon) || normalizedIcon.startsWith('/')
}

const getCircleVisualText = (icon, circleName) => {
  const normalizedIcon = typeof icon === 'string' ? icon.trim() : ''
  if (!normalizedIcon || isCircleImage(normalizedIcon)) {
    return (circleName || '圈').charAt(0)
  }
  if (normalizedIcon.length <= 4) {
    return normalizedIcon
  }
  return (circleName || normalizedIcon).charAt(0)
}

onMounted(() => {
  loadProfile()
})

watch(() => route.params.id, (id, previousId) => {
  if (id && id !== previousId) {
    loadProfile()
  }
})
</script>

<style scoped>
.public-profile-page {
  --profile-bg: #edf2f7;
  --profile-surface: rgba(255, 255, 255, 0.9);
  --profile-surface-strong: #ffffff;
  --profile-surface-muted: #e8eef6;
  --profile-border: rgba(15, 23, 42, 0.08);
  --profile-border-strong: rgba(15, 23, 42, 0.14);
  --profile-text: #0f172a;
  --profile-text-soft: #475569;
  --profile-text-faint: #64748b;
  --profile-accent: #0f766e;
  --profile-accent-strong: #115e59;
  --profile-accent-soft: rgba(15, 118, 110, 0.1);
  --profile-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), transparent 24%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.4), transparent 18%),
    var(--profile-bg);
  color: var(--profile-text);
}

.public-profile-page.is-dark {
  --profile-bg: #09111f;
  --profile-surface: rgba(15, 23, 42, 0.9);
  --profile-surface-strong: #101a2d;
  --profile-surface-muted: #162338;
  --profile-border: rgba(148, 163, 184, 0.14);
  --profile-border-strong: rgba(148, 163, 184, 0.22);
  --profile-text: #e2e8f0;
  --profile-text-soft: #cbd5e1;
  --profile-text-faint: #94a3b8;
  --profile-accent: #2dd4bf;
  --profile-accent-strong: #5eead4;
  --profile-accent-soft: rgba(45, 212, 191, 0.12);
  --profile-shadow: 0 20px 42px rgba(2, 6, 23, 0.28);
}

.profile-main {
  max-width: 1360px;
  margin: 0 auto;
  padding: 18px 20px 36px;
}

.back-row {
  margin-bottom: 14px;
}

.back-btn {
  border: 1px solid var(--profile-border);
  background: transparent;
  color: var(--profile-text);
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
}

.hero-panel,
.content-panel,
.side-panel {
  border: 1px solid var(--profile-border);
  background: var(--profile-surface);
  backdrop-filter: blur(18px);
  box-shadow: var(--profile-shadow);
}

.hero-panel {
  padding: 28px;
  border-radius: 28px;
  margin-bottom: 18px;
}

.hero-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
  align-items: start;
}

.identity-block {
  display: flex;
  gap: 18px;
  align-items: center;
}

.hero-avatar {
  width: 92px;
  height: 92px;
  border-radius: 26px;
  object-fit: cover;
  flex-shrink: 0;
}

.hero-avatar--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--profile-surface-muted);
  font-size: 32px;
  font-weight: 700;
}

.identity-copy {
  min-width: 0;
}

.identity-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.identity-title-row h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 0.95;
  letter-spacing: -0.05em;
}

.identity-handle,
.identity-intro,
.summary-item span,
.metric-card span,
.metric-card small,
.panel-actions span,
.moment-time,
.moment-foot,
.info-row span {
  color: var(--profile-text-faint);
}

.identity-tags {
  margin: 14px 0 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.identity-tag,
.meta-chip,
.circle-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--profile-accent-soft);
  color: var(--profile-accent-strong);
  font-size: 12px;
  font-weight: 600;
}

.identity-intro {
  margin: 0;
  max-width: 760px;
  line-height: 1.85;
  font-size: 15px;
}

.hero-aside {
  display: grid;
  gap: 10px;
}

.summary-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--profile-surface-muted);
  border: 1px solid var(--profile-border);
}

.summary-item span {
  display: block;
  font-size: 12px;
  margin-bottom: 8px;
}

.summary-item strong {
  display: block;
  color: var(--profile-text);
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
}

.hero-metrics {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  text-align: left;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--profile-border);
  background: var(--profile-surface-muted);
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: var(--profile-border-strong);
}

.metric-card--info {
  cursor: default;
}

.metric-card--info:hover {
  transform: none;
}

.metric-card span,
.metric-card small {
  display: block;
}

.metric-card strong {
  display: block;
  margin: 10px 0 6px;
  font-size: 28px;
  line-height: 1;
  color: var(--profile-text);
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
}

.content-column,
.side-column {
  min-width: 0;
}

.content-column {
  display: grid;
  gap: 18px;
}

.content-panel,
.side-panel {
  border-radius: 24px;
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.panel-head h2,
.panel-head h3,
.blog-main h3 {
  margin: 0;
}

.panel-head h2 {
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.panel-head--compact {
  margin-bottom: 14px;
}

.panel-eyebrow {
  margin: 0 0 10px;
  color: var(--profile-text-faint);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.panel-link,
.inline-action,
.nav-item {
  font: inherit;
}

.panel-link,
.inline-action {
  border: 0;
  background: transparent;
  color: var(--profile-accent-strong);
  cursor: pointer;
  padding: 0;
}

.blog-entry,
.moment-entry {
  position: relative;
  display: grid;
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid var(--profile-border);
  cursor: pointer;
}

.blog-entry {
  grid-template-columns: 184px minmax(0, 1fr) auto;
  align-items: center;
}

.moment-entry {
  grid-template-columns: minmax(0, 1fr);
}

.blog-entry:first-of-type,
.moment-entry:first-of-type {
  padding-top: 0;
  border-top: 0;
}

.blog-cover {
  width: 184px;
  min-height: 118px;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(59, 130, 246, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--profile-accent-strong);
  font-size: 14px;
  font-weight: 700;
}

.blog-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.blog-main {
  min-width: 0;
}

.blog-meta,
.blog-foot,
.moment-top,
.moment-foot,
.info-list,
.nav-list {
  display: flex;
}

.blog-meta,
.blog-foot {
  gap: 10px 14px;
  flex-wrap: wrap;
}

.blog-meta {
  margin-bottom: 10px;
  align-items: center;
  font-size: 13px;
  color: var(--profile-text-faint);
}

.blog-main h3 {
  font-size: 21px;
  line-height: 1.35;
  color: var(--profile-text);
}

.blog-main p,
.moment-content {
  margin: 10px 0 0;
  line-height: 1.8;
  color: var(--profile-text-soft);
}

.blog-main p {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-foot {
  margin-top: 12px;
  color: var(--profile-text-faint);
  font-size: 13px;
}

.entry-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  white-space: nowrap;
}

.entry-arrow {
  color: var(--profile-text-faint);
  font-size: 13px;
}

.circle-badge {
  width: fit-content;
}

.circle-badge__visual {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
}

.circle-badge__visual.is-image {
  background: rgba(255, 255, 255, 0.2);
}

.circle-badge__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-badge__emoji {
  font-size: 12px;
  line-height: 1;
}

.moment-top,
.moment-foot {
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.moment-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.moment-grid__image {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  object-fit: cover;
  background: var(--profile-surface-muted);
}

.moment-foot {
  margin-top: 14px;
  font-size: 13px;
}

.nav-list,
.info-list {
  flex-direction: column;
  gap: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--profile-border);
  border-radius: 16px;
  background: var(--profile-surface-muted);
  color: var(--profile-text);
  cursor: pointer;
}

.nav-item span {
  color: var(--profile-text-faint);
}

.nav-item strong {
  color: var(--profile-text);
  font-size: 14px;
}

.nav-item--link strong {
  color: var(--profile-accent-strong);
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.info-row strong {
  color: var(--profile-text);
  text-align: right;
  word-break: break-word;
}

.empty-state {
  min-height: 188px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: var(--profile-text-faint);
}

.load-more-row {
  display: flex;
  justify-content: center;
  padding-top: 18px;
  border-top: 1px solid var(--profile-border);
}

.load-more-btn {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid var(--profile-border-strong);
  border-radius: 999px;
  background: var(--profile-surface-muted);
  color: var(--profile-text);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--profile-accent);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1180px) {
  .hero-main,
  .profile-layout,
  .blog-entry {
    grid-template-columns: 1fr;
  }

  .entry-actions {
    align-items: flex-start;
  }

  .blog-cover {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .profile-main {
    padding: 14px 14px 24px;
  }

  .hero-panel,
  .content-panel,
  .side-panel {
    padding: 18px;
    border-radius: 20px;
  }

  .identity-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-metrics,
  .moment-grid {
    grid-template-columns: 1fr;
  }

  .panel-head,
  .panel-actions,
  .moment-top,
  .moment-foot,
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-row strong {
    text-align: left;
  }
}
</style>
