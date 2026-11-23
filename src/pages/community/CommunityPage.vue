<template>
  <div class="community-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <Header />

    <main class="community-main">
      <section class="community-hero" aria-labelledby="community-page-title">
        <div class="hero-copy">
          <div class="hero-kicker">
            <span class="hero-kicker__dot"></span>
            <span>开发者社区</span>
          </div>
          <h1 id="community-page-title">圈子社区</h1>
          <p>和志同道合的开发者交流、分享、成长。</p>
        </div>

        <div class="hero-stats" aria-label="社区统计">
          <div class="hero-stat">
            <strong>{{ totalMoments }}</strong>
            <span>条动态</span>
          </div>
          <span class="hero-stats__divider"></span>
          <div class="hero-stat">
            <strong>{{ circles.length }}</strong>
            <span>个圈子</span>
          </div>
          <span class="hero-stats__divider"></span>
          <div class="hero-stat">
            <strong>{{ activeAuthorCount }}</strong>
            <span>位发言者</span>
          </div>
          <button type="button" class="hero-publish" @click="scrollToComposer">
            <span>发一条</span>
            <span class="hero-publish__plus">+</span>
          </button>
        </div>
      </section>

      <section class="community-layout">
        <aside class="circle-rail" aria-label="圈子索引">
          <div class="circle-rail__head">
            <div>
              <h2>圈子</h2>
            </div>
            <span class="circle-rail__count">{{ circles.length }}</span>
          </div>

          <div class="circle-rail__list">
            <button
              type="button"
              class="circle-link circle-link--all"
              :class="{ active: selectedCircleId === 'all' }"
              :aria-pressed="selectedCircleId === 'all'"
              @click="switchCircle('all')"
            >
              <span class="circle-link__marker circle-link__marker--all">✦</span>
              <span class="circle-link__body">
                <strong>全部动态</strong>
              </span>
              <span class="circle-link__number">{{ totalMoments }}</span>
            </button>

            <button
              v-for="circle in circles"
              :key="circle.id"
              type="button"
              class="circle-link"
              :class="{ active: String(selectedCircleId) === String(circle.id) }"
              :aria-pressed="String(selectedCircleId) === String(circle.id)"
              @click="switchCircle(circle.id)"
            >
              <span class="circle-link__marker" :class="{ 'is-image': isCircleImage(circle.icon) }">
                <img
                  v-if="isCircleImage(circle.icon)"
                  :src="circle.icon"
                  :alt="circle.circleName"
                  class="circle-link__image"
                />
                <span v-else>{{ getCircleVisualText(circle.icon, circle.circleName) }}</span>
              </span>
              <span class="circle-link__body">
                <strong>{{ circle.circleName }}</strong>
              </span>
              <span class="circle-link__number">{{ getCircleVisibleCount(circle.id) }}</span>
            </button>
          </div>

        </aside>

        <section class="community-stream" aria-label="社区动态">
          <section ref="composerPanelRef" class="composer-card">
            <div class="composer-card__accent"></div>
            <div class="composer-card__head">
              <button type="button" class="composer-user" aria-label="查看我的资料" @click="goToOwnProfile">
                <img v-if="userStore.userAvatar" :src="userStore.userAvatar" :alt="userStore.userName" class="avatar-image" />
                <span v-else class="avatar-fallback">{{ currentUserInitial }}</span>
              </button>

              <div class="composer-intro">
                <strong>{{ userStore.userName || '你' }}</strong>
                <span>发布动态</span>
              </div>

              <div class="composer-target">
                <span>圈子</span>
                <button type="button" @click="focusSelectedCircle">{{ composerCircleName }}</button>
              </div>
            </div>

            <div class="composer-circle-picker" aria-label="选择发布圈子">
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
                  <span v-else>{{ getCircleVisualText(circle.icon, circle.circleName) }}</span>
                </span>
                <span>{{ circle.circleName }}</span>
              </button>
            </div>

            <textarea
              v-model.trim="momentForm.content"
              class="composer-input"
              rows="4"
              maxlength="1200"
              placeholder="分享一个问题、一个发现，或最近解决的 Bug..."
            ></textarea>

            <div v-if="momentForm.pictures.length" class="upload-grid">
              <div v-for="(picture, index) in momentForm.pictures" :key="`${picture}-${index}`" class="upload-card">
                <img :src="picture" alt="已上传的动态图片" />
                <button type="button" class="upload-remove" aria-label="移除图片" @click="removePicture(index)">×</button>
              </div>
            </div>

            <div class="composer-footer">
              <div class="composer-tools">
                <button type="button" class="composer-tool" :disabled="uploadingImage" @click="pickImages">
                  <span class="composer-tool__icon">▧</span>
                  <span>{{ uploadingImage ? '图片上传中' : '添加图片' }}</span>
                </button>
                <span class="composer-helper">{{ momentForm.content.length }}/1200 · 最多 9 张图</span>
              </div>
              <button type="button" class="publish-btn" :disabled="postingMoment" @click="submitMoment">
                {{ postingMoment ? '发布中...' : '发布动态' }}
              </button>
            </div>
          </section>

          <div class="feed-search-row" role="search" aria-label="搜索社区帖子">
            <div class="feed-search">
              <span class="feed-search__icon" aria-hidden="true">⌕</span>
              <input
                v-model="postSearchQuery"
                type="search"
                placeholder="搜索帖子、话题或作者"
                @keyup.enter="handlePostSearch"
              />
              <button
                v-if="postSearchQuery"
                type="button"
                class="feed-search__clear"
                aria-label="清除搜索"
                @click="clearPostSearch"
              >
                ×
              </button>
              <button type="button" class="feed-search__submit" @click="handlePostSearch">搜索</button>
            </div>
            <span v-if="postSearchState" class="feed-search__state" role="status">{{ postSearchState }}</span>
          </div>

          <div class="stream-toolbar">
            <div class="stream-toolbar__title">
              <h2>{{ selectedCircle ? selectedCircle.circleName : '全部动态' }}</h2>
            </div>
            <div class="stream-toolbar__meta">
              <span class="live-dot"></span>
              <span>{{ visibleMomentText }}</span>
            </div>
          </div>

          <section class="moment-feed">
            <div v-if="loading && !momentList.length" class="feed-state feed-state--loading">
              <span class="feed-state__loader"></span>
              <span>正在把新动态搬过来...</span>
            </div>

            <template v-else-if="momentList.length">
              <article v-for="moment in momentList" :key="moment.id" class="moment-card">
                <div class="moment-card__timeline" aria-hidden="true">
                  <span></span>
                </div>

                <div class="moment-head">
                  <div class="moment-author">
                    <button type="button" class="author-link" :aria-label="`查看 ${moment.author?.nickName || '用户'} 的资料`" @click="goToUser(moment.author?.userId)">
                      <img v-if="moment.author?.avatar" :src="moment.author.avatar" :alt="moment.author?.nickName" class="avatar-image" />
                      <span v-else class="avatar-fallback">{{ getAuthorInitial(moment.author) }}</span>
                    </button>
                    <div class="moment-meta">
                      <div class="moment-title-row">
                        <button type="button" class="author-name" @click="goToUser(moment.author?.userId)">
                          {{ moment.author?.nickName || '未知用户' }}
                        </button>
                        <span class="moment-time">{{ formatTime(moment.createdTime) }}</span>
                      </div>
                      <span class="moment-subline">@{{ moment.author?.userName || 'unknown' }}</span>
                    </div>
                  </div>

                  <div class="moment-card__context">
                    <span class="context-arrow">↳</span>
                    <span>{{ moment.circleName || '默认圈子' }}</span>
                  </div>

                  <button
                    v-if="moment.ownedByCurrentUser"
                    type="button"
                    class="delete-btn"
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
                  <button type="button" class="moment-action" @click="goToDetail(moment.id)">
                    <span>评论</span>
                    <strong>{{ moment.commentCount || 0 }}</strong>
                  </button>
                  <button type="button" class="moment-action moment-action--accent" @click="goToDetail(moment.id)">
                    进入讨论 <span>↗</span>
                  </button>
                </div>
              </article>

              <div class="feed-loadmore">
                <button type="button" class="loadmore-btn" :disabled="loadingMore || !hasMore" @click="loadMoments(false)">
                  {{ hasMore ? (loadingMore ? '加载中...' : '继续查看更多') : '已经到底了' }}
                </button>
              </div>
            </template>

            <div v-else class="feed-state feed-state--empty">
              <span class="feed-state__sticker">✎</span>
              <strong>这里还没有动态</strong>
              <span>发第一条，让这个圈子热闹起来。</span>
              <button type="button" class="empty-action" @click="scrollToComposer">去发一条</button>
            </div>
          </section>
        </section>

        <aside class="community-pulse" aria-label="社区脉搏">
          <section class="pulse-section pulse-section--hot">
            <div class="pulse-heading">
              <div>
                <h2>本周活跃圈子</h2>
              </div>
              <span class="pulse-heading__spark">✹</span>
            </div>

            <div class="hot-list">
              <button
                v-for="(circle, index) in recommendedCircles"
                :key="`highlight-${circle.id}`"
                type="button"
                class="hot-item"
                :class="{ active: String(selectedCircleId) === String(circle.id) }"
                @click="switchCircle(circle.id)"
              >
                <span class="hot-item__rank">0{{ index + 1 }}</span>
                <span class="hot-item__visual" :class="{ 'is-image': isCircleImage(circle.icon) }">
                  <img
                    v-if="isCircleImage(circle.icon)"
                    :src="circle.icon"
                    :alt="circle.circleName"
                    class="hot-item__image"
                  />
                  <span v-else>{{ getCircleVisualText(circle.icon, circle.circleName) }}</span>
                </span>
                <span class="hot-item__copy">
                  <strong>{{ circle.circleName }}</strong>
                  <span>{{ getCircleVisibleCount(circle.id) }} 条动态</span>
                </span>
                <span class="hot-item__arrow">↗</span>
              </button>
            </div>
          </section>

          <section class="pulse-section">
            <div class="pulse-heading">
              <div>
                <h2>正在讨论</h2>
              </div>
              <span class="pulse-heading__count">{{ hotTopics.length }}</span>
            </div>

            <div v-if="hotTopics.length" class="topic-list">
              <button
                v-for="topic in hotTopics"
                :key="`topic-${topic.id}`"
                type="button"
                class="topic-item"
                @click="goToDetail(topic.id)"
              >
                <span class="topic-item__circle">{{ topic.circleName || '默认圈子' }}</span>
                <strong>{{ getMomentSummary(topic) }}</strong>
                <span class="topic-item__arrow">↗</span>
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
const postSearchQuery = ref('')
const postSearchState = ref('')
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

