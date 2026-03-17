<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="bg-gradient"></div>
      <div class="bg-noise"></div>
      <div class="bg-glow glow-left"></div>
      <div class="bg-glow glow-right"></div>
      <div class="bg-grid"></div>
    </div>

    <header class="auth-topbar">
      <router-link to="/" class="brand-link">
        <img class="brand-mark" :src="brandMark" alt="halo coding do" />
        <div class="brand-copy">
          <span class="brand-name">halo coding do</span>
          <span class="brand-caption">a tasteful place for curious developers</span>
        </div>
      </router-link>
    </header>

    <main class="auth-main">
      <section class="auth-panel">
        <span class="panel-kicker">CREATE ACCOUNT</span>
        <h1 class="panel-title">注册</h1>
        <p class="panel-subtitle">创建你的 halo coding do 账号。</p>

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="field-group" :class="{ focused: focusedField === 'userName', filled: registerForm.userName, error: errors.userName }">
            <label class="field-label">用户名</label>
            <div class="field-box">
              <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                v-model="registerForm.userName"
                type="text"
                autocomplete="username"
                placeholder="设置用户名"
                @focus="focusedField = 'userName'"
                @blur="focusedField = ''; validateField('userName')"
              />
            </div>
            <span v-if="errors.userName" class="error-message">{{ errors.userName }}</span>
          </div>

          <div class="field-group" :class="{ focused: focusedField === 'password', filled: registerForm.password, error: errors.password }">
            <label class="field-label">密码</label>
            <div class="field-box">
              <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="设置密码"
                @focus="focusedField = 'password'"
                @blur="focusedField = ''; validateField('password')"
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

          <div class="field-group" :class="{ focused: focusedField === 'confirmPassword', filled: registerForm.confirmPassword, error: errors.confirmPassword }">
            <label class="field-label">确认密码</label>
            <div class="field-box">
              <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                v-model="registerForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="再次输入密码"
                @focus="focusedField = 'confirmPassword'"
                @blur="focusedField = ''; validateField('confirmPassword')"
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

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading">注册</span>
            <span v-else class="loading-spinner">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </span>
          </button>
        </form>

        <div class="panel-footer">
          <span>已经有账号了？</span>
          <router-link to="/login" class="footer-link">去登录</router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import brandMark from '@/assets/brand/hcd-mark.svg'

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
  if (password.length >= 6) score += 20
  if (password.length >= 10) score += 15
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^a-zA-Z0-9]/.test(password)) score += 20

  if (score < 30) return { percent: score, level: 'super-weak', text: '超级弱鸡' }
  if (score < 55) return { percent: score, level: 'weak', text: '弱鸡' }
  if (score < 80) return { percent: score, level: 'okay', text: '还行' }
  return { percent: score, level: 'awesome', text: '夯爆了' }
})

