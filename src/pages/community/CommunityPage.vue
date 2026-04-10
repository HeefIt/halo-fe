<template>
  <div class="community-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <Header />

    <main class="community-main">
      <section class="community-topbar">
        <div class="topbar-copy">
          <span class="topbar-kicker">COMMUNITY HUB</span>
          <h1 class="topbar-title">圈子社区</h1>
          <p class="topbar-text">
            看看最近有什么新梗、新观点，或者把今天的状态直接发出来。
          </p>

          <div class="summary-strip">
            <div class="summary-chip">
              <span class="summary-chip__label">动态总数</span>
              <strong class="summary-chip__value">{{ totalMoments }}</strong>
            </div>
            <div class="summary-chip">
              <span class="summary-chip__label">圈子数量</span>
              <strong class="summary-chip__value">{{ circles.length }}</strong>
            </div>
            <div class="summary-chip">
              <span class="summary-chip__label">当前可见作者</span>
              <strong class="summary-chip__value">{{ activeAuthorCount }}</strong>
            </div>
          </div>
        </div>

        <div class="topbar-cta">
          <div class="cta-card">
            <span class="cta-eyebrow">当前浏览</span>
            <strong class="cta-title">{{ selectedCircle ? selectedCircle.circleName : '全部圈子' }}</strong>
            <p class="cta-text">{{ selectedCircle ? '当前只看这个圈子的内容' : '正在看全站最新动态' }}</p>
            <div class="cta-actions">
              <button type="button" class="secondary-btn" @click="switchCircle('all')">查看全部</button>
              <button type="button" class="primary-btn" @click="scrollToComposer">发动态</button>
            </div>
          </div>
        </div>
      </section>

      <section class="circle-nav-band">
        <div class="circle-nav-band__head">
          <div>
            <h2>圈子导航</h2>
            <p>切到你想看的圈子，信息流会立刻收拢。</p>
          </div>
          <span class="circle-nav-band__meta">{{ visibleMomentText }}</span>
        </div>

        <div class="circle-nav">
          <button
            type="button"
            class="circle-nav__item circle-nav__item--all"
            :class="{ active: selectedCircleId === 'all' }"
            @click="switchCircle('all')"
          >
            <span class="circle-nav__text">全部</span>
            <span class="circle-nav__meta">{{ totalMoments }}</span>
          </button>

          <button
            v-for="circle in circles"
            :key="circle.id"
            type="button"
            class="circle-nav__item"
            :class="{ active: String(selectedCircleId) === String(circle.id) }"
            @click="switchCircle(circle.id)"
          >
            <span class="circle-nav__visual" :class="{ 'is-image': isCircleImage(circle.icon) }">
              <img
                v-if="isCircleImage(circle.icon)"
                :src="circle.icon"
                :alt="circle.circleName"
                class="circle-nav__image"
              />
              <span v-else class="circle-nav__emoji">{{ getCircleVisualText(circle.icon, circle.circleName) }}</span>
            </span>
            <span class="circle-nav__text">{{ circle.circleName }}</span>
            <span class="circle-nav__meta">{{ getCircleVisibleCount(circle.id) }}</span>
          </button>
        </div>
      </section>

      <section class="workspace">
        <div class="primary-column">
          <section ref="composerPanelRef" class="composer-card">
            <div class="composer-card__head">
              <div class="composer-user" @click="goToOwnProfile">
                <img v-if="userStore.userAvatar" :src="userStore.userAvatar" :alt="userStore.userName" class="avatar-image" />
                <span v-else class="avatar-fallback">{{ currentUserInitial }}</span>
              </div>

              <div class="composer-intro">
                <strong>{{ userStore.userName || '你' }}</strong>
                <span>有想法就发出来，轻一点也没关系。</span>
              </div>

              <div class="composer-target">
                <span class="composer-target__label">发布到</span>
                <button type="button" class="composer-target__value" @click="focusSelectedCircle">
                  {{ composerCircleName }}
                </button>
              </div>
            </div>

            <div class="composer-circle-picker">
              <button
                v-for="circle in circles"
                :key="`composer-${circle.id}`"
                type="button"
                class="composer-circle"
                :class="{ active: String(momentForm.circleId || '') === String(circle.id || '') }"
                @click="selectComposerCircle(circle.id)"
              >
                <span class="composer-circle__visual" :class="{ 'is-image': isCircleImage(circle.icon) }">
                  <img
                    v-if="isCircleImage(circle.icon)"
                    :src="circle.icon"
                    :alt="circle.circleName"
                    class="composer-circle__image"
                  />
                  <span v-else class="composer-circle__emoji">{{ getCircleVisualText(circle.icon, circle.circleName) }}</span>
                </span>
                <span class="composer-circle__label">{{ circle.circleName }}</span>
              </button>
            </div>

            <textarea
              v-model.trim="momentForm.content"
              class="composer-input"
              rows="5"
              maxlength="1200"
              :placeholder="`在 ${composerCircleName} 里说点什么`"
            ></textarea>

            <div v-if="momentForm.pictures.length" class="upload-grid">
              <div v-for="(picture, index) in momentForm.pictures" :key="`${picture}-${index}`" class="upload-card">
                <img :src="picture" alt="moment" />
                <button type="button" class="upload-remove" @click="removePicture(index)">×</button>
              </div>
            </div>

            <div class="composer-footer">
              <div class="composer-actions">
                <button type="button" class="secondary-btn" :disabled="uploadingImage" @click="pickImages">
                  {{ uploadingImage ? '上传中...' : '添加图片/表情包' }}
                </button>
                <div class="composer-helper">
                  <span>{{ momentForm.content.length }}/1200</span>
                  <span>最多 9 张图，单图不超过 5MB</span>
                </div>
              </div>

              <button type="button" class="primary-btn primary-btn--strong" :disabled="postingMoment" @click="submitMoment">
                {{ postingMoment ? '发布中...' : '发布动态' }}
              </button>
            </div>
          </section>

          <section class="feed-header">
            <div class="feed-header__copy">
              <h2>{{ selectedCircle ? `${selectedCircle.circleName} 动态` : '全部动态' }}</h2>
              <p>{{ selectedCircle ? '只看当前圈子' : '全站最新动态都在这里' }}</p>
            </div>
            <div class="feed-header__meta">
              <span class="feed-header__count">{{ visibleMomentText }}</span>
            </div>
          </section>

          <section class="feed-panel">
            <div v-if="loading && !momentList.length" class="feed-empty">社区加载中...</div>

            <template v-else-if="momentList.length">
              <article v-for="moment in momentList" :key="moment.id" class="moment-card">
                <div class="moment-head">
                  <div class="moment-author">
                    <button type="button" class="author-link" @click="goToUser(moment.author?.userId)">
                      <img v-if="moment.author?.avatar" :src="moment.author.avatar" :alt="moment.author?.nickName" class="avatar-image" />
                      <span v-else class="avatar-fallback">{{ getAuthorInitial(moment.author) }}</span>
                    </button>

                    <div class="moment-meta">
                      <div class="moment-title-row">
                        <button type="button" class="author-name" @click="goToUser(moment.author?.userId)">
                          {{ moment.author?.nickName || '未知用户' }}
                        </button>
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
                          <span class="circle-badge__label">{{ moment.circleName || '默认圈子' }}</span>
                        </span>
                      </div>
                      <div class="moment-subline">
                        <span>@{{ moment.author?.userName || 'unknown' }}</span>
                        <span>{{ formatTime(moment.createdTime) }}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    v-if="moment.ownedByCurrentUser"
                    type="button"
                    class="ghost-btn ghost-btn--danger"
                    @click.stop="handleDeleteMoment(moment)"
                  >
                    删除
                  </button>
                </div>

                <div class="moment-body" @click="goToDetail(moment.id)">
                  <p class="moment-content">{{ moment.content || `分享了 ${moment.pictures?.length || 1} 张图片` }}</p>

                  <div
                    v-if="moment.pictures?.length"
                    class="moment-media"
                    :class="getMomentMediaClass(getPreviewPictures(moment).length)"
                  >
                    <div
                      v-for="(picture, index) in getPreviewPictures(moment)"
                      :key="`${moment.id}-${index}`"
                      class="moment-media__item"
                    >
                      <img
                        :src="picture"
                        :alt="`${moment.author?.nickName || '用户'} 的动态图片`"
                        class="moment-media__image"
                      />
                      <span
                        v-if="getHiddenImageCount(moment) > 0 && index === getPreviewPictures(moment).length - 1"
                        class="moment-media__more"
                      >
                        +{{ getHiddenImageCount(moment) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="moment-footer">
                  <button type="button" class="text-action" @click="goToDetail(moment.id)">
                    评论 {{ moment.commentCount || 0 }}
                  </button>
                  <button type="button" class="text-action" @click="goToDetail(moment.id)">
                    查看讨论
                  </button>
                </div>
              </article>

              <div class="feed-loadmore">
                <button type="button" class="secondary-btn" :disabled="loadingMore || !hasMore" @click="loadMoments(false)">
                  {{ hasMore ? (loadingMore ? '加载中...' : '继续查看更多') : '已经到底了' }}
                </button>
              </div>
            </template>

            <div v-else class="feed-empty">
              <strong>还没有动态</strong>
              <span>第一条发言，往往最容易带起气氛。</span>
            </div>
          </section>
        </div>

        <aside class="secondary-column">
          <section class="side-panel side-panel--light">
            <div class="side-panel__head">
              <h3>热门圈子</h3>
              <span>{{ recommendedCircles.length }} 个推荐</span>
            </div>

            <div class="highlight-list">
              <button
                v-for="circle in recommendedCircles"
                :key="`highlight-${circle.id}`"
                type="button"
                class="highlight-item"
                :class="{ active: String(selectedCircleId) === String(circle.id) }"
                @click="switchCircle(circle.id)"
              >
                <span class="highlight-item__visual" :class="{ 'is-image': isCircleImage(circle.icon) }">
                  <img
                    v-if="isCircleImage(circle.icon)"
                    :src="circle.icon"
                    :alt="circle.circleName"
                    class="highlight-item__image"
                  />
                  <span v-else class="highlight-item__emoji">{{ getCircleVisualText(circle.icon, circle.circleName) }}</span>
                </span>
                <span class="highlight-item__copy">
                  <strong>{{ circle.circleName }}</strong>
                  <span>{{ getCircleVisibleCount(circle.id) }} 条可见动态</span>
                </span>
              </button>
            </div>
          </section>

          <section class="side-panel">
            <div class="side-panel__head">
              <h3>社区手感</h3>
            </div>
            <div class="tips-list">
              <div class="tip-item">
                <strong>先说重点</strong>
                <span>一句短话、一张图，往往就够把讨论带起来。</span>
              </div>
              <div class="tip-item">
                <strong>图文一起发更轻松</strong>
                <span>截图、表情包和碎片想法都能自然混在一起。</span>
              </div>
              <div class="tip-item">
                <strong>关系会慢慢长出来</strong>
                <span>从动态点进资料，再回到讨论，互动会更有温度。</span>
              </div>
            </div>
          </section>

          <section class="side-panel side-panel--compact">
            <div class="side-panel__head">
              <h3>今日热议</h3>
              <span>{{ hotTopics.length }} 条</span>
            </div>

            <div v-if="hotTopics.length" class="topic-list">
              <button
                v-for="topic in hotTopics"
                :key="`topic-${topic.id}`"
                type="button"
                class="topic-item"
                @click="goToDetail(topic.id)"
              >
                <strong>{{ topic.circleName || '默认圈子' }}</strong>
                <span>{{ getMomentSummary(topic) }}</span>
              </button>
            </div>

            <div v-else class="topic-empty">再热一点，这里就会出现正在发酵的话题。</div>
          </section>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import Header from '@/layouts/AppHeader.vue'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'
import { shareApi } from '@/api/modules/share'
import { fileApi } from '@/api/modules/file'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()

const composerPanelRef = ref(null)
const circles = ref([])
const momentList = ref([])
const selectedCircleId = ref('all')
const loading = ref(false)
const loadingMore = ref(false)
const postingMoment = ref(false)
const uploadingImage = ref(false)
const totalMoments = ref(0)

const pageState = reactive({
  pageNum: 1,
  pageSize: 10
})

const momentForm = reactive({
  circleId: null,
  content: '',
  pictures: []
})

const currentUserInitial = computed(() => (userStore.userName || 'U').charAt(0).toUpperCase())
const hasMore = computed(() => momentList.value.length < totalMoments.value)
const selectedCircle = computed(() => circles.value.find(circle => String(circle.id) === String(selectedCircleId.value)) || null)
const composerCircle = computed(() => circles.value.find(circle => String(circle.id) === String(momentForm.circleId)) || circles.value[0] || null)
const composerCircleName = computed(() => composerCircle.value?.circleName || '默认圈子')
const visibleMomentText = computed(() => `${momentList.value.length} 条动态正在显示`)
const activeAuthorCount = computed(() => {
  const authorIds = new Set(
    momentList.value
      .map(item => item.author?.userId)
      .filter(Boolean)
      .map(item => String(item))
  )
  return authorIds.size
})

const circleVisibleMap = computed(() => {
  return momentList.value.reduce((map, moment) => {
    const circleId = String(moment.circleId || '')
    if (!circleId) {
      return map
    }
    map[circleId] = (map[circleId] || 0) + 1
    return map
  }, {})
})

const getCircleVisibleCount = (circleId) => {
  if (!circleId) {
    return 0
  }
  return Number(circleVisibleMap.value[String(circleId)] || 0)
}

const recommendedCircles = computed(() => {
  return [...circles.value]
    .sort((prev, next) => {
      const prevActive = String(prev.id) === String(selectedCircleId.value) ? 1 : 0
      const nextActive = String(next.id) === String(selectedCircleId.value) ? 1 : 0
      if (prevActive !== nextActive) {
        return nextActive - prevActive
      }

      const nextCount = getCircleVisibleCount(next.id)
      const prevCount = getCircleVisibleCount(prev.id)
      if (nextCount !== prevCount) {
        return nextCount - prevCount
      }

      return String(prev.id).localeCompare(String(next.id))
    })
    .slice(0, 5)
})

const hotTopics = computed(() => momentList.value.slice(0, 3))

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

const getMomentSummary = (moment) => {
  const content = (moment?.content || '').replace(/\s+/g, ' ').trim()
  if (content) {
    return content.length > 34 ? `${content.slice(0, 34)}...` : content
  }
  const pictureCount = moment?.pictures?.length || 0
  return pictureCount > 0 ? `分享了 ${pictureCount} 张图片` : '发起了一条新动态'
}

const getPreviewPictures = (moment) => {
  return (moment?.pictures || []).slice(0, 4)
}

const getHiddenImageCount = (moment) => {
  return Math.max(0, (moment?.pictures?.length || 0) - 4)
}

const getMomentMediaClass = (count) => {
  if (count <= 1) return 'count-1'
  if (count === 2) return 'count-2'
  if (count === 3) return 'count-3'
  return 'count-4'
}

const scrollToComposer = () => {
  composerPanelRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const focusSelectedCircle = () => {
  scrollToComposer()
}

const selectComposerCircle = (circleId) => {
  momentForm.circleId = circleId
}

const fetchCircles = async () => {
  const response = await shareApi.getCircleList()
  if (response?.code !== 200) {
    throw new Error(response?.message || '获取圈子失败')
  }

  circles.value = response.data || []
  if (!momentForm.circleId && circles.value.length) {
    momentForm.circleId = circles.value[0].id
  }
}

const loadMoments = async (reset = true) => {
  if (reset) {
    loading.value = true
    pageState.pageNum = 1
  } else {
    if (!hasMore.value) {
      return
    }
    loadingMore.value = true
    pageState.pageNum += 1
  }

  try {
    const response = await shareApi.getMomentPage({
      pageNum: pageState.pageNum,
      pageSize: pageState.pageSize,
      circleId: selectedCircleId.value === 'all' ? undefined : selectedCircleId.value
    })

    if (response?.code !== 200) {
      throw new Error(response?.message || '获取动态失败')
    }

    const result = response.data?.result || []
    totalMoments.value = Number(response.data?.total || 0)
    momentList.value = reset ? result : [...momentList.value, ...result]
  } catch (error) {
    console.error('获取社区动态失败:', error)
    ElMessage.error(error.message || '获取社区动态失败')
    if (!reset) {
      pageState.pageNum = Math.max(1, pageState.pageNum - 1)
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const switchCircle = async (circleId) => {
  selectedCircleId.value = circleId
  if (circleId !== 'all') {
    momentForm.circleId = circleId
  }
  await loadMoments(true)
}

const pickImages = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*'

  input.onchange = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    if (momentForm.pictures.length + files.length > 9) {
      ElMessage.warning('一条动态最多上传 9 张图片')
      return
    }

    const invalidFile = files.find(file => file.size > 5 * 1024 * 1024)
    if (invalidFile) {
      ElMessage.warning('单张图片不能超过 5MB')
      return
    }

    const loadingInstance = ElLoading.service({
      lock: true,
      text: '图片上传中...',
      background: 'rgba(15, 23, 42, 0.24)'
    })
    uploadingImage.value = true

    try {
      const uploadedUrls = []
      for (const file of files) {
        const response = await fileApi.uploadImage(file, '社区动态图片')
        const fileUrl = response?.data?.filePath
        if (!response || response.code !== 200 || !fileUrl) {
          throw new Error(response?.message || '图片上传失败')
        }
        uploadedUrls.push(fileUrl)
      }

      momentForm.pictures = [...momentForm.pictures, ...uploadedUrls]
      ElMessage.success('图片上传成功')
    } catch (error) {
      console.error('上传社区图片失败:', error)
      ElMessage.error(error.message || '图片上传失败')
    } finally {
      uploadingImage.value = false
      loadingInstance.close()
    }
  }

  input.click()
}

const removePicture = (index) => {
  momentForm.pictures.splice(index, 1)
}

const submitMoment = async () => {
  if (!momentForm.content && !momentForm.pictures.length) {
    ElMessage.warning('请输入内容或上传图片后再发布')
    return
  }
  if (!momentForm.circleId) {
    ElMessage.warning('请先选择一个圈子')
    return
  }

  postingMoment.value = true
  try {
    const response = await shareApi.createMoment({
      circleId: momentForm.circleId,
      content: momentForm.content,
      pictures: momentForm.pictures
    })

    if (response?.code !== 200) {
      throw new Error(response?.message || '发布失败')
    }

    momentForm.content = ''
    momentForm.pictures = []
    ElMessage.success('动态发布成功')
    await loadMoments(true)
  } catch (error) {
    console.error('发布动态失败:', error)
    ElMessage.error(error.message || '发布动态失败')
  } finally {
    postingMoment.value = false
  }
}

const handleDeleteMoment = async (moment) => {
  try {
    await ElMessageBox.confirm('确认删除这条动态吗？删除后评论也会一并隐藏。', '删除动态', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })

    const response = await shareApi.deleteMoment(moment.id)
    if (response?.code !== 200) {
      throw new Error(response?.message || '删除失败')
    }

    ElMessage.success('动态已删除')
    await loadMoments(true)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除动态失败:', error)
      ElMessage.error(error.message || '删除动态失败')
    }
  }
}

const goToDetail = (id) => {
  router.push(`/community/${id}`)
}

const goToUser = (userId) => {
  if (!userId) return
  router.push(`/profile/${userId}`)
}

const goToOwnProfile = () => {
  router.push('/profile')
}

const getAuthorInitial = (author) => {
  return (author?.nickName || author?.userName || 'U').charAt(0).toUpperCase()
}

const formatTime = (value) => {
  if (!value) return '刚刚'
  const time = new Date(value).getTime()
  const diff = Date.now() - time
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} 分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    await fetchCircles()
    await loadMoments(true)
  } catch (error) {
    console.error('初始化社区页面失败:', error)
    ElMessage.error(error.message || '社区页面加载失败')
  }
})
</script>

