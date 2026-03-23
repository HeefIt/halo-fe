<template>
  <header class="ai-tool-header">
    <div class="ai-tool-header__main">
      <div class="ai-tool-header__copy">
        <span class="ai-tool-header__kicker">AI WORKSPACE</span>
        <div class="ai-tool-header__title-row">
          <h1 class="ai-tool-header__title">{{ title }}</h1>
          <span v-if="badge" class="ai-tool-header__badge">{{ badge }}</span>
        </div>
        <p v-if="subtitle" class="ai-tool-header__subtitle">{{ subtitle }}</p>
      </div>

      <div class="ai-tool-header__actions">
        <button class="ai-tool-header__action" @click="router.push('/ai/chatbot')">
          AI 工作台
        </button>
        <button class="ai-tool-header__action ai-tool-header__action--accent" @click="router.push('/home')">
          返回首页
        </button>
      </div>
    </div>

    <nav class="ai-tool-nav">
      <button
        v-for="item in toolItems"
        :key="item.path"
        class="ai-tool-nav__item"
        :class="{ active: route.path === item.path }"
        @click="router.push(item.path)"
      >
        <span class="ai-tool-nav__icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </header>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

defineProps({
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
  { label: '通用对话', path: '/ai/chatbot', icon: '◌' },
  { label: '角色对话', path: '/ai/role-chat', icon: '◈' },
  { label: '智能客服', path: '/ai/customer-service', icon: '◇' },
  { label: '多模态解析', path: '/ai/multimodal', icon: '▣' }
]
</script>

<style scoped>
.ai-tool-header {
  display: grid;
  gap: 10px;
  padding: 12px 14px 10px;
  border: 1px solid var(--ai-border, rgba(15, 23, 42, 0.1));
  background: var(--ai-surface, #ffffff);
  border-radius: 14px;
}

.ai-tool-header__main {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: start;
}

.ai-tool-header__kicker {
  color: var(--ai-text-faint, #64748b);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.ai-tool-header__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.ai-tool-header__title {
  margin: 0;
  color: var(--ai-text, #0f172a);
  font-size: clamp(22px, 2.2vw, 28px);
  line-height: 1;
  letter-spacing: -0.04em;
}

.ai-tool-header__badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--ai-accent-soft, rgba(37, 99, 235, 0.08));
  color: var(--ai-accent, #2563eb);
  font-size: 11px;
  font-weight: 700;
}

.ai-tool-header__subtitle {
  max-width: 720px;
  margin: 6px 0 0;
  color: var(--ai-text-soft, #475569);
  font-size: 13px;
  line-height: 1.55;
}

.ai-tool-header__actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: end;
}

.ai-tool-header__action {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid var(--ai-border, rgba(15, 23, 42, 0.1));
  background: transparent;
  border-radius: 10px;
  color: var(--ai-text, #0f172a);
  font-size: 12px;
  font-weight: 700;
}

.ai-tool-header__action--accent {
  border-color: var(--ai-accent-line, rgba(37, 99, 235, 0.16));
  background: var(--ai-accent-soft, rgba(37, 99, 235, 0.08));
  color: var(--ai-accent, #2563eb);
}

.ai-tool-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-tool-nav__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid transparent;
  background: var(--ai-surface-alt, #f8fafc);
  border-radius: 10px;
  color: var(--ai-text-soft, #475569);
  font-size: 12px;
  font-weight: 700;
}

.ai-tool-nav__item.active {
  border-color: var(--ai-accent-line, rgba(37, 99, 235, 0.16));
  background: var(--ai-accent-soft, rgba(37, 99, 235, 0.08));
  color: var(--ai-accent, #2563eb);
}

.ai-tool-nav__icon {
  font-size: 12px;
}

@media (max-width: 768px) {
  .ai-tool-header__main {
    flex-direction: column;
  }

  .ai-tool-header__actions {
    justify-content: start;
  }
}
</style>
