<script setup lang="ts">
import { ref, computed, watch/* , PropType */ } from 'vue'
import { ImageInterface, useStore } from 'stores/store'
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

// summary折叠
const isShow = ref(true)

// // system disk 限制，单位GiB
// // 接口限定最大500GiB
// const MAX_SYSTEM_DISK = 500
// // 根据所选image限定最小值, 创建接口要求为50倍数。该字段由服务管理员填写，可能填错，因此需提高健壮性，此处取成最小的50倍数。
// const MIN_SYSTEM_DISK = computed(() => Math.ceil(store.tables.serviceImageTable.byLocalId[`${selectionService.value}-${selectionImage.value}`]?.min_sys_disk_gb / 50 || 1) * 50)

// 是否禁止使用后付费模式
// 目前判断个人账户或者项目组账户余额<=0
const isAllowPostpaid = computed(() => {
  // 联邦管理员、服务单元管理员不限制
  if (store.items.fedRole === 'federal-admin' || store.items.adminServiceIds.length > 0) {
    return true
  }

  // 普通用户进行判断
  if (selectionOwner.value === 'group') {
    return Number(store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[selectionGroup.value]?.balance]?.balance) > 0
  } else {
    return Number(store.items?.personalBalance) > 0
  }
})

// dom元素
const input = ref<HTMLElement>()

// 选项数据
// // 全局数据
// owner/leader权限才能建立云主机， member不能建立
const groups = computed(() => store.getGroupsByMyRole(['owner', 'leader']))
const dataCenters = computed(() => Object.values(store.tables.dataCenterTable.byId).filter(dataCenter => dataCenter.status.code === 1))
const services = computed(() => Object.values(store.tables.serviceTable.byId).filter(service => service.status === 'enable'))
const flavors = computed(() => Object.values(store.tables.fedFlavorTable.byId))
// selectionService的选项数据根据dataCenters动态生成,此处没有
// //依赖selectionService Id选择值的数据
const publicNetworks = computed(() => store.getPublicNetworksByServiceId(selectionService.value))
const privateNetworks = computed(() => store.getPrivateNetworksByServicedId(selectionService.value))

// ROD-refactored
// const images = computed(() => store.getImagesByServiceId(selectionService.value))
// 当前service_id对应的image集合，随service_id选择而改变
const images = ref<ImageInterface[]>([])
// 当前images里面可供选择的release数组
const imageReleases = ref<string[]>([])

// 根据当前service_id获取image列表的函数
const updateImages = async () => {
  // 清空当前images列表
  images.value = []
  imageReleases.value = []

  // 从分页数据中获取全部数据
  const PAGE_SIZE = 2 // 单次获取的page size
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
          service_id: selectionService.value
        }
      })

      // 保存数据
      for (const image of respGetImage.data.results as ImageInterface[]) {
        // image options
        images.value.push(image)

        // image release options
        // const release = image.release.toLowerCase().split(' ').map(word => word[0].toLowerCase() + word.slice(1)).join(' ')
        if (!imageReleases.value.includes(image.release)) {
          imageReleases.value.push(image.release)
        }
      }

      // 更新分页数据
      page += 1
      count = respGetImage.data.count
    } while (images.value!.length < count) // do体内执行完毕后，再检查循环条件，决定是否开始下次循环

    // imageRelease 排序 todo
  } catch (exception) {
    // exceptionNotifier(exception)
  }
}
updateImages()

// const systemDisks = computed(() => Array.from({ length: (MAX_SYSTEM_DISK - MIN_SYSTEM_DISK.value) / 50 + 1 }, (item, index) => MIN_SYSTEM_DISK.value + index * 50))

// selection选项 初始状态 (1)
const selectionOwner = ref<'personal' | 'group'>('personal')
const selectionPayment = ref<'prepaid' | 'postpaid'>('prepaid')
const selectionGroup = ref('')
const selectionPeriod = ref(1)
const selectionService = ref('')
const selectionDatacenter = computed(() => store.tables.serviceTable.byId[selectionService.value]?.data_center || '')

