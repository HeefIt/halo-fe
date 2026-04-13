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
                <h4>题库，带点锋芒。</h4>
                <p class="dropdown-stats">超过 <strong>1000+</strong> 道题，覆盖真实高频方向</p>
                <ul class="dropdown-list">
                  <li>后端基础与工程规范</li>
                  <li>JVM 与性能调优</li>
                  <li>数据库设计与 SQL 优化</li>
                  <li>Redis、MQ 与缓存策略</li>
                  <li>Spring / 微服务 / 分布式</li>
                  <li>系统设计、接口设计与算法</li>
                  <li>AI 应用、调试与项目实战</li>
                </ul>
                <button class="dropdown-cta" @click="$router.push('/login')">进去看看</button>
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
        <div class="hero-noise"></div>
        <div class="hero-grid" aria-hidden="true"></div>
        
        <div class="hero-content">
          <div class="hero-copy">
            <p class="hero-brand animate-fade-up">
              <span class="hero-brand__name">halo coding do</span>
              <span class="hero-brand__caption">developer study flow</span>
            </p>

            <div class="hero-kicker animate-fade-up" style="animation-delay: 80ms">
              <span>题库</span>
              <span>博客</span>
              <span>AI</span>
              <span>讨论</span>
            </div>
            
            <h1 class="hero-title animate-fade-up" style="animation-delay: 140ms">
              <span class="title-line">把练习、表达和讨论</span>
              <span class="title-line hero-title__accent">排进同一条开发者动线</span>
            </h1>
            
            <p class="hero-subtitle animate-fade-up" style="animation-delay: 220ms">
              从第一道题开始，到一篇文章、一次追问、再到一场讨论，
              路径不用再断开。
            </p>
            
            <div class="hero-actions animate-fade-up" style="animation-delay: 300ms">
              <button class="btn-primary btn-lg hero-btn-primary" @click="$router.push('/register')">
                创建账号开始
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button class="btn-secondary btn-lg hero-btn-secondary" @click="$router.push('/home')">
                先逛逛内容
              </button>
            </div>

            <ul class="hero-notes animate-fade-up" style="animation-delay: 380ms">
              <li>题目不是孤岛，后面直接接上写作与复盘。</li>
              <li>AI 不只是问答入口，也能接住拆解和追问。</li>
              <li>社区不是边角功能，讨论本身就是学习的一部分。</li>
            </ul>
          </div>

          <div class="hero-stage animate-fade-up" style="animation-delay: 180ms" aria-hidden="true">
            <div class="hero-stage__halo"></div>
            <div class="hero-stage__ring hero-stage__ring--outer"></div>
            <div class="hero-stage__ring hero-stage__ring--middle"></div>
            <div class="hero-stage__ring hero-stage__ring--inner"></div>

            <div class="hero-stage__core">
              <span class="hero-stage__core-kicker">One flow</span>
              <strong class="hero-stage__core-title">Practice to Voice</strong>
              <span class="hero-stage__core-copy">for curious developers</span>
            </div>

            <div class="hero-orbit hero-orbit--question">
              <span class="hero-orbit__eyebrow">Practice</span>
              <strong>题库</strong>
              <p>从真实题目开场</p>
            </div>

            <div class="hero-orbit hero-orbit--blog">
              <span class="hero-orbit__eyebrow">Write</span>
              <strong>博客</strong>
              <p>把判断写下来</p>
            </div>

            <div class="hero-orbit hero-orbit--ai">
              <span class="hero-orbit__eyebrow">Ask</span>
              <strong>AI</strong>
              <p>卡住时继续往前</p>
            </div>

            <div class="hero-orbit hero-orbit--community">
              <span class="hero-orbit__eyebrow">Discuss</span>
              <strong>讨论</strong>
              <p>把问题放回人群里</p>
            </div>

            <div class="hero-stage__axis hero-stage__axis--x"></div>
            <div class="hero-stage__axis hero-stage__axis--y"></div>
          </div>
        </div>

        <div class="hero-scroll animate-fade-up" style="animation-delay: 460ms">
          <span class="hero-scroll__label">向下看内容</span>
          <span class="hero-scroll__line"></span>
        </div>
      </section>

      <section class="features" ref="featuresRef">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-tag">平台能力</span>
            <h2 class="section-title">一个能练，也能写的地方</h2>
            <p class="section-desc">题目、内容和讨论会互相接上。</p>
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
              <h3 class="feature-title">题库够真</h3>
              <p class="feature-desc">题目按真实方向组织，练起来更有上下文。</p>
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
              <h3 class="feature-title">AI 接得住</h3>
              <p class="feature-desc">能拆思路，也能接住追问。</p>
            </div>
            
            <div class="feature-card animate-on-scroll" style="animation-delay: 300ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
              </div>
              <h3 class="feature-title">排行不吵</h3>
              <p class="feature-desc">让节奏和变化被看见，不只剩名次。</p>
            </div>
            
            <div class="feature-card feature-card-wide animate-on-scroll" style="animation-delay: 400ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
                </svg>
              </div>
              <h3 class="feature-title">内容互相通气</h3>
              <p class="feature-desc">内容、题库、AI 和排行能互相接上。</p>
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
              <h3 class="feature-title">博客值得认真写</h3>
              <p class="feature-desc">把题解、经验和判断认真写下来。</p>
            </div>
            
            <div class="feature-card animate-on-scroll" style="animation-delay: 600ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 class="feature-title">反馈看得见</h3>
              <p class="feature-desc">阅读、练习和互动都会留下痕迹。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="showcase">
        <div class="container">
          <div class="showcase-grid animate-on-scroll">
            <div class="showcase-content">
              <span class="section-tag">使用体验</span>
              <h2 class="showcase-title">做题、写作、对话，不用来回切页</h2>
              <p class="showcase-desc">从内容到练习，再到追问，路径是连着的。</p>
              
              <ul class="showcase-list">
                <li>
                  <span class="list-icon">✓</span>
                  <span>题库、内容和 AI 不是三套系统</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>灵感来了能写，卡住了能问</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>博客不是附件，是正式表达的一部分</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>反馈会给你节奏，但不会逼着你跑</span>
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
              <h2 class="blog-preview-title">今天不想先做题，就先读点好内容</h2>
              <p class="blog-preview-desc">这里不只放答案，也放观点和判断。</p>

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
                <h3 class="blog-sample-title">如果今天不想聊系统设计，也可以写写周末、咖啡和喜欢的小界面</h3>
                <p class="blog-sample-summary">
                  社区不只放标准答案。最近喜欢的歌单、小店，或者一个反复改到满意的按钮，也值得记下来。
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
              <h2 class="cta-title">准备好了，就进来看看</h2>
              <p class="cta-desc">也许第一篇文章，或者第一道题，就从这里开始。</p>
            </div>
            <div class="cta-action">
              <button class="btn-primary btn-lg btn-white" @click="$router.push('/register')">
                创建账号
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
          <p class="footer-copy">© 2025 halo coding do</p>
        </div>
      </div>
    </footer>

    <div v-if="showAbout" class="modal-overlay" @click="showAbout = false">
      <div class="modal" @click.stop>
        <button class="modal-close" @click="showAbout = false">×</button>
        <h3 class="modal-title">关于 halo coding do</h3>
        <p class="modal-text">halo coding do 是一个面向开发者的内容社区，题库、文章、AI 和讨论都在这里。</p>
        
        <h4 class="modal-subtitle">我们的理念</h4>
        <p class="modal-text">我们希望认真练习的人，也能顺手留下自己的表达。</p>
        
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
        <p class="modal-text">有问题或建议，欢迎联系我们。</p>
        
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
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: 132px 0 48px;
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
  background:
    radial-gradient(circle at 16% 18%, rgba(59, 130, 246, 0.2), transparent 26%),
    radial-gradient(circle at 82% 22%, rgba(16, 185, 129, 0.2), transparent 28%),
    radial-gradient(circle at 48% 68%, rgba(6, 182, 212, 0.12), transparent 34%),
    linear-gradient(180deg, rgba(5, 7, 12, 0.18) 0%, rgba(5, 7, 12, 0.72) 100%);
  pointer-events: none;
}

