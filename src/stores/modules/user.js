import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/modules/auth'
import { usePracticeStore } from '@/stores/modules/practice'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('halo_user_info')) || null)
  const token = ref(localStorage.getItem('halo_token') || '')

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickName || userInfo.value?.userName || '')
  const userAvatar = computed(() => userInfo.value?.avatar || '')
  const isAdmin = computed(() => userInfo.value?.roleKeys?.includes('admin_user') || false)

  const login = async (loginForm) => {
    const practiceStore = usePracticeStore()
    try {
      const loginAccount = loginForm.loginAccount?.trim() || loginForm.userName?.trim() || ''
      const response = await authApi.login({
        loginAccount,
        userName: loginAccount,
        password: loginForm.password
      })

      if (response.success && response.code === 200) {
        practiceStore.clearProblemList()
        token.value = response.data.tokenValue
        localStorage.setItem('halo_token', token.value)

        const userInfoResponse = await authApi.getUserInfo(response.data.loginId)
        if (userInfoResponse.success && userInfoResponse.code === 200) {
          userInfo.value = userInfoResponse.data
          localStorage.setItem('halo_user_info', JSON.stringify(userInfo.value))
        }

        ElMessage.success('登录成功')
        return true
      }

      ElMessage.error(normalizeAuthMessage(response.message, '登录失败'))
      return false
    } catch (error) {
      console.error('登录错误:', error)
      const message = error.response?.data?.message || error.message
      ElMessage.error(normalizeAuthMessage(message, '登录失败，请检查账号和密码'))
      return false
    }
  }

  const register = async (registerForm) => {
    try {
      const response = await authApi.register(registerForm)
      if (response.success && response.code === 200) {
        ElMessage.success(response.message || '注册成功，请登录')
        return true
      }
      ElMessage.error(response.message || '注册失败')
      return false
    } catch (error) {
      console.error('注册错误:', error)
      const message = error.response?.data?.message || error.message
      ElMessage.error(message || '注册失败，请检查网络连接')
      return false
    }
  }

  const sendRegisterCode = async (email) => {
    try {
      const response = await authApi.sendRegisterCode({ email })
      if (response.success && response.code === 200) {
        ElMessage.success(response.message || '验证码已发送，请查收邮箱')
        return true
      }
      ElMessage.error(response.message || '验证码发送失败')
      return false
    } catch (error) {
      console.error('发送注册验证码失败:', error)
      const message = error.response?.data?.message || error.message
      ElMessage.error(message || '验证码发送失败')
      return false
    }
  }

  const sendResetPasswordCode = async (email) => {
    try {
      const response = await authApi.sendResetCode({ email })
      if (response.success && response.code === 200) {
        ElMessage.success(response.message || '验证码已发送，请查收邮箱')
        return true
      }
      ElMessage.error(response.message || '验证码发送失败')
      return false
    } catch (error) {
      console.error('发送重置密码验证码失败:', error)
      const message = error.response?.data?.message || error.message
      ElMessage.error(message || '验证码发送失败')
      return false
    }
  }

  const resetPassword = async (payload) => {
    try {
      const response = await authApi.resetPassword(payload)
      if (response.success && response.code === 200) {
        ElMessage.success(response.message || '密码重置成功')
        return true
      }
      ElMessage.error(response.message || '密码重置失败')
      return false
    } catch (error) {
      console.error('重置密码失败:', error)
      const message = error.response?.data?.message || error.message
      ElMessage.error(message || '密码重置失败')
      return false
    }
  }

  const getUserInfo = async (userId) => {
    if (!token.value) return false

    try {
      const response = await authApi.getUserInfo(userId)
      if (response.success && response.code === 200) {
        userInfo.value = response.data
        localStorage.setItem('halo_user_info', JSON.stringify(userInfo.value))
        return true
      }
      await logout(false)
      return false
    } catch (error) {
      console.error('获取用户信息错误:', error)
      await logout(false)
      return false
    }
  }

  const updateUserInfo = async (userData) => {
    try {
      const response = await authApi.updateUserInfo(userData.id, userData)
      if (response.success && response.code === 200) {
        userInfo.value = { ...userInfo.value, ...userData }
        localStorage.setItem('halo_user_info', JSON.stringify(userInfo.value))
        ElMessage.success('用户信息更新成功')
        return true
      }
      ElMessage.error(response.message || '更新失败')
      return false
    } catch (error) {
      console.error('更新用户信息错误:', error)
      ElMessage.error(error.message || '更新失败，请检查网络连接')
      return false
    }
  }

  const logout = async (showMessage = true) => {
    const practiceStore = usePracticeStore()
    try {
      if (token.value) {
        await authApi.logout({})
      }
    } catch (error) {
      console.error('退出登录错误:', error)
    } finally {
      token.value = ''
      userInfo.value = null
      practiceStore.clearProblemList()
      localStorage.removeItem('halo_token')
      localStorage.removeItem('halo_user_info')
      if (showMessage) {
        ElMessage.success('已退出登录')
      }
    }
  }

  const setUserStatus = async (id, status) => {
    try {
      const response = await authApi.setUserStatus(id, status)
      if (response.success && response.code === 200) {
        ElMessage.success('用户状态更新成功')
        return true
      }
      ElMessage.error(response.message || '状态更新失败')
      return false
    } catch (error) {
      console.error('设置用户状态错误:', error)
      ElMessage.error(error.message || '状态更新失败，请检查网络连接')
      return false
    }
  }

  const initUser = async () => {
    const storedToken = localStorage.getItem('halo_token')
    if (!storedToken) return false

    token.value = storedToken
    try {
      const response = await authApi.getUserInfo()
      if (response.success && response.code === 200) {
        userInfo.value = response.data
        localStorage.setItem('halo_user_info', JSON.stringify(userInfo.value))
        return true
      }
      await logout(false)
      return false
    } catch (error) {
      console.error('初始化用户信息失败:', error)
      await logout(false)
      return false
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isAdmin,
    userName,
    userAvatar,
    login,
    register,
    sendRegisterCode,
    sendResetPasswordCode,
    resetPassword,
    getUserInfo,
    updateUserInfo,
    logout,
    setUserStatus,
    initUser
  }
})

function normalizeAuthMessage(message, fallback) {
  if (!message) return fallback
  if (message.includes('用户不存在') || message.toLowerCase().includes('user')) {
    return '用户名或邮箱不存在'
  }
  if (message.includes('密码')) {
    return message.includes('错误') ? '密码错误' : message
  }
  return message
}
