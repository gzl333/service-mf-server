// zh
import components from 'src/i18n/zh/components'
import layouts from 'src/i18n/zh/layouts'
import pages from 'src/i18n/zh/pages'
import store from 'src/i18n/zh/store'
import hooks from 'src/i18n/zh/hooks'

export default {
  // generals
  name: '名称',

  cloudPlatform: '云管平台',

  orderToPay: '待支付',
  orderPaid: '已支付',
  orderCancelled: '已取消',
  orderRefunded: '已退款',
  orderResourceDelivered: '已交付',
  orderResourceFailed: '交付失败',
  orderResourceReclaim: '取回资源',
  orderResourceReclaiming: '正在取回资源...',
  orderResourceReclaimSuccess: '成功取回资源',
  orderPayMaxCoupons: '单次支付最多使用代金券数量',

  // deploy page
  serverNew: '新建云主机',
  serverOwner: '云主机账户',
  personalAccount: '个人账户',
  personalAccountDescription: '新的云主机将创建在个人账户内',
  groupAccount: '项目组账户',
  groupAccountDescription: '新的云主机将创建在选定的项目组账户内',
  balance: '余额',
  points: '点', // 复数
  group: '项目组',
  noGroup: '暂无可用项目组，请首先新建或加入项目组。',
  paymentMethod: '计费方式',
  prepaid: '包年包月',
  prepaidDescription: '订单将立即创建。云主机将在支付订单后交付。',
  postpaid: '按量计费',
  postpaidDescription: '云主机将立即交付。同时开始按量计费。',
  postpaidNotAllowed: '因账户内余额不足，暂无法使用按量计费',
  usagePeriod: '使用时长',
  countMonth: '个月', // 复数
  serviceUnit: '服务单元',
  noServiceUnit: '该机构暂无可用服务单元。',
  serviceStatus: '服务状态',
  serviceStatusGood: '正常',
  // serviceStatusNoOs: '该服务单元暂无可用操作系统',
  // serviceStatusNoNetwork: '该服务单元暂无可用网络',
  operatingSystem: '操作系统',
  noOperatingSystem: '该服务单元暂无可用操作系统',
  selectOperatingSystem: '请选择操作系统',
  network: '网络', // 复数
  noNetwork: '该服务单元暂无可用网络',
  selectNetwork: '请选择网络',
  publicNetwork: '公网',
  privateNetwork: '私网',
  serverSize: '配置',
  noServerSize: '该服务单元暂无可用配置',
  selectServerSize: '请选择云主机配置',
  countCore: '核', // 复数
  remark: '备注',
  inputRemark: '请输入备注',
  discountPrice: '折后价格',
  originalPrice: '原价',
  placeOrder: '新建订单',
  deployServer: '新建云主机',

  // specifics
  components,
  layouts,
  pages,
  store,
  hooks
}
