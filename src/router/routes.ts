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
            path: 'order',
            component: () => import('pages/personal/PersonalOrder.vue')
          },
          {
            path: 'order/detail/:orderId', // orderId 动态路由匹配
            component: () => import('pages/personal/PersonalDetail.vue')
          },
          {
            path: 'coupon',
            component: () => import('pages/personal/CouponList.vue')
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
        redirect: '/my/server/group/list',
        children: [
          {
            path: 'list', // 组列表
            component: () => import('pages/group/GroupList.vue')
          },
          {
            path: 'server/list', // 组资源
            component: () => import('pages/group/ServerList.vue')
          },
          {
            path: 'order',
            component: () => import('pages/group/GroupOrder.vue')
          },
          {
            path: 'order/detail/:orderId', // orderId 动态路由匹配
            component: () => import('pages/group/GroupOrderDetail.vue')
          },
          {
            path: 'coupon',
            component: () => import('pages/group/GroupCouponList.vue')
          },
          {
            path: 'create',
            component: () => import('pages/group/GroupCreate.vue'),
            props: true // 接收url中的参数
          },
          {
            path: 'detail/:groupId', // groupId 动态路由匹配
            component: () => import('pages/group/GroupDetail.vue'),
            props: true // 接收url中的参数
          },
          {
            path: 'server/detail/:serverId', // serverId 动态路由匹配
            component: () => import('pages/group/ServerDetail.vue')
          },
          {
            path: 'server/deploy',
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
      // {
      //   path: 'order',
      //   component: () => import('pages/order/OrderIndex.vue'),
      //   redirect: '/my/server/order/personal',
      //   children: [
      //     {
      //       path: 'personal', // 订单列表
      //       component: () => import('pages/personal/PersonalOrder.vue')
      //     },
      //     {
      //       path: 'personal/detail/:orderId', // orderId 动态路由匹配
      //       component: () => import('pages/personal/PersonalDetail.vue')
      //     },
      //     {
      //       path: 'group', // 订单列表
      //       component: () => import('pages/group/GroupOrder.vue')
      //     },
      //     {
      //       path: 'group/detail/:orderId', // orderId 动态路由匹配
      //       component: () => import('pages/group/GroupOrderDetail.vue')
      //     }
      //   ]
      // },
      {
        path: 'provider',
        component: () => import('pages/provider/ProviderIndex.vue'),
        redirect: '/my/server/provider/server',
        children: [
          {
            path: 'server',
            component: () => import('pages/provider/ServerDeployed.vue')
          },
          {
            path: 'server/detail/:id',
            component: () => import('pages/provider/ServerDetail.vue'),
            props: true
          }
        ]
      },
      {
        path: 'management',
        component: () => import('pages/management/ManagementIndex.vue'),
        redirect: '/my/server/management/resource',
        children: [{
          path: 'resource',
          component: () => import('pages/management/TotalResource.vue')
        }]
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