const handlePostSearch = () => {
  const query = postSearchQuery.value.trim()

  if (!query) {
    postSearchState.value = '请输入搜索关键词'
    return
  }

  postSearchState.value = '帖子搜索接口待接入'
  ElMessage.info('帖子搜索功能待接入，当前仅保留搜索入口。')
}

const clearPostSearch = () => {
  postSearchQuery.value = ''
  postSearchState.value = ''
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

const removeMomentFromView = (momentId) => {
  if (!momentId) {
    return
  }

  const previousLength = momentList.value.length
  momentList.value = momentList.value.filter(item => String(item.id) !== String(momentId))
  const removedCount = previousLength - momentList.value.length
  if (removedCount > 0) {
    totalMoments.value = Math.max(0, Number(totalMoments.value || 0) - removedCount)
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

    removeMomentFromView(moment.id)
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
  --community-bg: #f3f6fa;
  --community-panel: #ffffff;
  --community-panel-soft: #f8fafc;
  --community-panel-warm: #fff8e8;
  --community-text: #172033;
  --community-text-soft: #667085;
  --community-text-faint: #98a2b3;
  --community-line: #dce4ee;
  --community-line-strong: #c8d4e3;
  --community-coral: #ef6f61;
  --community-coral-dark: #d8574c;
  --community-yellow: #e6ad37;
  --community-mint: #55b796;
  --community-blue: #4e6ee8;
  --community-shadow: 0 12px 28px rgba(28, 43, 68, 0.08);
  --community-shadow-soft: 0 5px 16px rgba(28, 43, 68, 0.06);
  --community-radius: 16px;
  --community-radius-sm: 10px;
  background: var(--community-bg);
  color: var(--community-text);
  min-height: 100vh;
}

.community-page.is-dark {
  --community-bg: #0d1728;
  --community-panel: #14233a;
  --community-panel-soft: #182942;
  --community-panel-warm: #2b2a24;
  --community-text: #f6f8fc;
  --community-text-soft: #b9c5d7;
  --community-text-faint: #8291a7;
  --community-line: rgba(178, 197, 226, 0.15);
  --community-line-strong: rgba(178, 197, 226, 0.26);
  --community-coral: #ff8c7d;
  --community-coral-dark: #ffad9f;
  --community-yellow: #f4c85e;
  --community-mint: #78d5b1;
  --community-blue: #91a9ff;
  --community-shadow: 0 18px 34px rgba(2, 8, 21, 0.26);
  --community-shadow-soft: 0 8px 22px rgba(2, 8, 21, 0.18);
}

.community-main {
  width: min(1320px, calc(100% - 48px));
  margin: 0 auto;
  padding: 34px 0 72px;
}

.community-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding: 12px 4px 30px;
  border-bottom: 1px solid var(--community-line);
}

.hero-copy {
  max-width: 640px;
}

.hero-kicker,
.section-overline {
  color: var(--community-coral);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1.4;
  text-transform: uppercase;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.hero-kicker__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--community-yellow);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--community-yellow) 18%, transparent);
}

