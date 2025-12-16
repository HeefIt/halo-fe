<!--
  App 根组件
  功能描述：Vue应用根组件，作为整个应用的入口
  主要功能：
    - 渲染路由视图：仅负责渲染当前路由对应的页面
    - 所有每页面的布局容器
  使用位置：main.js中意详文安装
-->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// App.vue 作为根组件，只负责渲染路由视图
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
