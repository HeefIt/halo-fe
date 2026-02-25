<!--
  AI助手页面
  功能描述：AI应用入口页面，提供四个AI功能模块导航
  主要功能：
    - 显示AI应用导航栏（机器人对话、刷题助手、智能客服、多模态解析）
    - 选择AI功能模块进入对应页面
  使用位置：路由 /ai
-->
<template>
  <div class="ai-page">
    <!-- AI导航栏 -->
    <div class="ai-nav">
      <div class="ai-nav-container">
        <div class="ai-nav-content">
          <!-- Logo和标题 -->
          <div class="ai-logo" @click="goHome">
            <div class="logo-icon">
              <el-icon :size="24"><ChatDotRound /></el-icon>
            </div>
            <span class="logo-title">AI 智能助手</span>
          </div>
          
          <!-- AI功能导航菜单 -->
          <nav class="ai-nav-menu">
            <span 
              class="ai-nav-item" 
              :class="{ active: isActive('chatbot') }"
              @click="navigateTo('chatbot')"
            >
              <el-icon><ChatLineRound /></el-icon>
              <span>机器人对话</span>
            </span>
            <span 
              class="ai-nav-item" 
              :class="{ active: isActive('practice-assistant') }"
              @click="navigateTo('practice-assistant')"
            >
              <el-icon><Edit /></el-icon>
              <span>刷题助手</span>
            </span>
            <span 
              class="ai-nav-item" 
              :class="{ active: isActive('customer-service') }"
              @click="navigateTo('customer-service')"
            >
              <el-icon><Service /></el-icon>
              <span>智能客服</span>
            </span>
            <span 
              class="ai-nav-item" 
              :class="{ active: isActive('multimodal') }"
              @click="navigateTo('multimodal')"
            >
              <el-icon><Picture /></el-icon>
              <span>多模态解析</span>
            </span>
          </nav>
          
          <!-- 返回首页按钮 -->
          <div class="back-home" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            <span>返回首页</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <!-- 欢迎区 -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h1 class="welcome-title">欢迎使用 AI 智能助手</h1>
            <p class="welcome-subtitle">选择一个功能模块开始您的AI体验之旅</p>
          </div>
        </div>
        
        <!-- 功能卡片网格 -->
        <div class="features-grid">
          <div class="feature-card chatbot-card" @click="navigateTo('chatbot')">
            <div class="feature-icon">
              <el-icon :size="48"><ChatLineRound /></el-icon>
            </div>
            <h3 class="feature-title">机器人对话</h3>
            <p class="feature-description">智能对话助手，支持会话记忆和历史会话管理</p>
            <div class="feature-status active">
              <span>可用</span>
            </div>
          </div>
          
          <div class="feature-card practice-card" @click="navigateTo('practice-assistant')">
            <div class="feature-icon">
              <el-icon :size="48"><Edit /></el-icon>
            </div>
            <h3 class="feature-title">刷题助手</h3>
            <p class="feature-description">智能刷题模拟器，提供个性化的题目推荐和解析</p>
            <div class="feature-status">
              <span>开发中</span>
            </div>
          </div>
          
          <div class="feature-card service-card" @click="navigateTo('customer-service')">
            <div class="feature-icon">
              <el-icon :size="48"><Service /></el-icon>
            </div>
            <h3 class="feature-title">智能客服</h3>
            <p class="feature-description">7x24小时智能客服，快速解答您的疑问</p>
            <div class="feature-status">
              <span>开发中</span>
            </div>
          </div>
          
          <div class="feature-card multimodal-card" @click="navigateTo('multimodal')">
            <div class="feature-icon">
              <el-icon :size="48"><Picture /></el-icon>
            </div>
            <h3 class="feature-title">多模态解析</h3>
            <p class="feature-description">支持PDF、图片等多模态文件的智能解析</p>
            <div class="feature-status">
              <span>开发中</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ChatDotRound, ChatLineRound, Edit, Service, Picture, HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 判断当前AI功能是否激活
const isActive = (feature) => {
  return route.path === `/ai/${feature}`
}

// 跳转到指定AI功能
const navigateTo = (feature) => {
  try {
    router.push(`/ai/${feature}`)
  } catch (error) {
    console.error('路由跳转失败:', error)
  }
}

