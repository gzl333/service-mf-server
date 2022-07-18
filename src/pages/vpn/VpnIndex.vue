<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
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
// const route = useRoute()
// const router = useRouter()

// 筛选datacenter的关键字
const filter = ref('')

// 筛选后的datacenter结果
const datacentersFiltered = computed(() => store.tables.dataCenterTable.allIds.filter(dataCenterId => (store.tables.dataCenterTable.byId[dataCenterId].name.includes(filter.value) || store.tables.dataCenterTable.byId[dataCenterId].name_en.toLowerCase().includes(filter.value.toLowerCase()))).map(a => a).sort((a, b) => a.localeCompare(b)))

// (1)tab初始状态
const tabDataCenter = ref('') // dataCenterId
const tabService = ref('') // serviceId

// (2)tab选择默认项的方法
const chooseTabDataCenter = () => {
  tabDataCenter.value = datacentersFiltered.value[0]
}
const chooseTabService = () => {
  tabService.value = store.tables.dataCenterTable.byId[tabDataCenter.value]?.services[0]
}

// (3)setup时调用一次，table已加载时进入页面要选一次默认值
chooseTabDataCenter()
chooseTabService()

// (4)dataCenterTable变化，filter变化时：横向tab默认选择第一项，
watch([store.tables.dataCenterTable.allIds, filter], chooseTabDataCenter)

// (5)serviceTable或者tabDataCenter变化时： 属相tab选择services里第一项
// ?直接watch serviceTable不起作用。有些table可以，有些不可以。
const servicesCurrentDataCenter = computed(() => store.tables.dataCenterTable.byId[tabDataCenter.value]?.services)
watch([servicesCurrentDataCenter, tabDataCenter], chooseTabService)

// 全部vpn对象
const vpn = computed(() => store.tables.userVpnTable.byId[tabService.value])

// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()

const gotoManualVpn = () => {
  // 中文访问/manual 英文访问/manual/en
  const url = computed(() => location.origin + (i18n.global.locale === 'zh' ? '/manual/vpn' : '/manual/en/vpn'))
  window.open(url.value)
}
</script>

<template>
  <div class="VpnIndex">
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

            <div class="row" style="height: 64px">
              <div class="col">

                <div v-if="datacentersFiltered.length === 0" class="row full-height items-center">
                  <div class="col">{{ tc('pages.VpnIndex.no_results') }}</div>
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
                    class="q-px-none q-py-md q-mr-md"
                    :name="id"
                    icon="vpn_lock"
                    :label="i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[id].name : store.tables.dataCenterTable.byId[id].name_en"
                    :ripple="false"
                    no-caps
                  />
                </q-tabs>
              </div>

              <div class="col-2">
                <div class="row full-height items-center">
                  <q-input class="col" dense outlined v-model="filter" :label="tc('pages.VpnIndex.org_filter')" stack-label>
                    <template v-slot:prepend>
                      <q-icon name="search"/>
                    </template>
                    <template v-slot:append v-if="filter">
                      <q-icon name="close" @click="filter = ''" class="cursor-pointer"/>
                    </template>
                  </q-input>
                </div>
              </div>

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
                    v-for="serviceId in store.tables.dataCenterTable.byId[tabDataCenter]?.services"
                    :key="serviceId" :name="serviceId"
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

              <div v-if="store.tables.dataCenterTable.byId[tabDataCenter]?.services.length === 0">
                {{ tc('pages.VpnIndex.no_vpn_service') }}
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
                    v-for="serviceId in store.tables.dataCenterTable.byId[tabDataCenter]?.services"
                    :key="serviceId" :name="serviceId"
                    class="bg-grey-2 overflow-hidden q-py-none"
                    style="min-height: 192px;"
                  >

                    <div
                      v-if="!store.tables.userVpnTable.allIds.includes(tabService) ||
                      !store.tables.serviceTable.byId[tabService].need_vpn"
                    >
                      <div v-if="!store.tables.serviceTable.byId[tabService].need_vpn">
                        {{ tc('pages.VpnIndex.no_need_vpn') }}
                      </div>

                      <div v-else>
                        {{ tc('pages.VpnIndex.no_vpn_detail') }}
                      </div>

                    </div>

                    <div v-else>

                      <div class="row items-center" style="height: 48px">
                        <div class="col-2 text-grey">
                          VPN {{ tc('pages.VpnIndex.account_status') }}
                        </div>

                        <div v-if="vpn.active" class="col-shrink row items-center">
                          <q-icon name="check_circle" color="light-green" size="sm"/>
                          {{ tc('pages.VpnIndex.activated') }}
                        </div>

                        <div v-else class="col-shrink row items-center">
                          <q-icon name="cancel" color="red" size="sm"/>
                          {{ tc('pages.VpnIndex.deactivated') }}
                        </div>
                      </div>

                      <div v-if="vpn.active">
                        <div class="row items-center" style="height: 48px">
                          <div class="col-2 text-grey">
                            VPN {{ tc('pages.VpnIndex.user_name') }}
                          </div>
                          <div class="col">
                            {{ vpn?.username }}
                            <q-btn
                              class="col-shrink q-px-xs text-primary" flat icon="content_copy" size="sm"
                              @click="clickToCopy(vpn?.username)">
                              <q-tooltip>
                                {{ tc('pages.VpnIndex.copy') }}
                              </q-tooltip>
                            </q-btn>
                          </div>
                        </div>

                        <div class="row items-center" style="height: 48px">
                          <div class="col-2 text-grey">
                            VPN {{ tc('pages.VpnIndex.password') }}
                          </div>

                          <div class="col-shrink">

                            <div class="row">
                              <PasswordToggle style="max-width: 200px; min-width: 32px;" :text="vpn?.password"/>

                              <q-btn class="q-px-xs" flat color="primary" icon="content_copy" size="sm"
                                     @click="clickToCopy(vpn?.password, true)">
                                <q-tooltip>
                                  {{ tc('pages.VpnIndex.copy') }}
                                </q-tooltip>
                              </q-btn>
                            </div>
                          </div>

                        </div>

                        <div class="row items-center" style="height: 48px">
                          <div class="col-2 text-grey">
                            VPN {{ tc('pages.VpnIndex.configuration_file') }}
                          </div>
                          <div class="col">
                            <q-btn :label="tc('pages.VpnIndex.download')" class=" " color="primary" padding="none" dense flat
                                   @click="store.fetchConfig(tabService)"/>
                          </div>
                        </div>

                        <div class="row items-center" style="height: 48px">
                          <div class="col-2 text-grey">
                            VPN {{ tc('pages.VpnIndex.ca_certificate') }}
                          </div>
                          <div class="col">
                            <q-btn :label="tc('pages.VpnIndex.download')" class="" color="primary" padding="none" dense flat
                                   @click="store.fetchCa(tabService)"/>
                          </div>
                        </div>

                        <div class="row items-center" style="height: 48px">
                          <div class="col">
                            <q-btn :label="tc('pages.VpnIndex.vpn_instruction')" class="" color="primary" padding="none" dense flat
                                   @click="gotoManualVpn"/>
                          </div>
                        </div>
                      </div>

                      <div v-else>
                        {{ tc('pages.VpnIndex.create_vpn_account') }}
                      </div>

                    </div>

                  </q-tab-panel>

                </q-tab-panels>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.VpnIndex {
}
</style>
