<template>
  <el-drawer
    v-model="open"
    class="agent-side-panel"
    :title="title"
    :direction="direction"
    :size="size"
    destroy-on-close
    @opened="$emit('opened')"
  >
    <slot></slot>
  </el-drawer>
</template>

<script setup>
const open = defineModel({ type: Boolean, required: true })

defineProps({
  title: { type: String, required: true },
  direction: { type: String, default: 'rtl' },
  size: { type: String, default: 'min(430px, 92vw)' }
})

defineEmits(['opened'])
</script>

<style>
.el-drawer.agent-side-panel {
  background: var(--internal-panel-bg);
  color: var(--text-1);
  font-family: var(--font-sans);
}

.agent-side-panel .el-drawer__header {
  min-height: 58px;
  margin-bottom: 0;
  padding: 10px 18px;
  border-bottom: 1px solid var(--internal-panel-border);
  color: var(--text-1);
}

.agent-side-panel .el-drawer__close-btn {
  color: var(--text-2);
}

.agent-side-panel .el-drawer__body {
  min-width: 0;
  min-height: 0;
  padding: 0;
  overscroll-behavior: contain;
}

.agent-side-panel :where(button, a, input, select, summary):focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .agent-side-panel,
  .el-overlay:has(.agent-side-panel) {
    animation-duration: 1ms;
    transition-duration: 1ms;
  }
}
</style>
