// en
import components from 'src/i18n/en/components'
import layouts from 'src/i18n/en/layouts'
import pages from 'src/i18n/en/pages'
import store from 'src/i18n/en/store'
import hooks from 'src/i18n/en/hooks'

export default {
  // generals
  name: 'Name',

  cloudPlatform: 'Cloud Platform',

  orderToPay: 'To be Paid',
  orderPaid: 'Paid',
  orderCancelled: 'Cancelled',
  orderRefunded: 'Refunded',
  orderResourceDelivered: 'Delivered',
  orderResourceFailed: 'Fail to Deliver',
  orderResourceReclaim: 'Reclaim Resource',
  orderResourceReclaiming: 'Reclaiming Resource...',
  orderResourceReclaimSuccess: 'Successfully Reclaimed Resource',
  orderPayMaxCoupons: 'Coupons used in each payment is limited to',

  // specifics
  // 独立翻译点,按照工程文件结构组织
  components,
  layouts,
  pages,
  store,
  hooks
}
