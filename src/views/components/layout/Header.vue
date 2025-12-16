<!--
  Header 组件
  功能描述：项目顶部导航栏组件
  主要功能：
    - 显示应用Logo和应用名称
    - 提供主导航菜单（首页、题库、学习计划、排行榜、我的练习）
    - 显示用户头像和用户信息下拉菜单
    - 管理员用户显示"管理后台"按钮
    - 处理路由导航和用户退出登录
  使用位置：App.vue（全局页头）
-->
<template>
  <header class="header">
    <div class="container">
      <div class="nav-content">
        <!-- Logo -->
        <div class="logo" @click="goHome">
          <h1>Halo 刷题网</h1>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <span 
            class="nav-item" 
            :class="{ active: isActive('/home') }"
            @click="navigateTo('/home')"
          >
            首页
          </span>
          <span 
            class="nav-item" 
            :class="{ active: isActive('/home/questions') }"
            @click="navigateTo('/home/questions')"
          >
            题库
          </span>
          <span 
            class="nav-item" 
            :class="{ active: isActive('/study-plan') }"
            @click="navigateTo('/study-plan')"
          >
            学习计划
          </span>
          <span 
            class="nav-item" 
            :class="{ active: isActive('/ranking') }"
            @click="navigateTo('/ranking')"
          >
            排行榜
          </span>
          <span 
            class="nav-item" 
            :class="{ active: isActive('/practice-history') }"
            @click="navigateTo('/practice-history')"
          >
            我的练习
          </span>
          
          <!-- 管理后台按钮 (仅管理员可见) -->
          <el-button 
            v-if="isAdmin" 
            type="primary" 
            @click="navigateTo('/admin')"
            class="admin-button"
          >
            管理后台
          </el-button>
        </nav>
        
        <!-- 用户信息 -->
        <div class="user-section">
          <el-dropdown>
            <div class="user-info">
              <el-avatar 
                :src="userStore.userAvatar" 
                :size="32"
                class="user-avatar"
              >
                {{ userStore.userName?.charAt(0) || '用户' }}
              </el-avatar>
              <span class="user-name">{{ userStore.userName || '用户' }}</span>
              <el-icon class="dropdown-icon"><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="navigateTo('/profile')">个人中心</el-dropdown-item>
                <el-dropdown-item v-if="isAdmin" divided @click="navigateTo('/admin')">管理后台</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 计算是否为管理员
// 基于username判断
const isAdmin = computed(() => {
  if (!userStore.userInfo) return false
  
  const userName = userStore.userInfo.userName || ''
  return userName.toLowerCase().includes('admin')
})

// 判断当前路由是否正活动
const isActive = (path) => {
  return route.path.startsWith(path)
}

// 车下跳转方法
const navigateTo = (path) => {
  if (route.path !== path) {
    router.push(path)
  }
}

// 回到首页
const goHome = () => {
  router.push('/home')
}

// 退出登录
const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  }).catch(() => {
    // 取消退出
  })
}
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid var(--el-border-color-light);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  gap: 24px;
  position: relative;
}

/* Logo 样式 */
.logo {
  position: absolute;
  left: 24px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo h1 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: var(--el-color-primary);
  letter-spacing: 1px;
}

/* 导航菜单样式 */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.nav-item {
  color: var(--el-text-color-primary);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nav-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

/* 管理后台按钮 */
.admin-button {
  margin-left: 12px;
}

.admin-button :deep(.el-button) {
  height: 36px;
}

/* 用户信息区 */
.user-section {
  position: absolute;
  right: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: var(--el-color-primary-light-9);
}

.user-avatar {
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 14px;
  color: var(--el-text-color-primary);
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  color: var(--el-color-primary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-menu {
    gap: 8px;
  }

  .nav-item {
    padding: 6px 12px;
    font-size: 14px;
  }

  .logo h1 {
    font-size: 20px;
  }

  .user-name {
    max-width: 80px;
  }
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .nav-content {
    justify-content: space-between;
  }

  .logo h1 {
    font-size: 18px;
  }
}
</style>