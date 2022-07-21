// component translation
export default {
  // { key: translation }
  chart: {}, // void
  coupon: {
    CouponCard: {
      points: 'Points',
      service: 'Owned service',
      expiration_time: 'Expiration Time'
    },
    CouponRedeemInput: {
      notification_input: 'There is an error in the coupon input, please check the input', // '代金券输入有误，请检查输入',
      notification_success: 'Successfully redeem coupon', // '成功兑换代金券',
      redeem: 'Redeem', // '兑换',
      redeem_group: 'Redeem to group', // '兑换到项目组',
      redeem_personal: 'Redeem to personal account' // '兑换到个人账户'
    },
    CouponTable: {
      coupon_id: 'Coupon Id', // '代金券ID',
      group: 'Group', // '所属组',
      service_node: 'Service Node', // '服务节点',
      redeem_date: 'Redemption Date', // '兑换日期',
      expiration_date: 'Expiration Date', // '失效日期',
      original_value: 'Original Value', // '原始面额',
      available_balance: 'Available Balance', // '可用余额',
      status: 'Status', // '状态',
      network_loading: 'Network request, please wait', // '网络请求中，请稍候...',
      no_coupon: 'No coupon available', // '暂无可用代金券',
      no_search_results: '无搜索结果',
      copy_to_clipboard: '复制到剪切板',
      group_detail: '项目组详情',
      points: '点',
      available: '可用',
      invalid: '失效'
    },
    RedeemCouponDialog: {
      notify_wrong_code: '兑换码输入有误，请检查输入',
      notify_no_group: '暂无可用项目组，请先创建或加入项目组',
      redeem_coupon: '兑换代金券',
      redeem_to: '兑换到',
      personal_account: '个人账户',
      group_account: '项目组账户',
      group: '项目组',
      create_group: '创建项目组',
      redeem_code: '兑换码',
      notify_input_code: '请输入兑换码',
      redeem: '兑换',
      cancel: '取消'
    }
  },
  group: {
    ButtonAdd: {
      create: '新建',
      create_group: '新建项目组',
      create_server: '新建组云主机'
    },
    GroupAddMemberDialog: {
      notify_max_members: '最多同时新增10个成员, 如有更多成员请分别添加。',
      notify_account: '请输入正确的用户账户',
      add_members: '增加成员',
      group_name: '项目组名称',
      user_account: '用户账户',
      more_accounts: '更多账户',
      cancel: '取消',
      confirm: '确定'
    },
    GroupEditDialog: {
      edit_group_information: '编辑项目组信息',
      group_name: '项目组名称',
      affiliation: '所属单位',
      remarks: '备注',
      cancel: '取消',
      confirm: '确定'
    },
    GroupMemberTable: {
      username: '用户名',
      my_role: '角色',
      join_time: '加入时间',
      inviter: '邀请人',
      operation: '操作',
      notify_loading: '网络请求中，请稍候...',
      notify_no_members: '项目组暂无成员',
      admin: '管理员',
      set_admin: '设为管理员',
      group_members: '组员',
      cancel_admin: '取消管理员',
      out_group: '移出项目组'
    },
    GroupRoleChip: {
      owner: '组长',
      admin: '管理员',
      member: '组员'
    },
    GroupTable: {
      my_role: '我的角色',
      group: '所属组',
      affiliation: '所属单位',
      remarks: '备注',
      creation_time: '创建时间',
      members: '成员',
      server: '云主机',
      order: '订单',
      coupon: '代金券',
      balance: '余额',
      operation: '操作',
      notify_loading: '网络请求中，请稍候...',
      notify_no_group: '暂无项目组',
      notify_no_result: '无搜索结果',
      details: '详情',
      member: '人',
      servers: '台',
      orders: '个',
      coupons: '个',
      points: '点',
      check_details: '查看详情',
      edit_group_info: '编辑项目组',
      dismiss_group: '解散项目组'
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
      points: '点',
      keep_order: '保留订单'
    },
    OrderDetailCard: {
      group_order_detail: '项目组订单详情',
      personal_order_details: '个人订单详情',
      notify_loading: '正在加载，请稍候',
      order_id: '订单',
      group: '所属项目组',
      group_detail: '项目组详情',
      order_place_user: '下单用户',
      cancel_order: '取消订单',
      new_purchase: '新购',
      renewal: '续期',
      upgrade: '升级',
      downgrade: '降级',
      monthly_prepaid: '包月预付',
      pay_as_go: '按量计费',
      submit_order: '提交订单',
      pay_order: '支付订单',
      no_prepayment_required: '按量计费无需预付',
      to_be_paid: '待支付',
      resource_delivery: '资源交付',
      to_be_delivered: '待交付',
      payment: '支付',
      resource_information: '资源信息',
      view_resources: '查看资源',
      cores: '核',
      memory: '内存',
      system_disk: '系统磁盘',
      server_id: '云主机ID',
      ip_address: 'IP地址',
      network_type: 'IP地址类型',
      public_network: '公网',
      private_network: '私网',
      network_segment: '网段',
      operating_system: '操作系统',
      affiliation: '所属机构',
      service_node: '服务节点',
      service_type: '服务类型',
      total_billing: '计费总额',
      discount: '优惠',
      points: '点',
      due_amount: '应付',
      actual_payment: '实付'
    },
    OrderPayDialog: {
      choose_coupon: '请选择要使用的代金券',
      pay_group_order: '支付项目组订单',
      pay_personal_order: '支付个人订单',
      order_id: '订单ID',
      amount_payable: '应付金额',
      payment_method: '支付方式',
      coupons: '代金券',
      available_balance: '余额',
      group: '所属项目组',
      group_coupon: '项目组代金券',
      personal_voucher: '个人代金券',
      selected: '已选',
      notify_group_no_coupon: '项目组账户内暂无该服务节点可用代金券',
      notify_personal_no_coupon: '个人账户内暂无该服务节点可用代金券',
      group_account_balance: '项目组账户余额',
      personal_account_balance: '个人账户余额',
      points: '点',
      confirm_pay: '确认支付',
      cancel: '取消'
    },
    OrderRenewDialog: {
      prepaid_time_warning: '预付时长应为',
      prepaid_time_months: '个月',
      target_time_requirement: '目标时间应晚于过期时间',
      renew_server: '续期云主机',
      ip_address: 'IP地址',
      network_type: '网络类型',
      remarks: '备注',
      group: '项目组',
      affiliation: '所属机构',
      service_node: '服务节点',
      public_network: '公网',
      private_network: '私网',
      configuration: '配置',
      cores: '核',
      billing_method: '计费方式',
      monthly_prepaid: '包月预付',
      pay_as_go: '按量计费',
      expiration_time: '过期时间',
      long_term: '长期',
      paid_no_renew: '按量计费的云主机无需续期',
      renew_type: '续期方式',
      specify_renewal_period: '指定续期时长',
      specify_expiration_time: '指定过期时间',
      renewal_period: '续期时长',
      target_time: '目标时间',
      place_order: '创建订单',
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
      group: '所属组',
      service_node: '服务节点',
      hardware_configuration: '硬件配置',
      network_type: '网络类型',
      place_time: '下单时间',
      order_type: '订单类型',
      billing_method: '计费方式',
      order_amount: '订单金额',
      status: '状态',
      operation: '操作',
      notify_loading: '网络请求中，请稍候...',
      notify_no_order: '暂无订单',
      notify_no_results: '无搜索结果',
      order_details: '订单详情',
      copy_to_clipboard: '复制到剪切板',
      project_detail: '项目组详情',
      cores: '核',
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
      create: '新建',
      create_personal_server: '新建个人云主机'
    }
  },
  server: {
    ServerDeleteDialog: {
      notify_cancel_delete_lock: '请取消云主机的删除锁定',
      delete_host: '删除云主机',
      force_delete_server: '强制删除云主机',
      ip_address: 'IP地址',
      remarks: '备注',
      group: '项目组',
      affiliation: '所属机构',
      service_node: '服务节点',
      configuration: '配置',
      cores: '核',
      operating_system: '操作系统',
      network_type: 'IP类型',
      public_network: '公网',
      private_network: '私网',
      available_period: '可用期',
      permanently_valid: '永久有效',
      read_carefully_check: '请仔细阅读以下事项，并在确认后勾选:',
      understand_delete: '我了解删除云主机会丢失全部数据，且无法自行恢复',
      understand_no_refund: '我了解已经支付的费用无法退款',
      cancel_lock: '请解除锁定，并确认删除：',
      locked: '已锁定',
      unlocked: '已解除锁定',
      delete_server_unlock: '未锁定云主机删除操作',
      delete_server_lock: '已锁定云主机删除操作',
      confirm: '确认',
      if_no_pay: '不想再次支付费用？请尝试',
      rebuild_server: '重建云主机',
      cancel: '取消'
    },
    ServerDeployCard: {
      prepaid_time_warning: '预付时长应为',
      prepaid_time_months: '个月',
      select_network: '请选择可用网络类型',
      select_os: '请选择可用操作系统',
      select_configuration: '请选择可用硬件配置',
      fill_remarks: '请填写备注',
      server_create_success: '成功新建云主机',
      group: '项目组',
      server_group: '使用该云主机的项目组',
      create_server_permission: '只有组长和管理员可以创建项目组云主机',
      no_group: '暂无项目组，请',
      create_group: '创建项目组',
      billing_method: '计费方式',
      monthly_prepaid: '包月预付',
      delivery_after_pay: '云主机将在付费后交付',
      pay_as_go: '按量计费',
      delivery_now: '云主机将立即交付，并开始计费',
      server_usage_period: '云主机使用时长',
      prepaid_period: '预付时长',
      service_node: '服务节点',
      no_available_service: '本机构暂无可用服务',
      network_type: '网络类型',
      private_ip_segment: '私网IP段',
      public_ip_segment: '公网IP段',
      node_no_network: '该服务节点无可用网络类型，请选择其它服务节点',
      operating_system: '操作系统',
      node_no_os: '该服务节点无可用操作系统，请选择其它服务节点',
      memory: '内存',
      cores: '核',
      node_no_configure: '该服务节点无可用配置，请选择其它服务节点',
      selected_configuration: '所选配置',
      prepayment_duration: '预付时长',
      months: '个月',
      select_group: '请选择项目组',
      select_service_node: '请选择服务节点',
      select_operating_system: '请选择操作系统',
      please_select_configuration: '请选择配置',
      remarks: '备注',
      create_server: '新建云主机',
      place_order: '新建云主机订单'
    },
    ServeDetailCard: {
      group_server_detail: '项目组云主机详情',
      personal_server_detail: '个人云主机详情',
      notify_loading: '正在加载，请稍候',
      copy: '复制',
      remarks: '备注',
      edit_remarks: '编辑备注',
      server_operation_locked: '已锁定云主机操作',
      server_operation_unlocked: '未锁定云主机操作',
      remote_control: '远程控制',
      power_remote_control: '请开机以使用远程控制',
      loading: '获取中',
      power_on: '开机',
      power_off: '关机',
      restart: '重启',
      force_power_off: '强制断电',
      rebuild_server: '重建云主机',
      delete: '删除',
      force_delete: '强制删除',
      initial_os_username: '系统初始用户名',
      unavailable_from_service: '服务节点未提供',
      initial_os_password: '系统初始密码',
      no_vpn_connect: '无需VPN连接',
      vpn_account_status: 'VPN 账户状态',
      activated: '已开启',
      deactivated: '已关闭',
      vpn_username: 'VPN 用户名',
      vpn_password: 'VPN 密码',
      vpn_config: 'VPN 配置文件',
      download: '下载',
      vpn_ca: 'VPN CA证书',
      view_vpn_usage: '查看VPN使用方法',
      group: '所属组',
      group_detail: '项目组详情',
      my_role: '我的角色',
      creator: '创建者',
      server_id: '云主机ID',
      hardware_configuration: '硬件配置',
      core: '核',
      memory: '内存',
      public_network: '公网',
      private_network: '私网',
      network_type: 'IP地址类型',
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
      server_operation_locked: '已锁定云主机操作',
      server_operation_unlocked: '未锁定云主机操作',
      server_detail: '云主机详情',
      server_renewal: '云主机续期',
      power_on: '开机',
      restart: '重启',
      power_off: '关机',
      force_power_off: '强制断电',
      rebuild_server: '重建云主机',
      delete: '删除',
      force_delete: '强制删除'
    },
    ServerRebuildDialog: {
      select_target_os: '请选择目标操作系统',
      rebuild_server: '重建云主机',
      ip_address: 'IP地址',
      remarks: '备注',
      group: '项目组',
      affiliation: '所属机构',
      service_node: '服务节点',
      hardware_configuration: '配置',
      cores: '核 ',
      network_type: 'IP类型',
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
      loading: '获取中',
      refresh_server_status: '刷新云主机状态',
      no_acquire: '未获取',
      running: '运行中',
      blocked: '已屏蔽',
      paused: '已暂停',
      shutting_down: '关机中',
      stopped: '已关机',
      crashed: '已崩溃',
      suspended: '被挂起',
      communication_fail: '通讯失败',
      lost: '已丢失',
      deploying: '创建中',
      deploy_fail: '创建失败'
    },
    ServeTable: {
      ip_address: 'IP地址',
      group: '所属组',
      service_node: '服务节点',
      operating_system: '操作系统',
      hardware_configuration: '配置',
      billing_method: '计费方式',
      remarks: '备注',
      remote_control: '远程控制',
      status: '状态',
      operation: '操作',
      notify_loading: '网络请求中，请稍候...',
      no_server_available: '暂无云主机',
      no_search_results: '无搜索结果',
      server_detail: '云主机详情',
      copy_to_clipboard: '复制到剪切板',
      group_detail: '项目组详情',
      cores: '核',
      monthly_prepaid: '包月预付',
      pay_as_go: '按量计费',
      expiration_time: '到期时间',
      notify_renew_server: '云主机已到期，请及时续期',
      edit_remarks: '编辑备注',
      start_remote: '进入远程控制',
      notify_start_before_remote: '请开机以使用远程控制'
    }
  },
  ui: {}
}
