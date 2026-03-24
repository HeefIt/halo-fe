<template>
  <div class="public-profile-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <Header />

    <main class="profile-main">
      <div class="profile-layout">
        <section class="profile-column">
          <div class="back-row">
            <button type="button" class="back-btn" @click="router.back()">返回上一页</button>
          </div>

          <section v-if="profile" class="hero-panel">
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

            <div class="hero-stats">
              <div class="hero-stat">
                <span>社区动态</span>
                <strong>{{ totalMoments }}</strong>
              </div>
              <div class="hero-stat">
                <span>注册时间</span>
                <strong>{{ formatDate(profile.createdTime) || '--' }}</strong>
              </div>
              <div class="hero-stat">
                <span>账号状态</span>
                <strong>{{ profile.status === 1 ? '已禁用' : '正常' }}</strong>
              </div>
            </div>
          </section>

          <section class="moment-panel">
            <div class="panel-head">
              <h2>TA 的社区动态</h2>
              <span>{{ totalMoments }} 条</span>
            </div>

            <div v-if="loading" class="empty-state">资料加载中...</div>

            <template v-else-if="momentList.length">
              <article v-for="moment in momentList" :key="moment.id" class="moment-card" @click="goToMoment(moment.id)">
                <div class="moment-card__head">
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
                <div class="moment-card__foot">
                  <span>评论 {{ moment.commentCount || 0 }}</span>
                  <span>查看讨论</span>
                </div>
              </article>
            </template>

            <div v-else class="empty-state">
              <strong>这个用户还没有发动态</strong>
              <span>可以先看看别的讨论，或者稍后再来。</span>
            </div>
          </section>
        </section>

        <aside class="side-column">
          <section class="side-panel">
            <div class="panel-head">
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

          <section class="side-panel">
            <div class="panel-head">
              <h3>社区说明</h3>
            </div>
            <div class="tips-list">
              <div class="tip-item">
                <strong>这里只展示公开资料</strong>
                <span>不开放他人资料编辑，避免误操作影响现有个人中心。</span>
              </div>
              <div class="tip-item">
                <strong>动态可直接点进讨论</strong>
                <span>如果你们正在评论区交流，能快速跳回原动态继续聊。</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '@/layouts/AppHeader.vue'
import { useThemeStore } from '@/stores/modules/theme'
import { authApi } from '@/api/modules/auth'
import { shareApi } from '@/api/modules/share'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const loading = ref(false)
const profile = ref(null)
const momentList = ref([])
const totalMoments = ref(0)

const displayName = computed(() => profile.value?.nickName || profile.value?.userName || '用户')
const roleTags = computed(() => {
  const roleKeys = profile.value?.roleKeys || []
  if (!roleKeys.length) return ['普通用户']
  return roleKeys.map(roleKey => {
    if (roleKey === 'admin_user') return '管理员'
    if (roleKey === 'normal_user') return '普通用户'
    return roleKey
  })
})

const loadProfile = async () => {
  if (!route.params.id) {
    ElMessage.error('用户 ID 不存在')
    router.push('/home')
    return
  }

  loading.value = true
  try {
    const [profileResponse, momentResponse] = await Promise.all([
      authApi.getUserInfo(route.params.id),
      shareApi.getMomentPage({
        userId: route.params.id,
        pageNum: 1,
        pageSize: 12
      })
    ])

    if (profileResponse?.code !== 200) {
      throw new Error(profileResponse?.message || '获取用户资料失败')
    }
    if (momentResponse?.code !== 200) {
      throw new Error(momentResponse?.message || '获取用户动态失败')
    }

    profile.value = profileResponse.data
    momentList.value = momentResponse.data?.result || []
    totalMoments.value = momentResponse.data?.total || 0
  } catch (error) {
    console.error('加载公开用户资料失败:', error)
    ElMessage.error(error.message || '加载用户资料失败')
  } finally {
    loading.value = false
  }
}

const goToMoment = (id) => {
  router.push(`/community/${id}`)
}

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('zh-CN')
}

const formatDateTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN')
}

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
</script>

<style scoped>
.public-profile-page {
  --profile-bg: #f4f6fb;
  --profile-surface: rgba(255, 255, 255, 0.92);
  --profile-surface-muted: #eef2f7;
  --profile-border: rgba(15, 23, 42, 0.08);
  --profile-text: #0f172a;
  --profile-text-soft: #475569;
  --profile-text-faint: #64748b;
  --profile-accent: #0f766e;
  --profile-accent-soft: rgba(15, 118, 110, 0.1);
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), transparent 24%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 26%),
    var(--profile-bg);
  color: var(--profile-text);
}

.public-profile-page.is-dark {
  --profile-bg: #09111f;
  --profile-surface: rgba(15, 23, 42, 0.92);
  --profile-surface-muted: #162338;
  --profile-border: rgba(148, 163, 184, 0.14);
  --profile-text: #e2e8f0;
  --profile-text-soft: #cbd5e1;
  --profile-text-faint: #94a3b8;
  --profile-accent: #2dd4bf;
  --profile-accent-soft: rgba(45, 212, 191, 0.12);
}

.profile-main {
  max-width: 1320px;
  margin: 0 auto;
  padding: 18px 20px 28px;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.16fr) 300px;
  gap: 18px;
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
.moment-panel,
.side-panel {
  border: 1px solid var(--profile-border);
  background: var(--profile-surface);
  backdrop-filter: blur(18px);
  border-radius: 20px;
}

.hero-panel,
.moment-panel,
.side-panel {
  padding: 20px;
}

.hero-panel {
  margin-bottom: 16px;
}

.identity-block {
  display: flex;
  gap: 18px;
  align-items: center;
}

.hero-avatar {
  width: 82px;
  height: 82px;
  border-radius: 24px;
  object-fit: cover;
  flex-shrink: 0;
}

.hero-avatar--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--profile-surface-muted);
  font-size: 30px;
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
  font-size: 30px;
}

.identity-handle,
.identity-intro,
.hero-stat span,
.moment-time,
.moment-card__foot,
.panel-head span,
.tip-item span {
  color: var(--profile-text-faint);
}

.identity-tags {
  margin: 12px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.identity-tag,
.circle-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--profile-accent-soft);
  color: var(--profile-accent);
  font-size: 12px;
}

.circle-badge__visual {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.45);
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

.identity-intro {
  margin: 0;
  line-height: 1.8;
}

.hero-stats {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hero-stat {
  padding: 14px;
  border-radius: 16px;
  background: var(--profile-surface-muted);
}

.hero-stat span,
.panel-head span {
  font-size: 13px;
}

.hero-stat strong {
  display: block;
  margin-top: 8px;
  font-size: 18px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-head h2,
.panel-head h3 {
  margin: 0;
}

.moment-card {
  padding: 16px 0;
  border-top: 1px solid var(--profile-border);
  cursor: pointer;
}

.moment-card:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.moment-card__head,
.moment-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.moment-content {
  margin: 12px 0;
  line-height: 1.9;
  white-space: pre-wrap;
}

.moment-grid {
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

.info-list,
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.info-row span,
.tip-item span {
  font-size: 13px;
}

.tip-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-state {
  padding: 22px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  color: var(--profile-text-faint);
}

@media (max-width: 1080px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-main {
    padding: 14px 14px 24px;
  }

  .identity-block {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats,
  .moment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