<style scoped>
.community-page {
  --community-bg: #f3f6fb;
  --community-surface: rgba(255, 255, 255, 0.92);
  --community-surface-strong: #ffffff;
  --community-surface-muted: #eef3f8;
  --community-border: rgba(15, 23, 42, 0.08);
  --community-border-strong: rgba(15, 23, 42, 0.14);
  --community-text: #0f172a;
  --community-text-soft: #475569;
  --community-text-faint: #64748b;
  --community-accent: #0f766e;
  --community-accent-deep: #0b5d57;
  --community-accent-soft: rgba(15, 118, 110, 0.12);
  --community-accent-line: rgba(15, 118, 110, 0.22);
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.07), transparent 24%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 26%),
    var(--community-bg);
  color: var(--community-text);
}

.community-page.is-dark {
  --community-bg: #09111f;
  --community-surface: rgba(15, 23, 42, 0.92);
  --community-surface-strong: #121d31;
  --community-surface-muted: #162338;
  --community-border: rgba(148, 163, 184, 0.14);
  --community-border-strong: rgba(148, 163, 184, 0.22);
  --community-text: #e2e8f0;
  --community-text-soft: #cbd5e1;
  --community-text-faint: #94a3b8;
  --community-accent: #2dd4bf;
  --community-accent-deep: #18b9a7;
  --community-accent-soft: rgba(45, 212, 191, 0.14);
  --community-accent-line: rgba(45, 212, 191, 0.26);
}

