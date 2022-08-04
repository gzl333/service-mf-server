<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { /*  useRoute, */ useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import api from 'src/api'
import { navigateToUrl } from 'single-spa'

import OsLogo from 'components/ui/OsLogo.vue'
import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'

const props = defineProps({
  isGroup: {
    type: Boolean,
    required: true
  },
  groupId: {
    type: String,
    required: false
  },
  serviceId: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// 预付最大月份
const MAX_MONTHS = 6

// 是否允许使用后付费模式
// 目前判断个人账户或者项目组账户余额大于0
const isAllowPostpaid = computed(() => {
  if (props.isGroup) {
    return Number(store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[radioGroup.value]?.balance]?.balance) > 0
  } else {
    return Number(store.items?.personalBalance) > 0
  }
})

// dom元素
const input = ref<HTMLElement>()

// radio选项数据
// // 全局数据
// owner/leader权限才能建立云主机， member不能建立
const groups = computed(() => store.getGroupsByMyRole(['owner', 'leader']))
const dataCenters = computed(() => Object.values(store.tables.dataCenterTable.byId))
const services = computed(() => Object.values(store.tables.serviceTable.byId))
const flavors = computed(() => Object.values(store.tables.fedFlavorTable.byId))
// radioService的选项数据根据dataCenters动态生成,此处没有
// //依赖radioService Id选择值的数据
const publicNetworks = computed(() => store.getPublicNetworksByServiceId(radioService.value))
const privateNetworks = computed(() => store.getPrivateNetworksByServicedId(radioService.value))
const images = computed(() => store.getImagesByServiceId(radioService.value))

// radio选项 初始状态 (1)
const radioPayment = ref<'prepaid' | 'postpaid'>('prepaid')
const radioPeriod = ref(1)
const radioGroup = ref('')
const radioService = ref('')
const radioDataCenter = computed(() => store.tables.serviceTable.byId[radioService.value]?.data_center || '')
// const radioQuota = ref('')
const radioNetwork = ref('')
const radioImage = ref('')
const radioFlavor = ref('')
const inputRemarks = ref('')

/* table 进入页面过程中选择默认项 */

/* 分为显示和选择动作两部分。
* 显示部分在标签里进行逻辑判断，哪些显示，哪些不显示
* 选择动作在ts部分，radio真正选择了哪些值 */

// radio默认选择 (2)
// const chooseRadioDefaults = () => {
//   radioGroup.value = props.groupId || groups.value[0]?.id || ''
//   radioService.value = props.serviceId || services.value[0]?.id || ''
//   radioNetwork.value = privateNetworks.value[0]?.id || publicNetworks.value[0]?.id || ''
//   radioImage.value = images.value[0]?.id || ''
//   radioFlavor.value = flavors.value[0]?.id || ''
// }
const chooseGroup = () => {
  radioGroup.value = props.groupId || groups.value[0]?.id || ''
}
const chooseService = () => {
  radioService.value = props.serviceId || services.value[0]?.id || ''
}
const chooseNetwork = () => {
  radioNetwork.value = privateNetworks.value[0]?.id || publicNetworks.value[0]?.id || ''
}
const chooseImage = () => {
  radioImage.value = images.value[0]?.id || ''
}
const chooseFlavor = () => {
  radioFlavor.value = flavors.value[0]?.id || ''
}

// setup时调用一次 (3) table已加载时，从别的页面进入本页面要选一次默认值
// chooseRadioDefaults()
chooseGroup()
chooseService()
chooseNetwork()
chooseImage()
chooseFlavor()
/* table 进入页面过程中选择默认项 */

// (4)刷新页面，table未加载时进入页面，根据table的加载状态变化一次都要选一次默认值。细分到每个table。
// watch关注的应该是响应式对象，而非某个table。
// 若关注table写法应为watch(()=> store.tables.xxxTable, action) https://github.com/vuejs/pinia/discussions/1218
// watch([store.tables, store.tables.groupTable, store.tables.groupMemberTable], chooseRadioDefaults)
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

/* (5) 在table都加载后，3个radio，随着service变化选择默认项 */
watch(radioService, () => {
  radioNetwork.value = privateNetworks.value[0]?.id || publicNetworks.value[0]?.id || ''
  radioImage.value = images.value[0]?.id || ''
  radioFlavor.value = flavors.value[0]?.id || ''
})
/* 在table都加载后，3个radio，随着service变化选择默认项 */

/* 用户选择选项 */

const userSelectImage = (imageId: string) => {
  radioImage.value = imageId
}

/* 用户选择选项 */

/* 新建云主机 */
const isDeploying = ref(false)
// check inputs
const checkInputs = () => {
  if (radioPayment.value === 'prepaid' && (radioPeriod.value <= 0 || radioPeriod.value > MAX_MONTHS)) {
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
  } else if (!radioNetwork.value) {
    // 如果radio没有选择全，则弹出通知
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
  } else if (!radioImage.value) {
    // 如果radio没有选择全，则弹出通知
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
  } else if (!radioFlavor.value) {
    // 如果radio没有选择全，则弹出通知
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
      pay_type: radioPayment.value,
      ...(radioPayment.value === 'prepaid' ? { period: radioPeriod.value } : {}),
      ...(props.isGroup ? { vo_id: radioGroup.value } : {}),
      service_id: radioService.value,
      image_id: radioImage.value,
      flavor_id: radioFlavor.value,
      network_id: radioNetwork.value,
      remarks: inputRemarks.value
    }

    const respPostServer = await api.server.server.postServer({ body: selection })

    // 创建后处理方式分两种，预付费和后付费
    if (radioPayment.value === 'prepaid') {
      // 包月预付
      // 2xx 成功创建订单
      if (respPostServer.status.toString().startsWith('2')) {
        // 更新订单table
        const orderId = respPostServer.data.order_id
        void await store.loadSingleOrder({
          isGroup: props.isGroup,
          orderId
        })
        // 跳转至订单list
        props.isGroup ? navigateToUrl(`/my/server/group/order/detail/${orderId}`) : navigateToUrl(`/my/server/personal/order/detail/${orderId}`)
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
    } else if (radioPayment.value === 'postpaid') {
      // 按量计费
      if (respPostServer.status.toString().startsWith('2')) {
        // 更新订单table
        const orderId = respPostServer.data.order_id
        void await store.loadSingleOrder({
          isGroup: props.isGroup,
          orderId
        })
        // 更新personal/group ServerTable,根据返回的serverId获取该server的全部信息，存入table
        const serverId = props.isGroup ? store.tables.groupOrderTable.byId[orderId].resources[0].instance_id : store.tables.personalOrderTable.byId[orderId].resources[0].instance_id
        void await store.loadSingleServer({
          serverId,
          isGroup: props.isGroup
        })
        // notify
        Notify.create({
          classes: 'notification-positive shadow-15',
          icon: 'check_circle',
          textColor: 'positive',
          message: `${tc('components.server.ServerDeployCard.server_create_success')}: ${props.isGroup ? store.tables.groupServerTable.byId[serverId].ipv4 : store.tables.personalServerTable.byId[serverId].ipv4}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 15000,
          multiLine: false
        })
        // 跳转至server list
        props.isGroup ? navigateToUrl('/my/server/group/list') : navigateToUrl('/my/server/personal/list')
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
  <div class="ServerDeployCard">

    <div v-if="!dataCenters">
      <q-inner-loading>
        <q-spinner size="50px" color="primary"/>
      </q-inner-loading>
    </div>

    <div v-else>

      <div v-if="isGroup" class="section">
        <div class="text-h7 text-grey text-weight-bold section-title">
          {{ tc('components.server.ServerDeployCard.group') }}
        </div>
        <div class="row items-center q-gutter-md q-pb-lg">
          <div class="col-auto text-bold row items-center ">
            {{ tc('components.server.ServerDeployCard.server_group') }}
            <q-icon name="help_outline" color="grey" size="xs">
              <q-tooltip>{{ tc('components.server.ServerDeployCard.create_server_permission') }}</q-tooltip>
            </q-icon>
          </div>
          <q-select v-if="groups.length !== 0"
                    class="col-auto"
                    style="min-width: 300px;"
                    dense
                    outlined
                    v-model="radioGroup"
                    :options="groups"
                    map-options
                    emit-value
                    option-label="name"
                    option-value="id"
                    @update:model-value="radioPayment = 'prepaid'"
          >
            <!--            选择group后，radioPayment应该复位为prepaid，因为新的组不一定满足postpaid条件-->

            <!--当前选项的内容插槽-->
            <template v-slot:selected-item="scope">
              <q-item class="q-pa-none">
                <q-item-section>
                  <q-item-label :class="radioGroup===scope.opt.id ? 'text-primary' : 'text-black'">{{
                      scope.opt.name
                    }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ tc('components.server.ServerDeployCard.balance') }}:
                    {{ store.tables.groupBalanceTable.byId[scope.opt.balance]?.balance }}
                    {{ tc('components.server.ServerDeployCard.points') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>

            <!--待选项的内容插槽-->
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>
                    {{ tc('components.server.ServerDeployCard.balance') }}:
                    {{ store.tables.groupBalanceTable.byId[scope.opt.balance]?.balance }}
                    {{ tc('components.server.ServerDeployCard.points') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>

          </q-select>
          <div v-else>
            <div class="row items-center">
              {{ tc('components.server.ServerDeployCard.no_group') }}
              <q-btn v-if="isGroup" flat padding="none" color="primary"
                     :to="'/my/server/group/create'">
                {{ tc('components.server.ServerDeployCard.create_group') }}
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <div class="col section">
        <div class="text-h7 text-grey text-weight-bold section-title">
          {{ tc('components.server.ServerDeployCard.billing_method') }}
        </div>

        <div class="row item-row">
          <q-radio class="radio non-selectable" v-model="radioPayment" val="prepaid" dense>
            <span class="text-bold q-pr-lg" :class="radioPayment==='prepaid' ? 'text-primary' : 'text-black'">
              {{ tc('components.server.ServerDeployCard.monthly_prepaid') }}
            </span>
            <span>{{ tc('components.server.ServerDeployCard.delivery_after_pay') }}</span>
          </q-radio>
        </div>

        <div class="row item-row">
          <q-radio class="radio non-selectable" v-model="radioPayment" val="postpaid" :disable="!isAllowPostpaid" dense>
            <span class="text-bold q-pr-lg" :class="radioPayment==='postpaid' ? 'text-primary' : 'text-black'">
              {{ tc('components.server.ServerDeployCard.pay_as_go') }}
            </span>
            <span>{{ tc('components.server.ServerDeployCard.delivery_now') }}</span>
            <span v-if="!isAllowPostpaid"
                  class="text-red q-px-md">{{ tc('components.server.ServerDeployCard.low_balance') }}</span>
          </q-radio>
        </div>
      </div>

      <div v-if="radioPayment === 'prepaid'" class="col section">
        <div class="text-h7 text-grey text-weight-bold section-title">
          {{ tc('components.server.ServerDeployCard.prepaid_period') }}
        </div>

        <div class="row items-center q-gutter-md q-pb-lg">
          <div class="col-auto text-bold row items-center ">
            {{ tc('components.server.ServerDeployCard.server_usage_period') }}
          </div>

          <div class="row items-center q-pt-md">
            <q-input style="max-width: 300px"
                     outlined v-model.number="radioPeriod" input-class="text-center text-primary"
                     :suffix="i18n.global.locale === 'zh' ? '个月' : 'Months'" dense
                     :rules="[val => (Number.isInteger(val) && val>0 && val <= MAX_MONTHS) || (i18n.global.locale === 'zh' ? `应为介于1-${MAX_MONTHS}之间的整数` : `Must be an integer between 1 and ${MAX_MONTHS}`)]">

              <template v-slot:prepend>
                <q-icon name="remove" color="primary"
                        @click="radioPeriod = (radioPeriod < 1 ? 1 : radioPeriod - 1)"
                        class="cursor-pointer"/>
              </template>

              <template v-slot:append>
                <q-icon name="add" color="primary"
                        @click="radioPeriod =(radioPeriod > MAX_MONTHS ? MAX_MONTHS : radioPeriod + 1)"
                        class="cursor-pointer"/>
              </template>

            </q-input>
          </div>
        </div>
      </div>

      <div class="col section">

        <div class="text-h7 text-grey text-weight-bold section-title">
          {{ tc('components.server.ServerDeployCard.service_node') }}
        </div>

        <div v-for="(dataCenter, index) in dataCenters" :key="dataCenter.id" class="item-row">

          <div class="row">
            <div class="col-2 item-title text-bold">
              {{ i18n.global.locale === 'zh' ? dataCenter.name : dataCenter.name_en }}
            </div>

            <div class="col">
              <div v-if="dataCenter.services.length === 0" class="row items-center q-pb-sm">
                {{ tc('components.server.ServerDeployCard.no_available_service') }}
              </div>

              <div v-else class="row items-center q-pb-sm"
                   v-for="service in dataCenter.services.map(id => store.tables.serviceTable.byId[id])"
                   :key="service.id">

                <q-radio class="col-auto  non-selectable" dense v-model="radioService"
                         :val="service.id"
                         :key="service.id">
                  <div class="row items-center q-gutter-sm">

                    <CloudPlatformLogo class="col-auto" :platform-name="service.service_type"/>

                    <div class="col-auto" :class="radioService===service.id ? 'text-primary' : 'text-black'">
                      {{ i18n.global.locale === 'zh' ? service.name : service.name_en }}
                    </div>

                  </div>

                </q-radio>

              </div>

            </div>

          </div>

          <q-separator class="q-my-md" style="margin-left: 250px;" v-if="index !== (dataCenters.length - 1)"/>

        </div>
      </div>

      <div class="col section">

        <div class="text-h7 text-grey text-weight-bold section-title">
          {{ tc('components.server.ServerDeployCard.network_type') }}
        </div>
        <div
          v-if="privateNetworks.length > 0"
          class="row item-row">
          <div class="col-auto q-pr-md text-bold">
            {{ tc('components.server.ServerDeployCard.private_ip_segment') }}
          </div>
          <div class="col">
            <q-radio v-for="network in privateNetworks" :val="network.id" :key="network.id" v-model="radioNetwork"
                     class="radio non-selectable" dense>
              <div :class="radioNetwork===network.id ? 'text-primary' : 'text-black'">
                {{ network.name }}
              </div>
            </q-radio>
          </div>
        </div>

        <div
          v-if="publicNetworks.length > 0"
          class="row item-row">
          <div class="col-auto q-pr-md text-bold">
            {{ tc('components.server.ServerDeployCard.public_ip_segment') }}
          </div>
          <div class="col">
            <q-radio v-for="network in publicNetworks" :val="network.id" :key="network.id" v-model="radioNetwork"
                     class="radio non-selectable" dense>
              <div :class="radioNetwork===network.id ? 'text-primary' : 'text-black'">
                {{ network.name }}
              </div>
            </q-radio>
          </div>
        </div>

        <div v-if="publicNetworks.length === 0 && privateNetworks.length === 0"
             class="row item-row">
          <div class="col-shrink item-title">
            {{ tc('components.server.ServerDeployCard.node_no_network') }}
          </div>
        </div>

      </div>

      <div class="col section">
        <div class="text-h7 text-grey text-weight-bold section-title">
          {{ tc('components.server.ServerDeployCard.operating_system') }}
        </div>

        <div v-if="images.length > 0" class="row item-row q-gutter-lg">

          <q-btn
            :class="radioImage === image.id ? 'shadow-14' : ''"
            :color="radioImage === image.id ? 'white' : 'grey-4'"
            v-for="image in images"
            :val="image.id"
            :key="image.id"
            outline
            dense
            no-caps
            :ripple="false"
            @click="userSelectImage(image.id)"
          >
            <div class="column items-center justify-center"
                 style="width: 200px;height: 100px;">
              <div class="col-7 row items-center">
                <OsLogo class="col" :os-name="image.name" size="60px"/>
              </div>
              <div class="col-5 row items-center">
                <div class="text-black q-pa-none">{{ image.name.slice(0, 60) }}</div>
              </div>
            </div>

            <q-badge v-if="radioImage === image.id" style="height: 15px; width: 15px;" color="primary" floating>
              <q-icon name="check" size="5px"/>
            </q-badge>
          </q-btn>

        </div>

        <div v-else class="row item-row">
          <div class="col-shrink item-title">
            {{ tc('components.server.ServerDeployCard.node_no_os') }}
          </div>
        </div>

      </div>

      <div class="col section">
        <div class="text-h7 text-grey text-weight-bold section-title">
          CPU/{{ tc('components.server.ServerDeployCard.memory') }}
        </div>

        <div v-if="flavors.length > 0" class="row item-row">
          <div class="col">
            <q-radio v-for="flavor in flavors" :val="flavor.id" :key="flavor.id"
                     class="radio non-selectable" dense v-model="radioFlavor">
              <div :class="radioFlavor===flavor.id ? 'text-primary' : 'text-black'">
                {{ `${flavor.vcpus}${tc('components.server.ServerDeployCard.cores')}/${flavor.ram / 1024}GB` }}
              </div>
            </q-radio>
          </div>
        </div>

        <div v-else class="row item-row">
          <div class="col-shrink item-title">
            {{ tc('components.server.ServerDeployCard.node_no_configure') }}
          </div>
        </div>

      </div>

      <div class="col section">
        <div class="text-h7 text-grey text-weight-bold section-title">
          {{ tc('components.server.ServerDeployCard.remarks') }}
        </div>
        <div class="row item-row">
          <div class="col-6">
            <q-input ref="input" class="input-remarks" v-model="inputRemarks" maxlength="30" dense outlined counter/>
          </div>
        </div>
      </div>

      <div class="col summarize-section">
        <div class="text-h7 text-grey text-weight-bold section-title">
          {{ tc('components.server.ServerDeployCard.selected_configuration') }}
        </div>

        <div v-if="isGroup" class="row item-row items-center">
          <div class="col-2 item-title-narrow text-grey">
            {{ tc('components.server.ServerDeployCard.group') }}
          </div>
          <div class="col">
            <div v-if="radioGroup !== ''">
              {{ store.tables.groupTable.byId[radioGroup]?.name }}
            </div>
            <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.select_group') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-2 item-title-narrow text-grey">
            {{ tc('components.server.ServerDeployCard.billing_method') }}
          </div>
          <div class="col">
            {{
              radioPayment === 'prepaid' ? tc('components.server.ServerDeployCard.monthly_prepaid') : tc('components.server.ServerDeployCard.pay_as_go')
            }}
          </div>
        </div>

        <div v-if="radioPayment === 'prepaid'" class="row item-row items-center">
          <div class="col-2 item-title-narrow text-grey">
            {{ tc('components.server.ServerDeployCard.prepaid_period') }}
          </div>
          <div class="col"
               :class="(radioPeriod <= 0 || radioPeriod > MAX_MONTHS || !Number.isInteger(radioPeriod)) ? 'text-red' : ''">
            {{ radioPeriod }} {{ tc('components.server.ServerDeployCard.months') }}
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-2 item-title-narrow text-grey">
            {{ tc('components.server.ServerDeployCard.service_node') }}
          </div>
          <div class="col">
            <div
              v-if="store.tables.dataCenterTable.byId[radioDataCenter] && store.tables.serviceTable.byId[radioService]"
              class="row items-center">

              <div class="col-auto">
                {{
                  i18n.global.locale === 'zh' ?
                    `${store.tables.dataCenterTable.byId[radioDataCenter]?.name} - ${store.tables.serviceTable.byId[radioService]?.name}` :
                    `${store.tables.dataCenterTable.byId[radioDataCenter]?.name_en} - ${store.tables.serviceTable.byId[radioService]?.name_en}`
                }}
              </div>

              <CloudPlatformLogo class="col-auto"
                                 :platform-name="store.tables.serviceTable.byId[radioService]?.service_type"/>

            </div>
            <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.select_service_node') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-2 item-title-narrow text-grey">
            {{ tc('components.server.ServerDeployCard.network_type') }}
          </div>
          <div class="col">
            <div
              v-if="store.tables.serviceNetworkTable.byLocalId[`${radioService}-${radioNetwork}`]?.name">
              {{
                store.tables.serviceNetworkTable.byLocalId[`${radioService}-${radioNetwork}`]?.public ? tc('components.server.ServerDeployCard.public_ip_segment') : tc('components.server.ServerDeployCard.private_ip_segment')
              }}: {{ store.tables.serviceNetworkTable.byLocalId[`${radioService}-${radioNetwork}`]?.name }}
            </div>
            <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.select_network') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-2 item-title-narrow text-grey">
            {{ tc('components.server.ServerDeployCard.operating_system') }}
          </div>
          <div class="col">
            <div v-if="store.tables.serviceImageTable.byLocalId[`${radioService}-${radioImage}`]?.name">
              <OsLogo
                :os-name="store.tables.serviceImageTable.byLocalId[`${radioService}-${radioImage}`]?.name"
                size="sm"
              />

              {{ store.tables.serviceImageTable.byLocalId[`${radioService}-${radioImage}`]?.name }}

            </div>
            <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.select_operating_system') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-2 item-title-narrow text-grey">
            CPU/{{ tc('components.server.ServerDeployCard.memory') }}
          </div>
          <div class="col ">
            <div v-if="store.tables.fedFlavorTable.byId[radioFlavor]">
              {{
                `${store.tables.fedFlavorTable.byId[radioFlavor].vcpus} ${tc('components.server.ServerDeployCard.cores')}/${store.tables.fedFlavorTable.byId[radioFlavor].ram / 1024}GB`
              }}
            </div>
            <div v-else class="text-red">{{
                tc('components.server.ServerDeployCard.please_select_configuration')
              }}
            </div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-2 item-title-narrow text-grey">
            {{ tc('components.server.ServerDeployCard.remarks') }}
          </div>
          <div v-if="inputRemarks" class="col">
            {{ inputRemarks }}
          </div>
          <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.fill_remarks') }}</div>
        </div>

      </div>

      <q-btn color="primary q-mb-xl" @click="deployServer" unelevated no-caps :loading="isDeploying">
        {{
          radioPayment === 'prepaid' ? tc('components.server.ServerDeployCard.place_order') : tc('components.server.ServerDeployCard.create_server')
        }}
      </q-btn>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.ServerDeployCard {
}

.title-area {
  width: 1230px;
  text-align: left;
  color: $primary;
  font-size: large;
  font-weight: bold;
}

.stepper {
  width: 1230px;
}

.section {
  margin-bottom: 30px;
  padding: 10px 20px;
  border: 1px solid $grey-4;
  border-radius: 5px;
}

.summarize-section {
  margin-bottom: 30px;
  padding: 10px 20px;
  border: 1.5px solid $primary;
  border-radius: 5px;
}

.section-title {
  padding-bottom: 15px;
}

.item-row {
  padding: 5px 0;
}

.item-title {
  text-align: left;
  padding-right: 50px;
  min-width: 250px;
}

.item-title-narrow {
  text-align: left;
  padding-right: 50px;
  min-width: 130px;
}

.radio {
  margin-bottom: 5px;
  padding: 0 10px;
}

.btn-selected {
  box-shadow: 0 4px 8px 0 $primary, 0 6px 20px 0 $primary;
}
</style>
