/* eslint-disable camelcase */

import { defineStore } from 'pinia'
import { normalize, schema } from 'normalizr'
import api from 'src/api'

// @ts-expect-error
import { useStoreMain } from '@cnic/main'

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

export interface QuotaInterface {
  id: string
  tag: { // 提出去单做table无用，暂时保留，不拍平
    value: number
    display: string
  },
  user: { // 提出去单做table无用，暂时保留，不拍平
    id: string
    username: string
  },
  service: string
  private_ip_total: number
  private_ip_used: number
  public_ip_total: number
  public_ip_used: number
  vcpu_total: number
  vcpu_used: number
  ram_total: number
  ram_used: number
  disk_size_total: number
  disk_size_used: number
  expiration_time: never // null 待细化
  deleted: boolean
  display: string
  duration_days: number
  classification: 'vo' | 'personal' // 配额类型，二选一

  // 来自vo/quota接口的补充
  vo_id?: string // groupId

  // 来自server接口补充
  servers?: string[] // serverId

  // 以下为根据上述字段自行判断填充
  expired: boolean
  exhausted: boolean
}

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

// 配额申请接口
export interface QuotaApplicationInterface {
  // 以下字段出现在列举接口的响应里
  private_ip: number
  public_ip: number
  vcpu: number
  ram: number
  disk_size: number
  duration_days: number
  company: string
  contact: string
  purpose: string
  id: string
  creation_time: string
  status: string
  service: string
  deleted: boolean
  classification: 'personal' | 'vo'
  result_desc: string // 拒绝理由

  // 来自补充
  vo_id?: string

  // 以下字段出现在详情接口的响应里
  user?: {
    id: string
    name: string
  }
  approve_user?: null | {
    id: string
    name: string
  }
  approve_time?: null | string
  vo?: null | {
    id: string
    name: string
    company: string
    description: string
    creation_time: string
    owner: {
      id: string
      username: string
    },
    status: string
  }
}

// 赠送配额活动
export interface QuotaActivity {
  'id': string
  'got_count': number
  'service': string // service id
  'user': string // user id
  'creation_time': string
  'name': string
  'name_en': string
  'start_time': string
  'end_time': string
  'count': number
  'times_per_user': number
  'status': string
  'tag': string
  'cpus': number
  'private_ip': number
  'public_ip': number
  'ram': number
  'disk_size': number
  'expiration_time': string
  'duration_days': number
}

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
export interface AdminQuotaApplicationTableInterface extends totalTable, idTable<QuotaApplicationInterface> {
}

// 服务管理员能看到的，当前服务下创建的所有云主机
export interface AdminServerTableInterface extends totalTable, idTable<ServerInterface> {
}

// 所有人一样的云主机配置选项
export interface FedFlavorTableInterface extends totalTable, idTable<FlavorInterface> {
}

// 联邦配额赠送活动
export interface FedQuotaActivityTableInterface extends totalTable, idTable<QuotaActivity> {
}

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
export interface PersonalQuotaApplicationTableInterface extends totalTable, idTable<QuotaApplicationInterface> {
}

// 个人云主机配额
export interface PersonalQuotaTableInterface extends totalTable, idTable<QuotaInterface> {
}

// 个人云主机
export interface PersonalServerTableInterface extends totalTable, idTable<ServerInterface> {
}

// 项目组云主机配额申请
export interface GroupQuotaApplicationTableInterface extends totalTable, idTable<QuotaApplicationInterface> {
}

