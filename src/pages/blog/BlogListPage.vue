<template>
  <div class="blog-list">
    <div class="list-header">
      <button type="button" class="header-back" @click="goBack()">{{ backLabel }}</button>
      <h1 class="page-title">{{ pageTitle }}</h1>
      <p class="page-desc">{{ pageDescription }}</p>
    </div>

    <div class="list-content" :class="{ 'list-content--solo': hasAuthorFilter }">
      <aside v-if="!hasAuthorFilter" class="sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">分类</h3>
          <ul class="category-list">
            <li 
              class="category-item" 
              :class="{ active: !currentCategoryId }"
              @click="selectCategory(null)"
            >
              <span>全部文章</span>
              <span class="count">{{ totalCount }}</span>
            </li>
            <li 
              v-for="category in categories" 
              :key="category.id"
              class="category-item"
              :class="{ active: currentCategoryId === category.id }"
              @click="selectCategory(category)"
            >
              <span>{{ category.categoryName }}</span>
              <span class="count">{{ category.articleCount || 0 }}</span>
            </li>
          </ul>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-title">标签</h3>
          <div class="tag-cloud">
            <span 
              v-for="tag in tags" 
              :key="tag.id"
              class="tag-item"
              :class="{ active: currentTagId === tag.id }"
              @click="selectTag(tag)"
            >
              {{ tag.tagName }}
            </span>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <div class="content-header">
          <div v-if="!hasAuthorFilter" class="sort-tabs">
            <button 
              class="sort-tab" 
              :class="{ active: sortBy === 'latest' }"
              @click="changeSort('latest')"
            >
              最新
            </button>
            <button 
              class="sort-tab"
              :class="{ active: sortBy === 'hot' }"
              @click="changeSort('hot')"
            >
              热门
            </button>
          </div>
          <div v-else class="author-archive-badge">作者文章归档</div>
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              v-model="keyword" 
              type="text" 
              :placeholder="searchPlaceholder"
              @input="handleSearch"
            />
          </div>
        </div>

        <div class="articles-container" v-loading="loading">
          <article 
            v-for="article in articles" 
            :key="article.id" 
            class="article-item"
            @click="goToArticle(article.id)"
          >
            <div class="item-cover" v-if="article.coverImage">
              <img :src="article.coverImage" :alt="article.title" />
            </div>
            <div class="item-main">
              <div class="item-meta">
                <span class="category-tag">{{ article.categoryName || '未分类' }}</span>
                <span class="publish-time">{{ formatDate(article.publishTime) }}</span>
              </div>
              <h2 class="item-title">{{ getDisplayTitle(article.title) }}</h2>
              <p class="item-summary">{{ getSummaryPreview(article.summary) || '暂无摘要' }}</p>
              <div class="item-footer">
                <button class="author-info author-button" type="button" @click.stop="goToAuthorProfile(article)">
                  <img v-if="article.authorAvatar" :src="article.authorAvatar" :alt="article.authorName || '作者头像'" class="author-avatar author-avatar-image" />
                  <div v-else class="author-avatar">{{ article.authorName?.charAt(0) || 'U' }}</div>
                  <span class="author-name">{{ article.authorName || '匿名' }}</span>
                </button>
                <div class="article-stats">
                  <span class="stat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ formatNumber(article.viewCount) }}
                  </span>
                  <span class="stat" :class="{ 'stat-liked': article.isLiked === 1 }">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {{ article.isLiked === 1 ? `已赞 ${formatNumber(article.likeCount)}` : formatNumber(article.likeCount) }}
                  </span>
                  <span class="stat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {{ formatNumber(article.commentCount) }}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <div v-if="!loading && articles.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
              <line x1="7" y1="8" x2="17" y2="8"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
              <line x1="7" y1="16" x2="13" y2="16"/>
            </svg>
            <p>暂无文章</p>
          </div>
        </div>

        <div v-if="totalCount > pageSize" class="pagination">
          <button 
            class="page-btn" 
            :disabled="pageNum <= 1"
            @click="changePage(pageNum - 1)"
          >
            上一页
          </button>
          <span class="page-info">{{ pageNum }} / {{ totalPages }}</span>
          <button 
            class="page-btn"
            :disabled="pageNum >= totalPages"
            @click="changePage(pageNum + 1)"
          >
            下一页
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { blogApi } from '@/api/modules/blog'
import { useSmartBack } from '@/composables/useSmartBack'

const router = useRouter()
const route = useRoute()
const { backLabel, goBack } = useSmartBack(route, router, { fallback: '/blog' })

const articles = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(false)

const pageNum = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const sortBy = ref('latest')
const keyword = ref('')
const currentCategoryId = ref(null)
const currentTagId = ref(null)
const currentAuthorId = ref(null)
const currentAuthorName = ref('')

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
const hasAuthorFilter = computed(() => !!currentAuthorId.value)
const pageTitle = computed(() => {
  if (hasAuthorFilter.value) {
    return currentAuthorName.value ? `${currentAuthorName.value} 的博客` : '作者博客'
  }
  return currentCategoryName.value || '全部文章'
})
const pageDescription = computed(() => {
  if (hasAuthorFilter.value) {
    return '按时间查看这位作者已经公开发布的文章。'
  }
  if (currentCategoryName.value) {
    return '按分类查看相关文章。'
  }
  return '探索技术世界的无限可能'
})
const searchPlaceholder = computed(() => hasAuthorFilter.value ? '搜索这位作者的文章...' : '搜索文章...')

