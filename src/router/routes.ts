import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/server',
    component: () => import('layouts/ServerLayout.vue'),
    redirect: '/my/server/personal',
    children: [
      {
        path: 'personal',
        component: () => import('pages/personal/PersonalIndex.vue'),
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
        component: () => import('pages/group/GroupIndex.vue'),
        children: []
      },
      {
        path: 'vpn',
        component: () => import('pages/vpn/VpnIndex.vue'),
        children: []
      },
      {
        path: 'provider',
        component: () => import('pages/provider/ProviderIndex.vue'),
        meta: {
          requireServiceAdmin: true // 服务管理员才能访问
        },
        children: []
      },
      {
        path: 'management',
        component: () => import('pages/management/ManagementIndex.vue'),
        children: []
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
