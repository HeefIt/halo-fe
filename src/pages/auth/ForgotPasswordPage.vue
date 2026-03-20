<template>
  <AuthShell
    eyebrow="RECOVER ACCOUNT"
    title="找回密码"
    subtitle="使用邮箱验证码重置你的账号密码。"
    :panel-width="520"
  >
    <form class="auth-form" @submit.prevent="handleResetPassword">
      <div class="field-row">
        <div class="field-group" :class="{ focused: focusedField === 'email', filled: form.email, error: errors.email }">
          <label class="field-label">邮箱</label>
          <div class="field-box">
            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16v16H4z" />
              <path d="m22 6-10 7L2 6" />
            </svg>
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="输入注册邮箱"
              @focus="focusedField = 'email'"
              @blur="focusedField = ''; validateField('email')"
            />
          </div>
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <button
          type="button"
          class="secondary-btn"
          :disabled="codeLoading || cooldown > 0"
          @click="handleSendCode"
        >
          {{ cooldown > 0 ? `${cooldown}s 后重试` : (codeLoading ? '发送中...' : '发送验证码') }}
        </button>
      </div>

      <div class="field-group" :class="{ focused: focusedField === 'verificationCode', filled: form.verificationCode, error: errors.verificationCode }">
        <label class="field-label">邮箱验证码</label>
        <div class="field-box">
          <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M7 9h10" />
            <path d="M7 13h6" />
          </svg>
          <input
            v-model="form.verificationCode"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="输入 6 位验证码"
            @focus="focusedField = 'verificationCode'"
            @blur="focusedField = ''; validateField('verificationCode')"
          />
        </div>
        <span class="helper-text">验证码 5 分钟内有效，发送间隔为 60 秒。</span>
        <span v-if="errors.verificationCode" class="error-message">{{ errors.verificationCode }}</span>
      </div>

      <div class="field-group" :class="{ focused: focusedField === 'newPassword', filled: form.newPassword, error: errors.newPassword }">
        <label class="field-label">新密码</label>
        <div class="field-box">
          <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            v-model="form.newPassword"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="输入新密码"
            @focus="focusedField = 'newPassword'"
            @blur="focusedField = ''; validateField('newPassword')"
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
        <div v-if="form.newPassword" class="password-strength">
          <div class="strength-bar">
            <div class="strength-fill" :style="{ width: passwordStrength.percent + '%' }" :class="passwordStrength.level"></div>
          </div>
          <span class="strength-label" :class="passwordStrength.level">{{ passwordStrength.text }}</span>
        </div>
        <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
      </div>

      <div class="field-group" :class="{ focused: focusedField === 'confirmPassword', filled: form.confirmPassword, error: errors.confirmPassword }">
        <label class="field-label">确认新密码</label>
        <div class="field-box">
          <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="再次输入新密码"
            @focus="focusedField = 'confirmPassword'"
            @blur="focusedField = ''; validateField('confirmPassword')"
          />
          <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
            <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        <span v-if="!loading">重置密码</span>
        <span v-else class="loading-spinner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
      </button>
    </form>

    <div class="panel-footer">
      <span>想起密码了？</span>
      <router-link to="/login" class="footer-link">返回登录</router-link>
    </div>
  </AuthShell>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '@/layouts/AuthLayout.vue'
import { useUserStore } from '@/stores/modules/user.js'

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

const focusedField = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const codeLoading = ref(false)
const cooldown = ref(0)

let timer = null

const passwordStrength = computed(() => {
  const password = form.newPassword
  if (!password) return { percent: 0, level: '', text: '' }

  let score = 0
  if (password.length >= 6) score += 20
  if (password.length >= 10) score += 15
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^a-zA-Z0-9]/.test(password)) score += 20

  if (score < 30) return { percent: score, level: 'super-weak', text: '超弱' }
  if (score < 55) return { percent: score, level: 'weak', text: '偏弱' }
  if (score < 80) return { percent: score, level: 'okay', text: '还行' }
  return { percent: score, level: 'awesome', text: '很强' }
})

const validateField = (field) => {
  switch (field) {
    case 'email':
      if (!form.email) {
        errors.email = '请输入邮箱'
      } else if (!EMAIL_PATTERN.test(form.email)) {
        errors.email = '邮箱格式不正确'
      } else {
        errors.email = ''
      }
      break
    case 'verificationCode':
      if (!form.verificationCode) {
        errors.verificationCode = '请输入邮箱验证码'
      } else if (!/^\d{6}$/.test(form.verificationCode)) {
        errors.verificationCode = '验证码需为 6 位数字'
      } else {
        errors.verificationCode = ''
      }
      break
    case 'newPassword':
      if (!form.newPassword) {
        errors.newPassword = '请输入新密码'
      } else if (form.newPassword.length < 6 || form.newPassword.length > 20) {
        errors.newPassword = '密码长度需要在 6 到 20 个字符之间'
      } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(form.newPassword)) {
        errors.newPassword = '密码至少需要包含字母和数字'
      } else {
        errors.newPassword = ''
      }
      if (form.confirmPassword) {
        validateField('confirmPassword')
      }
      break
    case 'confirmPassword':
      if (!form.confirmPassword) {
        errors.confirmPassword = '请再次确认密码'
      } else if (form.confirmPassword !== form.newPassword) {
        errors.confirmPassword = '两次输入的密码不一致'
      } else {
        errors.confirmPassword = ''
      }
      break
  }
}

const validateForm = () => {
  validateField('email')
  validateField('verificationCode')
  validateField('newPassword')
  validateField('confirmPassword')
  return Object.values(errors).every(value => !value)
}

const handleSendCode = async () => {
  validateField('email')
  if (errors.email || codeLoading.value || cooldown.value > 0) return

  codeLoading.value = true
  try {
    const success = await userStore.sendResetPasswordCode(form.email.trim())
    if (success) {
      startCooldown()
    }
  } finally {
    codeLoading.value = false
  }
}

const handleResetPassword = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const success = await userStore.resetPassword({
      email: form.email.trim(),
      verificationCode: form.verificationCode.trim(),
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword
    })

    if (success) {
      router.push('/login')
    }
  } catch (error) {
    console.error('重置密码失败:', error)
  } finally {
    loading.value = false
  }
}

const startCooldown = () => {
  cooldown.value = 60
  clearTimer()
  timer = window.setInterval(() => {
    if (cooldown.value <= 1) {
      clearTimer()
      cooldown.value = 0
      return
    }
    cooldown.value -= 1
  }, 1000)
}

const clearTimer = () => {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>
