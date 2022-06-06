/* eslint-disable camelcase */

import { defineStore } from 'pinia'
import { normalize, schema } from 'normalizr'
import { axios, baseURLServer } from 'boot/axios'
import api from 'src/api'
import { i18n } from 'boot/i18n'
import { Dialog, Notify } from 'quasar'
import { navigateToUrl } from 'single-spa'

import ServerDeleteDialog from 'components/server/ServerDeleteDialog.vue'
import ServerRebuildDialog from 'components/server/ServerRebuildDialog.vue'
import GroupEditCard from 'components/group/GroupEditCard.vue'
import GroupAddMemberCard from 'components/group/GroupAddMemberCard.vue'

// @ts-expect-error
import { useStoreMain } from '@cnic/main'

const actionMap = new Map<string, string>(
  [
    ['start', '开机'],
    ['reboot', '重启'],
    ['shutdown', '关机'],
    ['poweroff', '强制断电'],
    ['delete', '删除'],
    ['delete_force', '强制删除']
  ]
)

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
  // 余额
  balance: string // groupBalanceTable 内的id值
  // 订单
  order: string[] // orderId
}

export interface SingleMemberInterface {
  id: string
  user: {
    id: string
    username: string
  }
  role: 'member' | 'leader'
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

  // 来自service接口
  services: string[] // 全部services汇总
  // personalServices: string[] // 用户可用services汇总
}

export interface ServiceInterface {
  // 来自service接口
  id: string
  name: string
  name_en: string
  service_type: string
  add_time: string
  need_vpn: boolean
  status: number
  data_center: string
  longitude: number
  latitude: number
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
  service: string
}

export interface FlavorInterface {
  id: string
  vcpus: number
  ram: number
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
}

export interface ImageInterface {
  // 来自image接口
  id: string // 原始id
  name: string
  system: string
  system_type: string
  creation_time: string
  desc: string
  default_user: string
  default_password: string
  // 根据查询时所填的serviceId补充
  service: string
  localId: string
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
  expiration_time: string | null
  remarks: string
  classification: string
  image_id: string
  image_desc: string
  default_user: string
  default_password: string
  endpoint_url: string
  service: string
  user_quota: string
  center_quota: number
  vo_id: string | null
  user: {
    id: string
    username: string
  }
  lock: 'free' | 'lock-delete' | 'lock-operation'

  // 来自status接口 根据status_code映射为文字状态
  vnc?: string
  status?: string
}

export interface OrderResourceInterface {
  id: string
  order_id: string
  resource_type: string
  instance_id: string
  instance_status: string
}

export interface OrderInterface {
  id: string
  order_type: string
  status: string
  total_amount: string
  pay_amount: string
  service_id: string
  service_name: string
  resource_type: string
  instance_config: {
    vm_cpu: number
    vm_ram: number
    vm_systemdisk_size: number
    vm_public_ip: boolean
    vm_image_id: string
    vm_network_id: number
    vm_azone_id: string
    vm_azone_name: string
  },
  period: 1,
  payment_time: null,
  pay_type: string
  creation_time: string
  user_id: string
  username: string
  vo_id: string
  vo_name: string
  owner_type: string
  resources?: OrderResourceInterface
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
  status: 'init' | 'loading' | 'total'
}

