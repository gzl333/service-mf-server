// 复制信息到剪切板的钩子函数
import { copyToClipboard, useQuasar } from 'quasar'
import { i18n } from 'boot/i18n'

export default function () {
  const $q = useQuasar()
  // 调用useHook函数后对外暴露一个函数，这个函数内部包裹一个copyToClipboard的调用形式，并在其成功后调用notify函数
  return (text: string, isSecret?: boolean) => {
    void copyToClipboard(text).then(() => {
      // console.log(i18n.global)
      $q.notify({
        classes: 'notification-primary shadow-15',
        textColor: 'primary',
        icon: 'mdi-checkbox-multiple-marked',
        // html: true,
        message: isSecret ? `${i18n.global.tc('内容已经复制到剪切板')}` : `${text} ${i18n.global.tc('已经复制到剪切板')}`,
        position: 'bottom',
        closeBtn: true,
        // timeout: 2000,
        multiLine: false
      })
    })
  }
}
