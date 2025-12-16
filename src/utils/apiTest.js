// API测试工具
import { authApi } from '@/api/auth'

// 测试登录接口
export const testLogin = async () => {
  try {
    console.log('测试登录接口...')
    const response = await authApi.login({
      userName: 'admin',
      password: '123456'
    })
    console.log('登录响应:', response)
    return response
  } catch (error) {
    console.error('登录测试失败:', error)
    return null
  }
}

// 测试注册接口
export const testRegister = async () => {
  try {
    console.log('测试注册接口...')
    const response = await authApi.register({
      userName: 'testuser123',
      email: 'test123@example.com',
      password: '123456'
    })
    console.log('注册响应:', response)
    return response
  } catch (error) {
    console.error('注册测试失败:', error)
    return null
  }
}

// 测试获取用户信息接口
export const testGetUserInfo = async (userId = 1) => {
  try {
    console.log('测试获取用户信息接口...')
    const response = await authApi.getUserInfo(userId)
    console.log('用户信息响应:', response)
    return response
  } catch (error) {
    console.error('获取用户信息测试失败:', error)
    return null
  }
}

// 测试退出登录接口
export const testLogout = async () => {
  try {
    console.log('测试退出登录接口...')
    const response = await authApi.logout()
    console.log('退出登录响应:', response)
    return response
  } catch (error) {
    console.error('退出登录测试失败:', error)
    return null
  }
}

// 运行所有测试
export const runAllTests = async () => {
  console.log('=== 开始API测试 ===')
  
  // 测试注册
  await testRegister()
  
  // 测试登录
  const loginResult = await testLogin()
  
  if (loginResult && loginResult.success) {
    // 测试获取用户信息
    await testGetUserInfo(loginResult.data.loginId)
    
    // 测试退出登录
    await testLogout()
  }
  
  console.log('=== API测试完成 ===')
}
