// page translation
export default {
  // { key: translation }
  group: {
    GroupCouponList: {
      group_filter: '筛选组'
    },
    GroupCreate: {
      create_group: '新建项目组',
      group_name: '项目组名称',
      group_desc: '项目组描述',
      group_org: '所属单位',
      create: '创建',
      cancel: '放弃'
    },
    GroupDetail: {
      group_detail: '项目组详情',
      loading: '正在加载，请稍候',
      group_account_balance: '项目组账户余额',
      point: '点',
      group_name: '项目组名称',
      comment: '备注',
      group_org: '所属单位',
      group_leader: '组长',
      creation_time: '建立时间',
      my_role: '我的角色',
      operation: '操作',
      edit_group_info: '编辑项目组信息',
      add_member: '增加成员',
      delete_group: '解散项目组',
      server: '云主机',
      member: '成员',
      order: '订单',
      coupon: '代金券',
      add_group_member: '新增成员', // 是否与增加成员表意一致？
      create_server: '新建云主机'
    },
    GroupIndex: {
      group_resources: '项目组资源',
      group_list: '项目组列表',
      server_list: '云主机列表',
      order_list: '订单列表',
      coupon_list: '代金券列表'
    },
    GroupList: {
      all_groups: '全部项目组',
      as_group_owner: '作为组长',
      as_group_manager: '作为管理员',
      as_group_member: '作为组员',
      my_role_filter: '筛选我的角色'
    },
    GroupMember: {},
    GroupOrder: {
      group_filter: '筛选组'
    },
    GroupOrderDetail: {},
    ServerDeploy: {
      create_group_server: '新建项目组云主机'
    },
    ServerDetail: {},
    ServerList: {
      group_filter: '筛选组'
    }
  },
  management: {
    ManagementIndex: {
      resource_management: '资源管理',
      resource_stat: '资源统计'
    },
    TotalResource: {
      huairou_district: '怀柔区', // 地名翻译
      miyun_district: '密云区',
      changping_district: '昌平区',
      shunyi_district: '顺义区',
      pinggu_district: '平谷区',
      mentougou_district: '门头沟区',
      haidian_district: '海淀区',
      shijingshan_district: '石景山区',
      xicheng_district: '西城区',
      dongcheng_district: '东城区',
      chaoyang_district: '朝阳区',
      daxing_district: '大兴区',
      fangshan_district: '房山区',
      fengtai_district: '丰台区',
      tongzhou_district: '通州区',
      yanqing_district: '延庆区',
      agency: '机构',
      agency_num: '机构数',
      current_agency_num: '当前机构数量：',
      current_service_num: '当前服务数量：',
      service_auto_resource_configuration: '服务自主资源配置',
      total_cpu: '总计CPU',
      core: '核',
      total_ram: '总计内存',
      total_disk: '总计硬盘',
      ram: '内存',
      disk: '硬盘',
      federal_resource_allocation: '联邦资源配置',
      total_cpu: '总计CPU', //
      core: '核',
      total_ram: '总计内存',
      total_disk: '总计硬盘',
      ram: '内存',
      disk: '硬盘' //
    }
  },
  order: {
    OrderIndex: {
      order: '订单',
      personal_order: '个人订单',
      group_order: '项目组订单'
    }
  },
  personal: {
    CouponList: {
      service_node_filter: '筛选服务节点'
    },
    PersonalDetail: {},
    PersonalIndex: {
      personal_resource: '个人资源',
      personal_account_balance: '个人账户余额',
      point: '点',
      server_list: '云主机列表',
      order_list: '订单列表',
      coupon_list: '代金券列表',
      create: '新建'
    },
    PersonalOrder: {
      service_node_filter: '筛选服务节点'
    },
    ServerDeploy: {
      create_personal_server: '新建个人云主机'
    },
    ServerDetail: {},
    ServerList: {
      service_node_filter: '筛选服务节点'
    }
  },
  provider: {
    ProviderIndex: {
      resource_provider: '资源提供者',
      active_server_stat: '在用云主机统计'
    },
    ServerDeployed: {
      ip_address: 'IP地址',
      service_node: '服务节点',
      user: '用户',
      remark: '备注',
      operating_system: '操作系统',
      cpu_and_ram: 'CPU/内存',
      network_type: '网络类型',
      creation_time: '创建时间',
      expiration_time: '到期时间',
      total_service: '全部服务',
      user_id: '用户ID',
      user_account: '用户账号',
      user_id: '用户ID', //
      user_account: '用户账号', //
      search_condition: '搜索条件:',
      select: '请选择',
      enter: '请输入',
      service_select: '请选择服务',
      search: '搜索',
      requesting: '网络请求中，请稍候...',
      no_server: '暂无云主机',
      core: '核',
      public_net: '公网',
      private_net: '私网',
      total_server: '共{{ paginationTable.count }}台云主机',
      page: '/页'
    },
    ServerDeployedNew: {
      search_condition: '搜索条件:',
      ip_address: 'IP地址',
      user_account: '用户账号',
      group_id: '项目组ID',
      service_node: '服务节点',
      service_node_filter: '筛选服务节点'
    }
  },
  vpn: {
    VpnIndex: {
      no_filter_results: '所输关键字无筛选结果',
      agency_filter: '筛选机构', // 何种机构？
      no_vpn_service: '该机构暂无可用VPN服务。',
      no_need_vpn: '该服务无需VPN。如有疑问，请联系该服务管理员。', //
      no_vpn_detail: '暂时无法获取该服务的VPN信息。如有疑问，请联系该服务管理员。', //
      account_status: '账户状态',
      activated: '已开启',
      deactivated: '已关闭',
      user_name: '用户名',
      copy: '复制', //
      password: '密码',
      replicate: '复制', // 同个文件中的同一单词如何保证翻译相同？两个翻译的复制哪个比较好？
      configuration_file: '配置文件',
      download: '下载',
      ca_certificate: 'CA证书',
      download: '下载', // 同个文件中的同一单词如何保证翻译相同？
      vpn_instruction: '查看VPN使用方法',
      create_vpn_account: '如需开启VPN账户，请联系该服务管理员。'
    }
  }
}