.hero-noise,
.hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-noise {
  opacity: 0.08;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.7) 0 1px, transparent 1px),
    radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.5) 0 1px, transparent 1px),
    radial-gradient(circle at 45% 75%, rgba(255, 255, 255, 0.65) 0 1px, transparent 1px);
  background-size: 180px 180px;
}

.hero-grid {
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0));
  opacity: 0.32;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 32px;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(520px, 0.88fr);
  align-items: center;
  gap: 36px;
}

.hero-copy {
  max-width: 580px;
}

.hero-brand {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 22px;
}

.hero-brand__name {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 5vw, 4.7rem);
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.07em;
  color: rgba(255, 255, 255, 0.98);
}

.hero-brand__caption {
  width: fit-content;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.24);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.58);
}

.hero-kicker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}

.hero-kicker span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: rgba(7, 12, 22, 0.48);
  color: rgba(226, 232, 240, 0.8);
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.hero-title {
  margin-bottom: 22px;
  font-family: var(--font-display);
  font-size: clamp(3rem, 5.9vw, 5.4rem);
  font-weight: 700;
  line-height: 0.94;
  letter-spacing: -0.07em;
  color: rgba(255, 255, 255, 0.98);
}

.title-line {
  display: block;
}

.hero-title__accent {
  color: #8ef3dc;
}

