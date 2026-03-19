<!--
  App 根组件
  功能描述：Vue应用根组件，作为整个应用的入口
  主要功能：
    - 渲染路由视图：仅负责渲染当前路由对应的页面
    - 所有每页面的布局容器
  使用位置：main.js中意详文安装
-->
<template>
  <div
    id="app"
    :class="{
      'app-shell': true,
      'app-shell--internal': isInternalRoute,
      'app-shell--external': !isInternalRoute
    }"
  >
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// App.vue 作为根组件，只负责渲染路由视图
const route = useRoute()

/**
 * 标记站内页面，用于限制深色主题全局覆盖范围，避免影响落地页与认证页。
 */
const isInternalRoute = computed(() => route.meta.requiresAuth === true)
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
