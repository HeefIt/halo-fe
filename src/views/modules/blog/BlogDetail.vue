<template>
  <div class="blog-detail" v-if="article">
    <article class="article-container">
      <header class="article-header">
        <div class="header-content">
          <div class="article-meta">
            <span class="category-tag">{{ article.categoryName || '未分类' }}</span>
            <span class="publish-time">{{ formatDate(article.publishTime) }}</span>
            <span class="reading-time">约 {{ readingTime }} 分钟阅读</span>
          </div>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-author">
            <div class="author-avatar">{{ article.authorName?.charAt(0) || 'U' }}</div>
            <div class="author-info">
              <span class="author-name">{{ article.authorName || '匿名' }}</span>
              <span class="author-desc">技术博主</span>
            </div>
          </div>
        </div>
        <div class="header-cover" v-if="article.coverImage">
          <img :src="article.coverImage" :alt="article.title" />
        </div>
      </header>

      <div class="article-body">
        <div class="article-content" v-html="article.content"></div>

        <div class="article-tags" v-if="article.tags?.length">
          <span class="tag-label">标签：</span>
          <span v-for="tag in article.tags" :key="tag.id" class="tag">
            {{ tag.tagName }}
          </span>
        </div>

        <div class="article-questions" v-if="article.relatedSubjectIds?.length">
          <h3 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            相关题目
          </h3>
          <p class="section-desc">这篇文章关联了以下练习题，可以帮助你巩固知识点</p>
          <div class="question-list">
            <div 
              v-for="(subjectId, index) in article.relatedSubjectIds" 
              :key="subjectId"
              class="question-item"
              @click="goToPractice(subjectId)"
            >
              <span class="question-index">{{ index + 1 }}</span>
              <span class="question-title">题目 #{{ subjectId }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <footer class="article-footer">
        <div class="article-actions">
          <button 
            class="action-btn" 
            :class="{ liked: isLiked }"
            @click="handleLike"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{{ article.likeCount || 0 }}</span>
          </button>
          <button class="action-btn" @click="scrollToComments">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{{ commentCount }}</span>
          </button>
          <button class="action-btn" @click="handleShare">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span>分享</span>
          </button>
        </div>
      </footer>
    </article>

    <section class="comments-section" id="comments">
      <h3 class="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        评论 ({{ commentCount }})
      </h3>

      <div class="comment-form" v-if="userStore.isLoggedIn">
        <div class="form-avatar">{{ userStore.userName?.charAt(0) || 'U' }}</div>
        <div class="form-input">
          <textarea 
            v-model="commentContent" 
            placeholder="写下你的评论..."
            rows="3"
          ></textarea>
          <button class="btn-submit" @click="submitComment" :disabled="!commentContent.trim()">
            发表评论
          </button>
        </div>
      </div>
      <div class="login-tip" v-else>
        <router-link to="/login">登录</router-link> 后参与讨论
      </div>

      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-avatar">{{ comment.userName?.charAt(0) || 'U' }}</div>
          <div class="comment-main">
            <div class="comment-header">
              <span class="comment-author">{{ comment.userName }}</span>
              <span class="comment-time">{{ formatDate(comment.createdTime) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
            <div class="comment-actions">
              <button class="action-btn-small" @click="likeComment(comment.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                {{ comment.likeCount || 0 }}
              </button>
              <button class="action-btn-small" @click="replyTo(comment)">回复</button>
            </div>
            <div v-if="comment.replies?.length" class="replies">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-avatar">{{ reply.userName?.charAt(0) || 'U' }}</div>
                <div class="reply-main">
                  <span class="reply-author">{{ reply.userName }}</span>
                  <p class="reply-content">{{ reply.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { blogApi } from '@/api/blog'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const article = ref(null)
const comments = ref([])
const isLiked = ref(false)
const commentContent = ref('')

const readingTime = computed(() => {
  if (!article.value?.content) return 1
  const words = article.value.content.length
  return Math.max(1, Math.ceil(words / 500))
})

const commentCount = computed(() => {
  const fromArticle = Number(article.value?.commentCount)
  if (Number.isFinite(fromArticle) && fromArticle > 0) return fromArticle
  return comments.value?.length || 0
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const goToPractice = (subjectId) => {
  router.push(`/practice/${subjectId}`)
}

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isLiked.value) {
      await blogApi.unlikeArticle(article.value.id)
      article.value.likeCount--
    } else {
      await blogApi.likeArticle(article.value.id)
      article.value.likeCount++
    }
    isLiked.value = !isLiked.value
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: article.value.title,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    ElMessage.success('链接已复制到剪贴板')
  }
}

const scrollToComments = () => {
  document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
}

const submitComment = async () => {
  if (!commentContent.value.trim()) return

  try {
    await blogApi.addComment({
      articleId: article.value.id,
      content: commentContent.value,
      userId: userStore.userInfo.id,
      userName: userStore.userName
    })
    commentContent.value = ''
    loadComments()
    ElMessage.success('评论成功')
  } catch (error) {
    console.error('评论失败:', error)
    ElMessage.error('评论失败')
  }
}

const replyTo = (comment) => {
  commentContent.value = `@${comment.userName} `
}

const likeComment = async (commentId) => {
  // TODO: 实现评论点赞
}

const loadArticle = async () => {
  try {
    const res = await blogApi.getArticleDetail(route.params.id)
    article.value = res.data
    isLiked.value = res.data?.isLiked === 1

    blogApi.recordViewLog(route.params.id)
  } catch (error) {
    console.error('加载文章失败:', error)
  }
}

const loadComments = async () => {
  try {
    const res = await blogApi.getCommentPage(route.params.id, { pageNum: 1, pageSize: 50 })
    comments.value = res.data?.result || []
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

onMounted(async () => {
  await loadArticle()
  await loadComments()
})
</script>

<style scoped>
.blog-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.article-container {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.article-header {
  padding: var(--spacing-2xl);
  border-bottom: 1px solid var(--color-border);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.category-tag {
  padding: 4px 10px;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-radius: var(--radius-sm);
}

.publish-time, .reading-time {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.article-title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.3;
  margin-bottom: var(--spacing-lg);
}

.article-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.author-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  font-size: var(--text-lg);
  font-weight: 600;
  border-radius: 50%;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.author-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.header-cover {
  margin-top: var(--spacing-xl);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.header-cover img {
  width: 100%;
  height: auto;
}

.article-body {
  padding: var(--spacing-2xl);
}

.article-content {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-text);
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  font-weight: 700;
}

.article-content :deep(p) {
  margin-bottom: var(--spacing-md);
}

.article-content :deep(pre) {
  background: var(--color-bg-subtle);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.article-content :deep(code) {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
}

.article-tags {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.tag-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.tag {
  padding: 4px 12px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-full);
}

.article-questions {
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.section-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-md);
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.question-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.question-item:hover {
  border-color: var(--color-accent);
}

.question-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 600;
  border-radius: 50%;
}

.question-title {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.article-footer {
  padding: var(--spacing-xl) var(--spacing-2xl);
  border-top: 1px solid var(--color-border);
}

.article-actions {
  display: flex;
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-bg-muted);
}

.action-btn.liked {
  color: #ef4444;
  background: #fef2f2;
}

.comments-section {
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.comment-form {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.form-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
}

.form-input textarea {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  resize: vertical;
  outline: none;
}

.form-input textarea:focus {
  border-color: var(--color-accent);
}

.btn-submit {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: white;
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-tip {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}

.login-tip a {
  color: var(--color-accent);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.comment-item {
  display: flex;
  gap: var(--spacing-md);
}

.comment-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.comment-main {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.comment-author {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.comment-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.comment-content {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.action-btn-small {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn-small:hover {
  color: var(--color-text);
}

.replies {
  margin-top: var(--spacing-md);
  padding-left: var(--spacing-md);
  border-left: 2px solid var(--color-border);
}

.reply-item {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.reply-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: 50%;
}

.reply-main {
  flex: 1;
}

.reply-author {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text);
}

.reply-content {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
</style>