.community-hero h1 {
  margin: 0;
  color: var(--community-text);
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 1.05;
}

.hero-copy p {
  max-width: 580px;
  margin: 13px 0 0;
  color: var(--community-text-soft);
  font-size: 15px;
  line-height: 1.75;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
}

.hero-stat {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.hero-stat strong {
  color: var(--community-text);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero-stat span {
  color: var(--community-text-faint);
  font-size: 12px;
}

.hero-stats__divider {
  width: 1px;
  height: 24px;
  background: var(--community-line);
}

.hero-publish,
.publish-btn,
.empty-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 11px;
  background: var(--community-coral);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.hero-publish:hover,
.publish-btn:hover:not(:disabled),
.empty-action:hover {
  background: var(--community-coral-dark);
  box-shadow: 0 8px 18px color-mix(in srgb, var(--community-coral) 24%, transparent);
  transform: translateY(-2px);
}

.hero-publish__plus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  font-size: 17px;
  font-weight: 500;
  line-height: 1;
}

.community-layout {
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr) 280px;
  align-items: start;
  gap: 24px;
  padding-top: 28px;
}

.circle-rail,
.community-pulse,
.composer-card,
.moment-card {
  min-width: 0;
}

.circle-rail {
  position: sticky;
  top: 88px;
}

.circle-rail__head,
.pulse-heading,
.stream-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.circle-rail__head {
  padding: 0 8px 13px;
  border-bottom: 1px solid var(--community-line);
}

.circle-rail h2,
.pulse-heading h2,
.stream-toolbar h2 {
  margin: 4px 0 0;
  color: var(--community-text);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.035em;
}

.circle-rail__count,
.pulse-heading__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 7px;
  border-radius: 8px;
  background: var(--community-panel-warm);
  color: var(--community-yellow);
  font-size: 12px;
  font-weight: 800;
}

.circle-rail__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
}

.circle-link {
  position: relative;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 54px;
  padding: 7px 8px;
  border-radius: 12px;
  color: var(--community-text-soft);
  text-align: left;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
}

.circle-link::before {
  position: absolute;
  top: 11px;
  bottom: 11px;
  left: -1px;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: transparent;
  content: '';
  transition: background-color 180ms ease, transform 180ms ease;
}

.circle-link:hover {
  background: var(--community-panel-soft);
  color: var(--community-text);
  transform: translateX(2px);
}

.circle-link.active {
  background: color-mix(in srgb, var(--community-coral) 10%, var(--community-panel));
  color: var(--community-text);
}

