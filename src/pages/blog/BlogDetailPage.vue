<template>
  <div class="blog-detail" :class="{ 'is-dark': themeStore.isDark }" v-if="article">
    <div class="reading-progress">
      <div class="reading-progress-bar" :style="{ width: `${readingProgress}%` }"></div>
    </div>

    <div class="detail-shell">
      <main class="detail-main">
        <article class="article-card">
          <header class="article-hero">
            <button class="back-link" type="button" @click="goBack()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              {{ backLabel }}
            </button>

            <div class="hero-meta">
              <span class="category-tag">{{ article.categoryName || '未分类' }}</span>
              <span>{{ formatDate(article.publishTime) }}</span>
              <span>约 {{ readingTime }} 分钟阅读</span>
            </div>

            <h1 class="article-title" v-html="renderedArticleTitle"></h1>

            <div v-if="article.summary" class="article-summary" v-html="renderedArticleSummary"></div>

            <div class="hero-author-row">
              <button class="article-author author-button" type="button" @click="goToAuthorProfile(article)">
                <img v-if="article.authorAvatar" :src="article.authorAvatar" :alt="article.authorName || '作者头像'" class="author-avatar author-avatar-image" />
                <div v-else class="author-avatar">{{ article.authorName?.charAt(0) || 'U' }}</div>
                <div class="author-info">
                  <span class="author-name">{{ article.authorName || '匿名作者' }}</span>
                  <span class="author-desc">查看作者主页与已发布内容</span>
                </div>
              </button>

              <div class="article-stats">
                <div class="stat-pill">
                  <span class="stat-label">点赞</span>
                  <strong>{{ article.likeCount || 0 }}</strong>
                </div>
                <div class="stat-pill">
                  <span class="stat-label">评论</span>
                  <strong>{{ commentCount }}</strong>
                </div>
                <div class="stat-pill">
                  <span class="stat-label">专题</span>
                  <strong>{{ articleTags.length }}</strong>
                </div>
              </div>
            </div>

            <div class="header-cover" v-if="article.coverImage">
              <img :src="article.coverImage" :alt="article.title" />
            </div>
          </header>

          <div ref="articleBodyRef" class="article-body">
            <div class="article-content" v-html="renderedArticleContent" @click="handleArticleContentClick"></div>

            <div class="article-tags" v-if="articleTags.length">
              <span class="tag-label">文章标签</span>
              <span v-for="tag in articleTags" :key="tag.id || tag.tagName" class="tag">
                {{ tag.tagName }}
              </span>
            </div>

            <div class="article-questions" v-if="article.relatedSubjectIds?.length">
              <h3 class="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                延伸练习
              </h3>
              <p class="section-desc">把这篇文章关联的练习题顺手刷掉，阅读和训练更容易形成闭环。</p>
              <div class="question-list">
                <div
                  v-for="(subjectId, index) in article.relatedSubjectIds"
                  :key="subjectId"
                  class="question-item"
                  @click="goToPractice(subjectId)"
                >
                  <span class="question-index">{{ index + 1 }}</span>
                  <span class="question-title">练习题 #{{ subjectId }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <footer class="article-footer">
            <div class="article-actions">
              <button v-if="canEditArticle" class="action-btn action-btn-edit" @click="goToEditArticle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
                <span>{{ article?.status === 1 ? '编辑文章' : '继续编辑' }}</span>
              </button>
              <button class="action-btn" :class="{ liked: isLiked }" @click="handleLike">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{{ isLiked ? '已点赞' : '点赞' }} {{ article.likeCount || 0 }}</span>
              </button>
              <button class="action-btn" @click="scrollToComments">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>评论 {{ commentCount }}</span>
              </button>
              <button class="action-btn" @click="handleShare">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span>分享文章</span>
              </button>
            </div>
          </footer>
        </article>

        <section class="article-navigation" v-if="articleNavigation.previous || articleNavigation.next">
          <button
            v-if="articleNavigation.previous"
            type="button"
            class="nav-card"
            @click="goToArticle(articleNavigation.previous.id)"
          >
            <span class="nav-label">上一篇</span>
            <strong class="nav-title">{{ normalizeDisplayTitle(articleNavigation.previous.title) }}</strong>
            <span class="nav-summary">{{ getPlainTextFromMixedContent(articleNavigation.previous.summary) || '继续查看上一篇相关内容' }}</span>
          </button>

          <button
            v-if="articleNavigation.next"
            type="button"
            class="nav-card nav-card-next"
            @click="goToArticle(articleNavigation.next.id)"
          >
            <span class="nav-label">下一篇</span>
            <strong class="nav-title">{{ normalizeDisplayTitle(articleNavigation.next.title) }}</strong>
            <span class="nav-summary">{{ getPlainTextFromMixedContent(articleNavigation.next.summary) || '继续查看下一篇相关内容' }}</span>
          </button>
        </section>
      </main>

      <aside class="detail-sidebar">
        <section class="sidebar-card">
          <h3 class="sidebar-title">阅读信息</h3>
          <div class="sidebar-stats">
            <div class="sidebar-stat">
              <span>发布时间</span>
              <strong>{{ formatDate(article.publishTime) || '待发布' }}</strong>
            </div>
            <div class="sidebar-stat">
              <span>预计阅读</span>
              <strong>{{ readingTime }} 分钟</strong>
            </div>
            <div class="sidebar-stat">
              <span>评论数</span>
              <strong>{{ commentCount }}</strong>
            </div>
            <div class="sidebar-stat">
              <span>阅读进度</span>
              <strong>{{ Math.round(readingProgress) }}%</strong>
            </div>
          </div>
        </section>

        <section class="sidebar-card" v-if="tocItems.length">
          <div class="sidebar-head">
            <h3 class="sidebar-title">文章目录</h3>
            <span class="sidebar-hint">{{ tocItems.length }} 节</span>
          </div>
          <nav class="toc-nav">
            <button
              v-for="item in tocItems"
              :key="item.id"
              type="button"
              class="toc-link"
              :class="[`level-${item.level}`, { active: activeHeadingId === item.id }]"
              @click="scrollToHeading(item.id)"
            >
              {{ item.text }}
            </button>
          </nav>
        </section>

        <section class="sidebar-card" v-if="articleTags.length">
          <h3 class="sidebar-title">关键词</h3>
          <div class="keyword-list">
            <span v-for="tag in articleTags" :key="tag.id || tag.tagName" class="keyword-tag">
              {{ tag.tagName }}
            </span>
          </div>
        </section>
      </aside>
    </div>

    <section class="comments-section" id="comments">
      <h3 class="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        评论区 ({{ commentCount }})
      </h3>

      <div class="comment-form" v-if="userStore.isLoggedIn">
        <div class="form-avatar">{{ userStore.userName?.charAt(0) || 'U' }}</div>
        <div class="form-input">
          <textarea
            v-model="commentContent"
            placeholder="写下你的观点、补充或提问..."
            rows="3"
          ></textarea>
          <button class="btn-submit" @click="submitComment" :disabled="!commentContent.trim()">
            发布评论
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
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import { blogApi } from '@/api/modules/blog'
import { useThemeStore } from '@/stores/modules/theme'
import { useUserStore } from '@/stores/modules/user'
import { useSmartBack } from '@/composables/useSmartBack'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const { backLabel, goBack } = useSmartBack(route, router, { fallback: '/blog/list' })

