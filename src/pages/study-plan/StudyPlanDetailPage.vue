<template>
  <div class="community-detail-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <Header />

    <main class="detail-main">
      <div class="detail-layout">
        <section class="detail-column">
          <div class="back-row">
            <button type="button" class="back-btn" @click="router.push('/study-plan')">返回圈子社区</button>
          </div>

          <article v-if="momentDetail" class="moment-shell">
            <div class="moment-head">
              <button type="button" class="author-link" @click="goToUser(momentDetail.author?.userId)">
                <img v-if="momentDetail.author?.avatar" :src="momentDetail.author.avatar" :alt="momentDetail.author?.nickName" class="avatar-image" />
                <span v-else class="avatar-fallback">{{ getAuthorInitial(momentDetail.author) }}</span>
              </button>

              <div class="moment-meta">
                <div class="moment-title-row">
                  <button type="button" class="author-name" @click="goToUser(momentDetail.author?.userId)">
                    {{ momentDetail.author?.nickName || '未知用户' }}
                  </button>
                  <span class="circle-badge">
                    <span class="circle-badge__visual" :class="{ 'is-image': isCircleImage(momentDetail.circleIcon) }">
                      <img
                        v-if="isCircleImage(momentDetail.circleIcon)"
                        :src="momentDetail.circleIcon"
                        :alt="momentDetail.circleName || '圈子'"
                        class="circle-badge__image"
                      />
                      <span v-else class="circle-badge__emoji">{{ getCircleVisualText(momentDetail.circleIcon, momentDetail.circleName) }}</span>
                    </span>
                    <span class="circle-badge__label">{{ momentDetail.circleName || '默认圈子' }}</span>
                  </span>
                </div>
                <div class="moment-subline">
                  <span>@{{ momentDetail.author?.userName || 'unknown' }}</span>
                  <span>{{ formatTime(momentDetail.createdTime) }}</span>
                </div>
              </div>

              <button
                v-if="momentDetail.ownedByCurrentUser"
                type="button"
                class="ghost-btn"
                @click="handleDeleteMoment"
              >
                删除动态
              </button>
            </div>

            <div class="moment-body">
              <p class="moment-content">{{ momentDetail.content || '分享了一张图片' }}</p>
              <div v-if="momentDetail.pictures?.length" class="moment-grid" :class="`count-${Math.min(momentDetail.pictures.length, 4)}`">
                <img
                  v-for="(picture, index) in momentDetail.pictures"
                  :key="`${momentDetail.id}-${index}`"
                  :src="picture"
                  :alt="`${momentDetail.author?.nickName || '用户'} 的动态图片`"
                  class="moment-grid__image"
                />
              </div>
            </div>

            <div class="moment-foot">
              <span>{{ commentList.length }} 条讨论</span>
              <span>点击头像可进入用户详情</span>
            </div>
          </article>

          <section class="comment-composer">
            <div class="composer-head">
              <div class="composer-copy">
                <strong>{{ replyTarget ? `回复 ${replyTarget.author?.nickName || replyTarget.author?.userName || '用户'}` : '参与讨论' }}</strong>
                <span>{{ replyTarget ? '你的回复会挂在对应讨论下面' : '欢迎继续分享观点、吐槽或补充' }}</span>
              </div>
              <button v-if="replyTarget" type="button" class="ghost-btn" @click="clearReplyTarget">取消回复</button>
            </div>

            <textarea
              v-model.trim="commentForm.content"
              class="composer-input"
              rows="4"
              maxlength="1000"
              placeholder="说点什么吧，也可以上传表情包或截图。"
            ></textarea>

            <div v-if="commentForm.pictures.length" class="upload-grid">
              <div v-for="(picture, index) in commentForm.pictures" :key="`${picture}-${index}`" class="upload-card">
                <img :src="picture" alt="comment" />
                <button type="button" class="upload-remove" @click="removeCommentPicture(index)">×</button>
              </div>
            </div>

            <div class="composer-foot">
              <div class="composer-actions">
                <button type="button" class="secondary-btn" :disabled="uploadingImage" @click="pickCommentImages">
                  {{ uploadingImage ? '上传中...' : '添加图片/表情包' }}
                </button>
                <span class="composer-count">{{ commentForm.content.length }}/1000</span>
              </div>
              <button type="button" class="primary-btn" :disabled="submittingComment" @click="submitComment">
                {{ submittingComment ? '提交中...' : (replyTarget ? '回复' : '发表评论') }}
              </button>
            </div>
          </section>

          <section class="comment-panel">
            <div class="panel-head">
              <h2>讨论区</h2>
              <span>{{ commentList.length }} 条</span>
            </div>

            <div v-if="loading" class="empty-state">讨论内容加载中...</div>

            <div v-else-if="commentList.length" class="comment-stream">
              <article v-for="comment in commentList" :key="comment.id" class="comment-card">
                <div class="comment-head">
                  <button type="button" class="author-link" @click="goToUser(comment.author?.userId)">
                    <img v-if="comment.author?.avatar" :src="comment.author.avatar" :alt="comment.author?.nickName" class="avatar-image avatar-image--small" />
                    <span v-else class="avatar-fallback avatar-fallback--small">{{ getAuthorInitial(comment.author) }}</span>
                  </button>

                  <div class="comment-main">
                    <div class="comment-main__top">
                      <button type="button" class="author-name" @click="goToUser(comment.author?.userId)">
                        {{ comment.author?.nickName || '未知用户' }}
                      </button>
                      <span class="comment-time">{{ formatTime(comment.createdTime) }}</span>
                    </div>
                    <p class="comment-content">{{ comment.content || '发了一张图' }}</p>
                    <div v-if="comment.pictures?.length" class="comment-grid">
                      <img
                        v-for="(picture, pictureIndex) in comment.pictures"
                        :key="`${comment.id}-${pictureIndex}`"
                        :src="picture"
                        alt="comment"
                        class="comment-grid__image"
                      />
                    </div>
                    <div class="comment-actions">
                      <button type="button" class="text-action" @click="setReplyTarget(comment)">回复</button>
                      <button
                        v-if="comment.ownedByCurrentUser"
                        type="button"
                        class="text-action text-action--danger"
                        @click="handleDeleteComment(comment)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="comment.replies?.length" class="reply-stream">
                  <article v-for="reply in comment.replies" :key="reply.id" class="reply-card">
                    <button type="button" class="author-link" @click="goToUser(reply.author?.userId)">
                      <img v-if="reply.author?.avatar" :src="reply.author.avatar" :alt="reply.author?.nickName" class="avatar-image avatar-image--tiny" />
                      <span v-else class="avatar-fallback avatar-fallback--tiny">{{ getAuthorInitial(reply.author) }}</span>
                    </button>

                    <div class="reply-main">
                      <div class="reply-top">
                        <button type="button" class="author-name" @click="goToUser(reply.author?.userId)">
                          {{ reply.author?.nickName || '未知用户' }}
                        </button>
                        <span v-if="reply.replyToAuthor" class="reply-target">
                          回复 {{ reply.replyToAuthor.nickName || reply.replyToAuthor.userName }}
                        </span>
                        <span class="comment-time">{{ formatTime(reply.createdTime) }}</span>
                      </div>
                      <p class="comment-content">{{ reply.content || '发了一张图' }}</p>
                      <div v-if="reply.pictures?.length" class="comment-grid">
                        <img
                          v-for="(picture, pictureIndex) in reply.pictures"
                          :key="`${reply.id}-${pictureIndex}`"
                          :src="picture"
                          alt="reply"
                          class="comment-grid__image"
                        />
                      </div>
                      <div class="comment-actions">
                        <button type="button" class="text-action" @click="setReplyTarget(reply, comment)">回复</button>
                        <button
                          v-if="reply.ownedByCurrentUser"
                          type="button"
                          class="text-action text-action--danger"
                          @click="handleDeleteComment(reply)"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              </article>
            </div>

            <div v-else class="empty-state">
              <strong>还没有评论</strong>
              <span>不如你先开个头，给这条动态添点热度。</span>
            </div>
          </section>
        </section>

        <aside class="side-column">
          <section class="info-panel">
            <div class="panel-head">
              <h3>作者卡片</h3>
            </div>
            <div v-if="momentDetail?.author" class="author-panel">
              <button type="button" class="author-panel__link" @click="goToUser(momentDetail.author.userId)">
                <img v-if="momentDetail.author.avatar" :src="momentDetail.author.avatar" :alt="momentDetail.author.nickName" class="author-panel__avatar" />
                <span v-else class="author-panel__avatar author-panel__avatar--fallback">
                  {{ getAuthorInitial(momentDetail.author) }}
                </span>
              </button>
              <strong>{{ momentDetail.author.nickName || momentDetail.author.userName }}</strong>
              <span>@{{ momentDetail.author.userName }}</span>
              <p>{{ momentDetail.author.introduce || '这个用户还没有填写个人简介。' }}</p>
            </div>
          </section>

          <section class="info-panel">
            <div class="panel-head">
              <h3>讨论说明</h3>
            </div>
            <div class="tips-list">
              <div class="tip-item">
                <strong>点头像查看资料</strong>
                <span>讨论过程中可以快速跳到对方主页了解背景。</span>
              </div>
              <div class="tip-item">
                <strong>回复会挂到主评论下面</strong>
                <span>这样楼层不会无限嵌套，阅读体验更稳定。</span>
              </div>
              <div class="tip-item">
                <strong>支持图片和表情包</strong>
                <span>评论区也能发梗图、截图和补充资料。</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import Header from '@/layouts/AppHeader.vue'