.circle-link.active::before {
  background: var(--community-coral);
  transform: scaleY(1);
}

.circle-link__marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  overflow: hidden;
  border: 1px solid var(--community-line-strong);
  border-radius: 10px;
  background: var(--community-panel);
  color: var(--community-coral);
  font-size: 13px;
  font-weight: 800;
}

.circle-link__marker--all {
  border-color: color-mix(in srgb, var(--community-coral) 35%, var(--community-line));
  background: color-mix(in srgb, var(--community-coral) 10%, var(--community-panel));
}

.circle-link__marker.is-image,
.circle-link__image {
  border-radius: 10px;
}

.circle-link__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-link__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.circle-link__body strong {
  overflow: hidden;
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circle-link__body span {
  overflow: hidden;
  color: var(--community-text-faint);
  font-size: 11px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circle-link__number {
  align-self: start;
  padding-top: 4px;
  color: var(--community-text-faint);
  font-size: 11px;
  font-weight: 700;
}

.circle-link.active .circle-link__number {
  color: var(--community-coral);
}

.circle-rail__note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 6px 8px 0;
  padding: 13px 12px;
  border: 1px solid color-mix(in srgb, var(--community-yellow) 36%, var(--community-line));
  border-radius: 12px;
  background: var(--community-panel-warm);
}

.circle-rail__note-icon {
  color: var(--community-yellow);
  font-size: 15px;
  line-height: 1.2;
}

.circle-rail__note p {
  margin: 0;
  color: var(--community-text-soft);
  font-size: 11px;
  line-height: 1.55;
}

.community-stream {
  min-width: 0;
}

.composer-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--community-line);
  border-radius: var(--community-radius);
  background: var(--community-panel);
  box-shadow: var(--community-shadow);
}

.composer-card__accent {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: var(--community-coral);
}

.composer-card__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 22px 22px 14px;
}

.composer-user,
.author-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
}

.composer-user {
  width: 42px;
  height: 42px;
}

.avatar-image,
.avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-image {
  object-fit: cover;
}

.avatar-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--community-coral);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
}

.composer-intro {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.composer-intro strong {
  overflow: hidden;
  color: var(--community-text);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.composer-intro span {
  color: var(--community-text-soft);
  font-size: 12px;
  line-height: 1.45;
}

.composer-target {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--community-text-faint);
  font-size: 11px;
  white-space: nowrap;
}

.composer-target button {
  max-width: 130px;
  overflow: hidden;
  padding: 4px 8px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--community-coral) 10%, var(--community-panel));
  color: var(--community-coral);
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.composer-circle-picker {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 0 22px 14px;
  scrollbar-width: none;
}

.composer-circle-picker::-webkit-scrollbar {
  display: none;
}

.composer-circle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-height: 30px;
  padding: 4px 9px 4px 5px;
  border: 1px solid var(--community-line);
  border-radius: 999px;
  background: var(--community-panel-soft);
  color: var(--community-text-soft);
  font-size: 11px;
  font-weight: 700;
  transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
}

.composer-circle:hover,
.composer-circle.active {
  border-color: color-mix(in srgb, var(--community-coral) 48%, var(--community-line));
  background: color-mix(in srgb, var(--community-coral) 11%, var(--community-panel));
  color: var(--community-coral);
}

.composer-circle__visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  overflow: hidden;
  border-radius: 7px;
  background: var(--community-panel);
  color: var(--community-coral);
  font-size: 11px;
  font-weight: 800;
}

.composer-circle__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.composer-input {
  display: block;
  width: calc(100% - 44px);
  min-height: 98px;
  margin: 0 22px;
  padding: 13px 14px;
  resize: vertical;
  border: 1px solid var(--community-line);
  border-radius: 11px;
  outline: none;
  background: var(--community-panel-soft);
  color: var(--community-text);
  font: inherit;
  font-size: 14px;
  line-height: 1.7;
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.composer-input::placeholder {
  color: var(--community-text-faint);
}

.composer-input:focus {
  border-color: color-mix(in srgb, var(--community-coral) 62%, var(--community-line));
  background: var(--community-panel);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--community-coral) 13%, transparent);
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
  padding: 12px 22px 0;
}

.upload-card {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 9px;
  background: var(--community-panel-soft);
}

.upload-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(20, 32, 51, 0.76);
  color: #fff;
  font-size: 17px;
  line-height: 1;
}

.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 22px 20px;
}

.composer-tools {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.composer-tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 9px;
  border-radius: 8px;
  color: var(--community-text-soft);
  font-size: 12px;
  font-weight: 700;
}

.composer-tool:hover:not(:disabled) {
  background: var(--community-panel-soft);
  color: var(--community-coral);
}

.composer-tool:disabled,
.publish-btn:disabled,
.loadmore-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.composer-tool__icon {
  color: var(--community-mint);
  font-size: 17px;
}

.composer-helper {
  overflow: hidden;
  color: var(--community-text-faint);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stream-toolbar {
  align-items: flex-end;
  padding: 32px 4px 13px;
}

.stream-toolbar__meta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding-bottom: 2px;
  color: var(--community-text-faint);
  font-size: 11px;
  white-space: nowrap;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--community-mint);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--community-mint) 15%, transparent);
}

