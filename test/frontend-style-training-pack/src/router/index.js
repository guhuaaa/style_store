import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/analysis/new'
  },
  {
    path: '/analysis/:projectId?',
    name: 'Analysis',
    component: () => import('../views/Analysis.vue'),
    meta: { title: '风险推演', icon: 'TrendCharts' }
  },
  {
    path: '/simulation/:simulationId',
    name: 'Simulation',
    component: () => import('../views/Simulation.vue'),
    meta: { title: '模拟监控', icon: 'VideoPlay' }
  },
  {
    path: '/report/:reportId',
    name: 'Report',
    component: () => import('../views/Report.vue'),
    meta: { title: '分析报告', icon: 'Document' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '系统设置', icon: 'Setting' }
  },
  {
    path: '/internal/g6-prototype',
    name: 'G6Prototype',
    component: () => import('../views/G6Prototype.vue'),
    meta: { title: 'G6 技术原型', internal: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const title = to.meta.title ? `${to.meta.title} - risknick` : 'risknick 金融风险推演平台'
  document.title = title
  next()
})

export { routes }
export default router
