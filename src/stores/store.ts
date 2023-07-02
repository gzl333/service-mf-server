/* eslint-disable camelcase */

import { defineStore } from 'pinia'
import { normalize, schema } from 'normalizr'
import { baseURLServer } from 'boot/axios'
import api from 'src/api'
import { i18n } from 'boot/i18n'
import { Dialog, Notify } from 'quasar'
import { navigateToUrl } from 'single-spa'

// @ts-expect-error
import { useStoreMain } from '@cnic/main'

import ServerDeleteDialog from 'components/server/ServerDeleteDialog.vue'
import ServerRebuildDialog from 'components/server/ServerRebuildDialog.vue'
import GroupEditDialog from 'components/group/GroupEditDialog.vue'
import GroupAddMemberDialog from 'components/group/GroupAddMemberDialog.vue'
import OrderPayDialog from 'components/order/OrderPayDialog.vue'
import OrderCancelDialog from 'components/order/OrderCancelDialog.vue'
import OrderRenewDialog from 'components/order/OrderRenewDialog.vue'
import RedeemCouponDialog from 'components/coupon/RedeemCouponDialog.vue'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
import MountDiskDialog from 'components/disk/MountDiskDialog.vue'
import UnmountDiskDialog from 'components/disk/UnmountDiskDialog.vue'
import DeleteDiskDialog from 'components/disk/DeleteDiskDialog.vue'

const { tc } = i18n.global
const exceptionNotifier = useExceptionNotifier()

// const actionMap = new Map<string, string>(
//   [
//     ['start', '开机'],
//     ['reboot', '重启'],
//     ['shutdown', '关机'],
//     ['poweroff', '强制断电'],
//     ['delete', '删除'],
//     ['delete_force', '强制删除']
//   ]
// )

export interface PeriodInterface {
  id: string
  period: number
  enable: boolean
  creation_time: string
  service_id: string
}

export interface UserInterface {
  id: string
  username: string
  fullname: string
  role: {
    role: string[]
  }
}

export interface PersonalBalanceInterface {
  id: string
  balance: string
  creation_time: string
  user: {
    id: string
  }
}

export interface GroupInterface {
  id: string
  name: string
  company: string
  description: string
  creation_time: string
  owner: {
    id: string
    username: string
  },
  status: string // 'active' | 'inactive' ?

  // 以下字段自行判断添加

  // 当前用户在组内权限  owner > leader > member
  myRole: 'owner' | 'leader' | 'member'
  // 订单
  // order: string[] // orderId
  // coupon
  // coupons: string[] // couponId
  // 余额 to del
  // balance: string // groupBalanceTable 内的id值

  // group stats接口补充
  stats: {
    member_count: number
    server_count: number
    order_count: number
    coupon_count: number
    balance: string
  }
}

export interface SingleMemberInterface {
  id: string
  user: {
    id: string
    username: string
  }
  role: 'member' | 'leader' | 'owner'
  join_time: string
  inviter: string
}

export interface GroupMemberInterface {
  members: SingleMemberInterface[]
  owner: {
    id: string
    username: string
  }
}

export interface GroupBalanceInterface {
  id: string
  balance: string
  creation_time: string
  vo: {
    id: string
  }
}

export interface DataCenterInterface {
  // 来自registry接口
  id: string
  name: string
  name_en: string
  endpoint_vms: string
  endpoint_object: never // null 待细化
  endpoint_compute: never // null 待细化
  endpoint_monitor: never // null 待细化
  creation_time: string
  status: {
    code: number
    message: string
  },
  desc: string
  longitude: number
  latitude: number
  sort_weight: number // 排序权重, 值越大排序越靠前

  // 来自service接口
  services: string[] // 全部services汇总
  // personalServices: string[] // 用户可用services汇总
}

// export interface ServiceInterface {
//   // 来自service接口
//   id: string
//   name: string
//   name_en: string
//   service_type: string
//   cloud_type: string
//   add_time: string
//   need_vpn: boolean
//   status: 'enable' | 'disable' | 'deleted'
//   data_center: string // 接口原生数据为对象，整理为dataCenterId
//   longitude: number
//   latitude: number
//   pay_app_service_id: string
//   sort_weight: number // 排序权重, 值越大排序越靠前
// }

export interface ServiceInterface {
  // 来自service接口
  id: string
  name: string
  name_en: string
  service_type: string
  cloud_type: string
  add_time: string
  need_vpn: boolean
  status: 'enable' | 'disable' | 'deleted'
  data_center: {
    id: string
    name: string
    name_en: string
    sort_weight: number
  }
  longitude: number
  latitude: number
  pay_app_service_id: string
  sort_weight: number // 排序权重
  disk_available: boolean // 是否提供云硬盘
}

export interface DiskInterface {
  id: string
  name: string
  size: string
  service: {
    id: string
    name: string
    name_en: string
  }
  azone_id: string
  azone_name: string
  creation_time: string
  remarks: string
  task_status: string /*   # 创建状态，ok: 成功；creating：正在创建中；failed：创建失败 */
  expiration_time: string | null
  pay_type: 'postpaid' | 'prepaid' /* # prepaid: 包年包月; postpaid:按量计费 */
  classification: 'vo' | 'personal' /* # personal：硬盘归属用户个人 */
  user: { /*  # 硬盘创建人 */
    id: string
    username: string
  }
  vo: {
    id: string
    name: string
  }
  lock: 'free' | 'lock-delete' | 'lock-operation', /* # 'free': 无锁；'lock-delete': 锁定删除，防止删除；'lock-operation', '锁定所有操作，只允许读' */
  deleted: boolean /* # true: 已删除；false: 正常；只有管理员可查询到已删除云硬盘； */
  server: { /* # 挂载的云主机，未挂载时为 null */
    id: string
    ipv4: string
    vcpus: number
    ram: number /* # GiB */
    image: string
  } | null
  mountpoint: string, /* # 挂载的设备名/挂载点, 未挂载时为空字符串 */
  attached_time: string | null /* # 上次挂载时间 */
  detached_time: string | null /*  # 上次卸载时间 */
}

// 资源配置接口： 服务提供给联邦的配额用 资源配置 来描述
export interface AllocationInterface {
  private_ip_total: number
  public_ip_total: number
  vcpu_total: number
  ram_total: number
  disk_size_total: number
  private_ip_used: number
  public_ip_used: number
  vcpu_used: number
  ram_used: number
  disk_size_used: number
  creation_time: string
  enable: boolean
  service: {
    id: string
    name: string
    name_en: string
  }
}

export interface FlavorInterface {
  id: string
  flavor_id: string
  vcpus: number
  ram: number
  disk: number
  service_id: string
}

export interface NetworkInterface {
  // 来自network接口
  id: string
  name: string
  public: boolean
  segment: string
  // 根据查询时所填的serviceId补充
  service: string
  localId: string

  // new
  serviceId: string
}

export interface ImageInterface {
  // 来自image接口
  id: string // 原始id, local
  name: string
  release: string // windows,      Windows Server    ubuntu,    fedora,   centos
  version: string // max 64字节  win10,win11  2021,2019  2204,2004  36,37  7,8,9
  architecture: string //  i386,x64,arm64
  system_type: string // windows/linux
  creation_time: string
  desc: string // max 128字节
  default_user: string
  default_password: string
  min_sys_disk_gb: number
  min_ram_mb: number

  // 根据查询时所填的serviceId补充
  service: string
  localId: string

  // new
  serviceId: string
}

export interface VpnInterface {
  username: string
  password: string
  active: boolean
  create_time: string
  modified_time: string
  // vpn接口中无id信息，其id与所在service_id相同
  id: string
}

// export interface QuotaInterface {
//   id: string
//   tag: { // 提出去单做table无用，暂时保留，不拍平
//     value: number
//     display: string
//   },
//   user: { // 提出去单做table无用，暂时保留，不拍平
//     id: string
//     username: string
//   },
//   service: string
//   private_ip_total: number
//   private_ip_used: number
//   public_ip_total: number
//   public_ip_used: number
//   vcpu_total: number
//   vcpu_used: number
//   ram_total: number
//   ram_used: number
//   disk_size_total: number
//   disk_size_used: number
//   expiration_time: never // null 待细化
//   deleted: boolean
//   display: string
//   duration_days: number
//   classification: 'vo' | 'personal' // 配额类型，二选一
//
//   // 来自vo/quota接口的补充
//   vo_id?: string // groupId
//
//   // 来自server接口补充
//   servers?: string[] // serverId
//
//   // 以下为根据上述字段自行判断填充
//   expired: boolean
//   exhausted: boolean
// }

export interface ServerInterface {
  // 来自server接口
  id: string
  name: string
  vcpus: number
  ram: number
  ipv4: string
  public_ip: boolean
  image: string
  creation_time: string
  expiration_time: string
  remarks: string
  classification: string
  image_id: string
  image_desc: string
  default_user: string
  default_password: string
  pay_type: 'prepaid' | 'postpaid'
  endpoint_url: string
  service: {
    id: string
    name: string
    name_en: string
    service_type: string
  }
  center_quota: number
  vo_id: string | null
  user: {
    id: string
    username: string
  }
  lock: 'free' | 'lock-delete' | 'lock-operation'
  attached_disks?:
    {
      id: string
      size: 100,
      creation_time: string
      remarks: string
      expiration_time: string
      pay_type: string
      mountpoint: string
      attached_time: string
      detached_time: string
    }[]

  // 来自vnc接口
  vnc?: string
  // 来自status接口，类型为number
  status?: number
}

export interface OrderResourceInterface {
  id: string
  order_id: string
  resource_type: 'vm' | 'disk'
  instance_id: string
  instance_status: string // to specify
  delivered_time: string
}

export interface OrderVmInterface {
  vm_cpu: number
  vm_ram: number
  vm_systemdisk_size: number
  vm_public_ip: true,
  vm_image_id: string
  vm_image_name: string
  vm_network_id: number
  vm_network_name: string
  vm_azone_id: string
  vm_azone_name: string
  vm_flavor_id: string
}

export interface OrderDiskInterface {
  disk_size: number // GB
  disk_azone_id: string
  disk_azone_name: string
}

export interface OrderInterface {
  id: string
  order_type: string // to specify
  status: string // to specify
  total_amount: string
  pay_amount: string
  payable_amount: string
  balance_amount: string
  coupon_amount: string
  service_id: string
  service_name: string
  resource_type: 'vm' | 'disk'
  instance_config: OrderVmInterface | OrderDiskInterface
  period: number
  payment_time: string
  pay_type: 'prepaid' | 'postpaid'
  creation_time: string
  user_id: string
  username: string
  vo_id: string
  vo_name: string
  owner_type: string // to specify
  cancelled_time: string
  app_service_id: string
  resources: OrderResourceInterface[]
}

export interface CouponInterface {
  id: string
  face_value: string
  creation_time: string
  effective_time: string
  expiration_time: string
  balance: string
  status: 'wait' | 'available' | 'cancelled' | 'deleted'
  granted_time?: string
  owner_type?: 'user' | 'vo'
  app_service?: {
    id: string
    name: string
    name_en: string
    category: 'vms-server' | 'vms-object' | 'high-cloud' | 'hpc' | 'other'
    service_id?: string
  }
  user?: {
    id: string
    username: string
  }
  vo?: {
    id: string
    name: string
  }
  activity?: {
    id: string
    name: string
  }

  // 暂时未用的字段 自行查询serviceTable获得app_service_id -> service_id
  service_id?: string
}

// 配额申请接口
// export interface QuotaApplicationInterface {
//   // 以下字段出现在列举接口的响应里
//   private_ip: number
//   public_ip: number
//   vcpu: number
//   ram: number
//   disk_size: number
//   duration_days: number
//   company: string
//   contact: string
//   purpose: string
//   id: string
//   creation_time: string
//   status: string
//   service: string
//   deleted: boolean
//   classification: 'personal' | 'vo'
//   result_desc: string // 拒绝理由
//
//   // 来自补充
//   vo_id?: string
//
//   // 以下字段出现在详情接口的响应里
//   user?: {
//     id: string
//     name: string
//   }
//   approve_user?: null | {
//     id: string
//     name: string
//   }
//   approve_time?: null | string
//   vo?: null | {
//     id: string
//     name: string
//     company: string
//     description: string
//     creation_time: string
//     owner: {
//       id: string
//       username: string
//     },
//     status: string
//   }
// }

// 赠送配额活动
// export interface QuotaActivity {
//   'id': string
//   'got_count': number
//   'service': string // service id
//   'user': string // user id
//   'creation_time': string
//   'name': string
//   'name_en': string
//   'start_time': string
//   'end_time': string
//   'count': number
//   'times_per_user': number
//   'status': string
//   'tag': string
//   'cpus': number
//   'private_ip': number
//   'public_ip': number
//   'ram': number
//   'disk_size': number
//   'expiration_time': string
//   'duration_days': number
// }

/* table的类型 */

// 整体加载表
export interface totalTable {
  status: 'init' | 'loading' | 'total' | 'error'
}

// 累计加载表
export interface partTable {
  status: 'init' | 'loading' | 'part' | 'error'
}

// id
export interface idTable<T> {
  allIds: string[]
  byId: Record<string, T>
}

// localId
export interface localIdTable<T> {
  allLocalIds: string[]
  byLocalId: Record<string, T>
}

/* 表的具体类型 */

// 用户相关的全部组table
export interface GroupTableInterface extends totalTable, idTable<GroupInterface> {
}

// 组配额table: groupId -> groupMember
export interface GroupMemberTableInterface extends totalTable, idTable<GroupMemberInterface> {
}

// // 组的余额table: balanceId -> balance
// export interface GroupBalanceTableInterface extends totalTable, idTable<GroupBalanceInterface> {
// }

