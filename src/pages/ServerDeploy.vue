<script setup lang="ts">
import { ref, computed, watch/* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter  */ } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'

import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'
import OsLogo from 'components/ui/OsLogo.vue'

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
// const router = useRouter()

// 预付最大月份
const MAX_MONTHS = 6

// 是否允许使用后付费模式
// 目前判断个人账户或者项目组账户余额大于0
const isAllowPostpaid = computed(() => {
  if (selectionOwner.value === 'group') {
    return Number(store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[selectionGroup.value]?.balance]?.balance) > 0
  } else {
    return Number(store.items?.personalBalance) > 0
  }
})

// dom元素
const input = ref<HTMLElement>()

// const groupId = route.query.group as string
// const serviceId = route.query.service as string

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
// const selectionSystemDisk = ref(0)
// const selectionDataDisk = ref(0)

// 询价对象
const currentPrice = ref<{ original: string; trade: string }>({
  original: '0',
  trade: '0'
})
// 根据selection进行询价
watch([selectionPayment, selectionPeriod, selectionFlavor, selectionNetwork], async () => {
  // prepaid时才询价
  if (selectionPayment.value === 'prepaid') {
    // todo try...catch...
    // 发出询价请求
    const respGetPrice = await api.server['describe-price'].getDescribePrice({
      query: {
        resource_type: 'vm',
        pay_type: selectionPayment.value,
        period: selectionPeriod.value,
        flavor_id: selectionFlavor.value,
        external_ip: store.tables.serviceNetworkTable.byLocalId[`${selectionService.value}-${selectionNetwork.value}`].public
      }
    })

    currentPrice.value = respGetPrice.data.price
  }
})

/* table 进入页面过程中选择默认项 */

/* 分为显示和选择动作两部分。
* 显示部分在标签里进行逻辑判断，哪些显示，哪些不显示
* 选择动作在ts部分，selection真正选择了哪些值 */

// selection默认选择 (2)
const chooseOwner = () => {
  selectionOwner.value = route.query.group ? 'group' : 'personal' // query传递groupId的话则选择为项目组使用
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
  selectionImage.value = flavors.value[0]?.id || ''
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
  selectionNetwork.value = privateNetworks.value[0]?.id || publicNetworks.value[0]?.id || ''
  selectionImage.value = images.value[0]?.id || ''
  selectionFlavor.value = flavors.value[0]?.id || ''
})
/* 在table都加载后，3个selection，随着service变化选择默认项 */

</script>

