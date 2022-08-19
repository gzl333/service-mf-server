<script setup lang="ts">
import { ref, computed, watch/* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'

// @ts-expect-error
// import { useStoreMain } from '@cnic/main'

import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'
import OsLogo from 'components/ui/OsLogo.vue'
import { Notify } from 'quasar'
import { navigateToUrl } from 'single-spa'

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
const dataCenters = computed(() => Object.values(store.tables.dataCenterTable.byId))
const services = computed(() => Object.values(store.tables.serviceTable.byId))
const flavors = computed(() => Object.values(store.tables.fedFlavorTable.byId))
// selectionService的选项数据根据dataCenters动态生成,此处没有
// //依赖selectionService Id选择值的数据
const publicNetworks = computed(() => store.getPublicNetworksByServiceId(selectionService.value))
const privateNetworks = computed(() => store.getPrivateNetworksByServicedId(selectionService.value))
const images = computed(() => store.getImagesByServiceId(selectionService.value))
// const systemDisks = computed(() => Array.from({ length: (MAX_SYSTEM_DISK - MIN_SYSTEM_DISK.value) / 50 + 1 }, (item, index) => MIN_SYSTEM_DISK.value + index * 50))

// selection选项 初始状态 (1)
const selectionOwner = ref<'personal' | 'group'>('personal')
const selectionPayment = ref<'prepaid' | 'postpaid'>('prepaid')
const selectionGroup = ref('')
const selectionPeriod = ref(1)
const selectionService = ref('')
const selectionDatacenter = computed(() => store.tables.serviceTable.byId[selectionService.value]?.data_center || '')
const selectionImage = ref('')

const selectionFlavor = ref('')
const selectionNetwork = ref('')
const inputRemarks = ref('')
// // 待实现
// const selectionSystemDisk = ref(50)
// const selectionDataDisk = ref(0)

// 询价对象
const currentPrice = ref<{ original: string; trade: string } | null>(null)
// 根据selection进行询价
watch([selectionPayment, selectionPeriod, selectionFlavor, selectionNetwork], async () => {
  // prepaid时才询价
  if (selectionPayment.value === 'prepaid') {
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
    } catch {
      // 若询价失败，清除当前询价结果
      currentPrice.value = null
    }
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
  selectionNetwork.value = privateNetworks.value[0]?.id || publicNetworks.value[0]?.id || ''
}
const chooseImage = () => {
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
chooseImage()
chooseFlavor()
/* table 进入页面过程中选择默认项 */

// (4)刷新页面，table未加载时进入页面，根据table的加载状态变化一次都要选一次默认值。细分到每个table。
// watch关注的应该是响应式对象，而非某个table。
// 若关注table写法应为watch(()=> store.tables.xxxTable, action) https://github.com/vuejs/pinia/discussions/1218
// watch([store.tables, store.tables.groupTable, store.tables.groupMemberTable], chooseselectionDefaults)
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
  chooseNetwork()
  chooseImage()
  chooseNetwork()
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
    isDeploying.value = true
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

    const respPostServer = await api.server.server.postServer({ body: selection })

    // 创建后处理方式分两种，预付费和后付费
    if (selectionPayment.value === 'prepaid') {
      // 包月预付
      // 2xx 成功创建订单
      if (respPostServer.status.toString().startsWith('2')) {
        // 更新订单table
        const orderId = respPostServer.data.order_id
        void await store.loadSingleOrder({
          isGroup: selectionOwner.value === 'group',
          orderId
        })
        // 跳转至订单list
        selectionOwner.value === 'group' ? navigateToUrl(`/my/server/group/order/detail/${orderId}`) : navigateToUrl(`/my/server/personal/order/detail/${orderId}`)
      } else {
        // 其他非2xx的状态码
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: respPostServer.data.message,
          caption: respPostServer.data.code,
          position: 'bottom',
          closeBtn: true,
          timeout: 15000,
          multiLine: false
        })
      }
    } else if (selectionPayment.value === 'postpaid') {
      // 按量计费
      if (respPostServer.status.toString().startsWith('2')) {
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
      } else {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: respPostServer.data.message,
          caption: respPostServer.data.code,
          position: 'bottom',
          closeBtn: true,
          timeout: 15000,
          multiLine: false
        })
      }
    }

    // 改变按钮状态，不管响应结果如何，得到响应之后就恢复按钮状态
    isDeploying.value = false
  }
}
/* 新建云主机 */
</script>