// 累计加载表
export interface partTable {
  status: 'init' | 'loading' | 'part'
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

// 组的余额table: balanceId -> balance
export interface GroupBalanceTableInterface extends totalTable, idTable<GroupBalanceInterface> {
}

// 组订单table
export interface GroupOrderTableInterface extends totalTable, idTable<OrderInterface> {
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

// 服务管理员能看到的，当前服务下创建的所有云主机
export interface AdminServerTableInterface extends totalTable, idTable<ServerInterface> {
}

// 所有人一样的云主机配置选项
export interface FedFlavorTableInterface extends totalTable, idTable<FlavorInterface> {
}

// 联邦配额赠送活动
// export interface FedQuotaActivityTableInterface extends totalTable, idTable<QuotaActivity> {
// }

// 服务内通行的网络配置
export interface ServiceNetworkTableInterface extends totalTable, localIdTable<NetworkInterface> {
}

// 服务内通行的镜像配置
export interface ServiceImageTableInterface extends totalTable, localIdTable<ImageInterface> {
}

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
export interface GroupServerTableInterface extends totalTable, idTable<ServerInterface> {
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
        groupBalanceTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as GroupBalanceTableInterface,
        groupOrderTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as GroupOrderTableInterface,
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
        // adminQuotaApplicationTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as AdminQuotaApplicationTableInterface,
        adminServerTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as AdminServerTableInterface,
        fedFlavorTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as FedFlavorTableInterface,
        // fedQuotaActivityTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as FedQuotaActivityTableInterface,
        serviceNetworkTable: {
          byLocalId: {},
          allLocalIds: [],
          status: 'init'
        } as ServiceNetworkTableInterface,
        serviceImageTable: {
          byLocalId: {},
          allLocalIds: [],
          status: 'init'
        } as ServiceImageTableInterface,
        userVpnTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as UserVpnTableInterface,
        // personalQuotaApplicationTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as PersonalQuotaApplicationTableInterface,
        // personalQuotaTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as PersonalQuotaTableInterface,
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
        // groupQuotaApplicationTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as GroupQuotaApplicationTableInterface,
        // groupQuotaTable: {
        //   byId: {},
        //   allIds: [],
        //   status: 'init'
        // } as GroupQuotaTableInterface,
        groupServerTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as GroupServerTableInterface
        /* 整体加载表：一旦加载则全部加载 */

        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */
        //
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
    getGroupsByFilter: (state) => (filter: string): GroupInterface[] => {
      // 排序函数，按照组创建时间降序排列
      const sortFn = (a: GroupInterface, b: GroupInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
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
      return newArr.sort(sortFn)
    },
    // 根据myRole返回group数组
    getGroupsByMyRole: (state) => (roles: string[]): GroupInterface[] => {
      // 排序函数，按照组创建时间降序排列
      const sortFn = (a: GroupInterface, b: GroupInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
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
    getServiceCpuPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.serviceAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        dataObj.name = state.tables.serviceTable.byId[item]?.name
        dataObj.value = state.tables.serviceAllocationTable.byId[item]?.vcpu_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getServiceRamPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.serviceAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        dataObj.name = state.tables.serviceTable.byId[item]?.name
        dataObj.value = state.tables.serviceAllocationTable.byId[item]?.ram_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getServiceDiskPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.serviceAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        dataObj.name = state.tables.serviceTable.byId[item]?.name
        dataObj.value = state.tables.serviceAllocationTable.byId[item]?.disk_size_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getFedCpuPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.fedAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        dataObj.name = state.tables.serviceTable.byId[item]?.name
        dataObj.value = state.tables.fedAllocationTable.byId[item]?.vcpu_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getFedRamPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.fedAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        dataObj.name = state.tables.serviceTable.byId[item]?.name
        dataObj.value = state.tables.fedAllocationTable.byId[item]?.ram_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getFedDiskPie (state): Record<string, string | number>[] {
      const dataArr: Record<string, string | number>[] = []
      for (const item of state.tables.fedAllocationTable.allIds) {
        const dataObj: Record<string, string | number> = {}
        dataObj.name = state.tables.serviceTable.byId[item]?.name
        dataObj.value = state.tables.fedAllocationTable.byId[item]?.disk_size_total
        dataArr.push(dataObj)
      }
      return dataArr
    },
    getMechanismTree (state): Record<string, string | number | object>[] {
      const treeData = []
      for (const item of state.tables.dataCenterTable.allIds) {
        const treeObj: Record<string, string | number | object> = {}
        treeObj.label = state.tables.dataCenterTable.byId[item]?.name
        treeObj.id = state.tables.dataCenterTable.byId[item]?.id
        const dataArr = []
        for (const childItem of state.tables.dataCenterTable.byId[item]?.services) {
          const dataObj: Record<string, string | boolean> = {}
          dataObj.label = state.tables.serviceTable.byId[childItem]?.name
          dataObj.id = state.tables.serviceTable.byId[childItem]?.id
          dataObj.noTick = true
          dataArr.push(dataObj)
        }
        treeObj.children = dataArr
        treeData.push(treeObj)
      }
      return treeData
    },
    getServices (state): { value: string; label: string; }[] {
      const serviceOptions = []
      for (const group of Object.values(state.tables.serviceTable.byId)) {
        serviceOptions.push(
          {
            value: group.id,
            label: group.name
          }
        )
      }
      serviceOptions.unshift({
        value: '',
        label: i18n.global.locale === 'zh' ? '全部服务' : 'All Groups'
      })
      return serviceOptions
    },
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
        defaultTicked.push(dataCenter.name)
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
    //   const sortFn = (a: QuotaApplicationInterface, b: QuotaApplicationInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
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
        value: '',
        label: '全部服务节点',
        labelEn: 'All Service Nodes'
      })
      return services
    },
    getAdminServers (state): ServerInterface[] {
      // 排序函数，根据申请时间降序排列
      const sortFn = (a: ServerInterface, b: ServerInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
      const rows: ServerInterface[] = []
      for (const application of Object.values(state.tables.adminServerTable.byId)) {
        rows.push(application)
      }
      return rows.sort(sortFn)
    },
    // 根据用户选择的filter来返回application数组
    // getPersonalApplicationsByFilter: (state) => (filter: string): QuotaApplicationInterface[] => {
    //   // 排序函数，根据申请时间降序排列
    //   const sortFn = (a: QuotaApplicationInterface, b: QuotaApplicationInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
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
    //   const sortFn = (a: QuotaApplicationInterface, b: QuotaApplicationInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
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
    getPublicNetworksByServiceId: (state) => (serviceId: string): NetworkInterface[] => {
      return Object.values(state.tables.serviceNetworkTable.byLocalId).filter(network => network.public && network.service === serviceId)
    },
    getPrivateNetworksByServicedId: (state) => (serviceId: string): NetworkInterface[] => {
      return Object.values(state.tables.serviceNetworkTable.byLocalId).filter(network => !network.public && network.service === serviceId)
    },
    getImagesByServiceId: (state) => (serviceId: string): ImageInterface[] => {
      return Object.values(state.tables.serviceImageTable.byLocalId).filter(image => image.service === serviceId).sort((a, b) => a.name.localeCompare(b.name, 'en'))
    },
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
      const sortFn = (a: ServerInterface, b: ServerInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()

      if (serviceId === '0') {
        return Object.values(state.tables.personalServerTable.byId).sort(sortFn)
      } else {
        const rows: ServerInterface[] = []
        for (const server of Object.values(state.tables.personalServerTable.byId)) {
          if (server.service === serviceId) {
            rows.push(server)
          }
        }
        return rows.sort(sortFn)
      }
    },
    // 根据用户选择的serviceId来返回order数组
    getPersonalOrdersByServiceId: (state) => (serviceId: string): OrderInterface[] => {
      // 排序函数，根据云主机创建时间降序排列
      const sortFn = (a: OrderInterface, b: OrderInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()

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
    //   const sortFn = (a: QuotaApplicationInterface, b: QuotaApplicationInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
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
      const sortFn = (a: ServerInterface, b: ServerInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
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
      const sortFn = (a: OrderInterface, b: OrderInterface) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime()
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
    // 个人有quota(全部quota,包括过期和不可用)和server的serviceId
    getPersonalAvailableServiceIds: (state): string[] => {
      let services = [] as string[]
      // todo server + 点 + 券 ？
      // state.tables.personalQuotaTable.allIds.forEach((id) => services.unshift(state.tables.personalQuotaTable.byId[id].service))
      state.tables.personalServerTable.allIds.forEach((id) => services.unshift(state.tables.personalServerTable.byId[id].service))
      services = [...new Set(services)]
      return services
    },
    // 全部quota和server对应的services
    getPersonalAvailableServices (state): { value: string; label: string; }[] {
      /*    数据结构如下
      const serviceOptions = [
        {        value: '0',
          label: '全部节点',
          labelEn: 'All Service Nodes'
        }
      ]
  */
      const serviceIds = this.getPersonalAvailableServiceIds as string[]

      let serviceOptions = serviceIds.map((serviceId) => ({
        value: serviceId,
        label: state.tables.dataCenterTable.byId[state.tables.serviceTable.byId[serviceId]?.data_center]?.name + ' - ' + state.tables.serviceTable.byId[serviceId]?.name,
        labelEn: state.tables.dataCenterTable.byId[state.tables.serviceTable.byId[serviceId]?.data_center]?.name_en + ' - ' + state.tables.serviceTable.byId[serviceId]?.name_en
      }))

      // 排序
      serviceOptions = serviceOptions.sort((a, b) => -a.label.localeCompare(b.label, 'zh-CN'))
      // vue组件外取i18n中locale字段的方法
      // i18n.global.locale === 'zh'
      serviceOptions.unshift({
        value: '0',
        label: '全部服务节点',
        labelEn: 'All Service Nodes'
      })
      return serviceOptions
    },
    // 获取个人有quota/server的vpn对象
    getPersonalAvailableVpns (state): VpnInterface[] {
      // service.need_vpn才加入
      const serviceIds = this.getPersonalAvailableServiceIds.filter((serviceId: string) => state.tables.serviceTable.byId[serviceId]?.need_vpn) as string[]
      // serviceId -> service对象
      return serviceIds.map((serviceId) => state.tables.userVpnTable.byId[serviceId])
    }
  },
  actions: {

    /* items */
    async loadAllItems () {
      this.loadServerRole()
      this.loadPersonalBalance()
    },
    async loadServerRole () {
      const respGetUserPermissionPolicy = await api.server.user.getUserPermissionPolicy()
      if (respGetUserPermissionPolicy.status === 200) {
        this.items.fedRole = respGetUserPermissionPolicy.data.role
        this.items.adminServiceIds = respGetUserPermissionPolicy.data.vms.service_ids
      }
    },
    async loadPersonalBalance () {
      const respGetAccountBalanceUser = await api.server.account.getAccountBalanceUser()
      if (respGetAccountBalanceUser.status === 200) {
        this.items.personalBalance = respGetAccountBalanceUser.data
      }
    },
    /* items */

    /* load tables */

    // 强制加载group相关table
    forceLoadGroupModuleTable () {
      void this.loadGroupTable().then(() => {
        // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
        void this.loadGroupMemberTable().then(() => {
          // 注意：此表依赖groupTable中的myRole字段，而该字段是loadGroupMemberTableFromGroup副产品，所以产生依赖
          // void this.loadGroupQuotaApplicationTable()
        })
        void this.loadGroupServerTable()
        void this.loadGroupOrderTable() // 如果要把orderId补充进server实例里，则应在groupServerTable加载后加载
        // void this.loadGroupQuotaTable()
        void this.loadGroupBalanceTable()
      })
    },
    loadAllTables () {
      if (this.tables.dataCenterTable.status === 'init') {
        void this.loadDataCenterTable().then(() => { // 1. 基础依赖
          if (this.tables.serviceTable.status === 'init') {
            void this.loadServiceTable().then(() => { // 2. 基础依赖
              if (this.tables.serviceAllocationTable.status === 'init') {
                void this.loadServiceAllocationTable()
              }
              if (this.tables.fedAllocationTable.status === 'init') {
                void this.loadFedAllocationTable()
              }
              if (this.tables.userVpnTable.status === 'init') {
                void this.loadUserVpnTable()
              }
              if (this.tables.serviceNetworkTable.status === 'init') {
                void this.loadServiceNetworkTable()
              }
              if (this.tables.serviceImageTable.status === 'init') {
                void this.loadServiceImageTable()
              }
              if (this.tables.personalServerTable.status === 'init') {
                void this.loadPersonalServerTable()
              }
              if (this.tables.personalOrderTable.status === 'init') {
                void this.loadPersonalOrderTable() // 如果要把orderId补充进server实例里，则应在personalServerTable加载后加载
              }
            })
          }
        })
      }

      if (this.tables.fedFlavorTable.status === 'init') {
        void this.loadFedFlavorTable()
      }
      // if (this.tables.personalQuotaTable.status === 'init') {
      //   void this.loadPersonalQuotaTable()
      // }
      // if (this.tables.personalQuotaApplicationTable.status === 'init') {
      //   void this.loadPersonalQuotaApplicationTable()
      // }
      // if (this.tables.fedQuotaActivityTable.status === 'init') {
      //   void this.loadFedQuotaActivityTable()
      // }

      if (this.tables.groupTable.status === 'init') {
        void this.loadGroupTable().then(() => {
          // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
          if (this.tables.groupMemberTable.status === 'init') {
            void this.loadGroupMemberTable().then(() => {
              // 注意：此表依赖groupTable中的myRole字段，而该字段是loadGroupMemberTableFromGroup副产品，所以产生依赖
              // if (this.tables.groupQuotaApplicationTable.status === 'init') {
              //   void this.loadGroupQuotaApplicationTable()
              // }
            })
          }
          if (this.tables.groupServerTable.status === 'init') {
            void this.loadGroupServerTable()
          }
          if (this.tables.groupOrderTable.status === 'init') {
            void this.loadGroupOrderTable() // 如果要把orderId补充进server实例里，则应在groupServerTable加载后加载
          }
          // if (this.tables.groupQuotaTable.status === 'init') {
          //   void this.loadGroupQuotaTable()
          // }
          if (this.tables.groupBalanceTable.status === 'init') {
            void this.loadGroupBalanceTable()
          }
        })
      }

      // 以下表格为分页，在页面自身加载时load
      // if (!context.rootState.provider.tables.adminQuotaApplicationTable.isLoaded) {
      //   void context.dispatch('provider/loadAdminQuotaApplicationTable', null, { root: true })
      // }
    },

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
          order: []
        })
        // normalize
        const normalizedData = normalize(data, group)
        // 保存table
        Object.assign(this.tables.groupTable.byId, normalizedData.entities.group)
        this.tables.groupTable.allIds.unshift(Object.keys(normalizedData.entities.group as Record<string, unknown>)[0])
        this.tables.groupTable.allIds = [...new Set(this.tables.groupTable.allIds)]
      }
      // load table的最后再改status
      this.tables.groupTable.status = 'total'
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
      }
      // load table的最后再改status
      this.tables.groupMemberTable.status = 'total'
    },
    // 根据groupTable, 建立groupBalanceTable
    async loadGroupBalanceTable () {
      // 先清空table，避免多次更新时数据累加
      this.tables.groupBalanceTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.groupBalanceTable.status = 'loading'
      for (const groupId of this.tables.groupTable.allIds) {
        const respGroupBalance = await api.server.account.getAccountBalanceVo({ path: { vo_id: groupId } })
        // normalize
        const groupBalance = new schema.Entity('groupBalance')
        const normalizedData = normalize(respGroupBalance.data, groupBalance)
        // // 存入state
        Object.assign(this.tables.groupBalanceTable.byId, normalizedData.entities.groupBalance)
        this.tables.groupBalanceTable.allIds.unshift(Object.keys(normalizedData.entities.groupBalance as Record<string, unknown>)[0])
        this.tables.groupBalanceTable.allIds = [...new Set(this.tables.groupBalanceTable.allIds)]
        // 给groupTable补充balance字段
        this.tables.groupTable.byId[groupId].balance = respGroupBalance.data.id
      }
      // load table的最后再改status
      this.tables.groupMemberTable.status = 'total'
    },
    // 根据groupTable, 建立groupOrderTable
    async loadGroupOrderTable () {
      this.tables.groupOrderTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.groupOrderTable.status = 'loading'
      for (const groupId of this.tables.groupTable.allIds) {
        const respGetOrder = await api.server.order.getOrder({ query: { vo_id: groupId } })
        const order = new schema.Entity('order')
        for (const data of respGetOrder.data.orders) {
          // orderId补充进group的order字段
          this.tables.groupTable.byId[groupId].order.push(data.id)
          // get order details
          const respGetOrderId = await api.server.order.getOrderId({ path: { id: data.id } })
          const normalizedData = normalize(respGetOrderId.data, order)
          Object.assign(this.tables.groupOrderTable.byId, normalizedData.entities.order)
          this.tables.groupOrderTable.allIds.unshift(Object.keys(normalizedData.entities.order as Record<string, unknown>)[0])
          this.tables.groupOrderTable.allIds = [...new Set(this.tables.groupOrderTable.allIds)]
        }
      }
      this.tables.groupOrderTable.status = 'total'
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
      // load table的最后再改isLoaded
      this.tables.dataCenterTable.status = 'total'
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
      const respService = await api.server.service.getService()
      // 将响应normalize，存入state里的serviceTable
      const data_center = new schema.Entity('data_center')
      const service = new schema.Entity('service', { data_center })
      respService.data.results.forEach((data: Record<string, never>) => {
        const normalizedData = normalize(data, service)
        Object.assign(this.tables.serviceTable.byId, normalizedData.entities.service)
        this.tables.serviceTable.allIds.unshift(Object.keys(normalizedData.entities.service as Record<string, unknown>)[0])
        this.tables.serviceTable.allIds = [...new Set(this.tables.serviceTable.allIds)]
        // 将本serviceId补充进对应dataCenter的services字段
        this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].data_center].services.unshift(Object.values(normalizedData.entities.service!)[0].id)
        this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].data_center].services = [...new Set(this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].data_center].services)]
      })
      // load table的最后再改isLoaded
      this.tables.serviceTable.status = 'total'
    },
    /* serviceAllocationTable */
    async loadServiceAllocationTable () {
      this.tables.serviceAllocationTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.serviceAllocationTable.status = 'loading'
      const respPQuota = await api.server.vms.getVmsServicePQuota()
      const service = new schema.Entity('service')
      const allocation = new schema.Entity('allocation', { service })
      for (const data of respPQuota.data.results) {
        Object.assign(data, { id: data.service.id })
        const normalizedData = normalize(data, allocation)
        Object.assign(this.tables.serviceAllocationTable.byId, normalizedData.entities.allocation)
        this.tables.serviceAllocationTable.allIds.unshift(Object.keys(normalizedData.entities.allocation as Record<string, unknown>)[0])
        this.tables.serviceAllocationTable.allIds = [...new Set(this.tables.serviceAllocationTable.allIds)]
      }
      // load table的最后再改isLoaded
      this.tables.serviceAllocationTable.status = 'total'
    },
    /* fedAllocationTable */
    async loadFedAllocationTable () {
      this.tables.fedAllocationTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.fedAllocationTable.status = 'loading'
      const respSQuota = await api.server.vms.getVmsServiceSQuota()
      const service = new schema.Entity('service')
      const allocation = new schema.Entity('allocation', { service })
      for (const data of respSQuota.data.results) {
        Object.assign(data, { id: data.service.id })
        const normalizedData = normalize(data, allocation)
        Object.assign(this.tables.fedAllocationTable.byId, normalizedData.entities.allocation)
        this.tables.fedAllocationTable.allIds.unshift(Object.keys(normalizedData.entities.allocation as Record<string, unknown>)[0])
        this.tables.fedAllocationTable.allIds = [...new Set(this.tables.fedAllocationTable.allIds)]
      }
      // load table的最后再改isLoaded
      this.tables.fedAllocationTable.status = 'total'
    },
    // 代码风格不好
    // async loadAdminQuotaApplicationTable (payload?: {
    //   page?: number;
    //   pageSize?: number;
    //   serviceId?: string;
    //   status?: 'wait' | 'pending' | 'pass' | 'reject' | 'cancel'
    // }) {
    //   this.tables.adminQuotaApplicationTable = {
    //     byId: {},
    //     allIds: [],
    //     status: 'init'
    //   }
    //   // 获取数据并更新table
    //   const respApply = await api.server.apply.getApplyQuotaAdmin({
    //     query: {
    //       deleted: false,
    //       // ...(payload?.serviceId) && { service: payload.serviceId }, // 有条件添加属性 https://stackoverflow.com/a/40560953
    //       // ...(payload?.status) && { status: [payload.status as string] }
    //       page: payload?.page,
    //       page_size: payload?.pageSize,
    //       service: payload?.serviceId,
    //       status: [payload?.status as string]
    //     }
    //   })
    //   // 再向详情接口发送请求
    //   const service = new schema.Entity('service')
    //   const quotaApplication = new schema.Entity('quotaApplication', { service })
    //   for (const data of respApply.data.results) {
    //     const respApplyDetail = await api.server.apply.getApplyQuotaApplyIdAdmin({ path: { apply_id: data.id } })
    //     const normalizedData = normalize(respApplyDetail.data, quotaApplication)
    //     Object.assign(this.tables.adminQuotaApplicationTable.byId, normalizedData.entities.quotaApplication)
    //     this.tables.adminQuotaApplicationTable.allIds.unshift(Object.keys(normalizedData.entities.quotaApplication as Record<string, unknown>)[0])
    //     this.tables.adminQuotaApplicationTable.allIds = [...new Set(this.tables.adminQuotaApplicationTable.allIds)]
    //   }
    //   // load table的最后再改isLoaded
    //   this.tables.adminQuotaApplicationTable.status = 'total'
    //   // 返回count值
    //   return respApply.data.count
    // },
    // 代码风格不好
    async loadAdminServerTable (payload: { page?: number; page_size?: number }) {
      this.tables.adminServerTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.adminServerTable.status = 'loading'
      const respGroupServer = await api.server.server.getServer({ query: payload })
      const service = new schema.Entity('service')
      const server = new schema.Entity('server', { service })
      // if (respGroupServer.data) {
      for (const data of respGroupServer.data.servers) {
        const normalizedData = normalize(data, server)
        Object.assign(this.tables.adminServerTable.byId, normalizedData.entities.server)
        this.tables.adminServerTable.allIds.unshift(Object.keys(normalizedData.entities.server as Record<string, unknown>)[0])
        this.tables.adminServerTable.allIds = [...new Set(this.tables.adminServerTable.allIds)]
      }
      // load table的最后再改isLoaded
      this.tables.adminServerTable.status = 'total'
      // }
      return respGroupServer
    },
    async loadFedFlavorTable () {
      this.tables.fedFlavorTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.fedFlavorTable.status = 'loading'
      const respFlavor = await api.server.flavor.getFlavor()
      for (const flavor of respFlavor.data.flavors) {
        Object.assign(this.tables.fedFlavorTable.byId, { [flavor.id]: flavor })
        this.tables.fedFlavorTable.allIds.unshift(Object.keys({ [flavor.id]: flavor } as Record<string, unknown>)[0])
        this.tables.fedFlavorTable.allIds = [...new Set(this.tables.fedFlavorTable.allIds)]
      }
      // load table的最后再改isLoaded
      this.tables.fedFlavorTable.status = 'total'
    },
    async loadServiceNetworkTable () {
      for (const serviceId of this.tables.serviceTable.allIds) {
        const respNetwork = await api.server.network.getNetwork({ query: { service_id: serviceId } })
        for (const network of respNetwork.data) {
          // 将service 和 localId补充进network对象
          Object.assign(network, {
            service: serviceId,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            localId: `${serviceId}-${network.id}`
          })
          Object.assign(this.tables.serviceNetworkTable.byLocalId, { [network.localId]: network })
          this.tables.serviceNetworkTable.allLocalIds.unshift(Object.keys({ [network.localId]: network } as Record<string, unknown>)[0])
          this.tables.serviceNetworkTable.allLocalIds = [...new Set(this.tables.serviceNetworkTable.allLocalIds)]
        }
      }
      // load table的最后再改isLoaded
      this.tables.serviceNetworkTable.status = 'total'
    },
    async loadServiceImageTable () {
      for (const serviceId of this.tables.serviceTable.allIds) {
        const respImage = await api.server.image.getImage({ query: { service_id: serviceId } })
        for (const image of respImage.data) {
          // 将service 和 localId补充进image对象
          Object.assign(image, {
            service: serviceId,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            localId: `${serviceId}-${image.id}`
          })
          Object.assign(this.tables.serviceImageTable.byLocalId, { [image.localId]: image })
          this.tables.serviceImageTable.allLocalIds.unshift(Object.keys({ [image.localId]: image } as Record<string, unknown>)[0])
          this.tables.serviceImageTable.allLocalIds = [...new Set(this.tables.serviceImageTable.allLocalIds)]
        }
      }
      // load table的最后再改isLoaded
      this.tables.serviceImageTable.status = 'total'
    },
    async loadUserVpnTable () {
      this.tables.userVpnTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.userVpnTable.status = 'loading'
      for (const serviceId of this.tables.serviceTable.allIds) {
        if (this.tables.serviceTable.byId[serviceId]?.need_vpn) {
          const respVpn = await api.server.vpn.getVpn({ path: { service_id: serviceId } })
          Object.assign(respVpn.data.vpn, { id: serviceId })
          Object.assign(this.tables.userVpnTable.byId, { [serviceId]: respVpn.data.vpn })
          this.tables.userVpnTable.allIds.unshift(Object.keys({ [serviceId]: respVpn.data.vpn } as Record<string, unknown>)[0])
          this.tables.userVpnTable.allIds = [...new Set(this.tables.userVpnTable.allIds)]
        }
      }
      // load table的最后再改isLoaded
      this.tables.userVpnTable.status = 'total'
    },
    // async loadPersonalQuotaTable () {
    //   // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
    //   this.tables.personalQuotaTable = {
    //     byId: {},
    //     allIds: [],
    //     status: 'init'
    //   }
    //   // 将响应normalize
    //   const respQuota = await api.server.quota.getQuota({ query: { deleted: false } })
    //   const service = new schema.Entity('service')
    //   const quota = new schema.Entity('quota', { service })
    //   // quota数组
    //   for (const data of respQuota.data.results) {
    //     /* 增加补充字段 */
    //     // 获取quota下对应的server列表
    //     const respQuotaServers = await api.server.quota.getQuotaServers({ path: { id: data.id } })
    //     const servers: string[] = []
    //     respQuotaServers.data.results.forEach((server: ServerInterface) => {
    //       servers.push(server.id)
    //     })
    //     // 给data增加servers字段
    //     Object.assign(data, { servers })
    //     // 给data增加expired字段
    //     const expired = !!data.expiration_time && (new Date(data.expiration_time).getTime() < new Date().getTime())
    //     Object.assign(data, { expired })
    //     // 给data增加exhausted字段,该字段的判断方式可能后期更改
    //     const exhausted = data.vcpu_used === data.vcpu_total || data.ram_used === data.ram_total || (data.private_ip_used === data.private_ip_total && data.public_ip_used === data.public_ip_total)
    //     Object.assign(data, { exhausted })
    //     /* 增加补充字段 */
    //
    //     // normalize data
    //     const normalizedData = normalize(data, quota)
    //     Object.assign(this.tables.personalQuotaTable.byId, normalizedData.entities.quota)
    //     this.tables.personalQuotaTable.allIds.unshift(Object.keys(normalizedData.entities.quota as Record<string, unknown>)[0])
    //     this.tables.personalQuotaTable.allIds = [...new Set(this.tables.personalQuotaTable.allIds)]
    //   }
    //   // load table的最后再改isLoaded
    //   this.tables.personalQuotaTable.status = 'total'
    // },
    // 加载personalOrderTable
    async loadSingleOrder (payload: {
      isGroup: boolean,
      orderId: string
    }) {
      if (payload.isGroup) {
        const respGetOrderId = await api.server.order.getOrderId({ path: { id: payload.orderId } })
        // groupTable补充order字段
        this.tables.groupTable.byId[respGetOrderId.data.vo_id].order.push(payload.orderId)
        // 补充groupOrderTable
        const order = new schema.Entity('order')
        const normalizedData = normalize(respGetOrderId.data, order)
        Object.assign(this.tables.groupOrderTable.byId, normalizedData.entities.order)
        this.tables.groupOrderTable.allIds.unshift(Object.keys(normalizedData.entities.order as Record<string, unknown>)[0])
        this.tables.groupOrderTable.allIds = [...new Set(this.tables.groupOrderTable.allIds)]
      } else {
        const respGetOrderId = await api.server.order.getOrderId({ path: { id: payload.orderId } })
        // 补充personalOrderTable
        const order = new schema.Entity('order')
        const normalizedData = normalize(respGetOrderId.data, order)
        Object.assign(this.tables.personalOrderTable.byId, normalizedData.entities.order)
        this.tables.personalOrderTable.allIds.unshift(Object.keys(normalizedData.entities.order as Record<string, unknown>)[0])
        this.tables.personalOrderTable.allIds = [...new Set(this.tables.personalOrderTable.allIds)]
      }
    },
    async loadPersonalOrderTable () {
      this.tables.personalOrderTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.personalOrderTable.status = 'loading'
      const respGetOrder = await api.server.order.getOrder()
      const order = new schema.Entity('order')
      for (const data of respGetOrder.data.orders) {
        // get order details
        const respGetOrderId = await api.server.order.getOrderId({ path: { id: data.id } })
        const normalizedData = normalize(respGetOrderId.data, order)
        Object.assign(this.tables.personalOrderTable.byId, normalizedData.entities.order)
        this.tables.personalOrderTable.allIds.unshift(Object.keys(normalizedData.entities.order as Record<string, unknown>)[0])
        this.tables.personalOrderTable.allIds = [...new Set(this.tables.personalOrderTable.allIds)]
      }
      this.tables.personalOrderTable.status = 'total'
    },
    // 更新整个userServerTable
    async loadPersonalServerTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.personalServerTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.personalServerTable.status = 'loading'
      // 发送请求
      const respServer = await api.server.server.getServer({ query: { page_size: 999 } })
      // 将响应normalize，存入state里的userServerTable
      const service = new schema.Entity('service')
      const user_quota = new schema.Entity('user_quota')
      const server = new schema.Entity('server', {
        service,
        user_quota
      })
      for (const data of respServer.data.servers) {
        const normalizedData = normalize(data, server)
        Object.assign(this.tables.personalServerTable.byId, normalizedData.entities.server)
        this.tables.personalServerTable.allIds.unshift(Object.keys(normalizedData.entities.server as Record<string, unknown>)[0])
        this.tables.personalServerTable.allIds = [...new Set(this.tables.personalServerTable.allIds)]
      }
      // 建立personalServerTable之后，分别更新每个server status, 并发更新，无需await
      for (const serverId of this.tables.personalServerTable.allIds) {
        this.loadSingleServerStatus({
          isGroup: false,
          serverId
        })
      }
      // 存完所有item再改isLoaded
      this.tables.personalServerTable.status = 'total'
    },
    // 更新整个groupServerTable，调用点在group模块里
    async loadGroupServerTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.groupServerTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.groupServerTable.status = 'loading'
      // 根据groupTable,建立groupServerTable
      for (const groupId of this.tables.groupTable.allIds) {
        // 发送请求
        const respGroupServer = await api.server.server.getServerVo({
          path: {
            vo_id: groupId
          },
          query: {
            page_size: 999
          }
        })
        // 将响应normalize
        const service = new schema.Entity('service')
        const user_quota = new schema.Entity('user_quota')
        const server = new schema.Entity('server', {
          service,
          user_quota
        })
        for (const data of respGroupServer.data.servers) {
          const normalizedData = normalize(data, server)
          Object.assign(this.tables.groupServerTable.byId, normalizedData.entities.server)
          this.tables.groupServerTable.allIds.unshift(Object.keys(normalizedData.entities.server as Record<string, unknown>)[0])
          this.tables.groupServerTable.allIds = [...new Set(this.tables.groupServerTable.allIds)]
        }
      }
      // 建立groupServerTable之后，分别更新每个server status, 并发更新，无需await
      for (const serverId of this.tables.groupServerTable.allIds) {
        this.loadSingleServerStatus({
          isGroup: true,
          serverId
        })
      }
      // load table的最后再改isLoaded
      this.tables.groupServerTable.status = 'total'
    },
    // 获取并保存单个server的status
    async loadSingleServerStatus (payload: {
      // table: {
      //   byId: Record<string, ServerInterface> // 此处固定为ServerInterface
      //   allIds: string[]
      //   isLoaded: boolean
      // }
      isGroup: boolean
      serverId: string
    }) {
      const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable
      // 先清空server status，让状态变为空，UI则显示为获取中
      table.byId[payload.serverId].status = ''
      const respStatus = await api.server.server.getServerStatus({ path: { id: payload.serverId } })
      table.byId[payload.serverId].status = respStatus.data.status.status_code
    },
    // 更新单个server的信息
    async loadSingleServer (payload: { serverId: string; isGroup: boolean }) {
      const respSingleServer = await api.server.server.getServerId({ path: { id: payload.serverId } })
      // 将响应normalize，存入state里的userServerTable
      const service = new schema.Entity('service')
      const user_quota = new schema.Entity('user_quota')
      const server = new schema.Entity('server', {
        service,
        user_quota
      })
      const normalizedData = normalize(respSingleServer.data.server, server)
      if (payload.isGroup) {
        Object.assign(this.tables.groupServerTable.byId, normalizedData.entities.server)
        this.tables.groupServerTable.allIds.unshift(Object.keys(normalizedData.entities.server as Record<string, unknown>)[0])
        this.tables.groupServerTable.allIds = [...new Set(this.tables.groupServerTable.allIds)]
        this.loadSingleServerStatus({
          isGroup: true,
          serverId: payload.serverId
        })
        this.tables.groupServerTable.status = 'total'
      } else {
        Object.assign(this.tables.personalServerTable.byId, normalizedData.entities.server)
        this.tables.personalServerTable.allIds.unshift(Object.keys(normalizedData.entities.server as Record<string, unknown>)[0])
        this.tables.personalServerTable.allIds = [...new Set(this.tables.personalServerTable.allIds)]
        this.loadSingleServerStatus({
          isGroup: false,
          serverId: payload.serverId
        })
        this.tables.personalServerTable.status = 'total'
      }
    },
    // 所有groupQuota根据quotaId存在一个对象里，不区分group，getter里区分group取
    // async loadGroupQuotaTable () {
    //   // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
    //   this.tables.groupQuotaTable = {
    //     byId: {},
    //     allIds: [],
    //     status: 'init'
    //   }
    //   // 根据groupTable,建立groupQuotaTable
    //   for (const groupId of this.tables.groupTable.allIds) {
    //     // 获取响应
    //     const respGroupQuota = await api.server.quota.getQuotaVo({ path: { vo_id: groupId } })
    //     // 将响应normalize
    //     const service = new schema.Entity('service')
    //     const quota = new schema.Entity('quota', { service })
    //     // quota数组
    //     for (const data of respGroupQuota.data.results) {
    //       /* 增加补充字段 */
    //       // 补充vo_id字段
    //       Object.assign(data, { vo_id: groupId })
    //       // 获取quota下对应的server列表
    //       const respQuotaServers = await api.server.quota.getQuotaServers({ path: { id: data.id } })
    //       const servers: string[] = []
    //       respQuotaServers.data.results.forEach((server: ServerInterface) => {
    //         servers.push(server.id)
    //       })
    //       // 给data增加servers字段
    //       Object.assign(data, { servers })
    //       // 给data增加expired字段
    //       const expired = !!data.expiration_time && (new Date(data.expiration_time).getTime() < new Date().getTime())
    //       Object.assign(data, { expired })
    //       // 给data增加exhausted字段,该字段的判断方式可能后期更改
    //       const exhausted = data.vcpu_used === data.vcpu_total ||
    //         data.ram_used === data.ram_total ||
    //         (data.private_ip_used === data.private_ip_total && data.public_ip_used === data.public_ip_total)
    //       Object.assign(data, { exhausted })
    //       /* 增加补充字段 */
    //
    //       // normalize data
    //       const normalizedData = normalize(data, quota)
    //       // 存入groupQuotaTable
    //       Object.assign(this.tables.groupQuotaTable.byId, normalizedData.entities.quota)
    //       this.tables.groupQuotaTable.allIds.unshift(Object.keys(normalizedData.entities.quota as Record<string, unknown>)[0])
    //       this.tables.groupQuotaTable.allIds = [...new Set(this.tables.groupQuotaTable.allIds)]
    //     }
    //   }
    //   // load table的最后再改isLoaded
    //   this.tables.groupQuotaTable.status = 'total'
    // },
    // 默认personalQuotaApplicationTable只保存undeleted的application
    // async loadPersonalQuotaApplicationTable () {
    //   // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
    //   this.tables.personalQuotaApplicationTable = {
    //     byId: {},
    //     allIds: [],
    //     status: 'init'
    //   }
    //   // 再获取数据并更新table
    //   const respApply = await api.server.apply.getApplyQuota({ query: { deleted: false } }) // 不包含已删除的申请
    //   const service = new schema.Entity('service')
    //   const application = new schema.Entity('application', { service })
    //   for (const data of respApply.data.results) {
    //     const normalizedData = normalize(data, application)
    //     Object.assign(this.tables.personalQuotaApplicationTable.byId, normalizedData.entities.application)
    //     this.tables.personalQuotaApplicationTable.allIds.unshift(Object.keys(normalizedData.entities.application as Record<string, unknown>)[0])
    //     this.tables.personalQuotaApplicationTable.allIds = [...new Set(this.tables.personalQuotaApplicationTable.allIds)]
    //   }
    //   // load table的最后再改isLoaded
    //   this.tables.personalQuotaApplicationTable.status = 'total'
    // },
    // async loadGroupQuotaApplicationTable () {
    //   // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
    //   this.tables.groupQuotaApplicationTable = {
    //     byId: {},
    //     allIds: [],
    //     status: 'init'
    //   }
    //   // 根据groupTable,建立groupApplicationTable
    //   for (const groupId of this.tables.groupTable.allIds) {
    //     // member没有权限请求这个接口, owner和leader可以
    //     if (this.tables.groupTable.byId[groupId].myRole !== 'member') {
    //       // 获取响应
    //       const respGroupApplication = await api.server.apply.getApplyQuotaVo({
    //         path: { vo_id: groupId },
    //         query: { deleted: false }
    //       })
    //       // normalize
    //       const service = new schema.Entity('service')
    //       const application = new schema.Entity('application', { service })
    //       // application 数组
    //       for (const data of respGroupApplication.data.results) {
    //         /* 增加补充字段 */
    //         // 补充vo_id字段
    //         Object.assign(data, { vo_id: groupId })
    //         /* 增加补充字段 */
    //         // normalize data
    //         const normalizedData = normalize(data, application)
    //         // 存入
    //         Object.assign(this.tables.groupQuotaApplicationTable.byId, normalizedData.entities.application)
    //         this.tables.groupQuotaApplicationTable.allIds.unshift(Object.keys(normalizedData.entities.application as Record<string, unknown>)[0])
    //         this.tables.groupQuotaApplicationTable.allIds = [...new Set(this.tables.groupQuotaApplicationTable.allIds)]
    //       }
    //     }
    //   }
    //   // load table的最后再改isLoaded
    //   this.tables.groupQuotaApplicationTable.status = 'total'
    // },
    // personal/group quota application table建立时用列举接口，有较少字段；单独更新时从详情接口取，有较多字段，但也只用基本部分。
    // 单独更新personal/groupQuotaApplicationTable里的一个application对象
    // async loadSingleQuotaApplicationStatus (payload: { applicationId: string; isGroup: boolean }) {
    //   // 先清空application的status，显示为获取中。注意不是删除整个application，这样则会丢失整个条目。
    //   const table = payload.isGroup ? this.tables.groupQuotaApplicationTable : this.tables.personalQuotaApplicationTable
    //   table.status = 'init'
    //   // 获取最新的application对象，存入table
    //   const respSingleApplication = await api.server.apply.getApplyQuotaApplyId({ path: { apply_id: payload.applicationId } })
    //   if (respSingleApplication.status === 200) {
    //     if (payload.isGroup) {
    //       // 补充vo_id字段
    //       Object.assign(respSingleApplication.data, { vo_id: respSingleApplication.data.vo.id })
    //     }
    //     // normalize
    //     const service = new schema.Entity('service')
    //     const application = new schema.Entity('application', { service })
    //     const normalizedData = normalize(respSingleApplication.data, application)
    //
    //     Object.assign(table.byId, normalizedData.entities.application)
    //     table.allIds.unshift(Object.keys(normalizedData.entities.application as Record<string, unknown>)[0])
    //     table.allIds = [...new Set(table.allIds)]
    //   }
    // },
    // async loadFedQuotaActivityTable () {
    //   // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新
    //   // 当前没有强制清楚，避免了ui闪烁,但是也没有数据累加
    //   // context.commit('clearTable', context.state.tables.fedQuotaActivityTable)
    //
    //   // 获取数据并更新table
    //   // 当前table内容为筛选出active,排除未开始和已结束的，以后可根据需求全部获取，显示时进行筛选
    //   const respActivity = await api.server.quota_activity.getQuotaActivity({
    //     query: {
    //       status: 'active',
    //       'exclude-not-start': true,
    //       'exclude-ended': true
    //     }
    //   })
    //   // normalize信息
    //   const service = new schema.Entity('service')
    //   const user = new schema.Entity('user')
    //   const quotaActivity = new schema.Entity('quotaActivity', {
    //     service,
    //     user
    //   })
    //   for (const data of respActivity.data.results) {
    //     const normalizedData = normalize(data, quotaActivity)
    //     Object.assign(this.tables.fedQuotaActivityTable.byId, normalizedData.entities.quotaActivity)
    //     this.tables.fedQuotaActivityTable.allIds.unshift(Object.keys(normalizedData.entities.quotaActivity as Record<string, unknown>)[0])
    //     this.tables.fedQuotaActivityTable.allIds = [...new Set(this.tables.fedQuotaActivityTable.allIds)]
    //   }
    //   // load table的最后再改isLoaded
    //   this.tables.fedQuotaActivityTable.status = 'total'
    // },

    /* tables */

    /* dialogs */
    /* server */
    // 打开vnc
    async gotoVNC (id: string) {
      const response = await api.server.server.getServerVnc({ path: { id } })
      const url = response.data.vnc.url
      window.open(url)
    },
    // 下载vpn ca
    fetchCa (serviceId: string) {
      const url = baseURLServer + '/vpn/' + serviceId + '/ca'
      window.open(url)
    },
    // 下载vpn config
    fetchConfig (serviceId: string) {
      const url = baseURLServer + '/vpn/' + serviceId + '/config'
      window.open(url)
    },
    // 修改server.lock的operation状态( lock-delete <-> lock-operation )
    async toggleOperationLock (payload: { serverId: string; isGroup: boolean }) {
      const lock = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId]?.lock : this.tables.personalServerTable.byId[payload.serverId]?.lock
      const newLock = lock === 'lock-operation' ? 'lock-delete' : 'lock-operation'
      const respPostServerLock = await api.server.server.postServerLock({
        query: { lock: newLock },
        path: { id: payload.serverId }
      })
      if (respPostServerLock.status === 200) {
        const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable
        const server = table.byId[payload.serverId]
        server.lock = respPostServerLock.data.lock
      }
    },
    // 修改server.lock的delete状态 ( free <-> lock-delete )
    async toggleDeleteLock (payload: { serverId: string; isGroup: boolean }) {
      const lock = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId]?.lock : this.tables.personalServerTable.byId[payload.serverId]?.lock
      const newLock = lock === 'free' ? 'lock-delete' : 'free'
      const respPostServerLock = await api.server.server.postServerLock({
        query: { lock: newLock },
        path: { id: payload.serverId }
      })
      if (respPostServerLock.status === 200) {
        const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable
        const server = table.byId[payload.serverId]
        server.lock = respPostServerLock.data.lock
      }
    },
    // 修改server.lock的delete状态为lock-delete ( -> lock-delete )
    async toggleDeleteLockToLock (payload: { serverId: string; isGroup: boolean }) {
      const newLock = 'lock-delete'
      const respPostServerLock = await api.server.server.postServerLock({
        query: { lock: newLock },
        path: { id: payload.serverId }
      })
      if (respPostServerLock.status === 200) {
        const table = payload.isGroup ? this.tables.groupServerTable : this.tables.personalServerTable
        const server = table.byId[payload.serverId]
        server.lock = respPostServerLock.data.lock
      }
    },
    // 操作云主机实例时，向endpoint_url发请求； 进行其他云联邦操作时向每个前端部署对应的后端（例如vms）发请求
    // todo 细分各种操作;重命名为triggerXxxDialog
    serverOperationDialog (payload: { serverId: string; action: string; isGroup?: boolean; isJump?: boolean }) {
      // 所有操作都要用的信息
      const server = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId] : this.tables.personalServerTable.byId[payload.serverId]
      // 去掉协议
      const endpoint_url = server.endpoint_url.substr(server.endpoint_url.indexOf('//'))
      // 判断结尾有没有'/'，并加上当前用户使用的协议
      // 以下写法失败, 二元选择问号前都是条件
      // const api = window.location.protocol + endpoint_url.endsWith('/') ? endpoint_url + 'api/server/' + payload.serverId + '/action' : endpoint_url + '/api/server/' + payload.serverId + '/action'
      const api = window.location.protocol + (endpoint_url.endsWith('/') ? endpoint_url + 'api/server/' + payload.serverId + '/action' : endpoint_url + '/api/server/' + payload.serverId + '/action')
      const data = { action: payload.action }

      // 执行操作的函数。delete/force_delete不用。start直接用。其他经dialog确认后用。
      const executeOperation = async () => {
        // 将主机状态清空，界面将显示loading
        if (payload.isGroup) {
          this.tables.groupServerTable.byId[payload.serverId].status = ''
        } else {
          this.tables.personalServerTable.byId[payload.serverId].status = ''
        }

        try {
          await axios.post(api, data)
          // 应延时
          void await new Promise(resolve => (
            setTimeout(resolve, 5000)
          ))
          // 更新单个server status
          void this.loadSingleServerStatus({
            isGroup: payload.isGroup || false,
            serverId: payload.serverId
          })
          // todo 比对新老状态，发送通知
          // const newStatus = payload.isGroup ? context.state.tables.groupServerTable.byId[payload.serverId]?.status : context.state.tables.personalServerTable.byId[payload.serverId]?.status
        } catch {
          // 若请求失败则应更新单个server status
          void this.loadSingleServerStatus({
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
            this.tables.groupServerTable.byId[payload.serverId].status = ''
          } else {
            this.tables.personalServerTable.byId[payload.serverId].status = ''
          }
          try {
            // 发送请求
            await axios.post(api, data)
            // 如果删除主机，重新获取userServerTable或groupServerTable
            Notify.create({
              classes: 'notification-positive shadow-15',
              textColor: 'positive',
              // spinner: true,
              icon: 'check_circle',
              message: `成功删除云主机: ${server.ipv4 || ''}`,
              position: 'bottom',
              closeBtn: true,
              timeout: 5000,
              multiLine: false
            })
            // // 应延时
            // void await new Promise(resolve => (
            //   setTimeout(resolve, 1000)
            // ))
            // 更新userServerTable或groupServerTable // 可以优化成直接删除
            payload.isGroup ? void this.loadGroupServerTable() : void this.loadPersonalServerTable()
            // // 更新personal/group quotaTable, 删除了server，对应quota里面servers字段也更新了。// 可以优化成直接删除
            // payload.isGroup ? void context.dispatch('loadGroupQuotaTable') : void context.dispatch('loadPersonalQuotaTable')
            // 是否跳转
            if (payload.isJump) {
              // @ts-ignore
              this.$router.back()
            }
          } catch {
            // 若请求失败则应更新单个server status
            void this.loadSingleServerStatus({
              isGroup: payload.isGroup || false,
              serverId: payload.serverId
            })
          }
        })
      } else if (payload.action === 'start') {
        void executeOperation()
      } else {
        Dialog.create({
          class: 'dialog-primary',
          title: `${i18n.global.tc(actionMap.get(payload.action) as string) || ''}`,
          focus: 'cancel',
          message:
            '确认执行？',
          ok: {
            label: i18n.global.tc('确认'),
            push: false,
            // flat: true,
            outline: true,
            color: 'primary'
          },
          cancel: {
            label: i18n.global.tc('取消'),
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
      Dialog.create({
        class: 'dialog-primary',
        title: `编辑${payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId].ipv4 : this.tables.personalServerTable.byId[payload.serverId].ipv4}的备注信息`,
        // message: '长度限制为40个字',
        prompt: {
          model: `${payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId].remarks : this.tables.personalServerTable.byId[payload.serverId].remarks}`,
          counter: true,
          maxlength: 40,
          type: 'text' // optional
        },
        color: 'primary',
        cancel: true
      }).onOk(async (data: string) => {
        const respPatchRemark = await api.server.server.patchServerRemark({
          path: { id: payload.serverId },
          query: { remark: data.trim() }
        })
        if (respPatchRemark.status === 200) {
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
            message: '成功修改云主机备注为: ' + respPatchRemark.data.remarks,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
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
        // 去掉协议
        const endpoint_url = server.endpoint_url.substr(server.endpoint_url.indexOf('//'))
        const api = window.location.protocol + (endpoint_url.endsWith('/') ? endpoint_url + 'api/server/' + payload.serverId + '/rebuild' : endpoint_url + '/api/server/' + payload.serverId + '/rebuild')
        const data = { image_id }
        // notify
        Notify.create({
          classes: 'notification-positive shadow-15',
          textColor: 'positive',
          spinner: true,
          message: `正在重建云主机: ${server.ipv4 || ''}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
        // 发送请求
        const respPostServerRebuild = await axios.post(api, data)
        // console.log(payload.serverId, api, data)
        if (respPostServerRebuild.status === 202) {
          // 应延时
          void await new Promise(resolve => (
            setTimeout(resolve, 5000)
          ))
          // 更新该server
          void await this.loadSingleServer({
            serverId: payload.serverId,
            isGroup: payload.isGroup || false
          })
          // notify
          const newServer = payload.isGroup ? this.tables.groupServerTable.byId[payload.serverId] : this.tables.personalServerTable.byId[payload.serverId]
          if (newServer.image_id === image_id) {
            Notify.create({
              classes: 'notification-positive shadow-15',
              textColor: 'positive',
              icon: 'check_circle',
              message: `成功重建云主机: ${server.ipv4 || ''}`,
              position: 'bottom',
              closeBtn: true,
              timeout: 5000,
              multiLine: false
            })
          } else {
            // 可能重建失败，也可能是延时超过上面的5000
          }
          // jump 成功才跳转
          // @ts-ignore
          // payload.isGroup ? this.$router.push(`/my/group/server/detail/${payload.serverId}`) : this.$router.push(`/my/personal/server/detail/${payload.serverId}`)
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
        component: GroupEditCard,
        componentProps: {
          groupId
        }
      }).onOk(async (val: { name: string; company: string; description: string }) => {
        // val是onDialogOK调用时传入的实参
        // 发送patch请求
        const respPatchGroup = await api.server.vo.patchVo({
          path: { id: groupId },
          body: val
        })
        if (respPatchGroup.status === 200) {
          // 加入myRole字段
          Object.assign(respPatchGroup.data, { myRole: this.tables.groupTable.byId[groupId].myRole })
          // 保存响应内最新信息
          const newGroup = { [respPatchGroup.data.id]: respPatchGroup.data }
          // 保存最新group
          Object.assign(this.tables.groupTable.byId, newGroup)
          this.tables.groupTable.allIds.unshift(Object.keys(newGroup as Record<string, unknown>)[0])
          this.tables.groupTable.allIds = [...new Set(this.tables.groupTable.allIds)]
          // 弹出通知
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'light-green',
            message: '项目组信息修改成功',
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
          // resolve(true)
        } /* else {
        // 弹出通知
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: '项目组信息修改失败，请重试',
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
        // reject(false) // 待研究：用reject还是resolve
      } */
      })
      // })
    },
    /* 修改group信息 */

    /* 增加group成员 */
    addGroupMemberDialog (groupId: string) {
      Dialog.create({
        component: GroupAddMemberCard,
        componentProps: {
          groupId
        }
      }).onOk(async (val: { /* groupId: string; */usernames: string[] }) => { // val是onDialogOK调用时传入的实参
        // 发送patch请求
        const respPostAddMembers = await api.server.vo.postVoAddMembers({
          path: { id: groupId },
          body: val
        })
        // 此请求可能有多个成功，多个失败混在一起。因此不能用状态码判断。
        // 把成功的账户member信息存入table
        for (const member of respPostAddMembers.data.success) {
          // 存入单个member
          // 增加成员，修改角色用。为了避免数组有重复，采取以下逻辑：
          // 删掉已有的同名member
          this.tables.groupMemberTable.byId[groupId].members = this.tables.groupMemberTable.byId[groupId].members.filter((memberGroup) => {
            return memberGroup.user.username !== member.user.username
          })
          // 增加新拿到的member
          this.tables.groupMemberTable.byId[groupId].members.unshift(member)
          // 通知：单个member成功信息
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'light-green',
            message: '已经成功添加成员:' + member.user.username,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        }
        // 通知：失败账户错误信息
        for (const member of respPostAddMembers.data.failed) {
          Notify.create({
            classes: 'notification-negative shadow-15',
            icon: 'mdi-alert',
            textColor: 'negative',
            message: '添加成员失败：' + member.username + ' - ' + member.message,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        }
      })
    },
    /* 增加group成员 */

    /* 移除group成员 */
    removeSingleGroupMemberDialog (payload: { groupId: string; username: string }) {
      // 操作的确认提示
      Dialog.create({
        class: 'dialog-primary',
        title: '移除项目组成员：' + payload.username,
        message:
          '确认移除?',
        focus: 'cancel',
        ok: {
          label: '确认',
          push: false,
          outline: true,
          color: 'primary'
        },
        cancel: {
          label: '放弃',
          push: false,
          unelevated: true,
          color: 'primary'
        }
      }).onOk(async () => {
        const respPostRemoveMembers = await api.server.vo.postVoRemoveMembers({
          path: { id: payload.groupId },
          body: { usernames: [payload.username] }
        })
        if (respPostRemoveMembers.status === 204) {
          // 保存最新group
          this.tables.groupMemberTable.byId[payload.groupId].members = this.tables.groupMemberTable.byId[payload.groupId].members.filter((member) => {
            return member.user.username !== payload.username
          })
          // 弹出通知
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'light-green',
            message: '已经移除项目组成员：' + payload.username,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
        }
      })
    },
    /* 移除group成员 */

    /* 修改group成员角色 */
    editGroupMemberRoleDialog (payload: { groupId: string; member_id: string; role: 'member' | 'leader'; role_name: string }) {
      // 操作的确认提示
      Dialog.create({
        class: 'dialog-primary',
        title: '将成员设置为：' + payload.role_name,
        message:
          '确认设置?',
        focus: 'cancel',
        ok: {
          label: '确认',
          push: false,
          outline: true,
          color: 'primary'
        },
        cancel: {
          label: '放弃',
          push: false,
          unelevated: true,
          color: 'primary'
        }
      }).onOk(async () => {
        const respPostMemberRole = await api.server.vo.postVoMembersRole({
          path: {
            member_id: payload.member_id,
            role: payload.role
          }
        })
        if (respPostMemberRole.status === 200) {
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
            textColor: 'light-green',
            message: '已经设置成员：' + respPostMemberRole.data.user.username + '为' + payload.role_name,
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
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
          message: '输入项不可为空，请全部填写',
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      } else {
        const respPostVO = await api.server.vo.postVo({ body: payload })
        if (respPostVO.status === 200) {
          // 重要：更新table，因为group是个根依赖，新增一个组，要牵涉数据非常多，不如直接全部重读组相关数
          void await this.forceLoadGroupModuleTable()
          // 通知
          Notify.create({
            classes: 'notification-positive shadow-15',
            icon: 'mdi-check-circle',
            textColor: 'light-green',
            message: '新建项目组成功',
            position: 'bottom',
            closeBtn: true,
            timeout: 5000,
            multiLine: false
          })
          // 跳转到group list
          navigateToUrl('/my/server/group/list')
        } // 失败则由axios统一报错
      }
    },
    /* 新建group */

    /* 删除group */
    deleteGroupDialog (groupId: string) {
      // 检查组内:云主机、配额、配额申请记录 是否删除干净
      const isServerPurged = Boolean(this.getGroupServersByGroupId(groupId).length === 0)
      // const isQuotaPurged = Boolean(this.getGroupQuotasByGroupIdByStatus(groupId, 'all').length === 0)
      // const isQuotaApplicationPurged = Boolean(this.getGroupQuotaApplicationsByGroupId(groupId).length === 0)

      if (!isServerPurged) {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-check-circle',
          textColor: 'red',
          message: '请将组内的云主机全部删除后，再解散该项目组',
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
        // }
        // else if (!isQuotaPurged) {
        //   Notify.create({
        //     classes: 'notification-negative shadow-15',
        //     icon: 'mdi-check-circle',
        //     textColor: 'red',
        //     message: '请将组内的云主机配额全部删除后，再解散该项目组',
        //     position: 'bottom',
        //     closeBtn: true,
        //     timeout: 5000,
        //     multiLine: false
        //   })
        // } else if (!isQuotaApplicationPurged) {
        //   Notify.create({
        //     classes: 'notification-negative shadow-15',
        //     icon: 'mdi-check-circle',
        //     textColor: 'red',
        //     message: '请将组内的云主机配额申请记录全部删除后，再解散该项目组',
        //     position: 'bottom',
        //     closeBtn: true,
        //     timeout: 5000,
        //     multiLine: false
        //   })
      } else {
        // 操作的确认提示
        Dialog.create({
          class: 'dialog-primary',
          title: '解散项目组',
          message:
            '解散后的项目组无法恢复。 确认解散？',
          focus: 'cancel',
          ok: {
            label: '确认',
            push: false,
            outline: true,
            color: 'primary'
          },
          cancel: {
            label: '放弃',
            push: false,
            unelevated: true,
            color: 'primary'
          }
        }).onOk(async () => {
          // 发送请求
          const respDeleteVO = await api.server.vo.deleteVo({ path: { id: groupId } })
          if (respDeleteVO.status === 204) {
            // 更新table，因为group是个根依赖，删除一个组，要牵涉数据非常多，不如直接全部重读组相关数据
            void await this.forceLoadGroupModuleTable()
            // notify
            Notify.create({
              classes: 'notification-positive shadow-15',
              icon: 'mdi-check-circle',
              textColor: 'light-green',
              message: '解散项目组成功',
              position: 'bottom',
              closeBtn: true,
              timeout: 5000,
              multiLine: false
            })
            // jump
            navigateToUrl('/my/server/group/list')
          }
        })
      }
    }
    /* 删除group */
    /* account */

    /* provider */

    /* provider */

    /* dialogs */
  }
})
