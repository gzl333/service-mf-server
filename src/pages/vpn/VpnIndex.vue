<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter  */ } from 'vue-router'
import { i18n } from 'boot/i18n'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import PasswordToggle from 'components/ui/PasswordToggle.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
const route = useRoute()
// const router = useRouter()

// // 加载vpnTable
// if (store.tables.userVpnTable.status === 'init') {
//   console.log('!')
//   store.loadUserVpnTable()
// }

// 筛选datacenter的关键字
const filter = ref('')

// 筛选后的datacenter结果
const datacentersFiltered = computed(() => store.tables.dataCenterTable.allIds.filter(dataCenterId => (store.tables.dataCenterTable.byId[dataCenterId]?.status.code === 1) && (store.tables.dataCenterTable.byId[dataCenterId].name.includes(filter.value) || store.tables.dataCenterTable.byId[dataCenterId].name_en.toLowerCase().includes(filter.value.toLowerCase()))).map(a => a).sort((a, b) => a.localeCompare(b)))

// (1)tab初始状态
const tabDataCenter = ref('') // dataCenterId
const tabService = ref('') // serviceId

// (2)tab选择默认项的方法
const chooseTabDataCenter = () => {
  tabDataCenter.value = route.query.datacenter as string || datacentersFiltered.value[0]
}
const chooseTabService = () => {
  tabService.value = route.query.service as string || store.tables.dataCenterTable.byId[tabDataCenter.value]?.services[0]
}

// (3)setup时调用一次，table已加载时进入页面要选一次默认值
chooseTabDataCenter()
chooseTabService()

// (4)dataCenterTable变化，filter变化时，横向tab默认选择: 指定datacenter或者第一项，
watch([store.tables.dataCenterTable.allIds, filter], chooseTabDataCenter)

// (5)serviceTable变化时， 竖向tab选择：指定service或者services里第一项
// ?直接watch serviceTable不起作用。有些table可以，有些不可以。
const servicesCurrentDataCenter = computed(() => store.tables.dataCenterTable.byId[tabDataCenter.value]?.services)
watch(servicesCurrentDataCenter, chooseTabService)

// (6)点击tabDatacenter， tabDataCenter变化，忽略指定项， 选择service第一项
watch(tabDataCenter, () => {
  tabService.value = store.tables.dataCenterTable.byId[tabDataCenter.value]?.services[0]
})

// 全部vpn对象
const vpn = computed(() => store.tables.userVpnTable.byId[tabService.value])

// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()

const gotoManualVpn = () => {
  // 中文访问/manual 英文访问/manual/en
  const url = computed(() => location.origin + (i18n.global.locale === 'zh' ? '/manual/guide/server/vpn/' : '/manual/en/guide/server/vpn/'))
  window.open(url.value)
}
</script>

<template>
  <div class="VpnIndex">
    <q-scroll-area style="height: calc(100vh - 60px);">
      <div class="column">

        <!--      <div class="col-auto">-->
        <!--        <div class="row justify-center">-->
        <!--          <global-header-content class="content-fixed-width"/>-->
        <!--        </div>-->
        <!--      </div>-->

        <!--      <q-separator/>-->

        <div class="col-auto">
          <div class="row justify-center">
            <!--          <div class="col"/>-->
            <div class="content-fixed-width">
              <div class="row">
                <div class="text-h6 q-pt-lg q-px-none">
                  VPN
                </div>
              </div>

              <div class="row">
                <div class="col">

                  <div v-if="datacentersFiltered.length === 0" class="row full-height items-center">
                    <div class="col">{{ tc('pages.vpn.VpnIndex.no_results') }}</div>
                  </div>

                  <q-tabs
                    v-else
                    v-model="tabDataCenter"
                    indicator-color="primary"
                    active-color="primary"
                    align="left"
                    inline-label
                  >
                    <q-tab
                      v-for="id in datacentersFiltered"
                      :key="id"
                      class="q-px-none q-py-md q-mr-md wrap"
                      :name="id"
                      icon="vpn_lock"
                      :ripple="false"
                      no-caps
                    >
                      <div v-if="i18n.global.locale === 'zh'"
                           style="max-width: 200px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                        {{ store.tables.dataCenterTable.byId[id].name }}
                      </div>
                      <div v-else
                           style="max-width: 200px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                        {{ store.tables.dataCenterTable.byId[id].name_en }}
                        <!--                      <div v-for="line in store.tables.dataCenterTable.byId[id].name_en.split(',')" :key="line">-->
                        <!--                        {{ line }}-->
                        <!--                      </div>-->
                      </div>
                    </q-tab>
                  </q-tabs>
                </div>

