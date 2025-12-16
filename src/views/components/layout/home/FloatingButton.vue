<!--
  FloatingButton 浮动会际按钮组件
  功能描述：右下角浮动按钮用于快速开始随机练习
  主要功能：
    - 随机练习：点击后随機選拧一道题目、自动将這道题目作为上一饺題，削除答题記錄，打開答题頁面
    - 位置：固定位置、右下角、z-index较高
  使用位置：QuestionBank.vue、Home.vue
-->
<template>
  <el-button
    class="floating-button"
    type="primary"
    size="large"
    round
    @click="startRandomPractice"
  >
    <el-icon><Lightning /></el-icon>
    开始刷题
  </el-button>
</template>

<script setup>
import { inject } from 'vue'
import { Lightning } from '@element-plus/icons-vue'

// 从父组件注入方法
const startRandomPractice = inject('startRandomPractice')
</script>

<style scoped>
/* 悬浮按钮 */
.floating-button {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.floating-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.4);
}

@media (max-width: 768px) {
  .floating-button {
    bottom: 16px;
    right: 16px;
  }
}
</style>