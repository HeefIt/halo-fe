<template>
  <div class="landing">
    <nav class="nav">
      <div class="nav-inner">
        <div 
          class="logo" 
          ref="logoRef"
          @mousemove="handleLogoMouseMove"
          @mouseleave="handleLogoMouseLeave"
          @click="$router.push('/')"
        >
          <img
            class="logo-mark"
            ref="logoIconRef"
            :src="brandMark"
            alt="halo coding do"
            :style="{ transform: logoTransform }"
          />
          <span class="logo-meta" ref="logoTextRef" :style="{ transform: logoTransform }">
            <span class="logo-text">halo coding do</span>
            <span class="logo-caption">a tasteful place for curious developers</span>
          </span>
        </div>
        
        <div class="nav-links">
          <div class="dropdown">
            <button class="dropdown-trigger">
              题库
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div class="dropdown-content">
              <div class="dropdown-card">
                <h4>题库不是仓库</h4>
                <p class="dropdown-stats">超过 <strong>1000+</strong> 道题，带着语境、脾气和一点点讨论欲</p>
                <ul class="dropdown-list">
                  <li>后端基础与工程规范</li>
                  <li>JVM 与性能调优</li>
                  <li>数据库设计与 SQL 优化</li>
                  <li>Redis、MQ 与缓存策略</li>
                  <li>Spring / 微服务 / 分布式</li>
                  <li>系统设计、接口设计与算法</li>
                  <li>AI 应用、调试与项目实战</li>
                </ul>
                <button class="dropdown-cta" @click="$router.push('/login')">登录去翻翻今天的题</button>
              </div>
            </div>
          </div>
          
          <div class="dropdown">
            <button class="dropdown-trigger">
              资源
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div class="dropdown-content dropdown-content-wide">
              <a href="https://leetcode.cn/" target="_blank" class="resource-link">
                <span class="resource-icon">⚡</span>
                <div>
                  <span class="resource-name">力扣 LeetCode</span>
                  <span class="resource-desc">全球极客挚爱的技术成长平台</span>
                </div>
              </a>
              <a href="https://www.nowcoder.com/" target="_blank" class="resource-link">
                <span class="resource-icon">🎯</span>
                <div>
                  <span class="resource-name">牛客网</span>
                  <span class="resource-desc">专业IT求职备考平台</span>
                </div>
              </a>
              <a href="https://www.csdn.net/" target="_blank" class="resource-link">
                <span class="resource-icon">📚</span>
                <div>
                  <span class="resource-name">CSDN</span>
                  <span class="resource-desc">中国专业IT社区</span>
                </div>
              </a>
              <a href="https://github.com/" target="_blank" class="resource-link">
                <span class="resource-icon">💻</span>
                <div>
                  <span class="resource-name">GitHub</span>
                  <span class="resource-desc">全球最大的代码托管平台</span>
                </div>
              </a>
            </div>
          </div>
          
          <div class="dropdown">
            <button class="dropdown-trigger">
              关于
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div class="dropdown-content dropdown-content-simple">
              <button class="dropdown-item" @click="showAbout = true">平台介绍</button>
              <button class="dropdown-item" @click="showContact = true">联系我们</button>
            </div>
          </div>
        </div>
        
        <div class="nav-actions">
          <button class="btn-ghost" @click="$router.push('/login')">登录</button>
          <button class="btn-primary" @click="$router.push('/register')">免费注册</button>
        </div>
      </div>
    </nav>

    <main class="main">
      <section class="hero" ref="heroRef">
        <canvas ref="canvasRef" class="hero-canvas"></canvas>
        <div class="hero-gradient"></div>
        
        <div class="hero-content">
          <div class="hero-badge animate-fade-up">
            <span class="badge-dot"></span>
            <span>给代码、表达与一点点锋芒，同时留位置</span>
          </div>
          
          <h1 class="hero-title animate-fade-up" style="animation-delay: 100ms">
            <span class="title-line">把灵感、技术与观点</span>
            <span class="title-line title-gradient">安放进一个理想的社区</span>
          </h1>
          
          <p class="hero-subtitle animate-fade-up" style="animation-delay: 200ms">
            halo coding do 把题库、博客、AI 对话与社区节奏收进同一张桌面。你可以认真钻研，也可以轻松发光；<br>
            既写代码，也写观点，顺手把灵感、答案和偏爱都留在这里
          </p>
          
          <div class="hero-actions animate-fade-up" style="animation-delay: 300ms">
            <button class="btn-primary btn-lg" @click="$router.push('/register')">
              逛逛今天的新东西
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button class="btn-secondary btn-lg" @click="$router.push('/home')">
              先看热门内容
            </button>
          </div>
          
          <div class="hero-stats animate-fade-up" style="animation-delay: 400ms">
            <div class="stat">
              <span class="stat-value">1000+</span>
              <span class="stat-label">正在生长的话题</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">5000+</span>
              <span class="stat-label">留下痕迹的读者</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">92%</span>
              <span class="stat-label">可被 AI 共创的场景</span>
            </div>
          </div>
        </div>
      </section>

      <section class="features" ref="featuresRef">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-tag">平台能力</span>
            <h2 class="section-title">像社区，也像工作台；最重要的是，它不无聊</h2>
            <p class="section-desc">练习会长出表达，表达会引来讨论，讨论又会把你送回更聪明的下一次练习</p>
          </div>
          
          <div class="features-grid" ref="featuresGridRef" @mousemove="handleFeaturesMouseMove" @mouseleave="handleFeaturesMouseLeave">
            <div class="feature-card animate-on-scroll" style="animation-delay: 100ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M8 7h8M8 11h8M8 15h4"/>
                </svg>
              </div>
              <h3 class="feature-title">题库有锋芒</h3>
              <p class="feature-desc">不是整齐堆放的题单，而是带着主题、语境和讨论欲的练习入口，做题也能做出一点品味</p>
            </div>
            
            <div class="feature-card animate-on-scroll" style="animation-delay: 200ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h3 class="feature-title">AI 很会接话</h3>
              <p class="feature-desc">它不只解释答案，也陪你拆思路、润表达、补细节，偶尔还挺会救场</p>
            </div>
            
            <div class="feature-card animate-on-scroll" style="animation-delay: 300ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
              </div>
              <h3 class="feature-title">排行有温度</h3>
              <p class="feature-desc">不是为了制造焦虑，而是让节奏、手感和参与感都有一点被看见的快乐</p>
            </div>
            
            <div class="feature-card feature-card-wide animate-on-scroll" style="animation-delay: 400ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
                </svg>
              </div>
              <h3 class="feature-title">内容会串门</h3>
              <p class="feature-desc">一条问题可以接到博客、AI、排行榜和计划，知识终于不再各住各的</p>
            </div>
            
            <div class="feature-card animate-on-scroll" style="animation-delay: 500ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 class="feature-title">博客要体面</h3>
              <p class="feature-desc">把题解、经验、偏见和漂亮的结论写下来，慢慢形成只属于你的版本</p>
            </div>
            
            <div class="feature-card animate-on-scroll" style="animation-delay: 600ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 class="feature-title">反馈不靠脑补</h3>
              <p class="feature-desc">阅读、练习、创作和互动会被诚实记录，下一步不再全凭感觉</p>
            </div>
          </div>
        </div>
      </section>

      <section class="showcase">
        <div class="container">
          <div class="showcase-grid animate-on-scroll">
            <div class="showcase-content">
              <span class="section-tag">使用体验</span>
              <h2 class="showcase-title">刷题、写作、对话、围观，在这里都顺手</h2>
              <p class="showcase-desc">halo coding do 不急着把你推向下一页，它更像一张会发光的工作台：先看一篇文章，再刷一道题，顺手追问 AI，最后把自己的答案写得漂漂亮亮。</p>
              
              <ul class="showcase-list">
                <li>
                  <span class="list-icon">✓</span>
                  <span>内容、题库、AI 和排行彼此通气，不会各玩各的</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>灵感来时能写，卡住时能问，沉淀后还能被看见</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>博客不是附件，而是社区里最体面的表达方式</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>活跃反馈会轻轻推你一把，但不会把人推急</span>
                </li>
              </ul>
            </div>
            
            <div class="showcase-visual">
              <div class="showcase-card">
                <div class="showcase-card-header">
                  <span class="showcase-badge badge-success">进阶</span>
                  <span class="showcase-badge badge-primary">工程思维题</span>
                </div>
                <h4 class="showcase-question">高并发接口需要防止重复提交时，优先考虑哪种策略？</h4>
                <div class="showcase-options">
                  <div class="showcase-option showcase-option-selected">
                    <span class="option-letter">A</span>
                    <span>为请求引入幂等键并做唯一校验</span>
                  </div>
                  <div class="showcase-option">
                    <span class="option-letter">B</span>
                    <span>仅延长接口超时时间</span>
                  </div>
                  <div class="showcase-option">
                    <span class="option-letter">C</span>
                    <span>把所有请求都改成 GET</span>
                  </div>
                  <div class="showcase-option">
                    <span class="option-letter">D</span>
                    <span>完全依赖前端按钮禁用</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="blog-preview">
        <div class="container">
          <div class="blog-preview-grid animate-on-scroll">
            <div class="blog-preview-content">
              <span class="section-tag">博客样例</span>
              <h2 class="blog-preview-title">如果今天不想先做题，也可以先读一篇漂亮的文章</h2>
              <p class="blog-preview-desc">社区不该只提供答案，也该提供语气、结构和观点。你可以先被一篇文章打动，再顺手去刷题、追问 AI，最后把自己的理解留下来。</p>

              <div class="blog-preview-points">
                <div class="blog-point">
                  <span class="blog-point-title">有观点</span>
                  <span class="blog-point-text">不是资料搬运，而是带着判断和取舍去写。</span>
                </div>
                <div class="blog-point">
                  <span class="blog-point-title">有结构</span>
                  <span class="blog-point-text">从问题、方案到边界，读起来会很顺。</span>
                </div>
                <div class="blog-point">
                  <span class="blog-point-title">有余味</span>
                  <span class="blog-point-text">看完不是结束，而是忍不住想补一句自己的看法。</span>
                </div>
              </div>
            </div>

            <div class="blog-preview-visual">
              <article class="blog-sample-card">
                <div class="blog-sample-head">
                  <span class="blog-sample-badge">Featured Post</span>
                  <span class="blog-sample-time">8 min read</span>
                </div>
                <h3 class="blog-sample-title">当系统开始变复杂，先别急着上强度，先把边界写清楚</h3>
                <p class="blog-sample-summary">
                  很多“架构升级”看起来像技术跃迁，其实只是边界混乱的后遗症。先把责任、数据流和失败路径讲明白，再谈中间件和分布式，通常会优雅得多。
                </p>
                <div class="blog-sample-tags">
                  <span>系统设计</span>
                  <span>接口边界</span>
                  <span>工程判断</span>
                </div>
                <div class="blog-sample-footer">
                  <div class="blog-sample-author">
                    <div class="blog-author-avatar">H</div>
                    <div class="blog-author-info">
                      <strong>halo editorial</strong>
                      <span>把复杂问题讲得不那么吓人</span>
                    </div>
                  </div>
                  <button class="blog-sample-link" @click="$router.push('/blog')">去看更多文章</button>
                </div>
              </article>

              <article class="blog-sample-card blog-sample-card-playful">
                <div class="blog-sample-head">
                  <span class="blog-sample-badge blog-sample-badge-fun">Fun &amp; Life</span>
                  <span class="blog-sample-time">5 min read</span>
                </div>
                <h3 class="blog-sample-title">如果今天不想聊系统设计，也可以写写周末、咖啡和让人心动的小界面</h3>
                <p class="blog-sample-summary">
                  一个理想的社区，不该只容纳标准答案。你也可以记录最近喜欢的歌单、下班后去过的小店，
                  或者某个让你反复调整到满意的按钮细节，让技术和生活一起变得有趣。
                </p>
                <div class="blog-sample-tags">
                  <span>生活穿插</span>
                  <span>轻松一点</span>
                  <span>有趣记录</span>
                </div>
                <div class="blog-sample-footer">
                  <div class="blog-sample-author">
                    <div class="blog-author-avatar blog-author-avatar-fun">L</div>
                    <div class="blog-author-info">
                      <strong>late night notes</strong>
                      <span>把好看、好玩和好心情也写进社区</span>
                    </div>
                  </div>
                  <button class="blog-sample-link blog-sample-link-fun" @click="$router.push('/blog')">去看这类文章</button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="cta animate-on-scroll">
        <div class="container">
          <div class="cta-card">
            <div class="cta-content">
              <h2 class="cta-title">把练习、写作和 AI 协作接到一起</h2>
              <p class="cta-desc">把技术、表达和一点点锋芒，放进 halo coding do</p>
            </div>
            <div class="cta-action">
              <button class="btn-primary btn-lg btn-white" @click="$router.push('/register')">
                来都来了，先进来看看
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <img class="logo-mark-small" :src="brandMark" alt="halo coding do" />
            <span class="footer-name">halo coding do</span>
          </div>
          <p class="footer-copy">© 2025 halo coding do · 给会写代码、也愿意好好表达的人</p>
        </div>
      </div>
    </footer>

    <div v-if="showAbout" class="modal-overlay" @click="showAbout = false">
      <div class="modal" @click.stop>
        <button class="modal-close" @click="showAbout = false">×</button>
        <h3 class="modal-title">关于 halo coding do</h3>
        <p class="modal-text">halo coding do 是一个面向广大技术开发者的内容社区。这里接得住问题、文章、灵感与一点点偏执；题库不是终点，表达也不是附属品。</p>
        
        <h4 class="modal-subtitle">我们的理念</h4>
        <p class="modal-text">我们偏爱有观点的技术内容，也尊重认真练习的人。最好的一次学习，不只是得到答案，而是顺手长出自己的表达。</p>
        
        <h4 class="modal-subtitle">为什么选择我们</h4>
        <ul class="modal-list">
          <li><strong>好内容不散</strong>：题库、博客、AI、排行和计划不是碎片，而是一条完整链路</li>
          <li><strong>好表达有位置</strong>：写法、观点、复盘和结论都会被认真承接</li>
          <li><strong>好奇心有回声</strong>：能问、能写、能被看见，社区氛围会更轻盈</li>
          <li><strong>技术味足够正</strong>：后端、系统、数据库、工程问题都在真实语境里展开</li>
        </ul>
      </div>
    </div>

    <div v-if="showContact" class="modal-overlay" @click="showContact = false">
      <div class="modal" @click.stop>
        <button class="modal-close" @click="showContact = false">×</button>
        <h3 class="modal-title">联系我们</h3>
        <p class="modal-text">有任何问题或建议？我们期待听到你的声音。</p>
        
        <div class="contact-list">
          <div class="contact-item">
            <span class="contact-label">邮箱</span>
            <span class="contact-value">17840524165@163.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">QQ群</span>
            <span class="contact-value">1042663638</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">微信公众号</span>
            <span class="contact-value">海明菜园</span>
          </div>
        </div>
        
        <h4 class="modal-subtitle">商务合作</h4>
        <p class="modal-text">企业培训、内容合作、技术交流，欢迎联系：hhm3406698893@gmail.com</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import brandMark from '@/assets/brand/hcd-mark.svg'

