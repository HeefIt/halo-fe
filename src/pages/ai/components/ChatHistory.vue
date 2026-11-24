<template>
  <aside class="chat-history" aria-label="历史会话">
    <div class="chat-history__top">
      <button class="chat-history__new" type="button" :disabled="busy" @click="$emit('create')">
        <el-icon aria-hidden="true"><EditPen /></el-icon>
        {{ newLabel }}
      </button>
    </div>

    <div ref="listRef" class="chat-history__list">
      <p v-if="loading" class="chat-history__hint" role="status">正在加载历史会话…</p>
      <div v-else-if="error" class="chat-history__hint">
        <p role="alert">{{ error }}</p>
        <button class="chat-history__retry" type="button" :disabled="busy" @click="$emit('retry')">重新加载</button>
      </div>
      <p v-else-if="!groups.length" class="chat-history__hint">还没有历史会话</p>

      <section v-for="group in groups" :key="group.label" class="chat-history__group">
        <h2>{{ group.label }}</h2>
        <ul>
          <li
            v-for="entry in group.entries"
            :key="entry.sessionId"
            class="chat-history__row"
            :class="{ 'is-active': entry.sessionId === activeSessionId }"
          >
            <button
              class="chat-history__session"
              type="button"
              :title="entry.title"
              :aria-current="entry.sessionId === activeSessionId ? 'true' : undefined"
              :disabled="busy"
              @click="$emit('select', entry.sessionId)"
            >
              {{ entry.title }}
            </button>
            <div class="chat-history__actions">
              <button
                type="button"
                :aria-label="`重命名：${entry.title}`"
                title="重命名会话"
                :disabled="busy"
                @click="$emit('rename', entry.sessionId)"
              >
                <el-icon aria-hidden="true"><Edit /></el-icon>
              </button>
              <button
                type="button"
                :aria-label="`删除：${entry.title}`"
                title="删除会话"
                :disabled="busy"
                @click="$emit('delete', entry.sessionId)"
              >
                <el-icon aria-hidden="true"><Delete /></el-icon>
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { Delete, Edit, EditPen } from '@element-plus/icons-vue'

defineProps({
  groups: { type: Array, required: true },
  activeSessionId: { type: String, default: null },
  newLabel: { type: String, default: '新对话' },
  error: { type: String, default: '' },
  busy: Boolean,
  loading: Boolean
})

defineEmits(['create', 'select', 'rename', 'delete', 'retry'])

const listRef = ref(null)

const scrollToActive = () => {
  listRef.value?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
}

defineExpose({ scrollToActive })
</script>

<style scoped>
.chat-history {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: var(--internal-panel-bg-alt);
}

.chat-history__top {
  padding: 14px 12px 10px;
}

.chat-history button {
  font: inherit;
  color: inherit;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.chat-history button:disabled {
  cursor: default;
  opacity: 0.5;
}

.chat-history button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.chat-history .chat-history__new {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid var(--internal-panel-border-strong);
  border-radius: var(--radius-md);
  background: var(--internal-panel-bg);
  font-size: 14px;
  font-weight: 650;
  text-align: left;
}

.chat-history__new .el-icon {
  color: var(--color-accent);
  font-size: 16px;
}

.chat-history__new:hover:not(:disabled),
.chat-history__row:hover {
  background: var(--internal-panel-bg-hover);
}

.chat-history__list {
  flex: 1;
  min-height: 0;
  padding: 8px 8px 12px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.chat-history__group + .chat-history__group {
  margin-top: 16px;
}

.chat-history__group h2,
.chat-history__hint {
  margin: 0;
  padding: 4px 10px 6px;
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
}

.chat-history .chat-history__retry {
  margin-top: 6px;
  padding: 4px 0;
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.chat-history__group ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.chat-history__row {
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: var(--radius-md);
}

.chat-history__row.is-active {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.chat-history .chat-history__session {
  flex: 1;
  min-width: 0;
  min-height: 38px;
  padding: 0 10px;
  overflow: hidden;
  border-radius: inherit;
  font-size: 13px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-history__row.is-active .chat-history__session {
  font-weight: 650;
}

.chat-history__actions {
  display: flex;
  flex: none;
  gap: 2px;
  padding-right: 4px;
  opacity: 0;
}

.chat-history__row:where(:hover, :focus-within, .is-active) .chat-history__actions {
  opacity: 1;
}

.chat-history__actions button {
  display: grid;
  width: 28px;
  height: 28px;
  padding: 0;
  place-items: center;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: 14px;
}

.chat-history__actions button:hover:not(:disabled) {
  background: var(--internal-panel-bg);
  color: var(--text-1);
}

.chat-history__actions button:last-child:hover:not(:disabled) {
  color: var(--color-error);
}

@media (hover: none), (max-width: 860px) {
  .chat-history__actions {
    opacity: 1;
  }

  .chat-history__actions button {
    width: 36px;
    height: 36px;
  }
}
</style>