const article = ref(null)
const comments = ref([])
const isLiked = ref(false)
const commentContent = ref('')
const activeHeadingId = ref('')
const readingProgress = ref(0)
const articleNavigation = ref({ previous: null, next: null })

const articleBodyRef = ref(null)

const articleTags = computed(() => {
  if (!article.value?.tags?.length) return []
  return article.value.tags.map((tag, index) => {
    if (typeof tag === 'string') {
      return { id: `${tag}-${index}`, tagName: tag }
    }
    return tag
  })
})

const renderedArticleTitle = computed(() => renderArticleTitle(article.value?.title || ''))
const renderedArticleSummary = computed(() => renderArticleSummary(article.value?.summary || ''))

const readingTime = computed(() => {
  if (!article.value?.content) return 1
  const plainText = getPlainTextFromMixedContent(article.value.content)
  const words = plainText.length
  return Math.max(1, Math.ceil(words / 500))
})

const commentCount = computed(() => {
  const fromArticle = Number(article.value?.commentCount)
  if (Number.isFinite(fromArticle) && fromArticle > 0) return fromArticle
  return comments.value?.length || 0
})

const canEditArticle = computed(() => {
  if (!article.value?.authorId || !userStore.isLoggedIn) {
    return false
  }
  return userStore.isAdmin || Number(userStore.userId) === Number(article.value.authorId)
})

