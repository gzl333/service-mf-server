// layouts translation
export default {
  // { key: translation }
  actions: {
    start: 'Start Server',
    reboot: 'Restart Server',
    shutdown: 'Stop Server',
    poweroff: 'Power Off Server',
    delete: 'Delete Server',
    delete_force: 'Force Delete Server'
  },
  notify: {
    delete_server_success: 'Successfully deleted server', // '成功删除云主机',
    edit_server_note_success: 'Successfully changed server notes to', // '成功修改云主机备注为',
    rebuilding_server: 'Rebuilding Server', // '正在重建云主机',
    rebuild_server_success: 'Successfully rebuilt server', // '成功重建云主机',
    rebuild_server_timeout: 'Timeout when rebuilding server, please try again', // '重建云主机超时，请重试',
    edit_group_success: 'Successfully edited group information', // '项目组信息修改成功',
    add_group_member_success: 'Successfully added group member', // '已经成功添加成员',
    add_group_member_fail: 'Failed to add group member, please try again', // '添加成员失败',
    remove_group_member_success: 'Successfully removed group member', // '已经移除项目组成员',
    set_role_success: 'has been set as', // '已经被设置为',
    empty_input: 'All blanks must be filled, please check inputs', // '输入项不可为空，请填写全部栏目',
    new_group_success: 'Successfully created a new group', // '新建项目组成功',
    clean_before_dismiss_group: 'Please delete all servers before dismissing the group', // '请将组内的云主机全部删除后，再解散该项目组',
    dismiss_group_success: 'Successfully dismissed group', // '解散项目组成功',
    paying_order: 'Making payment', // '正在支付',
    pay_order_success: 'Successfully made payment', // '已经成功支付订单',
    cancel_order_success: 'Successfully canceled order', // '已经成功取消订单',
    renew_order_success: 'Successfully placed renewal order', // '已经成功创建续期订单',
    redeem_success: 'Successfully redeemed voucher' // '成功兑换代金券'
  },
  dialog: {
    confirm_action: 'Confirm Action', // '确认执行',
    confirm: 'Confirm',
    cancel: 'Cancel',
    edit_server_note: 'Edit Server Notes', // '编辑云主机备注信息',
    remove_group_member: 'Remove Group Member', // '移除项目组成员',
    set_role: 'Set Group Member as', // '将成员设置为',
    dismiss_group: 'Dismiss Group', // '解散项目组',
    dismiss_group_confirm: 'Dismissed groups cannot be recovered.' // '解散后的项目组无法恢复。 确认解散？'
  }
}
