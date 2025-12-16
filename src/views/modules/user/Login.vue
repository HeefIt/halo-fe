<!--
  Login 登录页面组件
  功能描述：整个应用的第一个登录页面
  主要功能：
    - 昵程生糈為：Java八股上会learning上展示
    - 用户登录：按用户名和密码登录父系统
    - 表单验证：提供简单的表单验证，提高用户体验
    - 头部声笑伏鹩：左側設有装饮区域，帮助用户了解应用功能
    - 注册轮会：通過"立即注册"鐡接轉未功及詳圗一一鯉店
  使用位置：路由 /login
-->
<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-banner">
        <div class="banner-content">
          <h1 class="banner-title">欢迎回来</h1>
          <p class="banner-subtitle">继续你的Java八股文学习之旅</p>
          <div class="banner-features">
            <div class="feature-item">
              <el-icon><Trophy /></el-icon>
              <span>海量八股文</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>智能分析</span>
            </div>
            <div class="feature-item">
              <el-icon><Medal /></el-icon>
              <span>成长记录</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-form-section">
        <div class="form-container">
          <div class="form-header">
            <h2>登录到 Halo</h2>
            <p>深入理解Java，掌握核心知识</p>
          </div>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            size="large"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="userName">
              <el-input
                v-model="loginForm.userName"
                placeholder="用户名"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="loading"
                size="large"
                style="width: 100%"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="form-footer">
            <p>
              还没有账号？
              <el-button type="primary" link @click="$router.push('/register')">
                立即注册
              </el-button>
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
import { User, Lock, Trophy, DataAnalysis, Medal, ArrowLeft } from '@element-plus/icons-vue'
import { testLogin, testGetUserInfo } from '@/utils/apiTest.js'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const loginForm = reactive({
  userName: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const loginFormRef = ref()
const loading = ref(false)

// 开发环境标识
const isDev = import.meta.env.DEV

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    //将表单的数据传递给userStore中进行校验
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

// 填充测试数据
const fillTestData = () => {
  loginForm.userName = 'admin'
  loginForm.password = '123456'
}

// 测试API
const testAPI = async () => {
  console.log('开始测试API...')
  await testLogin()
  await testGetUserInfo(1)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧装饰区域 */
.login-banner {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: white;
}

.banner-content {
  text-align: center;
}

.banner-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
}

.banner-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.banner-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.feature-item .el-icon {
  font-size: 20px;
}

/* 右侧表单区域 */
.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-header p {
  color: var(--text-regular);
  font-size: 16px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  color: var(--text-secondary);
}

.back-home {
  text-align: center;
  margin-top: 32px;
}

.back-home .el-link {
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.dev-tools {
  margin-top: 24px;
  padding-top: 16px;
  text-align: center;
}

.dev-tools .el-button {
  margin: 0 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    max-width: 400px;
  }
  
  .login-banner {
    padding: 40px 20px;
  }
  
  .banner-title {
    font-size: 28px;
  }
  
  .banner-features {
    flex-direction: row;
    justify-content: center;
    gap: 16px;
  }
  
  .feature-item {
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
  }
  
  .login-form-section {
    padding: 40px 20px;
  }
}
</style>