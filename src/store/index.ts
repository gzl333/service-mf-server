import { defineStore } from 'pinia'
import api from 'src/api'

const useStore = defineStore('serverStore', {
  state: () => {
    return {
      counter: 0,
      items: {
        // 账户在server服务内的身份
        fedRole: '' as 'ordinary' | 'federal-admin', // 联邦层级：普通用户还是管理员
        adminServiceIds: [] as string[] // 有vms管理员权限的接入服务id
      },
      tables: {}
    }
  },
  getters: {
    getCounter: state => state.counter
  },
  actions: {
    increment () {
      this.counter++
    },
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