.moment-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.moment-card {
  position: relative;
  overflow: hidden;
  padding: 20px 22px 15px 48px;
  border: 1px solid var(--community-line);
  border-radius: var(--community-radius-sm);
  background: var(--community-panel);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.moment-card:hover {
  border-color: var(--community-line-strong);
  box-shadow: var(--community-shadow-soft);
  transform: translateY(-1px);
}

.moment-card__timeline {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  width: 1px;
  background: var(--community-line);
}

.moment-card__timeline span {
  position: absolute;
  top: 28px;
  left: -4px;
  width: 9px;
  height: 9px;
  border: 2px solid var(--community-panel);
  border-radius: 50%;
  background: var(--community-coral);
  box-shadow: 0 0 0 1px var(--community-coral);
}

.moment-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.moment-author {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.author-link {
  width: 34px;
  height: 34px;
}

.moment-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.moment-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.author-name {
  overflow: hidden;
  color: var(--community-text);
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-name:hover {
  color: var(--community-coral);
}

.moment-time,
.moment-subline {
  color: var(--community-text-faint);
  font-size: 11px;
  line-height: 1.4;
}

.moment-subline {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.moment-card__context {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 5px 8px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--community-yellow) 12%, var(--community-panel));
  color: var(--community-yellow);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.context-arrow {
  font-size: 14px;
}

.delete-btn {
  padding: 5px 3px;
  color: var(--community-text-faint);
  font-size: 11px;
}

.delete-btn:hover {
  color: var(--community-coral);
}

.moment-body {
  cursor: pointer;
  padding-top: 14px;
}

.moment-content {
  margin: 0;
  color: var(--community-text);
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
}

.moment-media {
  display: grid;
  gap: 6px;
  margin-top: 14px;
  max-width: 520px;
}

.moment-media.count-1 {
  grid-template-columns: minmax(0, 380px);
}

.moment-media.count-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.moment-media.count-3,
.moment-media.count-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.moment-media__item {
  position: relative;
  min-height: 104px;
  overflow: hidden;
  border-radius: 9px;
  background: var(--community-panel-soft);
}

.moment-media.count-1 .moment-media__item {
  min-height: 250px;
}

.moment-media__image {
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
  transition: transform 260ms ease;
}

.moment-body:hover .moment-media__image {
  transform: scale(1.025);
}

.moment-media__more {
  position: absolute;
  right: 9px;
  bottom: 9px;
  padding: 4px 7px;
  border-radius: 7px;
  background: rgba(20, 32, 51, 0.78);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
}

.moment-footer {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-top: 15px;
}

.moment-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--community-text-faint);
  font-size: 12px;
  font-weight: 700;
}

.moment-action:hover,
.moment-action--accent {
  color: var(--community-coral);
}

.moment-action strong {
  font-size: 12px;
}

.feed-loadmore {
  display: flex;
  justify-content: center;
  padding: 8px 0 2px;
}

.loadmore-btn {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--community-line);
  border-radius: 9px;
  background: var(--community-panel);
  color: var(--community-text-soft);
  font-size: 12px;
  font-weight: 700;
  transition: border-color 180ms ease, color 180ms ease, background-color 180ms ease;
}

.loadmore-btn:hover:not(:disabled) {
  border-color: var(--community-coral);
  background: color-mix(in srgb, var(--community-coral) 7%, var(--community-panel));
  color: var(--community-coral);
}

.feed-state {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed var(--community-line-strong);
  border-radius: var(--community-radius-sm);
  color: var(--community-text-soft);
  text-align: center;
}

.feed-state--loading {
  flex-direction: row;
  min-height: 180px;
  border-style: solid;
  font-size: 13px;
}

.feed-state__loader {
  width: 16px;
  height: 16px;
  border: 2px solid var(--community-line);
  border-top-color: var(--community-coral);
  border-radius: 50%;
  animation: community-spin 700ms linear infinite;
}

.feed-state__sticker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 3px;
  border-radius: 14px;
  background: var(--community-panel-warm);
  color: var(--community-yellow);
  font-size: 22px;
}

.feed-state strong {
  color: var(--community-text);
  font-size: 15px;
}

.feed-state > span:not(.feed-state__sticker):not(.feed-state__loader) {
  color: var(--community-text-faint);
  font-size: 12px;
}

.empty-action {
  min-height: 34px;
  margin-top: 8px;
  padding: 0 13px;
  font-size: 12px;
}

.community-pulse {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pulse-section {
  padding: 18px;
  border: 1px solid var(--community-line);
  border-radius: var(--community-radius);
  background: var(--community-panel);
}

.pulse-section--hot {
  border-top: 3px solid var(--community-yellow);
}

.pulse-heading {
  align-items: flex-start;
  margin-bottom: 14px;
}

.pulse-heading__spark {
  color: var(--community-yellow);
  font-size: 22px;
  line-height: 1;
}

.hot-list,
.topic-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hot-item,
.topic-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  text-align: left;
}

.hot-item {
  gap: 8px;
  padding: 8px 6px;
  border-radius: 9px;
  transition: background-color 180ms ease, transform 180ms ease;
}

.hot-item:hover,
.hot-item.active {
  background: var(--community-panel-soft);
  transform: translateX(2px);
}

.hot-item__rank {
  width: 19px;
  color: var(--community-text-faint);
  font-size: 10px;
  font-weight: 800;
}

.hot-item__visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 10px;
  background: color-mix(in srgb, var(--community-coral) 12%, var(--community-panel));
  color: var(--community-coral);
  font-size: 12px;
  font-weight: 800;
}

