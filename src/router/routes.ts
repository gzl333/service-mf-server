import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/server',
    component: () => import('layouts/ServerLayout.vue'),
    redirect: '/my/server/personal',
    children: [
      {
        path: 'personal',
        component: () => import('pages/personal/Index.vue'),
        redirect: '/my/server/personal/list',
        children: [
          {
            path: 'list',
            component: () => import('pages/personal/ServerList.vue')
          }
        ]
      },
      {
        path: 'group',
        component: () => import('pages/group/Index.vue'),
        children: []
      },
      {
        path: 'vpn',
        component: () => import('pages/vpn/Index.vue'),
        children: []
      },
      {
        path: 'provider',
        component: () => import('pages/provider/Index.vue'),
        meta: {
          requireServiceAdmin: true // 服务管理员才能访问
        },
        children: []
      },
      {
        path: 'management',
        component: () => import('pages/management/Index.vue'),
        children: []
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
