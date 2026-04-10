<template>
  <div class="ai-page">
    <header class="ai-nav">
      <div class="ai-nav-container">
        <div class="ai-nav-content">
          <button class="ai-logo" type="button" @click="goHome">
            <span class="logo-icon">
              <el-icon :size="18"><ChatDotRound /></el-icon>
            </span>
            <span class="logo-copy">
              <strong>AI 协作中心</strong>
              <span>Halo</span>
            </span>
          </button>

          <nav class="ai-nav-menu">
            <button
              type="button"
              class="ai-nav-item"
              :class="{ active: isActive('chatbot') }"
              @click="navigateTo('chatbot')"
            >
              <el-icon><ChatLineRound /></el-icon>
              <span>对话</span>
            </button>
            <button
              type="button"
              class="ai-nav-item"
              :class="{ active: isActive('role-chat') }"
              @click="navigateTo('role-chat')"
            >
              <el-icon><Edit /></el-icon>
              <span>角色</span>
            </button>
            <button
              type="button"
              class="ai-nav-item"
              :class="{ active: isActive('customer-service') }"
              @click="navigateTo('customer-service')"
            >
              <el-icon><Service /></el-icon>
              <span>服务</span>
            </button>
            <button
              type="button"
              class="ai-nav-item"
              :class="{ active: isActive('multimodal') }"
              @click="navigateTo('multimodal')"
            >
              <el-icon><Picture /></el-icon>
              <span>解析</span>
            </button>
          </nav>

          <button class="back-home" type="button" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            <span>返回首页</span>
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <section class="hero-panel">
          <div class="hero-copy">
            <span class="hero-kicker">AI Workspace</span>
            <h1 class="welcome-title">把问题交给更对路的入口。</h1>
            <p class="welcome-subtitle">
              想聊、想试、想查，或者直接丢一张图进来，都行。
            </p>

            <div class="hero-actions">
              <button class="hero-primary" type="button" @click="navigateTo('chatbot')">开始对话</button>
              <button class="hero-secondary" type="button" @click="navigateTo('role-chat')">进入角色模式</button>
            </div>
          </div>

          <div class="hero-side">
            <div class="hero-metric">
              <span>推荐起点</span>
              <strong>AI 对话</strong>
              <p>先把问题说开。</p>
            </div>
            <div class="hero-metric">
              <span>最快出结果</span>
              <strong>多模态解析</strong>
              <p>截图和资料都能接。</p>
            </div>
          </div>
        </section>

        <section class="features-grid">
          <button class="feature-card feature-card--primary" type="button" @click="navigateTo('chatbot')">
            <div class="feature-head">
              <span class="feature-icon">
                <el-icon :size="24"><ChatLineRound /></el-icon>
              </span>
              <span class="feature-status feature-status--solid">推荐</span>
            </div>
            <h3 class="feature-title">AI 对话</h3>
            <p class="feature-description">适合梳理需求、代码和连续追问。</p>
            <span class="feature-meta">适合深聊</span>
          </button>

          <button class="feature-card" type="button" @click="navigateTo('role-chat')">
            <div class="feature-head">
              <span class="feature-icon">
                <el-icon :size="24"><Edit /></el-icon>
              </span>
              <span class="feature-status">场景化</span>
            </div>
            <h3 class="feature-title">角色对话</h3>
            <p class="feature-description">更适合模拟面试和场景对话。</p>
            <span class="feature-meta">更贴近真实场景</span>
          </button>

          <button class="feature-card" type="button" @click="navigateTo('customer-service')">
            <div class="feature-head">
              <span class="feature-icon">
                <el-icon :size="24"><Service /></el-icon>
              </span>
              <span class="feature-status">在线</span>
            </div>
            <h3 class="feature-title">平台服务</h3>
            <p class="feature-description">查入口、看信息、快速问路都很顺手。</p>
            <span class="feature-meta">适合轻量问题</span>
          </button>

          <button class="feature-card" type="button" @click="navigateTo('multimodal')">
            <div class="feature-head">
              <span class="feature-icon">
                <el-icon :size="24"><Picture /></el-icon>
              </span>
              <span class="feature-status">增强</span>
            </div>
            <h3 class="feature-title">多模态解析</h3>
            <p class="feature-description">截图、图片和资料都能转成清晰结果。</p>
            <span class="feature-meta">适合识图和摘取</span>
          </button>
        </section>

        <section class="quick-strip">
          <article class="quick-note">
            <span>深度协作</span>
            <p>问题复杂时，从 AI 对话开始。</p>
          </article>
          <article class="quick-note">
            <span>场景模拟</span>
            <p>需要代入感时，角色模式会更自然。</p>
          </article>
          <article class="quick-note">
            <span>快速处理</span>
            <p>手里已经有图或资料时，直接走解析。</p>
          </article>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ChatDotRound, ChatLineRound, Edit, Service, Picture, HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const isActive = (feature) => {
  return route.path === `/ai/${feature}`
}

