<template>
  <div class="register-page">
    <div class="register-bg">
      <div class="bg-gradient"></div>
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="bg-grid"></div>
    </div>

    <div class="register-container">
      <div class="register-banner">
        <div class="banner-content">
          <div class="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <h1 class="banner-title">加入 Halo</h1>
          <p class="banner-subtitle">开启你的 Java 八股文学习之旅</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">200+</div>
              <div class="stat-label">精选八股文</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">5000+</div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">90%</div>
              <div class="stat-label">面试通过率</div>
            </div>
          </div>

          <div class="benefits-list">
            <div class="benefit-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>免费使用全部题库</span>
            </div>
            <div class="benefit-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>AI 智能解析辅助学习</span>
            </div>
            <div class="benefit-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>个性化学习计划推荐</span>
            </div>
          </div>
        </div>
      </div>

      <div class="register-form-section">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>创建账号</h2>
            <p>免费注册，立即开始学习</p>
          </div>

          <form class="register-form" @submit.prevent="handleRegister">
            <div class="input-group" :class="{ focused: focusedField === 'userName', filled: registerForm.userName, error: errors.userName }">
              <label class="input-label">用户名</label>
              <div class="input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input 
                  v-model="registerForm.userName"
                  type="text"
                  @focus="focusedField = 'userName'"
                  @blur="focusedField = ''; validateField('userName')"
                  placeholder="请输入用户名"
                  autocomplete="username"
                />
              </div>
              <span v-if="errors.userName" class="error-message">{{ errors.userName }}</span>
            </div>

            <div class="input-group" :class="{ focused: focusedField === 'password', filled: registerForm.password, error: errors.password }">
              <label class="input-label">密码</label>
              <div class="input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input 
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  @focus="focusedField = 'password'"
                  @blur="focusedField = ''; validateField('password')"
                  placeholder="请输入密码"
                  autocomplete="new-password"
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
              <div v-if="registerForm.password" class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" :style="{ width: passwordStrength.percent + '%' }" :class="passwordStrength.level"></div>
                </div>
                <span class="strength-label" :class="passwordStrength.level">{{ passwordStrength.text }}</span>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>

            <div class="input-group" :class="{ focused: focusedField === 'confirmPassword', filled: registerForm.confirmPassword, error: errors.confirmPassword }">
              <label class="input-label">确认密码</label>
              <div class="input-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input 
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  @focus="focusedField = 'confirmPassword'"
                  @blur="focusedField = ''; validateField('confirmPassword')"
                  placeholder="请再次输入密码"
                  autocomplete="new-password"
                />
                <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                  <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading" :class="{ loading }">
              <span v-if="!loading">注册</span>
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
              已有账号？
              <router-link to="/login" class="link">立即登录</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'

const router = useRouter()
const userStore = useUserStore()

const registerForm = reactive({
  userName: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  userName: '',
  password: '',
  confirmPassword: ''
})

const focusedField = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return { percent: 0, level: '', text: '' }
  
  let score = 0
  if (password.length >= 6) score += 25
  if (password.length >= 10) score += 15
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^a-zA-Z0-9]/.test(password)) score += 15
  
  if (score < 40) return { percent: score, level: 'weak', text: '弱' }
  if (score < 70) return { percent: score, level: 'medium', text: '中等' }
  return { percent: score, level: 'strong', text: '强' }
})

const validateField = (field) => {
  switch (field) {
    case 'userName':
      if (!registerForm.userName) {
        errors.userName = '请输入用户名'
      } else if (registerForm.userName.length < 3 || registerForm.userName.length > 20) {
        errors.userName = '用户名长度在 3 到 20 个字符'
      } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.userName)) {
        errors.userName = '用户名只能包含字母、数字和下划线'
      } else {
        errors.userName = ''
      }
      break
    case 'password':
      if (!registerForm.password) {
        errors.password = '请输入密码'
      } else if (registerForm.password.length < 6 || registerForm.password.length > 20) {
        errors.password = '密码长度在 6 到 20 个字符'
      } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(registerForm.password)) {
        errors.password = '密码必须包含字母和数字'
      } else {
        errors.password = ''
      }
      if (registerForm.confirmPassword) {
        validateField('confirmPassword')
      }
      break
    case 'confirmPassword':
      if (!registerForm.confirmPassword) {
        errors.confirmPassword = '请确认密码'
      } else if (registerForm.confirmPassword !== registerForm.password) {
        errors.confirmPassword = '两次输入的密码不一致'
      } else {
        errors.confirmPassword = ''
      }
      break
  }
}

const validateForm = () => {
  validateField('userName')
  validateField('password')
  validateField('confirmPassword')
  return !errors.userName && !errors.password && !errors.confirmPassword
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    const success = await userStore.register({
      userName: registerForm.userName,
      password: registerForm.password
    })
    
    if (success) {
      router.push('/login')
    }
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.register-bg {
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
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  top: -150px;
  right: -150px;
  animation: float 18s ease-in-out infinite;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
  bottom: -100px;
  left: -100px;
  animation: float 15s ease-in-out infinite reverse;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #22c55e 0%, #06b6d4 100%);
  top: 40%;
  left: 30%;
  animation: pulse 12s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -30px) rotate(5deg); }
  50% { transform: translate(-20px, 20px) rotate(-5deg); }
  75% { transform: translate(20px, 10px) rotate(3deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.5; }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

.register-container {
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

.register-banner {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.register-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%);
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
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
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
  margin: 0 0 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-4px);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.benefit-item svg {
  color: #22c55e;
  flex-shrink: 0;
}

.register-form-section {
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
  margin-bottom: 36px;
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.input-group.error .input-label {
  color: #ef4444;
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

.input-group.error .input-wrapper svg {
  color: #ef4444;
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

.input-group.error .input-wrapper input {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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

.error-message {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.strength-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.strength-fill.strong {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.strength-label {
  font-size: 12px;
  font-weight: 500;
}

.strength-label.weak {
  color: #ef4444;
}

.strength-label.medium {
  color: #f59e0b;
}

.strength-label.strong {
  color: #22c55e;
}

.submit-btn {
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 8px;
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
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
  margin: 28px 0;
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
  margin-top: 28px;
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
  .register-container {
    flex-direction: column;
    max-width: 480px;
    min-height: auto;
  }
  
  .register-banner {
    padding: 40px;
  }
  
  .banner-title {
    font-size: 28px;
  }
  
  .stats-grid {
    display: none;
  }
  
  .benefits-list {
    display: none;
  }
  
  .register-form-section {
    padding: 40px;
  }
}

@media (max-width: 480px) {
  .register-container {
    margin: 10px;
    border-radius: 16px;
  }
  
  .register-banner {
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
  
  .register-form-section {
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