.community-main {
  max-width: 1340px;
  margin: 0 auto;
  padding: 18px 20px 28px;
}

.community-topbar,
.circle-nav-band,
.composer-card,
.feed-panel,
.side-panel {
  border: 1px solid var(--community-border);
  background: var(--community-surface);
  backdrop-filter: blur(18px);
  border-radius: 18px;
}

.community-topbar {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 320px;
  gap: 18px;
  padding: 22px 24px;
  margin-bottom: 18px;
}

.topbar-kicker {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: var(--community-text-faint);
  text-transform: uppercase;
}

.topbar-title {
  margin: 10px 0 12px;
  font-size: clamp(32px, 5vw, 44px);
  line-height: 1.04;
}

.topbar-text {
  max-width: 700px;
  margin: 0;
  color: var(--community-text-soft);
  font-size: 15px;
  line-height: 1.8;
}

.summary-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.summary-chip {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  min-width: 132px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--community-border);
  background: var(--community-surface-strong);
}

.summary-chip__label {
  color: var(--community-text-faint);
  font-size: 12px;
}

.summary-chip__value {
  font-size: 24px;
  line-height: 1;
}

.topbar-cta {
  display: flex;
}

.cta-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid var(--community-accent-line);
  background: linear-gradient(145deg, var(--community-accent-soft), transparent);
}