.hero-subtitle {
  max-width: 28rem;
  margin-bottom: 34px;
  font-size: 1.05rem;
  color: rgba(226, 232, 240, 0.68);
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 34px;
}

.hero-btn-primary {
  background: linear-gradient(135deg, #7dd3fc 0%, #5eead4 52%, #86efac 100%);
  color: #04111e;
  box-shadow: 0 18px 40px rgba(94, 234, 212, 0.2);
}

.hero-btn-primary:hover {
  box-shadow: 0 22px 48px rgba(94, 234, 212, 0.28);
}

.hero-btn-secondary {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.36);
}

.hero-btn-secondary:hover {
  border-color: rgba(125, 211, 252, 0.34);
  background: rgba(15, 23, 42, 0.54);
}

.hero-notes {
  display: grid;
  gap: 12px;
  list-style: none;
}

.hero-notes li {
  position: relative;
  padding-left: 18px;
  color: rgba(226, 232, 240, 0.62);
  font-size: 0.95rem;
  line-height: 1.75;
}

.hero-notes li::before {
  content: '';
  position: absolute;
  top: 0.85em;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7dd3fc 0%, #5eead4 100%);
  box-shadow: 0 0 0 6px rgba(94, 234, 212, 0.08);
}

.hero-stage {
  position: relative;
  min-height: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-stage__halo {
  position: absolute;
  inset: 16% 10% 14% 14%;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(94, 234, 212, 0.18) 0%, rgba(56, 189, 248, 0.12) 38%, transparent 72%);
  filter: blur(12px);
}

.hero-stage__ring {
  position: absolute;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 50%;
}

.hero-stage__ring--outer {
  width: 520px;
  height: 520px;
  border-color: rgba(94, 234, 212, 0.16);
  animation: hero-spin 28s linear infinite;
}

.hero-stage__ring--middle {
  width: 400px;
  height: 400px;
  border-color: rgba(125, 211, 252, 0.18);
  animation: hero-spin-reverse 22s linear infinite;
}

.hero-stage__ring--inner {
  width: 270px;
  height: 270px;
  border-color: rgba(255, 255, 255, 0.12);
  animation: hero-spin 16s linear infinite;
}

