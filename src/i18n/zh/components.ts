// component translation
export default {
  // { key: translation }
  chart: {}, // void
  coupon: {
    CouponCard: {
      points: '点',
      service: '所属服务',
      expiration_time: '到期时间'
    },
    CouponRedeemInput: {
      notification_input: '代金券输入有误，请检查输入',
      notification_success: '成功兑换代金券',
      redeem: '兑换',
      redeem_group: '兑换到项目组',
      redeem_personal: '兑换到个人账户'
    },
    CouponTable: {
      vouchers_id: '代金券ID', // coupon_id
      group: '所属组',
      service_node: '服务节点',
      redeem_date: '兑换日期',
      expiration_date: '失效日期',
      original_denomination: '原始面额', // original_value
      available_balance: '可用余额',
      status: '状态',
      network_wait: '网络请求中，请稍候...', // network_loading
      no_vouchers: '暂无可用代金券', // no_coupon
      no_search_results: '无搜索结果',
      copy_clipboard: '复制到剪切板', // copy_to_clipboard
      project_detail: '项目组详情', // group_detail
      point: '点', // points
      available: '可用',
      invalid: '失效'
    },

    RedeemCouponDialog: {
      redemption_error: '兑换码输入有误，请检查输入', // notify_wrong_code
      no_available_project: '暂无可用项目组，请先创建或加入项目组', // notify_no_group
      redeem_vouchers: '兑换代金券', // redeem_coupon
      redeem_to: '兑换到',
      personal_account: '个人账户',
      project_account: '项目组账户', // group_account
      project_group: '项目组', // group
      no_project_group: '暂无项目组', // notify_no_group
      build_project_group: '创建项目组', // create_group
      redemption_code: '兑换码', // redeem_code
      input_redemption_code: '请输入兑换码', // notify_input_code
      redeem: '兑换',
      cancel: '取消'
    }
  },
  group: {
    ButtonAdd: {
      new_build: '新建', // create
      new_project_group: '新建项目组', // create_group
      new_cloud_host: '新建组云主机' // create_server
    },
    GroupAddMemberDialog: {
      new_max_members: '最多同时新增10个成员, 如有更多成员请分别添加。', // notify_max_members
      correct_account: '请输入正确的用户账户', // notify_account
      add_members: '增加成员',
      project_group_name: '项目组名称', // group_name
      user_account: '用户账户',
      more_accounts: '更多账户',
      cancel: '取消',
      confirm: '确定'
    },
    GroupEditDialog: {
      edit_group_information: '编辑项目组信息',
      project_group_name: '项目组名称', // group_name
      affiliated_unit: '所属单位', // affiliation
      remarks: '备注',
      cancel: '取消',
      confirm: '确定'
    },
    GroupMemberTable: {
      user_name: '用户名', // username
      role: '角色', // my_role
      join_time: '加入时间',
      inviter: '邀请人',
      operation: '操作',
      network_wait: '网络请求中，请稍候...', // notify_loading
      no_members: '项目组暂无成员', // notify_no_members
      admin: '管理员',
      set_admin: '设为管理员',
      group_members: '组员',
      cancel_admin: '取消管理员',
      remove_project_group: '移出项目组' // out_group
    },

    GroupRoleChip: {
      group_leader: '组长', // owner
      admin: '管理员',
      group_members: '组员' // member
    },
    GroupTable: {
      my_role: '我的角色',
      group: '所属组',
      affiliated_unit: '所属单位', // affiliation
      remarks: '备注',
      creation_time: '创建时间',
      members: '成员',
      cloud_host: '云主机', // server
      order: '订单',
      vouchers: '代金券', // coupon
      available_balance: '余额', // balance
      operation: '操作',
      network_wait: '网络请求中，请稍候...', // notify_loading
      no_project_group: '暂无项目组', // notify_no_group
      no_search_results: '无搜索结果', // notify_no_result
      details: '详情',
      person: '人', // members
      table: '台', // servers
      indivual: '个', // orders
      point: '点', // points
      check_details: '查看详情',
      edit_project_group: '编辑项目组', // edit_group_info
      disband_project_group: '解散项目组' // dismiss_group
    }
  },

  order: {
    OrderCancelDialog: {
      cancel_order: '取消订单',
      order_id: '订单ID',
      order_status: '订单状态',
      order_creation_time: '下单时间',
      affiliation: '所属机构',
      service_node: '服务节点',
      amount_payable: '应付金额',
      point: '点', // points
      holder_order: '保留订单' // keep_order
    },
    OrderDetailCard: {
      project_order_details: '项目组订单详情', // group_order_detail
      personal_order_details: '个人订单详情',
      loading_wait: '正在加载，请稍候', // notify_loading
      order_id: '订单',
      project_group: '所属项目组', // group
      project_detail: '项目组详情', // group_detail
      oder_user: '下单用户', // order_place_user
      cancel_order: '取消订单',
      new_purchase: '新购',
      renewal: '续期',
      upgrade: '升级',
      downgrade: '降级',
      monthly_prepaid: '包月预付',
      pay_as_go: '按量计费',
      submit_order: '提交订单',
      pay_order: '支付订单',
      pay_without_prepayment: '按量计费无需预付', // no_prepayment_required
      to_be_paid: '待支付',
      resource_delivery: '资源交付',
      to_be_delivered: '待交付',
      payment: '支付',
      resource_information: '资源信息',
      view_resources: '查看资源',
      nuclear: '核', // cores
      memory: '内存',
      system_disk: '系统磁盘',
      cloud_host_id: '云主机ID', // server_id
      ip_address: 'IP地址',
      ip_address_type: 'IP地址类型', // network_type
      public_network: '公网',
      private_network: '私网',
      network_segment: '网段',
      operating_system: '操作系统',
      affiliation: '所属机构',
      service_node: '服务节点',
      service_type: '服务类型',
      total_billing: '计费总额',
      discount: '优惠',
      point: '点', // points
      payable: '应付', // due_amount
      actually_paid: '实付' // actual_payment
    },
    OrderPayDialog: {
      choose_voucher: '请选择要使用的代金券', // choose_coupon
      pay_project_order: '支付项目组订单', // pay_group_order
      pay_personal_orders: '支付个人订单',
      order_id: '订单ID',
      amount_payable: '应付金额',
      payment_method: '支付方式',
      vouchers: '代金券', // coupons
      available_balance: '余额',
      project_group: '所属项目组', // group
      project_group_voucher: '项目组代金券', // group_coupon
      personal_voucher: '个人代金券', // personal_coupon
      selected: '已选',
      project_no_voucher: '项目组账户内暂无该服务节点可用代金券', // notify_group_no_coupon
      personal_no_voucher: '个人账户内暂无该服务节点可用代金券', // notify_personal_no_coupon
      project_account_balance: '项目组账户余额', // group_account_balance
      personal_account_balance: '个人账户余额',
      point: '点', // points
      confirm_pay: '确认支付',
      cancel: '取消'
    },

    OrderRenewDialog: {
      prepaid_time_interval: '预付时长应介于1-{MAX_MONTHS}个月之间',
      target_time_requirement: '目标时间应晚于过期时间',
      renew_cloud_host: '续期云主机', // renew_server
      ip_address: 'IP地址',
      network_type: '网络类型',
      remarks: '备注',
      project_group: '项目组', // group
      affiliation: '所属机构',
      service_node: '服务节点',
      public_network: '公网',
      private_network: '私网',
      configuration: '配置',
      nuclear: '核', // cores
      billing_method: '计费方式',
      monthly_prepaid: '包月预付',
      pay_as_go: '按量计费',
      expiration_time: '过期时间',
      long_term: '长期',
      paid_no_renew: '按量计费的云主机无需续期', // no_prepayment_required
      renewal_way: '续期方式', // renew_type
      specify_renewal_period: '指定续期时长',
      specify_expiration_time: '指定过期时间',
      renewal_period: '续期时长',
      number_interval: '应为介于1-{MAX_MONTHS}之间的整数',
      target_time: '目标时间',
      create_order: '创建订单', // place_order
      cancel: '取消'
    },
    OrderStatus: {
      to_be_paid: '待支付',
      paid: '已支付',
      cancelled: '已取消',
      refunded: '已退款'
    },
    OrderTable: {
      order_id: '订单ID',
      project_group: '所属组', // group
      service_node: '服务节点',
      hardware_configuration: '硬件配置',
      network_type: '网络类型',
      order_time: '下单时间', // place_time
      order_type: '订单类型',
      billing_method: '计费方式',
      order_amount: '订单金额',
      state: '状态', // status
      operation: '操作',
      network_wait: '网络请求中，请稍候...', // notify_loading
      no_order: '暂无订单', // notify_no_order
      no_search_results: '无搜索结果', // notify_no_results
      order_details: '订单详情',
      copy_clipboard: '复制到剪切板', // copy_to_clipboard
      project_detail: '项目组详情', // group_detail
      nuclear: '核', // cores
      public_network: '公网',
      private_network: '私网',
      new_purchase: '新购',
      renewal: '续期',
      upgrade: '升级',
      downgrade: '降级',
      monthly_prepaid: '包月预付',
      pay_as_go: '按量计费',
      points: '点',
      check_details: '查看详情',
      pay_orders: '支付订单',
      cancel_order: '取消订单'
    }
  },
  personal: {
    ButtonAdd: {
      new_build: '新建', // create
      new_personal_host: '新建个人云主机' // create_personal_server
    }
  },
  server: {
    ServerDeleteDialog: {
      cancel_delete_host: '请取消云主机的删除锁定', // notify_cancel_delete_lock
      delete_host: '删除云主机',
      forcibly_delete_host: '强制删除云主机', // force_delete_server
      ip_address: 'IP地址',
      remarks: '备注',
      project_group: '项目组', // group
      affiliation: '所属机构',
      service_node: '服务节点',
      configuration: '配置',
      nuclear: '核', // cores
      operating_system: '操作系统',
      ip_type: 'IP类型', // network_type
      public_network: '公网',
      private_network: '私网',
      available_period: '可用期',
      permanently_valid: '永久有效',
      read_carefully_check: '请仔细阅读以下事项，并在确认后勾选:',
      understand_delete: '我了解删除云主机会丢失全部数据，且无法自行恢复',
      understand_pay_rule: '我了解已经支付的费用无法退款', // understand_no_refund
      unlock_confirm_deletion: '请解除锁定，并确认删除：', // cancel_lock
      locked: '已锁定',
      unlocked: '已解除锁定',
      unlock_delete_host: '未锁定云主机删除操作', // delete_server_unlock
      lock_delete_host: '已锁定云主机删除操作', // delete_server_lock
      confirm: '确认',
      try_no_pay: '不想再次支付费用？请尝试', // if_no_pay
      rebuild_cloud_host: '重建云主机', // rebuild_server
      cancel: '取消'
    },
    ServeDeployCard: {
      prepaid_time_interval: '预付时长应介于1-{MAX_MONTHS}个月之间',
      select_network_type: '请选择可用网络类型', // select_network
      select_available_os: '请选择可用操作系统', // select_os
      select_available_configure: '请选择可用硬件配置', // select_configuration
      fill_remarks: '请填写备注',
      successfully_created_host: '成功新建云主机', // server_create_success
      project_group: '项目组', // group
      project_group_host: '使用该云主机的项目组', // server_group
      create_host_permissions: '只有组长和管理员可以创建项目组云主机', // create_server_permission
      no_available_project: '暂无项目组，请', // no_group
      create_group: '创建项目组',
      billing_method: '计费方式',
      monthly_prepaid: '包月预付',
      delivery_after_pay: '云主机将在付费后交付',
      pay_as_go: '按量计费',
      delivery_now_pay: '云主机将立即交付，并开始计费', // delivery_now
      use_host_time: '云主机使用时长', // server_usage_period
      prepaid_time: '预付时长', // prepaid_period
      service_node: '服务节点',
      no_available_service: '本机构暂无可用服务',
      network_type: '网络类型',
      private_ip_segment: '私网IP段',
      public_ip_segment: '公网IP段',
      node_no_network: '该服务节点无可用网络类型，请选择其它服务节点',
      operating_system: '操作系统',
      node_no_os: '该服务节点无可用操作系统，请选择其它服务节点',
      memory: '内存',
      nuclear: '核', // cores
      node_no_configure: '该服务节点无可用配置，请选择其它服务节点',
      selected_configuration: '所选配置',
      prepayment_duration: '预付时长',
      months: '个月',
      select_project_group: '请选择项目组', // select_group
      select_service_node: '请选择服务节点',
      select_operating_system: '请选择操作系统',
      please_select_configuration: '请选择配置',
      remarks: '备注',
      created_host: '新建云主机', // create_server
      created_host_order: '新建云主机订单' // place_order
    },
    ServeDetailCard: {
      project_host_details: '项目组云主机详情', // group_server_detail
      personal_host_details: '个人云主机详情', // personal_server_detail
      loading_wait: '正在加载，请稍候', // notify_loading
      copy: '复制',
      remarks: '备注',
      edit_remarks: '编辑备注',
      locked_host_operation: '已锁定云主机操作', // server_operation_locked
      unlocked_host_operation: '未锁定云主机操作', // server_operation_unlocked
      remote_control: '远程控制',
      power_remote_control: '请开机以使用远程控制',
      acquiring: '获取中', // loading
      power_on: '开机',
      shut_down: '关机', // power_off
      restart: '重启',
      forced_power_off: '强制断电', // force_power_off
      rebuild_cloud_host: '重建云主机', // rebuild_server
      cancel: '删除', // delete
      force_deletion: '强制删除', // force_delete
      initial_user_name: '系统初始用户名', // initial_os_username
      no_service_node: '服务节点未提供', // unavailable_from_service
      system_initial_password: '系统初始密码', // initial_os_password
      no_vpn_connect: '无需VPN连接', // vpn_not_required
      vpn_account_state: 'VPN 账户状态', // vpn_account_status
      opened: '已开启', // activated
      closed: '已关闭', // deactivated
      vpn_user_name: 'VPN 用户名', // vpn_username
      vpn_password: 'VPN 密码',
      vpn_profile: 'VPN 配置文件', // vpn_config
      download: '下载',
      vpn_ca_certificate: 'VPN CA证书', // vpn_ca
      view_vpn_usage: '查看VPN使用方法',
      project_group: '所属组', // group
      project_detail: '项目组详情', // group_detail
      my_role: '我的角色',
      creator: '创建者',
      cloud_host_id: '云主机ID', // server_id
      hardware_configuration: '硬件配置',
      core: '核', // cores
      memory: '内存',
      public_network: '公网',
      private_network: '私网',
      ip_address_type: 'IP地址类型', // network_type
      operating_system: '操作系统',
      system_specification: '系统描述',
      billing_type: '计费类型',
      monthly_prepaid: '包月预付',
      pay_as_go: '按量计费',
      create_time: '创建时间',
      expiration_time: '到期时间',
      long_term: '长期',
      renewal: '续期',
      affiliation: '所属机构',
      service_node: '服务节点',
      service_type: '服务类型'
    },
    ServerOperationBtnGroup: {
      locked_host_operation: '已锁定云主机操作', // server_operation_locked
      unlocked_host_operation: '未锁定云主机操作', // server_operation_unlocked
      cloud_host_details: '云主机详情', // server_detail
      cloud_host_renewal: '云主机续期', // server_renewal
      starting_up: '开机', // power_on
      restart: '重启',
      shut_down: '关机', // power_off
      forced_power_off: '强制断电', // force_power_off
      rebuild_cloud_host: '重建云主机', // rebuild_server
      delete: '删除',
      force_deletion: '强制删除' // force_delete
    },
    ServerRebuildDialog: {
      select_target_os: '请选择目标操作系统',
      rebuild_cloud_host: '重建云主机', // rebuild_server
      ip_address: 'IP地址',
      remarks: '备注',
      project_group: '项目组', // group
      affiliation: '所属机构',
      service_node: '服务节点',
      configuration: '配置', // hardware_configuration
      nuclear: '核 ', // cores
      ip_type: 'IP类型', // network_type
      public_network: '公网',
      private_network: '私网',
      available_period: '可用期',
      operating_system: '操作系统',
      target_operating_system: '目标操作系统',
      read_carefully_check: '请仔细阅读以下事项，并在确认后勾选:',
      understand_delete: '我了解删除云主机会丢失全部数据，且无法自行恢复',
      confirm: '确认',
      cancel: '取消'
    },
    ServerStatus: {
      acquiring: '获取中', // loading
      refresh_host_status: '刷新云主机状态', // refresh_server_status
      no_acquire: '未获取',
      running: '运行中',
      blocked: '已屏蔽',
      paused: '已暂停',
      shutting_down: '关机中',
      shut_down: '已关机', // stopped
      crashed: '已崩溃',
      suspended: '被挂起',
      communication_fail: '通讯失败',
      lost: '已丢失',
      creating: '创建中', // deploying
      create_fail: '创建失败' // deploy_fail
    },
    ServeTable: {
      ip_address: 'IP地址',
      project_group: '所属组', // group
      service_node: '服务节点',
      operating_system: '操作系统',
      configuration: '配置', // hardware_configuration
      billing_method: '计费方式',
      remarks: '备注',
      remote_control: '远程控制',
      state: '状态', // status
      operation: '操作',
      loading_wait: '网络请求中，请稍候...', // notify_loading
      no_cloud_host: '暂无云主机', // no_server_available
      no_search_results: '无搜索结果',
      cloud_host_details: '云主机详情', // server_detail
      copy_clipboard: '复制到剪切板', // copy_to_clipboard
      project_group_detail: '项目组详情', // group_detail
      nuclear: '核', // cores
      monthly_prepaid: '包月预付',
      pay_as_go: '按量计费',
      expiration_time: '到期时间',
      expired_renew_host: '云主机已到期，请及时续期', // notify_renew_server
      edit_remarks: '编辑备注',
      into_remote_control: '进入远程控制', // start_remote
      open_remote_control: '请开机以使用远程控制' // notify_start_before_remote
    }
  },
  ui: {}
}
