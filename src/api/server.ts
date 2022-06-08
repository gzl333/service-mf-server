// server api

/* eslint-disable camelcase */

import { axiosServer } from 'boot/axios'

export default {
  account: {
    getAccountBalanceUser () {
      return axiosServer.get('/account/balance/user')
    },
    getAccountBalanceVo (payload: { path: { vo_id: string } }) {
      return axiosServer.get('/account/balance/vo/' + payload.path.vo_id)
    }
  },
  apply: {
    getApplyOrganization (payload: {
      query?: {
        page?: number;
        page_size?: number;
        deleted?: boolean;
        status?: 'wait' | 'cancel' | 'pending' | 'reject' | 'pass';
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/apply/organization', config)
    },
    postApplyOrganization (payload: {
      body: {
        name: string;
        name_en: string;
        abbreviation: string;
        independent_legal_person: boolean;
        country: string;
        city: string;
        postal_code?: string;
        address: string;
        endpoint_vms?: string;
        endpoint_object?: string;
        endpoint_compute?: string;
        endpoint_monitor?: string;
        desc?: string;
        logo_url?: string;
        certification_url?: string;
      }
    }) {
      const data = payload.body
      return axiosServer.post('/apply/organization', data)
    },
    getApplyOrganizationAdmin (payload: {
      query?: {
        page?: number;
        page_size?: number;
        deleted?: boolean;
        status?: 'wait' | 'cancel' | 'pending' | 'reject' | 'pass';
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/apply/organization/admin', config)
    },
    deleteApplyOrganization (payload: { path: { id: string } }) {
      return axiosServer.delete('/apply/organization/' + payload.path.id)
    },
    postApplyOrganizationAction (payload: {
      path: {
        action: string;
        id: string;
      }
    }) {
      return axiosServer.post('/apply/organization/' + payload.path.id + '/action/' + payload.path.action)
    },
    getApplyQuota (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        deleted?: boolean;
        service?: string;
        status?: string[]
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/apply/quota', config)
    },
    postApplyQuota (payload: {
      body: {
        vo_id?: string;
        service_id: string;
        private_ip?: number;
        public_ip?: number;
        vcpu?: number;
        ram?: number;
        disk_size?: number;
        duration_days: number;
        company?: string;
        contact?: string;
        purpose?: string;
      }
    }) {
      const data = payload.body
      return axiosServer.post('/apply/quota', data)
    },
    getApplyQuotaAdmin (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        deleted?: boolean;
        service?: string;
        status?: string[];
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/apply/quota/admin', config)
    },
    getApplyQuotaVo (payload: {
      query?: {
        page?: number;
        page_size?: number;
        deleted?: boolean;
        service?: string;
        status?: string[]
      },
      path: { vo_id: string }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/apply/quota/vo/' + payload.path.vo_id, config)
    },
    getApplyQuotaApplyId (payload: { path: { apply_id: string } }) {
      return axiosServer.get('/apply/quota/' + payload.path.apply_id)
    },
    patchApplyQuota (payload: {
      body: {
        service_id: string;
        private_ip: number;
        public_ip: number;
        vcpu: number;
        ram: number;
        disk_size: number;
        duration_days: number;
        company: string;
        contact: string;
        purpose: string
      },
      path: { apply_id: string }
    }) {
      const data = payload.body
      return axiosServer.patch('/apply/quota/' + payload.path.apply_id, data)
    },
    deleteApplyQuota (payload: { path: { apply_id: string } }) {
      return axiosServer.delete('/apply/quota/' + payload.path.apply_id)
    },
    getApplyQuotaApplyIdAdmin (payload: { path: { apply_id: string } }) {
      return axiosServer.get('/apply/quota/' + payload.path.apply_id + '/admin')
    },
    postApplyQuotaCancel (payload: { path: { apply_id: string } }) {
      return axiosServer.post('/apply/quota/' + payload.path.apply_id + '/cancel')
    },
    postApplyQuotaPass (payload: { path: { apply_id: string } }) {
      return axiosServer.post('/apply/quota/' + payload.path.apply_id + '/pass')
    },
    postApplyQuotaPending (payload: { path: { apply_id: string } }) {
      return axiosServer.post('/apply/quota/' + payload.path.apply_id + '/pending')
    },
    postApplyQuotaReject (payload: {
      path: { apply_id: string },
      body: { reason: string }
    }) {
      const data = payload.body
      return axiosServer.post('/apply/quota/' + payload.path.apply_id + '/reject', data)
    },
    getApplyService (payload: { query?: { page?: number; page_size?: number; deleted?: boolean; organization?: string; status?: string[] } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/apply/service', config)
    },
    postApplyService (payload: {
      body: {
        organization_id: string;
        name: string;
        name_en: string;
        service_type: string;
        endpoint_url: string;
        region?: string;
        api_version?: string;
        username: string;
        password: string;
        project_name?: string;
        project_domain_name?: string;
        user_domain_name?: string;
        remarks?: string;
        need_vpn: boolean;
        vpn_endpoint_url?: string;
        vpn_api_version?: string;
        vpn_username?: string;
        vpn_password?: string;
        longitude?: number;
        latitude?: number;
        contact_person: string;
        contact_email: string;
        contact_telephone: string;
        contact_fixed_phone?: string;
        contact_address: string;
        logo_url?: string;
      }
    }) {
      const data = payload.body
      return axiosServer.post('/apply/service', data)
    },
    getApplyServiceAdmin (payload: { query?: { page?: number; page_size?: number; deleted?: boolean; organization?: string; status?: string[] } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/apply/service/admin', config)
    },
    deleteApplyService (payload: { path: { id: string } }) {
      return axiosServer.delete('/apply/service/' + payload.path.id)
    },
    postApplyServiceAction (payload: {
      path: {
        action: string;
        id: string;
      }
    }) {
      return axiosServer.post('/apply/service/' + payload.path.id + '/action/' + payload.path.action)
    }
  },
  azone: {},
  cashcoupon: {
    getCashcoupon (payload: {
      query?: {
        page?: number,
        page_size?: number,
        vo_id?: string,
        available?: string
      }
    }) {
      return axiosServer.get('/cashcoupon')
    }
  },
  'describe-price': {},
  flavor: {
    getFlavor () {
      return axiosServer.get('/flavor')
    }
  },
  image: {
    getImage (payload: {
      query: { service_id: string }
    }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/image', config)
    }
  },
  media: {
    getMedia (payload: { path: { url_path: string } }) {
      return axiosServer.get('/media/' + payload.path.url_path)
    },
    putMedia (payload: { path: { url_path: string }, body: { data: string } }) {
      const config = {
        data: payload.body
      }
      return axiosServer.put('/media/' + payload.path.url_path, config)
    }
  },
  monitor: {
    getMonitorCephQuery (payload: { query: { service_id: string; query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/monitor/ceph/query', config)
    },
    getMonitorCephQueryRange (payload: {
      query: {
        service_id: string;
        query: string;
        start: number;
        end?: number;
        step?: number
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/monitor/ceph/query/range', config)
    },

    getMonitorServerQuery (payload: { query: { service_id: string; query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/monitor/server/query', config)
    },

    getMonitorVideoQuery (payload: { query: { query: string } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/monitor/video-meeting/query', config)
    }
  },
  network: {
    getNetwork (payload: {
      query: { service_id: string }
    }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/network', config)
    },
    getNetworkNetworkId (payload: { query: { service_id: string }, path: { network_id: string } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/network/' + payload.path.network_id, config)
    }
  },
  order: {
    getOrder (payload?: {
      query?: {
        page?: number,
        page_size?: number,
        resource_type?: 'vm' | 'disk' | 'bucket',
        order_type?: 'new' | 'renewal' | 'upgrade' | 'downgrade',
        status?: 'paid' | 'unpaid' | 'cancelled' | 'refund',
        time_start?: string,
        time_end?: string,
        vo_id?: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/order', config)
    },
    getOrderId (payload: {
      path: { id: string }
    }) {
      return axiosServer.get('/order/' + payload.path.id)
    },
    postOrderIdCancel (payload: {
      path: {
        id: string
      }
    }) {
      return axiosServer.post('/order/' + payload.path.id + '/cancel')
    },
    postOrderIdClaim (payload: {
      path: {
        id: string
      }
    }) {
      return axiosServer.post('/order/' + payload.path.id + '/claim')
    },
    postOrderIdPay (payload: {
      path: {
        id: string
      },
      query: {
        payment_method: 'balance' | 'cashcoupon' | 'coupon-balance',
        coupon_ids?: string[]
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.post('/order/' + payload.path.id + '/pay', null, config)
    }
  },
  // quota: {
  //   getQuota (payload?: {
  //     query?: {
  //       page?: number;
  //       page_size?: number;
  //       service?: string;
  //       usable?: boolean;
  //       deleted?: boolean
  //     }
  //   }) {
  //     const config = {
  //       params: payload?.query
  //     }
  //     return axiosServer.get('/quota', config)
  //   },
  //   getQuotaVo (payload: {
  //     query?: {
  //       page?: number;
  //       page_size?: number;
  //       service?: string;
  //       usable?: boolean
  //     },
  //     path: { vo_id: string }
  //   }) {
  //     const config = {
  //       params: payload?.query
  //     }
  //     return axiosServer.get('/quota/vo/' + payload.path.vo_id, config)
  //   },
  //   getQuotaId (payload: { query: { 'as-admin': boolean }, path: { id: string } }) {
  //     const config = {
  //       params: payload.query
  //     }
  //     return axiosServer.get('/quota/vo/' + payload.path.id, config)
  //   },
  //   deleteQuota (payload: { path: { id: string } }) {
  //     return axiosServer.delete('/quota/' + payload.path.id)
  //   },
  //   getQuotaServers (payload: {
  //     query?: {
  //       page?: number;
  //       page_size?: number;
  //     },
  //     path: { id: string }
  //   }) {
  //     const config = {
  //       params: payload.query
  //     }
  //     return axiosServer.get('/quota/' + payload.path.id + '/servers', config)
  //   }
  // },
  // quota_activity: {
  //   getQuotaActivity (payload: {
  //     query?: {
  //       page?: number;
  //       page_size?: number;
  //       status?: string;
  //       'exclude-not-start'?: boolean;
  //       'exclude-ended'?: boolean
  //     }
  //   }) {
  //     const config = {
  //       params: payload?.query
  //     }
  //     return axiosServer.get('/quota-activity', config)
  //   },
  //   postQuotaActivity (payload: {
  //     body: {
  //       service_id: string;
  //       name: string;
  //       name_en: string;
  //       start_time: string;
  //       end_time: string;
  //       count: number;
  //       times_per_user: number;
  //       status: string;
  //       tag: string;
  //       cpus: number;
  //       private_ip: number;
  //       public_ip: number;
  //       ram: number;
  //       disk_size: number;
  //       expiration_time: string;
  //       duration_days: number
  //     }
  //   }) {
  //     const data = payload.body
  //     return axiosServer.post('/quota-activity', data)
  //   },
  //   getQuotaActivityGet (payload: { path: { id: string } }) {
  //     return axiosServer.get('/quota-activity/' + payload.path.id + '/get')
  //   }
  // },
  'payment-history': {},
  registry: {
    getRegistry () {
      return axiosServer.get('/registry')
    }
  },
  server: {
    getServer (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        service_id?: string;
        user_id?: string;
        vo_id?: string;
        'as-admin'?: boolean
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/server', config)
    },
    postServer (payload: {
      body: {
        pay_type: string; // 'prepaid' | 'postpaid' | 'quota';
        service_id: string;
        image_id: string;
        flavor_id: string;
        network_id: string;
        remarks?: string;
        azone_id?: string;
        vo_id?: string;
        period?: number;
      }
    }) {
      const data = payload.body
      return axiosServer.post('/server', data)
    },
    getServerVo (payload: {
      path: { vo_id: string },
      query?: {
        page?: number;
        page_size?: number;
        service_id?: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/server/vo/' + payload.path.vo_id, config)
    },
    getServerId (payload: {
      path: { id: string },
      query?: { 'as-admin': boolean }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/server/' + payload.path.id, config)
    },
    deleteServer (payload: { path: { id: string }, query?: { force?: boolean } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.delete('/server/' + payload.path.id, config)
    },
    postServerAction (payload: {
      path: { id: string },
      body: { action: string }
    }) {
      const data = payload.body
      return axiosServer.post('/server/' + payload.path.id + '/action', data)
    },
    postServerLock (payload: {
      path: { id: string },
      query: { lock: string }
    }) {
      const config = {
        params: payload.query
      }
      return axiosServer.post('/server/' + payload.path.id + '/lock', null, config)
    },
    postServerRebuild (payload: {
      path: { id: string }
      body: { image_id: string }
    }) {
      const data = payload.body
      return axiosServer.post('/server/' + payload.path.id + '/rebuild', data)
    },
    patchServerRemark (payload: {
      path: { id: string },
      query: { remark: string }
    }) {
      const config = {
        params: payload.query
      }
      return axiosServer.patch('/server/' + payload.path.id + '/remark', null, config)
    },
    getServerStatus (payload: {
      path: { id: string },
      query?: { 'as-admin'?: string }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/server/' + payload.path.id + '/status', config)
    },
    getServerVnc (payload: { path: { id: string } }) {
      return axiosServer.get('/server/' + payload.path.id + '/vnc')
    }
  },
  server_archive: {
    getServerArchive (payload: { query?: { page?: number; page_size?: number; service_id?: string } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/server-archive', config)
    },
    getServerArchiveVo (payload: { query?: { page?: number; page_size?: number; service_id?: string }, path: { vo_id: string } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/server-archive/vo/' + payload.path.vo_id, config)
    }
  },
  service: {
    getService (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        center_id?: string;
        available_only?: boolean;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/service', config)
    },
    getServiceAdmin (payload: { query?: { page?: number; page_size?: number } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/service/admin', config)
    },
    getServiceVo (payload: { query?: { page?: number; page_size?: number; center_id?: string }, path: { vo_id: string } }) {
      const config = {
        params: payload.query
      }
      return axiosServer.get('/service/vo/' + payload.path.vo_id, config)
    },
    getServicePQuota (payload: { path: { id: string } }) {
      return axiosServer.get('/service/' + payload.path.id + '/p-quota')
    },
    postServicePQuota (payload: {
      body: {
        private_ip_total: number;
        public_ip_total: number;
        vcpu_total: number;
        ram_total: number;
        disk_size_total: number;
      },
      path: { id: string }
    }) {
      const data = payload.body
      return axiosServer.post('/service/' + payload.path.id + '/p-quota', data)
    },
    getServiceSQuota (payload: { path: { id: string } }) {
      return axiosServer.get('/service/' + payload.path.id + '/s-quota')
    },
    postServiceSQuota (payload: {
      body: {
        private_ip_total: number;
        public_ip_total: number;
        vcpu_total: number;
        ram_total: number;
        disk_size_total: number;
      },
      path: { id: string }
    }) {
      const data = payload.body
      return axiosServer.post('/service/' + payload.path.id + '/s-quota', data)
    }
  },
  user: {
    getUserAccount (payload?: {
      query?: {
        page?: number;
        page_size?: number
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/user/account', config)
    },
    getUserPermissionPolicy (payload?: {
      query?: {
        page?: number;
        page_size?: number;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/user/permission-policy', config)
    }
  },
  vms: {
    getVmsServicePQuota (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        service_id?: string;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/vms/service/p-quota', config)
    },
    getVmsServiceSQuota (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        service_id?: string;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/vms/service/s-quota', config)
    }
  },
  vo: {
    getVo (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        owner?: boolean;
        member?: boolean
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosServer.get('/vo', config)
    },
    postVo (payload: {
      body: {
        name: string;
        company: string;
        description: string;
      }
    }) {
      const data = payload.body
      return axiosServer.post('/vo', data)
    },
    postVoMembersRole (payload: {
      path: {
        member_id: string;
        role: string;
      }
    }) {
      return axiosServer.post('/vo/members/' + payload.path.member_id + '/role/' + payload.path.role)
    },
    patchVo (payload: {
      path: { id: string },
      body: {
        name: string;
        company: string;
        description: string
      }
    }) {
      const data = payload.body
      return axiosServer.patch('/vo/' + payload.path.id, data)
    },
    deleteVo (payload: { path: { id: string } }) {
      return axiosServer.delete('/vo/' + payload.path.id)
    },
    postVoAddMembers (payload: {
      path: { id: string },
      body: { usernames: string[] }
    }) {
      const data = payload.body
      return axiosServer.post('/vo/' + payload.path.id + '/add-members', data)
    },
    getVoListMembers (payload: { path: { id: string } }) {
      return axiosServer.get('/vo/' + payload.path.id + '/list-members')
    },
    postVoRemoveMembers (payload: {
      path: { id: string },
      body: { usernames: string[] }
    }) {
      const data = payload.body
      return axiosServer.post('/vo/' + payload.path.id + '/remove-members', data)
    }
  },
  vpn: {
    getVpn (payload: {
      path: { service_id: string }
    }) {
      return axiosServer.get('/vpn/' + payload.path.service_id)
    },
    patchVpn (payload: {
      path: { service_id: string },
      body: { password: string }
    }) {
      const data = payload.body
      return axiosServer.patch('/vpn/' + payload.path.service_id, data)
    },
    getVpnCa (payload: { path: { service_id: string } }) {
      return axiosServer.get('/vpn/' + payload.path.service_id + '/ca')
    },
    getVpnConfig (payload: { path: { service_id: string } }) {
      return axiosServer.get('/vpn/' + payload.path.service_id + '/config')
    }
  }
}