import { useThemeStore } from '@/stores/modules/theme'
import { shareApi } from '@/api/modules/share'
import { fileApi } from '@/api/modules/file'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const loading = ref(false)
const submittingComment = ref(false)
const uploadingImage = ref(false)
const momentDetail = ref(null)
const commentList = ref([])
const replyTarget = ref(null)

const commentForm = reactive({
  content: '',
  pictures: []
})

const momentId = computed(() => route.params.id)

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

const loadMomentDetail = async () => {
  if (!momentId.value) {
    ElMessage.error('动态 ID 不存在')
    router.push('/study-plan')
    return
  }

  loading.value = true
  try {
    const response = await shareApi.getMomentDetail(momentId.value)
    if (response?.code !== 200) {
      throw new Error(response?.message || '获取动态详情失败')
    }

    momentDetail.value = response.data
    commentList.value = response.data?.comments || []
  } catch (error) {
    console.error('获取动态详情失败:', error)
    ElMessage.error(error.message || '获取动态详情失败')
  } finally {
    loading.value = false
  }
}

const pickCommentImages = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*'

  input.onchange = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    if (commentForm.pictures.length + files.length > 6) {
      ElMessage.warning('单条评论最多上传 6 张图片')
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
        const response = await fileApi.uploadImage(file, '社区评论图片')
        const fileUrl = response?.data?.filePath
        if (!response || response.code !== 200 || !fileUrl) {
          throw new Error(response?.message || '评论图片上传失败')
        }
        uploadedUrls.push(fileUrl)
      }
      commentForm.pictures = [...commentForm.pictures, ...uploadedUrls]
      ElMessage.success('评论图片上传成功')
    } catch (error) {
      console.error('上传评论图片失败:', error)
      ElMessage.error(error.message || '评论图片上传失败')
    } finally {
      uploadingImage.value = false
      loadingInstance.close()
    }
  }

  input.click()
}

