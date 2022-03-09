import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/server',
    component: () => import('layouts/ServerLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/ServerIndex.vue')
    }, {
      path: 'create',
      component: () => import('pages/ServerCreate.vue')
    }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
