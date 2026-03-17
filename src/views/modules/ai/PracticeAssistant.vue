<template>
  <div class="practice-assistant-container">
    <header class="assistant-header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <div class="brand-text">
            <h1>AI 练习助手</h1>
            <span class="tagline">推荐 · 诊断 · 复盘</span>
          </div>
        </div>
        <nav class="header-nav">
          <button class="nav-item" @click="navigateTo('chatbot')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>AI对话</span>
          </button>
          <button class="nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>练习助手</span>
          </button>
          <button class="nav-item" @click="navigateTo('customer-service')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"></path>
            </svg>
            <span>客服</span>
          </button>
          <button class="nav-item" @click="navigateTo('multimodal')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>多模态</span>
          </button>
        </nav>
        <button class="home-btn" @click="goHome">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>返回首页</span>
        </button>
      </div>
    </header>

    <main class="assistant-main">
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">学习加速器</div>
          <h1 class="hero-title">让每次练习更有方向</h1>
          <p class="hero-desc">
            根据你的节奏、薄弱点和兴趣主题推荐下一步内容，不只给答案，
            还帮你看清为什么值得练、练完如何沉淀
          </p>
          <div class="hero-actions">
            <button class="primary-btn" @click="startPractice">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              开始下一组练习
            </button>
            <button class="secondary-btn" @click="navigateTo('chatbot')">
              先去 AI 对话
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-card main-card">
            <div class="card-header">
              <span class="card-badge">今日推荐</span>
              <span class="card-difficulty medium">中等难度</span>
            </div>
            <h3 class="card-title">高并发接口如何保证幂等性？</h3>
            <p class="card-desc">当用户重复提交或网络重试时，如何避免服务端生成重复数据，并兼顾可扩展性？</p>
            <div class="card-tags">
              <span class="tag">后端</span>
              <span class="tag">幂等</span>
              <span class="tag">分布式</span>
            </div>
            <div class="card-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: 68%"></div>
              </div>
              <span class="progress-text">72% 用户已掌握</span>
            </div>
          </div>
          <div class="floating-cards">
            <div class="float-card card-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              已完成 128 次练习
            </div>
            <div class="float-card card-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              正确率 85%
            </div>
            <div class="float-card card-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              连续专注 7 天
            </div>
          </div>
        </div>
      </div>

      <div class="features-section">
        <h2 class="section-title">你会得到什么</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon recommend">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <h3>个性化推荐</h3>
            <p>结合历史表现、标签偏好和难点分布，安排更值得练的下一题</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon analysis">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <h3>深度复盘</h3>
            <p>不只解析正确答案，还提示误区、边界条件和延伸知识</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon track">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3>成长诊断</h3>
            <p>用可视化数据定位薄弱主题，帮助你安排下一轮训练</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon plan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>学习路径</h3>
            <p>围绕目标岗位或技术方向生成连续练习路线，让学习不再跳跃</p>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-number">10,000+</div>
          <div class="stat-label">精选题目</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">50+</div>
          <div class="stat-label">知识标签</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">98%</div>
          <div class="stat-label">用户好评</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">24/7</div>
          <div class="stat-label">AI 在线</div>
        </div>
      </div>

      <div class="cta-section">
        <div class="cta-content">
          <h2>准备好开始了吗？</h2>
          <p>让 AI 帮你把零散练习变成稳定进步</p>
          <button class="cta-btn" @click="startPractice">
            去做一组练习
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (feature) => {
  router.push(`/ai/${feature}`)
}

const goHome = () => {
  router.push('/home')
}

const startPractice = () => {
  router.push('/home/questions')
}
</script>

<style scoped>
.practice-assistant-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fffbeb 100%);
  display: flex;
  flex-direction: column;
}

.assistant-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.brand-text h1 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.tagline {
  font-size: 12px;
  color: #9a3412;
  font-weight: 500;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(249, 115, 22, 0.08);
  color: #c2410c;
}

.nav-item.active {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 10px;
  color: #c2410c;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.home-btn:hover {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.3);
}

.assistant-main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 32px;
  width: 100%;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  margin-bottom: 80px;
}

.hero-badge {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #c2410c;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 20px 0;
  line-height: 1.1;
  letter-spacing: -1px;
}

.hero-desc {
  font-size: 18px;
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 32px 0;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
}

.secondary-btn {
  padding: 14px 28px;
  background: white;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 12px;
  color: #c2410c;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: rgba(249, 115, 22, 0.05);
  border-color: rgba(249, 115, 22, 0.3);
}

.hero-visual {
  position: relative;
}

.visual-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.main-card {
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-badge {
  padding: 4px 12px;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.card-difficulty {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.card-difficulty.medium {
  background: rgba(234, 179, 8, 0.1);
  color: #a16207;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;
}

.card-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  padding: 4px 12px;
  background: rgba(249, 115, 22, 0.08);
  border-radius: 6px;
  font-size: 12px;
  color: #c2410c;
  font-weight: 500;
}

.card-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border-radius: 3px;
}

.progress-text {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.floating-cards {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.float-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  animation: float 3s ease-in-out infinite;
}

.card-1 {
  top: -20px;
  right: -40px;
  animation-delay: 0s;
}

.card-2 {
  bottom: 60px;
  left: -50px;
  animation-delay: 0.5s;
}

.card-3 {
  bottom: -20px;
  right: 20px;
  animation-delay: 1s;
}

.float-card svg {
  color: #f97316;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.features-section {
  margin-bottom: 80px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  margin: 0 0 48px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  border: 1px solid rgba(249, 115, 22, 0.08);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(249, 115, 22, 0.15);
  border-color: rgba(249, 115, 22, 0.2);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon.recommend {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%);
  color: #f97316;
}

.feature-icon.analysis {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%);
  color: #22c55e;
}

.feature-icon.track {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%);
  color: #3b82f6;
}

.feature-icon.plan {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%);
  color: #a855f7;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.feature-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 80px;
}

.stat-card {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.cta-section {
  background: white;
  border-radius: 24px;
  padding: 64px;
  text-align: center;
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.cta-content h2 {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.cta-content p {
  font-size: 18px;
  color: #64748b;
  margin: 0 0 32px 0;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
}

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .hero-visual {
    max-width: 500px;
    margin: 0 auto;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    gap: 16px;
  }

  .header-nav {
    display: none;
  }

  .assistant-main {
    padding: 32px 16px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-section {
    grid-template-columns: 1fr 1fr;
  }

  .cta-section {
    padding: 40px 24px;
  }
}
</style>
