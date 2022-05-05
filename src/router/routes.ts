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
          },
          {
            path: 'deploy',
            component: () => import('pages/personal/ServerDeploy.vue'),
            props: true // 接收url中的参数
          },
          {
            path: 'detail/:serverId', // serverId 动态路由匹配
            component: () => import('pages/personal/ServerDetail.vue')
          }
        ]
      },
      {
        path: 'group',
        component: () => import('pages/group/GroupIndex.vue'),
        children: [
          {
            path: 'list', // 组列表
            component: () => import('pages/group/GroupList.vue')
          },
          {
            path: 'detail/:id', // groupId 动态路由匹配
            component: () => import('pages/group/GroupDetail.vue'),
            props: true // 接收url中的参数
          },
          {
            path: 'serverlist', // 组资源
            component: () => import('pages/group/ServerList.vue')
          },
          {
            path: 'serverdetail/:id', // serverId 动态路由匹配
            component: () => import('pages/group/ServerDetail.vue')
          },
          {
            path: 'deploy',
            component: () => import('pages/group/ServerDeploy.vue'),
            props: true // 接收url中的参数
          }
        ]
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