// 组订单table
export interface GroupOrderTableInterface extends partTable, idTable<OrderInterface> {
}

// 联邦层级datacenter
export interface DataCenterTableInterface extends totalTable, idTable<DataCenterInterface> {
}

// 联邦层级service
export interface ServiceTableInterface extends totalTable, idTable<ServiceInterface> {
}

// 全部service的 自主资源配置(autonomous resource allocation)，服务各自管理
export interface ServiceAllocationTableInterface extends totalTable, idTable<AllocationInterface> {
}

// 全部service的 联邦资源配置(federation resource allocation)，联邦统一管理
export interface FedAllocationTableInterface extends totalTable, idTable<AllocationInterface> {
}

// 管理员有权限审批的quota申请
// export interface AdminQuotaApplicationTableInterface extends totalTable, idTable<QuotaApplicationInterface> {
// }

// // 服务管理员能看到的，当前服务下创建的所有云主机
// export interface AdminServerTableInterface extends totalTable, idTable<ServerInterface> {
// }

// // 所有人一样的云主机配置选项
// export interface FedFlavorTableInterface extends totalTable, idTable<FlavorInterface> {
// }

// 联邦配额赠送活动
// export interface FedQuotaActivityTableInterface extends totalTable, idTable<QuotaActivity> {
// }

// // 服务内通行的网络配置
// export interface ServiceNetworkTableInterface extends totalTable, localIdTable<NetworkInterface> {
// }

// // 服务内通行的镜像配置
// export interface ServiceImageTableInterface extends totalTable, localIdTable<ImageInterface> {
// }

// 用户全部的Vpn -> 依赖fed/serviceTable
export interface UserVpnTableInterface extends totalTable, idTable<VpnInterface> {
// 原始数据没有id，自加id，与serviceId同。service不一定有vpn
}

// 个人云主机配额申请
// export interface PersonalQuotaApplicationTableInterface extends totalTable, idTable<QuotaApplicationInterface> {
// }

// 个人云主机配额
// export interface PersonalQuotaTableInterface extends totalTable, idTable<QuotaInterface> {
// }

// 个人云主机
export interface PersonalServerTableInterface extends totalTable, idTable<ServerInterface> {
}

// 个人订单
export interface PersonalOrderTableInterface extends totalTable, idTable<OrderInterface> {
}

// 项目组云主机配额申请
// export interface GroupQuotaApplicationTableInterface extends totalTable, idTable<QuotaApplicationInterface> {
// }

// 项目组云主机配额
// export interface GroupQuotaTableInterface extends totalTable, idTable<QuotaInterface> {
// }

// 项目组云主机
export interface GroupServerTableInterface extends partTable, idTable<ServerInterface> {
}

// 个人coupon
export interface PersonalCouponTableInterface extends totalTable, idTable<CouponInterface> {
}

// 项目组coupon
export interface GroupCouponTableInterface extends totalTable, idTable<CouponInterface> {
}

