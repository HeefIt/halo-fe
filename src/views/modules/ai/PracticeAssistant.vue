<!--
  刷题助手页面（开发中）
  功能描述：AI刷题助手，提供智能题目推荐和解析
  主要功能：
    - 智能推荐题目
    - 提供题目解析
    - 个性化学习建议
  使用位置：路由 /ai/practice-assistant
-->
<template>
  <div class="practice-assistant-page">
    <div class="ai-nav">
      <div class="ai-nav-container">
        <div class="ai-nav-content">
          <div class="ai-logo" @click="goHome">
            <div class="logo-icon">
              <el-icon :size="24"><ChatDotRound /></el-icon>
            </div>
            <span class="logo-title">AI 智能助手</span>
          </div>
          
          <nav class="ai-nav-menu">
            <span class="ai-nav-item" @click="navigateTo('chatbot')">
              <el-icon><ChatLineRound /></el-icon>
              <span>机器人对话</span>
            </span>
            <span class="ai-nav-item active">
              <el-icon><Edit /></el-icon>
              <span>刷题助手</span>
            </span>
            <span class="ai-nav-item" @click="navigateTo('customer-service')">
              <el-icon><Service /></el-icon>
              <span>智能客服</span>
            </span>
            <span class="ai-nav-item" @click="navigateTo('multimodal')">
              <el-icon><Picture /></el-icon>
              <span>多模态解析</span>
            </span>
          </nav>
          
          <div class="back-home" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            <span>返回首页</span>
          </div>
        </div>
      </div>
    </div>
    
    <main class="main-content">
      <div class="container">
        <div class="coming-soon">
          <div class="coming-soon-icon">
            <el-icon :size="80"><Edit /></el-icon>
          </div>
          <h2 class="coming-soon-title">刷题助手</h2>
          <p class="coming-soon-description">AI智能刷题助手正在开发中，敬请期待...</p>
          <button class="action-btn" @click="navigateTo('chatbot')">先去体验机器人对话</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ChatDotRound, ChatLineRound, Edit, Service, Picture, HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()

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
.practice-assistant-page {
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

.main-content {
  padding: 108px 24px 24px 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.coming-soon {
  background: #ffffff;
  padding: 80px 40px;
  border: 4px solid #000000;
  text-align: center;
  box-shadow: 8px 8px 0px #000000;
}

.coming-soon-icon {
  color: #000000;
  margin-bottom: 24px;
  opacity: 0.6;
}

.coming-soon-title {
  font-size: 36px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 16px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.coming-soon-description {
  font-size: 18px;
  color: #666666;
  margin-bottom: 32px;
  font-family: 'Courier New', monospace;
}

.action-btn {
  padding: 12px 32px;
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
  border-radius: 0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.action-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000000;
}
</style>
