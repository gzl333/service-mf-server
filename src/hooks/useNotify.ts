// 显示通知的统一钩子函数

import { Notify } from 'quasar'

export default function () {
  return (type: string, msg: string) => {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: msg,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
}