const validateField = (field) => {
  switch (field) {
    case 'userName':
      if (!registerForm.userName) {
        errors.userName = '请输入用户名'
      } else if (registerForm.userName.length < 3 || registerForm.userName.length > 20) {
        errors.userName = '用户名长度需要在 3 到 20 个字符之间'
      } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.userName)) {
        errors.userName = '用户名只支持字母、数字和下划线'
      } else {
        errors.userName = ''
      }
      break
    case 'password':
      if (!registerForm.password) {
        errors.password = '请输入密码'
      } else if (registerForm.password.length < 6 || registerForm.password.length > 20) {
        errors.password = '密码长度需要在 6 到 20 个字符之间'
      } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(registerForm.password)) {
        errors.password = '密码至少需要包含字母和数字'
      } else {
        errors.password = ''
      }
      if (registerForm.confirmPassword) {
        validateField('confirmPassword')
      }
      break
    case 'confirmPassword':
      if (!registerForm.confirmPassword) {
        errors.confirmPassword = '请再确认一次密码'
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
.auth-page {
  --brand: #082b72;
  --accent: #1ea97c;
  --danger: #d55a4b;
  --bg-main: #f8f3ea;
  --bg-panel: rgba(255, 251, 245, 0.84);
  --line-soft: rgba(8, 43, 114, 0.12);
  --line-strong: rgba(8, 43, 114, 0.22);
  --text-main: #10284e;
  --text-soft: rgba(16, 40, 78, 0.68);
  --text-faint: rgba(16, 40, 78, 0.46);
  min-height: 100vh;
  min-height: 100svh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 15%, rgba(30, 169, 124, 0.14), transparent 25%),
    radial-gradient(circle at 88% 12%, rgba(8, 43, 114, 0.12), transparent 24%),
    linear-gradient(180deg, #fbf6ee 0%, #f0e8d9 100%);
}

.auth-bg,
.bg-gradient,
.bg-noise,
.bg-glow,
.bg-grid {
  position: absolute;
  inset: 0;
}

.auth-bg {
  pointer-events: none;
}

.bg-gradient {
  background:
    radial-gradient(circle at 18% 24%, rgba(30, 169, 124, 0.12), transparent 24%),
    radial-gradient(circle at 82% 18%, rgba(8, 43, 114, 0.1), transparent 22%);
}

.bg-noise {
  opacity: 0.15;
  background-image:
    linear-gradient(rgba(8, 43, 114, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(8, 43, 114, 0.04) 1px, transparent 1px);
  background-size: 6px 6px;
}

.bg-glow {
  filter: blur(110px);
  opacity: 0.45;
}

.glow-left {
  top: -140px;
  left: -120px;
  width: 320px;
  height: 320px;
  background: rgba(30, 169, 124, 0.18);
}

.glow-right {
  right: -100px;
  bottom: -120px;
  width: 320px;
  height: 320px;
  background: rgba(8, 43, 114, 0.14);
}

.bg-grid {
  background-image:
    linear-gradient(rgba(8, 43, 114, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(8, 43, 114, 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 100%);
}

.auth-topbar {
  position: relative;
  z-index: 1;
  padding: 20px 24px 0;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-decoration: none;
}

.brand-mark {
  width: 42px;
  height: 38px;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  color: var(--brand);
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.brand-caption {
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1;
}

.auth-main {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 16px 16px;
  box-sizing: border-box;
}

.auth-panel {
  width: min(100%, 460px);
  padding: 34px 28px 24px;
  border: 1px solid var(--line-soft);
  border-radius: 30px;
  background: var(--bg-panel);
  backdrop-filter: blur(22px);
  box-shadow:
    0 28px 70px rgba(56, 43, 20, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.panel-kicker {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.panel-title {
  margin: 0 0 8px;
  color: var(--text-main);
  font-size: 42px;
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.panel-subtitle {
  margin: 0 0 22px;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.8;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  color: var(--text-soft);
  font-size: 13px;
  font-weight: 600;
}

.field-group.focused .field-label {
  color: var(--brand);
}

.field-group.error .field-label {
  color: var(--danger);
}

.field-box {
  position: relative;
}

.field-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: rgba(8, 43, 114, 0.38);
  pointer-events: none;
  transition: color 0.2s ease;
}

.field-group.focused .field-icon,
.field-group.filled .field-icon {
  color: var(--brand);
}

.field-group.error .field-icon {
  color: var(--danger);
}

.field-box input {
  width: 100%;
  height: 56px;
  padding: 0 52px 0 46px;
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-main);
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

.field-box input::placeholder {
  color: rgba(16, 40, 78, 0.36);
}

.field-box input:focus {
  border-color: rgba(8, 43, 114, 0.28);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 0 4px rgba(8, 43, 114, 0.08);
}

.field-group.error .field-box input {
  border-color: rgba(213, 90, 75, 0.28);
  box-shadow: 0 0 0 4px rgba(213, 90, 75, 0.08);
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 10px;
  width: 36px;
  height: 36px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(8, 43, 114, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  color: rgba(8, 43, 114, 0.56);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-password:hover {
  color: var(--brand);
  border-color: rgba(8, 43, 114, 0.18);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(8, 43, 114, 0.1);
}

.strength-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
}

.strength-fill.super-weak {
  background: linear-gradient(90deg, #d55a4b, #ef8a6b);
}

.strength-fill.weak {
  background: linear-gradient(90deg, #ef8a34, #f5b24f);
}

.strength-fill.okay {
  background: linear-gradient(90deg, #d6a342, #e7c467);
}

.strength-fill.awesome {
  background: linear-gradient(90deg, #1ea97c, #3cc69d);
}

.strength-label {
  min-width: 64px;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
}

.strength-label.super-weak {
  color: #d55a4b;
}

.strength-label.weak {
  color: #dd8d32;
}

.strength-label.okay {
  color: #b6871c;
}

.strength-label.awesome {
  color: #1ea97c;
}

.error-message {
  color: var(--danger);
  font-size: 12px;
  line-height: 1.5;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 58px;
  margin-top: 4px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #082b72 0%, #1ea97c 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  box-shadow: 0 18px 36px rgba(8, 43, 114, 0.18);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(8, 43, 114, 0.22);
}

.submit-btn:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.panel-footer {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  color: var(--text-soft);
  font-size: 14px;
}

.footer-link {
  color: var(--brand);
  font-weight: 700;
  text-decoration: none;
}

.footer-link:hover {
  color: var(--accent);
}

@media (max-width: 640px) {
  .auth-topbar {
    padding: 16px 14px 0;
  }

  .auth-main {
    padding: 64px 12px 12px;
  }

  .auth-panel {
    padding: 26px 18px 20px;
    border-radius: 24px;
  }

  .panel-title {
    font-size: 32px;
  }

  .brand-caption {
    display: none;
  }
}
</style>