<!--                <div class="col-2">-->
<!--                  <div class="row full-height items-center">-->
<!--                    <q-input class="col" dense outlined v-model="filter" :label="tc('pages.vpn.VpnIndex.org_filter')"-->
<!--                             stack-label>-->
<!--                      <template v-slot:prepend>-->
<!--                        <q-icon name="search"/>-->
<!--                      </template>-->
<!--                      <template v-slot:append v-if="filter">-->
<!--                        <q-icon name="close" @click="filter = ''" class="cursor-pointer"/>-->
<!--                      </template>-->
<!--                    </q-input>-->
<!--                  </div>-->
<!--                </div>-->

              </div>
            </div>
          </div>
        </div>

        <q-separator/>

        <div class="col-auto q-pt-xl">
          <div class="row justify-center">
            <div class="content-fixed-width">

              <div v-if="datacentersFiltered.length !== 0" class="row">

                <div class="col-auto">
                  <q-tabs
                    v-model="tabService"
                    vertical
                    active-color="primary"
                    active-bg-color="grey-2"
                  >
                    <q-tab
                      v-for="serviceId in store.tables.dataCenterTable.byId[tabDataCenter]?.services.filter(serviceId => store.tables.serviceTable.byId[serviceId]?.status === 'enable')"
                      :key="serviceId"
                      :name="serviceId"
                      class="q-pl-none"
                      style="justify-content:initial; text-align: left; font-weight: bold;"
                      :ripple="false"
                      no-caps
                    >
                      {{
                        i18n.global.locale === 'zh' ?
                          store.tables.serviceTable.byId[serviceId]?.name :
                          store.tables.serviceTable.byId[serviceId]?.name_en
                      }}
                    </q-tab>
                  </q-tabs>
                </div>

                <q-separator vertical/>

                <div v-if="store.tables.dataCenterTable.byId[tabDataCenter]?.services.length === 0">
                  {{ tc('pages.vpn.VpnIndex.no_vpn_service') }}
                </div>

                <div class="col">
                  <q-tab-panels
                    v-model="tabService"
                    animated
                    vertical
                    transition-prev="jump-up"
                    transition-next="jump-up"
                  >

                    <q-tab-panel
                      v-for="serviceId in store.tables.dataCenterTable.byId[tabDataCenter]?.services.filter(serviceId => store.tables.serviceTable.byId[serviceId]?.status === 'enable')"
                      :key="serviceId"
                      :name="serviceId"
                      class="bg-grey-2 overflow-hidden q-py-none"
                      style="min-height: 192px;"
                    >

                      <div
                        v-if="!store.tables.userVpnTable.byId[tabService] || !store.tables.serviceTable.byId[tabService].need_vpn"
                      >
                        <div v-if="!store.tables.serviceTable.byId[tabService].need_vpn">
                          {{ tc('pages.vpn.VpnIndex.no_need_vpn') }}
                        </div>

                        <div v-else>
                          {{ tc('pages.vpn.VpnIndex.no_vpn_detail') }}
                        </div>

                      </div>

                      <div v-else>

                        <div class="row items-center" style="height: 48px">
                          <div class="col-2 text-grey">
                            VPN {{ tc('pages.vpn.VpnIndex.account_status') }}
                          </div>

                          <div class="col-shrink row items-center">
                            <q-toggle
                              :model-value="vpn.active"
                              checked-icon="check"
                              unchecked-icon="clear"
                              :color="vpn.active ? 'light-green' : 'red'"
                              keep-color
                              @click="store.toggleVpnStatus({serviceId: vpn.id})"
                            >
                              {{
                                vpn.active ? tc('pages.vpn.VpnIndex.activated') : tc('pages.vpn.VpnIndex.deactivated')
                              }}
                            </q-toggle>
                          </div>

                          <!--                          <div v-if="vpn.active" class="col-shrink row items-center">-->
                          <!--                            <q-icon name="check_circle" color="light-green" size="sm"/>-->
                          <!--                            {{ tc('pages.vpn.VpnIndex.activated') }}-->
                          <!--                          </div>-->

                          <!--                          <div v-else class="col-shrink row items-center">-->
                          <!--                            <q-icon name="cancel" color="red" size="sm"/>-->
                          <!--                            {{ tc('pages.vpn.VpnIndex.deactivated') }}-->
                          <!--                          </div>-->
                        </div>

                        <div v-if="vpn.active">
                          <div class="row items-center" style="height: 48px">
                            <div class="col-2 text-grey">
                              VPN {{ tc('pages.vpn.VpnIndex.user_name') }}
                            </div>
                            <div class="col">
                              {{ vpn?.username }}
                              <q-btn
                                class="col-shrink q-px-xs text-primary" flat icon="content_copy" size="sm"
                                @click="clickToCopy(vpn?.username || '')">
                                <q-tooltip>
                                  {{ tc('pages.vpn.VpnIndex.copy') }}
                                </q-tooltip>
                              </q-btn>
                            </div>
                          </div>

                          <div class="row items-center" style="height: 48px">
                            <div class="col-2 text-grey">
                              VPN {{ tc('pages.vpn.VpnIndex.password') }}
                            </div>

                            <div class="col-shrink">

                              <div class="row">
                                <PasswordToggle style="max-width: 200px; min-width: 32px;" :text="vpn?.password || ''"/>

                                <q-btn class="q-px-xs" flat color="primary" icon="content_copy" size="sm"
                                       @click="clickToCopy(vpn?.password || '', true)">
                                  <q-tooltip>
                                    {{ tc('pages.vpn.VpnIndex.copy') }}
                                  </q-tooltip>
                                </q-btn>
                              </div>
                            </div>

                          </div>

                          <div class="row items-center" style="height: 48px">
                            <div class="col-2 text-grey">
                              VPN {{ tc('pages.vpn.VpnIndex.configuration_file') }}
                            </div>
                            <div class="col">
                              <q-btn :label="tc('pages.vpn.VpnIndex.download')" class=" " color="primary" padding="none"
                                     dense flat no-caps
                                     @click="store.fetchConfig(tabService)"/>
                            </div>
                          </div>

                          <!--                          <div class="row items-center" style="height: 48px">-->
                          <!--                            <div class="col-2 text-grey">-->
                          <!--                              VPN {{ tc('pages.vpn.VpnIndex.ca_certificate') }}-->
                          <!--                            </div>-->
                          <!--                            <div class="col">-->
                          <!--                              <q-btn :label="tc('pages.vpn.VpnIndex.download')" class="" color="primary" padding="none"-->
                          <!--                                     dense flat no-caps-->
                          <!--                                     @click="store.fetchCa(tabService)"/>-->
                          <!--                            </div>-->
                          <!--                          </div>-->

                          <div class="row items-center" style="height: 48px">
                            <div class="col">
                              <q-btn :label="tc('pages.vpn.VpnIndex.vpn_instruction')" class="" color="primary"
                                     padding="none" dense flat no-caps
                                     @click="gotoManualVpn"/>
                            </div>
                          </div>
                        </div>

                        <!--                        <div v-else>-->
                        <!--                          {{ tc('pages.vpn.VpnIndex.create_vpn_account') }}-->
                        <!--                        </div>-->

                      </div>

                    </q-tab-panel>

                  </q-tab-panels>

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </q-scroll-area>
  </div>
</template>

<style lang="scss" scoped>
.VpnIndex {
}
</style>