<template>
  <div class="ServerDeploy">

    <q-scroll-area style="height: calc(100vh - 60px);">

      <div class="row justify-center" style="padding-bottom: 200px;">
        <div class="content-fixed-width column">

          <div class="col-auto q-py-xl row items-center">
            <q-btn class="col-auto" flat dense color="primary" icon="arrow_back_ios" size="xl"/>
            <div class="col-auto text-h4 text-primary">
              Deploy New Server
            </div>
          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-md text-h6">
              Server Owner
            </div>
            <div class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionOwner === 'personal' ? 'shadow-14' : 'bg-grey-1'"
                :color="selectionOwner === 'personal' ? 'white' : 'grey-4'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionOwner = 'personal'"
              >
                <div class="column items-center justify-center q-pa-md"
                     style="width: 250px;height: 150px;">

                  <div class="col-7 text-black">
                    Personal Account
                  </div>
                  <div class="col-5 text-black">
                    New server will belong to your personal account.
                  </div>
                </div>
              </q-btn>

              <q-btn
                :class="selectionOwner === 'group' ? 'shadow-14' : 'bg-grey-1'"
                :color="selectionOwner === 'group' ? 'white' : 'grey-4'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionOwner = 'group'"
              >
                <div class="column items-center justify-center q-pa-md"
                     style="width: 250px;height: 150px;">

                  <div class="col-7 text-black">
                    Group Account
                  </div>
                  <div class="col-5 text-black">
                    New server will belong to one of your group accounts.
                  </div>
                </div>
              </q-btn>

            </div>
          </div>

          <Transition>
            <div v-if="selectionOwner === 'group'" class="col-auto q-py-lg">
              <div class="q-py-md text-h6">
                Group
              </div>
              <div class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionGroup === group.id ? 'shadow-14' : 'bg-grey-1'"
                  :color="selectionGroup === group.id ? 'white' : 'grey-4'"
                  v-for="group in groups"
                  :val="group.id"
                  :key="group.id"
                  outline
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionGroup = group.id"
                >
                  <div class="column items-center justify-center q-pa-md"
                       style="width: 250px;height: 150px;">

                    <div class="col-7 text-black">
                      {{ group.name }}
                    </div>
                    <div class="col-5 text-black">
                      Your group.
                    </div>
                  </div>
                </q-btn>
              </div>
            </div>
          </Transition>

          <div class="col-auto q-py-lg">
            <div class="q-py-md text-h6">
              Payment Method
            </div>
            <div class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionPayment === 'prepaid' ? 'shadow-14' : 'bg-grey-1'"
                :color="selectionPayment === 'prepaid' ? 'white' : 'grey-4'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionPayment = 'prepaid'"
              >
                <div class="column items-center justify-center q-pa-md"
                     style="width: 250px;height: 150px;">

                  <div class="col-7 text-black">
                    Prepaid
                  </div>
                  <div class="col-5 text-black">
                    Server will deliver after payment.
                  </div>
                </div>
              </q-btn>

              <q-btn
                :class="selectionPayment === 'postpaid' ? 'shadow-14' : 'bg-grey-1'"
                :color="selectionPayment === 'postpaid' ? 'white' : 'grey-4'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionPayment = 'postpaid'"
              >
                <div class="column items-center justify-center q-pa-md"
                     style="width: 250px;height: 150px;">

                  <div class="col-7 text-black">
                    Postpaid
                  </div>
                  <div class="col-5 text-black">
                    Server will deliver now.
                  </div>
                </div>
              </q-btn>

            </div>
          </div>

          <Transition>
            <div v-if="selectionPayment === 'prepaid'" class="col-auto q-py-lg">
              <div class="q-py-md text-h6">
                Usage Period
              </div>
              <div class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionPeriod === month ? 'shadow-14' : 'bg-grey-1'"
                  :color="selectionPeriod === month ? 'white' : 'grey-4'"
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
                       style="width: 150px;height: 30px;">

                    <div class="col-auto text-black">
                      {{ month }} months
                    </div>

                  </div>
                </q-btn>
              </div>
            </div>
          </Transition>

          <div class="col-auto q-py-lg">
            <div class="q-py-md text-h6">
              Service Unit
            </div>

            <div v-for="dataCenter in dataCenters" :key="dataCenter.id" class="q-pb-lg">
              <div class="row items-center" :class="selectionDatacenter === dataCenter.id ? 'text-primary' : ''">
                {{ dataCenter.name }}
              </div>

              <div v-if="dataCenter.services.length === 0" class="row items-center">
                No service available at this organisation.
              </div>

              <div v-else class="row items-center q-gutter-x-lg">
                <q-btn
                  :class="selectionService === service.id ? 'shadow-14' : 'bg-grey-1'"
                  :color="selectionService === service.id ? 'white' : 'grey-4'"
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
                       style="width: 250px;height: 80px;">

                    <div class="col-6 text-black">
                      {{ service.name }}
                    </div>

                    <div class="col-6">
                      <CloudPlatformLogo class="col-auto" :platform-name="service.service_type"/>
                    </div>

                  </div>
                </q-btn>
              </div>

            </div>
          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-md text-h6">
              Operating System
            </div>

            <div v-if="images.length === 0" class="row items-center">
              No OS available at this service unit.
            </div>

            <div v-else class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionImage === image.id ? 'shadow-14' : 'bg-grey-1'"
                :color="selectionImage === image.id ? 'white' : 'grey-4'"
                v-for="image in images"
                :val="image.id"
                :key="image.id"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionImage = image.id"
              >
                <div class="column items-center justify-center q-pa-md"
                     style="width: 250px;height: 150px;">

                  <div class="col-7 row items-center">
                    <OsLogo class="col" :os-name="image.name" size="60px"/>
                  </div>
                  <div class="col-5 row items-center">
                    <div class="text-black q-pa-none">{{ image.name.slice(0, 60) }}</div>
                  </div>
                </div>
              </q-btn>
            </div>
          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-md text-h6">
              Server Network
            </div>

            <div v-if="publicNetworks.length === 0 && privateNetworks.length === 0" class="row items-center">
              No networks available at this service unit.
            </div>

            <div v-if="privateNetworks.length > 0" class="q-pb-lg">
              <div class="row">Private Networks</div>
              <div class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionNetwork === network.id ? 'shadow-14' : 'bg-grey-1'"
                  :color="selectionNetwork === network.id ? 'white' : 'grey-4'"
                  v-for="network in privateNetworks"
                  :val="network.id"
                  :key="network.id"
                  outline
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionNetwork = network.id"
                >
                  <div class="column items-center justify-center"
                       style="width: 150px;height: 50px;">

                    <div class="text-black">
                      {{ network.segment }}
                    </div>

                  </div>
                </q-btn>
              </div>
            </div>

            <div v-if="publicNetworks.length > 0" class="q-pb-lg">
              <div class="row">Public Networks</div>
              <div class="row items-center q-gutter-lg">
                <q-btn
                  :class="selectionNetwork === network.id ? 'shadow-14' : 'bg-grey-1'"
                  :color="selectionNetwork === network.id ? 'white' : 'grey-4'"
                  v-for="network in publicNetworks"
                  :val="network.id"
                  :key="network.id"
                  outline
                  dense
                  no-caps
                  :ripple="false"
                  @click="selectionNetwork = network.id"
                >
                  <div class="column items-center justify-center"
                       style="width: 150px;height: 50px;">

                    <div class="text-black">
                      {{ network.name }}
                    </div>

                  </div>
                </q-btn>
              </div>
            </div>

          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-md text-h6">
              Server Size
            </div>

            <div v-if="flavors.length === 0" class="row items-center">
              No flavors available at this service unit.
            </div>

            <div v-else class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionFlavor === flavor.id ? 'shadow-14' : 'bg-grey-1'"
                :color="selectionFlavor === flavor.id ? 'white' : 'grey-4'"
                v-for="flavor in flavors"
                :val="flavor.id"
                :key="flavor.id"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionFlavor = flavor.id"
              >
                <div class="column items-center justify-center"
                     style="width: 150px;height: 50px;">
                  <div class="text-black">
                    {{ `${flavor.vcpus}cores/${flavor.ram / 1024}GB` }}
                  </div>
                </div>
              </q-btn>
            </div>
          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-md text-h6">
              Remark
            </div>
            <div class="row">
              <q-input class="col-8" ref="input" v-model="inputRemarks" maxlength="100" dense outlined counter/>
            </div>
          </div>

        </div>
      </div>

    </q-scroll-area>

    <q-page-sticky expand position="bottom">
      <div class="column items-center justify-center full-width bg-grey-1 shadow-10">
        <div class="col-auto content-fixed-width row items-center justify-between">

          <div class="col-10">
            <div v-if="selectionOwner === 'group'" class="row item-row items-center">
              <div class="col-2 item-title-narrow text-grey">
                {{ tc('components.server.ServerDeployCard.group') }}
              </div>
              <div class="col">
                <div v-if="selectionGroup !== ''">
                  {{ store.tables.groupTable.byId[selectionGroup]?.name }}
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
                  selectionPayment === 'prepaid' ? tc('components.server.ServerDeployCard.monthly_prepaid') : tc('components.server.ServerDeployCard.pay_as_go')
                }}
              </div>
            </div>

            <div v-if="selectionPayment === 'prepaid'" class="row item-row items-center">
              <div class="col-2 item-title-narrow text-grey">
                {{ tc('components.server.ServerDeployCard.prepaid_period') }}
              </div>
              <div class="col"
                   :class="(selectionPeriod <= 0 || selectionPeriod > MAX_MONTHS || !Number.isInteger(selectionPeriod)) ? 'text-red' : ''">
                {{ selectionPeriod }} {{ tc('components.server.ServerDeployCard.months') }}
              </div>
            </div>

            <div class="row item-row items-center">
              <div class="col-2 item-title-narrow text-grey">
                {{ tc('components.server.ServerDeployCard.service_node') }}
              </div>
              <div class="col">
                <div
                  v-if="store.tables.dataCenterTable.byId[selectionDatacenter] && store.tables.serviceTable.byId[selectionService]"
                  class="row items-center">

                  <div class="col-auto">
                    {{
                      i18n.global.locale === 'zh' ?
                        `${store.tables.dataCenterTable.byId[selectionDatacenter]?.name} - ${store.tables.serviceTable.byId[selectionService]?.name}` :
                        `${store.tables.dataCenterTable.byId[selectionDatacenter]?.name_en} - ${store.tables.serviceTable.byId[selectionService]?.name_en}`
                    }}
                  </div>

                  <CloudPlatformLogo class="col-auto"
                                     :platform-name="store.tables.serviceTable.byId[selectionService]?.service_type"/>

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
                  v-if="store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.name">
                  {{
                    store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.public ? tc('components.server.ServerDeployCard.public_ip_segment') : tc('components.server.ServerDeployCard.private_ip_segment')
                  }}: {{ store.tables.serviceNetworkTable.byLocalId[`${selectionService}-${selectionNetwork}`]?.name }}
                </div>
                <div v-else class="text-red">{{ tc('components.server.ServerDeployCard.select_network') }}</div>
              </div>
            </div>

            <div class="row item-row items-center">
              <div class="col-2 item-title-narrow text-grey">
                {{ tc('components.server.ServerDeployCard.operating_system') }}
              </div>
              <div class="col">
                <div v-if="store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name">
                  <OsLogo
                    :os-name="store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name"
                    size="sm"
                  />

                  {{ store.tables.serviceImageTable.byLocalId[`${selectionService}-${selectionImage}`]?.name }}

                </div>
                <div v-else class="text-red">{{
                    tc('components.server.ServerDeployCard.select_operating_system')
                  }}
                </div>
              </div>
            </div>

            <div class="row item-row items-center">
              <div class="col-2 item-title-narrow text-grey">
                CPU/{{ tc('components.server.ServerDeployCard.memory') }}
              </div>
              <div class="col ">
                <div v-if="store.tables.fedFlavorTable.byId[selectionFlavor]">
                  {{
                    `${store.tables.fedFlavorTable.byId[selectionFlavor].vcpus} ${tc('components.server.ServerDeployCard.cores')}/${store.tables.fedFlavorTable.byId[selectionFlavor].ram / 1024}GB`
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

          <div v-if="selectionPayment === 'prepaid'" class="col-2">
            {{ currentPrice }}
          </div>
        </div>
      </div>
    </q-page-sticky>

  </div>
</template>

<style lang="scss" scoped>
.ServerDeploy {
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