.hot-item__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-item__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.hot-item__copy strong {
  overflow: hidden;
  color: var(--community-text);
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-item__copy span {
  color: var(--community-text-faint);
  font-size: 10px;
}

.hot-item__arrow,
.topic-item__arrow {
  color: var(--community-text-faint);
  font-size: 15px;
}

.hot-item:hover .hot-item__arrow,
.hot-item.active .hot-item__arrow,
.topic-item:hover .topic-item__arrow {
  color: var(--community-coral);
}

.topic-item {
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 10px 25px 10px 9px;
  border-left: 2px solid var(--community-line);
  transition: border-color 180ms ease, background-color 180ms ease;
}

.topic-item:hover {
  border-left-color: var(--community-coral);
  background: var(--community-panel-soft);
}

.topic-item__circle {
  color: var(--community-mint);
  font-size: 10px;
  font-weight: 800;
}

.topic-item strong {
  display: -webkit-box;
  overflow: hidden;
  color: var(--community-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.topic-item__arrow {
  position: absolute;
  top: 11px;
  right: 8px;
}

.topic-empty {
  padding: 4px 2px;
  color: var(--community-text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.pulse-note {
  position: relative;
  overflow: hidden;
  padding: 20px 18px 17px;
  border-radius: var(--community-radius);
  background: var(--community-panel-warm);
}

.pulse-note__mark {
  display: block;
  height: 17px;
  color: var(--community-yellow);
  font-family: Georgia, serif;
  font-size: 38px;
  line-height: 0.8;
}

.pulse-note p {
  max-width: 210px;
  margin: 9px 0 14px;
  color: var(--community-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.65;
}

.pulse-note__line {
  display: block;
  width: 30px;
  height: 3px;
  border-radius: 3px;
  background: var(--community-coral);
}

.pulse-note__caption {
  display: block;
  margin-top: 7px;
  color: var(--community-text-faint);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

button:focus-visible,
textarea:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--community-coral) 36%, transparent);
  outline-offset: 2px;
}

@keyframes community-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .community-layout {
    grid-template-columns: 196px minmax(0, 1fr) 250px;
    gap: 18px;
  }

  .community-main {
    width: min(100% - 32px, 1120px);
  }

  .hero-stats {
    gap: 12px;
  }

  .hero-stat {
    gap: 4px;
  }
}

@media (max-width: 960px) {
  .community-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .hero-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .community-layout {
    grid-template-columns: 196px minmax(0, 1fr);
  }

  .community-pulse {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    position: static;
  }

  .pulse-note {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .community-main {
    width: min(100% - 24px, 640px);
    padding-top: 22px;
    padding-bottom: 48px;
  }

  .community-hero {
    padding: 6px 0 22px;
  }

  .community-hero h1 {
    font-size: 34px;
  }

  .hero-copy p {
    margin-top: 10px;
    font-size: 14px;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
    gap: 8px;
  }

  .hero-stat {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .hero-stats__divider {
    display: none;
  }

  .hero-publish {
    min-height: 38px;
    padding: 0 11px;
  }

  .community-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 18px;
  }

  .circle-rail {
    position: static;
    width: 100%;
  }

  .circle-rail__head {
    align-items: center;
    padding: 0 0 10px;
  }

  .circle-rail__list {
    display: flex;
    flex-direction: row;
    gap: 7px;
    overflow-x: auto;
    padding: 10px 0 4px;
    scrollbar-width: none;
  }

  .circle-rail__list::-webkit-scrollbar {
    display: none;
  }

  .circle-link {
    display: inline-flex;
    width: auto;
    min-width: max-content;
    min-height: 42px;
    padding: 5px 10px 5px 6px;
    border: 1px solid var(--community-line);
    border-radius: 999px;
    background: var(--community-panel);
  }

  .circle-link::before {
    display: none;
  }

  .circle-link:hover,
  .circle-link.active {
    transform: none;
  }

  .circle-link__marker {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }

  .circle-link__body {
    gap: 0;
  }

  .circle-link__body span,
  .circle-link__number {
    display: none;
  }

  .circle-rail__note {
    display: none;
  }

  .community-pulse {
    display: flex;
    flex-direction: column;
  }

  .pulse-note {
    order: 3;
  }

  .composer-card__head {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 19px 16px 12px;
  }

  .composer-target {
    grid-column: 2;
    justify-self: start;
  }

  .composer-circle-picker {
    padding-right: 16px;
    padding-left: 16px;
  }

  .composer-input {
    width: calc(100% - 32px);
    margin-right: 16px;
    margin-left: 16px;
  }

  .composer-footer {
    align-items: flex-end;
    flex-direction: column;
    gap: 10px;
    padding: 12px 16px 16px;
  }

  .composer-tools,
  .publish-btn {
    width: 100%;
  }

  .composer-tools {
    justify-content: space-between;
  }

  .publish-btn {
    min-height: 40px;
  }

  .stream-toolbar {
    padding-top: 22px;
  }

  .moment-card {
    padding: 17px 15px 14px 37px;
  }

  .moment-card__timeline {
    left: 16px;
  }

  .moment-card__timeline span {
    top: 25px;
  }

  .moment-card__context {
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .moment-media.count-1 {
    grid-template-columns: 1fr;
  }

  .moment-media.count-1 .moment-media__item {
    min-height: 210px;
  }

  .upload-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding-right: 16px;
    padding-left: 16px;
  }
}

@media (max-width: 430px) {
  .hero-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hero-publish {
    grid-column: 1 / -1;
    width: 100%;
  }

  .moment-title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 1px;
  }

  .moment-card__context {
    margin-left: 4px;
    padding: 4px 6px;
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .community-page *,
  .community-page *::before,
  .community-page *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

/* Second pass: forum-first hierarchy. The center feed carries the page; side rails stay quiet. */
.community-main {
  width: min(1400px, calc(100% - 64px));
  padding-top: 30px;
}

.community-hero {
  align-items: center;
  padding: 8px 0 22px;
}

.hero-copy p {
  margin-top: 8px;
}

.hero-stats {
  gap: 20px;
}

.hero-publish {
  min-height: 36px;
  border: 1px solid var(--community-coral);
  border-radius: 7px;
  background: transparent;
  box-shadow: none;
  color: var(--community-coral);
}

.hero-publish:hover {
  background: color-mix(in srgb, var(--community-coral) 9%, transparent);
  box-shadow: none;
  transform: none;
}

.hero-publish__plus {
  border-color: currentColor;
}

.community-layout {
  grid-template-columns: 196px minmax(0, 1fr) 252px;
  gap: 32px;
}

.circle-rail {
  padding-right: 20px;
  border-right: 1px solid var(--community-line);
}

.community-pulse {
  padding-left: 20px;
  border-left: 1px solid var(--community-line);
}

.circle-rail__head {
  padding-right: 0;
  padding-left: 0;
}

.circle-rail__head h2,
.pulse-heading h2 {
  font-size: 16px;
  letter-spacing: -0.02em;
}

.circle-link {
  min-height: 48px;
  padding: 6px 0;
  border-radius: 0;
  background: transparent;
}

.circle-link:hover,
.circle-link.active {
  background: transparent;
  transform: none;
}

.circle-link::before {
  left: -21px;
}

.circle-link__marker {
  border: 0;
  border-radius: 8px;
  background: transparent;
}

.circle-link__marker--all {
  background: transparent;
}

.circle-link:hover .circle-link__marker,
.circle-link.active .circle-link__marker {
  color: var(--community-coral);
}

.circle-rail__note {
  margin: 10px 0 0;
  padding: 14px 0 0;
  border: 0;
  border-top: 1px solid var(--community-line);
  border-radius: 0;
  background: transparent;
}

.composer-card {
  border: 0;
  border-bottom: 1px solid var(--community-line);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.composer-card__accent {
  display: none;
}

.composer-card__head {
  padding: 0 0 10px;
}

.composer-intro span {
  font-size: 11px;
}

.composer-target {
  font-size: 11px;
}

.composer-target button {
  border-radius: 5px;
  background: transparent;
  color: var(--community-coral);
}

.composer-circle-picker {
  padding: 0 0 9px;
}

.composer-input {
  width: 100%;
  min-height: 58px;
  margin: 0;
  resize: vertical;
  border-radius: 6px;
  background: transparent;
}

.composer-input:focus {
  background: var(--community-panel);
}

.composer-footer {
  padding: 10px 0 14px;
}

.publish-btn {
  min-height: 34px;
  padding: 0 18px;
  border-radius: 6px;
  box-shadow: none;
}

.stream-toolbar {
  padding: 24px 0 11px;
  border-bottom: 1px solid var(--community-line);
}

.stream-toolbar h2 {
  font-size: 19px;
}

.moment-feed {
  gap: 0;
}

.moment-card {
  padding: 23px 0 21px 38px;
  border: 0;
  border-bottom: 1px solid var(--community-line);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.moment-card:hover {
  border-color: var(--community-line);
  box-shadow: none;
  transform: none;
}

.moment-card__timeline {
  left: 15px;
}

.moment-card__timeline span {
  top: 31px;
  width: 8px;
  height: 8px;
  border-width: 1px;
}

.moment-card__context {
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: var(--community-mint);
  font-size: 11px;
}

.moment-card__context .context-arrow {
  color: var(--community-text-faint);
}

.moment-footer {
  padding-top: 12px;
}

.feed-state {
  min-height: 220px;
  border-width: 1px 0;
  border-radius: 0;
}

.loadmore-btn {
  border-width: 0 0 1px;
  border-radius: 0;
  background: transparent;
}

.pulse-section {
  padding: 0 0 18px;
  border: 0;
  border-bottom: 1px solid var(--community-line);
  border-radius: 0;
  background: transparent;
}

.pulse-section--hot {
  border-top: 0;
}

.pulse-section + .pulse-section {
  padding-top: 18px;
}

.pulse-heading {
  margin-bottom: 10px;
}

.hot-item {
  padding: 9px 0;
  border-radius: 0;
}

.hot-item:hover,
.hot-item.active {
  background: transparent;
  transform: none;
}

.hot-item__visual {
  width: 28px;
  height: 28px;
  border-radius: 7px;
}

.topic-item {
  border-radius: 0;
}

.pulse-note {
  padding: 18px 0 0;
  border-radius: 0;
  background: transparent;
}

@media (max-width: 1180px) {
  .community-layout {
    grid-template-columns: 184px minmax(0, 1fr) 238px;
    gap: 24px;
  }
}

@media (max-width: 960px) {
  .community-layout {
    grid-template-columns: 184px minmax(0, 1fr);
  }

  .community-pulse {
    padding-left: 0;
    border-left: 0;
  }
}

@media (max-width: 720px) {
  .community-main {
    width: min(100% - 24px, 640px);
    padding-top: 22px;
  }

  .circle-rail {
    padding-right: 0;
    border-right: 0;
  }

  .circle-link {
    min-height: 42px;
    padding: 5px 10px 5px 6px;
    border: 1px solid var(--community-line);
    border-radius: 999px;
    background: var(--community-panel);
  }

  .circle-link::before {
    display: none;
  }

  .circle-link.active {
    border-color: color-mix(in srgb, var(--community-coral) 50%, var(--community-line));
    background: color-mix(in srgb, var(--community-coral) 8%, var(--community-panel));
  }

  .composer-card__head {
    padding-bottom: 9px;
  }

  .composer-input {
    min-height: 56px;
  }

  .moment-card {
    padding-top: 19px;
    padding-bottom: 18px;
  }

  .moment-card__timeline {
    left: 16px;
  }
}

/* Independent desktop scroll regions: keep the side indexes available while the feed moves. */
.community-page {
  height: 100vh;
  overflow: hidden;
}

.community-main {
  box-sizing: border-box;
  height: calc(100vh - 68px);
  margin-top: 68px;
  padding-bottom: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.community-layout {
  flex: 1;
  min-height: 0;
  align-items: stretch;
  overflow: hidden;
}

.circle-rail,
.community-stream,
.community-pulse {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.circle-rail,
.community-pulse {
  position: static;
}

.feed-search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 0 0;
}

.feed-search {
  display: flex;
  align-items: center;
  min-width: 0;
  width: min(100%, 560px);
  min-height: 42px;
  border: 1px solid var(--community-line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--community-panel) 82%, transparent);
  transition: border-color 160ms ease, background-color 160ms ease;
}

.feed-search:focus-within {
  border-color: color-mix(in srgb, var(--community-coral) 62%, var(--community-line));
  background: var(--community-panel);
}

.feed-search__icon {
  flex: 0 0 auto;
  padding-left: 13px;
  color: var(--community-text-faint);
  font-size: 21px;
  line-height: 1;
  transform: translateY(-1px);
}

.feed-search input {
  min-width: 0;
  flex: 1;
  height: 40px;
  padding: 0 10px;
  border: 0;
  outline: 0;
  color: var(--community-text);
  background: transparent;
  font: inherit;
  font-size: 13px;
}

.feed-search input::placeholder {
  color: var(--community-text-faint);
}

.feed-search__clear,
.feed-search__submit {
  flex: 0 0 auto;
  border: 0;
  cursor: pointer;
  font: inherit;
}

.feed-search__clear {
  width: 28px;
  height: 28px;
  color: var(--community-text-faint);
  background: transparent;
  font-size: 20px;
  line-height: 1;
}

.feed-search__clear:hover {
  color: var(--community-text);
}

.feed-search__submit {
  align-self: stretch;
  min-width: 58px;
  margin: 4px;
  padding: 0 12px;
  border-radius: 6px;
  color: #fff;
  background: var(--community-coral);
  font-size: 12px;
  font-weight: 700;
  transition: opacity 160ms ease, transform 160ms ease;
}

.feed-search__submit:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.feed-search__state {
  flex: 0 0 auto;
  color: var(--community-text-faint);
  font-size: 11px;
  line-height: 1.4;
}

/* Keep the intro band compact so the forum columns get the majority of the viewport. */
.community-main {
  padding-top: clamp(12px, 1.8vh, 22px);
  padding-bottom: 12px;
}

.community-hero {
  gap: clamp(18px, 2.6vw, 34px);
  padding: 4px 0 clamp(12px, 1.8vh, 18px);
}

.hero-kicker {
  margin-bottom: 7px;
}

.community-hero h1 {
  font-size: clamp(32px, 3.2vw, 40px);
}

.hero-copy p {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.hero-stats {
  gap: clamp(12px, 1.5vw, 20px);
}

.hero-stat strong {
  font-size: 18px;
}

.community-layout {
  padding-top: clamp(14px, 1.8vh, 22px);
}

@media (max-height: 820px) and (min-width: 721px) {
  .community-main {
    padding-top: 10px;
    padding-bottom: 8px;
  }

  .community-hero {
    padding-bottom: 10px;
  }

  .community-hero h1 {
    font-size: 34px;
  }

  .hero-copy p {
    margin-top: 4px;
    font-size: 12px;
  }

  .community-layout {
    padding-top: 12px;
  }
}

@media (max-width: 960px) {
  .community-main {
    height: calc(100vh - 68px);
  }

  .community-layout {
    overflow: hidden;
  }
}

@media (max-width: 720px) {
  .community-page {
    height: auto;
    overflow: visible;
  }

  .community-main {
    height: auto;
    margin-top: 68px;
    padding-top: 22px;
    padding-bottom: 48px;
    overflow: visible;
    display: block;
  }

  .community-hero {
    padding: 6px 0 22px;
  }

  .community-hero h1 {
    font-size: 34px;
  }

  .hero-copy p {
    margin-top: 10px;
    font-size: 14px;
  }

  .community-layout {
    height: auto;
    overflow: visible;
  }

  .circle-rail,
  .community-stream,
  .community-pulse {
    overflow: visible;
    scrollbar-gutter: auto;
  }

  .feed-search-row {
    display: block;
    padding-top: 14px;
  }

  .feed-search {
    width: 100%;
  }

  .feed-search__state {
    display: block;
    padding: 8px 2px 0;
  }
}
</style>