const processedArticle = computed(() => normalizeArticleContent(article.value?.content || ''))
const renderedArticleContent = computed(() => processedArticle.value.html)
const tocItems = computed(() => processedArticle.value.toc)
const codeBlocks = computed(() => processedArticle.value.codes)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const createHeadingId = (text, index) => {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized ? `section-${normalized}-${index}` : `section-${index}`
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
      .replace(/&#39;/g, '\'')
      .replace(/&quot;/g, '"')
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = String(value)
  return textarea.value
}

const extractTextFromHtml = (value) => {
  if (!value) return ''
  const parser = new DOMParser()
  const doc = parser.parseFromString(String(value), 'text/html')
  const root = doc.body
  if (!root) return normalizePlainText(String(value))

  const blockBreakTags = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'ASIDE', 'BLOCKQUOTE', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'])
  const lineBreakTags = new Set(['LI', 'TR'])
  let output = ''

  const walk = (node) => {
    if (!node) return

    if (node.nodeType === Node.TEXT_NODE) {
      output += node.textContent || ''
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const tagName = node.tagName
    if (tagName === 'BR') {
      output += '\n'
      return
    }

    Array.from(node.childNodes || []).forEach(walk)

    if (blockBreakTags.has(tagName)) {
      output += '\n\n'
      return
    }

    if (lineBreakTags.has(tagName)) {
      output += '\n'
    }
  }

  walk(root)
  return normalizePlainText(output)
}

const containsStructuralHtml = (value) => /<(h[1-6]|ul|ol|li|blockquote|table|pre|code|img|video|iframe)\b/i.test(String(value || ''))

const looksLikeMarkdown = (value) => {
  const text = String(value || '').trim()
  if (!text) return false

  return /(^|\n)\s{0,3}#{1,6}\s+\S+/m.test(text) ||
    /(^|\n)\s*[-*+]\s+\S+/m.test(text) ||
    /(^|\n)\s*\d+\.\s+\S+/m.test(text) ||
    /(^|\n)\s*>\s+\S+/m.test(text) ||
    /(^|\n)\s*```[\s\S]*?```/m.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    /__[^_]+__/.test(text) ||
    /`[^`]+`/.test(text) ||
    /\[[^\]]+\]\([^)]+\)/.test(text)
}

const markdownToHtml = (value) => marked.parse(value, {
  gfm: true,
  breaks: true
})

const normalizePlainText = (value) => {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const resolveMarkdownSourceText = (value) => {
  const rawValue = String(value || '').trim()
  if (!rawValue) return ''

  const decodedValue = decodeHtmlEntities(rawValue)
  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(rawValue)
  if (!hasHtmlTag) {
    return decodedValue
  }

  const plainText = extractTextFromHtml(rawValue)
  if (!containsStructuralHtml(rawValue) && looksLikeMarkdown(plainText)) {
    return decodeHtmlEntities(plainText)
  }

  return decodedValue
}

const getPlainTextFromMixedContent = (value) => {
  const normalized = resolveMarkdownSourceText(value)
  if (!normalized) return ''

  const html = /<\/?[a-z][\s\S]*>/i.test(normalized)
    ? normalized
    : looksLikeMarkdown(normalized)
      ? markdownToHtml(normalized)
      : `<p>${normalized}</p>`

  return extractTextFromHtml(html).replace(/\s+/g, ' ').trim()
}

const normalizeDisplayTitle = (value) => {
  return getPlainTextFromMixedContent(value)
    .replace(/^\s{0,3}#{1,6}\s+/, '')
    .trim()
}

const renderArticleTitle = (value) => {
  const normalized = normalizeDisplayTitle(value)
  if (!normalized) return ''

  return DOMPurify.sanitize(marked.parseInline(normalized), {
    USE_PROFILES: { html: true }
  })
}

const renderArticleSummary = (value) => {
  const normalized = resolveMarkdownSourceText(value)
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .trim()

  if (!normalized) {
    return ''
  }

  const segments = normalized
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean)

  const html = segments.map((segment) => {
    const inlineContent = marked.parseInline(segment.replace(/\n+/g, ' '))
    return `<p>${inlineContent}</p>`
  }).join('')

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  })
}

const normalizeArticleContent = (rawContent) => {
  if (!rawContent) {
    return { html: '<p>这篇文章暂时还没有正文内容。</p>', toc: [], codes: {} }
  }

  const resolvedSource = resolveMarkdownSourceText(rawContent)
  const sourceHtml = /<\/?[a-z][\s\S]*>/i.test(resolvedSource)
    ? resolvedSource
    : markdownToHtml(resolvedSource)

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div id="article-root">${sourceHtml}</div>`, 'text/html')
  const root = doc.querySelector('#article-root')

  if (!root) {
    return { html: '<p>文章内容暂时无法解析。</p>', toc: [], codes: {} }
  }

  const codes = {}

  root.querySelectorAll('*').forEach((element) => {
    element.removeAttribute('style')
    element.removeAttribute('width')
    element.removeAttribute('height')
    element.removeAttribute('align')

    if (!['PRE', 'CODE'].includes(element.tagName)) {
      element.removeAttribute('class')
    }
  })

  root.querySelectorAll('p').forEach((paragraph) => {
    const hasMedia = paragraph.querySelector('img, video, iframe, table, pre')
    const text = paragraph.textContent?.replace(/\u00a0/g, ' ').trim()
    if (!text && !hasMedia) {
      paragraph.remove()
    }
  })

  root.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer nofollow')
  })

  root.querySelectorAll('img').forEach((image) => {
    image.setAttribute('loading', 'lazy')
    if (!image.getAttribute('alt')) {
      image.setAttribute('alt', article.value?.title || '文章配图')
    }
  })

  root.querySelectorAll('pre').forEach((block, index) => {
    const codeElement = block.querySelector('code')
    const rawCode = codeElement?.textContent || block.textContent || ''
    const classNames = [...(codeElement?.classList || []), ...(block.classList || [])].join(' ')
    const matchedLanguage = classNames.match(/(?:language|lang)-([\w-]+)/)?.[1] || 'plaintext'
    const language = hljs.getLanguage(matchedLanguage) ? matchedLanguage : 'plaintext'
    const highlightedCode = hljs.highlight(rawCode, {
      language,
      ignoreIllegals: true
    }).value
    const codeId = `code-${index}`

    codes[codeId] = rawCode

    const wrapper = doc.createElement('div')
    wrapper.className = 'code-block'

    const toolbar = doc.createElement('div')
    toolbar.className = 'code-toolbar'
    toolbar.innerHTML = `
      <span class="code-language">${language}</span>
      <button type="button" class="copy-code-btn" data-copy-code="${codeId}">复制代码</button>
    `

    const pre = doc.createElement('pre')
    pre.className = 'content-pre'

    const code = doc.createElement('code')
    code.className = `hljs language-${language}`
    code.innerHTML = highlightedCode

    pre.appendChild(code)
    wrapper.appendChild(toolbar)
    wrapper.appendChild(pre)
    block.replaceWith(wrapper)
  })

  root.querySelectorAll('blockquote').forEach((quote) => {
    quote.classList.add('content-quote')
  })

  root.querySelectorAll('table').forEach((table) => {
    const wrapper = doc.createElement('div')
    wrapper.className = 'article-table-wrap'
    table.parentNode?.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  })

  const toc = []
  root.querySelectorAll('h1, h2, h3').forEach((heading, index) => {
    const text = heading.textContent?.trim()
    if (!text) return

    const id = createHeadingId(text, index)
    heading.setAttribute('id', id)
    toc.push({
      id,
      text,
      level: Number(heading.tagName.replace('H', ''))
    })
  })

  const sanitized = DOMPurify.sanitize(root.innerHTML, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['id', 'class', 'target', 'rel', 'loading', 'alt', 'type', 'data-copy-code'],
    FORBID_ATTR: ['style']
  })

  return { html: sanitized, toc, codes }
}

