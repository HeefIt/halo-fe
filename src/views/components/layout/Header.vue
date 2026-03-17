<template>
  <header class="header">
    <div class="header-inner">
      <a class="logo" @click="goHome">
        <img class="logo-mark" :src="brandMark" alt="halo coding do" />
        <span class="logo-meta">
          <span class="logo-text">halo coding do</span>
          <span class="logo-caption">tasteful dev community</span>
        </span>
      </a>
      
      <nav class="nav">
        <button 
          class="nav-item" 
          :class="{ active: isActive('/home') }"
          @click="navigateTo('/home')"
        >
          首页
        </button>
        <button 
          class="nav-item" 
          :class="{ active: isActive('/home/questions') }"
          @click="navigateTo('/home/questions')"
        >
          题库
        </button>
        <button 
          class="nav-item" 
          :class="{ active: isActive('/study-plan') }"
          @click="navigateTo('/study-plan')"
        >
          学习计划
        </button>
        <button 
          class="nav-item" 
          :class="{ active: isActive('/ranking') }"
          @click="navigateTo('/ranking')"
        >
          排行榜
        </button>
        <button 
          class="nav-item" 
          :class="{ active: isActive('/practice-history') }"
          @click="navigateTo('/practice-history')"
        >
          练习记录
        </button>
        <button 
          class="nav-item nav-item-blog" 
          :class="{ active: isActive('/blog') }"
          @click="navigateTo('/blog')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
            <line x1="7" y1="8" x2="17" y2="8"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
            <line x1="7" y1="16" x2="13" y2="16"/>
          </svg>
          博客
        </button>
        <button 
          class="nav-item nav-item-ai" 
          :class="{ active: isActive('/ai/') }"
          @click="navigateTo('/ai/chatbot')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
          </svg>
          AI助手
        </button>
      </nav>
      
      <div class="header-actions">
        <button 
          v-if="isAdmin" 
          class="btn-admin"
          @click="navigateTo('/admin')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24m-2.52 2.52L5.5 18.5m13 0l-4.24-4.24m-2.52-2.52L5.5 5.5"/>
          </svg>
          管理后台
        </button>
        
        <div class="user-menu">
          <button class="user-trigger" @click="showUserMenu = !showUserMenu">
            <div class="user-avatar">
              <img v-if="userStore.userAvatar" :src="userStore.userAvatar" alt="avatar" class="avatar-img" />
              <span v-else>{{ userStore.userName?.charAt(0) || 'U' }}</span>
            </div>
            <span class="user-name">{{ userStore.userName || '用户' }}</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
              :class="{ rotated: showUserMenu }"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          
          <Transition name="dropdown">
            <div v-if="showUserMenu" class="user-dropdown">
              <button class="dropdown-item" @click="handleProfile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                个人中心
              </button>
              <button v-if="isAdmin" class="dropdown-item" @click="handleAdmin">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                </svg>
                管理后台
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item dropdown-item-danger" @click="logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                退出登录
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    
    <div v-if="showUserMenu" class="dropdown-backdrop" @click="showUserMenu = false"></div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'
import brandMark from '@/assets/brand/hcd-mark.svg'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const showUserMenu = ref(false)

const isAdmin = computed(() => {
  if (!userStore.userInfo) return false
  const userName = userStore.userInfo.userName || ''
  return userName.toLowerCase().includes('admin')
})

const isActive = (path) => {
  if (path === '/home') {
    return route.path === '/home'
  }
  if (path === '/home/questions') {
    return route.path === '/home/questions' || route.path.startsWith('/home/questions/')
  }
  if (path === '/ai/') {
    return route.path.startsWith('/ai/')
  }
  return route.path.startsWith(path)
}

const navigateTo = (path) => {
  if (route.path !== path) {
    router.push(path).catch(err => {
      console.error('路由跳转失败:', err)
    })
  }
  showUserMenu.value = false
}

const goHome = () => {
  router.push('/home')
  showUserMenu.value = false
}

const handleProfile = () => {
  navigateTo('/profile')
}

const handleAdmin = () => {
  navigateTo('/admin')
}

const logout = () => {
  showUserMenu.value = false
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/')
  }).catch(() => {})
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  max-width: 1440px;
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xl);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.logo:hover {
  opacity: 0.8;
}

.logo-mark {
  width: 40px;
  height: 34px;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(8, 43, 114, 0.14));
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.98rem;
  color: var(--color-text);
  line-height: 1;
}

.logo-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-caption {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--color-text);
  background: var(--color-bg-subtle);
}

.nav-item.active {
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.nav-item-ai {
  background: var(--gradient-primary);
  color: white;
}

.nav-item-ai:hover {
  opacity: 0.9;
  color: white;
  background: var(--gradient-primary);
}

.nav-item-ai.active {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.nav-item-blog {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.nav-item-blog:hover {
  opacity: 0.9;
  color: white;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.nav-item-blog.active {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.btn-admin {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-admin:hover {
  color: var(--color-text);
  background: var(--color-bg-muted);
  border-color: var(--color-border-hover);
}

.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-trigger:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.user-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-trigger svg {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.user-trigger svg.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  padding: var(--spacing-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.dropdown-item:hover {
  color: var(--color-text);
  background: var(--color-bg-subtle);
}

.dropdown-item-danger:hover {
  color: var(--color-error);
  background: var(--color-error-light);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--spacing-sm) 0;
}

.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1024px) {
  .nav {
    gap: 0;
  }
  
  .nav-item {
    padding: var(--spacing-sm);
    font-size: var(--text-xs);
  }
  
  .user-name {
    display: none;
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .btn-admin {
    display: none;
  }
}
</style>
