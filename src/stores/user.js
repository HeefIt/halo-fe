import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref(JSON.parse(localStorage.getItem('halo_user_info')) || null)
  const token = ref(localStorage.getItem('halo_token') || '')
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickName || userInfo.value?.userName || '')
  const userAvatar = computed(() => userInfo.value?.avatar || '')
  
  // 登录
  const login = async (loginForm) => {
    try {
      // 确保只传递后端需要的字段
      const loginData = {
        userName: loginForm.userName,
        password: loginForm.password
      }
      
      const response = await authApi.login(loginData)
      
      // 根据后端返回的 Result 结构处理响应
      if (response.success && response.code === 200) {
        // 保存token信息--token信息
        token.value = response.data.tokenValue
        localStorage.setItem('halo_token', token.value)
        
        // 获取用户详细信息
        const userInfoResponse = await authApi.getUserInfo(response.data.loginId)
        if (userInfoResponse.success && userInfoResponse.code === 200) {
          userInfo.value = userInfoResponse.data
          // 将用户信息存储到localStorage中--用户信息
          localStorage.setItem('halo_user_info', JSON.stringify(userInfo.value))
        }
        
        ElMessage.success('登录成功！')
        return true
      } else {
        // 根据错误信息提供更具体的提示
        if (response.message) {
          if (response.message.includes('用户名') || response.message.includes('user')) {
            ElMessage.error('用户名不存在')
          } else if (response.message.includes('密码') || response.message.includes('password')) {
            ElMessage.error('密码错误')
          } else {
            ElMessage.error(response.message)
          }
        } else {
          ElMessage.error('登录失败')
        }
        return false
      }
    } catch (error) {
      console.error('登录错误:', error)
      // 根据后端 Result 结构处理错误响应
      if (error.response && error.response.data) {
        const { message } = error.response.data
        if (message) {
          if (message.includes('用户名') || message.includes('user')) {
            ElMessage.error('用户名不存在')
          } else if (message.includes('密码') || message.includes('password')) {
            ElMessage.error('密码错误')
          } else {
            ElMessage.error(message)
          }
        } else {
          ElMessage.error('登录失败，请检查用户名和密码')
        }
      } else {
        ElMessage.error('登录失败，请检查网络连接')
      }
      return false
    }
  }
  
  // 注册
  const register = async (registerForm) => {
    try {
      const response = await authApi.register(registerForm)
      if (response.success && response.code === 200) {
        ElMessage.success('注册成功！请登录')
        return true
      } else {
        ElMessage.error(response.message || '注册失败')
        return false
      }
    } catch (error) {
      console.error('注册错误:', error)
      ElMessage.error(error.message || '注册失败，请检查网络连接')
      return false
    }
  }
  
  // 获取用户信息
  const getUserInfo = async (userId) => {
    if (!token.value) return false
    
    try {
      const response = await authApi.getUserInfo(userId)
      if (response.success && response.code === 200) {
        userInfo.value = response.data
        // 更新localStorage中的用户信息
        localStorage.setItem('halo_user_info', JSON.stringify(userInfo.value))
        return true
      } else {
        // token可能已过期
        logout()
        return false
      }
    } catch (error) {
      console.error('获取用户信息错误:', error)
      logout()
      return false
    }
  }
  
  // 更新用户信息
  const updateUserInfo = async (userData) => {
    try {
      const response = await authApi.updateUserInfo(userData.id, userData)
      if (response.success && response.code === 200) {
        // 更新store中的用户信息
        userInfo.value = { ...userInfo.value, ...response.data }
        // 更新localStorage中的用户信息
        localStorage.setItem('halo_user_info', JSON.stringify(userInfo.value))
        ElMessage.success('用户信息更新成功！')
        return true
      } else {
        ElMessage.error(response.message || '更新失败')
        return false
      }
    } catch (error) {
      console.error('更新用户信息错误:', error)
      ElMessage.error(error.message || '更新失败，请检查网络连接')
      return false
    }
  }
  
  // 退出登录
  const logout = async () => {
    try {
      if (token.value) {
        // 传递一个空对象作为请求体，以满足后端要求
        await authApi.logout({})
      }
    } catch (error) {
      console.error('退出登录错误:', error)
    } finally {
      // 清除本地状态
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('halo_token')
      localStorage.removeItem('halo_user_info')
      ElMessage.success('已退出登录')
    }
  }
  
  // 设置用户状态
  const setUserStatus = async (id, status) => {
    try {
      const response = await authApi.setUserStatus(id, status)
      if (response.success && response.code === 200) {
        ElMessage.success('用户状态更新成功！')
        return true
      } else {
        ElMessage.error(response.message || '状态更新失败')
        return false
      }
    } catch (error) {
      console.error('设置用户状态错误:', error)
      ElMessage.error(error.message || '状态更新失败，请检查网络连接')
      return false
    }
  }
  
  // 初始化用户信息（应用启动时调用）
  const initUser = async () => {
    // 即使store中没有token，也从localStorage中检查一次
    const storedToken = localStorage.getItem('halo_token')
    if (storedToken) {
      token.value = storedToken
      
      // 尝试获取用户信息以验证token有效性
      try {
        // 这里假设后端有一个获取当前用户信息的接口
        // 如果没有loginId，可以先调用一个获取当前用户信息的接口
        const response = await authApi.getUserInfo() // 不传参数，让后端自己解析token
        
        if (response.success && response.code === 200) {
          userInfo.value = response.data
          // 更新localStorage中的用户信息
          localStorage.setItem('halo_user_info', JSON.stringify(userInfo.value))
          return true
        } else {
          // token无效，清理状态
          logout()
          return false
        }
      } catch (error) {
        console.error('初始化用户信息错误:', error)
        // token无效，清理状态
        logout()
        return false
      }
    }
    return false
  }


  // 🔴 关键：没有在return中的内容，其它地方调用这个类时候无法访问不return的东西！
  return {
    // 状态
    userInfo,
    token,
    // 计算属性
    isLoggedIn,
    userName,
    userAvatar,
    // 方法
    login,
    register,
    getUserInfo,
    updateUserInfo,
    logout,
    setUserStatus,
    initUser
  }
})