const updateActiveHeading = () => {
  if (!tocItems.value.length) {
    activeHeadingId.value = ''
    return
  }

  const offset = 140
  let currentId = tocItems.value[0].id

  tocItems.value.forEach((item) => {
    const element = document.getElementById(item.id)
    if (!element) return

    if (element.getBoundingClientRect().top - offset <= 0) {
      currentId = item.id
    }
  })

  activeHeadingId.value = currentId
}

const updateReadingProgress = () => {
  if (!articleBodyRef.value) {
    readingProgress.value = 0
    return
  }

  const rect = articleBodyRef.value.getBoundingClientRect()
  const start = window.scrollY + rect.top - 120
  const total = Math.max(articleBodyRef.value.offsetHeight - window.innerHeight * 0.4, 1)
  const current = window.scrollY - start
  const percent = Math.max(0, Math.min(100, (current / total) * 100))
  readingProgress.value = Number.isFinite(percent) ? percent : 0
}

const handlePageScroll = () => {
  updateActiveHeading()
  updateReadingProgress()
}

const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (!element) return

  const top = window.scrollY + element.getBoundingClientRect().top - 112
  window.scrollTo({ top, behavior: 'smooth' })
  activeHeadingId.value = id
}

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

const handleArticleContentClick = async (event) => {
  const button = event.target.closest('[data-copy-code]')
  if (!button) return

  const codeId = button.getAttribute('data-copy-code')
  const rawCode = codeBlocks.value[codeId]
  if (!rawCode) return

  const originalText = button.textContent

  try {
    await copyText(rawCode)
    button.textContent = '已复制'
    window.setTimeout(() => {
      button.textContent = originalText
    }, 1600)
  } catch (error) {
    console.error('复制代码失败:', error)
    ElMessage.error('复制代码失败')
  }
}

const normalizeArticleList = (payload) => {
  if (Array.isArray(payload?.result)) return payload.result
  if (Array.isArray(payload)) return payload
  return []
}

const sortArticlesByTime = (list) => {
  return [...list].sort((a, b) => {
    const timeA = new Date(a?.publishTime || a?.createdTime || 0).getTime()
    const timeB = new Date(b?.publishTime || b?.createdTime || 0).getTime()
    return timeB - timeA
  })
}

