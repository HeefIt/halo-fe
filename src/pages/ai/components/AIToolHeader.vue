<template>
  <header class="ai-tool-header">
    <RouterLink class="ai-tool-header__brand" to="/ai/chatbot">
      <span class="ai-tool-header__brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="6" height="6" rx="2"></rect>
          <rect x="14" y="4" width="6" height="6" rx="2"></rect>
          <rect x="4" y="14" width="6" height="6" rx="2"></rect>
          <path d="M16 14h2a2 2 0 0 1 2 2v2M14 18h6"></path>
        </svg>
      </span>
      <span>AI-Zone</span>
    </RouterLink>

    <nav class="ai-tool-nav" aria-label="AI-Zone 工具">
      <RouterLink
        v-for="item in toolItems"
        :key="item.path"
        :to="item.path"
        :aria-label="item.label"
        class="ai-tool-nav__item"
        exact-active-class="is-current"
      >
        <span class="ai-tool-nav__icon" aria-hidden="true">
          <svg v-if="item.icon === 'chat'" viewBox="0 0 24 24" fill="none">
            <path d="M6 8h12"></path>
            <path d="M6 12h8"></path>
            <path d="M8 18h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4Z"></path>
          </svg>
          <svg v-else-if="item.icon === 'role'" viewBox="0 0 24 24" fill="none">
            <path d="M12 4 19 8 12 12 5 8 12 4Z"></path>
            <path d="M7 10.5v4.5c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.5"></path>
          </svg>
          <svg v-else-if="item.icon === 'service'" viewBox="0 0 24 24" fill="none">
            <path d="M5 12a7 7 0 0 1 14 0"></path>
            <rect x="3" y="11" width="4" height="7" rx="2"></rect>
            <rect x="17" y="11" width="4" height="7" rx="2"></rect>
            <path d="M12 19v1"></path>
          </svg>
          <svg v-else-if="item.icon === 'coach'" viewBox="0 0 24 24" fill="none">
            <path d="M6 18V9"></path>
            <path d="M12 18V6"></path>
            <path d="M18 18v-5"></path>
            <circle cx="6" cy="7" r="2"></circle>
            <circle cx="12" cy="4" r="2"></circle>
            <circle cx="18" cy="11" r="2"></circle>
          </svg>
          <svg v-else-if="item.icon === 'study-agent'" viewBox="0 0 24 24" fill="none">
            <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z"></path>
            <path d="M7 10v4.2c0 1.5 2.2 2.8 5 2.8s5-1.3 5-2.8V10"></path>
            <path d="M19 9.2v4.3"></path>
            <path d="M5.5 17.5h3"></path>
            <path d="M15.5 17.5h3"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="16" height="14" rx="3"></rect>
            <path d="M9 10h6"></path>
            <path d="M9 14h6"></path>
          </svg>
        </span>
        <span>{{ item.shortLabel }}</span>
      </RouterLink>
    </nav>

    <RouterLink class="ai-tool-header__back" to="/home">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m15 18-6-6 6-6"></path>
      </svg>
      <span>返回首页</span>
    </RouterLink>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const toolItems = [
  { label: '通用对话', shortLabel: '对话', path: '/ai/chatbot', icon: 'chat' },
  { label: '角色对话', shortLabel: '角色', path: '/ai/role-chat', icon: 'role' },
  { label: '智能客服', shortLabel: '客服', path: '/ai/customer-service', icon: 'service' },
  { label: '学习规划', shortLabel: '学习规划', path: '/ai/learning-coach', icon: 'coach' },
  { label: '学习搭子', shortLabel: '学习搭子', path: '/ai/halo-study-agent', icon: 'study-agent' },
  { label: '多模态解析', shortLabel: '多模态', path: '/ai/multimodal', icon: 'multi' }
]
</script>

<style scoped>
.ai-tool-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-areas: 'brand nav back';
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 7px 12px;
  border: 1px solid var(--internal-panel-border);
  border-radius: var(--radius-lg);
  background: var(--internal-panel-bg);
}

.ai-tool-header a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-md);
  text-decoration: none;
  white-space: nowrap;
}

.ai-tool-header a:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.ai-tool-header svg {
  display: block;
  width: 17px;
  height: 17px;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ai-tool-header__brand {
  grid-area: brand;
  justify-self: start;
  color: var(--text-1);
  font-size: 15px;
  font-weight: 720;
}

.ai-tool-header__brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.ai-tool-nav {
  grid-area: nav;
  display: flex;
  gap: 2px;
  min-width: 0;
}

.ai-tool-nav__item,
.ai-tool-header__back {
  min-height: 36px;
  padding: 0 10px;
  color: var(--text-2);
  font-size: 13px;
  font-weight: 600;
}

.ai-tool-header__back {
  grid-area: back;
  justify-self: end;
}

.ai-tool-nav__item:hover,
.ai-tool-header__back:hover {
  background: var(--internal-panel-bg-hover);
  color: var(--text-1);
}

.ai-tool-nav__item.is-current {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

@media (max-width: 860px) {
  .ai-tool-header {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: 'brand back' 'nav nav';
    gap: 4px 8px;
    padding: 6px 8px;
  }

  .ai-tool-nav {
    justify-content: space-between;
    overflow-x: auto;
    scrollbar-width: thin;
    padding: 2px;
  }

  .ai-tool-nav__item {
    flex: 1 0 auto;
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .ai-tool-nav {
    gap: 0;
  }

  .ai-tool-nav__item {
    min-height: 34px;
    padding: 0 4px;
    font-size: 12px;
  }

  .ai-tool-nav__icon {
    display: none;
  }
}
</style>
