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
        adminQuotaApplicationTable: {
          byId: {},
          allIds: [],
          status: 'init'
        } as AdminQuotaApplicationTableInterface,
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
        /* 整体加载表：一旦加载则全部加载 */

        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */
        //
        /* 累积加载表：根据用户操作逐步加载，无法判断是否完全加载 */

      }
    }
  },
  getters: {},
  actions: {
    /* load tables */
    forceLoadAccountTable () {
      void this.loadGroupTable().then(() => {
        // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
        void this.loadGroupMemberTable().then(() => {
          // 注意：此表依赖groupTable中的myRole字段，而该字段是loadGroupMemberTableFromGroup副产品，所以产生依赖
          void this.loadGroupQuotaApplicationTable()
        })
        void this.loadGroupServerTable()
        void this.loadGroupQuotaTable()
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
            })
          }
        })
      }

      if (this.tables.fedFlavorTable.status === 'init') {
        void this.loadFedFlavorTable()
      }
      if (this.tables.personalQuotaTable.status === 'init') {
        void this.loadPersonalQuotaTable()
      }
      if (this.tables.personalQuotaApplicationTable.status === 'init') {
        void this.loadPersonalQuotaApplicationTable()
      }
      if (this.tables.fedQuotaActivityTable.status === 'init') {
        void this.loadFedQuotaActivityTable()
      }

      if (this.tables.groupTable.status === 'init') {
        void this.loadGroupTable().then(() => {
          // groupMemberTable 依赖 groupTable, 根据每个groupId建立一个groupMember对象
          if (this.tables.groupMemberTable.status === 'init') {
            void this.loadGroupMemberTable().then(() => {
              // 注意：此表依赖groupTable中的myRole字段，而该字段是loadGroupMemberTableFromGroup副产品，所以产生依赖
              if (this.tables.groupQuotaApplicationTable.status === 'init') {
                void this.loadGroupQuotaApplicationTable()
              }
            })
          }
          if (this.tables.groupServerTable.status === 'init') {
            void this.loadGroupServerTable()
          }
          if (this.tables.groupQuotaTable.status === 'init') {
            void this.loadGroupQuotaTable()
          }
        })
      }

      // 以下表格为分页，在页面自身加载时load
      // if (!context.rootState.provider.tables.adminQuotaApplicationTable.isLoaded) {
      //   void context.dispatch('provider/loadAdminQuotaApplicationTable', null, { root: true })
      // }
    },

    /* load tables */

    /* items */
    async loadServerRole () {
      const respGetUserPermissionPolicy = await api.server.user.getUserPermissionPolicy()
      if (respGetUserPermissionPolicy.status === 200) {
        this.items.fedRole = respGetUserPermissionPolicy.data.role
        this.items.adminServiceIds = respGetUserPermissionPolicy.data.vms.service_ids
      }
    },
    /* items */

    /* tables */
    // 加载groupTable
    async loadGroupTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.groupTable = {
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
    /* dataCenterTable */
    async loadDataCenterTable () {
      // 清空table
      this.tables.dataCenterTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
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

        // this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].id].services.unshift(Object.values(normalizedData.entities.service!)[0].data_center)
        // this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].data_center].services = [...new Set(this.tables.dataCenterTable.byId[Object.values(normalizedData.entities.service!)[0].data_center].services)]
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
    async loadAdminQuotaApplicationTable (payload?: {
      page?: number;
      pageSize?: number;
      serviceId?: string;
      status?: 'wait' | 'pending' | 'pass' | 'reject' | 'cancel'
    }) {
      this.tables.adminQuotaApplicationTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // 获取数据并更新table
      const respApply = await api.server.apply.getApplyQuotaAdmin({
        query: {
          deleted: false,
          // ...(payload?.serviceId) && { service: payload.serviceId }, // 有条件添加属性 https://stackoverflow.com/a/40560953
          // ...(payload?.status) && { status: [payload.status as string] }
          page: payload?.page,
          page_size: payload?.pageSize,
          service: payload?.serviceId,
          status: [payload?.status as string]
        }
      })
      // 再向详情接口发送请求
      const service = new schema.Entity('service')
      const quotaApplication = new schema.Entity('quotaApplication', { service })
      for (const data of respApply.data.results) {
        const respApplyDetail = await api.server.apply.getApplyQuotaApplyIdAdmin({ path: { apply_id: data.id } })
        const normalizedData = normalize(respApplyDetail.data, quotaApplication)
        Object.assign(this.tables.adminQuotaApplicationTable.byId, normalizedData.entities.quotaApplication)
        this.tables.adminQuotaApplicationTable.allIds.unshift(Object.keys(normalizedData.entities.quotaApplication as Record<string, unknown>)[0])
        this.tables.adminQuotaApplicationTable.allIds = [...new Set(this.tables.adminQuotaApplicationTable.allIds)]
      }
      // load table的最后再改isLoaded
      this.tables.adminQuotaApplicationTable.status = 'total'
      // 返回count值
      return respApply.data.count
    },
    // 代码风格不好
    async loadAdminServerTable (payload: { page?: number; page_size?: number }) {
      this.tables.adminServerTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
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
    async loadPersonalQuotaTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.personalQuotaTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // 将响应normalize
      const respQuota = await api.server.quota.getQuota({ query: { deleted: false } })
      const service = new schema.Entity('service')
      const quota = new schema.Entity('quota', { service })
      // quota数组
      for (const data of respQuota.data.results) {
        /* 增加补充字段 */
        // 获取quota下对应的server列表
        const respQuotaServers = await api.server.quota.getQuotaServers({ path: { id: data.id } })
        const servers: string[] = []
        respQuotaServers.data.results.forEach((server: ServerInterface) => {
          servers.push(server.id)
        })
        // 给data增加servers字段
        Object.assign(data, { servers })
        // 给data增加expired字段
        const expired = !!data.expiration_time && (new Date(data.expiration_time).getTime() < new Date().getTime())
        Object.assign(data, { expired })
        // 给data增加exhausted字段,该字段的判断方式可能后期更改
        const exhausted = data.vcpu_used === data.vcpu_total || data.ram_used === data.ram_total || (data.private_ip_used === data.private_ip_total && data.public_ip_used === data.public_ip_total)
        Object.assign(data, { exhausted })
        /* 增加补充字段 */

        // normalize data
        const normalizedData = normalize(data, quota)
        Object.assign(this.tables.personalQuotaTable.byId, normalizedData.entities.quota)
        this.tables.personalQuotaTable.allIds.unshift(Object.keys(normalizedData.entities.quota as Record<string, unknown>)[0])
        this.tables.personalQuotaTable.allIds = [...new Set(this.tables.personalQuotaTable.allIds)]
      }
      // load table的最后再改isLoaded
      this.tables.personalQuotaTable.status = 'total'
    },
    // 更新整个userServerTable
    async loadPersonalServerTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.personalServerTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // 发送请求
      const respServer = await api.server.server.getServer()
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
      // 根据groupTable,建立groupServerTable
      for (const groupId of this.tables.groupTable.allIds) {
        // 发送请求
        const respGroupServer = await api.server.server.getServerVo({ path: { vo_id: groupId } })
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
    async loadGroupQuotaTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.groupQuotaTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // 根据groupTable,建立groupQuotaTable
      for (const groupId of this.tables.groupTable.allIds) {
        // 获取响应
        const respGroupQuota = await api.server.quota.getQuotaVo({ path: { vo_id: groupId } })
        // 将响应normalize
        const service = new schema.Entity('service')
        const quota = new schema.Entity('quota', { service })
        // quota数组
        for (const data of respGroupQuota.data.results) {
          /* 增加补充字段 */
          // 补充vo_id字段
          Object.assign(data, { vo_id: groupId })
          // 获取quota下对应的server列表
          const respQuotaServers = await api.server.quota.getQuotaServers({ path: { id: data.id } })
          const servers: string[] = []
          respQuotaServers.data.results.forEach((server: ServerInterface) => {
            servers.push(server.id)
          })
          // 给data增加servers字段
          Object.assign(data, { servers })
          // 给data增加expired字段
          const expired = !!data.expiration_time && (new Date(data.expiration_time).getTime() < new Date().getTime())
          Object.assign(data, { expired })
          // 给data增加exhausted字段,该字段的判断方式可能后期更改
          const exhausted = data.vcpu_used === data.vcpu_total ||
            data.ram_used === data.ram_total ||
            (data.private_ip_used === data.private_ip_total && data.public_ip_used === data.public_ip_total)
          Object.assign(data, { exhausted })
          /* 增加补充字段 */

          // normalize data
          const normalizedData = normalize(data, quota)
          // 存入groupQuotaTable
          Object.assign(this.tables.groupQuotaTable.byId, normalizedData.entities.quota)
          this.tables.groupQuotaTable.allIds.unshift(Object.keys(normalizedData.entities.quota as Record<string, unknown>)[0])
          this.tables.groupQuotaTable.allIds = [...new Set(this.tables.groupQuotaTable.allIds)]
        }
      }
      // load table的最后再改isLoaded
      this.tables.groupQuotaTable.status = 'total'
    },
    // 默认personalQuotaApplicationTable只保存undeleted的application
    async loadPersonalQuotaApplicationTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.personalQuotaApplicationTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // 再获取数据并更新table
      const respApply = await api.server.apply.getApplyQuota({ query: { deleted: false } }) // 不包含已删除的申请
      const service = new schema.Entity('service')
      const application = new schema.Entity('application', { service })
      for (const data of respApply.data.results) {
        const normalizedData = normalize(data, application)
        Object.assign(this.tables.personalQuotaApplicationTable.byId, normalizedData.entities.application)
        this.tables.personalQuotaApplicationTable.allIds.unshift(Object.keys(normalizedData.entities.application as Record<string, unknown>)[0])
        this.tables.personalQuotaApplicationTable.allIds = [...new Set(this.tables.personalQuotaApplicationTable.allIds)]
      }
      // load table的最后再改isLoaded
      this.tables.personalQuotaApplicationTable.status = 'total'
    },
    async loadGroupQuotaApplicationTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新）
      this.tables.groupQuotaApplicationTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // 根据groupTable,建立groupApplicationTable
      for (const groupId of this.tables.groupTable.allIds) {
        // member没有权限请求这个接口, owner和leader可以
        if (this.tables.groupTable.byId[groupId].myRole !== 'member') {
          // 获取响应
          const respGroupApplication = await api.server.apply.getApplyQuotaVo({
            path: { vo_id: groupId },
            query: { deleted: false }
          })
          // normalize
          const service = new schema.Entity('service')
          const application = new schema.Entity('application', { service })
          // application 数组
          for (const data of respGroupApplication.data.results) {
            /* 增加补充字段 */
            // 补充vo_id字段
            Object.assign(data, { vo_id: groupId })
            /* 增加补充字段 */
            // normalize data
            const normalizedData = normalize(data, application)
            // 存入
            Object.assign(this.tables.groupQuotaApplicationTable.byId, normalizedData.entities.application)
            this.tables.groupQuotaApplicationTable.allIds.unshift(Object.keys(normalizedData.entities.application as Record<string, unknown>)[0])
            this.tables.groupQuotaApplicationTable.allIds = [...new Set(this.tables.groupQuotaApplicationTable.allIds)]
          }
        }
      }
      // load table的最后再改isLoaded
      this.tables.groupQuotaApplicationTable.status = 'total'
    },
    // personal/group quota application table建立时用列举接口，有较少字段；单独更新时从详情接口取，有较多字段，但也只用基本部分。
    // 单独更新personal/groupQuotaApplicationTable里的一个application对象
    async loadSingleQuotaApplicationStatus (payload: { applicationId: string; isGroup: boolean }) {
      // 先清空application的status，显示为获取中。注意不是删除整个application，这样则会丢失整个条目。
      const table = payload.isGroup ? this.tables.groupQuotaApplicationTable : this.tables.personalQuotaApplicationTable
      table.status = 'init'
      // 获取最新的application对象，存入table
      const respSingleApplication = await api.server.apply.getApplyQuotaApplyId({ path: { apply_id: payload.applicationId } })
      if (respSingleApplication.status === 200) {
        if (payload.isGroup) {
          // 补充vo_id字段
          Object.assign(respSingleApplication.data, { vo_id: respSingleApplication.data.vo.id })
        }
        // normalize
        const service = new schema.Entity('service')
        const application = new schema.Entity('application', { service })
        const normalizedData = normalize(respSingleApplication.data, application)

        Object.assign(table.byId, normalizedData.entities.application)
        table.allIds.unshift(Object.keys(normalizedData.entities.application as Record<string, unknown>)[0])
        table.allIds = [...new Set(table.allIds)]
      }
    },
    async loadFedQuotaActivityTable () {
      // 先清空table，避免多次更新时数据累加（凡是需要强制刷新的table，都要先清空再更新
      // 当前没有强制清楚，避免了ui闪烁,但是也没有数据累加
      // context.commit('clearTable', context.state.tables.fedQuotaActivityTable)

      // 获取数据并更新table
      // 当前table内容为筛选出active,排除未开始和已结束的，以后可根据需求全部获取，显示时进行筛选
      const respActivity = await api.server.quota_activity.getQuotaActivity({
        query: {
          status: 'active',
          'exclude-not-start': true,
          'exclude-ended': true
        }
      })
      // normalize信息
      const service = new schema.Entity('service')
      const user = new schema.Entity('user')
      const quotaActivity = new schema.Entity('quotaActivity', {
        service,
        user
      })
      for (const data of respActivity.data.results) {
        const normalizedData = normalize(data, quotaActivity)
        Object.assign(this.tables.fedQuotaActivityTable.byId, normalizedData.entities.quotaActivity)
        this.tables.fedQuotaActivityTable.allIds.unshift(Object.keys(normalizedData.entities.quotaActivity as Record<string, unknown>)[0])
        this.tables.fedQuotaActivityTable.allIds = [...new Set(this.tables.fedQuotaActivityTable.allIds)]
      }
      // load table的最后再改isLoaded
      this.tables.fedQuotaActivityTable.status = 'total'
    },

    /* tables */

    /* dialogs */
    /* dialogs */

    // test, to be deleted
    async getImages () {
      return await api.server.image.getImage({ query: { service_id: '1' } })
    }

  }
})