const loadArticleNavigation = async (currentArticle) => {
  if (!currentArticle?.id) {
    articleNavigation.value = { previous: null, next: null }
    return
  }

  try {
    const res = await blogApi.getArticlePage({ pageNum: 1, pageSize: 100 })
    const list = sortArticlesByTime(normalizeArticleList(res.data))
    const currentIndex = list.findIndex((item) => String(item.id) === String(currentArticle.id))

    if (currentIndex >= 0) {
      articleNavigation.value = {
        previous: list[currentIndex + 1] || null,
        next: list[currentIndex - 1] || null
      }
      return
    }

    const latestRes = await blogApi.getLatestArticles(6)
    const fallbackList = sortArticlesByTime(normalizeArticleList(latestRes.data)).filter(
      (item) => String(item.id) !== String(currentArticle.id)
    )

    articleNavigation.value = {
      previous: fallbackList[0] || null,
      next: fallbackList[1] || null
    }
  } catch (error) {
    console.error('加载文章导航失败:', error)
    articleNavigation.value = { previous: null, next: null }
  }
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

const goToAuthorProfile = (targetArticle) => {
  if (!targetArticle?.authorId) return
  router.push({
    path: `/profile/${targetArticle.authorId}`,
    query: {
      back: route.fullPath
    }
  })
}

const goToEditArticle = () => {
  if (!article.value?.id || !canEditArticle.value) return
  router.push({
    path: `/blog/edit/${article.value.id}`,
    query: {
      back: route.fullPath
    }
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
      article.value.likeCount = Math.max(0, (article.value.likeCount || 0) - 1)
    } else {
      await blogApi.likeArticle(article.value.id)
      article.value.likeCount = (article.value.likeCount || 0) + 1
    }
    isLiked.value = !isLiked.value
  } catch (error) {
    console.error('操作失败:', error)
    const message = error?.response?.data?.message || error?.message || '点赞操作失败'
    ElMessage.error(message)
  }
}

const handleShare = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: article.value.title,
        url: window.location.href
      })
      return
    }

    await navigator.clipboard.writeText(window.location.href)
    ElMessage.success('文章链接已复制')
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败，请稍后重试')
  }
}

const scrollToComments = () => {
  document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    await loadComments()
    ElMessage.success('评论成功')
  } catch (error) {
    console.error('评论失败:', error)
    const message = error?.response?.data?.message || error?.message || '评论失败'
    ElMessage.error(message)
  }
}

const replyTo = (comment) => {
  commentContent.value = `@${comment.userName} `
}

const likeComment = async () => {
  ElMessage.info('评论点赞功能稍后补上')
}

const normalizeArticleDetail = (payload) => {
  if (!payload) return null

  return {
    ...payload,
    coverImage: payload.coverImage || payload.cover_image || '',
    publishTime: payload.publishTime || payload.publish_time || payload.createdTime || payload.created_time || ''
  }
}

const syncLikeState = async (articleId) => {
  if (!articleId || !userStore.isLoggedIn) {
    isLiked.value = false
    return
  }

  try {
    const res = await blogApi.isLiked(articleId)
    isLiked.value = Boolean(res.data)
  } catch (error) {
    console.error('同步点赞状态失败:', error)
    isLiked.value = article.value?.isLiked === 1
  }
}

const loadArticle = async () => {
  try {
    const res = await blogApi.getArticleDetail(route.params.id)
    const normalizedArticle = normalizeArticleDetail(res.data)
    article.value = normalizedArticle
    isLiked.value = normalizedArticle?.isLiked === 1
    await syncLikeState(normalizedArticle?.id)

    await nextTick()
    handlePageScroll()
    await loadArticleNavigation(normalizedArticle)
    blogApi.recordViewLog(route.params.id)
  } catch (error) {
    console.error('加载文章失败:', error)
    const message = error?.response?.data?.message || error?.message || '文章加载失败'
    ElMessage.error(message)
    article.value = null
    router.push('/blog/list')
  }
}

const loadComments = async () => {
  try {
    const res = await blogApi.getCommentPage(route.params.id, { pageNum: 1, pageSize: 50 })
    comments.value = res.data?.result || []
  } catch (error) {
    console.error('加载评论失败:', error)
    const message = error?.response?.data?.message || error?.message || '加载评论失败'
    ElMessage.error(message)
  }
}

const loadPageData = async () => {
  await Promise.all([loadArticle(), loadComments()])
}

watch(renderedArticleContent, async () => {
  await nextTick()
  handlePageScroll()
})

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (!newId || newId === oldId) return
    await loadPageData()
  }
)

onMounted(async () => {
  window.addEventListener('scroll', handlePageScroll, { passive: true })
  await loadPageData()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handlePageScroll)
})
</script>

