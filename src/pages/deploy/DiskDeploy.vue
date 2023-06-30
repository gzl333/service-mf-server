<script setup lang="ts">
import { ref, computed, watch /* , PropType */ } from 'vue'
import { PeriodInterface, useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import { Notify, QInput /* scroll */ } from 'quasar'
import { navigateToUrl } from 'single-spa'
import { i18n } from 'boot/i18n'
import api from 'src/api'

// @ts-expect-error
// import { useStoreMain } from '@cnic/main'

import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'

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

// const { getScrollTarget, getVerticalScrollPosition } = scroll
// const target = getScrollTarget(window)
// const scrollPosition = ref(0)
// const onScroll = getVerticalScrollPosition()

const exceptionNotifier = useExceptionNotifier()

// deploy时需要项目组相关数据，应加载group的基础table(groupTable & groupMemberTable)
store.loadDeployTables()

// await store.loadPersonalCouponTable()
// for (const groupId of store.tables.groupTable.allIds) {
//   store.loadGroupCouponTable({ groupId })
// }

// summary折叠
const isShow = ref(true)

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

// 预付费时长, 随serviceId选择而变化
const periods = ref<PeriodInterface[]>([])

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

// disk size, GiB
const MIN_SIZE = 100
const MAX_SIZE = 10240
const inputSize = ref(100)

const inputRemarks = ref('')

// // 待实现
// const selectionSystemDisk = ref(50)
// const selectionDataDisk = ref(0)

/* selection */

/* 询价 */
// 询价对象
const currentPrice = ref<{ original: string; trade: string } | null>(null)
// 询价函数
const getPrice = async () => {
  // prepaid时才询价，其他几个参数都不为空时才询价（其中period初始值为1, 肯定不为空）
  // 初始化过程中有些table未load，此时不该询价。都有有效选择后，则可以询价。
  if (selectionPayment.value === 'prepaid') {
    try {
      // 发出询价请求
      const respGetPrice = await api.server['describe-price'].getDescribePrice({
        query: {
          resource_type: 'disk',
          pay_type: selectionPayment.value,
          period: selectionPeriod.value,
          data_disk_size: inputSize.value
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
}
// setup时询价一次
getPrice()
// 根据selection进行询价
watch([selectionPayment, selectionPeriod, inputSize], getPrice)
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
const choosePeriod = () => {
  selectionPeriod.value = periods.value[0].period || 1
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

/* selection默认选择 */

/* 被动变化的watch */
// 改变service选择后，需要更新options选项池，并选择默认项的参数
watch(selectionServiceId, () => {
  if (selectionServiceId.value !== '') {
    updatePeriod(selectionServiceId.value)
  }
})
/* 被动变化的watch */

/* 获取全部选项的函数 */
// 根据当前service_id获取period列表的函数
const updatePeriod = async (serviceId: string) => {
  // 清空当前images列表
  periods.value = []

  // 从分页数据中获取全部数据
  const PAGE_SIZE = 100 // 单次获取的page size
  let count = 0 // 结果总数，多页项目的数总和
  let page = 1 // current page

  try {
    // 先执行一次，再检查循环条件
    do {
      // 用当前分页条件获取数据
      const respGetPeriod = await api.server.period.getPeriod({
        query: {
          page,
          page_size: PAGE_SIZE,
          service_id: serviceId
        }
      })

      // 保存数据
      for (const period of respGetPeriod.data.results as PeriodInterface[]) {
        // period options
        periods.value.push(period)
      }

      // 更新分页数据
      page += 1
      count = respGetPeriod.data.count
      // 核实容器内含有当前指定serviceId的image数量够不够，不够再去拿
    } while (periods.value.length < count) // do体内执行完毕后，再检查循环条件，决定是否开始下次循环
  } catch (exception) {
    // exceptionNotifier(exception)
  }

  // 排序
  periods.value.sort((a: PeriodInterface, b: PeriodInterface) => a.period - b.period)

  // 选择默认项
  choosePeriod()
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
  // if (selectionPayment.value === 'prepaid' && (selectionPeriod.value <= 0 || selectionPeriod.value > MAX_MONTHS)) {
  //   Notify.create({
  //     classes: 'notification-negative shadow-15',
  //     icon: 'error',
  //     textColor: 'negative',
  //     message: `${tc('components.server.ServerDeployCard.prepaid_time_warning')}1-${MAX_MONTHS}${tc('components.server.ServerDeployCard.prepaid_time_months')}`,
  //     position: 'bottom',
  //     closeBtn: true,
  //     timeout: 5000,
  //     multiLine: false
  //   })
  //   return false
  // } else

  if (selectionOwner.value === 'group' && selectionGroupId.value === '') {
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

const deploy = async () => {
  if (checkInputs()) {
    // 云主机的配置
    const selection = {
      pay_type: selectionPayment.value,
      ...(selectionPayment.value === 'prepaid' ? { period: selectionPeriod.value } : {}),
      ...(selectionOwner.value === 'group' ? { vo_id: selectionGroupId.value } : {}),
      service_id: selectionServiceId.value,
      size: inputSize.value,
      remarks: inputRemarks.value
    }

    try {
      isDeploying.value = true

      const respPostDisk = await api.server.disk.postDisk({ body: selection })

      // 创建后处理方式分两种，预付费和后付费
      if (selectionPayment.value === 'prepaid') {
        // 包月预付
        // 更新订单table
        const orderId = respPostDisk.data.order_id
        void await store.loadSingleOrder({
          isGroup: selectionOwner.value === 'group',
          orderId
        })
        // 跳转至订单list
        selectionOwner.value === 'group' ? navigateToUrl(`/my/server/group/order/detail/${orderId}`) : navigateToUrl(`/my/server/personal/order/detail/${orderId}`)
      } else if (selectionPayment.value === 'postpaid') {
        // 按量计费
        // 更新订单table
        const orderId = respPostDisk.data.order_id
        void await store.loadSingleOrder({
          isGroup: selectionOwner.value === 'group',
          orderId
        })
        // 更新personal/group DiskTable,根据返回的diskId获取该disk的全部信息，存入table
        // const serverId = selectionOwner.value === 'group' ? store.tables.groupOrderTable.byId[orderId].resources[0].instance_id : store.tables.personalOrderTable.byId[orderId].resources[0].instance_id

        // todo 新增disktable
        // void await store.loadSingleServer({
        //   serverId,
        //   isGroup: selectionOwner.value === 'group'
        // })

        // notify todo disk table
        // Notify.create({
        //   classes: 'notification-positive shadow-15',
        //   icon: 'check_circle',
        //   textColor: 'positive',
        //   message: `${tc('components.server.ServerDeployCard.server_create_success')}: ${selectionOwner.value === 'group' ? store.tables.groupServerTable.byId[serverId].ipv4 : store.tables.personalServerTable.byId[serverId].ipv4}`,
        //   position: 'bottom',
        //   closeBtn: true,
        //   timeout: 15000,
        //   multiLine: false
        // })

        // 跳转至disk list
        selectionOwner.value === 'group' ? navigateToUrl('/my/server/group/list') : navigateToUrl('/my/server/personal/disk')
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
    <q-scroll-area style="height: calc(100vh - 60px);">

      <div class="row justify-center" style="padding-bottom: 130px;">
        <div class="content-fixed-width">

          <div class="row items-center q-py-sm">
            <q-btn class="col-auto" flat dense color="primary" icon="arrow_back_ios" size="lg" @click="router.back()"/>
            <div class="col-auto text-h6 text-primary ">
              {{ tc('新建云硬盘') }}
            </div>
          </div>

          <div class="row items-center q-pt-md q-pb-xs">
            <div class="col-1 row">
              <div class="text-weight-bold">
                {{ tc('云硬盘账户') }}
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
              <!--              <q-btn-->
              <!--                :color="selectionPeriod === month ? 'primary' : 'grey-3'"-->
              <!--                :text-color="selectionPeriod === month ? '' : 'black'"-->
              <!--                v-for="month in Array.from({length: MAX_MONTHS}, (item, index) => index + 1)"-->
              <!--                :val="month"-->
              <!--                :key="month"-->
              <!--                unelevated-->
              <!--                dense-->
              <!--                no-caps-->
              <!--                :ripple="false"-->
              <!--                @click="selectionPeriod = month"-->
              <!--              >-->
              <!--                &lt;!&ndash;复数i18n&ndash;&gt;-->
              <!--                {{ month }} {{ tc('countMonth', month) }}-->
              <!--              </q-btn>-->

              <q-btn
                :color="selectionPeriod === period.period ? 'primary' : 'grey-3'"
                :text-color="selectionPeriod === period.period ? '' : 'black'"
                v-for="period in periods"
                :val="period.period"
                :key="period.id"
                unelevated
                dense
                no-caps
                :ripple="false"
                @click="selectionPeriod = period.period"
              >
                <!--复数i18n-->
                {{ period.period }} {{ tc('countMonth', period.period) }}
              </q-btn>

            </div>
          </div>
          <!--          </Transition>-->

          <div class="row items-center q-py-md">
            <div class="col-1 row items-center">
              <div class="text-weight-bold">
                {{ tc('容量') }}
              </div>
            </div>

            <div class="col-11 row q-pt-md">

              <q-input ref=""
                       style="width: 200px;"
                       v-model.number="inputSize"
                       input-class="text-center text-primary text-weight-bold"
                       suffix="GB"
                       dense
                       outlined
                       :rules="[val => (Number.isInteger(val) && val>= MIN_SIZE && val <= MAX_SIZE) || (i18n.global.locale === 'zh' ? `应为介于${MIN_SIZE}-${MAX_SIZE}之间的整数` : `Must be an integer between ${MIN_SIZE} and ${MAX_SIZE}`)]">

                <template v-slot:prepend>
                  <q-icon name="remove" color="primary"
                          @click="inputSize = (inputSize < MIN_SIZE ? MIN_SIZE : inputSize - 50)"
                          class="cursor-pointer"/>
                </template>

                <template v-slot:append>
                  <q-icon name="add" color="primary"
                          @click="inputSize = (inputSize > MAX_SIZE ? MAX_SIZE : inputSize + 50)"
                          class="cursor-pointer"/>
                </template>

              </q-input>

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

          <div class="row items-center q-py-md">
            <q-btn class="col-2"
                   dense
                   unelevated
                   color="primary"
                   :loading="isDeploying"
                   @click="deploy">

              <div v-if="selectionPayment === 'prepaid'">
                {{ tc('placeOrder') }}
              </div>

              <div v-if="selectionPayment === 'postpaid'">
                {{ tc('新建云硬盘') }}
              </div>

            </q-btn>
          </div>

        </div>
      </div>

    </q-scroll-area>

    <q-page-sticky expand position="bottom">

      <div class="row full-width justify-start">
        <q-btn style="transform: translate(0, 0);"
               flat
               dense
               color="primary"
               :icon="isShow ? 'expand_more' : 'expand_less'"
               @click="isShow = !isShow">
          {{ isShow ? tc('折叠详情') : tc('展开详情') }}
        </q-btn>
      </div>

      <div v-if="isShow" class="column items-center justify-center full-width shadow-up-5 q-pt-xs"
           style="background-color: rgba(0, 0, 0, 0.05); backdrop-filter: blur(10px);"
      >
        <div class="col-auto row items-center justify-between no-wrap content-fixed-width" style="line-height: 1;">

          <div class="col-3 full-height">

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">

                <div class="col-auto ">
                  {{ tc('云硬盘账户') }}
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
                  {{ tc('容量') }}
                </div>

                <div class="col-auto text-primary ">
                  {{ `${inputSize} GB` }}
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

            <div v-if="selectionPayment === 'prepaid' && currentPrice !== null"
                 class="row items-start justify-between"
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
            <!--                {{ tc('新建云硬盘') }}-->
            <!--              </div>-->

            <!--            </q-btn>-->
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
