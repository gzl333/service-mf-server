<script setup lang="ts">
import { ref, computed, watch /* , PropType */ } from 'vue'
import { FlavorInterface, ImageInterface, NetworkInterface, useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { navigateToUrl } from 'single-spa'
import { i18n } from 'boot/i18n'
import api from 'src/api'

// @ts-expect-error
// import { useStoreMain } from '@cnic/main'

import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'
import OsLogo from 'components/ui/OsLogo.vue'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

// const props = defineProps({
//   foo: {
//     type: String as PropType<'bar'>,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
const route = useRoute()
const router = useRouter()
// const storeMain = useStoreMain()

// 预付最大月份
const MAX_MONTHS = 6

const exceptionNotifier = useExceptionNotifier()

// deploy时需要项目组相关数据，应加载group的基础table(groupTable & groupMemberTable)
store.loadDeployTables()

// await store.loadPersonalCouponTable()
// for (const groupId of store.tables.groupTable.allIds) {
//   store.loadGroupCouponTable({ groupId })
// }

// summary折叠
// const isShow = ref(true)

// // system disk 限制，单位GiB
// // 接口限定最大500GiB
// const MAX_SYSTEM_DISK = 500
// // 根据所选image限定最小值, 创建接口要求为50倍数。该字段由服务管理员填写，可能填错，因此需提高健壮性，此处取成最小的50倍数。
// const MIN_SYSTEM_DISK = computed(() => Math.ceil(store.tables.serviceImageTable.byLocalId[`${selectionService.value}-${selectionImage.value}`]?.min_sys_disk_gb / 50 || 1) * 50)

// 是否禁止使用后付费模式
// 目前判断个人账户或者项目组账户余额<=0
const isAllowPostpaid = computed(() => {
  // // 待向groups内补充balance字段
  // return true

  // 联邦管理员、服务单元管理员不限制
  if (store.items.fedRole === 'federal-admin' || store.items.adminServiceIds.length > 0) {
    return true
  }

  // 普通用户进行判断
  if (selectionOwner.value === 'group') {
    return Number(compSelectionGroup.value?.stats.balance) > 0
  } else {
    return Number(store.items?.personalBalance) > 0
  }
})

// dom元素
const input = ref<HTMLElement>()

/* 选项数据 */
// 全局数据，只获取一次
// const dataCenters = ref<DataCenterInterface[]>([])
// const services = ref<NewServiceInterface[]>([])
// const groups = ref<GroupInterface[]>([])

// owner/leader权限才能建立云主机， member不能建立
const groups = computed(() => store.getGroupsByMyRole(['owner', 'leader', 'member']))
const dataCenters = computed(() => store.tables.dataCenterTable.allIds.map(id => store.tables.dataCenterTable.byId[id]).filter(dataCenter => dataCenter.status.code === 1))
const services = computed(() => Object.values(store.tables.serviceTable.byId))
const currAccountCoupons = computed(() => {
  if (selectionOwner.value === 'personal') {
    return Object.values(store.tables.personalCouponTable.byId)
  } else {
    return Object.values(store.tables.groupCouponTable.byId).filter(coupon => coupon?.vo?.id === selectionGroupId.value)
  }
})

// 依赖selectionService Id选择值的数据
// 当前service_id对应的image集合，随service_id选择而改变
const images = ref<ImageInterface[]>([])
// 当前images里面可供选择的release数组， 由images数组归并而来, 由images自动筛选、归并、去重、排序、整理格式
const imageReleases = computed(() =>
  images.value
    .filter(image => image.serviceId === selectionServiceId.value)
    .reduce((accumulator: string[], item) => {
      if (!accumulator.includes(item.release)) {
        accumulator.push(item.release)
      }
      return accumulator
    }, [])
    .sort((a, b) => a.localeCompare(b, 'en-US'))
)

// 当前service_id对应的flavor/size集合，随service_id选择而改变
const flavors = ref<FlavorInterface[]>([])
// Object.assign(flavors.value, { isLoading: false }) // 尝试，添加一个loading的属性
const publicNetworks = ref<NetworkInterface[]>([])
const privateNetworks = ref<NetworkInterface[]>([])
// const systemDisks = computed(() => Array.from({ length: (MAX_SYSTEM_DISK - MIN_SYSTEM_DISK.value) / 50 + 1 }, (item, index) => MIN_SYSTEM_DISK.value + index * 50))
/* 选项数据 */

/* selection */
const selectionOwner = ref<'personal' | 'group'>('personal')
const selectionPayment = ref<'prepaid' | 'postpaid'>('prepaid')
const selectionPeriod = ref(1)

const selectionGroupId = ref('')
const compSelectionGroup = computed(() => groups.value.find(group => group.id === selectionGroupId.value))

const selectionServiceId = ref('')
const compSelectionService = computed(() => services.value.find(service => service.id === selectionServiceId.value))

const compSelectionDatacenter = computed(() => services.value.find(service => service.id === selectionServiceId.value)?.data_center)
// const compSelectionDatacenterId = computed(() => services.value.find(service => service.id === selectionServiceId.value)?.data_center?.id || '')

// image的id，来自images, 是local id, 不是拼接的id
const selectionImageId = ref('')
const compSelectionImage = computed(() => images.value.filter(image => image.serviceId === selectionServiceId.value).find(image => image.id === selectionImageId.value))

// image的发行版, 不是image的最终选择，只用来筛选image第二个selection的显示选项
const selectionImageRelease = ref('')

// 当前flavor选择，是local id
const selectionFlavorId = ref('')
const compSelectionFlavor = computed(() => flavors.value.filter(flavor => flavor.service_id === selectionServiceId.value).find(flavor => flavor.id === selectionFlavorId.value))

const selectionNetworkId = ref<'randomPrivate' | 'randomPublic' | string>('')
const compSelectionNetwork = computed(() => privateNetworks.value.filter(network => network.serviceId === selectionServiceId.value).find(network => network.id === selectionNetworkId.value) ||
  publicNetworks.value.filter(network => network.serviceId === selectionServiceId.value).find(network => network.id === selectionNetworkId.value))

const inputRemarks = ref('')

// // 待实现
// const selectionSystemDisk = ref(50)
// const selectionDataDisk = ref(0)

/* selection */

/* 询价 */
// 询价对象
const currentPrice = ref<{ original: string; trade: string } | null>(null)
// 根据selection进行询价
watch([selectionPayment, selectionPeriod, selectionFlavorId, selectionNetworkId, selectionImageId], async () => {
  // prepaid时才询价，其他几个参数都不为空时才询价（其中period初始值为1, 肯定不为空）
  // 初始化过程中有些table未load，此时不该询价。都有有效选择后，则可以询价。
  if (selectionPayment.value === 'prepaid' && selectionFlavorId.value !== '' && selectionNetworkId.value !== '') {
    try {
      // 发出询价请求
      const respGetPrice = await api.server['describe-price'].getDescribePrice({
        query: {
          resource_type: 'vm',
          pay_type: selectionPayment.value,
          period: selectionPeriod.value,
          flavor_id: selectionFlavorId.value,
          external_ip: selectionNetworkId.value === 'randomPublic' || compSelectionNetwork.value?.public,
          system_disk_size: compSelectionImage.value?.min_sys_disk_gb || 50 // 按照镜像要求来，没有就默认50
        }
      })
      // 拿到price
      currentPrice.value = respGetPrice.data.price
    } catch (exception) {
      exceptionNotifier(exception)
      // 若询价失败，清除当前询价结果
      currentPrice.value = null
    }
  } else {
    // 不满足询价条件时，应清空询价结果，避免遗留历史询价结果
    currentPrice.value = null
  }
})
/* 询价 */

/* 分为显示和选择动作两部分。
* 显示部分在标签里进行逻辑判断，哪些显示，哪些不显示
* 选择动作在ts部分，selection真正选择了哪些值 */

/* selection默认选择 */
const chooseService = () => {
  selectionServiceId.value = route.query.service as string || services.value[0]?.id || ''
}
const chooseOwner = () => {
  selectionOwner.value = route.query.group || route.query.isgroup ? 'group' : 'personal' // query传递groupId的话则选择为项目组使用
}
const chooseGroup = () => {
  // best strategy but been denied by moron
  // selectionGroupId.value = route.query.group as string || groups.value[0]?.id || ''

  // stupid
  if (route.query.group as string) {
    selectionGroupId.value = route.query.group as string
  } else if (groups.value.length === 1) {
    selectionGroupId.value = groups.value[0]?.id
  }
}
const chooseNetwork = () => {
  // // 默认选择第一项
  // selectionNetwork.value = privateNetworks.value[0]?.id || publicNetworks.value[0]?.id || ''

  // 默认选择：'randomPrivate' 随机私网网段/ 'randomPublic' 随机公网网段/''
  if (privateNetworks.value.length > 0) {
    selectionNetworkId.value = 'randomPrivate'
  } else if (publicNetworks.value.length > 0) {
    selectionNetworkId.value = 'randomPublic'
  } else {
    selectionNetworkId.value = ''
  }
}
// selectionImageRelease 选择默认项
const chooseImageRelease = () => {
  selectionImageRelease.value = imageReleases.value[0]
}
const chooseImage = (serviceId: string, release: string) => {
  selectionImageId.value =
    images.value
      .filter(image => image.serviceId === serviceId)
      .filter(image => image.release === release)[0]?.id || ''
}
const chooseFlavor = (serviceId: string) => {
  selectionFlavorId.value = flavors.value.filter(flavor => flavor.service_id === serviceId)[0]?.id || ''
}
/* selection默认选择 */

/* 被动变化的watch */
// 改变service选择后，需要更新options选项池，并选择默认项的参数
watch(selectionServiceId, () => {
  if (selectionServiceId.value !== '') {
    updateNetwork(selectionServiceId.value)
    updateImages(selectionServiceId.value)
    updateFlavors(selectionServiceId.value)
  }
})
// 在selectionImageRelease变化后，选择默认image
watch(selectionImageRelease, () => {
  chooseImage(selectionServiceId.value, selectionImageRelease.value)
})
/* 被动变化的watch */

/* 获取全部选项的函数 */
// // 获取全部datacenter and services
// const updateDatacentersAndServices = async () => {
//   dataCenters.value = []
//   services.value = []
//
//   try {
//     // datacenter
//     const respGetDatacenters = await api.server.registry.getRegistry()
//
//     // 排序
//     respGetDatacenters.data.registries.sort((a: DataCenterInterface, b: DataCenterInterface) => a.sort_weight - b.sort_weight)
//
//     // 保存数据
//     for (const datacenter of respGetDatacenters.data.registries) {
//       // 只留下enable状态的datacenter
//       if (datacenter.status.code === 1) {
//         // services
//         let datacenterServices: string[] = []
//
//         // 从分页数据中获取全部数据
//         const PAGE_SIZE = 100 // 单次获取的page size
//         let count = 0 // 结果总数，多页项目的数总和
//         let page = 1 // current page
//
//         do {
//           const respGetServices = await api.server.service.getService({
//             query: {
//               page,
//               page_size: PAGE_SIZE,
//               center_id: datacenter.id
//             }
//           })
//
//           // 排序
//           respGetServices.data.results.sort((a: ServiceInterface, b: ServiceInterface) => a.sort_weight - b.sort_weight)
//
//           for (const service of respGetServices.data.results) {
//             services.value.push(service)
//             // 把当前service_id补充给datacenterServices
//             datacenterServices.push(service.id)
//           }
//
//           // 更新分页数据
//           page += 1
//           count = respGetServices.data.count
//         } while (datacenterServices.length < count)
//
//         datacenterServices = [...new Set(datacenterServices)]
//         Object.assign(datacenter, { services: datacenterServices })
//         dataCenters.value.push(datacenter)
//       }
//     }
//   } catch (exception) {
//     // exceptionNotifier(exception)
//   }
//
//   // 选择默认项
//   chooseService()
// }
//
// // 获取当前用户全部项目组信息
// const updateGroups = async () => {
//   // 清空列表
//   groups.value = []
//
//   // 从分页数据中获取全部数据
//   const PAGE_SIZE = 100 // 单次获取的page size
//   let count = 0 // 结果总数，多页项目的数总和
//   let page = 1 // current page
//
//   try {
//     // 先执行一次，再检查循环条件
//     do {
//       // 用当前分页条件获取数据
//       const respGetGroup = await api.server.vo.getVo({
//         query: {
//           page,
//           page_size: PAGE_SIZE
//         }
//       })
//
//       // 保存数据
//       for (const group of respGetGroup.data.results as GroupInterface[]) {
//         try {
//           // add balance field
//           const respGroupBalance = await api.server.account.getAccountBalanceVo({ path: { vo_id: group.id } })
//           Object.assign(group, { balance: respGroupBalance.data.balance })
//         } catch (exception) {
//           // exceptionNotifier(exception)
//           // 继续下一个循环
//           continue
//         }
//         // group options
//         groups.value.push(group)
//       }
//
//       // 更新分页数据
//       page += 1
//       count = respGetGroup.data.count
//     } while (groups.value!.length < count) // do体内执行完毕后，再检查循环条件，决定是否开始下次循环
//   } catch (exception) {
//     // exceptionNotifier(exception)
//   }
//
//   // 选择默认项
//   chooseGroup()
// }

// 根据当前service_id获取image列表的函数
const updateImages = async (serviceId: string) => {
  // 清空当前images列表
  images.value = []

  // 从分页数据中获取全部数据
  const PAGE_SIZE = 100 // 单次获取的page size
  let count = 0 // 结果总数，多页项目的数总和
  let page = 1 // current page

  try {
    // 先执行一次，再检查循环条件
    do {
      // 用当前分页条件获取数据
      const respGetImage = await api.server.image.getImagePaginate({
        query: {
          page,
          page_size: PAGE_SIZE,
          service_id: serviceId
        }
      })

      // 保存数据
      for (const image of respGetImage.data.results as ImageInterface[]) {
        // 增加serviceId标识,在读取images过程中，用户可能改变serviceId的选择，多个结果都会存入images容器，这个字段使用的时候方便筛选区分
        Object.assign(image, { serviceId })

        // image options
        images.value.push(image)
      }

      // 更新分页数据
      page += 1
      count = respGetImage.data.count
      // 核实容器内含有当前指定serviceId的image数量够不够，不够再去拿
    } while (images.value.filter(image => image.serviceId === serviceId).length < count) // do体内执行完毕后，再检查循环条件，决定是否开始下次循环
  } catch (exception) {
    // exceptionNotifier(exception)
  }

  // 选择默认项
  chooseImageRelease()
  chooseImage(selectionServiceId.value, selectionImageRelease.value)
}

// 根据当前service_id获取privateNetwork / publicNetwork列表的函数
const updateNetwork = async (serviceId: string) => {
  privateNetworks.value = []
  publicNetworks.value = []

  try {
    const respGetNetworks = await api.server.network.getNetwork({
      query: {
        service_id: serviceId
      }
    })
    for (const network of respGetNetworks.data) {
      // 增加serviceId标识
      Object.assign(network, { serviceId })

      // add to options
      if (network.public) {
        publicNetworks.value.push(network)
      } else {
        privateNetworks.value.push(network)
      }
    }
  } catch (exception) {
    // exceptionNotifier(exception)
  }
  chooseNetwork()
}

// 根据当前service_id获取flavor列表的函数
const updateFlavors = async (serviceId: string) => {
  // 清空当前flavor列表
  flavors.value = []
  // req
  try {
    const respGetFlavor = await api.server.flavor.getFlavor({
      query: {
        service_id: serviceId
      }
    })
    // 保存数据
    for (const flavor of respGetFlavor.data.flavors) {
      flavors.value.push(flavor)
    }
  } catch (exception) {
    // exceptionNotifier(exception)
  }
  // 排序
  flavors.value.sort((a: FlavorInterface, b: FlavorInterface) => a.vcpus - b.vcpus)

  // 选择默认项
  chooseFlavor(selectionServiceId.value)
}
/* 获取全部选项的函数 */

/* 非table获取数据，setup时调用一次 */
chooseOwner()
// updateDatacentersAndServices()
// updateGroups()
/* setup时调用一次 */

/* 从table获取的数据
   1. table已加载完毕时进入，选择默认项
   2. table未加载完毕时进入，要设置watcher，待加载完毕时选择默认项
   细分到每个table */

// 选择默认serviceId
if (store.tables.serviceTable.status === 'total') {
  // console.log('setup choose service')
  chooseService()
} else {
  watch(services, () => {
    if (store.tables.serviceTable.status !== 'loading') {
      // console.log('update table choose service')
      chooseService()
    }
  })
}

// 选择默认groupId
if (store.tables.groupTable.status === 'total') {
  chooseGroup()
} else {
  watch(groups, () => {
    if (store.tables.groupTable.status !== 'loading') {
      chooseGroup()
    }
  })
}

/* 新建云主机 */
const isDeploying = ref(false)
// check inputs
const checkInputs = () => {
  if (selectionPayment.value === 'prepaid' && (selectionPeriod.value <= 0 || selectionPeriod.value > MAX_MONTHS)) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('components.server.ServerDeployCard.prepaid_time_warning')}1-${MAX_MONTHS}${tc('components.server.ServerDeployCard.prepaid_time_months')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return false
  } else if (selectionOwner.value === 'group' && selectionGroupId.value === '') {
    // 如果要创建项目组云主机，但是没有选中组
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('toChooseGroup')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return false
  } else if (!selectionNetworkId.value) {
    // 如果selection没有选择全，则弹出通知
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('components.server.ServerDeployCard.select_network')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return false
  } else if (!selectionImageId.value) {
    // 如果selection没有选择全，则弹出通知
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('components.server.ServerDeployCard.select_os')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return false
  } else if (!selectionFlavorId.value) {
    // 如果selection没有选择全，则弹出通知
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('components.server.ServerDeployCard.select_configuration')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return false
  } else if (!inputRemarks.value) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('components.server.ServerDeployCard.fill_remarks')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    input.value?.focus()
    return false
  }
  return true
}
const deployServer = async () => {
  if (checkInputs()) {
    // 云主机的配置
    const selection = {
      pay_type: selectionPayment.value,
      ...(selectionPayment.value === 'prepaid' ? { period: selectionPeriod.value } : {}),
      ...(selectionOwner.value === 'group' ? { vo_id: selectionGroupId.value } : {}),
      service_id: selectionServiceId.value,
      image_id: selectionImageId.value,
      flavor_id: selectionFlavorId.value,
      network_id: selectionNetworkId.value,
      remarks: inputRemarks.value
    }

    // 如果需要随机选择网络，则改变网络选择值为随机id
    if (selection.network_id === 'randomPrivate') {
      selection.network_id = privateNetworks.value.filter(network => network.serviceId === selectionServiceId.value)[Math.floor(Math.random() * privateNetworks.value.length)].id
      // console.log('randomPrivate:', selection.network_id)
      // console.log(privateNetworks.value)
    } else if (selection.network_id === 'randomPublic') {
      selection.network_id = publicNetworks.value.filter(network => network.serviceId === selectionServiceId.value)[Math.floor(Math.random() * publicNetworks.value.length)].id
      // console.log('randomPublic:', selection.network_id)
      // console.log(publicNetworks.value)
    }

    try {
      isDeploying.value = true

      const respPostServer = await api.server.server.postServer({ body: selection })

      // 创建后处理方式分两种，预付费和后付费
      if (selectionPayment.value === 'prepaid') {
        // 包月预付
        // 更新订单table
        const orderId = respPostServer.data.order_id
        void await store.loadSingleOrder({
          isGroup: selectionOwner.value === 'group',
          orderId
        })
        // 跳转至订单list
        selectionOwner.value === 'group' ? navigateToUrl(`/my/server/group/order/detail/${orderId}`) : navigateToUrl(`/my/server/personal/order/detail/${orderId}`)
      } else if (selectionPayment.value === 'postpaid') {
        // 按量计费
        // 更新订单table
        const orderId = respPostServer.data.order_id
        void await store.loadSingleOrder({
          isGroup: selectionOwner.value === 'group',
          orderId
        })
        // 更新personal/group ServerTable,根据返回的serverId获取该server的全部信息，存入table
        const serverId = selectionOwner.value === 'group' ? store.tables.groupOrderTable.byId[orderId].resources[0].instance_id : store.tables.personalOrderTable.byId[orderId].resources[0].instance_id
        void await store.loadSingleServer({
          serverId,
          isGroup: selectionOwner.value === 'group'
        })
        // notify
        Notify.create({
          classes: 'notification-positive shadow-15',
          icon: 'check_circle',
          textColor: 'positive',
          message: `${tc('components.server.ServerDeployCard.server_create_success')}: ${selectionOwner.value === 'group' ? store.tables.groupServerTable.byId[serverId].ipv4 : store.tables.personalServerTable.byId[serverId].ipv4}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 15000,
          multiLine: false
        })
        // 跳转至server list
        selectionOwner.value === 'group' ? navigateToUrl('/my/server/group/list') : navigateToUrl('/my/server/personal/list')
      }

      // 改变按钮状态，不管响应结果如何，得到响应之后就恢复按钮状态
      isDeploying.value = false
    } catch (exception) {
      exceptionNotifier(exception)
      // 改变按钮状态，不管响应结果如何，得到响应之后就恢复按钮状态
      isDeploying.value = false
    }
  }
}
/* 新建云主机 */
</script>

<template>
  <div class="ServerDeployV3">
    <!--技巧：本页内需要一个局部的可伸缩的drawer，在大的layout内部套一个局部layout。layout本质上仍是一个component。-->
    <!--    <q-layout view="hHh Lpr lff">-->

    <!--      &lt;!&ndash;  style="background-color: rgba(0, 0, 0, 0.05) !important; backdrop-filter: blur(10px) !important;"    &ndash;&gt;-->
    <!--      <q-drawer-->
    <!--        style="background-color: rgba(0, 0, 0, 0.05); backdrop-filter: blur(10px);"-->
    <!--        v-model="isShow"-->
    <!--        side="right"-->
    <!--        show-if-above-->
    <!--        bordered-->
    <!--        :width="400"-->
    <!--        :breakpoint="500"-->
    <!--      >-->
    <!--        <q-scroll-area style="height: calc(100vh - 60px);">-->

    <!--          <q-page-sticky position="left">-->
    <!--            <q-btn-->
    <!--              v-if="isShow"-->
    <!--              color="grey"-->
    <!--              icon="keyboard_double_arrow_right"-->
    <!--              flat-->
    <!--              dense-->
    <!--              padding="none"-->
    <!--              size="30px"-->
    <!--              @click="isShow =! isShow">-->
    <!--            </q-btn>-->
    <!--          </q-page-sticky>-->

    <!--          <div class="column justify-center full-height q-pa-xl">-->
    <!--            <q-btn class="full-width"-->
    <!--                   dense-->
    <!--                   unelevated-->
    <!--                   color="primary"-->
    <!--                   :loading="isDeploying"-->
    <!--                   @click="deployServer">-->

    <!--              <div v-if="selectionPayment === 'prepaid'">-->
    <!--                {{ tc('placeOrder') }}-->
    <!--              </div>-->

    <!--              <div v-if="selectionPayment === 'postpaid'">-->
    <!--                {{ tc('deployServer') }}-->
    <!--              </div>-->

    <!--            </q-btn>-->
    <!--          </div>-->
    <!--        </q-scroll-area>-->
    <!--      </q-drawer>-->

    <!--      <q-page-container>-->
    <!--        <q-page>-->

    <!--          <q-scroll-area style="height: calc(100vh - 60px);">-->

    <!--            <q-page-sticky class="z-top" position="right">-->
    <!--              <q-btn v-if="!isShow"-->
    <!--                     color="grey"-->
    <!--                     icon="keyboard_double_arrow_left"-->
    <!--                     flat-->
    <!--                     dense-->
    <!--                     padding="none"-->
    <!--                     size="30px"-->
    <!--                     @click="isShow =! isShow">-->
    <!--              </q-btn>-->
    <!--            </q-page-sticky>-->

    <!--&lt;!&ndash;page content&ndash;&gt;-->

    <!--          </q-scroll-area>-->

    <!--        </q-page>-->
    <!--      </q-page-container>-->
    <!--    </q-layout>-->

    <!-- 以上为layout嵌套布局   -->

    <q-scroll-area style="height: calc(100vh - 60px);">

      <div class="row justify-center" style="padding-bottom: 130px;">
        <div class="content-fixed-width">

          <div class="row items-center q-py-sm">
            <q-btn class="col-auto" flat dense color="primary" icon="arrow_back_ios" size="lg" @click="router.back()"/>
            <div class="col-auto text-h6 text-primary ">
              {{ tc('serverNew') }}
            </div>
          </div>

          <div class="row items-center q-pt-md q-pb-xs">
            <div class="col-1 row">
              <div class="text-weight-bold">
                {{ tc('serverOwner') }}
              </div>
            </div>

            <div class="col-11 row items-center q-gutter-x-md q-gutter-y-xs">
              <q-btn
                :color="selectionOwner === 'personal' ? 'primary' : 'grey-3'"
                :text-color="selectionOwner === 'personal' ? '' : 'black'"
                unelevated
                dense
                no-caps
                :ripple="false"
                @click="selectionOwner = 'personal'"
              >
                {{ tc('personalAccount') }}
              </q-btn>

              <q-btn
                :color="selectionOwner === 'group' ? 'primary' : 'grey-3'"
                :text-color="selectionOwner === 'group' ? '' : 'black'"
                unelevated
                dense
                no-caps
                :ripple="false"
                @click="selectionOwner = 'group'"
              >
                {{ tc('groupAccount') }}
              </q-btn>
            </div>

          </div>

          <!--          <Transition>-->
          <div v-if="selectionOwner === 'group'"
               class="row items-center q-pb-md q-pt-xs">
            <div class="col-1 row ">
              <div class="text-weight-bold invisible">
                {{ tc('group') }}
              </div>
            </div>

            <div v-if="groups.length === 0" class="col-10 row items-center">
              {{ tc('noGroup') }}
            </div>

            <div v-else class="col-9 row items-center q-gutter-x-md q-gutter-y-xs" style="padding-left: 80px;">
              <q-btn
                :color="selectionGroupId === group.id ? 'primary' : 'grey-3'"
                :text-color="selectionGroupId === group.id ? '' : 'black'"
                v-for="group in groups"
                :val="group.id"
                :key="group.id"
                unelevated
                dense
                no-caps
                :ripple="false"
                @click="selectionGroupId = group.id"
              >
                {{ group.name }}
              </q-btn>
            </div>
          </div>
          <!--          </Transition>-->

          <div class="row items-start q-py-md">
            <div class="col-1 row">
              <div class="text-weight-bold">
                {{ tc('serviceUnit') }}
              </div>
            </div>

            <div class="col-11">
              <div v-for="dataCenter in dataCenters.filter(datacenter => datacenter.services.length > 0)"
                   :key="dataCenter.id"
                   class="q-pb-md">
                <div class="row items-center text-weight-bold text-subtitle2"
                     :class="compSelectionDatacenter?.id === dataCenter.id ? 'text-primary' : ''">
                  {{ i18n.global.locale === 'zh' ? dataCenter.name : dataCenter.name_en }}
                </div>

                <div v-if="dataCenter.services.length === 0" class="row items-center text-grey">
                  {{ tc('noServiceUnit') }}
                </div>

                <div v-else class="row items-center q-gutter-x-md q-gutter-y-xs">
                  <q-btn
                    :color="selectionServiceId === service?.id ? 'primary' : 'grey-3'"
                    :text-color="selectionServiceId === service?.id ? '' : 'black'"
                    v-for="service in dataCenter.services.map(serviceId => services.find(serviceObj => serviceObj?.id === serviceId)).filter(serviceObj => serviceObj.status === 'enable')"
                    :key="service?.id"
                    :val="service?.id"
                    unelevated
                    dense
                    no-caps
                    :ripple="false"
                    @click="selectionServiceId = service!.id"
                  >
                    <div class="row items-center">
                      <div class="col-auto row items-center">
                        <CloudPlatformLogo class="col-auto" logo-style="mark" width="15px" height="15px"
                                           :platform-name="service.service_type"/>
                      </div>
                      <div class="col-auto">
                        {{ i18n.global.locale === 'zh' ? service?.name : service?.name_en }}
                      </div>
                      <div v-if="currAccountCoupons.find(coupon => coupon?.app_service?.service_id === service?.id)"
                           class="col-auto text-green"
                           style="font-size: 12px; zoom: 0.8;">
                        {{ tc('有券') }}
                      </div>
                    </div>
                  </q-btn>
                </div>

              </div>
            </div>
          </div>

          <div class="row items-center q-pt-md q-pb-xs">
            <div class="col-1 text-weight-bold">
              {{ tc('paymentMethod') }}
            </div>
            <div class="col-auto row items-center q-gutter-x-md q-gutter-y-xs">
              <q-btn
                :color="selectionPayment === 'prepaid' ? 'primary' : 'grey-3'"
                :text-color="selectionPayment === 'prepaid' ? '' : 'black'"
                unelevated
                dense
                no-caps
                :ripple="false"
                @click="selectionPayment = 'prepaid'"
              >
                {{ tc('prepaid') }}
              </q-btn>

              <q-btn
                :disable="!isAllowPostpaid"
                :color="selectionPayment === 'postpaid' ? 'primary' : 'grey-3'"
                :text-color="selectionPayment === 'postpaid' ? '' : 'black'"
                unelevated
                dense
                no-caps
                :ripple="false"
                @click="selectionPayment = 'postpaid'"
              >
                {{ tc('postpaid') }}
              </q-btn>

            </div>
          </div>

          <!--          <Transition>-->
          <div v-if="selectionPayment === 'prepaid'" class="row items-center q-pb-md q-pt-xs">
            <div class="col-1 text-weight-bold invisible">
              {{ tc('usagePeriod') }}
            </div>
            <div class="col-11 row items-center q-gutter-x-md q-gutter-y-xs">
              <q-btn
                :color="selectionPeriod === month ? 'primary' : 'grey-3'"
                :text-color="selectionPeriod === month ? '' : 'black'"
                v-for="month in Array.from({length: MAX_MONTHS}, (item, index) => index + 1)"
                :val="month"
                :key="month"
                unelevated
                dense
                no-caps
                :ripple="false"
                @click="selectionPeriod = month"
              >
                <!--复数i18n-->
                {{ month }} {{ tc('countMonth', month) }}
              </q-btn>
            </div>
          </div>
          <!--          </Transition>-->

          <div class="row items-center q-py-md">
            <div class="col-1 text-weight-bold">
              {{ tc('operatingSystem') }}
            </div>

            <div class="col-11">
              <div v-if="images.filter(image => image.serviceId === selectionServiceId).length === 0"
                   class="row items-center">
                {{ tc('noOperatingSystem') }}
              </div>

              <div v-else class="row items-center full-height q-gutter-md">

                <q-select
                  class="col-auto"
                  style="min-width: 220px;"
                  v-model="selectionImageRelease"
                  :options="imageReleases"
                  outlined
                  dense
                >

                  <!--当前选项的内容插槽-->
                  <template v-slot:selected-item="scope">

                    <div class="row items-center"
                         :class="selectionImageRelease===scope.opt ? 'text-primary' : 'text-black'"
                    >
                      <OsLogo :os-name="scope.opt" size="sm"/>
                      {{ scope.opt }}
                    </div>

                  </template>

                  <!--待选项的内容插槽-->
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">

                      <div class="row items-center">
                        <OsLogo :os-name="scope.opt" size="sm"/>
                        <q-item-label>{{ scope.opt }}</q-item-label>
                      </div>

                      <!--                      <q-item-section avatar>-->
                      <!--                        <OsLogo :os-name="scope.opt" size="md"/>-->
                      <!--                      </q-item-section>-->

                      <!--                      <q-item-section>-->
                      <!--                        <q-item-label>{{ scope.opt }}</q-item-label>-->
                      <!--                      </q-item-section>-->

                    </q-item>
                  </template>

                </q-select>

                <q-select
                  class="col-auto"
                  style="min-width: 220px;"
                  v-model="selectionImageId"
                  :options="[...new Set(images.filter(image => image.serviceId === selectionServiceId).filter(image => image.release === selectionImageRelease).map(image => image.id))]"
                  outlined
                  dense
                >

                  <!--当前选项的内容插槽-->
                  <template v-slot:selected-item="scope">

                    <div class="row items-center"
                         :class="selectionImageId===scope.opt ? 'text-primary' : 'text-black'"
                    >
                      {{
                        `${images.filter(image => image.serviceId === selectionServiceId).find(image => image?.id === scope.opt)?.name}`
                      }}
                    </div>

                  </template>

                  <!--待选项的内容插槽-->
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">

                      <div class="row items-center">
                        {{
                          `${images.filter(image => image.serviceId === selectionServiceId).find(image => image?.id === scope.opt)?.name}`
                        }}
                      </div>

                    </q-item>
                  </template>

                </q-select>

              </div>
            </div>

          </div>

          <!--          <div class="col-auto q-py-lg">-->
          <!--            <div class="q-py-md text-h6">-->
          <!--              {{ tc('systemDiskSize') }}-->
          <!--            </div>-->
          <!--            <div class="row items-center q-gutter-lg">-->
          <!--              <q-btn-->
          <!--                :class="selectionSystemDisk === disk ? 'shadow-5' : 'bg-grey-1'"-->
          <!--                :color="selectionSystemDisk === disk ? 'primary' : 'grey-3'"-->
          <!--                v-for="disk in systemDisks"-->
          <!--                :val="disk"-->
          <!--                :key="disk"-->
          <!--                outline-->
          <!--                dense-->
          <!--                no-caps-->
          <!--                :ripple="false"-->
          <!--                @click="selectionSystemDisk = disk"-->
          <!--              >-->
          <!--                <div class="column items-center justify-center"-->
          <!--                     style="width: 124px;height: 30px;">-->

          <!--                  <div class="col-auto" :class="selectionSystemDisk === disk ? 'text-primary' : 'text-black'">-->
          <!--                    &lt;!&ndash;复数i18n&ndash;&gt;-->
          <!--                    {{ disk }} GB-->
          <!--                  </div>-->

          <!--                </div>-->
          <!--              </q-btn>-->
          <!--            </div>-->
          <!--          </div>-->

          <div class="row items-center q-py-md">
            <div class="col-1 row">
              <div class="text-weight-bold">
                {{ tc('network') }}
              </div>
            </div>

            <div class="col-11">

              <div v-if="publicNetworks.length === 0 && privateNetworks.length === 0" class="col row items-center">
                {{ tc('noNetwork') }}
              </div>

              <div v-if="privateNetworks.filter(network => network.serviceId === selectionServiceId).length > 0"
                   class="col q-pb-md">
                <div class="row text-weight-bold"
                     :class="selectionNetworkId === 'randomPrivate' || !compSelectionNetwork?.public ? 'text-primary' : 'text-grey'">
                  {{ tc('privateNetwork') }}
                </div>
                <div class="row items-center q-gutter-x-md q-gutter-y-xs">

                  <!--按钮：随机选择私网网络-->
                  <q-btn
                    :color="selectionNetworkId === 'randomPrivate' ? 'primary' : 'grey-3'"
                    :text-color="selectionNetworkId === 'randomPrivate' ? '' : 'black'"
                    unelevated
                    dense
                    no-caps
                    :ripple="false"
                    @click="selectionNetworkId = 'randomPrivate'"
                  >
                    {{ tc('randomPrivateNetwork') }}
                  </q-btn>

                  <q-btn
                    v-for="network in privateNetworks.filter(item => item.serviceId === selectionServiceId)"
                    :val="network.id"
                    :key="network.id"
                    :color="selectionNetworkId === network.id ? 'primary' : 'grey-3'"
                    :text-color="selectionNetworkId === network.id ? '' : 'black'"
                    unelevated
                    dense
                    no-caps
                    :ripple="false"
                    @click="selectionNetworkId = network.id"
                  >
                    <div class="column"
                         style="line-height: 0.9;">
                      <div class="col-auto">
                        {{ network.name }}
                      </div>
                      <div class="col-auto">
                        {{ network.segment }}
                      </div>
                    </div>
                  </q-btn>

                </div>
              </div>

              <div v-if="publicNetworks.filter(network => network.serviceId === selectionServiceId).length > 0"
                   class="col q-pb-md ">
                <div class="row text-weight-bold"
                     :class="selectionNetworkId === 'randomPublic' || compSelectionNetwork?.public ? 'text-primary' : 'text-grey'">
                  {{ tc('publicNetwork') }}
                </div>
                <div class="row items-center q-gutter-x-md q-gutter-y-xs">

                  <!--按钮：随机选择公网网络-->
                  <q-btn
                    :color="selectionNetworkId === 'randomPublic' ? 'primary' : 'grey-3'"
                    :text-color="selectionNetworkId === 'randomPublic' ? '' : 'black'"
                    unelevated
                    dense
                    no-caps
                    :ripple="false"
                    @click="selectionNetworkId = 'randomPublic'"
                  >
                    {{ tc('randomPublicNetwork') }}
                  </q-btn>

                  <q-btn
                    v-for="network in publicNetworks.filter(item => item.serviceId === selectionServiceId)"
                    :val="network.id"
                    :key="network.id"
                    :color="selectionNetworkId === network.id ? 'primary' : 'grey-3'"
                    :text-color="selectionNetworkId === network.id ? '' : 'black'"
                    unelevated
                    dense
                    no-caps
                    :ripple="false"
                    @click="selectionNetworkId = network.id"
                  >
                    <div class="column"
                         style="line-height: 0.9;">
                      <div class="col-auto">
                        {{ network.name }}
                      </div>
                      <div class="col-auto">
                        {{ network.segment }}
                      </div>
                    </div>
                  </q-btn>
                </div>
              </div>

            </div>
          </div>

          <div class="row items-center q-py-md">
            <div class="col-1 row items-center">
              <div class="text-weight-bold">
                {{ tc('serverSize') }}
              </div>
            </div>

            <div class="col-11 row">
              <div v-if="flavors.filter(flavor => flavor.service_id === selectionServiceId).length === 0"
                   class="col-auto row items-center">
                {{ tc('noServerSize') }}
              </div>

              <div v-else class="col-auto row items-center q-gutter-x-md q-gutter-y-xs">
                <q-btn
                  v-for="flavor in flavors.filter(item => item.service_id === selectionServiceId)"
                  :val="flavor.id"
                  :key="flavor.id"
                  :color="selectionFlavorId === flavor.id ? 'primary' : 'grey-3'"
                  :text-color="selectionFlavorId === flavor.id ? '' : 'black'"
                  unelevated
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionFlavorId = flavor.id"
                >
                  {{ `${flavor.vcpus} ${tc('countCore', flavor.vcpus)} / ${flavor.ram} GB` }}
                </q-btn>
              </div>
            </div>

          </div>

          <div class="row items-center q-py-md">
            <div class="col-1 row">
              <div class="text-weight-bold">
                {{ tc('remark') }}
              </div>
            </div>
            <div class="col-11 row q-pt-md">
              <q-input class="col-8"
                       ref="input"
                       v-model="inputRemarks"
                       maxlength="100"
                       dense
                       clearable
                       clear-icon="close"
                       outlined
                       counter/>
            </div>
          </div>

          <!--          <div class="row items-center q-py-md">-->
          <!--            <div class="col-1 row">-->
          <!--              <div class="text-weight-bold">-->
          <!--                test area-->
          <!--              </div>-->
          <!--            </div>-->
          <!--            <div class="col-11 row q-pt-md">-->
          <!--                       <pre>-->
          <!--                          {{ images }}-->
          <!--                       </pre>-->
          <!--            </div>-->
          <!--          </div>-->

        </div>
      </div>

    </q-scroll-area>

    <q-page-sticky expand position="bottom">
      <div class="column items-center justify-center full-width shadow-up-5 q-pt-xs"
           style="background-color: rgba(0, 0, 0, 0.05); backdrop-filter: blur(10px);"
      >
        <div class="col-auto row items-center justify-between no-wrap content-fixed-width" style="line-height: 1;">

          <div class="col-3 full-height">

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">

                <div class="col-auto ">
                  {{ tc('serverOwner') }}
                </div>

                <div v-if="selectionOwner === 'personal'"
                     class="col-auto text-primary">
                  {{ tc('personalAccount') }}
                </div>

                <div v-if="selectionOwner === 'group'"
                     class="col-auto"
                     :class="compSelectionGroup?.name ? 'text-primary' : 'text-red'">
                  <div class="row items-center">
                    <div class="col-auto">
                      {{ tc('group') }}:
                    </div>
                    <div class="col-auto">
                      {{ compSelectionGroup?.name || tc('toChooseGroup') }}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">
                <div class="col-auto">
                  {{ tc('serviceUnit') }}
                </div>
                <div
                  v-if="compSelectionDatacenter && compSelectionService"
                  class="col-auto text-primary">
                  <div v-if="i18n.global.locale === 'zh'">
                    <div>{{ compSelectionService?.name }}</div>
                    <div>{{ compSelectionDatacenter?.name }}</div>
                  </div>
                  <div v-else>
                    <div>{{ compSelectionService?.name_en }}</div>
                    <div>{{ compSelectionDatacenter?.name_en }}</div>
                  </div>
                </div>
                <CloudPlatformLogo class="col-auto"
                                   :platform-name="compSelectionService?.service_type"/>

              </div>
            </div>

          </div>

          <div class="col-3">

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">
                <div class="col-auto">
                  {{ tc('operatingSystem') }}
                </div>
                <div class="col-auto text-primary">
                  <div class="row items-center"
                       v-if="selectionImageRelease">
                    <OsLogo
                      class="col-auto"
                      :os-name="selectionImageRelease"
                      size="sm"
                    />
                    <div class="col-auto">
                      {{ compSelectionImage?.name }}
                    </div>
                  </div>
                  <div v-else class="text-red">
                    {{ tc('selectOperatingSystem') }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">
                <div class="col-auto">
                  {{ tc('network') }}
                </div>

                <div
                  v-if="selectionNetworkId.includes('random')"
                  class="col-auto text-primary"
                >
                  <div v-if="selectionNetworkId === 'randomPrivate'">
                    {{ tc('randomPrivateNetwork') }}
                  </div>
                  <div v-if="selectionNetworkId === 'randomPublic'">
                    {{ tc('randomPublicNetwork') }}
                  </div>
                </div>
                <div
                  v-else-if="compSelectionNetwork?.name"
                  class="col-auto text-primary"
                >
                  {{ compSelectionNetwork?.public ? tc('publicNetwork') : tc('privateNetwork') }}:
                  {{ compSelectionNetwork?.segment }}
                </div>
                <div v-else class="text-red">
                  {{ tc('selectNetwork') }}
                </div>

              </div>
            </div>

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">
                <div class="col-auto">
                  {{ tc('serverSize') }}
                </div>

                <div v-if="compSelectionFlavor"
                     class="col-auto text-primary ">
                  {{
                    `${compSelectionFlavor?.vcpus} ${tc('countCore', compSelectionFlavor?.vcpus)} / ${compSelectionFlavor?.ram} GB`
                  }}
                </div>
                <div v-else class="text-red">
                  {{ tc('selectServerSize') }}
                </div>

              </div>
            </div>

          </div>

          <div class="col-3">

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">
                <div class="col-auto">
                  {{ tc('remark') }}
                </div>

                <div v-if="inputRemarks" class="col-auto text-primary wrap"
                     style="word-break: break-all; word-wrap: break-word; white-space: normal;">
                  {{ inputRemarks }}
                </div>
                <div v-else class="text-red">
                  {{ tc('inputRemark') }}
                </div>

              </div>
            </div>

          </div>

          <div class="col-3">
            <div class="row items-center justify-center text-primary" style="line-height: 1;">
              <div class="col-auto text-subtitle1 text-weight-bold">
                {{
                  selectionPayment === 'prepaid' ? tc('prepaid') : tc('postpaid')
                }}
              </div>
            </div>

            <div class="row items-center justify-center text-primary text-subtitle1 text-weight-bold"
                 style="line-height: 1;">
              <div v-if="selectionPayment === 'prepaid'" class="col-auto">
                {{ selectionPeriod }} {{ tc('countMonth', selectionPeriod) }}
              </div>
            </div>

            <div v-if="selectionPayment === 'prepaid' && currentPrice !== null" class="row items-start justify-between"
                 style="line-height: 1;">
              <div class="col-auto column" style="line-height: 1;">
                <div class="col-auto text-caption" style="line-height: 1;">
                  {{ tc('discountPrice') }}
                </div>
                <div class="col-auto text-primary text-subtitle1 text-weight-bold" style="line-height: 1;">
                  {{ currentPrice?.trade }} {{ tc('points', Number(currentPrice?.trade)) }}
                </div>
              </div>

              <div class="col-auto column" style="line-height: 1;">
                <div class="col-auto text-caption" style="line-height: 1;">
                  {{ tc('originalPrice') }}
                </div>
                <div class="col-auto text-subtitle1 text-weight-regular text-strike" style="line-height: 1;">
                  {{ currentPrice?.original }} {{ tc('points', Number(currentPrice?.original)) }}
                </div>
              </div>

            </div>
            <q-btn class="full-width"
                   dense
                   unelevated
                   color="primary"
                   :loading="isDeploying"
                   @click="deployServer">

              <div v-if="selectionPayment === 'prepaid'">
                {{ tc('placeOrder') }}
              </div>

              <div v-if="selectionPayment === 'postpaid'">
                {{ tc('deployServer') }}
              </div>

            </q-btn>
          </div>
        </div>
      </div>
    </q-page-sticky>

  </div>
</template>

<style lang="scss" scoped>

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