<style scoped>
.blog-detail {
  --detail-surface: var(--color-bg-elevated);
  --detail-surface-soft: rgba(255, 255, 255, 0.88);
  --detail-surface-subtle: rgba(148, 163, 184, 0.08);
  --detail-surface-subtle-strong: rgba(148, 163, 184, 0.12);
  --detail-hero-bg:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.92));
  --detail-heading: #0f172a;
  --detail-strong: #0f172a;
  --detail-link: #2563eb;
  --detail-link-hover: #1d4ed8;
  --detail-quote-bg: rgba(59, 130, 246, 0.06);
  --detail-quote-border: #60a5fa;
  --detail-inline-code-color: #be123c;
  --detail-inline-code-bg: rgba(244, 63, 94, 0.08);
  --detail-table-bg: #ffffff;
  --detail-table-head-bg: rgba(241, 245, 249, 0.9);
  --detail-table-head-color: #0f172a;
  --detail-button-bg: #ffffff;
  --detail-button-hover: #2563eb;
  --detail-liked-bg: rgba(254, 242, 242, 0.95);
  --detail-nav-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  --detail-question-bg: linear-gradient(180deg, rgba(239, 246, 255, 0.72), rgba(248, 250, 252, 0.94));
  --detail-question-item-bg: rgba(255, 255, 255, 0.88);
  --detail-input-bg: var(--color-bg);
  --detail-login-bg: rgba(148, 163, 184, 0.08);
  --detail-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
  --detail-card-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  --detail-card-hover-shadow: 0 20px 40px rgba(37, 99, 235, 0.12);
  max-width: 1360px;
  margin: 0 auto;
  padding: 32px 20px 56px;
}

.blog-detail.is-dark {
  --detail-surface: rgba(15, 23, 42, 0.92);
  --detail-surface-soft: rgba(15, 23, 42, 0.78);
  --detail-surface-subtle: rgba(148, 163, 184, 0.1);
  --detail-surface-subtle-strong: rgba(148, 163, 184, 0.16);
  --detail-hero-bg:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(10, 15, 27, 0.96));
  --detail-heading: var(--text-1);
  --detail-strong: var(--text-1);
  --detail-link: #93c5fd;
  --detail-link-hover: #bfdbfe;
  --detail-quote-bg: rgba(59, 130, 246, 0.12);
  --detail-quote-border: #93c5fd;
  --detail-inline-code-color: #fda4af;
  --detail-inline-code-bg: rgba(244, 63, 94, 0.14);
  --detail-table-bg: rgba(15, 23, 42, 0.92);
  --detail-table-head-bg: rgba(30, 41, 59, 0.92);
  --detail-table-head-color: var(--text-1);
  --detail-button-bg: rgba(15, 23, 42, 0.92);
  --detail-button-hover: #93c5fd;
  --detail-liked-bg: rgba(127, 29, 29, 0.28);
  --detail-nav-bg: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(11, 18, 32, 0.94));
  --detail-question-bg: linear-gradient(180deg, rgba(30, 41, 59, 0.88), rgba(15, 23, 42, 0.92));
  --detail-question-item-bg: rgba(15, 23, 42, 0.78);
  --detail-input-bg: rgba(15, 23, 42, 0.88);
  --detail-login-bg: rgba(30, 41, 59, 0.88);
  --detail-shadow: 0 18px 40px rgba(2, 6, 23, 0.36);
  --detail-card-shadow: 0 18px 40px rgba(2, 6, 23, 0.3);
  --detail-card-hover-shadow: 0 20px 44px rgba(59, 130, 246, 0.16);
}

.reading-progress {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 4px;
  margin-bottom: 20px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 999px;
  overflow: hidden;
}

.reading-progress-bar {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #2563eb, #0ea5e9, #22c55e);
  border-radius: 999px;
  transition: width 0.15s ease-out;
}

.detail-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
}

.detail-main {
  min-width: 0;
}

.article-card,
.comments-section,
.sidebar-card {
  background: var(--detail-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--detail-shadow);
}

.article-card {
  border-radius: 28px;
  overflow: hidden;
}

.article-hero {
  padding: 32px 40px 28px;
  background: var(--detail-hero-bg);
  border-bottom: 1px solid var(--color-border);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
}

.back-link:hover {
  color: var(--color-accent);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;
  margin-bottom: 18px;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-radius: 999px;
  font-weight: 600;
}

.article-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.2;
  font-weight: 800;
  color: var(--color-text);
}

.article-summary {
  margin: 18px 0 0;
  padding: 18px 20px;
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-text-secondary);
  background: var(--detail-surface-subtle);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 20px;
}

.article-summary :deep(p) {
  margin: 0;
}

.article-summary :deep(p + p) {
  margin-top: 12px;
}

.hero-author-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-top: 24px;
}

.article-author {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
}

.author-button {
  transition: opacity var(--transition-fast);
}

.author-button:hover {
  opacity: 0.92;
}