.hero-stage__core {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.14), transparent 54%),
    linear-gradient(180deg, rgba(10, 18, 34, 0.94), rgba(5, 10, 22, 0.9));
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.36),
    0 0 0 16px rgba(125, 211, 252, 0.03);
  text-align: center;
}

.hero-stage__core-kicker {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.72);
}

.hero-stage__core-title {
  max-width: 10rem;
  font-family: var(--font-display);
  font-size: 1.9rem;
  line-height: 1.02;
  letter-spacing: -0.05em;
  color: rgba(255, 255, 255, 0.97);
}

.hero-stage__core-copy {
  color: rgba(226, 232, 240, 0.56);
  font-size: 0.84rem;
  line-height: 1.5;
}

.hero-stage__axis {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.22), transparent);
  opacity: 0.8;
}

.hero-stage__axis--x {
  width: min(92%, 560px);
  height: 1px;
}

.hero-stage__axis--y {
  width: 1px;
  height: min(92%, 560px);
  background: linear-gradient(180deg, transparent, rgba(148, 163, 184, 0.22), transparent);
}

.hero-orbit {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 168px;
  padding: 14px 16px 14px 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(7, 12, 22, 0.88), rgba(10, 18, 34, 0.52));
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.hero-orbit strong {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: -0.03em;
}

.hero-orbit p {
  font-size: 0.82rem;
  color: rgba(226, 232, 240, 0.56);
  line-height: 1.55;
}

.hero-orbit__eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.72);
}

.hero-orbit--question {
  top: 11%;
  right: 6%;
  animation: hero-float 7s ease-in-out infinite;
}

.hero-orbit--blog {
  top: 20%;
  left: 3%;
  animation: hero-float 8.5s ease-in-out infinite 1.2s;
}

.hero-orbit--ai {
  right: 0;
  bottom: 20%;
  animation: hero-float 8s ease-in-out infinite 0.8s;
}

.hero-orbit--community {
  left: 7%;
  bottom: 8%;
  animation: hero-float 7.5s ease-in-out infinite 1.8s;
}

.hero-scroll {
  position: absolute;
  left: 32px;
  right: 32px;
  bottom: 24px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(148, 163, 184, 0.64);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-scroll__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.34), transparent);
}

@keyframes hero-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes hero-spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes hero-float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
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
  .hero-content {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .hero-copy {
    max-width: 100%;
  }

  .hero-stage {
    min-height: 560px;
  }

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

  .hero {
    padding: 116px 0 36px;
  }

  .hero-content {
    padding: 0 20px;
  }

  .hero-brand {
    gap: 10px;
    margin-bottom: 18px;
  }

  .hero-kicker {
    margin-bottom: 18px;
  }

  .hero-subtitle {
    margin-bottom: 28px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-btn-primary,
  .hero-btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .hero-stage {
    min-height: 420px;
    margin-top: 10px;
  }

  .hero-stage__ring--outer {
    width: 340px;
    height: 340px;
  }

  .hero-stage__ring--middle {
    width: 260px;
    height: 260px;
  }

  .hero-stage__ring--inner {
    width: 176px;
    height: 176px;
  }

  .hero-stage__core {
    width: 150px;
    height: 150px;
    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.28),
      0 0 0 10px rgba(125, 211, 252, 0.03);
  }

  .hero-stage__core-title {
    font-size: 1.3rem;
  }

  .hero-orbit {
    min-width: 126px;
    padding: 10px 12px 10px 14px;
    border-radius: 18px;
  }

  .hero-orbit strong {
    font-size: 0.92rem;
  }

  .hero-orbit p,
  .hero-orbit__eyebrow {
    display: none;
  }

  .hero-orbit--question {
    top: 8%;
    right: 4%;
  }

  .hero-orbit--blog {
    top: 18%;
    left: 2%;
  }

  .hero-orbit--ai {
    right: 1%;
    bottom: 16%;
  }

  .hero-orbit--community {
    left: 4%;
    bottom: 6%;
  }

  .hero-scroll {
    position: static;
    padding: 18px 20px 0;
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
