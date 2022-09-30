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

  personalCouponCount: 'Personal Voucher | Personal Vouchers',
  couponUnit: 'Piece | Pieces',

  // deploy page
  serverNew: 'Deploy New Server',
  serverOwner: 'Server Owner',
  personalAccount: 'Personal Account',
  personalAccountDescription: 'New server will be deployed under your personal account',
  groupAccount: 'Group Account',
  groupAccountDescription: 'New server will be deployed under one of your group accounts',
  balance: 'Balance',
  points: 'Point | Points', // 复数
  group: 'Group',
  noGroup: 'No groups available. Please create a group or join a group before using it.',
  paymentMethod: 'Payment Method',
  prepaid: 'Monthly/Yearly Prepaid',
  prepaidDescription: 'An order will be placed. New server will be deployed after payment.',
  postpaid: 'Usage Based Billing',
  postpaidDescription: 'New server will be deployed now. Meanwhile usage based billing starts.',
  postpaidNotAllowed: 'Usage Based Billing is not allowed due to low balance in the selected account.',
  usagePeriod: 'Usage Period',
  countMonth: 'Month | Months', // 复数
  serviceUnit: 'Service Unit',
  noServiceUnit: 'Currently no service unit available at this organisation.',
  serviceStatus: 'Service Status',
  serviceStatusGood: 'Good',
  // serviceStatusNoOs: 'Currently no operating system available at this service unit.',
  // serviceStatusNoNetwork: 'Currently no network available at this service unit.',
  operatingSystem: 'Operating System',
  noOperatingSystem: 'Currently no operating system available at this service unit.',
  selectOperatingSystem: 'Please select an operating system',
  network: 'Network | Networks', // 复数
  noNetwork: 'No networks available at this service unit.',
  selectNetwork: 'Please select a network.',
  publicNetwork: 'Public Network',
  privateNetwork: 'Private Network',
  serverSize: 'Server Size',
  noServerSize: 'Currently no server sizes available at this service unit.',
  selectServerSize: 'Please select a server size',
  countCore: 'Core | Cores', // 复数
  remark: 'Remark',
  inputRemark: 'Please fill in the remark',
  discountPrice: 'Discounted Price',
  originalPrice: 'Original Price',
  placeOrder: 'Place Order',
  deployServer: 'Deploy Server',

  // server detail card
  vpnInfo: 'VPN Info',
  seeVpn: 'See VPN',
  jumpToVpn: 'Jump to this VPN',
  vpnNotRequired: 'VPN is not required',
  memory: 'Memory',

  // specifics
  // 独立翻译点,按照工程文件结构组织
  components,
  layouts,
  pages,
  store,
  hooks
}