const currentCategoryName = computed(() => {
  if (!currentCategoryId.value) return null
  const category = categories.value.find(c => c.id === currentCategoryId.value)
  return category?.categoryName
})

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const goToArticle = (id) => {
  router.push({
    path: `/blog/article/${id}`,
    query: {
      back: route.fullPath
    }
  })
}

const goToAuthorProfile = (article) => {
  if (!article?.authorId) return
  router.push({
    path: `/profile/${article.authorId}`,
    query: {
      back: route.fullPath
    }
  })
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

const normalizeArticleItem = (item) => {
  if (!item) return item

  return {
    ...item,
    coverImage: item.coverImage || item.cover_image || '',
    publishTime: item.publishTime || item.publish_time || item.createdTime || item.created_time || '',
    isLiked: item.isLiked ?? item.is_liked ?? 0
  }
}

const selectCategory = (category) => {
  currentCategoryId.value = category?.id || null
  currentTagId.value = null
  pageNum.value = 1
  loadArticles()
}

const selectTag = (tag) => {
  currentTagId.value = currentTagId.value === tag.id ? null : tag.id
  currentCategoryId.value = null
  pageNum.value = 1
  loadArticles()
}

const changeSort = (sort) => {
  sortBy.value = sort
  pageNum.value = 1
  loadArticles()
}

const handleSearch = () => {
  pageNum.value = 1
  loadArticles()
}

const changePage = (page) => {
  pageNum.value = page
  loadArticles()
}

const loadArticles = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      title: keyword.value || undefined,
      authorId: currentAuthorId.value || undefined,
      categoryId: currentCategoryId.value || undefined
    }

    let res
    if (currentTagId.value && !hasAuthorFilter.value) {
      res = await blogApi.getArticlesByTag(currentTagId.value, params)
      articles.value = (res.data || []).map(normalizeArticleItem)
      totalCount.value = res.data?.length || 0
    } else if (currentCategoryId.value && !hasAuthorFilter.value) {
      res = await blogApi.getArticlesByCategory(currentCategoryId.value, params)
      articles.value = (res.data || []).map(normalizeArticleItem)
      totalCount.value = res.data?.length || 0
    } else {
      res = await blogApi.getArticlePage(params)
      articles.value = (res.data?.result || []).map(normalizeArticleItem)
      totalCount.value = res.data?.total || 0
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await blogApi.getCategoryTree()
    categories.value = res.data || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadTags = async () => {
  try {
    const res = await blogApi.getTagList()
    tags.value = res.data || []
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadTags(), loadArticles()])
})

watch(() => route.query, (query) => {
  currentCategoryId.value = query.categoryId ? Number(query.categoryId) : null
  currentAuthorId.value = query.authorId ? Number(query.authorId) : null
  currentAuthorName.value = query.authorName ? String(query.authorName) : ''
  currentTagId.value = null
  pageNum.value = 1
  loadArticles()
}, { immediate: true })
</script>

<style scoped>
.blog-list {
  min-height: 100vh;
  background: var(--color-bg);
}

.list-header {
  padding: 80px var(--spacing-xl) var(--spacing-2xl);
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  text-align: center;
}

.header-back {
  margin-bottom: var(--spacing-lg);
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: var(--text-sm);
  cursor: pointer;
}

.header-back:hover {
  color: rgba(255, 255, 255, 0.92);
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: white;
  margin-bottom: var(--spacing-sm);
}

.page-desc {
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.6);
}

.list-content {
  display: flex;
  gap: var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.list-content--solo {
  max-width: 1040px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-section {
  margin-bottom: var(--spacing-xl);
}

.sidebar-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-md);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-item:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text);
}

.category-item.active {
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-weight: 500;
}

.category-item .count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag-item {
  padding: 4px 10px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-item:hover {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.tag-item.active {
  background: var(--color-accent);
  color: white;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.sort-tabs {
  display: flex;
  gap: var(--spacing-xs);
}

.author-archive-badge {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 600;
}

.sort-tab {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sort-tab:hover {
  color: var(--color-text);
}

.sort-tab.active {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.search-box svg {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
}

.search-box input::placeholder {
  color: var(--color-text-muted);
}

.articles-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.article-item {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-base);
}

.article-item:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-md);
}

.item-cover {
  width: 200px;
  height: 140px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.article-item:hover .item-cover img {
  transform: scale(1.05);
}

.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.category-tag {
  padding: 2px 8px;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-radius: var(--radius-sm);
}

.publish-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.item-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.item-summary {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-md);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.author-button {
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

.author-avatar {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar-image {
  object-fit: cover;
}

.author-name {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.article-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.stat-liked {
  color: #dc2626;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  color: var(--color-text-muted);
}

.empty-state svg {
  margin-bottom: var(--spacing-md);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

.page-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-border-hover);
  color: var(--color-text);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .list-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .article-item {
    flex-direction: column;
  }

  .item-cover {
    width: 100%;
    height: 200px;
  }

  .content-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
}
</style>
