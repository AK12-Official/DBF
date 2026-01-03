import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/connections',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/connections',
        name: 'Connections',
        component: () => import('@/views/Connections.vue'),
        meta: { title: '数据库连接管理' },
      },
      {
        path: '/connections/:id',
        name: 'ConnectionDetail',
        component: () => import('@/views/ConnectionDetail.vue'),
        meta: { title: '连接详情' },
      },
      {
        path: '/query',
        name: 'Query',
        component: () => import('@/views/Query.vue'),
        meta: { title: '数据查询' },
      },
      {
        path: '/sync/tasks',
        name: 'SyncTasks',
        component: () => import('@/views/SyncTasks.vue'),
        meta: { title: '同步任务管理' },
      },
      {
        path: '/sync/tasks/:id',
        name: 'SyncTaskDetail',
        component: () => import('@/views/SyncTaskDetail.vue'),
        meta: { title: '任务详情' },
      },
      {
        path: '/objects/:connectionId',
        name: 'Objects',
        component: () => import('@/views/Objects.vue'),
        meta: { title: '数据库对象管理' },
      },
      {
        path: '/conflicts',
        name: 'Conflicts',
        component: () => import('@/views/Conflicts.vue'),
        meta: { title: '冲突处理' },
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('TOKEN')
  
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'Login' || to.name === 'Register') && token) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router

