<template>
  <div class="blog-home">
    <div class="blog-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">博客实验室</span>
          <span class="title-accent">记录 · 拆解 · 沉淀</span>
        </h1>
        <p class="hero-desc">
          把题解、项目经验、架构思考和踩坑复盘写成文章，让知识从一次输入变成长期资产
        </p>
        <div class="hero-actions">
          <button class="btn-primary" @click="navigateTo('/blog/list')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
              <line x1="7" y1="8" x2="17" y2="8"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
              <line x1="7" y1="16" x2="13" y2="16"/>
            </svg>
            进入文章广场
          </button>
          <button v-if="userStore.isLoggedIn" class="btn-secondary" @click="navigateTo('/blog/write')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="2"/>
            </svg>
            写下新文章
          </button>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="decoration-circle c1"></div>
        <div class="decoration-circle c2"></div>
        <div class="decoration-circle c3"></div>
      </div>
    </div>

    <div class="blog-content">
      <section class="section hot-articles">
        <div class="section-header">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            热门文章
          </h2>
          <button class="btn-more" @click="navigateTo('/blog/list')">查看全部 →</button>
        </div>
        <div class="articles-grid">
          <article 
            v-for="article in hotArticles" 
            :key="article.id" 
            class="article-card"
            @click="goToArticle(article.id)"
          >
            <div class="card-cover" v-if="article.coverImage">
              <img :src="article.coverImage" :alt="article.title" />
            </div>
            <div class="card-content">
              <div class="card-meta">
                <span class="category-tag">{{ article.categoryName || '未分类' }}</span>
              </div>
              <h3 class="card-title">{{ article.title }}</h3>
              <p class="card-summary">{{ article.summary || '暂无摘要' }}</p>
              <div class="card-footer">
                <div class="author-info">
                  <div class="author-avatar">{{ article.authorName?.charAt(0) || 'U' }}</div>
                  <span class="author-name">{{ article.authorName || '匿名' }}</span>
                </div>
                <div class="article-stats">
                  <span class="stat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ formatNumber(article.viewCount) }}
                  </span>
                  <span class="stat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {{ formatNumber(article.likeCount) }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="section latest-articles">
        <div class="section-header">
          <h2 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            最新发布
          </h2>
        </div>
        <div class="articles-list">
          <article 
            v-for="article in latestArticles" 
            :key="article.id" 
            class="article-item"
            @click="goToArticle(article.id)"
          >
            <div class="item-main">
              <div class="item-meta">
                <span class="category-tag small">{{ article.categoryName || '未分类' }}</span>
                <span class="publish-time">{{ formatDate(article.publishTime) }}</span>
              </div>
              <h3 class="item-title">{{ article.title }}</h3>
              <p class="item-summary">{{ article.summary || '暂无摘要' }}</p>
              <div class="item-tags" v-if="article.tags?.length">
                <span v-for="tag in article.tags.slice(0, 3)" :key="tag.id" class="tag">
                  {{ tag.tagName }}
                </span>
              </div>
            </div>
            <div class="item-cover" v-if="article.coverImage">
              <img :src="article.coverImage" :alt="article.title" />
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { blogApi } from '@/api/blog'

const router = useRouter()
const userStore = useUserStore()

const hotArticles = ref([])
const latestArticles = ref([])

const navigateTo = (path) => {
  router.push(path)
}

const goToArticle = (id) => {
  router.push(`/blog/article/${id}`)
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const loadData = async () => {
  try {
    const [hotRes, latestRes] = await Promise.all([
      blogApi.getHotArticles(4),
      blogApi.getLatestArticles(5)
    ])
    
    if (hotRes.data) {
      hotArticles.value = hotRes.data
    }
    if (latestRes.data) {
      latestArticles.value = latestRes.data
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.blog-home {
  min-height: 100vh;
  background: var(--color-bg);
}

.blog-hero {
  position: relative;
  padding: 120px var(--spacing-xl) 80px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  margin-bottom: var(--spacing-lg);
}

.title-line {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
}

.title-accent {
  display: block;
  font-size: var(--text-lg);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin-top: var(--spacing-sm);
}

.hero-desc {
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.6);
  max-width: 500px;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--text-base);
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--text-base);
  font-weight: 600;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.decoration-circle.c1 {
  width: 400px;
  height: 400px;
  background: #10b981;
  top: -100px;
  right: -100px;
}

.decoration-circle.c2 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  bottom: -50px;
  left: -50px;
}

.decoration-circle.c3 {
  width: 200px;
  height: 200px;
  background: #f59e0b;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.blog-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.section {
  margin-bottom: var(--spacing-3xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.section-title svg {
  color: var(--color-accent);
}

.btn-more {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.btn-more:hover {
  color: var(--color-accent);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.article-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-hover);
}

.card-cover {
  aspect-ratio: 16/9;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.article-card:hover .card-cover img {
  transform: scale(1.05);
}

.card-content {
  padding: var(--spacing-lg);
}

.card-meta {
  margin-bottom: var(--spacing-sm);
}

.category-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-radius: var(--radius-sm);
}

.category-tag.small {
  font-size: 10px;
  padding: 2px 6px;
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-summary {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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

.articles-list {
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

.item-main {
  flex: 1;
  min-width: 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.publish-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.item-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.item-summary {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.item-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.tag {
  padding: 2px 8px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
}

.item-cover {
  width: 180px;
  height: 120px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .blog-hero {
    padding: 100px var(--spacing-md) 60px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .article-item {
    flex-direction: column;
  }

  .item-cover {
    width: 100%;
    height: 180px;
  }
}
</style>