<template>
  <div class="ServerDeploy">

    <q-scroll-area style="height: calc(100vh - 60px);">

      <div class="row justify-center" style="padding-bottom: 200px;">
        <div class="content-fixed-width column">

          <div class="col-auto q-py-lg row items-center">
            <q-btn class="col-auto" flat dense color="primary" icon="arrow_back_ios" size="xl" @click="router.back()"/>
            <div class="col-auto text-h4 text-primary">
              {{ tc('serverNew') }}
            </div>
          </div>

          <div class="col-auto q-pb-lg">
            <div class="q-py-sm text-h6 ">
              {{ tc('serverOwner') }}
            </div>
            <div class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionOwner === 'personal' ? 'shadow-5' : 'bg-grey-1'"
                :color="selectionOwner === 'personal' ? 'white' : 'grey-3'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionOwner = 'personal'"
              >
                <div class="column items-center justify-center q-pa-sm"
                     style="width: 280px;height: 160px;">

                  <q-icon class="col-4" name="las la-user-alt" size="60px"
                          :color="selectionOwner === 'personal' ? 'primary' : 'black'"/>

                  <div class="col-4 row items-center"
                       :class="selectionOwner === 'personal' ? 'text-primary' : 'text-black'">
                    {{ tc('personalAccount') }}
                  </div>

                  <div class="col-3 text-grey-6 text-body2">
                    {{ tc('personalAccountDescription') }}
                  </div>

                  <div class="col-1 text-black text-caption">
                    {{ tc('balance') }}: {{ store.items.personalBalance.balance }} {{ tc('points') }}
                  </div>
                </div>
              </q-btn>

              <q-btn
                :class="selectionOwner === 'group' ? 'shadow-5' : 'bg-grey-1'"
                :color="selectionOwner === 'group' ? 'white' : 'grey-3'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionOwner = 'group'"
              >
                <div class="column items-center justify-center q-pa-sm"
                     style="width: 280px;height: 160px;">

                  <q-icon class="col-4" name="las la-users" size="60px"
                          :color="selectionOwner === 'group' ? 'primary' : 'black'"/>

                  <div class="col-4 row items-center"
                       :class="selectionOwner === 'group' ? 'text-primary' : 'text-black'">
                    {{ tc('groupAccount') }}
                  </div>

                  <div class="col-4 text-grey-6 text-body2">
                    {{ tc('groupAccountDescription') }}
                  </div>
                </div>
              </q-btn>

            </div>
          </div>

          <Transition>
            <div v-if="selectionOwner === 'group'" class="col-auto q-py-lg">
              <div class="q-py-sm text-h6">
                {{ tc('group') }}
              </div>

              <div v-if="groups.length === 0" class="row items-center">
                {{ tc('noGroup') }}
              </div>

              <div class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionGroup === group.id ? 'shadow-5' : 'bg-grey-1'"
                  :color="selectionGroup === group.id ? 'white' : 'grey-3'"
                  v-for="group in groups"
                  :val="group.id"
                  :key="group.id"
                  outline
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionGroup = group.id"
                >

                  <div class="row items-center q-pa-sm" style="width: 280px; height: 110px;">

                    <q-icon class="col-3" name="las la-users" size="60px"
                            :color="selectionGroup === group.id ? 'primary' : 'black'"/>

                    <div class="col-9">
                      <div class="column items-center justify-center q-pa-sm">
                        <div class="row items-center justify-center"
                             :class="selectionGroup === group.id ? 'text-primary' : 'text-black'">
                          <div class="col-auto">
                            {{ group.name }}
                          </div>
                        </div>
                        <div class="row items-center justify-center text-caption text-black">
                          {{ tc('balance') }}: {{ store.tables.groupBalanceTable.byId[group.balance]?.balance }}
                          {{ tc('points') }}
                        </div>
                      </div>
                    </div>
                  </div>

                </q-btn>
              </div>
            </div>
          </Transition>

          <div class="col-auto q-py-lg">
            <div class="q-py-sm text-h6">
              {{ tc('paymentMethod') }}
            </div>
            <div class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionPayment === 'prepaid' ? 'shadow-5' : 'bg-grey-1'"
                :color="selectionPayment === 'prepaid' ? 'white' : 'grey-3'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionPayment = 'prepaid'"
              >

                <div class="row items-center q-pa-sm" style="width: 280px; height: 120px;">

                  <q-icon class="col-3" name="las la-money-bill-alt" size="60px"
                          :color="selectionPayment === 'prepaid' ? 'primary' : 'black'"/>

                  <div class="col-9">
                    <div class="column items-center justify-center q-pa-sm">
                      <div class="col-4 row items-center justify-center"
                           :class="selectionPayment === 'prepaid' ? 'text-primary' : 'text-black'">
                        {{ tc('prepaid') }}
                      </div>
                      <div class="row items-center justify-center text-body2 text-grey">
                        {{ tc('prepaidDescription') }}
                      </div>
                    </div>
                  </div>
                </div>

              </q-btn>

              <q-btn
                :disable="!isAllowPostpaid"
                :class="selectionPayment === 'postpaid' ? 'shadow-5' : 'bg-grey-1'"
                :color="selectionPayment === 'postpaid' ? 'white' : 'grey-3'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionPayment = 'postpaid'"
              >
                <div class="row items-center q-pa-sm" style="width: 280px; height: 120px;">

                  <q-icon class="col-3" name="las la-file-invoice-dollar" size="60px"
                          :color="selectionPayment === 'postpaid' ? 'primary' : 'black'"/>

                  <div class="col-9">
                    <div class="column items-center justify-center q-pa-sm">

                      <div class="col-4 row items-center justify-center"
                           :class="selectionPayment === 'postpaid' ? 'text-primary' : 'text-black'">
                        {{ tc('postpaid') }}
                      </div>

                      <div class="row items-center justify-center text-body2 text-grey">
                        {{ tc('postpaidDescription') }}
                      </div>

                      <q-icon v-if="!isAllowPostpaid" class="col-auto" name="error_outline" color="red" size="xs">
                      </q-icon>

                    </div>
                  </div>

                  <q-tooltip v-if="!isAllowPostpaid">
                    {{ tc('postpaidNotAllowed') }}
                  </q-tooltip>

                </div>
              </q-btn>

            </div>
          </div>

          <Transition>
            <div v-if="selectionPayment === 'prepaid'" class="col-auto q-py-lg">
              <div class="q-py-sm text-h6">
                {{ tc('usagePeriod') }}
              </div>
              <div class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionPeriod === month ? 'shadow-5' : 'bg-grey-1'"
                  :color="selectionPeriod === month ? 'white' : 'grey-3'"
                  v-for="month in Array.from({length: MAX_MONTHS}, (item, index) => index + 1)"
                  :val="month"
                  :key="month"
                  outline
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionPeriod = month"
                >
                  <div class="column items-center justify-center"
                       style="width: 124px;height: 30px;">

                    <div class="col-auto" :class="selectionPeriod === month ? 'text-primary' : 'text-black'">
                      <!--复数i18n-->
                      {{ month }} {{ tc('countMonth', month) }}
                    </div>

                  </div>
                </q-btn>
              </div>
            </div>
          </Transition>

          <div class="col-auto q-py-lg">
            <div class="q-py-sm text-h6">
              {{ tc('serviceUnit') }}
            </div>

            <div v-for="dataCenter in dataCenters" :key="dataCenter.id" class="q-pb-lg">
              <div class="row items-center text-subtitle1"
                   :class="selectionDatacenter === dataCenter.id ? 'text-primary' : 'text-black'">
                {{ i18n.global.locale === 'zh' ? dataCenter.name : dataCenter.name_en }}
              </div>

              <div v-if="dataCenter.services.length === 0" class="row items-center">
                {{ tc('noServiceUnit') }}
              </div>

              <div v-else class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionService === service.id ? 'shadow-5' : 'bg-grey-1'"
                  :color="selectionService === service.id ? 'white' : 'grey-3'"
                  v-for="service in dataCenter.services.map(id => store.tables.serviceTable.byId[id])"
                  :key="service.id"
                  :val="service.id"
                  outline
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionService = service.id"
                >
                  <div class="column items-center justify-center q-pa-sm"
                       style="width: 280px;height: 100px;">

                    <div class="col-4" :class="selectionService === service.id ? 'text-primary' : 'text-black'">
                      {{ i18n.global.locale === 'zh' ? service.name : service.name_en }}
                    </div>

                    <div class="col-4">
                      <CloudPlatformLogo class="col-auto" :platform-name="service.service_type"/>
                    </div>

                    <div class="col-4 row items-center justify-center text-black">
                      <div class="col-auto text-grey">
                        {{ tc('serviceStatus') }}
                      </div>

                      <q-icon
                        v-if="store.getImagesByServiceId(service.id).length > 0 && (store.getPrivateNetworksByServicedId(service.id).length + store.getPublicNetworksByServiceId(service.id).length) > 0"
                        class="col-auto" name="check_circle_outline" color="light-green" size="xs">
                        <q-tooltip>
                          {{ tc('serviceStatusGood') }}
                        </q-tooltip>
                      </q-icon>

                      <q-icon v-else class="col-auto" name="error_outline" color="red" size="xs">
                        <q-tooltip>
                          <div v-if="store.getImagesByServiceId(service.id).length === 0">
                            {{ tc('noOperatingSystem') }}
                          </div>
                          <div
                            v-if="(store.getPrivateNetworksByServicedId(service.id).length + store.getPublicNetworksByServiceId(service.id).length) === 0">
                            {{ tc('noNetwork') }}
                          </div>
                        </q-tooltip>
                      </q-icon>

                    </div>

                  </div>
                </q-btn>
              </div>

            </div>
          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-sm text-h6">
              {{ tc('operatingSystem') }}
            </div>

            <div v-if="images.length === 0" class="row items-center">
              {{ tc('noOperatingSystem') }}
            </div>

            <div v-else class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionImage === image.id ? 'shadow-5' : 'bg-grey-1'"
                :color="selectionImage === image.id ? 'white' : 'grey-3'"
                v-for="image in images"
                :val="image.id"
                :key="image.id"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionImage = image.id"
              >
                <div class="column items-center justify-center q-pa-sm"
                     style="width: 280px;height: 150px;">

                  <div class="col-7 row items-center">
                    <OsLogo class="col" :os-name="image.name" size="60px"/>
                  </div>
                  <div class="col-5 row items-center"
                       :class="selectionImage === image.id ? 'text-primary' : 'text-black'">
                    {{ image.name.slice(0, 60) }}
                  </div>
                </div>
              </q-btn>
            </div>
          </div>

          <!--          <div class="col-auto q-py-lg">-->
          <!--            <div class="q-py-md text-h6">-->
          <!--              {{ tc('systemDiskSize') }}-->
          <!--            </div>-->
          <!--            <div class="row items-center q-gutter-lg">-->
          <!--              <q-btn-->
          <!--                :class="selectionSystemDisk === disk ? 'shadow-5' : 'bg-grey-1'"-->
          <!--                :color="selectionSystemDisk === disk ? 'white' : 'grey-3'"-->
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

          <div class="col-auto q-py-lg">
            <div class="q-py-sm text-h6">
              {{ tc('network') }}
            </div>

            <div v-if="publicNetworks.length === 0 && privateNetworks.length === 0" class="row items-center">
              {{ tc('noNetwork') }}
            </div>

            <div v-if="privateNetworks.length > 0" class="q-pb-lg">
              <div class="row">
                {{ tc('privateNetwork') }}
              </div>
              <div class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionNetwork === network.id ? 'shadow-5' : 'bg-grey-1'"
                  :color="selectionNetwork === network.id ? 'white' : 'grey-3'"
                  v-for="network in privateNetworks"
                  :val="network.id"
                  :key="network.id"
                  outline
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionNetwork = network.id"
                >
                  <div class="column items-center justify-center q-pa-sm"
                       style="width: 124px;height: 50px;">

                    <div :class="selectionNetwork === network.id ? 'text-primary' : 'text-black'" class="column">
                      <div class="col-auto">
                        {{ network.name }}
                      </div>
                      <div class="col-auto">
                        {{ network.segment }}
                      </div>
                    </div>

                  </div>
                </q-btn>
              </div>
            </div>

            <div v-if="publicNetworks.length > 0" class="q-pb-lg">
              <div class="row">
                {{ tc('publicNetwork') }}
              </div>
              <div class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionNetwork === network.id ? 'shadow-5' : 'bg-grey-1'"
                  :color="selectionNetwork === network.id ? 'white' : 'grey-3'"
                  v-for="network in publicNetworks"
                  :val="network.id"
                  :key="network.id"
                  outline
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionNetwork = network.id"
                >
                  <div class="column items-center justify-center q-pa-sm"
                       style="width: 124px;height: 50px;">

                    <div :class="selectionNetwork === network.id ? 'text-primary' : 'text-black'" class="column">
                      <div class="col-auto">
                        {{ network.name }}
                      </div>
                      <div class="col-auto">
                        {{ network.segment }}
                      </div>
                    </div>

                  </div>
                </q-btn>
              </div>
            </div>

          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-sm text-h6">
              {{ tc('serverSize') }}
            </div>

            <div v-if="flavors.length === 0" class="row items-center">
              {{ tc('noServerSize') }}
            </div>

            <div v-else class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionFlavor === flavor.id ? 'shadow-5' : 'bg-grey-1'"
                :color="selectionFlavor === flavor.id ? 'white' : 'grey-3'"
                v-for="flavor in flavors"
                :val="flavor.id"
                :key="flavor.id"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionFlavor = flavor.id"
              >
                <div class="column items-center justify-center q-pa-sm"
                     style="width: 124px;height: 30px;">

                  <div :class="selectionFlavor === flavor.id ? 'text-primary' : 'text-black'">
                    {{ `${flavor.vcpus} ${tc('countCore', flavor.vcpus)} / ${flavor.ram / 1024} GB` }}
                  </div>

                </div>
              </q-btn>
            </div>
          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-sm text-h6">
              {{ tc('remark') }}
            </div>
            <div class="row">
              <q-input class="col-8"
                       ref="input"
                       v-model="inputRemarks"
                       maxlength="100"
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
      <div class="column items-center justify-center full-width shadow-up-5 q-pa-sm"
           style="background-color: rgba(0, 0, 0, 0.05); backdrop-filter: blur(10px);"
      >
        <div class="col-auto row items-center justify-between no-wrap content-fixed-width">

          <div class="col-3 full-height">

            <div class="row items-start">
              <div class="col-auto column q-pb-sm">

                <div class="col-auto">
                  {{ tc('serverOwner') }}
                </div>

                <div v-if="selectionOwner === 'personal'" class="col-auto text-primary">
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
                  v-if="store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.name"
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

          <!--          <div class="col-9">-->
          <!--            <div v-if="selectionOwner === 'group'" class="row item-row items-center">-->
          <!--              <div class="col-2 item-title-narrow text-grey">-->
          <!--                {{ tc('components.server.ServerDeployCard.group') }}-->
          <!--              </div>-->
          <!--              <div class="col">-->
          <!--                <div v-if="selectionGroup !== ''">-->
          <!--                  {{ store.tables.groupTable.byId[selectionGroup]?.name }}-->
          <!--                </div>-->
          <!--                <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.select_group') }}</div>-->
          <!--              </div>-->
          <!--            </div>-->

          <!--            <div class="row item-row items-center">-->
          <!--              <div class="col-2 item-title-narrow text-grey">-->
          <!--                {{ tc('components.server.ServerDeployCard.billing_method') }}-->
          <!--              </div>-->
          <!--              <div class="col">-->
          <!--                {{-->
          <!--                  selectionPayment === 'prepaid' ? tc('components.server.ServerDeployCard.monthly_prepaid') : tc('components.server.ServerDeployCard.pay_as_go')-->
          <!--                }}-->
          <!--              </div>-->
          <!--            </div>-->

          <!--          <div v-if="selectionPayment === 'prepaid'" class="row item-row items-center">-->
          <!--            <div class="col-2 item-title-narrow text-grey">-->
          <!--              {{ tc('components.server.ServerDeployCard.prepaid_period') }}-->
          <!--            </div>-->
          <!--            <div class="col"-->
          <!--                 :class="(selectionPeriod <= 0 || selectionPeriod > MAX_MONTHS || !Number.isInteger(selectionPeriod)) ? 'text-red' : ''">-->
          <!--              {{ selectionPeriod }} {{ tc('components.server.ServerDeployCard.months') }}-->
          <!--            </div>-->
          <!--          </div>-->

          <!--          <div class="row item-row items-center">-->
          <!--            <div class="col-2 item-title-narrow text-grey">-->
          <!--              {{ tc('components.server.ServerDeployCard.service_node') }}-->
          <!--            </div>-->
          <!--            <div class="col">-->
          <!--              <div-->
          <!--                v-if="store.tables.dataCenterTable.byId[selectionDatacenter] && store.tables.serviceTable.byId[selectionService]"-->
          <!--                class="row items-center">-->

          <!--                <div class="col-auto">-->
          <!--                  {{-->
          <!--                    i18n.global.locale === 'zh' ?-->
          <!--                      `${store.tables.dataCenterTable.byId[selectionDatacenter]?.name} - ${store.tables.serviceTable.byId[selectionService]?.name}` :-->
          <!--                      `${store.tables.dataCenterTable.byId[selectionDatacenter]?.name_en} - ${store.tables.serviceTable.byId[selectionService]?.name_en}`-->
          <!--                  }}-->
          <!--                </div>-->

          <!--                <CloudPlatformLogo class="col-auto"-->
          <!--                                   :platform-name="store.tables.serviceTable.byId[selectionService]?.service_type"/>-->

          <!--              </div>-->
          <!--              <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.select_service_node') }}</div>-->
          <!--            </div>-->
          <!--          </div>-->

          <!--          <div class="row item-row items-center">-->
          <!--            <div class="col-2 item-title-narrow text-grey">-->
          <!--              {{ tc('components.server.ServerDeployCard.network_type') }}-->
          <!--            </div>-->
          <!--            <div class="col">-->

          <!--              <div-->
          <!--                v-if="store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.name">-->
          <!--                {{-->
          <!--                  store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.public ? tc('components.server.ServerDeployCard.public_ip_segment') : tc('components.server.ServerDeployCard.private_ip_segment')-->
          <!--                }}: {{ store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.name }}-->
          <!--              </div>-->
          <!--              <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.select_network') }}</div>-->

          <!--            </div>-->
          <!--          </div>-->

          <!--          <div class="row item-row items-center">-->
          <!--            <div class="col-2 item-title-narrow text-grey">-->
          <!--              {{ tc('components.server.ServerDeployCard.operating_system') }}-->
          <!--            </div>-->
          <!--            <div class="col">-->
          <!--              <div v-if="store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name">-->
          <!--                <OsLogo-->
          <!--                  :os-name="store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name"-->
          <!--                  size="sm"-->
          <!--                />-->

          <!--                {{ store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name }}-->

          <!--              </div>-->
          <!--              <div v-else class="text-red">{{-->
          <!--                  tc('components.server.ServerDeployCard.select_operating_system')-->
          <!--                }}-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </div>-->

          <!--          <div class="row item-row items-center">-->
          <!--            <div class="col-2 item-title-narrow text-grey">-->
          <!--              CPU/{{ tc('components.server.ServerDeployCard.memory') }}-->
          <!--            </div>-->
          <!--            <div class="col ">-->
          <!--              <div v-if="store.tables.fedFlavorTable.byId[selectionFlavor]">-->
          <!--                {{-->
          <!--                  `${store.tables.fedFlavorTable.byId[selectionFlavor].vcpus} ${tc('components.server.ServerDeployCard.cores')}/${store.tables.fedFlavorTable.byId[selectionFlavor].ram / 1024}GB`-->
          <!--                }}-->
          <!--              </div>-->
          <!--              <div v-else class="text-red">{{-->
          <!--                  tc('components.server.ServerDeployCard.please_select_configuration')-->
          <!--                }}-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </div>-->

          <!--          <div class="row item-row items-center">-->
          <!--            <div class="col-2 item-title-narrow text-grey">-->
          <!--              {{ tc('components.server.ServerDeployCard.remarks') }}-->
          <!--            </div>-->
          <!--            <div v-if="inputRemarks" class="col">-->
          <!--              {{ inputRemarks }}-->
          <!--            </div>-->
          <!--            <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.fill_remarks') }}</div>-->
          <!--          </div>-->

          <!--          </div>-->

          <div class="col-3">
            <div class="row items-center justify-center text-primary text-h6">
              <div class="col-auto">
                {{
                  selectionPayment === 'prepaid' ? tc('prepaid') : tc('postpaid')
                }}
              </div>
            </div>

            <div class="row items-center justify-center text-primary text-h6">
              <div v-if="selectionPayment === 'prepaid'" class="col-auto">
                {{ selectionPeriod }} {{ tc('countMonth', store.tables.fedFlavorTable.byId[selectionPeriod]?.vcpus) }}
              </div>
            </div>

            <div v-if="selectionPayment === 'prepaid' && currentPrice !== null" class="row items-start justify-between">
              <div class="col-auto column">
                <div class="col-auto">
                  {{ tc('discountPrice') }}
                </div>
                <div class="col-auto text-primary text-h6">
                  {{ currentPrice?.trade }} {{ tc('points', Number(currentPrice?.trade)) }}
                </div>
              </div>

              <div class="col-auto column items-start">
                <div class="col-auto">
                  {{ tc('originalPrice') }}
                </div>
                <div class="col-auto text-h6 text-weight-regular text-strike">
                  {{ currentPrice?.original }} {{ tc('points', Number(currentPrice?.original)) }}
                </div>
              </div>

            </div>
            <q-btn class="full-width"
                   unelevated
                   no-caps
                   color="primary"
                   size="lg"
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
.ServerDeploy {
}

.v-enter-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
