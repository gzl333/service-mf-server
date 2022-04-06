/* eslint-disable camelcase */

import { defineStore } from 'pinia'
import api from 'src/api'

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
  status: 'empty' | 'loading' | 'total'
}

// 累计加载表
export interface partTable {
  status: 'empty' | 'loading' | 'part'
}

// id
export interface idTable {
  allIds: string[]
}

// localId
export interface localIdTable {
  allLocalIds: string[]
}

// 所有人一样的云主机配置选项
export interface FedFlavorTableInterface extends totalTable, idTable {
  byId: Record<string, FlavorInterface>
}

// 联邦配额赠送活动
export interface FedQuotaActivityTableInterface extends totalTable, idTable {
  byId: Record<string, QuotaActivity>
}

// 服务内通行的网络配置
export interface ServiceNetworkTableInterface extends totalTable, localIdTable {
  byLocalId: Record<string, NetworkInterface>
}

// 服务内通行的镜像配置
export interface ServiceImageTableInterface extends totalTable, localIdTable {
  byLocalId: Record<string, ImageInterface>
}

// 用户全部的Vpn -> 依赖fed/serviceTable
export interface UserVpnTableInterface extends totalTable, idTable {
  byId: Record<string, VpnInterface> // 原始数据没有id，自加id，与serviceId同。service不一定有vpn
}

// 个人云主机配额申请
export interface PersonalQuotaApplicationTableInterface extends totalTable, idTable {
  byId: Record<string, QuotaApplicationInterface>
}

// 个人云主机配额
export interface PersonalQuotaTableInterface extends totalTable, idTable {
  byId: Record<string, QuotaInterface>
}

// 个人云主机
export interface PersonalServerTableInterface extends totalTable, idTable {
  byId: Record<string, ServerInterface>
}

// 项目组云主机配额申请
export interface GroupQuotaApplicationTableInterface extends totalTable, idTable {
  byId: Record<string, QuotaApplicationInterface>
}

// 项目组云主机配额
export interface GroupQuotaTableInterface extends totalTable, idTable {
  byId: Record<string, QuotaInterface>
}

// 项目组云主机
export interface GroupServerTableInterface extends totalTable, idTable {
  byId: Record<string, ServerInterface>
}

const useStore = defineStore('serverStore', {
  state: () => {
    return {
      items: {
        // 账户在server服务内的身份
        fedRole: '' as 'ordinary' | 'federal-admin', // 联邦层级：普通用户还是管理员
        adminServiceIds: [] as string[] // 有vms管理员权限的接入服务id
      },
      tables: {
        /* 整体加载表：一旦加载则全部加载 */
        fedFlavorTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as FedFlavorTableInterface,
        fedQuotaActivityTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as FedQuotaActivityTableInterface,
        serviceNetworkTable: {
          byLocalId: {},
          allLocalIds: [],
          status: 'empty'
        } as ServiceNetworkTableInterface,
        serviceImageTable: {
          byLocalId: {},
          allLocalIds: [],
          status: 'empty'
        } as ServiceImageTableInterface,
        userVpnTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as UserVpnTableInterface,
        personalQuotaApplicationTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as PersonalQuotaApplicationTableInterface,
        personalQuotaTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as PersonalQuotaTableInterface,
        personalServerTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as PersonalServerTableInterface,
        groupQuotaApplicationTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as GroupQuotaApplicationTableInterface,
        groupQuotaTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as GroupQuotaTableInterface,
        groupServerTable: {
          byId: {},
          allIds: [],
          status: 'empty'
        } as GroupServerTableInterface
        /* 整体加载表：一旦加载则全部加载 */

        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */
        //
        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */

      }
    }
  },
  getters: {},
  actions: {
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

export default useStore