.cta-eyebrow {
  color: var(--community-text-faint);
  font-size: 12px;
}

.cta-title {
  font-size: 26px;
}

.cta-text {
  margin: 0;
  color: var(--community-text-soft);
  font-size: 14px;
  line-height: 1.7;
}

.cta-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.circle-nav-band {
  margin-bottom: 18px;
  padding: 18px 20px;
}

.circle-nav-band__head,
.composer-card__head,
.composer-footer,
.feed-header,
.side-panel__head,
.moment-head,
.moment-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.circle-nav-band__head {
  gap: 16px;
  margin-bottom: 14px;
}

.circle-nav-band__head h2,
.feed-header__copy h2,
.side-panel__head h3 {
  margin: 0;
}

.circle-nav-band__head p,
.feed-header__copy p {
  margin: 6px 0 0;
  color: var(--community-text-faint);
  font-size: 13px;
}

.circle-nav-band__meta,
.feed-header__count,
.side-panel__head span {
  color: var(--community-text-faint);
  font-size: 13px;
}

.circle-nav {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.circle-nav__item {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 14px;
  border: 1px solid var(--community-border);
  border-radius: 14px;
  background: var(--community-surface-strong);
  color: var(--community-text-soft);
  cursor: pointer;
  transition: all 0.2s ease;
}

.circle-nav__item:hover {
  border-color: var(--community-border-strong);
  transform: translateY(-1px);
}

.circle-nav__item.active {
  border-color: var(--community-accent-line);
  background: var(--community-accent-soft);
  color: var(--community-text);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}

.circle-nav__item.active::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 6px;
  height: 3px;
  border-radius: 999px;
  background: var(--community-accent);
}