.author-avatar,
.form-avatar,
.comment-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: #fff;
  border-radius: 50%;
  font-weight: 700;
}

.author-avatar {
  width: 54px;
  height: 54px;
  font-size: 18px;
  overflow: hidden;
}

.author-avatar-image {
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text);
}

.author-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.article-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.stat-pill {
  min-width: 86px;
  padding: 12px 14px;
  background: var(--detail-surface-soft);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  text-align: center;
}

.stat-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.stat-pill strong {
  font-size: 18px;
  color: var(--color-text);
}

.header-cover {
  margin-top: 24px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.header-cover img {
  display: block;
  width: 100%;
  max-height: 420px;
  object-fit: cover;
}

.article-body {
  padding: 36px 40px 40px;
}

.article-content {
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.95;
  word-break: break-word;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  position: relative;
  margin: 2.4em 0 0.85em;
  line-height: 1.35;
  font-weight: 800;
  color: var(--detail-heading);
}

.article-content :deep(h1) {
  font-size: 2rem;
}

.article-content :deep(h2) {
  padding-left: 14px;
  font-size: 1.6rem;
}

.article-content :deep(h2)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.2em;
  width: 4px;
  height: 1.1em;
  border-radius: 999px;
  background: linear-gradient(180deg, #3b82f6, #0ea5e9);
}

.article-content :deep(h3) {
  font-size: 1.25rem;
}

.article-content :deep(h4) {
  font-size: 1.08rem;
}

.article-content :deep(h5),
.article-content :deep(h6) {
  font-size: 1rem;
}

.article-content :deep(p),
.article-content :deep(ul),
.article-content :deep(ol),
.article-content :deep(blockquote),
.article-content :deep(pre),
.article-content :deep(table),
.article-content :deep(hr) {
  margin: 0 0 1.15em;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 1.4em;
}

.article-content :deep(li) {
  margin-bottom: 0.45em;
}

.article-content :deep(strong) {
  color: var(--detail-strong);
  font-weight: 700;
}

.article-content :deep(a) {
  color: var(--detail-link);
  text-decoration: none;
  border-bottom: 1px solid rgba(37, 99, 235, 0.25);
}

.article-content :deep(a:hover) {
  color: var(--detail-link-hover);
}

.article-content :deep(.content-quote) {
  padding: 18px 20px;
  color: var(--color-text-secondary);
  background: var(--detail-quote-bg);
  border-left: 4px solid var(--detail-quote-border);
  border-radius: 0 18px 18px 0;
}

.article-content :deep(.content-pre) {
  padding: 18px 20px;
  color: #e2e8f0;
  background: #0f172a;
  border-radius: 0 0 20px 20px;
  overflow-x: auto;
  margin: 0;
}

.article-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.92em;
}

.article-content :deep(:not(pre) > code) {
  padding: 2px 8px;
  color: var(--detail-inline-code-color);
  background: var(--detail-inline-code-bg);
  border-radius: 999px;
}

.article-content :deep(img) {
  display: block;
  max-width: 100%;
  margin: 1.5em auto;
  border-radius: 20px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
}

.article-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.article-content :deep(.article-table-wrap) {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1.15em;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
}

.article-content :deep(.code-block) {
  margin: 0 0 1.15em;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
}

.article-content :deep(.code-toolbar) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(180deg, #111827, #1f2937);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.article-content :deep(.code-language) {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(226, 232, 240, 0.72);
}

.article-content :deep(.copy-code-btn) {
  padding: 6px 10px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.article-content :deep(.copy-code-btn:hover) {
  background: rgba(255, 255, 255, 0.12);
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
  background: var(--detail-table-bg);
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.article-content :deep(th) {
  background: var(--detail-table-head-bg);
  color: var(--detail-table-head-color);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid var(--color-border);
}

.tag-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.tag,
.keyword-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: rgba(148, 163, 184, 0.12);
}

.article-questions {
  margin-top: 32px;
  padding: 24px;
  background: var(--detail-question-bg);
  border: 1px solid rgba(147, 197, 253, 0.22);
  border-radius: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.section-desc {
  margin: 0 0 16px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.7;
}

.question-list,
.comments-list,
.toc-nav,
.sidebar-stats {
  display: flex;
  flex-direction: column;
}

.question-list {
  gap: 12px;
}

.question-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--detail-question-item-bg);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 16px;
  cursor: pointer;
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.question-item:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.35);
  box-shadow: 0 14px 28px rgba(59, 130, 246, 0.08);
}

.question-index {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: 700;
  color: #2563eb;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 999px;
}

.question-title {
  flex: 1;
  color: var(--color-text);
  font-size: var(--text-sm);
}

.article-footer {
  padding: 24px 40px 32px;
  border-top: 1px solid var(--color-border);
}

.article-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-btn,
.btn-submit,
.toc-link {
  transition: all var(--transition-fast);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--detail-button-bg);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
}

