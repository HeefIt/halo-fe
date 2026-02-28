<!--
  Register 注册页面组件
  功能描述：新用户注册页面
  主要功能：
    - 用户注册：按用户名、销稀、密码注册
    - 表单验证：釀丸的的表单验证规则（用户名格式、密码歷氙等）
    - 头部声笑伏麓：左側設有装饮区域，帮助用户匹配專覺成技算數
    - 密码确認：檢骗和確認密码是否相符，修复沃盿：
    - 登录紅悲：注册後出粗到登录頁面
  使用位置：路由 /register
-->
<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 左侧装饰区域 -->
      <div class="register-banner">
        <div class="banner-content">
          <h1 class="banner-title">加入 Halo</h1>
          <p class="banner-subtitle">开启你的Java八股文学习之旅</p>
          <div class="banner-stats">
            <div class="stat-item">
              <div class="stat-number">200+</div>
              <div class="stat-label">精选八股文</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">5000+</div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">90%</div>
              <div class="stat-label">面试通过率</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧注册表单 -->
      <div class="register-form-section">
        <div class="form-container">
          <div class="form-header">
            <h2>创建账号</h2>
            <p>免费注册，立即开始学习Java八股文</p>
          </div>
          
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            size="large"
            @submit.prevent="handleRegister"
          >
            <el-form-item prop="userName">
              <el-input
                v-model="registerForm.userName"
                placeholder="用户名"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
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
                注册
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="form-footer">
            <p>
              已有账号？
              <el-button type="primary" link @click="$router.push('/login')">
                立即登录
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
import { User, Lock, Message, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const registerForm = reactive({
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 自定义验证函数
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

const registerFormRef = ref()
const loading = ref(false)

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    const success = await userStore.register({
      userName: registerForm.userName,
      email: registerForm.email,
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
  background: #ffffff;
  background-image: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 4px 4px;
  background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: #ffffff;
  border: 4px solid #000000;
  border-radius: 0;
  box-shadow: 8px 8px 0px #000000;
  overflow: hidden;
}

/* 左侧装饰区域 */
.register-banner {
  flex: 1;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: #ffffff;
  border-right: 4px solid #000000;
}

.banner-content {
  text-align: center;
}

.banner-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.banner-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
  font-family: 'Courier New', monospace;
}

.banner-stats {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

/* 右侧表单区域 */
.register-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: #ffffff;
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
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.form-header p {
  color: #666666;
  font-size: 16px;
  font-family: 'Courier New', monospace;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
  color: #666666;
  font-family: 'Courier New', monospace;
}

.form-footer .el-button {
  font-family: 'Courier New', monospace !important;
  text-transform: uppercase !important;
  font-weight: 500 !important;
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

/* Element Plus 组件样式 */
.el-button[type='primary'] {
  background-color: #000000 !important;
  border: 2px solid #000000 !important;
  border-radius: 0 !important;
  font-family: 'Courier New', monospace !important;
  text-transform: uppercase !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  box-shadow: 4px 4px 0px #000000 !important;
}

.el-button[type='primary']:hover {
  transform: translate(-2px, -2px) !important;
  box-shadow: 6px 6px 0px #000000 !important;
}

.el-button[type='primary'].link {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: #000000 !important;
  text-decoration: underline !important;
}

.el-input {
  border: 2px solid #000000 !important;
  border-radius: 0 !important;
  box-shadow: 4px 4px 0px #000000 !important;
}

.el-input__wrapper {
  border: none !important;
  box-shadow: none !important;
  background: #ffffff !important;
}

.el-input__inner {
  font-family: 'Courier New', monospace !important;
  color: #000000 !important;
}

.el-input__prefix {
  color: #000000 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
    max-width: 400px;
  }
  
  .register-banner {
    padding: 40px 20px;
  }
  
  .banner-title {
    font-size: 28px;
  }
  
  .banner-stats {
    flex-direction: row;
    justify-content: center;
    gap: 16px;
  }
  
  .register-form-section {
    padding: 40px 20px;
  }
}
</style>