.circle-nav__visual,
.composer-circle__visual,
.circle-badge__visual,
.highlight-item__visual {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  overflow: hidden;
  background: var(--community-surface-muted);
}

.circle-nav__image,
.composer-circle__image,
.circle-badge__image,
.highlight-item__image,
.moment-media__image,
.upload-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-nav__emoji,
.composer-circle__emoji,
.circle-badge__emoji,
.highlight-item__emoji {
  font-size: 13px;
  font-weight: 700;
  color: var(--community-text);
}

.circle-nav__text,
.composer-circle__label,
.circle-badge__label {
  white-space: nowrap;
}

.circle-nav__meta {
  display: inline-flex;
  min-width: 22px;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: var(--community-text-faint);
  font-size: 12px;
  font-weight: 700;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
}

.primary-column,
.secondary-column {
  min-width: 0;
}

.primary-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.secondary-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.composer-card {
  padding: 20px;
}

.composer-card__head {
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.composer-user,
.author-link {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.avatar-image,
.avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  object-fit: cover;
  background: var(--community-surface-muted);
  color: var(--community-text);
  font-weight: 700;
}

.composer-intro {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.composer-intro strong {
  font-size: 16px;
}

.composer-intro span,
.composer-helper,
.moment-subline,
.topic-item span,
.tip-item span,
.highlight-item__copy span {
  color: var(--community-text-faint);
}

.composer-intro span,
.tip-item span {
  font-size: 13px;
  line-height: 1.7;
}

.composer-target {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.composer-target__label {
  color: var(--community-text-faint);
  font-size: 12px;
}

.composer-target__value {
  border: 1px solid var(--community-accent-line);
  background: var(--community-accent-soft);
  color: var(--community-accent);
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.composer-circle-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.composer-circle {
  border: 1px solid var(--community-border);
  background: transparent;
  color: var(--community-text-soft);
  border-radius: 999px;
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.composer-circle:hover {
  border-color: var(--community-border-strong);
}

.composer-circle.active {
  border-color: var(--community-accent-line);
  background: var(--community-accent-soft);
  color: var(--community-text);
  box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.04);
}

.composer-input {
  width: 100%;
  resize: vertical;
  min-height: 148px;
  border: 1px solid var(--community-border);
  border-radius: 16px;
  background: var(--community-surface-strong);
  color: var(--community-text);
  padding: 16px 18px;
  line-height: 1.8;
  outline: none;
}

.upload-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
}

.upload-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  background: var(--community-surface-muted);
}

.upload-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  cursor: pointer;
}

.composer-footer {
  margin-top: 16px;
  gap: 14px;
}

.composer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.composer-helper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.primary-btn,
.secondary-btn,
.ghost-btn,
.text-action,
.author-name {
  font: inherit;
}

.primary-btn,
.secondary-btn,
.ghost-btn {
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn {
  border: 0;
  background: var(--community-accent);
  color: #fff;
}

.primary-btn:hover {
  background: var(--community-accent-deep);
}

.primary-btn--strong {
  min-width: 132px;
  min-height: 48px;
  font-weight: 700;
}

.secondary-btn {
  border: 1px solid var(--community-border-strong);
  background: var(--community-surface-strong);
  color: var(--community-text);
}

.secondary-btn:hover {
  border-color: var(--community-accent-line);
  color: var(--community-accent);
}

.ghost-btn {
  border: 0;
  background: transparent;
  color: var(--community-text-faint);
}

.ghost-btn--danger:hover {
  color: #ef4444;
}

.feed-header {
  padding: 0 4px;
  gap: 16px;
}

.feed-header__copy h2 {
  font-size: 24px;
}

.feed-panel {
  padding: 8px 0;
}

.moment-card {
  padding: 18px 20px;
  border-bottom: 1px solid var(--community-border);
}

.moment-card:last-child {
  border-bottom: 0;
}

.moment-head {
  gap: 14px;
  align-items: flex-start;
}

.moment-author {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 14px;
}

.moment-meta {
  flex: 1;
  min-width: 0;
}

.moment-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.moment-subline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
  font-size: 13px;
}

.author-name {
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--community-text);
  font-weight: 700;
  cursor: pointer;
}

