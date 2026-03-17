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
        <span class="panel-kicker">SIGN IN</span>
        <h1 class="panel-title">登录</h1>
        <p class="panel-subtitle">进入你的 halo coding do 工作台。</p>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="field-group" :class="{ focused: focusedField === 'userName', filled: loginForm.userName }">
            <label class="field-label">用户名</label>
            <div class="field-box">
              <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                v-model="loginForm.userName"
                type="text"
                autocomplete="username"
                placeholder="输入用户名"
                @focus="focusedField = 'userName'"
                @blur="focusedField = ''"
              />
            </div>
          </div>

          <div class="field-group" :class="{ focused: focusedField === 'password', filled: loginForm.password }">
            <label class="field-label">密码</label>
            <div class="field-box">
              <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="输入密码"
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
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

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading">登录</span>
            <span v-else class="loading-spinner">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </span>
          </button>
        </form>

        <div class="panel-footer">
          <span>还没有账号？</span>
          <router-link to="/register" class="footer-link">去注册</router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import brandMark from '@/assets/brand/hcd-mark.svg'

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
.auth-page {
  --brand: #082b72;
  --accent: #1ea97c;
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
  width: min(100%, 440px);
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
