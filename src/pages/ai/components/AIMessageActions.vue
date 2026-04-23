<template>
  <!--
    @author kyrie.huang
    @description AI消息操作功能栏组件，提供复制、分享、重新生成功能
    @param {string} content - AI回复的内容
    @param {string} sessionId - 会话ID，用于分享和重新生成
    @param {Function} onRegenerate - 重新生成的回调函数
  -->
  <div class="ai-message-actions">
    <button 
      class="action-btn" 
      type="button" 
      @click="handleCopy"
      title="复制内容"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </button>
    <button 
      class="action-btn" 
      type="button" 
      @click="handleShare"
      title="分享对话"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"></path>
        <path d="m12 5 7 7-7 7"></path>
      </svg>
    </button>
    <button 
      class="action-btn" 
      type="button" 
      @click="handleRegenerate" 
      :disabled="isRegenerating"
      title="重新生成"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  sessionId: {
    type: String,
    default: ''
  },
  onRegenerate: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['regenerate'])

const isRegenerating = ref(false)

const handleCopy = async () => {
  if (!props.content) {
    ElMessage.warning('暂无内容可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(props.content)
    ElMessage.success('已复制')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

const handleShare = async () => {
  const shareUrl = props.sessionId
    ? `${window.location.origin}/ai/chatbot?sessionId=${props.sessionId}`
    : window.location.href

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'AI 对话分享',
        text: props.content ? props.content.slice(0, 100) + '...' : '查看这段AI对话',
        url: shareUrl
      })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      ElMessage.success('链接已复制')
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('分享失败:', error)
      ElMessage.error('分享失败')
    }
  }
}

const handleRegenerate = async () => {
  if (isRegenerating.value) return

  isRegenerating.value = true
  try {
    if (props.onRegenerate) {
      await props.onRegenerate()
    }
    emit('regenerate')
  } catch (error) {
    console.error('重新生成失败:', error)
    ElMessage.error('重新生成失败')
  } finally {
    isRegenerating.value = false
  }
}
</script>

<style scoped>
.ai-message-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-top: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.06);
  color: #1e293b;
}

.action-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.is-dark .action-btn {
  color: #64748b;
}

.is-dark .action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}
</style>