const navigateTo = (feature) => {
  try {
    router.push(`/ai/${feature}`)
  } catch (error) {
    console.error('路由跳转失败:', error)
  }
}

const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.ai-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(33, 87, 255, 0.08), transparent 28%),
    radial-gradient(circle at right center, rgba(13, 17, 28, 0.08), transparent 24%),
    #f5f7fb;
  color: #111827;
}

.ai-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(18px);
  background: rgba(245, 247, 251, 0.86);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.ai-nav-container,
.container {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
}

.ai-nav-content {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.ai-logo,
.back-home,
.ai-nav-item,
.feature-card,
.hero-primary,
.hero-secondary {
  border: none;
  background: none;
  cursor: pointer;
}

.ai-logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  color: inherit;
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #111827, #2b4eff);
  color: #fff;
  box-shadow: 0 12px 24px rgba(43, 78, 255, 0.22);
}

.logo-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.logo-copy strong {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.1;
}

.logo-copy span {
  font-size: 12px;
  color: #667085;
  line-height: 1;
}

.ai-nav-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.ai-nav-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #475467;
  transition: all 0.2s ease;
}

.ai-nav-item:hover,
.ai-nav-item.active {
  background: #ffffff;
  color: #111827;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #344054;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.main-content {
  padding: 36px 0 56px;
}

.container {
  display: grid;
  gap: 22px;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.9fr);
  gap: 18px;
  align-items: stretch;
}

.hero-copy,
.hero-side,
.feature-card,
.quick-note {
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.88);
}

.hero-copy {
  padding: 36px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(239, 244, 255, 0.92)),
    #ffffff;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: rgba(43, 78, 255, 0.08);
  color: #2b4eff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.welcome-title {
  margin: 0;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.welcome-subtitle {
  max-width: 720px;
  margin: 16px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: #475467;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.hero-primary,
.hero-secondary {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-primary {
  color: #fff;
  background: linear-gradient(135deg, #111827, #2b4eff);
  box-shadow: 0 18px 36px rgba(43, 78, 255, 0.22);
}

.hero-secondary {
  color: #111827;
  background: rgba(17, 24, 39, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.hero-primary:hover,
.hero-secondary:hover,
.feature-card:hover {
  transform: translateY(-2px);
}

.hero-side {
  padding: 18px;
  display: grid;
  gap: 14px;
}

.hero-metric {
  padding: 18px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(245, 247, 255, 0.95), rgba(255, 255, 255, 0.95));
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.hero-metric span {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: #667085;
}

.hero-metric strong {
  display: block;
  font-size: 22px;
  letter-spacing: -0.03em;
}

.hero-metric p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475467;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 22px;
  text-align: left;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.feature-card:hover {
  border-color: rgba(43, 78, 255, 0.18);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.feature-card--primary {
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.96), rgba(30, 41, 59, 0.94));
  color: #f8fafc;
}

.feature-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feature-icon {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(43, 78, 255, 0.1);
  color: #2b4eff;
}

.feature-card--primary .feature-icon {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.feature-status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
  color: #475467;
  font-size: 12px;
  font-weight: 700;
}

.feature-status--solid {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.feature-title {
  margin: 18px 0 0;
  font-size: 20px;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.feature-description {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: inherit;
  opacity: 0.82;
}

.feature-meta {
  display: block;
  margin-top: 18px;
  font-size: 12px;
  color: #667085;
}

.feature-card--primary .feature-meta {
  color: rgba(248, 250, 252, 0.72);
}

.quick-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.quick-note {
  padding: 18px 20px;
}

.quick-note span {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #2b4eff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.quick-note p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #475467;
}

@media (max-width: 1024px) {
  .hero-panel,
  .features-grid,
  .quick-strip {
    grid-template-columns: 1fr 1fr;
  }

  .hero-copy {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .ai-nav-container,
  .container {
    width: min(100% - 24px, 1180px);
  }

  .ai-nav-content {
    min-height: 64px;
  }

  .ai-nav-menu {
    display: none;
  }

  .back-home span {
    display: none;
  }

  .main-content {
    padding: 22px 0 40px;
  }

  .hero-panel,
  .features-grid,
  .quick-strip {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    padding: 26px 22px;
  }

  .welcome-title {
    font-size: 32px;
  }
}
</style>
