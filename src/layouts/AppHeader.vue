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
          圈子社区
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
          AI-Zone
        </button>
      </nav>
      
      <div class="header-actions">
        <button class="notice-trigger" type="button" @click="handleOpenNotice">
          <span v-if="hasActiveNotice" class="notice-dot"></span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17c0 .53-.21 1.04-.59 1.41L4 17h5"></path>
            <path d="M10 17a2 2 0 0 0 4 0"></path>
          </svg>
          <span class="notice-label">公告</span>
        </button>

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

    <NoticeDialog
      v-model="showNoticeDialog"
      :notice="currentNotice"
      mode="view"
    />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCurrentNotice } from '@/api/modules/notice'
import brandMark from '@/assets/brand/hcd-mark.svg'
import NoticeDialog from '@/components/notice/NoticeDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const showUserMenu = ref(false)
const showNoticeDialog = ref(false)
const currentNotice = ref(null)

const isAdmin = computed(() => userStore.isAdmin)
const hasActiveNotice = computed(() => !!currentNotice.value?.id)

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

const fetchCurrentNotice = async () => {
  try {
    const res = await getCurrentNotice(1)
    if (res.success) {
      currentNotice.value = res.data || null
    }
  } catch (error) {
    console.error('获取当前公告失败:', error)
  }
}

const handleOpenNotice = async () => {
  if (!currentNotice.value) {
    await fetchCurrentNotice()
  }

  if (!currentNotice.value) {
    ElMessage.info('当前暂无公告')
    return
  }

  showNoticeDialog.value = true
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
  fetchCurrentNotice()
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
  height: 68px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
}

.header-inner {
  max-width: 1440px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.logo:hover {
  opacity: 0.94;
}

.logo-mark {
  width: 42px;
  height: 36px;
  object-fit: contain;
}

.logo-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-1);
}

.logo-caption {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-3);
}

.nav {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 2px;
  padding: 0 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-2);
  font-size: var(--text-sm);
  font-weight: 600;
  white-space: nowrap;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  flex-shrink: 0;
}

.nav-item:hover {
  color: var(--text-1);
  background: var(--color-bg-subtle);
  border-color: var(--border-soft);
}

.nav-item.active {
  color: var(--color-accent);
  background: var(--color-accent-light);
  border-color: rgba(23, 78, 166, 0.12);
}

.nav-item-ai {
  color: var(--color-accent);
}

.nav-item-blog {
  color: #0f7b55;
}

.nav-item-blog.active {
  color: #0f7b55;
  background: rgba(15, 157, 88, 0.1);
  border-color: rgba(15, 157, 88, 0.14);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.notice-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--text-sm);
  font-weight: 600;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}

.notice-trigger:hover {
  color: var(--text-1);
  background: var(--color-bg-subtle);
  border-color: var(--border-normal);
}

.notice-dot {
  position: absolute;
  top: 8px;
  left: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.14);
}

.notice-label {
  white-space: nowrap;
}

.btn-admin {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--text-sm);
  font-weight: 600;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}

.btn-admin:hover {
  color: var(--text-1);
  background: var(--color-bg-subtle);
  border-color: var(--border-normal);
}

.user-menu {
  position: relative;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 4px 8px 4px 4px;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.user-trigger:hover {
  background: var(--color-bg-subtle);
  border-color: var(--border-normal);
}

.user-avatar {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-accent);
  color: #ffffff;
  font-size: var(--text-xs);
  font-weight: 700;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  max-width: 86px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-1);
  font-size: var(--text-sm);
  font-weight: 600;
}

.user-trigger svg {
  color: var(--text-3);
  transition: transform var(--transition-fast);
}

.user-trigger svg.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 196px;
  padding: 8px;
  border: 1px solid var(--border-normal);
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  box-shadow: var(--shadow-elevated);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 12px;
  border-radius: var(--radius-md);
  color: var(--text-2);
  font-size: var(--text-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast);
  text-align: left;
}

.dropdown-item:hover {
  color: var(--text-1);
  background: var(--color-bg-subtle);
}

.dropdown-item-danger:hover {
  color: var(--color-error);
  background: var(--color-error-light);
}

.dropdown-divider {
  height: 1px;
  margin: 8px 0;
  background: var(--border-soft);
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

:global(:root[data-theme='dark']) .nav-item.active {
  color: var(--color-accent);
  background: rgba(108, 159, 255, 0.12);
  border-color: rgba(108, 159, 255, 0.14);
}

:global(:root[data-theme='dark']) .nav-item-blog.active {
  color: #78d1aa;
  background: rgba(15, 157, 88, 0.14);
  border-color: rgba(15, 157, 88, 0.16);
}

:global(:root[data-theme='dark']) .dropdown-item:hover {
  background: rgba(183, 194, 211, 0.08);
}

@media (max-width: 1280px) {
  .logo-caption,
  .user-name,
  .notice-label {
    display: none;
  }
}

@media (max-width: 992px) {
  .header-inner {
    padding: 0 16px;
  }

  .btn-admin {
    display: none;
  }
}

@media (max-width: 768px) {
  .logo-meta {
    display: none;
  }

  .header-inner {
    gap: 12px;
  }

  .nav-item {
    padding: 0 10px;
  }
}
</style>
