// layouts translation
export default {
  // { key: translation }
  actions: {
    start: '开机',
    reboot: '重启',
    shutdown: '关机',
    poweroff: '强制断电',
    delete: '删除',
    delete_force: '强制删除'
  },
  notify: {
    delete_server_success: '成功删除云主机',
    edit_server_note_success: '成功修改云主机备注为',
    rebuilding_server: '正在重建云主机',
    rebuild_server_success: '成功重建云主机',
    rebuild_server_timeout: '重建云主机超时，请重试',
    edit_group_success: '项目组信息修改成功',
    add_group_member_success: '成功添加成员',
    add_group_member_fail: '添加成员失败，请重试',
    remove_group_member_success: '移除项目组成员',
    set_role_success: '已经被设置为',
    empty_input: '输入项不可为空，请填写全部栏目',
    new_group_success: '新建项目组成功',
    clean_before_dismiss_group: '请将组内的云主机全部删除后，再解散该项目组',
    dismiss_group_success: '解散项目组成功',
    paying_order: '正在支付',
    pay_order_success: '成功支付订单',
    cancel_order_success: '成功取消订单',
    renew_order_success: '成功创建续期订单',
    redeem_success: '成功兑换代金券'
  },
  dialog: {
    confirm_action: '确认执行',
    confirm: '确认',
    cancel: '取消',
    edit_server_note: '编辑云主机备注信息',
    remove_group_member: '移除项目组成员',
    set_role: '将成员设置为',
    dismiss_group: '解散项目组',
    dismiss_group_confirm: '解散后的项目组无法恢复。 确认解散？'
  }
}