// 项目组云主机配额
export interface GroupQuotaTableInterface extends totalTable, idTable<QuotaInterface> {
}

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
        adminServiceIds: [] as string[] // 有vms管理员权限的接入服务id
      },
      tables: {
        /* 整体加载表：一旦加载则全部加载 */
        account: {
          groupTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as GroupTableInterface,
          groupMemberTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as GroupMemberTableInterface
        },
        fed: {
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
          } as FedAllocationTableInterface
        },
        provider: {
          adminQuotaApplicationTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as AdminQuotaApplicationTableInterface,
          adminServerTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as AdminServerTableInterface
        },
        server: {
          fedFlavorTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as FedFlavorTableInterface,
          fedQuotaActivityTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as FedQuotaActivityTableInterface,
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
          personalQuotaApplicationTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as PersonalQuotaApplicationTableInterface,
          personalQuotaTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as PersonalQuotaTableInterface,
          personalServerTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as PersonalServerTableInterface,
          groupQuotaApplicationTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as GroupQuotaApplicationTableInterface,
          groupQuotaTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as GroupQuotaTableInterface,
          groupServerTable: {
            byId: {},
            allIds: [],
            status: 'init'
          } as GroupServerTableInterface
        }

        /* 整体加载表：一旦加载则全部加载 */

        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */
        //
        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */

      }
    }
  },
  getters: {},
  actions: {
    forceLoadAccountTable () {
      void this.loadGroupTable().then(() => {
        // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
        void this.loadGroupMemberTable().then(() => {
          // 注意：此表依赖groupTable中的myRole字段，而该字段是loadGroupMemberTableFromGroup副产品，所以产生依赖
          // void context.dispatch('server/loadGroupQuotaApplicationTable', null, { root: true })
        })
        // void context.dispatch('server/loadGroupServerTable', null, { root: true })
        // void context.dispatch('server/loadGroupQuotaTable', null, { root: true })
      })
    },
    // 加载groupTable
    async loadGroupTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.account.groupTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // 发送请求
      const respGroup = await api.server.vo.getVo()
      // normalize
      const group = new schema.Entity('group')
      for (const data of respGroup.data.results) {
        // 添加role字段
        const storeMain = useStoreMain()
        const currentId = storeMain.items.tokenDecoded.email
        const myRole = currentId === data.owner.username ? 'owner' : 'member'
        Object.assign(data, { myRole })
        // normalize
        const normalizedData = normalize(data, group)
        // 保存table
        Object.assign(this.tables.account.groupTable.byId, normalizedData.entities.group)
        this.tables.account.groupTable.allIds.unshift(Object.keys(normalizedData.entities.group as Record<string, unknown>)[0])
        this.tables.account.groupTable.allIds = [...new Set(this.tables.account.groupTable.allIds)]
      }
      // load table的最后再改status
      this.tables.account.groupTable.status = 'total'
    },
    // 根据groupTable,建立groupMemberTable
    async loadGroupMemberTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.account.groupMemberTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      for (const groupId of this.tables.account.groupTable.allIds) {
        const respGroupMember = await api.server.vo.getVoListMembers({ path: { id: groupId } })
        // 是否把组长添加进member列表？
        // 把groupId字段补充进去
        Object.assign(respGroupMember.data, { id: groupId })
        // normalize
        const groupMember = new schema.Entity('groupMember')
        const normalizedData = normalize(respGroupMember.data, groupMember)
        // 存入state
        Object.assign(this.tables.account.groupMemberTable.byId, normalizedData.entities.groupMember)
        this.tables.account.groupMemberTable.allIds.unshift(Object.keys(normalizedData.entities.groupMember as Record<string, unknown>)[0])
        this.tables.account.groupMemberTable.allIds = [...new Set(this.tables.account.groupMemberTable.allIds)]
        // 给groupTable补充role字段
        const storeMain = useStoreMain()
        const currentId = storeMain.items.tokenDecoded.email
        for (const member of respGroupMember.data.members) {
          if (member.user.username === currentId && member.role === 'leader') {
            this.tables.account.groupTable.byId[groupId].myRole = 'leader'
          }
        }
      }
      // load table的最后再改status
      this.tables.account.groupMemberTable.status = 'total'
    },

    //
    async getImages () {
      return await api.server.image.getImage({ query: { service_id: '1' } })
    },
    async loadServerRole () {
      const respGetUserPermissionPolicy = await api.server.user.getUserPermissionPolicy()
      if (respGetUserPermissionPolicy.status === 200) {
        this.items.fedRole = respGetUserPermissionPolicy.data.role
        this.items.adminServiceIds = respGetUserPermissionPolicy.data.vms.service_ids
      }
    }
  }
})