.circle-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--community-accent-soft);
  color: var(--community-accent);
  font-size: 12px;
  max-width: min(100%, 220px);
}

.moment-body {
  margin: 16px 0 14px;
  cursor: pointer;
}

.moment-content {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.9;
  font-size: 15px;
}

.moment-media {
  margin-top: 14px;
  display: grid;
  gap: 10px;
  max-width: 760px;
}

.moment-media.count-1 {
  grid-template-columns: minmax(0, 1fr);
}

.moment-media.count-2,
.moment-media.count-3,
.moment-media.count-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.moment-media__item {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: var(--community-surface-muted);
  min-height: 188px;
  max-height: 220px;
}

.count-1 .moment-media__item {
  min-height: 280px;
  max-height: 420px;
}

.count-3 .moment-media__item:first-child {
  grid-column: 1 / -1;
  min-height: 260px;
  max-height: 300px;
}

.moment-media__more {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.48);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
}

.moment-footer {
  justify-content: flex-start;
  gap: 18px;
}

.text-action {
  border: 0;
  background: transparent;
  color: var(--community-text-faint);
  padding: 0;
  cursor: pointer;
}

.text-action:hover {
  color: var(--community-accent);
}

.feed-loadmore {
  padding: 18px 20px 14px;
  display: flex;
  justify-content: center;
}

