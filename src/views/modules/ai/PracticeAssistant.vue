<template>
  <div class="practice-assistant-page app-shell app-shell--internal" :class="{ 'is-dark': themeStore.isDark }">
    <main class="assistant-main">
      <AIToolHeader
        title="练习助手"
        badge="推荐"
      />

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
import { useThemeStore } from '@/stores/theme'
import AIToolHeader from './AIToolHeader.vue'

const router = useRouter()
const themeStore = useThemeStore()

const startPractice = () => {
  router.push('/home/questions')
}
</script>

<style scoped>
.practice-assistant-page {
  --ai-accent: #c2410c;
  --ai-accent-soft: rgba(194, 65, 12, 0.08);
  --ai-accent-line: rgba(194, 65, 12, 0.16);
  --ai-bg: #f4f6fa;
  --ai-surface: #ffffff;
  --ai-surface-alt: #f8fafc;
  --ai-surface-muted: #fff7ed;
  --ai-border: rgba(15, 23, 42, 0.1);
  --ai-text: var(--color-text);
  --ai-text-soft: var(--color-text-secondary);
  --ai-text-faint: var(--color-text-muted);
  height: 100dvh;
  min-height: 100dvh;
  background: var(--ai-bg);
  overflow: hidden;
}

.practice-assistant-page.is-dark {
  --ai-accent: #fdba74;
  --ai-accent-soft: rgba(251, 146, 60, 0.14);
  --ai-accent-line: rgba(251, 146, 60, 0.22);
  --ai-bg: #09111c;
  --ai-surface: #0f172a;
  --ai-surface-alt: #111c31;
  --ai-surface-muted: #1a2232;
  --ai-border: rgba(148, 163, 184, 0.14);
  --ai-text: var(--text-1);
  --ai-text-soft: var(--text-2);
  --ai-text-faint: var(--text-3);
}

.assistant-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 16px 12px;
  width: 100%;
  display: grid;
  gap: 14px;
  height: 100dvh;
  overflow-y: auto;
  align-content: start;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
  gap: 36px;
  align-items: center;
  padding: 24px;
  border: 1px solid var(--ai-border);
  border-radius: 20px;
  background: linear-gradient(180deg, var(--ai-surface), var(--ai-surface-alt));
}

.hero-badge {
  display: inline-block;
  padding: 6px 14px;
  background: var(--ai-accent-soft);
  border: 1px solid var(--ai-accent-line);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-accent);
  margin-bottom: 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: var(--ai-text);
  margin: 0 0 20px 0;
  line-height: 1.1;
  letter-spacing: -1px;
}

.hero-desc {
  font-size: 18px;
  color: var(--ai-text-soft);
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
  background: var(--ai-accent);
  border: 1px solid var(--ai-accent);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
}

.primary-btn:hover {
  transform: translateY(-1px);
}

.secondary-btn {
  padding: 14px 28px;
  background: transparent;
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  color: var(--ai-text);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: var(--ai-surface-alt);
}

.hero-visual {
  position: relative;
}

.visual-card {
  background: var(--ai-surface);
  border-radius: 18px;
  padding: 28px;
  border: 1px solid var(--ai-border);
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
  background: var(--ai-accent);
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
  background: rgba(234, 179, 8, 0.12);
  color: #a16207;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--ai-text);
  margin: 0 0 10px 0;
}

.card-desc {
  font-size: 14px;
  color: var(--ai-text-soft);
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
  background: var(--ai-accent-soft);
  border-radius: 6px;
  font-size: 12px;
  color: var(--ai-accent);
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
  background: var(--ai-surface-muted);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--ai-accent);
  border-radius: 3px;
}

.progress-text {
  font-size: 12px;
  color: var(--ai-text-faint);
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
  background: var(--ai-surface);
  border-radius: 12px;
  border: 1px solid var(--ai-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text);
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
  color: var(--ai-accent);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.features-section {
  display: grid;
  gap: 18px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--ai-text);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--ai-surface);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  border: 1px solid var(--ai-border);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--ai-accent-line);
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
  color: var(--ai-text);
  margin: 0 0 12px 0;
}

.feature-card p {
  font-size: 14px;
  color: var(--ai-text-soft);
  line-height: 1.6;
  margin: 0;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  background: linear-gradient(180deg, var(--ai-surface), var(--ai-surface-alt));
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  color: var(--ai-text);
  border: 1px solid var(--ai-border);
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--ai-text-soft);
}

.cta-section {
  background: var(--ai-surface);
  border-radius: 18px;
  padding: 40px;
  text-align: center;
  border: 1px solid var(--ai-border);
}

.cta-content h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--ai-text);
  margin: 0 0 12px 0;
}

.cta-content p {
  font-size: 18px;
  color: var(--ai-text-soft);
  margin: 0 0 32px 0;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: var(--ai-accent);
  border: 1px solid var(--ai-accent);
  border-radius: 12px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
}

.cta-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 28px;
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
  .assistant-main {
    padding: 8px 10px 10px;
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
