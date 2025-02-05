/**
 * @file router/index.ts
 * @description 路由配置文件，定义应用的路由规则
 */

import { createRouter, createWebHistory } from 'vue-router'

/**
 * 路由配置
 * @description 使用 Vue Router 创建路由实例
 * @property {History} history - 使用 HTML5 History 模式
 * @property {RouteRecordRaw[]} routes - 路由配置数组
 */
const router = createRouter({
  // 使用 HTML5 History 模式，需要服务器配置支持
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home1',
      // 使用动态导入实现路由懒加载，提高首屏加载速度
      component: () => import('@/views/Subconverter.vue'),
      meta: {
        title: '订阅转换'
      }
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('@/views/Setting.vue'),
      meta: {
        title: '设置'
      }
    }
  ]
})

/**
 * 全局路由守卫
 * @description 在路由跳转前执行
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '订阅转换'} - Sub Web`
  next()
})

export default router 