.feed-empty,
.topic-empty {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--community-text-faint);
}

.side-panel {
  padding: 18px;
}

.side-panel--light {
  background: linear-gradient(145deg, var(--community-accent-soft), transparent);
}

.side-panel--compact {
  padding-bottom: 8px;
}

.highlight-list,
.tips-list,
.topic-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-item,
.topic-item {
  width: 100%;
  border: 1px solid var(--community-border);
  background: var(--community-surface-strong);
  color: var(--community-text);
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  text-align: left;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.highlight-item.active {
  border-color: var(--community-accent-line);
  background: var(--community-accent-soft);
}

.highlight-item__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.highlight-item__copy strong,
.tip-item strong,
.topic-item strong {
  font-size: 14px;
}

.topic-item {
  display: grid;
  gap: 6px;
}

.topic-item span {
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 1180px) {
  .community-topbar,
  .workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .community-main {
    padding: 14px 14px 24px;
  }

  .composer-card__head,
  .composer-footer,
  .feed-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .composer-target {
    align-items: flex-start;
  }

  .moment-media.count-2,
  .moment-media.count-3,
  .moment-media.count-4 {
    grid-template-columns: 1fr;
  }

  .count-3 .moment-media__item:first-child {
    grid-column: auto;
    min-height: 220px;
    max-height: 280px;
  }
}

@media (max-width: 640px) {
  .summary-strip,
  .cta-actions,
  .composer-actions,
  .circle-nav {
    width: 100%;
  }

  .summary-strip,
  .cta-actions,
  .composer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .moment-author,
  .moment-head {
    flex-direction: column;
  }
}
</style>