.action-btn-edit {
  color: var(--color-accent);
  border-color: rgba(37, 99, 235, 0.22);
  background: rgba(37, 99, 235, 0.08);
}

.action-btn-edit:hover {
  border-color: rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.12);
}

.action-btn:hover {
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--detail-button-hover);
}

.action-btn.liked {
  color: #dc2626;
  background: var(--detail-liked-bg);
  border-color: rgba(239, 68, 68, 0.2);
}

.article-navigation {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-height: 148px;
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--detail-nav-bg);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--detail-card-shadow);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.nav-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.24);
  box-shadow: var(--detail-card-hover-shadow);
}

.nav-card-next {
  align-items: flex-end;
  text-align: right;
}

.nav-label {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.nav-title {
  font-size: 1rem;
  line-height: 1.6;
}

.nav-summary {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: 1.7;
}

.detail-sidebar {
  position: sticky;
  top: 92px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  padding: 20px;
  border-radius: 22px;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sidebar-title {
  margin: 0 0 14px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.sidebar-head .sidebar-title {
  margin-bottom: 0;
}

.sidebar-hint {
  font-size: 12px;
  color: var(--color-text-muted);
}

.sidebar-stats {
  gap: 14px;
}

.sidebar-stat {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.sidebar-stat strong {
  color: var(--color-text);
}

.toc-nav {
  gap: 8px;
  margin-top: 14px;
}

.toc-link {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-align: left;
  cursor: pointer;
}

.toc-link:hover {
  background: rgba(148, 163, 184, 0.08);
  color: var(--color-text);
}

.toc-link.active {
  color: var(--detail-link);
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.18);
}

.toc-link.level-2 {
  padding-left: 18px;
}

.toc-link.level-3 {
  padding-left: 28px;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.comments-section {
  margin-top: 28px;
  padding: 28px;
  border-radius: 28px;
}

.comment-form,
.comment-item,
.reply-item {
  display: flex;
  gap: 14px;
}

.comment-form {
  margin: 18px 0 28px;
}

.form-avatar,
.comment-avatar {
  width: 42px;
  height: 42px;
  font-size: 14px;
  flex-shrink: 0;
}

.form-input,
.comment-main,
.reply-main {
  flex: 1;
}

.form-input textarea {
  width: 100%;
  padding: 16px 18px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--detail-input-bg);
  color: var(--color-text);
  font-size: var(--text-sm);
  resize: vertical;
  outline: none;
}

.form-input textarea:focus {
  border-color: rgba(59, 130, 246, 0.35);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.btn-submit {
  margin-top: 12px;
  padding: 11px 18px;
  border: none;
  border-radius: 14px;
  background: var(--color-accent);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.92;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-tip {
  padding: 22px;
  margin: 18px 0 28px;
  text-align: center;
  border-radius: 18px;
  background: var(--detail-login-bg);
  color: var(--color-text-muted);
}

.login-tip a {
  color: var(--detail-link);
}

.comments-list {
  gap: 22px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.comment-author,
.reply-author {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text);
}

.comment-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.comment-content,
.reply-content {
  margin: 0;
  line-height: 1.75;
  color: var(--color-text-secondary);
}

.comment-actions {
  display: flex;
  gap: 14px;
  margin-top: 10px;
}

.action-btn-small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
}

.action-btn-small:hover {
  color: var(--color-text);
}

.replies {
  margin-top: 14px;
  padding-left: 16px;
  border-left: 2px solid rgba(148, 163, 184, 0.16);
}

.reply-item {
  margin-bottom: 10px;
}

.reply-avatar {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.12);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.blog-detail.is-dark .question-index,
.blog-detail.is-dark .nav-label {
  color: #bfdbfe;
}

.blog-detail.is-dark .article-content :deep(td) {
  color: var(--color-text-secondary);
}

.blog-detail.is-dark .article-content :deep(.article-table-wrap),
.blog-detail.is-dark .header-cover,
.blog-detail.is-dark .question-item,
.blog-detail.is-dark .stat-pill {
  border-color: rgba(148, 163, 184, 0.18);
}

.blog-detail.is-dark .toc-link:hover {
  background: rgba(148, 163, 184, 0.12);
}

@media (max-width: 1120px) {
  .detail-shell {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    position: static;
    order: -1;
  }
}

@media (max-width: 768px) {
  .blog-detail {
    padding: 20px 14px 40px;
  }

  .article-hero,
  .article-body,
  .article-footer,
  .comments-section {
    padding-left: 18px;
    padding-right: 18px;
  }

  .hero-author-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .article-stats {
    justify-content: flex-start;
  }

  .article-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }

  .article-navigation {
    grid-template-columns: 1fr;
  }

  .nav-card,
  .nav-card-next {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