// image的id，来自images, 是local id, 不是拼接的id
const selectionImage = ref('')
// image的发行版, 不是image的最终选择，只用来筛选image第二个selection的显示选项
const selectionImageRelease = ref('')

const selectionFlavor = ref('')
const selectionNetwork = ref<'randomPrivate' | 'randomPublic' | string>('')
const inputRemarks = ref('')

// // 待实现
// const selectionSystemDisk = ref(50)
// const selectionDataDisk = ref(0)

// 询价对象
const currentPrice = ref<{ original: string; trade: string } | null>(null)
// 根据selection进行询价
watch([selectionPayment, selectionPeriod, selectionFlavor, selectionNetwork], async () => {
  // prepaid时才询价，其他几个参数都不为空时才询价（其中period初始值为1, 肯定不为空）
  // 初始化过程中有些table未load，此时不该询价。都有有效选择后，则可以询价。
  if (selectionPayment.value === 'prepaid' && selectionFlavor.value !== '' && selectionNetwork.value !== '') {
    try {
      // 发出询价请求
      const respGetPrice = await api.server['describe-price'].getDescribePrice({
        query: {
          resource_type: 'vm',
          pay_type: selectionPayment.value,
          period: selectionPeriod.value,
          flavor_id: selectionFlavor.value,
          external_ip: store.tables.serviceNetworkTable.byLocalId[`${selectionService.value}-${selectionNetwork.value}`]?.public
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

/* table 进入页面过程中选择默认项 */

/* 分为显示和选择动作两部分。
* 显示部分在标签里进行逻辑判断，哪些显示，哪些不显示
* 选择动作在ts部分，selection真正选择了哪些值 */

// selection默认选择 (2)
const chooseOwner = () => {
  selectionOwner.value = route.query.group || route.query.isgroup ? 'group' : 'personal' // query传递groupId的话则选择为项目组使用
}
const chooseGroup = () => {
  selectionGroup.value = route.query.group as string || groups.value[0]?.id || ''
}
const chooseService = () => {
  selectionService.value = route.query.service as string || services.value[0]?.id || ''
}
const chooseNetwork = () => {
  // // 默认选择第一项
  // selectionNetwork.value = privateNetworks.value[0]?.id || publicNetworks.value[0]?.id || ''

  // 默认选择：'randomPrivate' 随机私网网段/ 'randomPublic' 随机公网网段/''
  if (privateNetworks.value.length > 0) {
    selectionNetwork.value = 'randomPrivate'
  } else if (publicNetworks.value.length > 0) {
    selectionNetwork.value = 'randomPublic'
  } else {
    selectionNetwork.value = ''
  }
}
const chooseImage = async () => {
  // 选择默认项
  selectionImage.value = images.value[0]?.id || ''
}
const chooseFlavor = () => {
  selectionFlavor.value = flavors.value[0]?.id || ''
}

// setup时调用一次 (3) table已加载时，从别的页面进入本页面要选一次默认值
chooseOwner()
chooseGroup()
chooseService()
chooseNetwork()
// chooseImage()
chooseFlavor()
/* table 进入页面过程中选择默认项 */

// (4)刷新页面，table未加载时进入页面，根据table的加载状态变化一次都要选一次默认值。细分到每个table。
// watch关注的应该是响应式对象，而非某个table。
// 若关注table写法应为watch(()=> store.tables.xxxTable, action) https://github.com/vuejs/pinia/discussions/1218
// watch([store.tables, store.tables.groupTable, store.tables.groupMemberTable], chooseSelectionDefaults)
// 选择groupId
watch(groups, chooseGroup)
// 选择serviceId
watch(services, chooseService)
// 根据当前选中的serviceId，选择networkId
watch([privateNetworks, publicNetworks], chooseNetwork)
// 根据当前选中的serviceId，选择imageId
watch(images, chooseImage)
// 选择flavorId
watch(flavors, chooseFlavor)

/* (5) 在table都加载后，3个selection，随着service变化选择默认项 */
watch(selectionService, () => {
  // 重要逻辑： 改变service选择后，需要更新options选项池，并选择默认项的参数
  chooseNetwork()
  updateImages()
  // chooseImage()
})
/* 在table都加载后，3个selection，随着service变化选择默认项 */

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
  } else if (selectionOwner.value === 'group' && selectionGroup.value === '') {
    // 如果要创建项目组云主机，但是没有选中组
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('noGroup')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return false
  } else if (!selectionNetwork.value) {
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
  } else if (!selectionImage.value) {
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
  } else if (!selectionFlavor.value) {
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
      ...(selectionOwner.value === 'group' ? { vo_id: selectionGroup.value } : {}),
      service_id: selectionService.value,
      image_id: selectionImage.value,
      flavor_id: selectionFlavor.value,
      network_id: selectionNetwork.value,
      remarks: inputRemarks.value
    }

    // 如果需要随机选择网络，则改变网络选择值为随机id
    if (selection.network_id === 'randomPrivate') {
      selection.network_id = privateNetworks.value[Math.floor(Math.random() * privateNetworks.value.length)].id
      // console.log('randomPrivate:', selection.network_id)
      // console.log(privateNetworks.value)
    } else if (selection.network_id === 'randomPublic') {
      selection.network_id = publicNetworks.value[Math.floor(Math.random() * publicNetworks.value.length)].id
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
        <div class="content-fixed-width column">

          <div class="col-auto q-py-sm row items-center">
            <q-btn class="col-auto" flat dense color="primary" icon="arrow_back_ios" size="lg" @click="router.back()"/>
            <div class="col-auto text-h6 text-primary ">
              {{ tc('serverNew') }}
            </div>
          </div>

          <div class="col-auto row">
            <div class="col-1 text-weight-bold">
              {{ tc('serviceUnit') }}
            </div>

            <div class="col-auto">
              <div v-for="dataCenter in dataCenters" :key="dataCenter.id" class="q-pb-md">
                <div class="row items-center text-weight-bold text-subtitle2"
                     :class="selectionDatacenter === dataCenter.id ? 'text-primary' : ''">
                  {{ i18n.global.locale === 'zh' ? dataCenter.name : dataCenter.name_en }}
                </div>

                <div v-if="dataCenter.services.length === 0" class="row items-center text-grey">
                  {{ tc('noServiceUnit') }}
                </div>

                <div v-else class="row items-center q-gutter-md">
                  <q-btn
                    :color="selectionService === service.id ? 'primary' : 'grey-3'"
                    :text-color="selectionService === service.id ? '' : 'black'"
                    v-for="service in dataCenter.services.map(id => store.tables.serviceTable.byId[id]).filter(service => service.status === 'enable')"
                    :key="service.id"
                    :val="service.id"
                    unelevated
                    dense
                    no-caps
                    :ripple="false"
                    @click="selectionService = service.id"
                  >
                    {{ i18n.global.locale === 'zh' ? service.name : service.name_en }}
                  </q-btn>
                </div>

              </div>
            </div>
          </div>

          <div class="col-shrink row items-center">
            <div class="col-1 text-weight-bold">
              {{ tc('serverOwner') }}
            </div>

            <div class="col row items-center q-gutter-md">

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

          <Transition>
            <div v-if="selectionOwner === 'group'" class="col-auto row items-center">
              <div class="col-1 text-weight-bold">
                {{ tc('group') }}
              </div>

              <div v-if="groups.length === 0" class="col-auto row items-center">
                {{ tc('noGroup') }}
              </div>

              <div class="col-auto row items-center q-gutter-md">

                <q-btn
                  :color="selectionGroup === group.id ? 'primary' : 'grey-3'"
                  :text-color="selectionGroup === group.id ? '' : 'black'"
                  v-for="group in groups"
                  :val="group.id"
                  :key="group.id"
                  unelevated
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionGroup = group.id"
                >
                  {{ group.name }}

                </q-btn>
              </div>
            </div>
          </Transition>

          <div class="col-auto row items-center">
            <div class="col-1 text-weight-bold">
              {{ tc('paymentMethod') }}
            </div>
            <div class="col-auto row items-center q-gutter-md">
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

          <Transition>
            <div v-if="selectionPayment === 'prepaid'" class="col-auto row items-center">
              <div class="col-1 text-weight-bold">
                {{ tc('usagePeriod') }}
              </div>
              <div class="col-auto row items-center q-gutter-md">
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
          </Transition>

          <div class="col-auto row items-center">
            <div class="col-1 text-weight-bold">
              {{ tc('operatingSystem') }}
            </div>

            <div class="col-11">
              <div v-if="images.length === 0" class="row items-center">
                {{ tc('noOperatingSystem') }}
              </div>

              <div v-else class="row items-center q-gutter-md">

                <q-select
                  class="col-2"
                  v-model="selectionImageRelease"
                  :options="imageReleases"
                  outlined
                  dense
                  :label="tc('发行版')"
                >

                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">

                      <q-item-section thumbnail>
                        <OsLogo class="" :os-name="scope.opt" size="30px"/>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label>{{ scope.opt }}</q-item-label>
                      </q-item-section>

                    </q-item>
                  </template>

                </q-select>

                <q-select
                  class="col-2"
                  v-model="selectionImage"
                  :options="[...new Set(images.filter(image => image.release === selectionImageRelease).map(image => image.id))]"
                  outlined
                  dense
                  :label="tc('发行版')"
                />

                <!--                <q-btn-->
                <!--                  v-for="image in images"-->
                <!--                  :val="image.id"-->
                <!--                  :key="image.id"-->
                <!--                  :color="selectionImage === image.id ? 'primary' : 'grey-3'"-->
                <!--                  :text-color="selectionImage === image.id ? '' : 'black'"-->
                <!--                  unelevated-->
                <!--                  dense-->
                <!--                  no-caps-->
                <!--                  :ripple="false"-->
                <!--                  @click="selectionImage = image.id"-->
                <!--                >-->

                <!--                  <div class="row items-center" style="width: 287px; height: 60px;">-->

                <!--                    <OsLogo class="col-3" :os-name="image.name" size="60px"/>-->

                <!--                    <div class="col-9 column items-center justify-center">-->
                <!--                      <div class="col row items-center justify-center"-->
                <!--                           :class="selectionImage === image.id ? 'text-primary' : 'text-grey'"-->
                <!--                           style="line-height: 1;"-->
                <!--                      >-->
                <!--                        {{ image.name.slice(0, 80) }}-->
                <!--                      </div>-->
                <!--                    </div>-->

                <!--                  </div>-->

                <!--                </q-btn>-->
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

          <div class="col-auto row">
            <div class="col-1 text-weight-bold">
              {{ tc('network') }}
            </div>

            <div v-if="publicNetworks.length === 0 && privateNetworks.length === 0" class="row items-center">
              {{ tc('noNetwork') }}
            </div>

            <div v-if="privateNetworks.length > 0" class="q-pb-xs">
              <div class="row"
                   :class="store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.public ? 'text-grey' : 'text-primary'">
                {{ tc('privateNetwork') }}
              </div>
              <div class="row items-center q-gutter-md">

                <!--按钮：随机选择私网网络-->
                <q-btn
                  :color="selectionNetwork === 'randomPrivate' ? 'primary' : 'grey-3'"
                  :text-color="selectionNetwork === 'randomPrivate' ? '' : 'black'"
                  unelevated
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionNetwork = 'randomPrivate'"
                >
                  {{ tc('randomPrivateNetwork') }}
                </q-btn>

                <q-btn
                  v-for="network in privateNetworks"
                  :val="network.id"
                  :key="network.id"
                  :color="selectionNetwork === network.id ? 'primary' : 'grey-3'"
                  :text-color="selectionNetwork === network.id ? '' : 'black'"
                  unelevated
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionNetwork = network.id"
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

            <div v-if="publicNetworks.length > 0" class="q-pb-xs">
              <div class="row"
                   :class="store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.public ? 'text-primary' : 'text-grey'">
                {{ tc('publicNetwork') }}
              </div>
              <div class="row items-center q-gutter-md">

                <!--按钮：随机选择公网网络-->
                <q-btn
                  :color="selectionNetwork === 'randomPublic' ? 'primary' : 'grey-3'"
                  :text-color="selectionNetwork === 'randomPublic' ? '' : 'black'"
                  unelevated
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionNetwork = 'randomPublic'"
                >
                  {{ tc('randomPublicNetwork') }}
                </q-btn>

                <q-btn
                  v-for="network in publicNetworks"
                  :val="network.id"
                  :key="network.id"
                  :color="selectionNetwork === network.id ? 'primary' : 'grey-3'"
                  :text-color="selectionNetwork === network.id ? '' : 'black'"
                  unelevated
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionNetwork = network.id"
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

          <div class="col-auto row">
            <div class="col-1 text-weight-bold">
              {{ tc('serverSize') }}
            </div>

            <div class="col-11 row">
              <div v-if="flavors.length === 0" class="row items-center">
                {{ tc('noServerSize') }}
              </div>

              <div v-else class="col-auto row q-gutter-md">
                <q-btn
                  v-for="flavor in flavors"
                  :val="flavor.id"
                  :key="flavor.id"
                  :color="selectionFlavor === flavor.id ? 'primary' : 'grey-3'"
                  :text-color="selectionFlavor === flavor.id ? '' : 'black'"
                  unelevated
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionFlavor = flavor.id"
                >
                  {{ `${flavor.vcpus} ${tc('countCore', flavor.vcpus)} / ${flavor.ram / 1024} GB` }}
                </q-btn>
              </div>
            </div>

          </div>

          <div class="col-auto row">
            <div class="col-1 text-weight-bold">
              {{ tc('remark') }}
            </div>
            <div class="col-11 row">
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
                     :class="store.tables.groupTable.byId[selectionGroup]?.name ? 'text-primary' : 'text-red'">
                  {{ store.tables.groupTable.byId[selectionGroup]?.name || tc('noGroup') }}
                </div>

              </div>
            </div>

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">
                <div class="col-auto">
                  {{ tc('serviceUnit') }}
                </div>
                <div
                  v-if="store.tables.dataCenterTable.byId[selectionDatacenter] && store.tables.serviceTable.byId[selectionService]"
                  class="col-auto text-primary">
                  <div v-if="i18n.global.locale === 'zh'">
                    <div>{{ store.tables.serviceTable.byId[selectionService]?.name }}</div>
                    <div>{{ store.tables.dataCenterTable.byId[selectionDatacenter]?.name }}</div>
                  </div>
                  <div v-else>
                    <div>{{ store.tables.serviceTable.byId[selectionService]?.name_en }}</div>
                    <div>{{ store.tables.dataCenterTable.byId[selectionDatacenter]?.name_en }}</div>
                  </div>
                </div>
                <CloudPlatformLogo class="col-auto"
                                   :platform-name="store.tables.serviceTable.byId[selectionService]?.service_type"/>

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
                  <div v-if="store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name">
                    <OsLogo
                      :os-name="store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name"
                      size="sm"
                    />
                    {{ store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name }}
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
                  v-if="selectionNetwork.includes('random')"
                  class="col-auto text-primary"
                >
                  <div v-if="selectionNetwork === 'randomPrivate'">
                    {{ tc('randomPrivateNetwork') }}
                  </div>
                  <div v-if="selectionNetwork === 'randomPublic'">
                    {{ tc('randomPublicNetwork') }}
                  </div>
                </div>
                <div
                  v-else-if="store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.name"
                  class="col-auto text-primary"
                >
                  {{
                    store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.public ? tc('publicNetwork') : tc('privateNetwork')
                  }}: {{
                    store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.segment
                  }}
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

                <div v-if="store.tables.fedFlavorTable.byId[selectionFlavor]"
                     class="col-auto text-primary ">
                  {{
                    `${store.tables.fedFlavorTable.byId[selectionFlavor].vcpus} ${tc('countCore', store.tables.fedFlavorTable.byId[selectionFlavor].vcpus)} / ${store.tables.fedFlavorTable.byId[selectionFlavor].ram / 1024} GB`
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
                <!--                {{ selectionPeriod }} {{ tc('countMonth', store.tables.fedFlavorTable.byId[selectionPeriod]?.vcpus) }}-->
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
