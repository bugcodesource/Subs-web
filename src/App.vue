<!--
 * @file App.vue
 * @description 应用程序的根组件
 * @author Your Name
 * @created 2024-02-05
-->

<template>
  <!-- 
    应用程序的根容器
    使用 router-view 渲染当前路由匹配的组件
  -->
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
/**
 * App.vue 是应用的根组件
 * 负责：
 * 1. 提供应用的基础布局结构
 * 2. 通过 router-view 渲染路由组件
 */
</script>

<style>
.app-container {
  /* 设置应用容器样式 */
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>