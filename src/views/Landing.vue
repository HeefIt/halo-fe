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
          <span 
            class="logo-icon" 
            ref="logoIconRef"
            :style="{ transform: logoTransform }"
          >
            <span class="logo-letter" v-for="(letter, index) in 'H'" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">{{ letter }}</span>
          </span>
          <span class="logo-text" ref="logoTextRef" :style="{ transform: logoTransform }">
            <span class="logo-letter" v-for="(letter, index) in 'alo'" :key="index" :style="{ animationDelay: `${(index + 1) * 0.1}s` }">{{ letter }}</span>
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
                <h4>Java后端工程师题库</h4>
                <p class="dropdown-stats">超过 <strong>1000道</strong> 精选题目</p>
                <ul class="dropdown-list">
                  <li>Java 基础语法与特性</li>
                  <li>JVM 内存模型与调优</li>
                  <li>并发编程与多线程</li>
                  <li>Redis 缓存设计与应用</li>
                  <li>MySQL 数据库设计与优化</li>
                  <li>Spring 框架核心原理</li>
                  <li>微服务架构与分布式</li>
                </ul>
                <button class="dropdown-cta" @click="$router.push('/login')">立即登录查看完整题库</button>
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
            <span>2025 面试季 · 助力 5000+ 开发者成功上岸</span>
          </div>
          
          <h1 class="hero-title animate-fade-up" style="animation-delay: 100ms">
            <span class="title-line">Java 面试</span>
            <span class="title-line title-gradient">一战成硕</span>
          </h1>
          
          <p class="hero-subtitle animate-fade-up" style="animation-delay: 200ms">
            告别碎片化学习，系统攻克 Java 八股文<br>
            从基础到架构，让每一次刷题都离 Offer 更近一步
          </p>
          
          <div class="hero-actions animate-fade-up" style="animation-delay: 300ms">
            <button class="btn-primary btn-lg" @click="$router.push('/register')">
              免费开启学习之旅
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button class="btn-secondary btn-lg" @click="$router.push('/home')">
              先逛逛题库
            </button>
          </div>
          
          <div class="hero-stats animate-fade-up" style="animation-delay: 400ms">
            <div class="stat">
              <span class="stat-value">1000+</span>
              <span class="stat-label">高频面试真题</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">5000+</span>
              <span class="stat-label">开发者信赖</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">92%</span>
              <span class="stat-label">学员面试通过率</span>
            </div>
          </div>
        </div>
      </section>

      <section class="features" ref="featuresRef">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-tag">核心能力</span>
            <h2 class="section-title">不止刷题，更是能力跃迁</h2>
            <p class="section-desc">从知识输入到能力输出，构建完整的学习闭环</p>
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
              <h3 class="feature-title">大厂真题库</h3>
              <p class="feature-desc">收录阿里、腾讯、字节等一线大厂高频面试题，覆盖 Java 基础、JVM、并发、Spring 全栈技术体系</p>
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
              <h3 class="feature-title">AI 深度解析</h3>
              <p class="feature-desc">每道题目配备 AI 智能解析，从原理到实战层层递进，帮你真正理解而非死记硬背</p>
            </div>
            
            <div class="feature-card animate-on-scroll" style="animation-delay: 300ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
              </div>
              <h3 class="feature-title">成长激励体系</h3>
              <p class="feature-desc">刷题解锁成就徽章，排行榜见证你的进步，让学习像游戏一样有成就感</p>
            </div>
            
            <div class="feature-card feature-card-wide animate-on-scroll" style="animation-delay: 400ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
                </svg>
              </div>
              <h3 class="feature-title">AI 学习伴侣</h3>
              <p class="feature-desc">7×24 小时智能答疑，支持 PDF 简历解析、代码评审、技术文档智能解读，你的专属面试教练</p>
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
              <h3 class="feature-title">智能学习计划</h3>
              <p class="feature-desc">根据你的目标岗位和时间安排，自动生成个性化学习路径，高效备战不迷茫</p>
            </div>
            
            <div class="feature-card animate-on-scroll" style="animation-delay: 600ms">
              <div class="feature-glow" :style="featureGlowStyle"></div>
              <div class="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 class="feature-title">学习数据洞察</h3>
              <p class="feature-desc">可视化追踪学习进度，智能识别知识盲区，用数据驱动你的成长轨迹</p>
            </div>
          </div>
        </div>
      </section>

      <section class="showcase">
        <div class="container">
          <div class="showcase-grid animate-on-scroll">
            <div class="showcase-content">
              <span class="section-tag">学习体验</span>
              <h2 class="showcase-title">刷题，也可以是一种享受</h2>
              <p class="showcase-desc">极简界面设计，让你心无旁骛。即时反馈机制，让每道题都有收获。这不是题海战术，而是精准打击。</p>
              
              <ul class="showcase-list">
                <li>
                  <span class="list-icon">✓</span>
                  <span>单选 / 多选 / 判断 / 简答，全题型覆盖</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>AI 逐题深度解析，知其然更知其所以然</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>错题智能归档，薄弱点定向突破</span>
                </li>
                <li>
                  <span class="list-icon">✓</span>
                  <span>学习报告可视化，进步看得见</span>
                </li>
              </ul>
            </div>
            
            <div class="showcase-visual">
              <div class="showcase-card">
                <div class="showcase-card-header">
                  <span class="showcase-badge badge-success">简单</span>
                  <span class="showcase-badge badge-primary">单选题</span>
                </div>
                <h4 class="showcase-question">Java 中哪个关键字用于定义类？</h4>
                <div class="showcase-options">
                  <div class="showcase-option">
                    <span class="option-letter">A</span>
                    <span>class</span>
                  </div>
                  <div class="showcase-option showcase-option-selected">
                    <span class="option-letter">B</span>
                    <span>public</span>
                  </div>
                  <div class="showcase-option">
                    <span class="option-letter">C</span>
                    <span>static</span>
                  </div>
                  <div class="showcase-option">
                    <span class="option-letter">D</span>
                    <span>void</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cta animate-on-scroll">
        <div class="container">
          <div class="cta-card">
            <div class="cta-content">
              <h2 class="cta-title">你的 Offer，从这里启程</h2>
              <p class="cta-desc">加入 5000+ 开发者，用正确的方法，做正确的事</p>
            </div>
            <div class="cta-action">
              <button class="btn-primary btn-lg btn-white" @click="$router.push('/register')">
                立即免费加入
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
            <span class="logo-icon-small">H</span>
            <span class="footer-name">Halo · Java 面试利器</span>
          </div>
          <p class="footer-copy">© 2025 Halo · 让每一次刷题都有价值</p>
        </div>
      </div>
    </footer>

    <div v-if="showAbout" class="modal-overlay" @click="showAbout = false">
      <div class="modal" @click.stop>
        <button class="modal-close" @click="showAbout = false">×</button>
        <h3 class="modal-title">关于 Halo</h3>
        <p class="modal-text">Halo 是一个专注于 Java 后端工程师面试的学习平台，我们相信「刻意练习」的力量——通过高质量的题目、深度的解析、智能的反馈，帮助每一位开发者在面试中展现最好的自己。</p>
        
        <h4 class="modal-subtitle">我们的理念</h4>
        <p class="modal-text">面试不是靠运气，而是靠准备。我们拒绝「八股文死记硬背」，提倡「理解原理、融会贯通」。每一道题，都应该成为你技术成长的阶梯。</p>
        
        <h4 class="modal-subtitle">为什么选择我们</h4>
        <ul class="modal-list">
          <li><strong>真题驱动</strong>：题目来自一线大厂真实面试场景，拒绝无效刷题</li>
          <li><strong>AI 赋能</strong>：智能解析、个性化推荐，让学习效率翻倍</li>
          <li><strong>成长可见</strong>：数据化追踪学习进度，每一步都算数</li>
          <li><strong>社区陪伴</strong>：与 5000+ 开发者同行，你不是一个人在战斗</li>
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

.logo:hover .logo-letter {
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: white;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 700;
  font-size: 20px;
  border-radius: 10px;
  transition: transform 0.15s ease;
}

.logo-text {
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 600;
  font-size: 22px;
  color: white;
  letter-spacing: -0.02em;
  transition: transform 0.15s ease;
}

.logo-letter {
  display: inline-block;
  animation: letterGlow 3s ease-in-out infinite;
}

@keyframes letterGlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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

.logo-icon-small {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  color: white;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 700;
  font-size: 16px;
  border-radius: 8px;
}

.footer-name {
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 600;
  color: white;
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
  
  .footer-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