const showAbout = ref(false)
const showContact = ref(false)

const logoRef = ref(null)
const logoIconRef = ref(null)
const logoTextRef = ref(null)
const heroRef = ref(null)
const canvasRef = ref(null)
const featuresRef = ref(null)
const featuresGridRef = ref(null)

const logoOffset = ref({ x: 0, y: 0 })
const featureGlowPosition = ref({ x: 0, y: 0 })
const showFeatureGlow = ref(false)

const logoTransform = computed(() => {
  return `translate(${logoOffset.value.x}px, ${logoOffset.value.y}px)`
})

const featureGlowStyle = computed(() => {
  if (!showFeatureGlow.value) return { opacity: 0 }
  return {
    opacity: 1,
    background: `radial-gradient(600px circle at ${featureGlowPosition.value.x}px ${featureGlowPosition.value.y}px, rgba(16, 185, 129, 0.15), transparent 40%)`
  }
})

const handleLogoMouseMove = (e) => {
  if (!logoRef.value) return
  const rect = logoRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const maxOffset = 8
  
  const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (e.clientX - centerX) / 5))
  const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (e.clientY - centerY) / 5))
  
  logoOffset.value = { x: offsetX, y: offsetY }
}

const handleLogoMouseLeave = () => {
  logoOffset.value = { x: 0, y: 0 }
}

