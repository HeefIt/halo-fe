<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-gradient"></div>
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="bg-grid"></div>
    </div>

    <div class="login-container">
      <div class="login-banner">
        <div class="banner-content">
          <div class="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <h1 class="banner-title">欢迎回来</h1>
          <p class="banner-subtitle">继续你的 Java 八股文学习之旅</p>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div class="feature-text">
                <span class="feature-title">海量题库</span>
                <span class="feature-desc">精选 Java 面试真题</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div class="feature-text">
                <span class="feature-title">智能解析</span>
                <span class="feature-desc">AI 辅助深度理解</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10"/>
                  <line x1="18" y1="20" x2="18" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="16"/>
                </svg>
              </div>
              <div class="feature-text">
                <span class="feature-title">学习追踪</span>
                <span class="feature-desc">可视化成长记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="login-form-section">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>登录 Halo</h2>
            <p>深入理解 Java，掌握核心知识</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <div class="input-group" :class="{ focused: focusedField === 'userName', filled: loginForm.userName }">
              <label class="input-label">用户名</label>
              <div class="input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input 
                  v-model="loginForm.userName"
                  type="text"
                  @focus="focusedField = 'userName'"
                  @blur="focusedField = ''"
                  placeholder="请输入用户名"
                  autocomplete="username"
                />
              </div>
            </div>

            <div class="input-group" :class="{ focused: focusedField === 'password', filled: loginForm.password }">
              <label class="input-label">密码</label>
              <div class="input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input 
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  @focus="focusedField = 'password'"
                  @blur="focusedField = ''"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading" :class="{ loading }">
              <span v-if="!loading">登录</span>
              <span v-else class="loading-spinner">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </span>
            </button>
          </form>

          <div class="form-divider">
            <span>或者</span>
          </div>

          <div class="social-login">
            <button class="social-btn github">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
            <button class="social-btn wechat">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
              </svg>
              <span>微信</span>
            </button>
          </div>

          <div class="form-footer">
            <p>
              还没有账号？
              <router-link to="/register" class="link">立即注册</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'

const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  userName: '',
  password: ''
})

const focusedField = ref('')
const showPassword = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  if (!loginForm.userName || !loginForm.password) return
  
  loading.value = true
  try {
    const success = await userStore.login({
      userName: loginForm.userName,
      password: loginForm.password
    })
    
    if (success) {
      router.push('/home')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 30%, #16213e 60%, #0f0f1a 100%);
}

.bg-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  top: -200px;
  left: -200px;
  animation: float 20s ease-in-out infinite;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  bottom: -100px;
  right: -100px;
  animation: float 15s ease-in-out infinite reverse;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 10s ease-in-out infinite;
}

.shape-4 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #22c55e 0%, #06b6d4 100%);
  top: 20%;
  right: 20%;
  animation: float 12s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -30px) rotate(5deg); }
  50% { transform: translate(-20px, 20px) rotate(-5deg); }
  75% { transform: translate(20px, 10px) rotate(3deg); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1100px;
  min-height: 680px;
  margin: 20px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.login-banner {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.login-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
}

.banner-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.brand-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
}

.banner-title {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}

.banner-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 48px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.2);
  transform: translateX(8px);
}

.feature-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  color: #a78bfa;
  flex-shrink: 0;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.feature-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: rgba(0, 0, 0, 0.2);
}

.form-wrapper {
  width: 100%;
  max-width: 380px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.form-header p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  position: relative;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.input-group.focused .input-label {
  color: #a78bfa;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper svg {
  position: absolute;
  left: 16px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-group.focused .input-wrapper svg {
  color: #a78bfa;
}

.input-wrapper input {
  width: 100%;
  padding: 16px 48px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.input-wrapper input:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.toggle-password:hover {
  color: rgba(255, 255, 255, 0.7);
}

.submit-btn {
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn span {
  position: relative;
  z-index: 1;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.form-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
}

.form-divider::before,
.form-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.form-divider span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.social-login {
  display: flex;
  gap: 12px;
}

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.social-btn.github:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.social-btn.wechat:hover {
  border-color: rgba(7, 193, 96, 0.5);
  color: #07c160;
}

.form-footer {
  text-align: center;
  margin-top: 32px;
}

.form-footer p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.link {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.link:hover {
  color: #c4b5fd;
  text-decoration: underline;
}

@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    max-width: 480px;
    min-height: auto;
  }
  
  .login-banner {
    padding: 40px;
  }
  
  .banner-title {
    font-size: 28px;
  }
  
  .features-list {
    display: none;
  }
  
  .login-form-section {
    padding: 40px;
  }
}

@media (max-width: 480px) {
  .login-container {
    margin: 10px;
    border-radius: 16px;
  }
  
  .login-banner {
    padding: 32px 24px;
  }
  
  .brand-logo {
    width: 64px;
    height: 64px;
    margin-bottom: 24px;
  }
  
  .banner-title {
    font-size: 24px;
  }
  
  .login-form-section {
    padding: 32px 24px;
  }
  
  .form-header h2 {
    font-size: 24px;
  }
  
  .social-login {
    flex-direction: column;
  }
}
</style>
