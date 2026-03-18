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
  height: 72px;
  background: rgba(250, 250, 250, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
}

.header-inner {
  max-width: 1440px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
  flex-shrink: 0;
}

.logo:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.logo-mark {
  width: 42px;
  height: 36px;
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
  justify-content: center;
  flex: 1;
  min-width: 0;
  gap: 4px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: var(--radius-full);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  overflow-x: auto;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-item:hover {
  color: var(--color-text);
  background: rgba(15, 23, 42, 0.05);
  transform: translateY(-1px);
}

.nav-item.active {
  color: var(--color-text);
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.nav-item-ai {
  color: var(--color-accent);
  background: rgba(99, 102, 241, 0.08);
}

.nav-item-ai:hover {
  color: var(--color-accent-hover);
  background: rgba(99, 102, 241, 0.12);
}

.nav-item-ai.active {
  color: var(--color-accent);
  background: rgba(99, 102, 241, 0.12);
  box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.14), 0 8px 18px rgba(99, 102, 241, 0.12);
}

.nav-item-blog {
  color: #047857;
  background: rgba(16, 185, 129, 0.1);
}

.nav-item-blog:hover {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
}

.nav-item-blog.active {
  color: #047857;
  background: rgba(16, 185, 129, 0.14);
  box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.14), 0 8px 18px rgba(16, 185, 129, 0.12);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-admin {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.btn-admin:hover {
  color: var(--color-text);
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 6px 6px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.user-trigger:hover {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
}

.user-avatar {
  width: 32px;
  height: 32px;
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
  top: calc(100% + 10px);
  right: 0;
  min-width: 196px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.12);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: 12px;
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
  background: rgba(15, 23, 42, 0.08);
  margin: 8px 0;
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
  .header-inner {
    gap: 16px;
    padding: 0 16px;
  }

  .nav {
    justify-content: flex-start;
  }
  
  .nav-item {
    padding: 10px 14px;
    font-size: var(--text-xs);
  }

  .logo-caption {
    display: none;
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
