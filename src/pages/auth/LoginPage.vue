<template>
  <AuthShell
    eyebrow="SIGN IN"
    title="登录"
    subtitle="继续你的练习、创作与沉浸体验。"
  >
    <form class="auth-form" @submit.prevent="handleLogin">
      <div class="field-group" :class="{ focused: focusedField === 'loginAccount', filled: loginForm.loginAccount }">
        <label class="field-label">用户名 / 邮箱</label>
        <div class="field-box">
          <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            v-model="loginForm.loginAccount"
            type="text"
            autocomplete="username"
            placeholder="输入用户名或邮箱"
            @focus="focusedField = 'loginAccount'"
            @blur="focusedField = ''"
          />
        </div>
      </div>

      <div class="field-group" :class="{ focused: focusedField === 'password', filled: loginForm.password }">
        <label class="field-label">密码</label>
        <div class="field-box">
          <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      <div class="action-row">
        <span class="helper-text">邮箱注册后，可直接用邮箱登录。</span>
        <router-link to="/forgot-password" class="text-link-btn">忘记密码？</router-link>
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        <span v-if="!loading">登录</span>
        <span v-else class="loading-spinner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
      </button>
    </form>

    <div class="panel-footer">
      <span>还没有账号？</span>
      <router-link to="/register" class="footer-link">去注册</router-link>
    </div>
  </AuthShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '@/layouts/AuthLayout.vue'
import { useUserStore } from '@/stores/modules/user.js'

const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  loginAccount: '',
  password: ''
})

const focusedField = ref('')
const showPassword = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  if (!loginForm.loginAccount || !loginForm.password) return

  loading.value = true
  try {
    const success = await userStore.login({
      loginAccount: loginForm.loginAccount,
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