export const useStore = defineStore('server', {
  state: () => {
    return {
      items: {
        // 实时记录用户所在app局部路径位置
        // 例如'/my/server/personal/list' -> ['personal', 'list'], 供二级三级导航栏在刷新时保持选择使用
        currentPath: [] as string[],
        // 账户在server服务内的身份
        fedRole: '' as 'ordinary' | 'federal-admin', // 联邦层级：普通用户还是管理员
        adminServiceIds: [] as string[], // 有vms管理员权限的接入服务id
        // 个人账户余额
        personalBalance: {} as PersonalBalanceInterface
      },
      tables: {
        /* 整体加载表：一旦加载则全部加载 */
        groupTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as GroupTableInterface,
        groupMemberTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as GroupMemberTableInterface,
        // groupBalanceTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as GroupBalanceTableInterface,
        groupCouponTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as GroupCouponTableInterface,
        dataCenterTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as DataCenterTableInterface,
        serviceTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as ServiceTableInterface,
        serviceAllocationTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as ServiceAllocationTableInterface,
        fedAllocationTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as FedAllocationTableInterface,
        // adminServerTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as AdminServerTableInterface,
        // fedFlavorTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as FedFlavorTableInterface,
        // serviceNetworkTable: {
        //   byLocalId: {},
        //   allLocalIds: [],
        //   status: 'init'
        // } as ServiceNetworkTableInterface,
        // serviceImageTable: {
        //   byLocalId: {},
        //   allLocalIds: [],
        //   status: 'init'
        // } as ServiceImageTableInterface,
        userVpnTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as UserVpnTableInterface,
        personalServerTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as PersonalServerTableInterface,
        personalOrderTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as PersonalOrderTableInterface,
        personalCouponTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as PersonalCouponTableInterface,
        /* 整体加载表：一旦加载则全部加载 */

        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */
        groupServerTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as GroupServerTableInterface,
        groupOrderTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as GroupOrderTableInterface
        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */

      }
    }
  },
  getters: {
    getGroupOptions (state): { value: string; label: string; }[] {
      let groupOptions = []
      for (const group of Object.values(state.tables.groupTable.byId)) {
        groupOptions.push(
          {
            value: group.id,
            label: group.name,
            labelEn: group.name
          }
        )
      }
      // 排序
      groupOptions = groupOptions.sort((a, b) => -a.label.localeCompare(b.label, 'zh-CN'))
      groupOptions.unshift({
        value: '0',
        label: '全部项目组',
        labelEn: 'All Groups'
      })
      return groupOptions
    },
    getGroupOptionsWithoutAll (state): { value: string; label: string; labelEn: string; }[] {
      let groupOptions = []
      for (const group of Object.values(state.tables.groupTable.byId)) {
        groupOptions.push(
          {
            value: group.id,
            label: group.name,
            labelEn: group.name
          }
        )
      }
      // 排序
      groupOptions = groupOptions.sort((a, b) => -a.label.localeCompare(b.label, 'zh-CN'))
      return groupOptions
    },
    getGroupOptionsByMyRole: (state) => (roles: string[]): { value: string; label: string; }[] => {
      let groupOptions = []
      for (const group of Object.values(state.tables.groupTable.byId)) {
        if (roles.includes(group.myRole)) {
          groupOptions.push(
            {
              value: group.id,
              label: group.name,
              labelEn: group.name
            }
          )
        }
      }
      // 排序
      groupOptions = groupOptions.sort((a, b) => -a.label.localeCompare(b.label, 'zh-CN'))
      groupOptions.unshift({
        value: '0',
        label: '全部项目组',
        labelEn: 'All Groups'
      })
      return groupOptions
    },
    getGroupsByFilter: (state) => (filter: string): GroupInterface[] => {
      // 排序函数，按照组创建时间降序排列
      const sortFn = (a: GroupInterface, b: GroupInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
      if (filter === 'all') {
        return Object.values(state.tables.groupTable.byId).sort(sortFn)
      } else {
        const groups: GroupInterface[] = []
        for (const group of Object.values(state.tables.groupTable.byId)) {
          if (filter === 'owner' && group.myRole === 'owner') {
            groups.push(group)
          } else if (filter === 'member' && group.myRole === 'member') {
            groups.push(group)
          } else if (filter === 'leader' && group.myRole === 'leader') {
            groups.push(group)
          }
        }
        return groups.sort(sortFn)
      }
    },
    getGroupMembersByGroupId: (state) => (groupId: string): SingleMemberInterface[] => {
      // 排序函数，按照组创建时间降序排列
      const sortFn = (a: SingleMemberInterface, b: SingleMemberInterface) => new Date(b.join_time).getTime() - new Date(a.join_time).getTime()
      // sort方法修改数组本身，所以需要建立新数组再排序
      const newArr: SingleMemberInterface[] = []
      state.tables.groupMemberTable.byId[groupId].members.forEach((item) => {
        newArr.unshift(item)
      })
      // 插入组长
      const groupOwner = state.tables.groupMemberTable.byId[groupId].owner
      const groupCreateTime = state.tables.groupTable.byId[groupId].creation_time
      newArr.sort(sortFn).unshift({
        id: groupOwner.id,
        user: groupOwner,
        role: 'owner',
        join_time: groupCreateTime,
        inviter: ''
      })
      return newArr
    },
    // 根据myRole返回group数组
    getGroupsByMyRole: (state) => (roles: string[]): GroupInterface[] => {
      // 排序函数，按照组创建时间降序排列
      const sortFn = (a: GroupInterface, b: GroupInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
      const groups: GroupInterface[] = []
      roles.forEach((role) => {
        for (const group of Object.values(state.tables.groupTable.byId)) {
          if (group.myRole === role) {
            groups.push(group)
          }
        }
      })
      return groups.sort(sortFn)
    },
    // 项目组详情用，根据组员加入时间给组员排序
    getMemberByJoinTime: (state) => (groupId: string): SingleMemberInterface[] => {
      const sortFn = (a: SingleMemberInterface, b: SingleMemberInterface) => new Date(a.join_time).getTime() - new Date(b.join_time).getTime()
      const newArr: SingleMemberInterface[] = []
      state.tables.groupMemberTable.byId[groupId]?.members.forEach((item) => {
        newArr.unshift(item)
      })
      return newArr.sort(sortFn)
    },
    // 图表
    getServiceCpuPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.serviceAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        if (i18n.global.locale === 'zh') {
          dataObj.name = state.tables.serviceAllocationTable.byId[item]?.service.name
        } else {
          dataObj.name = state.tables.serviceAllocationTable.byId[item]?.service.name_en
        }
        dataObj.value = state.tables.serviceAllocationTable.byId[item]?.vcpu_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getServiceRamPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.serviceAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        if (i18n.global.locale === 'zh') {
          dataObj.name = state.tables.serviceAllocationTable.byId[item]?.service.name
        } else {
          dataObj.name = state.tables.serviceAllocationTable.byId[item]?.service.name_en
        }
        dataObj.value = state.tables.serviceAllocationTable.byId[item]?.ram_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getServiceDiskPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.serviceAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        if (i18n.global.locale === 'zh') {
          dataObj.name = state.tables.serviceAllocationTable.byId[item]?.service.name
        } else {
          dataObj.name = state.tables.serviceAllocationTable.byId[item]?.service.name_en
        }
        dataObj.value = state.tables.serviceAllocationTable.byId[item]?.disk_size_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getFedCpuPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.fedAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        if (i18n.global.locale === 'zh') {
          dataObj.name = state.tables.fedAllocationTable.byId[item]?.service.name
        } else {
          dataObj.name = state.tables.fedAllocationTable.byId[item]?.service.name_en
        }
        dataObj.value = state.tables.fedAllocationTable.byId[item]?.vcpu_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getFedRamPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.fedAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        if (i18n.global.locale === 'zh') {
          dataObj.name = state.tables.fedAllocationTable.byId[item]?.service.name
        } else {
          dataObj.name = state.tables.fedAllocationTable.byId[item]?.service.name_en
        }
        dataObj.value = state.tables.fedAllocationTable.byId[item]?.ram_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getFedDiskPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.fedAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        if (i18n.global.locale === 'zh') {
          dataObj.name = state.tables.fedAllocationTable.byId[item]?.service.name
        } else {
          dataObj.name = state.tables.fedAllocationTable.byId[item]?.service.name_en
        }
        dataObj.value = state.tables.fedAllocationTable.byId[item]?.disk_size_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getMechanismTree (state): Record<string, string | number | object>[] {
      const treeData = []

      for (const item of state.tables.dataCenterTable.allIds) {
        const treeObj: Record<string, string | number | object> = {}
        if (i18n.global.locale === 'zh') {
          treeObj.label = state.tables.dataCenterTable.byId[item]?.name
        } else {
          treeObj.label = state.tables.dataCenterTable.byId[item]?.name_en
        }
        treeObj.id = state.tables.dataCenterTable.byId[item]?.id
        treeObj.sort_weight = state.tables.dataCenterTable.byId[item]?.sort_weight as number
        treeObj.header = 'datacenter'
        const dataArr = []

        for (const childItem of state.tables.dataCenterTable.byId[item]?.services.filter(serviceId => state.tables.serviceTable.byId[serviceId]?.status === 'enable')) {
          const dataObj: Record<string, string | boolean | number> = {}
          if (i18n.global.locale === 'zh') {
            dataObj.label = state.tables.serviceTable.byId[childItem]?.name
          } else {
            dataObj.label = state.tables.serviceTable.byId[childItem]?.name_en
          }
          dataObj.id = state.tables.serviceTable.byId[childItem]?.id
          dataObj.sort_weight = state.tables.serviceTable.byId[childItem]?.sort_weight as number
          dataObj.noTick = true
          dataArr.push(dataObj)
        }

        // @ts-ignore
        dataArr.sort((a, b) => a.sort_weight - b.sort_weight)

        treeObj.children = dataArr
        treeData.push(treeObj)
      }

      // @ts-ignore
      treeData.sort((a, b) => a.sort_weight - b.sort_weight)

      return treeData
    },
    // getServices (state): { value: string; label: string; }[] {
    //   const serviceOptions = []
    //   for (const service of Object.values(state.tables.serviceTable.byId)) {
    //     serviceOptions.push(
    //       {
    //         value: service.id,
    //         label: service.name
    //       }
    //     )
    //   }
    //   serviceOptions.unshift({
    //     value: '',
    //     label: i18n.global.locale === 'zh' ? '全部服务单元' : 'All Groups'
    //   })
    //   return serviceOptions
    // },
    /* join federation使用 */
    getDataCenterOptions (state): { value: string; label: string; }[] {
      const dataCenterOptions = []
      for (const dataCenter of Object.values(state.tables.dataCenterTable.byId)) {
        dataCenterOptions.push(
          {
            value: dataCenter.id,
            label: dataCenter.name
          }
        )
      }
      return dataCenterOptions
    },
    /* join federation使用 */
    getDefaultTicked (state): string[] {
      const defaultTicked = []
      for (const dataCenter of Object.values(state.tables.dataCenterTable.byId)) {
        if (i18n.global.locale === 'zh') {
          defaultTicked.push(dataCenter.name)
        } else {
          defaultTicked.push(dataCenter.name_en)
        }
      }
      return defaultTicked
    },
    // 根据用户选择的serviceId和status来返回application数组
    // getAdminApplicationsByServiceIdByStatus: (state) => (serviceId: string, status: string): QuotaApplicationInterface[] => {
    //   // 先筛选serviceId。serviceId=''时全部返回
    //   const applicationsByServiceId = Object.values(state.tables.adminQuotaApplicationTable.byId).filter(application => serviceId ? application.service === serviceId : true)
    //   // 再筛选status。 status=''时全部返回
    //   const applications = applicationsByServiceId.filter(application => status ? status === application.status : true)
    //   // 排序函数，根据申请时间降序排列
    //   const sortFn = (a: QuotaApplicationInterface, b: QuotaApplicationInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
    //   return applications.sort(sortFn)
    // },
    getServiceOptions (state) {
      const services = state.items.adminServiceIds.map(serviceId => {
        const currentService = state.tables.serviceTable.byId[serviceId]
        return {
          value: currentService?.id,
          label: currentService?.name,
          labelEn: currentService?.name_en
        }
      })
      services.unshift({
        value: '0',
        label: '全部服务单元',
        labelEn: 'All Service Units'
      })
      return services
    },
    // 根据管理员权限，返回serviceOption：1.联邦管理员获取全部服务单元；2.服务单元管理员获取全部管理权限对应服务单元
    getServiceOptionsByRole: state => (isFedAdmin: boolean) => {
      const services = (isFedAdmin ? state.tables.serviceTable.allIds : state.items.adminServiceIds).map(serviceId => {
        const currentService = state.tables.serviceTable.byId[serviceId]
        return {
          value: currentService?.id,
          label: currentService?.name,
          labelEn: currentService?.name_en
        }
      })
      services.unshift({
        value: 'all',
        label: '全部服务单元',
        labelEn: 'All Service Units'
      })
      return services
    },
    // getAdminServers (state): ServerInterface[] {
    //   // 排序函数，根据申请时间降序排列
    //   const sortFn = (a: ServerInterface, b: ServerInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
    //   const rows: ServerInterface[] = []
    //   for (const application of Object.values(state.tables.adminServerTable.byId)) {
    //     rows.push(application)
    //   }
    //   return rows.sort(sortFn)
    // },
    // 根据用户选择的filter来返回application数组
    // getPersonalApplicationsByFilter: (state) => (filter: string): QuotaApplicationInterface[] => {
    //   // 排序函数，根据申请时间降序排列
    //   const sortFn = (a: QuotaApplicationInterface, b: QuotaApplicationInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
    //
    //   if (filter === '0') {
    //     return Object.values(state.tables.personalQuotaApplicationTable.byId).sort(sortFn)
    //   } else {
    //     const rows: QuotaApplicationInterface[] = []
    //     for (const application of Object.values(state.tables.personalQuotaApplicationTable.byId)) {
    //       if (application.status === filter) {
    //         rows.push(application)
    //       }
    //     }
    //     return rows.sort(sortFn)
    //   }
    // },
    // 根据用户选择的filter来返回application数组
    // getGroupApplicationsByFilter: (state) => (filter: string): QuotaApplicationInterface[] => {
    //   // 排序函数，根据申请时间降序排列
    //   const sortFn = (a: QuotaApplicationInterface, b: QuotaApplicationInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
    //
    //   if (filter === '0') {
    //     return Object.values(state.tables.groupQuotaApplicationTable.byId).sort(sortFn)
    //   } else {
    //     const rows: QuotaApplicationInterface[] = []
    //     for (const application of Object.values(state.tables.groupQuotaApplicationTable.byId)) {
    //       if (application.status === filter) {
    //         rows.push(application)
    //       }
    //     }
    //     return rows.sort(sortFn)
    //   }
    // },

    /* server deploy card使用 */
    // getPublicNetworksByServiceId: (state) => (serviceId: string): NetworkInterface[] => {
    //   return Object.values(state.tables.serviceNetworkTable.byLocalId).filter(network => network.public && network.service === serviceId)
    // },
    // getPrivateNetworksByServicedId: (state) => (serviceId: string): NetworkInterface[] => {
    //   return Object.values(state.tables.serviceNetworkTable.byLocalId).filter(network => !network.public && network.service === serviceId)
    // },
    // getImagesByServiceId: (state) => (serviceId: string): ImageInterface[] => {
    //   return Object.values(state.tables.serviceImageTable.byLocalId).filter(image => image.service === serviceId).sort((a, b) => a.name.localeCompare(b.name, 'en'))
    // },
    // 只返回未删除guota
    // getPersonalValidQuotasByServiceId: (state) => (serviceId: string): QuotaInterface[] => {
    //   // expirtation_time字段为null时为长期配额，应视为最大时间
    //   const sortFn = (a: QuotaInterface, b: QuotaInterface) => new Date(b.expiration_time || 9999999999999).getTime() - new Date(a.expiration_time || 9999999999999).getTime()
    //   // return Object.values(state.tables.userQuotaTable.byId).filter(quota => !quota.deleted && quota.service === serviceId && !quota.expired && !quota.exhausted).sort(sortFn)
    //   return Object.values(state.tables.personalQuotaTable.byId).filter(quota => quota.service === serviceId && !quota.expired && !quota.exhausted).sort(sortFn)
    // },
    // getPersonalInvalidQuotasByServiceId: (state) => (serviceId: string): QuotaInterface[] => {
    //   // expirtation_time字段为null时为长期配额，应视为最大时间
    //   const sortFn = (a: QuotaInterface, b: QuotaInterface) => new Date(b.expiration_time || 9999999999999).getTime() - new Date(a.expiration_time || 9999999999999).getTime()
    //   // return Object.values(state.tables.userQuotaTable.byId).filter(quota => !quota.deleted && quota.service === serviceId && (quota.expired || quota.exhausted)).sort(sortFn)
    //   return Object.values(state.tables.personalQuotaTable.byId).filter(quota => quota.service === serviceId && (quota.expired || quota.exhausted)).sort(sortFn)
    // },
    // getGroupValidQuotasByServiceId: (state) => (serviceId: string, groupId?: string): QuotaInterface[] => {
    //   // expirtation_time字段为null时为长期配额，应视为最大时间
    //   const sortFn = (a: QuotaInterface, b: QuotaInterface) => new Date(b.expiration_time || 9999999999999).getTime() - new Date(a.expiration_time || 9999999999999).getTime()
    //   // return Object.values(state.tables.groupQuotaTable.byId).filter(quota => !quota.deleted && quota.service === serviceId && quota.vo_id === groupId && !quota.expired && !quota.exhausted).sort(sortFn)
    //   return Object.values(state.tables.groupQuotaTable.byId).filter(quota => quota.service === serviceId && quota.vo_id === groupId && !quota.expired && !quota.exhausted).sort(sortFn)
    // },
    // getGroupInvalidQuotasByServiceId: (state) => (serviceId: string, groupId?: string): QuotaInterface[] => {
    //   // expirtation_time字段为null时为长期配额，应视为最大时间
    //   const sortFn = (a: QuotaInterface, b: QuotaInterface) => new Date(b.expiration_time || 9999999999999).getTime() - new Date(a.expiration_time || 9999999999999).getTime()
    //   // return Object.values(state.tables.groupQuotaTable.byId).filter(quota => !quota.deleted && quota.service === serviceId && quota.vo_id === groupId && (quota.expired || quota.exhausted)).sort(sortFn)
    //   return Object.values(state.tables.groupQuotaTable.byId).filter(quota => quota.service === serviceId && quota.vo_id === groupId && (quota.expired || quota.exhausted)).sort(sortFn)
    // },
    /* server deploy card使用 */

    getPersonalServers (state): ServerInterface[] {
      const rows: ServerInterface[] = []
      for (const server of Object.values(state.tables.personalServerTable.byId)) {
        rows.push(server)
      }
      return rows
    },
    // https://github.com/vuejs/vuex/issues/456
    // 根据用户选择的serviceId来返回server数组
    getPersonalServersByServiceId: (state) => (serviceId: string): ServerInterface[] => {
      // 排序函数，根据云主机创建时间降序排列
      const sortFn = (a: ServerInterface, b: ServerInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()

      if (serviceId === '0') {
        return Object.values(state.tables.personalServerTable.byId).sort(sortFn)
      } else {
        const rows: ServerInterface[] = []
        for (const server of Object.values(state.tables.personalServerTable.byId)) {
          if (server.service.id === serviceId) {
            rows.push(server)
          }
        }
        return rows.sort(sortFn)
      }
    },
    // 根据用户选择的serviceId来返回order数组
    getPersonalOrdersByServiceId: (state) => (serviceId: string): OrderInterface[] => {
      // 排序函数，根据order创建时间降序排列
      const sortFn = (a: OrderInterface, b: OrderInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()

      if (serviceId === '0') {
        return Object.values(state.tables.personalOrderTable.byId).sort(sortFn)
      } else {
        const rows: OrderInterface[] = []
        for (const order of Object.values(state.tables.personalOrderTable.byId)) {
          if (order.service_id === serviceId) {
            rows.push(order)
          }
        }
        return rows.sort(sortFn)
      }
    },
    // 根据用户选择的serviceId来返回server数组
    getPersonalCouponsByServiceId: (state) => (serviceId: string): CouponInterface[] => {
      // 把serviceId映射为app_service_id
      const appServiceId = state.tables.serviceTable.byId[serviceId]?.pay_app_service_id

      // 排序函数，根据coupon创建时间降序排列
      const sortFn = (a: CouponInterface, b: CouponInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()

      if (serviceId === '0') {
        return Object.values(state.tables.personalCouponTable.byId).sort(sortFn)
      } else {
        const rows: CouponInterface[] = []
        for (const coupon of Object.values(state.tables.personalCouponTable.byId)) {
          if (coupon?.app_service?.id === appServiceId) {
            rows.push(coupon)
          }
        }
        return rows.sort(sortFn)
      }
    },
    /* quotaList使用 */
    // 根据用户选择的filter来返回application数组
    // getPersonalQuotasByFilter: (state) => (filter: string): QuotaInterface[] => {
    //   // expirtation_time字段为null时为长期配额，应视为最大时间
    //   const sortFn = (a: QuotaInterface, b: QuotaInterface) => new Date(b.expiration_time || 9999999999999).getTime() - new Date(a.expiration_time || 9999999999999).getTime()
    //
    //   if (filter === '0') {
    //     // 返回quota对象的数组，并以过期时间降序排序
    //     return Object.values(state.tables.personalQuotaTable.byId).sort(sortFn)
    //   } else {
    //     const rows: QuotaInterface[] = []
    //     for (const quota of Object.values(state.tables.personalQuotaTable.byId)) {
    //       if (filter === 'valid' && !quota.exhausted && !quota.expired) { // 可用的quota
    //         rows.push(quota)
    //       } else if (filter === 'invalid' && (quota.exhausted || quota.expired)) { // 不可用的quota
    //         rows.push(quota)
    //       } else if (filter === null && quota.expiration_time === null) { // 长期的quota
    //         rows.push(quota)
    //       } else if (filter === 'notExpired' && !quota.expired) { // 未过期的quota
    //         rows.push(quota)
    //       } else if (filter === 'expired' && quota.expired) { // 过期的quota
    //         rows.push(quota)
    //       } else if (filter === 'notExhausted' && !quota.exhausted) { // 未用尽的quota
    //         rows.push(quota)
    //       } else if (filter === 'exhausted' && quota.exhausted) { // 用尽的quota
    //         rows.push(quota)
    //       }
    //     }
    //     return rows.sort(sortFn)
    //   }
    // },
    /* quotaList使用 */

    // getGroupQuotaApplicationsByGroupId: (state) => (groupId: string): QuotaApplicationInterface[] => {
    //   const sortFn = (a: QuotaApplicationInterface, b: QuotaApplicationInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
    //   if (groupId === '0') {
    //     return Object.values(state.tables.groupQuotaApplicationTable.byId).sort(sortFn)
    //   } else {
    //     const applications: QuotaApplicationInterface[] = []
    //     for (const server of Object.values(state.tables.groupQuotaApplicationTable.byId)) {
    //       if (groupId === server.vo_id) {
    //         applications.push(server)
    //       }
    //     }
    //     return applications.sort(sortFn)
    //   }
    // },
    getGroupServersByGroupId: (state) => (groupId: string): ServerInterface[] => {
      const sortFn = (a: ServerInterface, b: ServerInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
      if (groupId === '0') {
        return Object.values(state.tables.groupServerTable.byId).sort(sortFn)
      } else {
        const servers: ServerInterface[] = []
        for (const server of Object.values(state.tables.groupServerTable.byId)) {
          if (groupId === server.vo_id) {
            servers.push(server)
          }
        }
        return servers.sort(sortFn)
      }
    },
    getGroupOrdersByGroupId: (state) => (groupId: string): OrderInterface[] => {
      const sortFn = (a: OrderInterface, b: OrderInterface) => new Date(b?.creation_time).getTime() - new Date(a?.creation_time).getTime()
      if (groupId === '0') {
        return Object.values(state.tables.groupOrderTable.byId).sort(sortFn)
      } else {
        const orders: OrderInterface[] = []
        for (const order of Object.values(state.tables.groupOrderTable.byId)) {
          if (groupId === order.vo_id) {
            orders.push(order)
          }
        }
        return orders.sort(sortFn)
      }
    },
    getGroupCouponsByGroupId: (state) => (groupId: string): CouponInterface[] => {
      const sortFn = (a: CouponInterface, b: CouponInterface) => new Date(b.effective_time).getTime() - new Date(a.effective_time).getTime()
      if (groupId === '0') {
        return Object.values(state.tables.groupCouponTable.byId).sort(sortFn)
      } else {
        const coupons: CouponInterface[] = []
        for (const coupon of Object.values(state.tables.groupCouponTable.byId)) {
          if (groupId === coupon?.vo?.id) {
            coupons.push(coupon)
          }
        }
        return coupons.sort(sortFn)
      }
    },
    // 有四种状态：all -> 全部, valid -> 可用， expired -> 过期, exhausted -> 用尽
    // getGroupQuotasByGroupIdByStatus: (state) => (groupId: string, status: string): QuotaInterface[] => {
    //   const sortFn = (a: QuotaInterface, b: QuotaInterface) => new Date(b.expiration_time).getTime() - new Date(a.expiration_time).getTime()
    //   const quotasByGroupId: QuotaInterface[] = []
    //   for (const quota of Object.values(state.tables.groupQuotaTable.byId)) {
    //     if (quota.vo_id === groupId) {
    //       quotasByGroupId.push(quota)
    //     }
    //   }
    //   if (status === 'all') {
    //     return quotasByGroupId.sort(sortFn)
    //   } else {
    //     const quotasByStatus: QuotaInterface[] = []
    //     for (const quota of quotasByGroupId) {
    //       if (status === 'valid' && !quota.expired && !quota.exhausted) {
    //         quotasByStatus.push(quota)
    //       } else if (status === 'expired' && quota.expired) {
    //         quotasByStatus.push(quota)
    //       } else if (status === 'exhausted' && quota.exhausted) {
    //         quotasByStatus.push(quota)
    //       }
    //     }
    //     return quotasByStatus.sort(sortFn)
    //   }
    // },
    // getGroupQuotasByFilter: (state) => (filter: string): QuotaInterface[] => {
    //   // expiration_time字段为null时为长期配额，应视为最大时间
    //   const sortFn = (a: QuotaInterface, b: QuotaInterface) => new Date(b.expiration_time || 9999999999999).getTime() - new Date(a.expiration_time || 9999999999999).getTime()
    //
    //   if (filter === '0') {
    //     // 返回quota对象的数组，并以过期时间降序排序
    //     return Object.values(state.tables.groupQuotaTable.byId).sort(sortFn)
    //   } else {
    //     const rows: QuotaInterface[] = []
    //     for (const quota of Object.values(state.tables.groupQuotaTable.byId)) {
    //       if (filter === 'valid' && !quota.exhausted && !quota.expired) { // 可用的quota
    //         rows.push(quota)
    //       } else if (filter === 'invalid' && (quota.exhausted || quota.expired)) { // 不可用的quota
    //         rows.push(quota)
    //       }
    //     }
    //     return rows.sort(sortFn)
    //   }
    // },
    // // 个人有quota(全部quota,包括过期和不可用)和server的serviceId
    // getPersonalAvailableServiceIds: (state): string[] => {
    //   let services = [] as string[]
    //   state.tables.personalServerTable.allIds.forEach((id) => services.unshift(state.tables.personalServerTable.byId[id].service.id))
    //   services = [...new Set(services)]
    //   return services
    // },

    // 全部services
    getAllServiceOptions (state): { value: string; label: string; }[] {
      /*       // 数据结构如下
            const serviceOptions = [
              {
                value: '0',
                label: '全部节点',
                labelEn: 'All Service Units'
              }
            ] */

      const serviceOptions = [
        {
          value: '0',
          label: '全部服务单元',
          labelEn: 'All Service Units'
        }
      ]

      for (const datacenterId of state.tables.dataCenterTable.allIds) {
        const serviceIds = state.tables.dataCenterTable.byId[datacenterId]?.services
        for (const serviceId of serviceIds) {
          const service = state.tables.serviceTable.byId[serviceId]
          if (service.status !== 'enable') {
            continue
          }
          serviceOptions.push({
            value: serviceId,
            label: service.name,
            labelEn: service.name_en
          })
        }
      }
      return serviceOptions
    }
    // // 获取个人有quota/server的vpn对象
    // getPersonalAvailableVpns (state): VpnInterface[] {
    //   // service.need_vpn才加入
    //   const serviceIds = this.getPersonalAvailableServiceIds.filter((serviceId: string) => state.tables.serviceTable.byId[serviceId]?.need_vpn) as string[]
    //   // serviceId -> service对象
    //   return serviceIds.map((serviceId) => state.tables.userVpnTable.byId[serviceId])
    // }
  },
  actions: {

    /* items */
    async loadAllItems () {
      void this.loadServerRole()
      void this.loadPersonalBalance()
    },
    // 当前用户角色权限
    async loadServerRole () {
      try {
        const respGetUserPermissionPolicy = await api.server.user.getUserPermissionPolicy()
        this.items.fedRole = respGetUserPermissionPolicy.data.role
        this.items.adminServiceIds = respGetUserPermissionPolicy.data.vms.service_ids
      } catch (exception) {
        // exceptionNotifier(exception)
      }
    },
    // 个人账户余额
    async loadPersonalBalance () {
      try {
        const respGetAccountBalanceUser = await api.server.account.getAccountBalanceUser()
        this.items.personalBalance = respGetAccountBalanceUser.data
      } catch (exception) {
        // exceptionNotifier(exception)
      }
    },
    /* items */

    /* load tables */

    // 全局的基础table，应尽早加载
    softLoadGlobalBasicTables () {
      if (this.tables.dataCenterTable.status === 'init') {
        this.loadDataCenterTable().then(() => {
          if (this.tables.serviceTable.status === 'init') {
            void this.loadServiceTable().then(() => {
              void this.loadUserVpnTable()
            })
          }
        })
      }
    },

    // 软加载group基础table，其它table例如groupServer, groupOrder, groupCoupon按具体页面需求加载
    softLoadGroupBasicTables () {
      if (this.tables.groupTable.status === 'init') {
        this.loadGroupTable().then(() => {
          // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
          if (this.tables.groupMemberTable.status === 'init') {
            void this.loadGroupMemberTable()
          }
        })
      }
    },

    // 硬加载group基础table
    hardLoadGroupBasicTables () {
      this.loadGroupTable().then(() => {
        // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
        void this.loadGroupMemberTable()
      })
    },

    // deploy tables
    loadDeployTables () {
      void this.loadPersonalCouponTable()

      this.loadGroupTable().then(() => {
        // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
        void this.loadGroupMemberTable().then(() => {
          for (const groupId of this.tables.groupTable.allIds) {
            void this.loadGroupCouponTable({ groupId })
          }
        })
      })
    },

    // 强制加载group相关table
    // forceLoadGroupModuleTable () {
    //   void this.loadGroupTable().then(() => {
    //     // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
    //     void this.loadGroupMemberTable()
    //     // .then(() => {
    //     // 注意：此表依赖groupTable中的myRole字段，而该字段是loadGroupMemberTableFromGroup副产品，所以产生依赖
    //     // void this.loadGroupQuotaApplicationTable()
    //     // void this.loadGroupOrderTable() // 如果要把orderId补充进server实例里，则应在groupServerTable加载后加载
    //     // void this.loadGroupBalanceTable()
    //     // void this.loadGroupCouponTable()
    //     // serverTable涉及到很多server status请求，应放在最后
    //     // void this.loadGroupServerTable()
    //     // })
    //   })
    // },

    // loadAllTables () {
    //   if (this.tables.dataCenterTable.status === 'init') {
    //     void this.loadDataCenterTable().then(() => { // 1. 基础依赖
    //       if (this.tables.serviceTable.status === 'init') {
    //         void this.loadServiceTable().then(() => { // 2. 基础依赖
    //           if (this.tables.serviceAllocationTable.status === 'init') {
    //             void this.loadServiceAllocationTable()
    //           }
    //
    //           if (this.tables.fedAllocationTable.status === 'init') {
    //             void this.loadFedAllocationTable()
    //           }
    //
    //           if (this.tables.userVpnTable.status === 'init') {
    //             void this.loadUserVpnTable()
    //           }
    //
    //           if (this.tables.serviceNetworkTable.status === 'init') {
    //             void this.loadServiceNetworkTable()
    //           }
    //           if (this.tables.serviceImageTable.status === 'init') {
    //             void this.loadServiceImageTable()
    //           }
    //
    //           if (this.tables.personalOrderTable.status === 'init') {
    //             void this.loadPersonalOrderTable() // 如果要把orderId补充进server实例里，则应在personalServerTable加载后加载
    //           }
    //
    //           if (this.tables.personalCouponTable.status === 'init') {
    //             void this.loadPersonalCouponTable() // 依赖serviceTable获取service_id字段
    //           }
    //
    //           // serverTable涉及到很多server status请求，应放在最后
    //           if (this.tables.personalServerTable.status === 'init') {
    //             void this.loadPersonalServerTable()
    //           }
    //         })
    //       }
    //     })
    //   }
    //
    // if (this.tables.fedFlavorTable.status === 'init') {
    //   void this.loadFedFlavorTable()
    // }

    // if (this.tables.personalQuotaTable.status === 'init') {
    //   void this.loadPersonalQuotaTable()
    // }
    // if (this.tables.personalQuotaApplicationTable.status === 'init') {
    //   void this.loadPersonalQuotaApplicationTable()
    // }
    // if (this.tables.fedQuotaActivityTable.status === 'init') {
    //   void this.loadFedQuotaActivityTable()
    // }

    // if (this.tables.groupTable.status === 'init') {
    //   void this.loadGroupTable().then(() => {
    //     // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
    //     if (this.tables.groupMemberTable.status === 'init') {
    //       void this.loadGroupMemberTable()
    // .then(() => {
    // 注意：此表依赖groupTable中的myRole字段，而该字段是loadGroupMemberTableFromGroup副产品，所以产生依赖
    // if (this.tables.groupQuotaApplicationTable.status === 'init') {
    //   void this.loadGroupQuotaApplicationTable()
    // }

    // if (this.tables.groupCouponTable.status === 'init') {
    // void this.loadGroupCouponTable()
    // }

    // if (this.tables.groupOrderTable.status === 'init') {
    //   void this.loadGroupOrderTable() // 如果要把orderId补充进server实例里，则应在groupServerTable加载后加载
    // }
    // if (this.tables.groupBalanceTable.status === 'init') {
    //   void this.loadGroupBalanceTable()
    // }

    // serverTable涉及到很多server status请求，应放在最后
    // if (this.tables.groupServerTable.status === 'init') {
    //   void this.loadGroupServerTable()
    // }
    // })
    //     }
    //   })
    // }

    // 以下表格为分页，在页面自身加载时load
    // if (!context.rootState.provider.tables.adminQuotaApplicationTable.isLoaded) {
    //   void context.dispatch('provider/loadAdminQuotaApplicationTable', null, { root: true })
    // }
    // },

    /* load tables */
    /* tables */
    // 加载groupTable
    async loadGroupTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.groupTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.groupTable.status = 'loading'
      try {
        // 发送请求
        const respGroup = await api.server.vo.getVo()
        // normalize
        const group = new schema.Entity('group')
        for (const data of respGroup.data.results) {
          // 添加role/balance/order字段
          const storeMain = useStoreMain()
          const currentId = storeMain.items.tokenDecoded.email
          const myRole = currentId === data.owner.username ? 'owner' : 'member'
          Object.assign(data, {
            myRole,
            balance: '',
            order: [],
            coupons: [],
            stats: {
              member_count: 0,
              server_count: 0,
              order_count: 0,
              coupon_count: 0,
              balance: '0'
            }
          })
          // normalize
          const normalizedData = normalize(data, group)
          // 保存table
          Object.assign(this.tables.groupTable.byId, normalizedData.entities.group)
          this.tables.groupTable.allIds.unshift(Object.keys(normalizedData.entities.group as Record<string, unknown>)[0])
          this.tables.groupTable.allIds = [...new Set(this.tables.groupTable.allIds)]
        }

        // 建立groupTable之后，分别更新每个group stats, 并发更新，无需await
        for (const groupId of this.tables.groupTable.allIds) {
          this.loadSingleGroupStats({
            groupId
          })
        }

        // table status
        this.tables.groupTable.status = 'total'
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.groupTable.status = 'error'
      }
    },
    // 根据groupTable,建立groupMemberTable
    async loadGroupMemberTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.groupMemberTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.groupMemberTable.status = 'loading'
      for (const groupId of this.tables.groupTable.allIds) {
        try {
          const respGroupMember = await api.server.vo.getVoListMembers({ path: { id: groupId } })
          // 是否把组长添加进member列表？
          // 把groupId字段补充进去
          Object.assign(respGroupMember.data, { id: groupId })
          // normalize
          const groupMember = new schema.Entity('groupMember')
          const normalizedData = normalize(respGroupMember.data, groupMember)
          // 存入state
          Object.assign(this.tables.groupMemberTable.byId, normalizedData.entities.groupMember)
          this.tables.groupMemberTable.allIds.unshift(Object.keys(normalizedData.entities.groupMember as Record<string, unknown>)[0])
          this.tables.groupMemberTable.allIds = [...new Set(this.tables.groupMemberTable.allIds)]
          // 给groupTable补充role字段
          const storeMain = useStoreMain()
          const currentId = storeMain.items.tokenDecoded.email
          for (const member of respGroupMember.data.members) {
            if (member.user.username === currentId && member.role === 'leader') {
              this.tables.groupTable.byId[groupId].myRole = 'leader'
            }
          }
        } catch (exception) {
          // exceptionNotifier(exception)
          // 继续下一个循环
          continue
        }
      }
      this.tables.groupMemberTable.status = 'total'
    },
    // // 根据groupTable, 建立groupBalanceTable
    // async loadGroupBalanceTable () {
    //   // 先清空table，避免多次更新时数据累加
    //   this.tables.groupBalanceTable = {
    //     byId: {},
    //     allIds: [],
    //     status: 'init'
    //   }
    //
    //   this.tables.groupBalanceTable.status = 'loading'
    //
    //   for (const groupId of this.tables.groupTable.allIds) {
    //     try {
    //       const respGroupBalance = await api.server.account.getAccountBalanceVo({ path: { vo_id: groupId } })
    //       // normalize
    //       const groupBalance = new schema.Entity('groupBalance')
    //       const normalizedData = normalize(respGroupBalance.data, groupBalance)
    //       // 存入state
    //       Object.assign(this.tables.groupBalanceTable.byId, normalizedData.entities.groupBalance)
    //       this.tables.groupBalanceTable.allIds.unshift(Object.keys(normalizedData.entities.groupBalance as Record<string, unknown>)[0])
    //       this.tables.groupBalanceTable.allIds = [...new Set(this.tables.groupBalanceTable.allIds)]
    //       // 给groupTable补充balance字段
    //       this.tables.groupTable.byId[groupId].balance = respGroupBalance.data.id
    //     } catch (exception) {
    //       // exceptionNotifier(exception)
    //       // 继续下一个循环
    //       continue
    //     }
    //   }
    //   this.tables.groupBalanceTable.status = 'total'
    // },
    // // 更新单个的groupBalance
    // async loadSingleGroupBalance (groupId: string) {
    //   this.tables.groupBalanceTable.status = 'loading'
    //   try {
    //     const respGroupBalance = await api.server.account.getAccountBalanceVo({ path: { vo_id: groupId } })
    //     // normalize
    //     const groupBalance = new schema.Entity('groupBalance')
    //     const normalizedData = normalize(respGroupBalance.data, groupBalance)
    //     // 存入state
    //     Object.assign(this.tables.groupBalanceTable.byId, normalizedData.entities.groupBalance)
    //     this.tables.groupBalanceTable.allIds.unshift(Object.keys(normalizedData.entities.groupBalance as Record<string, unknown>)[0])
    //     this.tables.groupBalanceTable.allIds = [...new Set(this.tables.groupBalanceTable.allIds)]
    //     // 给groupTable补充balance字段
    //     this.tables.groupTable.byId[groupId].balance = respGroupBalance.data.id
    //     this.tables.groupBalanceTable.status = 'total'
    //   } catch (exception) {
    //     // exceptionNotifier(exception)
    //     this.tables.groupBalanceTable.status = 'error'
    //   }
    // },
    // 给group对象补充stats相关字段， 注意调用本函数时，不应await，而是并发更新
    async loadSingleGroupStats (payload: {
      groupId: string
    }) {
      try {
        const respGroupStats = await api.server.vo.getVoStatistic({ path: { id: payload.groupId } })
        this.tables.groupTable.byId[payload.groupId].stats = {
          balance: respGroupStats.data.balance,
          coupon_count: respGroupStats.data.coupon_count,
          member_count: respGroupStats.data.member_count,
          order_count: respGroupStats.data.order_count,
          server_count: respGroupStats.data.server_count
        }
      } catch (exception) {
        // exceptionNotifier(exception)
      }
    },
    // 根据groupTable, 建立groupOrderTable
    async loadGroupOrderTable (payload: {
      page?: number
      pageSize?: number
      orderType?: 'new' | 'renewal' | 'upgrade' | 'downgrade'
      status?: 'paid' | 'unpaid' | 'cancelled' | 'refund'
      timeStart?: string
      timeEnd?: string
      groupId: string
    }) {
      // clear
      this.tables.groupOrderTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // table status
      this.tables.groupOrderTable.status = 'loading'

      // load
      try {
        const respGetOrder = await api.server.order.getOrder({
          query: {
            page: payload.page,
            page_size: payload.pageSize,
            // resource_type: 'vm',
            order_type: payload.orderType,
            status: payload.status,
            time_start: payload.timeStart,
            time_end: payload.timeEnd,
            vo_id: payload.groupId
          }
        })

        for (const order of respGetOrder.data.orders) {
          try {
            // get order details
            const respGetOrderId = await api.server.order.getOrderId({ path: { id: order.id } })

            // store
            Object.assign(this.tables.groupOrderTable.byId, { [respGetOrderId.data.id]: respGetOrderId.data })
            this.tables.groupOrderTable.allIds.unshift(respGetOrderId.data.id)
            this.tables.groupOrderTable.allIds = [...new Set(this.tables.groupOrderTable.allIds)]

            // // orderId补充进group的order字段
            // this.tables.groupTable.byId[payload?.groupId].order.push(order.id)
          } catch (exception) {
            // exceptionNotifier(exception)
            this.tables.groupOrderTable.status = 'part'
            // 继续下一个循环
            continue
          }
        }
      } catch (exception) {
        // exceptionNotifier(exception)
      }

      // table status
      this.tables.groupOrderTable.status = 'part'
    },

    /* dataCenterTable */
    async loadDataCenterTable () {
      // 清空table
      this.tables.dataCenterTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.dataCenterTable.status = 'loading'
      try {
        const respDataCenter = await api.server.registry.getRegistry()
        const dataCenter = new schema.Entity('dataCenter', {})
        respDataCenter.data.registries.forEach((data: Record<string, never>) => {
          const normalizedData = normalize(data, dataCenter)
          // 添加上services/personalServices空字段
          Object.values(normalizedData.entities.dataCenter!)[0].services = []
          Object.values(normalizedData.entities.dataCenter!)[0].personalServices = []
          Object.assign(this.tables.dataCenterTable.byId, normalizedData.entities.dataCenter)
          this.tables.dataCenterTable.allIds.unshift(Object.keys(normalizedData.entities.dataCenter as Record<string, unknown>)[0])
          this.tables.dataCenterTable.allIds = [...new Set(this.tables.dataCenterTable.allIds)]
        })
        this.tables.dataCenterTable.status = 'total'
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.dataCenterTable.status = 'error'
      }
      // sort
      this.tables.dataCenterTable.allIds.sort((a, b) => {
        const datacenterA = this.tables.dataCenterTable.byId[a]
        const datacenterB = this.tables.dataCenterTable.byId[b]
        return datacenterA.sort_weight - datacenterB.sort_weight
      })
    },
    /* serviceTable */
    async loadServiceTable () {
      // 清空table
      this.tables.serviceTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.serviceTable.status = 'loading'
      try {
        const respService = await api.server.service.getService()

        respService.data.results.forEach((service: ServiceInterface) => {
          Object.assign(this.tables.serviceTable.byId, { [service.id]: service })
          this.tables.serviceTable.allIds.unshift(service.id)
          this.tables.serviceTable.allIds = [...new Set(this.tables.serviceTable.allIds)]

          // 将本serviceId补充进对应dataCenter的services字段
          const datacenter = this.tables.dataCenterTable.byId[service.data_center.id]
          datacenter.services.unshift(service.id)
          datacenter.services = [...new Set(datacenter.services)]

          // sort services
          datacenter.services.sort((a, b) => {
            const serviceA = this.tables.serviceTable.byId[a]
            const serviceB = this.tables.serviceTable.byId[b]
            return serviceA.sort_weight - serviceB.sort_weight
          })
        })
        this.tables.serviceTable.status = 'total'
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.serviceTable.status = 'error'
      }
    },
    /* serviceAllocationTable */
    async loadServiceAllocationTable () {
      this.tables.serviceAllocationTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.serviceAllocationTable.status = 'loading'
      try {
        const respPQuota = await api.server.vms.getVmsServicePQuota()
        // const service = new schema.Entity('service')
        const allocation = new schema.Entity('allocation'/* , { service } */)
        for (const data of respPQuota.data.results) {
          Object.assign(data, { id: data.service.id })
          const normalizedData = normalize(data, allocation)
          Object.assign(this.tables.serviceAllocationTable.byId, normalizedData.entities.allocation)
          this.tables.serviceAllocationTable.allIds.unshift(Object.keys(normalizedData.entities.allocation as Record<string, unknown>)[0])
          this.tables.serviceAllocationTable.allIds = [...new Set(this.tables.serviceAllocationTable.allIds)]
        }
        this.tables.serviceAllocationTable.status = 'total'
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.serviceAllocationTable.status = 'error'
      }
    },
    /* fedAllocationTable */
    async loadFedAllocationTable () {
      this.tables.fedAllocationTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.fedAllocationTable.status = 'loading'
      try {
        const respSQuota = await api.server.vms.getVmsServiceSQuota()
        // const service = new schema.Entity('service')
        const allocation = new schema.Entity('allocation' /* { service } */)
        for (const data of respSQuota.data.results) {
          Object.assign(data, { id: data.service.id })
          const normalizedData = normalize(data, allocation)
          Object.assign(this.tables.fedAllocationTable.byId, normalizedData.entities.allocation)
          this.tables.fedAllocationTable.allIds.unshift(Object.keys(normalizedData.entities.allocation as Record<string, unknown>)[0])
          this.tables.fedAllocationTable.allIds = [...new Set(this.tables.fedAllocationTable.allIds)]
        }
        this.tables.fedAllocationTable.status = 'total'
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.fedAllocationTable.status = 'error'
      }
    },
    // async loadFedFlavorTable () {
    //   this.tables.fedFlavorTable = {
    //     byId: {},
    //     allIds: [],
    //     status: 'init'
    //   }
    //   this.tables.fedFlavorTable.status = 'loading'
    //   try {
    //     const respFlavor = await api.server.flavor.getFlavor()
    //     for (const flavor of respFlavor.data.flavors) {
    //       Object.assign(this.tables.fedFlavorTable.byId, { [flavor.id]: flavor })
    //       this.tables.fedFlavorTable.allIds.unshift(Object.keys({ [flavor.id]: flavor } as Record<string, unknown>)[0])
    //       this.tables.fedFlavorTable.allIds = [...new Set(this.tables.fedFlavorTable.allIds)]
    //     }
    //     this.tables.fedFlavorTable.status = 'total'
    //   } catch (exception) {
    //     // exceptionNotifier(exception)
    //     this.tables.fedFlavorTable.status = 'error'
    //   }
    // },
    // async loadServiceNetworkTable () {
    //   this.tables.serviceNetworkTable = {
    //     byLocalId: {},
    //     allLocalIds: [],
    //     status: 'init'
    //   }
    //   this.tables.serviceNetworkTable.status = 'loading'
    //   for (const serviceId of this.tables.serviceTable.allIds) {
    //     // service.status 为 enable 时才入表
    //     if (this.tables.serviceTable.byId[serviceId]?.status === 'enable') {
    //       try {
    //         const respNetwork = await api.server.network.getNetwork({ query: { service_id: serviceId } })
    //         for (const network of respNetwork.data) {
    //           // 将service 和 localId补充进network对象
    //           Object.assign(network, {
    //             service: serviceId,
    //             // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    //             localId: `${serviceId}-${network.id}`
    //           })
    //           Object.assign(this.tables.serviceNetworkTable.byLocalId, { [network.localId]: network })
    //           this.tables.serviceNetworkTable.allLocalIds.unshift(Object.keys({ [network.localId]: network } as Record<string, unknown>)[0])
    //           this.tables.serviceNetworkTable.allLocalIds = [...new Set(this.tables.serviceNetworkTable.allLocalIds)]
    //         }
    //       } catch (exception) {
    //         // exceptionNotifier(exception)
    //         // 继续下一个循环
    //         continue
    //       }
    //     }
    //   }
    //   this.tables.serviceNetworkTable.status = 'total'
    // },
    // async loadServiceImageTable () {
    //   this.tables.serviceImageTable = {
    //     byLocalId: {},
    //     allLocalIds: [],
    //     status: 'init'
    //   }
    //   this.tables.serviceImageTable.status = 'loading'
    //   for (const serviceId of this.tables.serviceTable.allIds) {
    //     // service.status 为 enable 时才入表
    //     if (this.tables.serviceTable.byId[serviceId]?.status === 'enable') {
    //       try {
    //         const respImage = await api.server.image.getImage({ query: { service_id: serviceId } })
    //         for (const image of respImage.data) {
    //           // 将service 和 localId补充进image对象
    //           Object.assign(image, {
    //             service: serviceId,
    //             localId: `${serviceId}-${image.id}`
    //           })
    //           Object.assign(this.tables.serviceImageTable.byLocalId, { [image.localId]: image })
    //           this.tables.serviceImageTable.allLocalIds.unshift(Object.keys({ [image.localId]: image } as Record<string, unknown>)[0])
    //           this.tables.serviceImageTable.allLocalIds = [...new Set(this.tables.serviceImageTable.allLocalIds)]
    //         }
    //       } catch (exception) {
    //         // exceptionNotifier(exception)
    //         // 继续下一个循环
    //         continue
    //       }
    //     }
    //   }
    //   this.tables.serviceImageTable.status = 'total'
    // },
    async loadUserVpnTable () {
      this.tables.userVpnTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.userVpnTable.status = 'loading'
      for (const serviceId of this.tables.serviceTable.allIds) {
        // service状态为enable时才入表
        if (this.tables.serviceTable.byId[serviceId]?.status === 'enable') {
          try {
            if (this.tables.serviceTable.byId[serviceId]?.need_vpn) {
              const respVpn = await api.server.vpn.getVpn({ path: { service_id: serviceId } })
              Object.assign(respVpn.data.vpn, { id: serviceId })
              Object.assign(this.tables.userVpnTable.byId, { [serviceId]: respVpn.data.vpn })
              this.tables.userVpnTable.allIds.unshift(Object.keys({ [serviceId]: respVpn.data.vpn } as Record<string, unknown>)[0])
              this.tables.userVpnTable.allIds = [...new Set(this.tables.userVpnTable.allIds)]
            }
          } catch (exception) {
            // exceptionNotifier(exception)
            // 继续下一个循环
            continue
          }
        }
      }
      this.tables.userVpnTable.status = 'total'
    },
    // 加载单个order,下单后和交付后更新使用, orderDetail加载使用
    async loadSingleOrder (payload: {
      isGroup: boolean,
      orderId: string
    }) {
      if (payload.isGroup) {
        // table status
        this.tables.groupOrderTable.status = 'loading'

        // load
        try {
          // get data
          const respGetOrderId = await api.server.order.getOrderId({ path: { id: payload.orderId } })

          // groupTable补充order字段
          // this.tables.groupTable.byId[respGetOrderId.data.vo_id].order.push(payload.orderId)

          // 填入groupOrderTable
          Object.assign(this.tables.groupOrderTable.byId, { [respGetOrderId.data.id]: respGetOrderId.data })
          this.tables.groupOrderTable.allIds.unshift(respGetOrderId.data.id)
          this.tables.groupOrderTable.allIds = [...new Set(this.tables.groupOrderTable.allIds)]
          // table status
          this.tables.groupOrderTable.status = 'part'
        } catch (exception) {
          // exceptionNotifier(exception)
          this.tables.groupOrderTable.status = 'error'
        }
      } else {
        this.tables.personalOrderTable.status = 'loading'
        try {
          const respGetOrderId = await api.server.order.getOrderId({ path: { id: payload.orderId } })
          // 填入personalOrderTable
          Object.assign(this.tables.personalOrderTable.byId, { [respGetOrderId.data.id]: respGetOrderId.data })
          this.tables.personalOrderTable.allIds.unshift(respGetOrderId.data.id)
          this.tables.personalOrderTable.allIds = [...new Set(this.tables.personalOrderTable.allIds)]
          this.tables.personalOrderTable.status = 'total'
        } catch (exception) {
          // exceptionNotifier(exception)
          this.tables.personalOrderTable.status = 'error'
        }
      }
    },
    // 加载personalOrderTable
    async loadPersonalOrderTable () {
      this.tables.personalOrderTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.personalOrderTable.status = 'loading'
      try {
        const respGetOrder = await api.server.order.getOrder()
        const order = new schema.Entity('order')
        for (const data of respGetOrder.data.orders) {
          // get order detail
          const respGetOrderId = await api.server.order.getOrderId({ path: { id: data.id } })
          const normalizedData = normalize(respGetOrderId.data, order)
          Object.assign(this.tables.personalOrderTable.byId, normalizedData.entities.order)
          this.tables.personalOrderTable.allIds.unshift(Object.keys(normalizedData.entities.order as Record<string, unknown>)[0])
          this.tables.personalOrderTable.allIds = [...new Set(this.tables.personalOrderTable.allIds)]
        }
        this.tables.personalOrderTable.status = 'total'
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.personalOrderTable.status = 'error'
      }
    },
    // 更新整个personalServerTable
    async loadPersonalServerTable () {
      this.tables.personalServerTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.personalServerTable.status = 'loading'
      try {
        const respServer = await api.server.server.getServer({ query: { page_size: 999 } })

        for (const server of respServer.data.servers) {
          // // get detail
          // const respGetServerDetail = await api.server.server.getServerId({ path: { id: data.id } })
          //
          // Object.assign(respGetServerDetail.data.server, { status: -1 })
          // Object.assign(this.tables.personalServerTable.byId, { [respGetServerDetail.data.server.id]: respGetServerDetail.data.server })
          // this.tables.personalServerTable.allIds.unshift(respGetServerDetail.data.server.id)
          // this.tables.personalServerTable.allIds = [...new Set(this.tables.personalServerTable.allIds)]

          Object.assign(server, { status: -1 })
          Object.assign(this.tables.personalServerTable.byId, { [server.id]: server })
          this.tables.personalServerTable.allIds.unshift(server.id)
          this.tables.personalServerTable.allIds = [...new Set(this.tables.personalServerTable.allIds)]
        }
        // 建立personalServerTable之后，分别更新每个server status, 并发更新，无需await
        for (const serverId of this.tables.personalServerTable.allIds) {
          this.loadSingleServerStatus({
            isGroup: false,
            serverId
          })
        }
        this.tables.personalServerTable.status = 'total'
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.personalServerTable.status = 'error'
      }
    },
    // // 更新整个groupServerTable，调用点在group模块里
    // async loadGroupServerTable () {
    //   // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
    //   this.tables.groupServerTable = {
    //     byId: {},
    //     allIds: [],
    //     status: 'init'
    //   }
    //   this.tables.groupServerTable.status = 'loading'
    //   // 根据groupTable,建立groupServerTable
    //   for (const groupId of this.tables.groupTable.allIds) {
    //     try {
    //       // 发送请求
    //       const respGroupServer = await api.server.server.getServerVo({
    //         path: {
    //           vo_id: groupId
    //         },
    //         query: {
    //           page_size: 999
    //         }
    //       })
    //       // 将响应normalize
    //       const server = new schema.Entity('server')
    //       for (const data of respGroupServer.data.servers) {
    //         const normalizedData = normalize(data, server)
    //         Object.assign(this.tables.groupServerTable.byId, normalizedData.entities.server)
    //         this.tables.groupServerTable.allIds.unshift(Object.keys(normalizedData.entities.server as Record<string, unknown>)[0])
    //         this.tables.groupServerTable.allIds = [...new Set(this.tables.groupServerTable.allIds)]
    //       }
    //     } catch (exception) {
    //       // exceptionNotifier(exception)
    //       // 继续下一个循环
    //       continue
    //     }
    //   }
    //   // 建立groupServerTable之后，分别更新每个server status, 并发更新，无需await
    //   for (const serverId of this.tables.groupServerTable.allIds) {
    //     this.loadSingleServerStatus({
    //       isGroup: true,
    //       serverId
    //     })
    //   }
    //   this.tables.groupServerTable.status = 'part'
    // },

    // 更新groupServerTable，根据分页参数,后端分页，只保存一页
    async loadGroupServerTable (payload: {
      groupId: string,
      page?: number,
      pageSize?: number,
      serviceId?: string
    }) {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.groupServerTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.groupServerTable.status = 'loading'

      // 根据groupTable,建立groupServerTable
      try {
        // 发送请求
        const respGroupServer = await api.server.server.getServerVo({
          path: {
            vo_id: payload.groupId
          },
          query: {
            page: payload.page,
            page_size: payload.pageSize,
            service_id: payload.serviceId
          }
        })
        for (const server of respGroupServer.data.servers) {
          // get detail
          // const respGetServerDetail = await api.server.server.getServerId({ path: { id: server.id } })

          Object.assign(server, { status: -1 })
          Object.assign(this.tables.groupServerTable.byId, { [server.id]: server })
          this.tables.groupServerTable.allIds.unshift(server.id)
          this.tables.groupServerTable.allIds = [...new Set(this.tables.groupServerTable.allIds)]
        }
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.groupServerTable.status = 'error'
      }

      // 建立groupServerTable之后，分别更新每个server status, 并发更新，无需await
      for (const serverId of this.tables.groupServerTable.allIds) {
        this.loadSingleServerStatus({
          isGroup: true,
          serverId
        })
      }

      // table status
      this.tables.groupServerTable.status = 'part'
    },
    // 获取并保存单个server的status
    /* *
    status code:
    -1  ->  自己加的，获取中
    0       # no state
    1       # the domain is running
    2       # the domain is blocked on resource
    3       # the domain is paused by user
    4       # the domain is being shut down
    5       # the domain is shut off
    6       # the domain is crashed
    7       # the domain is suspended by guest power management
    9       # host connect failed
    10      # domain miss
    11      # The domain is being built
    12      # Failed to build the domain
    13      # An error occurred in the domain.
    *  */
    // 注意调用本函数时，不应await，而是并发更新
    async loadSingleServerStatus (payload: {
      isGroup?: boolean
      serverId: string
    }) {
      const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable
      // status -> -1，UI则显示为获取中
      table.byId[payload.serverId].status = -1
      try {
        const respStatus = await api.server.server.getServerStatus({ path: { id: payload.serverId } })
        table.byId[payload.serverId].status = respStatus.data.status.status_code
      } catch (exception) {
        // exceptionNotifier(exception)
        table.byId[payload.serverId].status = 0
      }
    },
    // 更新单个server的信息
    async loadSingleServer (payload: { serverId: string; isGroup: boolean }) {
      payload.isGroup ? this.tables.groupServerTable.status = 'loading' : this.tables.personalServerTable.status = 'loading'
      try {
        const respSingleServer = await api.server.server.getServerId({ path: { id: payload.serverId } })
        const server = respSingleServer.data.server
        if (payload.isGroup) {
          // 更新table
          Object.assign(this.tables.groupServerTable.byId, { [server.id]: server })
          this.tables.groupServerTable.allIds.unshift(server.id)
          this.tables.groupServerTable.allIds = [...new Set(this.tables.groupServerTable.allIds)]
          this.loadSingleServerStatus({
            isGroup: true,
            serverId: payload.serverId
          })
          this.tables.groupServerTable.status = 'part'
        } else {
          Object.assign(this.tables.personalServerTable.byId, { [server.id]: server })
          this.tables.personalServerTable.allIds.unshift(server.id)
          this.tables.personalServerTable.allIds = [...new Set(this.tables.personalServerTable.allIds)]
          this.loadSingleServerStatus({
            isGroup: false,
            serverId: payload.serverId
          })
          this.tables.personalServerTable.status = 'total'
        }
      } catch (exception) {
        // exceptionNotifier(exception)
        if (payload.isGroup) {
          this.tables.groupServerTable.status = 'error'
        } else {
          this.tables.personalServerTable.status = 'error'
        }
      }
    },
    // 从personalServer或groupServer里直接删除某个server的记录
    async deleteSingleServerFromTable (payload: {
      isGroup?: boolean
      serverId: string
    }) {
      // get table
      const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable

      // table status
      table.status = 'loading'

      // delete from table
      table.allIds.filter(id => id !== payload.serverId)
      delete table.byId[payload.serverId]

      // table status
      table.status = 'part'
    },
    async loadPersonalCouponTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.personalCouponTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.personalCouponTable.status = 'loading'
      try {
        // 发送请求,列举全部personal coupon
        const respCoupon = await api.server.cashcoupon.getCashCoupon({
          query: {
            page_size: 999,
            app_service_category: 'vms-server'
          }
        })
        // 将响应normalize，存入state里的userServerTable
        const coupon = new schema.Entity('coupon')
        for (const data of respCoupon.data.results) {
          const normalizedData = normalize(data, coupon)
          Object.assign(this.tables.personalCouponTable.byId, normalizedData.entities.coupon)
          this.tables.personalCouponTable.allIds.unshift(Object.keys(normalizedData.entities.coupon as Record<string, unknown>)[0])
          this.tables.personalCouponTable.allIds = [...new Set(this.tables.personalCouponTable.allIds)]
          // // 如果coupon是vo的，把该couponId补充到groupTable里
          // if (data.vo !== null) {
          //   this.tables.groupTable.byId[data.vo.id].coupons.push(data.id)
          // }
        }
        this.tables.personalCouponTable.status = 'total'
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.personalCouponTable.status = 'error'
      }
    },
    async loadGroupCouponTable (payload: {
      page?: number
      pageSize?: number
      serviceId?: string // 要去service查询apy_app_service_id, 再发送请求
      groupId: string
      valid?: 'notyet' | 'valid' | 'expired'
      serviceCategory?: 'vms-server' | 'vms-object' | 'high-cloud' | 'hpc' | 'other'
    }) {
      // clear
      this.tables.groupCouponTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // table status
      this.tables.groupCouponTable.status = 'loading'
      // load
      try {
        // req
        const respGetCoupon = await api.server.cashcoupon.getCashCoupon({
          query: {
            page: payload?.page,
            page_size: payload?.pageSize,
            ...(payload?.serviceId && { app_service_id: this.tables.serviceTable.byId[payload.serviceId]?.pay_app_service_id }),
            vo_id: payload.groupId,
            valid: payload?.valid,
            app_service_category: payload?.serviceCategory
          }
        })
        // store
        for (const coupon of respGetCoupon.data.results) {
          Object.assign(this.tables.groupCouponTable.byId, { [coupon.id]: coupon })
          this.tables.groupCouponTable.allIds.unshift(coupon.id)
          this.tables.groupCouponTable.allIds = [...new Set(this.tables.groupCouponTable.allIds)]

          // // 把couponId补充到groupTable里
          // this.tables.groupTable.byId[coupon.vo.id]?.coupons.push(coupon.id)
        }
      } catch (exception) {
        // exceptionNotifier(exception)
        this.tables.groupCouponTable.status = 'error'
      }

      // table status
      this.tables.groupCouponTable.status = 'total'
    },
    /* tables */

    /* dialogs */

    /* vpn */
    async toggleVpnStatus (payload: { serviceId: string }) {
      // 因成功响应data为空，需要在此分开处理打开、关闭的逻辑
      if (this.tables.userVpnTable.byId[payload.serviceId]?.active) {
        try {
          void await api.server.vpn.postVpnDeactive({ path: { service_id: payload.serviceId } })
          this.tables.userVpnTable.status = 'loading'
          this.tables.userVpnTable.byId[payload.serviceId].active = false
          this.tables.userVpnTable.status = 'total'
        } catch (exception) {
          exceptionNotifier(exception)
        }
      } else {
        try {
          void await api.server.vpn.postVpnActive({ path: { service_id: payload.serviceId } })
          this.tables.userVpnTable.status = 'loading'
          this.tables.userVpnTable.byId[payload.serviceId].active = true
          this.tables.userVpnTable.status = 'total'
        } catch (exception) {
          exceptionNotifier(exception)
        }
      }
    },
    /* vpn */

    /* server */
    // 打开vnc
    async gotoVNC (id: string, asAdmin?: true) {
      try {
        const response = await api.server.server.getServerVnc({
          path: { id },
          query: { 'as-admin': asAdmin }
        })
        const url = response.data.vnc.url
        // window.open(url, 'new', 'height=900, width=1400, top=150, left=150, title=no, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
        window.open(url, '_blank')
      } catch (exception) {
        exceptionNotifier(exception)
      }
    },
    // 下载vpn ca
    fetchCa (serviceId: string) {
      try {
        const url = baseURLServer + '/vpn/' + serviceId + '/ca'
        window.open(url)
      } catch (exception) {
        exceptionNotifier(exception)
      }
    },
    // 下载vpn config
    fetchConfig (serviceId: string) {
      try {
        const url = baseURLServer + '/vpn/' + serviceId + '/config'
        window.open(url)
      } catch (exception) {
        exceptionNotifier(exception)
      }
    },
    // 修改server.lock的operation状态( lock-delete <-> lock-operation )
    async toggleOperationLock (payload: { serverId: string; isGroup: boolean }) {
      const lock = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId]?.lock : this.tables.personalServerTable.byId[payload.serverId]?.lock
      const newLock = lock === 'lock-operation' ? 'lock-delete' : 'lock-operation'
      try {
        const respPostServerLock = await api.server.server.postServerLock({
          query: { lock: newLock },
          path: { id: payload.serverId }
        })
        const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable
        const server = table.byId[payload.serverId]
        server.lock = respPostServerLock.data.lock
      } catch (exception) {
        exceptionNotifier(exception)
      }
    },
    // 修改server.lock的delete状态 ( free <-> lock-delete )
    async toggleDeleteLock (payload: { serverId: string; isGroup: boolean }) {
      const lock = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId]?.lock : this.tables.personalServerTable.byId[payload.serverId]?.lock
      const newLock = lock === 'free' ? 'lock-delete' : 'free'
      try {
        const respPostServerLock = await api.server.server.postServerLock({
          query: { lock: newLock },
          path: { id: payload.serverId }
        })
        const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable
        const server = table.byId[payload.serverId]
        server.lock = respPostServerLock.data.lock
      } catch (exception) {
        exceptionNotifier(exception)
      }
    },
    // 修改server.lock的delete状态为lock-delete ( -> lock-delete )
    async toggleDeleteLockToLock (payload: { serverId: string; isGroup: boolean }) {
      const newLock = 'lock-delete'
      try {
        const respPostServerLock = await api.server.server.postServerLock({
          query: { lock: newLock },
          path: { id: payload.serverId }
        })
        const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable
        const server = table.byId[payload.serverId]
        server.lock = respPostServerLock.data.lock
      } catch (exception) {
        exceptionNotifier(exception)
      }
    },
    // 操作云主机实例时，向endpoint_url发请求； 进行其他云联邦操作时向每个前端部署对应的后端（例如vms）发请求
    // todo 细分各种操作;重命名为triggerXxxDialog
    serverOperationDialog (payload: { serverId: string; action: string; isGroup?: boolean; isJump?: boolean }) {
      // 所有操作都要用的信息
      const server = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId] : this.tables.personalServerTable.byId[payload.serverId]
      // 去掉协议
      // const endpoint_url = server.endpoint_url.substr(server.endpoint_url.indexOf('//'))
      // 判断结尾有没有'/'，并加上当前用户使用的协议
      // 以下写法失败, 二元选择问号前都是条件
      // const api = window.location.protocol + endpoint_url.endsWith('/') ? endpoint_url + 'api/server/' + payload.serverId + '/action' : endpoint_url + '/api/server/' + payload.serverId + '/action'
      // const api = window.location.protocol + (endpoint_url.endsWith('/') ? endpoint_url + 'api/server/' + payload.serverId + '/action' : endpoint_url + '/api/server/' + payload.serverId + '/action')

      // 废弃endpoint_url字段，改为统一vms的后端api
      // const apiURL = baseURLServer + '/server/' + payload.serverId + '/action'
      // const data = { action: payload.action }

      // 执行操作的函数。delete/force_delete不用。start直接用。其他经dialog确认后用。
      const executeOperation = async () => {
        // 将主机状态清空，界面将显示loading
        if (payload.isGroup) {
          this.tables.groupServerTable.byId[payload.serverId].status = -1
        } else {
          this.tables.personalServerTable.byId[payload.serverId].status = -1
        }

        try {
          // await axios.post(api, data)
          void await api.server.server.postServerAction({
            path: { id: payload.serverId },
            body: { action: payload.action }
          })
          // 应延时
          void await new Promise(resolve => (
            setTimeout(resolve, 5000)
          ))
          // 更新单个server status
          this.loadSingleServerStatus({
            isGroup: payload.isGroup || false,
            serverId: payload.serverId
          })
          // todo 比对新老状态，发送通知
          // const newStatus = payload.isGroup ? context.state.tables.groupServerTable.byId[payload.serverId]?.status : context.state.tables.personalServerTable.byId[payload.serverId]?.status
        } catch (exception) {
          exceptionNotifier(exception)
          // 若请求失败则应更新单个server status
          this.loadSingleServerStatus({
            isGroup: payload.isGroup || false,
            serverId: payload.serverId
          })
        }
      }

      // 各种操作分类
      if (payload.action === 'delete' || payload.action === 'delete_force') {
        Dialog.create({
          component: ServerDeleteDialog,
          componentProps: {
            action: payload.action,
            serverId: payload.serverId,
            isGroup: payload.isGroup
          }
        }).onOk(async () => {
          // 将主机状态清空，界面将显示loading
          if (payload.isGroup) {
            this.tables.groupServerTable.byId[payload.serverId].status = -1
          } else {
            this.tables.personalServerTable.byId[payload.serverId].status = -1
          }
          try {
            // 发送请求
            // void await axios.post(apiURL, data)
            await api.server.server.postServerAction({
              path: { id: payload.serverId },
              body: { action: payload.action }
            })

            // 如果删除主机，重新获取userServerTable或groupServerTable
            Notify.create({
              classes: 'notification-positive shadow-15',
              textColor: 'positive',
              // spinner: true,
              icon: 'check_circle',
              message: `${tc('store.notify.delete_server_success')}: ${server.ipv4 || ''}`,
              position: 'bottom',
              closeBtn: true,
              timeout: 5000,
              multiLine: false
            })

            // 更新userServerTable或groupServerTable
            this.deleteSingleServerFromTable({
              isGroup: payload.isGroup,
              serverId: payload.serverId
            })

            // 是否跳转
            if (payload.isJump) {
              // @ts-ignore
              this.$router.back()
            }
          } catch (exception) {
            exceptionNotifier(exception)
            // 若请求失败则应更新单个server status
            this.loadSingleServerStatus({
              isGroup: payload.isGroup,
              serverId: payload.serverId
            })
          }
        })
      } else if (payload.action === 'start') {
        void executeOperation()
      } else {
        Dialog.create({
          class: 'dialog-primary',
          title: `${tc('store.actions.' + payload.action) || ''}`,
          focus: 'cancel',
          message: `${tc('store.dialog.confirm_action')}?`,
          ok: {
            label: i18n.global.tc('store.dialog.confirm'),
            push: false,
            // flat: true,
            outline: true,
            color: 'primary'
          },
          cancel: {
            label: i18n.global.tc('store.dialog.cancel'),
            push: false,
            flat: false,
            unelevated: true,
            color: 'primary'
          }
        }).onOk(executeOperation)
      }
    },
    // 编辑云主机备注
    editServerNoteDialog (payload: { serverId: string; isGroup?: boolean }) {
      const MAX_LENGTH_REMARK = 100
      Dialog.create({
        class: 'dialog-primary',
        title: `${tc('store.dialog.edit_server_note')}:${payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId].ipv4 : this.tables.personalServerTable.byId[payload.serverId].ipv4}`,
        // message: '长度限制为40个字',
        prompt: {
          model: `${payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId].remarks : this.tables.personalServerTable.byId[payload.serverId].remarks}`,
          counter: true,
          maxlength: MAX_LENGTH_REMARK,
          type: 'text' // optional
        },
        color: 'primary',
        cancel: true
      }).onOk(async (data: string) => {
        try {
          const respPatchRemark = await api.server.server.patchServerRemark({
            path: { id: payload.serverId },
            query: { remark: data.trim() }
          })

          if (payload.isGroup) {
            this.tables.groupServerTable.byId[payload.serverId].remarks = respPatchRemark.data.remarks
          } else {
            this.tables.personalServerTable.byId[payload.serverId].remarks = respPatchRemark.data.remarks
          }
          // 弹出通知
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'check_circle',
            textColor: 'light-green',
            message: `${tc('store.notify.edit_server_note_success')}: ` + respPatchRemark.data.remarks,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        } catch (exception) {
          exceptionNotifier(exception)
        }
      })
    },
    triggerServerRebuildDialog (payload: { serverId: string, isGroup?: boolean }) {
      Dialog.create({
        component: ServerRebuildDialog,
        componentProps: {
          serverId: payload.serverId,
          isGroup: payload.isGroup
        }
      }).onOk(async (image_id: string) => {
        const server = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId] : this.tables.personalServerTable.byId[payload.serverId]
        // // 去掉协议
        // const endpoint_url = server.endpoint_url.substr(server.endpoint_url.indexOf('//'))
        // const api = window.location.protocol + (endpoint_url.endsWith('/') ? endpoint_url + 'api/server/' + payload.serverId + '/rebuild' : endpoint_url + '/api/server/' + payload.serverId + '/rebuild')
        // const data = { image_id }

        // 发送请求
        Notify.create({
          classes: 'notification-positive shadow-15',
          textColor: 'positive',
          spinner: true,
          message: `${tc('store.notify.rebuilding_server')}: ${server.ipv4 || ''}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })

        try {
          // void await axios.post(api, data)
          // vms响应表明正在重建：则不保证重建成功，须持续取回新的信息，以判定是否重建成功
          void await api.server.server.postServerRebuild({
            path: { id: payload.serverId },
            body: { image_id }
          })

          // 持续尝试取回新的server信息
          let countGetter = 0
          const timerId = setInterval(
            async () => {
              // 取回计数
              countGetter += 1

              // 更新该server
              void await this.loadSingleServer({
                serverId: payload.serverId,
                isGroup: payload.isGroup || false
              })

              // 镜像更新成功则判定为成功
              const newServer = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId] : this.tables.personalServerTable.byId[payload.serverId]
              if (newServer.image_id === image_id) {
                clearInterval(timerId)
                Notify.create({
                  classes: 'notification-positive shadow-15',
                  textColor: 'positive',
                  icon: 'check_circle',
                  message: `${tc('store.notify.rebuild_server_success')}: ${server.ipv4 || ''}`,
                  position: 'bottom',
                  closeBtn: true,
                  timeout: 5000,
                  multiLine: false
                })
              }

              // 超出一定次数则判定为失败
              if (countGetter === 10) {
                clearInterval(timerId)
                Notify.create({
                  classes: 'notification-negative shadow-15',
                  icon: 'mdi-alert',
                  textColor: 'negative',
                  message: `${tc('store.notify.rebuild_server_timeout')}`,
                  position: 'bottom',
                  closeBtn: true,
                  timeout: 5000,
                  multiLine: false
                })
              }
            }, 1000)
        } catch (exception) {
          exceptionNotifier(exception)
        }
      })
    },
    /* server */

    /* account */
    /* 修改group信息 */
    editGroupDialog (groupId: string) {
      // // 把整个对话框对象包在promise里。删除成功、失败包装为promise结果值。
      // return new Promise((resolve, reject) => {
      // 操作的确认提示
      Dialog.create({
        component: GroupEditDialog,
        componentProps: {
          groupId
        }
      }).onOk(async (val: { name: string; company: string; description: string }) => {
        // val是onDialogOK调用时传入的实参
        try {
          // 发送patch请求
          void await api.server.vo.patchVo({
            path: { id: groupId },
            body: val
          })

          // // 加入myRole字段
          // Object.assign(respPatchGroup.data, { myRole: this.tables.groupTable.byId[groupId].myRole })
          // // 保存响应内最新信息
          // const newGroup = { [respPatchGroup.data.id]: respPatchGroup.data }
          // // 保存最新group
          // Object.assign(this.tables.groupTable.byId, newGroup)
          // this.tables.groupTable.allIds.unshift(Object.keys(newGroup as Record<string, unknown>)[0])
          // this.tables.groupTable.allIds = [...new Set(this.tables.groupTable.allIds)]

          // 以上更新方式丢失了balance字段。所有group相关都强制更新组的表。在产品稳定后可以更细化。
          this.hardLoadGroupBasicTables()

          // 弹出通知
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'positive',
            message: `${tc('store.notify.edit_group_success')}`,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        } catch (exception) {
          exceptionNotifier(exception)
        }
      })
      // })
    },
    /* 修改group信息 */

    /* 增加group成员 */
    addGroupMemberDialog (groupId: string) {
      Dialog.create({
        component: GroupAddMemberDialog,
        componentProps: {
          groupId
        }
      })
    },
    /* 增加group成员 */

    /* 移除group成员 */
    removeSingleGroupMemberDialog (payload: { groupId: string; username: string }) {
      // 操作的确认提示
      Dialog.create({
        class: 'dialog-primary',
        title: `${tc('store.dialog.remove_group_member')}: ` + payload.username,
        // message: `${tc('确认')}?`,
        focus: 'cancel',
        ok: {
          label: `${tc('store.dialog.confirm')}`,
          push: false,
          outline: true,
          color: 'primary'
        },
        cancel: {
          label: `${tc('store.dialog.cancel')}`,
          push: false,
          unelevated: true,
          color: 'primary'
        }
      }).onOk(async () => {
        try {
          void await api.server.vo.postVoRemoveMembers({
            path: { id: payload.groupId },
            body: { usernames: [payload.username] }
          })
          // 保存最新group
          this.tables.groupMemberTable.byId[payload.groupId].members = this.tables.groupMemberTable.byId[payload.groupId].members.filter((member) => {
            return member.user.username !== payload.username
          })
          // 弹出通知
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'positive',
            message: `${tc('store.notify.remove_group_member_success')}: ` + payload.username,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        } catch (exception) {
          exceptionNotifier(exception)
        }
      })
    },
    /* 移除group成员 */

    /* 修改group成员角色 */
    editGroupMemberRoleDialog (payload: {
      groupId: string;
      member_id: string;
      role: 'member' | 'leader';
      role_name: string
    }) {
      // 操作的确认提示
      Dialog.create({
        class: 'dialog-primary',
        title: `${tc('store.dialog.set_role')}: ` + payload.role_name,
        // message:          '确认设置?',
        focus: 'cancel',
        ok: {
          label: `${tc('store.dialog.confirm')}`,
          push: false,
          outline: true,
          color: 'primary'
        },
        cancel: {
          label: `${tc('store.dialog.cancel')}`,
          push: false,
          unelevated: true,
          color: 'primary'
        }
      }).onOk(async () => {
        try {
          const respPostMemberRole = await api.server.vo.postVoMembersRole({
            path: {
              member_id: payload.member_id,
              role: payload.role
            }
          })
          // 保存最新member
          // 增加成员，修改角色用。为了避免数组有重复，采取以下逻辑：
          // 删掉已有的同名member
          this.tables.groupMemberTable.byId[payload.groupId].members = this.tables.groupMemberTable.byId[payload.groupId].members.filter((memberGroup) => {
            return memberGroup.user.username !== respPostMemberRole.data.user.username
          })
          // 增加新拿到的member
          this.tables.groupMemberTable.byId[payload.groupId].members.unshift(respPostMemberRole.data)

          // 弹出通知
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'positive',
            message: respPostMemberRole.data.user.username + `${tc('store.notify.set_role_success')}: ` + payload.role_name,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        } catch (exception) {
          exceptionNotifier(exception)
        }
      })
    },
    /* 修改group成员角色 */

    /* 新建group */
    async createGroupDialog (payload: { name: string; company: string; description: string; }) {
      // 检查输入合法性
      if (payload.name.trim() === '' || payload.company.trim() === '' || payload.description.trim() === '') {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: `${tc('store.notify.empty_input')}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      } else {
        try {
          void await api.server.vo.postVo({ body: payload })
          // 重要：更新table，因为group是个根依赖，新增一个组，要牵涉数据非常多，不如直接全部重读组相关数
          this.hardLoadGroupBasicTables()
          // 通知
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'positive',
            message: `${tc('store.notify.new_group_success')}`,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
          // 跳转到group list
          navigateToUrl('/my/server/group/list')
        } catch (exception) {
          exceptionNotifier(exception)
        }
      }
    },
    /* 新建group */

    /* 删除group */
    deleteGroupDialog (groupId: string) {
      // 检查组内:云主机、配额、配额申请记录 是否删除干净
      const isServerPurged = Boolean(this.getGroupServersByGroupId(groupId).length === 0)

      if (!isServerPurged) {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-check-circle',
          textColor: 'red',
          message: `${tc('store.notify.clean_before_dismiss_group')}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      } else {
        // 操作的确认提示
        Dialog.create({
          class: 'dialog-primary',
          title: `${tc('store.dialog.dismiss_group')}`,
          message: `${tc('store.dialog.dismiss_group_confirm')}`,
          focus: 'cancel',
          ok: {
            label: `${tc('store.dialog.confirm')}`,
            push: false,
            outline: true,
            color: 'primary'
          },
          cancel: {
            label: `${tc('store.dialog.cancel')}`,
            push: false,
            unelevated: true,
            color: 'primary'
          }
        }).onOk(async () => {
          try {
            // 发送请求
            void await api.server.vo.deleteVo({ path: { id: groupId } })

            // 更新table，因为group是个根依赖，删除一个组，要牵涉数据非常多，不如直接全部重读组相关数据
            this.hardLoadGroupBasicTables()
            // notify
            Notify.create({
              classes: 'notification-positive shadow-15',
              icon: 'mdi-check-circle',
              textColor: 'positive',
              message: `${tc('store.notify.dismiss_group_success')}`,
              position: 'bottom',
              closeBtn: true,
              timeout: 5000,
              multiLine: false
            })
            // jump
            navigateToUrl('/my/server/group/list')
          } catch (exception) {
            exceptionNotifier(exception)
          }
        })
      }
    },
    /* 删除group */
    /* account */

    /* order */
    /* 支付订单 */
    payOrderDialog (orderId: string, isGroup = false) {
      Dialog.create({
        component: OrderPayDialog,
        componentProps: {
          orderId,
          isGroup
        }
      }).onOk(async (val: { payment_method: 'balance' | 'cashcoupon' | 'coupon-balance', coupon_ids?: string[] }) => { // val是onDialogOK调用时传入的实参
        Notify.create({
          classes: 'notification-positive shadow-15',
          icon: 'mdi-check-circle',
          textColor: 'positive',
          spinner: true,
          message: `${tc('store.notify.paying_order')}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })

        try {
          void await api.server.order.postOrderIdPay({
            path: { id: orderId },
            query: {
              payment_method: val.payment_method,
              coupon_ids: val.coupon_ids
            }
          })

          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'positive',
            message: `${tc('store.notify.pay_order_success')}`,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })

          // 成功交付后，应更新多个table
          // 更新orderId对应order
          void await this.loadSingleOrder({
            isGroup,
            orderId
          })

          // 拿到更新后的order对象
          const orderNew = isGroup ? this.tables.groupOrderTable.byId[orderId] : this.tables.personalOrderTable.byId[orderId]

          // 更新order交付的server
          const serverId = orderNew?.resources[0]?.instance_id
          if (serverId) {
            // 限制最大自动取回次数，避免死循环
            const MAX_COUNT = 10
            let count = 0
            // 持续尝试取回交付的server信息
            const timerId = setInterval(
              async () => {
                // 取回server信息
                void await this.loadSingleServer({
                  isGroup,
                  serverId
                })
                // 计数
                count += 1
                // 表里存在该server则表示取回成功，消除timer
                if (isGroup ? this.tables.groupServerTable.byId[serverId] : this.tables.personalServerTable.byId[serverId]) {
                  clearInterval(timerId)
                }
                // 超过次数取消自动取回
                if (count === MAX_COUNT) {
                  clearInterval(timerId)
                }
              }, 1000)
          }

          // 当前订单所属的group
          const groupId = orderNew?.vo_id

          // 更新order影响的余额
          isGroup ? await this.loadSingleGroupStats({ groupId }) : await this.loadPersonalBalance()

          // 更新order影响的coupon， 暂时为整体更新table，可以细化为singleGroupCoupon/singlePersonalCoupon
          isGroup ? await this.loadGroupCouponTable({ groupId }) : await this.loadPersonalCouponTable()

          // 跳转到该order详情页面
          navigateToUrl(isGroup ? `/my/server/group/order/detail/${orderId}` : `/my/server/personal/order/detail/${orderId}`)
        } catch (exception) {
          exceptionNotifier(exception)
        }
      })
    },
    /* 支付订单 */

    /* 取消订单 */
    cancelOrderDialog (orderId: string, isGroup = false) {
      Dialog.create({
        component: OrderCancelDialog,
        componentProps: {
          orderId,
          isGroup
        }
      }).onOk(async (val: boolean) => {
        if (val) {
          try {
            void await api.server.order.postOrderIdCancel({
              path: {
                id: orderId
              }
            })
            Notify.create({
              classes: 'notification-positive shadow-15',
              icon: 'mdi-check-circle',
              textColor: 'positive',
              message: `${tc('store.notify.cancel_order_success')}`,
              position: 'bottom',
              closeBtn: true,
              timeout: 5000,
              multiLine: false
            })
            // 更新orderId对应order
            void await this.loadSingleOrder({
              isGroup,
              orderId
            })
            // 跳转到该order详情页面
            navigateToUrl(isGroup ? `/my/server/group/order/detail/${orderId}` : `/my/server/personal/order/detail/${orderId}`)
          } catch (exception) {
            exceptionNotifier(exception)
          }
        }
      })
    },
    /* 取消订单 */

    /* 续费下订单 */
    renewOrderDialog (serverId: string, isGroup = false) {
      Dialog.create({
        component: OrderRenewDialog,
        componentProps: {
          serverId,
          isGroup
        }
      }).onOk(async (val: { period?: number, renew_to_time?: string }) => {
        try {
          const respPostServerRenew = await api.server.server.postServerRenew({
            path: { id: serverId },
            query: val
          })
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'positive',
            message: `${tc('store.notify.renew_order_success')}`,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
          // 更新orderId对应order
          const orderId = respPostServerRenew.data.order_id
          void await this.loadSingleOrder({
            isGroup,
            orderId
          })
          // 跳转到该order详情页面
          navigateToUrl(isGroup ? `/my/server/group/order/detail/${orderId}` : `/my/server/personal/order/detail/${orderId}`)
        } catch (exception) {
          exceptionNotifier(exception)
        }
      })
    },
    /* 续费下订单 */

    /* 取回资源 */
    async reclaimOrderResource (orderId: string, isGroup = false) {
      Notify.create({
        classes: 'notification-positive shadow-15',
        // icon: 'mdi-check-circle',
        spinner: true,
        textColor: 'positive',
        message: `${tc('orderResourceReclaiming')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      try {
        void await api.server.order.postOrderIdClaim({ path: { id: orderId } })
        Notify.create({
          classes: 'notification-positive shadow-15',
          icon: 'mdi-check-circle',
          textColor: 'positive',
          message: `${tc('orderResourceReclaimSuccess')}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })

        // 更新orderId对应order
        void await this.loadSingleOrder({
          isGroup,
          orderId
        })

        // 拿到更新后的order对象
        const orderNew = isGroup ? this.tables.groupOrderTable.byId[orderId] : this.tables.personalOrderTable.byId[orderId]

        // 更新order交付的server
        const serverId = orderNew?.resources[0]?.instance_id
        if (serverId) {
          // 限制最大自动取回次数，避免死循环
          const MAX_COUNT = 10
          let count = 0
          // 持续尝试取回交付的server信息
          const timerId = setInterval(
            async () => {
              // 取回server信息
              void await this.loadSingleServer({
                isGroup,
                serverId
              })
              // 计数
              count += 1
              // 表里存在该server则表示取回成功，消除timer
              if (isGroup ? this.tables.groupServerTable.byId[serverId] : this.tables.personalServerTable.byId[serverId]) {
                clearInterval(timerId)
              }
              // 超过次数取消自动取回
              if (count === MAX_COUNT) {
                clearInterval(timerId)
              }
            }, 1000)
        }

        // 当前订单所属的group
        const groupId = orderNew?.vo_id

        // 更新order影响的余额
        isGroup ? await this.loadSingleGroupStats({ groupId }) : await this.loadPersonalBalance()

        // 更新order影响的coupon， 暂时为整体更新table，可以细化为singleGroupCoupon/singlePersonalCoupon
        isGroup ? await this.loadGroupCouponTable({ groupId }) : await this.loadPersonalCouponTable()

        // 跳转到该order详情页面
        navigateToUrl(isGroup ? `/my/server/group/order/detail/${orderId}` : `/my/server/personal/order/detail/${orderId}`)
      } catch (exception) {
        exceptionNotifier(exception)
      }
    },
    /* 取回资源 */
    /* order */

    /* coupon */
    // 传入groupId则默认选中该组
    redeemCouponDialog (groupId?: string) {
      // load group table
      this.softLoadGroupBasicTables()
      // dialog
      Dialog.create({
        component: RedeemCouponDialog,
        componentProps: {
          groupId
        }
      })
    },
    /* coupon */

    /* disk */
    // 挂载云硬盘。云主机和云硬盘的入口都在这里。
    mountDiskDialog (group?: GroupInterface, disk?: DiskInterface, server?: ServerInterface) {
      // dialog
      Dialog.create({
        component: MountDiskDialog,
        componentProps: {
          group,
          disk,
          server
        }
      })
    },
    // 卸载云硬盘。云硬盘的入口
    unmountDiskDialog (group?: GroupInterface, disk?: DiskInterface) {
      // dialog
      Dialog.create({
        component: UnmountDiskDialog,
        componentProps: {
          group,
          disk
        }
      })
    },
    // 删除云硬盘
    deleteDiskDialog (disk: DiskInterface) {
      // dialog
      Dialog.create({
        component: DeleteDiskDialog,
        componentProps: {
          disk
        }
      })
    }

    /* disk */

    /* dialogs */
  }
})
