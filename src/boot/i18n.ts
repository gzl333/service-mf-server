import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import { Quasar } from 'quasar'
import messages from 'src/i18n'

// extend the global Window type with 'i18n'
declare global {
  interface Window {
    i18n: string;
  }
}

// const quasar = useQuasar()

// // set quasar language set locale
// void import('quasar/lang/' + quasar.lang.getLocale()).then(lang => {
//   quasar.lang.set(lang.default)
// })

// try {
//   import('quasar/lang/' + Quasar.lang.getLocale()).then(lang => {
//     console.log(lang.default)
//     Quasar.lang.set(lang.default)
//   })
// } catch (err) {
//   // Requested Quasar Language Pack does not exist,
//   // let's not break the app, so catching error
// }

// 获取浏览器locale, 因只提供英文和简体中文两种locale，只截取locale code的前两位
const browserLocale = Quasar.lang.getLocale()?.slice(0, 2)

// 导出i18n实例供全局使用，singleSpa中避免使用useI18n方式
export const i18n = createI18n({
  // init i18n. Try to read from window object. If it does not exist, then read from browserLocale.
  // 不是中文的一律显示英文
  locale: window.i18n ? window.i18n : browserLocale === 'zh' ? 'zh' : 'en',
  fallbackLocale: 'zh', // 找不到翻译的就落到中文，可以避免再为中文写一份翻译库
  globalInjection: true,
  messages
})

// Register local handler of global i18n event.
// Dispatched at @cnic/main's MyHeader component.
window.addEventListener('i18n', ((event: CustomEvent) => {
  // console.log('server i18n event!')
  i18n.global.locale = event.detail

  // // set quasar language set locale
  // void import('quasar/lang/' + event.detail.includes('zh') ? 'zh-CN' : 'en-US').then(lang => {
  //   console.log(lang.default)
  //   quasar.lang.set(lang.default)
  // })

  // try {
  //   import('quasar/lang/' + event.detail.includes('zh') ? 'zh-CN' : 'en-US').then(lang => {
  //     console.log(lang.default)
  //     Quasar.lang.set(lang.default)
  //   })
  // } catch (err) {
  //   // Requested Quasar Language Pack does not exist,
  //   // let's not break the app, so catching error
  // }

// eslint-disable-next-line no-undef
}) as EventListener)

export default boot(({ app }) => {
  app.use(i18n)
})
