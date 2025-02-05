/**
 * @file main.ts
 * @description 应用程序的主入口文件，负责初始化 Vue 应用及其插件
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import App from './App.vue'
import router from './router'

// 导入样式文件
import '@arco-design/web-vue/dist/arco.css' // Arco Design Vue 的样式
import './assets/main.css'   // 主要样式文件
import './assets/global.css' // 全局样式文件

/**
 * 创建 Vue 应用实例
 * @description 初始化根组件 App
 */
const app = createApp(App)

/**
 * 注册 Pinia 状态管理
 * @description 用于集中管理应用的状态
 */
const pinia = createPinia()
app.use(pinia)

/**
 * 注册路由
 * @description 配置应用的路由系统
 */
app.use(router)

/**
 * 注册 Arco Design Vue
 * @description 配置 UI 组件库
 */
app.use(ArcoVue, {
  // 设置组件前缀为 a，例如 <a-button>
  componentPrefix: 'a'
})

/**
 * 全局错误处理
 * @description 捕获 Vue 组件中的错误
 * @param {Error} err - 错误对象
 * @param {Vue} vm - 发生错误的组件实例
 * @param {string} info - Vue 特定的错误信息
 */
app.config.errorHandler = (err, vm, info) => {
  // 忽略 ResizeObserver 相关的错误，这些通常是良性的
  if (err instanceof Error && err.message.includes('ResizeObserver')) {
    return false
  }
  console.error('Vue Error:', err, info)
}

/**
 * 全局 window 错误处理
 * @description 捕获全局 JavaScript 错误
 */
window.addEventListener('error', (e) => {
  // 忽略 ResizeObserver 相关的错误
  if (e.message.includes('ResizeObserver')) {
    e.stopPropagation()
    return false
  }
})

// 挂载应用到 DOM
app.mount('#app') 