const removeCommentPicture = (index) => {
  commentForm.pictures.splice(index, 1)
}

const setReplyTarget = (comment, rootComment = null) => {
  replyTarget.value = {
    id: comment.id,
    parentId: rootComment?.id || comment.parentId || 0,
    author: comment.author
  }
}

const clearReplyTarget = () => {
  replyTarget.value = null
}

const submitComment = async () => {
  if (!commentForm.content && !commentForm.pictures.length) {
    ElMessage.warning('请输入评论内容或上传图片')
    return
  }

  submittingComment.value = true
  try {
    const response = await shareApi.addComment({
      momentId: momentId.value,
      parentId: replyTarget.value ? (replyTarget.value.parentId || replyTarget.value.id) : 0,
      replyId: replyTarget.value ? replyTarget.value.id : 0,
      content: commentForm.content,
      pictures: commentForm.pictures
    })

    if (response?.code !== 200) {
      throw new Error(response?.message || '评论失败')
    }

    ElMessage.success(replyTarget.value ? '回复成功' : '评论成功')
    commentForm.content = ''
    commentForm.pictures = []
    clearReplyTarget()
    await loadMomentDetail()
  } catch (error) {
    console.error('提交评论失败:', error)
    ElMessage.error(error.message || '提交评论失败')
  } finally {
    submittingComment.value = false
  }
}

const handleDeleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm('确认删除这条评论吗？', '删除评论', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })

    const response = await shareApi.deleteComment(comment.id)
    if (response?.code !== 200) {
      throw new Error(response?.message || '删除失败')
    }

    ElMessage.success('评论已删除')
    await loadMomentDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.message || '删除评论失败')
    }
  }
}

const handleDeleteMoment = async () => {
  try {
    await ElMessageBox.confirm('确认删除这条动态吗？删除后会返回社区首页。', '删除动态', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })

    const response = await shareApi.deleteMoment(momentId.value)
    if (response?.code !== 200) {
      throw new Error(response?.message || '删除失败')
    }

    ElMessage.success('动态已删除')
    router.push('/study-plan')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除动态失败:', error)
      ElMessage.error(error.message || '删除动态失败')
    }
  }
}

const goToUser = (userId) => {
  if (!userId) return
  router.push(`/profile/${userId}`)
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

onMounted(() => {
  loadMomentDetail()
})
</script>

<style scoped>
.community-detail-page {
  --detail-bg: #f4f6fb;
  --detail-surface: rgba(255, 255, 255, 0.92);
  --detail-surface-strong: #ffffff;
  --detail-surface-muted: #eef2f7;
  --detail-border: rgba(15, 23, 42, 0.08);
  --detail-text: #0f172a;
  --detail-text-soft: #475569;
  --detail-text-faint: #64748b;
  --detail-accent: #0f766e;
  --detail-accent-soft: rgba(15, 118, 110, 0.1);
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), transparent 26%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
    var(--detail-bg);
  color: var(--detail-text);
}

.community-detail-page.is-dark {
  --detail-bg: #09111f;
  --detail-surface: rgba(15, 23, 42, 0.92);
  --detail-surface-strong: #101a2d;
  --detail-surface-muted: #162338;
  --detail-border: rgba(148, 163, 184, 0.14);
  --detail-text: #e2e8f0;
  --detail-text-soft: #cbd5e1;
  --detail-text-faint: #94a3b8;
  --detail-accent: #2dd4bf;
  --detail-accent-soft: rgba(45, 212, 191, 0.12);
}

.detail-main {
  max-width: 1320px;
  margin: 0 auto;
  padding: 18px 20px 28px;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) 300px;
  gap: 18px;
}

.detail-column,
.side-column {
  min-width: 0;
}

.back-row {
  margin-bottom: 14px;
}

.back-btn,
.primary-btn,
.secondary-btn,
.ghost-btn,
.author-link,
.author-name,
.text-action {
  font: inherit;
}

.back-btn,
.primary-btn,
.secondary-btn,
.ghost-btn {
  border-radius: 12px;
  cursor: pointer;
}

.back-btn {
  border: 1px solid var(--detail-border);
  background: transparent;
  color: var(--detail-text);
  padding: 10px 14px;
}

.moment-shell,
.comment-composer,
.comment-panel,
.info-panel {
  border: 1px solid var(--detail-border);
  background: var(--detail-surface);
  backdrop-filter: blur(18px);
  border-radius: 20px;
}

.moment-shell,
.comment-composer,
.comment-panel {
  padding: 20px;
}

.moment-shell {
  margin-bottom: 16px;
}

.moment-head,
.comment-head,
.reply-card,
.composer-foot,
.panel-head {
  display: flex;
  align-items: flex-start;
}

.moment-head {
  gap: 14px;
}

.moment-meta,
.comment-main,
.reply-main {
  flex: 1;
  min-width: 0;
}

.author-link {
  border: 0;
  background: transparent;
  padding: 0;
}

