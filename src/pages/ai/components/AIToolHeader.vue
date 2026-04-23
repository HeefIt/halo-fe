<template>
  <header class="ai-tool-header">
    <button class="ai-tool-header__brand" type="button" @click="router.push('/ai/chatbot')">
      <span class="ai-tool-header__brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="6" height="6" rx="2"></rect>
          <rect x="14" y="4" width="6" height="6" rx="2"></rect>
          <rect x="4" y="14" width="6" height="6" rx="2"></rect>
          <path d="M16 14h2a2 2 0 0 1 2 2v2"></path>
          <path d="M14 18h6"></path>
        </svg>
      </span>
      <span class="ai-tool-header__brand-copy">
        <span class="ai-tool-header__brand-kicker">AI ZONE</span>
        <span class="ai-tool-header__current">{{ currentTitle }}</span>
      </span>
      <span v-if="badge" class="ai-tool-header__badge">{{ badge }}</span>
    </button>

    <nav class="ai-tool-nav" aria-label="AI tools">
      <button
        v-for="item in toolItems"
        :key="item.path"
        class="ai-tool-nav__item"
        :class="{ active: route.path === item.path }"
        :title="item.label"
        type="button"
        @click="router.push(item.path)"
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
          <svg v-else viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="16" height="14" rx="3"></rect>
            <path d="M9 10h6"></path>
            <path d="M9 14h6"></path>
          </svg>
        </span>
        <span class="ai-tool-nav__label">{{ item.shortLabel }}</span>
      </button>
    </nav>

    <button class="ai-tool-header__back" type="button" :title="backLabel" @click="handleBack">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18 9 12l6-6"></path>
      </svg>
      <span>返回</span>
    </button>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const router = useRouter()

const toolItems = [
  { label: '通用对话', shortLabel: '对话', path: '/ai/chatbot', icon: 'chat' },
  { label: '角色对话', shortLabel: '角色', path: '/ai/role-chat', icon: 'role' },
  { label: '智能客服', shortLabel: '客服', path: '/ai/customer-service', icon: 'service' },
  { label: '学习规划', shortLabel: '学习规划', path: '/ai/learning-coach', icon: 'coach' },
  { label: '多模态解析', shortLabel: '多模态', path: '/ai/multimodal', icon: 'multi' }
]

const activeItem = computed(() => toolItems.find(item => item.path === route.path))

const currentTitle = computed(() => {
  if (activeItem.value?.label) {
    return activeItem.value.label
  }
  return props.title.replace(/\s*Agent\s*$/i, '').trim()
})

const backLabel = computed(() => '返回首页')

const handleBack = () => {
  router.push('/home')
}
</script>

<style scoped>
.ai-tool-header {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border: 1px solid var(--ai-border, var(--internal-panel-border));
  background:
    linear-gradient(90deg, rgba(96, 165, 250, 0.05), transparent 22%),
    var(--ai-surface, var(--internal-panel-bg));
  border-radius: 14px;
}

.ai-tool-header__brand,
.ai-tool-header__back,
.ai-tool-nav__item {
  border: none;
  cursor: pointer;
}

.ai-tool-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0;
  padding-right: 20px;
  background: transparent;
  text-align: left;
}

.ai-tool-header__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--ai-accent-soft, var(--color-accent-light));
  color: var(--ai-accent, var(--color-accent));
  box-shadow: inset 0 0 0 1px var(--ai-accent-line, var(--color-accent-subtle));
  flex: 0 0 auto;
}

.ai-tool-header__brand-mark svg,
.ai-tool-nav__icon svg,
.ai-tool-header__back svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ai-tool-header__brand-copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}

.ai-tool-header__brand-kicker {
  color: var(--ai-text-faint, var(--text-3));
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.ai-tool-header__current {
  color: var(--ai-text, var(--text-1));
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.ai-tool-header__badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--ai-surface-alt, var(--internal-panel-bg-alt));
  color: var(--ai-text-soft, var(--text-2));
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.ai-tool-nav {
  display: flex;
  justify-content: flex-start;
  padding-left: 24px;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.ai-tool-nav::-webkit-scrollbar {
  display: none;
}

.ai-tool-nav__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  background: transparent;
  color: var(--ai-text-soft, var(--text-2));
  white-space: nowrap;
  flex: 0 0 auto;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.ai-tool-nav__item:hover {
  background: var(--ai-surface-alt, var(--internal-panel-bg-alt));
  color: var(--ai-text, var(--text-1));
}

.ai-tool-nav__item.active {
  background: var(--ai-accent-soft, var(--color-accent-light));
  color: var(--ai-accent, var(--color-accent));
  box-shadow: inset 0 0 0 1px var(--ai-accent-line, var(--color-accent-subtle));
}

.ai-tool-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: currentColor;
}

.ai-tool-nav__label {
  font-size: 12px;
  font-weight: 700;
}

.ai-tool-header__back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  background: var(--ai-surface-alt, var(--internal-panel-bg-alt));
  color: var(--ai-text-soft, var(--text-2));
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.ai-tool-header__back:hover {
  background: var(--ai-surface-hover, var(--internal-panel-bg-hover));
  color: var(--ai-text, var(--text-1));
  transform: translateX(-1px);
}

.ai-tool-header__back span {
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .ai-tool-header {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "brand back"
      "nav nav";
    row-gap: 10px;
  }

  .ai-tool-header__brand {
    grid-area: brand;
  }

  .ai-tool-nav {
    grid-area: nav;
    justify-content: flex-start;
  }

  .ai-tool-header__back {
    grid-area: back;
    justify-self: end;
  }
}

@media (max-width: 768px) {
  .ai-tool-header {
    padding: 9px 10px;
    gap: 8px;
  }

  .ai-tool-header__brand-mark {
    width: 30px;
    height: 30px;
    border-radius: 10px;
  }

  .ai-tool-header__current {
    font-size: 17px;
  }

  .ai-tool-header__badge {
    display: none;
  }

  .ai-tool-nav__item {
    min-height: 32px;
    padding: 0 9px;
  }

  .ai-tool-nav__label,
  .ai-tool-header__back span {
    font-size: 11px;
  }
}
</style>