const handleFeaturesMouseMove = (e) => {
  if (!featuresGridRef.value) return
  const rect = featuresGridRef.value.getBoundingClientRect()
  featureGlowPosition.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  showFeatureGlow.value = true
}

const handleFeaturesMouseLeave = () => {
  showFeatureGlow.value = false
}

let animationId = null
let particles = []
let mouseX = 0
let mouseY = 0

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const hero = heroRef.value
  if (!hero) return
  
  const resizeCanvas = () => {
    canvas.width = hero.offsetWidth
    canvas.height = hero.offsetHeight
    initParticles()
  }
  
  const initParticles = () => {
    particles = []
    const spacing = 50
    const cols = Math.ceil(canvas.width / spacing)
    const rows = Math.ceil(canvas.height / spacing)
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        particles.push({
          x: i * spacing + spacing / 2,
          y: j * spacing + spacing / 2,
          baseX: i * spacing + spacing / 2,
          baseY: j * spacing + spacing / 2,
          size: 1.5,
          baseSize: 1.5,
          alpha: 0.15,
          baseAlpha: 0.15
        })
      }
    }
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    particles.forEach(particle => {
      const dx = mouseX - particle.baseX
      const dy = mouseY - particle.baseY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = 150
      
      if (distance < maxDistance) {
        const intensity = 1 - distance / maxDistance
        particle.size = particle.baseSize + intensity * 3
        particle.alpha = particle.baseAlpha + intensity * 0.85
      } else {
        particle.size += (particle.baseSize - particle.size) * 0.1
        particle.alpha += (particle.baseAlpha - particle.alpha) * 0.1
      }
      
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(16, 185, 129, ${particle.alpha})`
      ctx.fill()
    })
    
    animationId = requestAnimationFrame(animate)
  }
  
  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top
  }
  
  resizeCanvas()
  animate()
  
  window.addEventListener('resize', resizeCanvas)
  hero.addEventListener('mousemove', handleMouseMove)
  
  return () => {
    window.removeEventListener('resize', resizeCanvas)
    hero.removeEventListener('mousemove', handleMouseMove)
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}

const initScrollReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el)
  })
  
  return observer
}

let scrollObserver = null
let cleanupCanvas = null

onMounted(() => {
  cleanupCanvas = initCanvas()
  scrollObserver = initScrollReveal()
})

onUnmounted(() => {
  if (cleanupCanvas) cleanupCanvas()
  if (scrollObserver) scrollObserver.disconnect()
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: #050505;
  overflow-x: hidden;
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 0;
  background: rgba(5, 5, 5, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.logo-mark {
  width: 54px;
  height: 46px;
  object-fit: contain;
  transition: transform 0.15s ease;
  filter: drop-shadow(0 6px 16px rgba(8, 43, 114, 0.24));
}

.logo-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: transform 0.15s ease;
}

.logo-text {
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 700;
  font-size: 22px;
  color: white;
  letter-spacing: -0.03em;
  line-height: 1;
}

.logo-caption {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.68);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-trigger:hover {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  padding-top: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}

.dropdown:hover .dropdown-content {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

.dropdown-card {
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  min-width: 280px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
}

.dropdown-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.dropdown-stats {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 16px;
}

.dropdown-stats strong {
  color: #10b981;
  font-weight: 600;
}

.dropdown-list {
  list-style: none;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

.dropdown-list li {
  padding: 4px 0;
}

.dropdown-cta {
  width: 100%;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.dropdown-content-wide {
  min-width: 320px;
}

.resource-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.resource-link:hover {
  background: rgba(16, 185, 129, 0.1);
}

.resource-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 10px;
  font-size: 18px;
}

.resource-name {
  display: block;
  font-weight: 500;
  color: white;
  margin-bottom: 2px;
}

.resource-desc {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.dropdown-content-simple {
  min-width: 160px;
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-ghost {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(16, 185, 129, 0.5);
}

.btn-lg {
  padding: 14px 28px;
  font-size: 15px;
  border-radius: 10px;
}

.btn-white {
  background: white;
  color: #10b981;
}

.btn-white:hover {
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2);
}

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 120px 0 80px;
  overflow: hidden;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15), transparent);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 100px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.hero-title {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(48px, 8vw, 80px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.04em;
  margin-bottom: 24px;
  color: white;
}

.title-line {
  display: block;
}

.title-gradient {
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #10b981 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientMove 3s linear infinite;
}

@keyframes gradientMove {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
  max-width: 480px;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 20px 28px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  width: fit-content;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

.animate-fade-up {
  animation: fadeUp 0.8s ease forwards;
  opacity: 0;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.features {
  padding: 100px 0;
  position: relative;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-tag {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  font-size: 13px;
  font-weight: 500;
  border-radius: 100px;
  margin-bottom: 16px;
}

.section-title {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -0.03em;
}

.section-desc {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.5);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  position: relative;
}

.feature-card {
  position: relative;
  padding: 28px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.feature-card:hover {
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-4px);
}

.feature-card:hover .feature-icon {
  transform: translateY(-4px);
}

.feature-card-wide {
  grid-column: span 2;
}

.feature-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.feature-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 14px;
  color: #10b981;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
}

.feature-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
}

.showcase {
  padding: 100px 0;
  background: rgba(255, 255, 255, 0.01);
}

.showcase-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.showcase-content {
  max-width: 480px;
}

.showcase-title {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(32px, 5vw, 42px);
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
}

.showcase-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
  margin-bottom: 28px;
}

.showcase-list {
  list-style: none;
}

.showcase-list li {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
}

.list-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.showcase-visual {
  display: flex;
  justify-content: center;
}

.showcase-card {
  width: 100%;
  max-width: 420px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.showcase-card-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.showcase-badge {
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge-primary {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
}

.showcase-question {
  font-size: 17px;
  font-weight: 500;
  color: white;
  margin-bottom: 20px;
}

.showcase-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.showcase-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.showcase-option:hover {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.showcase-option-selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.option-letter {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.showcase-option-selected .option-letter {
  background: #10b981;
  color: white;
}

.blog-preview {
  padding: 100px 0 20px;
}

.blog-preview-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 56px;
  align-items: center;
}

.blog-preview-content {
  max-width: 560px;
}

.blog-preview-title {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(30px, 5vw, 40px);
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
}

.blog-preview-desc {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.56);
  margin-bottom: 28px;
}

.blog-preview-points {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.blog-point {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.blog-point-title {
  font-size: 15px;
  font-weight: 700;
  color: white;
}

.blog-point-text {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.58);
}

.blog-preview-visual {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.blog-sample-card {
  width: 100%;
  max-width: 440px;
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 30%),
    rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.24);
}

.blog-sample-card-playful {
  background:
    radial-gradient(circle at top left, rgba(6, 182, 212, 0.16), transparent 34%),
    radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.12), transparent 30%),
    rgba(255, 255, 255, 0.035);
  transform: translateX(24px);
}

.blog-sample-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.blog-sample-badge,
.blog-sample-time {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.blog-sample-badge {
  padding: 6px 10px;
  border-radius: 999px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
}

.blog-sample-badge-fun {
  color: #67e8f9;
  background: rgba(6, 182, 212, 0.14);
}

.blog-sample-time {
  color: rgba(255, 255, 255, 0.42);
}

.blog-sample-title {
  font-size: 26px;
  line-height: 1.35;
  letter-spacing: -0.03em;
  color: white;
  margin-bottom: 16px;
}

.blog-sample-summary {
  font-size: 15px;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.62);
  margin-bottom: 22px;
}

.blog-sample-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 26px;
}

.blog-sample-tags span {
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.76);
  font-size: 13px;
}

.blog-sample-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.blog-sample-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.blog-author-avatar {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: white;
  font-size: 15px;
  font-weight: 700;
}

.blog-author-avatar-fun {
  background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
}

.blog-author-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.blog-author-info strong {
  font-size: 14px;
  color: white;
}

.blog-author-info span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.48);
}

.blog-sample-link {
  padding: 11px 16px;
  border: none;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.blog-sample-link:hover {
  background: rgba(255, 255, 255, 0.14);
}

.blog-sample-link-fun {
  background: rgba(6, 182, 212, 0.12);
}

.blog-sample-link-fun:hover {
  background: rgba(6, 182, 212, 0.18);
}

.cta {
  padding: 100px 0;
}

.cta-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 56px;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border-radius: 24px;
}

.cta-title {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.cta-desc {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.85);
}

.footer {
  padding: 40px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark-small {
  width: 38px;
  height: 32px;
  object-fit: contain;
}

.footer-name {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.footer-copy {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 32px;
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
}

.modal-subtitle {
  font-size: 17px;
  font-weight: 600;
  color: white;
  margin: 24px 0 12px;
}

.modal-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
}

.modal-list {
  list-style: none;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
}

.modal-list li {
  padding: 8px 0;
  line-height: 1.6;
}

.modal-list strong {
  color: white;
}

.contact-list {
  margin: 20px 0;
}

.contact-item {
  display: flex;
  gap: 16px;
  padding: 8px 0;
}

.contact-label {
  font-weight: 500;
  color: white;
  min-width: 100px;
}

.contact-value {
  color: rgba(255, 255, 255, 0.6);
}

.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.7s ease-out;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .feature-card-wide {
    grid-column: span 1;
  }
  
  .showcase-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .showcase-content {
    max-width: 100%;
  }

  .blog-preview-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .cta-card {
    flex-direction: column;
    text-align: center;
    gap: 28px;
    padding: 36px 28px;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .hero-stats {
    flex-direction: column;
    width: 100%;
    gap: 20px;
  }
  
  .stat-divider {
    width: 100%;
    height: 1px;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }

  .blog-sample-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .blog-sample-card-playful {
    transform: none;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