.avatar-image,
.avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  object-fit: cover;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--detail-surface-muted);
  color: var(--detail-text);
  font-weight: 700;
}

.avatar-image--small,
.avatar-fallback--small {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.avatar-image--tiny,
.avatar-fallback--tiny {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.moment-title-row,
.moment-subline,
.comment-main__top,
.reply-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.moment-subline,
.comment-time,
.reply-target,
.moment-foot {
  color: var(--detail-text-faint);
  font-size: 13px;
}

.author-name {
  border: 0;
  background: transparent;
  padding: 0;
  font-weight: 700;
  color: var(--detail-text);
  cursor: pointer;
}

.circle-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--detail-accent-soft);
  color: var(--detail-accent);
  font-size: 12px;
  max-width: min(100%, 220px);
}

.circle-badge__visual {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 999px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--detail-surface-muted);
}

.circle-badge__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-badge__emoji {
  font-size: 12px;
  font-weight: 700;
  color: var(--detail-text);
}

.circle-badge__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ghost-btn {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: var(--detail-text-faint);
  padding: 6px 0;
}

.moment-body {
  margin: 18px 0 16px;
}

.moment-content,
.comment-content {
  margin: 0;
  line-height: 1.9;
  white-space: pre-wrap;
}

.moment-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.moment-grid.count-1 {
  grid-template-columns: minmax(0, 1fr);
}

.moment-grid__image,
.comment-grid__image {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  background: var(--detail-surface-muted);
}

.moment-grid__image {
  min-height: 170px;
  max-height: 320px;
}

.comment-composer {
  margin-bottom: 16px;
}

.composer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.composer-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.composer-copy span,
.composer-count {
  color: var(--detail-text-faint);
  font-size: 13px;
}

.composer-input {
  width: 100%;
  min-height: 122px;
  resize: vertical;
  border: 1px solid var(--detail-border);
  border-radius: 18px;
  background: var(--detail-surface-strong);
  color: var(--detail-text);
  padding: 16px 18px;
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
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
}

.upload-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.composer-foot {
  justify-content: space-between;
  margin-top: 16px;
}

.composer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.primary-btn {
  border: 0;
  background: var(--detail-accent);
  color: #fff;
  padding: 10px 16px;
}

.secondary-btn {
  border: 1px solid var(--detail-border);
  background: transparent;
  color: var(--detail-text);
  padding: 10px 16px;
}

.panel-head {
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-head h2,
.panel-head h3 {
  margin: 0;
}

.panel-head span {
  color: var(--detail-text-faint);
  font-size: 13px;
}

.comment-stream {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.comment-card {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--detail-border);
}

.comment-card:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.comment-head {
  gap: 12px;
}

.comment-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.comment-grid__image {
  aspect-ratio: 1 / 1;
}

.comment-actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.text-action {
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--detail-text-faint);
  cursor: pointer;
}

.text-action--danger {
  color: #ef4444;
}

.reply-stream {
  margin-left: 52px;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-card {
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  background: var(--detail-surface-strong);
  border: 1px solid var(--detail-border);
}

.empty-state {
  padding: 28px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  color: var(--detail-text-faint);
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-panel {
  padding: 18px;
}

.author-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.author-panel__link {
  border: 0;
  background: transparent;
  padding: 0;
  align-self: flex-start;
  cursor: pointer;
}

.author-panel__avatar {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  object-fit: cover;
}

.author-panel__avatar--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--detail-surface-muted);
  color: var(--detail-text);
  font-weight: 700;
}

.author-panel span,
.author-panel p,
.tip-item span {
  color: var(--detail-text-faint);
  font-size: 13px;
}

.author-panel p,
.tip-item span {
  margin: 0;
  line-height: 1.8;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 1100px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .side-column {
    order: -1;
  }
}

@media (max-width: 768px) {
  .detail-main {
    padding: 14px 14px 24px;
  }

  .moment-head,
  .composer-head,
  .composer-foot {
    flex-direction: column;
    align-items: flex-start;
  }

  .ghost-btn {
    margin-left: 0;
  }

  .moment-grid {
    grid-template-columns: 1fr;
  }

  .reply-stream {
    margin-left: 0;
  }
}
</style>