// 返回首页
const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.ai-page {
  min-height: 100vh;
  background: #ffffff;
  background-image: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
}

/* AI导航栏 */
.ai-nav {
  background: #ffffff;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
}

.ai-nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.ai-nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  gap: 24px;
}

/* Logo和标题 */
.ai-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border: 2px solid transparent;
}

.ai-logo:hover {
  background-color: #f0f0f0;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
  border: 2px solid #000000;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #000000;
  color: #ffffff;
  border-radius: 0;
}

.logo-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
}

/* AI功能导航菜单 */
.ai-nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.ai-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #000000;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 10px 20px;
  border: 2px solid #000000;
  border-radius: 0;
  cursor: pointer;
  white-space: nowrap;
  background: #ffffff;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.ai-nav-item .el-icon {
  font-size: 18px;
}

.ai-nav-item:hover {
  background-color: #000000;
  color: #ffffff;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}

.ai-nav-item.active {
  background-color: #000000;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 4px 4px 0px #000000;
  transform: translate(-2px, -2px);
}

/* 返回首页按钮 */
.back-home {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #000000;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 10px 20px;
  border: 2px solid #000000;
  border-radius: 0;
  cursor: pointer;
  white-space: nowrap;
  background: #ffffff;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.back-home:hover {
  background-color: #000000;
  color: #ffffff;
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}

/* 主内容区 */
.main-content {
  padding: 108px 24px 24px 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 欢迎区 */
.welcome-section {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-content {
  background: #ffffff;
  padding: 40px;
  border: 4px solid #000000;
  box-shadow: 8px 8px 0px #000000;
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 16px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
}

.welcome-subtitle {
  font-size: 18px;
  color: #666666;
  margin: 0;
  font-weight: 400;
  font-family: 'Courier New', monospace;
}

/* 功能卡片网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.feature-card {
  background: #ffffff;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 4px solid #000000;
  box-shadow: 6px 6px 0px #000000;
  animation: slideUp 0.6s ease;
  animation-fill-mode: both;
}

.feature-card:nth-child(1) {
  animation-delay: 0.1s;
}

.feature-card:nth-child(2) {
  animation-delay: 0.2s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.3s;
}

.feature-card:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 10px 10px 0px #000000;
}

/* 功能图标 */
.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 4px solid #000000;
  background: #ffffff;
  color: #000000;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-card.chatbot-card .feature-icon {
  background: #000000;
  color: #ffffff;
}

.feature-card.practice-card .feature-icon {
  background: #000000;
  color: #ffffff;
}

.feature-card.service-card .feature-icon {
  background: #000000;
  color: #ffffff;
}

.feature-card.multimodal-card .feature-icon {
  background: #000000;
  color: #ffffff;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 12px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.feature-description {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
}

.feature-status {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  border-radius: 0;
  font-size: 12px;
  font-weight: 500;
  border: 2px solid #000000;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.feature-status.active {
  background-color: #000000;
  color: #ffffff;
}

.feature-status:not(.active) {
  background-color: #f0f0f0;
  color: #666666;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .ai-nav-menu {
    gap: 4px;
  }

  .ai-nav-item {
    padding: 8px 12px;
    font-size: 14px;
  }

  .ai-nav-item span:not(.el-icon) {
    display: none;
  }

  .back-home span {
    display: none;
  }

  .logo-title {
    font-size: 18px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .ai-nav-content {
    padding: 0 12px;
  }

  .ai-nav-menu {
    display: none;
  }

  .ai-nav-content {
    justify-content: space-between;
  }

  .logo-title {
    font-size: 16px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
  }

  .back-home {
    padding: 8px 12px;
  }

  .main-content {
    padding: 88px 12px 12px 12px;
  }

  .container {
    padding: 0 12px;
  }

  .welcome-content {
    padding: 24px 16px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-card {
    padding: 24px 16px;
  }

  .feature-icon {
    width: 60px;
    height: 60px;
  }

  .feature-icon .el-icon {
    font-size: 32px !important;
  }

  .feature-title {
    font-size: 18px;
  }

  .feature-description {
    font-size: 13px;
  }
}
</style>
