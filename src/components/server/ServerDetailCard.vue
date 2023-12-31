<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { navigateToUrl } from 'single-spa'
import { DiskInterface, useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import ServerStatus from 'components/server/ServerStatus.vue'
import GroupRoleChip from 'components/group/GroupRoleChip.vue'
import PasswordToggle from 'components/ui/PasswordToggle.vue'
import OsLogo from 'components/ui/OsLogo.vue'
import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'
import DiskTable from 'components/disk/DiskTable.vue'

const props = defineProps({
  serverId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
const route = useRoute()
const router = useRouter()

// url传参
const show = route.query.show as 'server' | 'disk' | undefined
// 子tab展示哪个部分
const tab = ref(show ?? 'server')

// 未传参id时，跳转处理
// if (!props.serverId) {
//   void $router.push({ path: '/my/personal/server' })
// }

// server info
const server = computed(() => props.isGroup ? store.tables.groupServerTable.byId[props.serverId] : store.tables.personalServerTable.byId[props.serverId])
// store.loadSingleServer({ serverId: props.serverId, isGroup: props.isGroup })

// load disk info
const disks = ref<DiskInterface[]>([])
const isLoadingDisk = ref(false)

// top-lever await trick
onMounted(async () => {
  isLoadingDisk.value = true
  const serverDetail = (await api.server.server.getServerId({ path: { id: props.serverId } })).data.server
  for (const disk of serverDetail.attached_disks) {
    const diskDetail = (await api.server.disk.getDiskId({ path: { id: disk.id } })).data
    disks.value.push(diskDetail)
  }
  isLoadingDisk.value = false
})

// service info
const service = computed(() => store.tables.serviceTable.byId[server.value?.service.id || ''])
// quota info
// const quota = computed(() => props.isGroup ? store.tables.groupQuotaTable.byId[server.value.user_quota] : store.tables.personalQuotaTable.byId[server.value?.user_quota])
// // vpn info
// const vpn = computed(() => store.tables.userVpnTable.byId[server.value?.service.id])

// group info
const group = computed(() => store.tables.groupTable.byId[server.value?.vo_id || ''])

// lock toggle
const toggle = ref(computed(() => server.value?.lock === 'lock-operation'))

// 当前用户在group内的角色
const myRole = computed(() => store.tables.groupTable.byId[server.value?.vo_id || '']?.myRole || 'member')

// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()

// const gotoManualVpn = () => {
//   // 中文访问/manual 英文访问/manual/en
//   const url = computed(() => location.origin + (i18n.global.locale === 'zh' ? '/manual/vpn' : '/manual/en/vpn'))
//   window.open(url.value)
// }

</script>

<template>
  <div class="ServerDetailCard">
    <div class="column items-center justify-center ">
      <div class="col">

        <div class="row items-center title-area">
          <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
                 @click="router.back()"/>
          <span v-if="isGroup">{{ tc('components.server.ServeDetailCard.group_server_detail') }}</span>
          <span v-else>{{ tc('components.server.ServeDetailCard.personal_server_detail') }}</span>
        </div>

        <!--直接从url进入本页面时，tables尚未载入，应显示loading界面。对取属性进行缓冲，不出现undefined错误-->
        <div class="row">

          <!--区分读取中和读取错误          -->
          <!--          <div v-if="!server || !service || (service?.need_vpn && !vpn) " class="col">-->
          <div v-if="!server" class="col">
            {{ tc('components.server.ServeDetailCard.notify_loading') }}
          </div>

          <div v-else class="col content-area">
            <div class="row justify-center items-start q-pt-md">
              <div class="col-4">
                <div class="row items-center q-pt-xs">
                  <q-btn
                    class="col-shrink text-h4 text-bold" flat no-caps padding="none" color="primary"
                    @click="clickToCopy(server.ipv4)">{{ server.ipv4 }}
                    <q-tooltip>
                      {{ tc('components.server.ServeDetailCard.copy') }}
                    </q-tooltip>
                    <!--创建时间距离当下小于1小时则打上new标记-->
                    <q-badge style="top:-10px;"
                             v-if="(new Date() - new Date(server.creation_time).getTime()) < 1000 * 60 * 60 * 1 "
                             color="light-green" floating transparent rounded align="middle">
                      new
                    </q-badge>
                  </q-btn>

                  <ServerStatus :server="server" :is-group="isGroup"/>

                </div>
                <div class="row q-pb-md items-center">
                  <!--                  <div class="col-2 text-grey">备注</div>-->
                  <div class="col-auto row">
                    <div class="col-auto"
                         style="max-width: 400px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                      {{ server.remarks }}
                      <q-tooltip>{{ tc('components.server.ServeDetailCard.remarks') }}</q-tooltip>
                    </div>

                    <q-btn v-if="!isGroup || isGroup && myRole!=='member'"
                           :disable="toggle"
                           class="col-shrink q-px-xs" flat dense icon="edit" size="sm" color="primary"
                           @click="store.editServerNoteDialog({serverId:server.id, isGroup})">
                      <q-tooltip>
                        {{ tc('components.server.ServeDetailCard.edit_remarks') }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>

              <div class="col q-gutter-lg">

                <q-toggle
                  style="margin-left: 10px;"
                  v-model="toggle"
                  checked-icon="lock"
                  unchecked-icon="lock_open"
                  color="light-green"
                  size="lg"
                  @click="store.toggleOperationLock( {isGroup:isGroup || false, serverId: serverId })"
                >
                  <q-tooltip v-if="server.lock === 'lock-operation'">
                    {{ tc('components.server.ServeDetailCard.server_operation_locked') }}
                  </q-tooltip>
                  <q-tooltip v-else>
                    {{ tc('components.server.ServeDetailCard.server_operation_unlocked') }}
                  </q-tooltip>
                </q-toggle>

                <q-btn :disable="!server.status"
                       unelevated flat padding="none" size="lg" :color="server.status===1?'primary':'grey-5'"
                       icon="computer"
                       @click="server.status===1?store.gotoVNC(server.id):''">
                  <q-tooltip v-if="server.status===1">
                    {{ tc('components.server.ServeDetailCard.remote_control') }}
                  </q-tooltip>
                  <q-tooltip v-else>
                    {{ tc('components.server.ServeDetailCard.power_remote_control') }}
                  </q-tooltip>
                </q-btn>

                <!--loading button-->
                <q-btn v-if="!server.status" :loading="server.status===-1" color="primary" flat>
                  <q-tooltip>
                    {{ tc('components.server.ServeDetailCard.loading') }}
                  </q-tooltip>
                </q-btn>

                <q-btn v-if="server.status && server.status !== 1"
                       :disable="server.lock === 'lock-operation'"
                       icon="play_arrow" text-color="primary"
                       unelevated flat padding="none" size="lg"
                       @click="store.serverOperationDialog({serverId: server.id, action: 'start', isGroup})">
                  <q-tooltip>
                    {{ tc('components.server.ServeDetailCard.power_on') }}
                  </q-tooltip>
                </q-btn>

                <q-btn v-if="server.status && server.status !== 5"
                       :disable="server.lock === 'lock-operation'"
                       icon="power_settings_new" text-color="primary"
                       unelevated flat padding="none" size="lg"
                       @click="store.serverOperationDialog({ serverId: server.id, action: 'shutdown', isGroup})">
                  <q-tooltip>
                    {{ tc('components.server.ServeDetailCard.power_off') }}
                  </q-tooltip>
                </q-btn>

                <q-btn v-if="server.status && server.status !== 5"
                       :disable="server.lock === 'lock-operation'"
                       icon="restart_alt" text-color="primary"
                       unelevated flat padding="none" size="lg"
                       @click="store.serverOperationDialog({ serverId: server.id, action: 'reboot', isGroup})">
                  <q-tooltip>
                    {{ tc('components.server.ServeDetailCard.restart') }}
                  </q-tooltip>
                </q-btn>

                <q-btn v-if="server.status && server.status !== 5"
                       :disable="server.lock === 'lock-operation'"
                       icon="power_off" text-color="primary"
                       unelevated flat padding="none" size="lg"
                       @click="store.serverOperationDialog({serverId: server.id, action: 'poweroff', isGroup})">
                  <q-tooltip>
                    {{ tc('components.server.ServeDetailCard.force_power_off') }}
                  </q-tooltip>
                </q-btn>

                <!--personal显示 || group不是member时显示-->

                <span v-if="!isGroup || isGroup && myRole!=='member'" class="q-gutter-lg">

                  <q-btn v-if="server.status"
                         :disable="server.lock === 'lock-operation'"
                         icon="build" text-color="primary"
                         unelevated flat padding="none" size="lg"
                         @click="store.triggerServerRebuildDialog({ serverId: server.id,  isGroup})">
                    <q-tooltip>
                      {{ tc('components.server.ServeDetailCard.rebuild_server') }}
                    </q-tooltip>
                  </q-btn>

                  <!--                  <q-btn v-if="server.status && server.status !== 1"-->
                  <!--                         :disable="server.lock === 'lock-operation'"-->
                  <!--                         icon="delete" text-color="red"-->
                  <!--                         unelevated flat padding="none" size="lg"-->
                  <!--                         @click="store.serverOperationDialog({ serverId: server.id, action: 'delete', isGroup, isJump: true})">-->
                  <!--                    <q-tooltip>-->
                  <!--                     {{ tc('components.server.ServeDetailCard.delete') }}-->
                  <!--                    </q-tooltip>-->
                  <!--                  </q-btn>-->

                  <q-btn v-if="server.status && server.status"
                         :disable="server.lock === 'lock-operation'"
                         icon="delete_forever" text-color="red"
                         unelevated flat padding="none" size="lg"
                         @click="store.serverOperationDialog({ serverId: server.id, action: 'delete_force', isGroup, isJump: true})">
                    <q-tooltip>
                      {{ tc('components.server.ServeDetailCard.delete') }}
                    </q-tooltip>
                  </q-btn>

                </span>
              </div>
            </div>

            <!--云主机概览结束-->

            <div class="column items-start q-py-none q-px-none">

              <div class="col-auto">
                <div class="row no-wrap justify-between items-center content-area">

                  <q-tabs
                    class="col-auto"
                    v-model="tab"
                    active-color="primary"
                    align="left"
                    inline-label
                  >

                    <q-tab class="q-px-none q-py-none q-mr-md"
                           no-caps
                           :ripple="false"
                           name="server"
                           icon="computer"
                           :label="tc('云主机信息')"
                           @click="navigateToUrl(isGroup ? `/my/server/group/server/detail/${server.id}?show=server` : `/my/server/personal/detail/${server.id}?show=server`)"/>

                    <q-tab class="q-px-none q-py-none q-mr-md"
                           no-caps
                           :ripple="false"
                           name="disk"
                           icon="mdi-harddisk"
                           :label="tc('已挂载云硬盘列表')"
                           @click="navigateToUrl(isGroup ? `/my/server/group/server/detail/${server.id}?show=disk` : `/my/server/personal/detail/${server.id}?show=disk`)"/>

                    <!--                    <q-tab class="q-px-none q-py-none q-mr-md"-->
                    <!--                           no-caps-->
                    <!--                           :ripple="false"-->
                    <!--                           name="server"-->
                    <!--                           icon="computer"-->
                    <!--                           :label="tc('云主机信息')"-->
                    <!--                    />-->

                    <!--                    <q-tab class="q-px-none q-py-none q-mr-md"-->
                    <!--                           no-caps-->
                    <!--                           :ripple="false"-->
                    <!--                           name="disk"-->
                    <!--                           icon="mdi-harddisk"-->
                    <!--                           :label="tc('已挂载云硬盘列表')"-->
                    <!--                    />-->

                  </q-tabs>

                  <div class="row justify-center items-end q-gutter-md">
                    <q-btn v-show="tab==='disk'"
                           class="col-shrink"
                           icon="add"
                           size="md"
                           unelevated
                           dense
                           no-caps
                           padding="xs"
                           color="primary"
                           @click="navigateToUrl(`/my/server/deploy/disk?service=${server?.service.id}${isGroup ? `&group=${group.id}` : ''}`)">
                      {{ tc('新建云硬盘') }}
                    </q-btn>

                    <q-btn v-show="tab==='disk'"
                           class="col-shrink"
                           icon="mdi-arrow-collapse"
                           size="md"
                           unelevated
                           dense
                           no-caps
                           padding="xs"
                           color="primary"
                           @click=store.mountDiskDialog(group,undefined,server)>
                      {{ tc('挂载云硬盘') }}
                    </q-btn>
                  </div>

                </div>

                <q-separator/>

              </div>
              <div class="col-auto content-area">
                <q-tab-panels v-model="tab">

                  <q-tab-panel class="q-pa-none overflow-hidden" name="server">

                    <div class="row justify-center q-py-lg">
                      <div class="col-4">

                        <div class="row q-pb-md items-center">
                          <div class="col-4 text-grey">{{
                              tc('components.server.ServeDetailCard.initial_os_username')
                            }}
                          </div>
                          <div class="col-shrink">
                            <div v-if="server?.default_user === null || server?.default_user===''">
                              {{ tc('components.server.ServeDetailCard.unavailable_from_service') }}
                            </div>
                            <div v-else>
                              {{ server.default_user }}
                              <q-btn
                                class="col-shrink q-px-xs" flat color="primary" icon="content_copy" size="sm"
                                @click="clickToCopy(server.default_user)">
                                <q-tooltip>
                                  {{ tc('components.server.ServeDetailCard.copy') }}
                                </q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-4 text-grey">{{
                              tc('components.server.ServeDetailCard.initial_os_password')
                            }}
                          </div>
                          <div class="col-shrink">
                            <div v-if="server?.default_password === null || server?.default_password===''">
                              {{ tc('components.server.ServeDetailCard.unavailable_from_service') }}
                            </div>

                            <div v-else class="row">
                              <PasswordToggle style="max-width: 200px; min-width: 32px;"
                                              :text="server?.default_password as string"/>

                              <q-btn class="q-px-xs" flat color="primary" icon="content_copy" size="sm"
                                     @click="clickToCopy(server?.default_password as string, true)">
                                <q-tooltip>
                                  {{ tc('components.server.ServeDetailCard.copy') }}
                                </q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </div>
                        <!--                以下两项依赖serviceTable-->
                        <div v-if="service" class="row q-pb-md items-center ">
                          <div class="col-4 text-grey ">{{ (tc('vpnInfo')) }}</div>
                          <div class="col-auto">
                            <q-btn v-if="service?.need_vpn" flat dense no-caps color="primary"
                                   @click="navigateToUrl(`/my/server/vpn?datacenter=${store.tables.serviceTable.byId[server.service.id]?.data_center.id}&service=${server.service.id}`)">
                              {{ tc('seeVpn') }}
                              <q-tooltip>
                                {{ tc('jumpToVpn') }}
                              </q-tooltip>
                            </q-btn>
                            <div v-else-if="!service?.need_vpn">{{ tc('vpnNotRequired') }}</div>
                            <!--                    <div v-else>{{ tc('vpnNotRequired') }}</div>-->
                          </div>
                        </div>

                        <div v-if="service" class="row q-pb-md items-center">
                          <div class="col-4 text-grey">{{ tc('components.server.ServeDetailCard.org') }}</div>
                          <div class="col">
                            {{
                              i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[service?.data_center.id]?.name : store.tables.dataCenterTable.byId[service?.data_center.id]?.name_en
                            }}
                          </div>
                        </div>

                        <!--                以下两项为server保存的信息-->
                        <div class="row q-pb-md items-center">
                          <div class="col-4 text-grey">{{ tc('components.server.ServeDetailCard.service_node') }}</div>
                          <div class="col"> {{
                              i18n.global.locale === 'zh' ? server.service.name : server.service.name_en
                            }}
                          </div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-4 text-grey">{{ tc('cloudPlatform') }}</div>
                          <div class="col">
                            <CloudPlatformLogo :platform-name="server.service.service_type" height="30px"
                                               width="155px"/>
                          </div>
                        </div>

                      </div>

                      <div class="col-4">

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.server_id') }}</div>
                          <div class="col">
                            {{ server.id }}
                            <q-btn class="q-px-xs" flat color="primary" icon="content_copy" size="sm"
                                   @click="clickToCopy(server.id)">
                              <q-tooltip>
                                复制
                              </q-tooltip>
                            </q-btn>
                          </div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">CPU</div>
                          <div class="col"> {{ server.vcpus }} {{ tc('countCore', server.vcpus) }}</div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{ tc('memory') }}</div>
                          <div class="col"> {{ server.ram }}GB</div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.network_type') }}</div>
                          <div class="col"> {{
                              server.public_ip ? tc('components.server.ServeDetailCard.public_network') : tc('components.server.ServeDetailCard.private_network')
                            }}
                          </div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{
                              tc('components.server.ServeDetailCard.operating_system')
                            }}
                          </div>
                          <div class="col">
                            <OsLogo :os-name="server.image"/>
                            {{ server.image }}
                          </div>
                        </div>

                        <div v-if="server.image_desc" class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{
                              tc('components.server.ServeDetailCard.system_specification')
                            }}
                          </div>
                          <div class="col"> {{ server.image_desc }}</div>
                        </div>

                      </div>

                      <div class="col-4">

                        <div v-if="isGroup" class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.group') }}</div>
                          <div class="col-8">
                            <q-btn flat dense color="primary" padding="none"
                                   :to="{path:  `/my/server/group/detail/${store.tables.groupTable.byId[server.vo_id].id}`}">
                              {{ store.tables.groupTable.byId[server.vo_id].name }}
                              <q-tooltip>
                                {{ tc('components.server.ServeDetailCard.group_detail') }}
                              </q-tooltip>
                            </q-btn>
                          </div>
                        </div>

                        <div v-if="isGroup" class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.my_role') }}</div>
                          <div class="col-shrink">
                            <group-role-chip :role="myRole"/>
                          </div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.creator') }}</div>
                          <div class="col-shrink">
                            {{ server.user.username }}
                          </div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.billing_type') }}</div>
                          <div v-if="server.pay_type === 'prepaid'" class="col">
                            {{ tc('components.server.ServeDetailCard.monthly_prepaid') }}
                          </div>
                          <div v-if="server.pay_type === 'postpaid'" class="col">
                            {{ tc('components.server.ServeDetailCard.pay_as_go') }}
                          </div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.create_time') }}</div>
                          <div class="col">
                            {{ new Date(server.creation_time).toLocaleString(i18n.global.locale as string) }}
                          </div>
                        </div>

                        <div class="row q-pb-md items-center">
                          <div class="col-3 text-grey">{{
                              tc('components.server.ServeDetailCard.expiration_time')
                            }}
                          </div>
                          <div class="col row items-center">
                            <div class="col-auto">
                              {{
                                server.expiration_time ? new Date(server.expiration_time).toLocaleString(i18n.global.locale as string) : tc('components.server.ServeDetailCard.long_term')
                              }}
                            </div>
                            <div v-if="server.pay_type === 'prepaid'" class="col-auto">
                              <q-btn v-if="!isGroup || store.tables.groupTable.byId[server.vo_id].myRole !== 'member'"
                                     color="primary" padding="none" icon="autorenew" :ripple="false" dense flat no-caps
                                     @click="store.renewOrderDialog(server.id, isGroup)">
                                {{ tc('components.server.ServeDetailCard.renewal') }}
                              </q-btn>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </q-tab-panel>

                  <q-tab-panel class="q-pa-none overflow-hidden" name="disk">
                    <disk-table :rows="disks" :is-loading="isLoadingDisk" :group="group"/>
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
.ServerDetailCard {
}

.title-area {
  width: 1230px;
  text-align: left;
  color: $primary;
  font-size: large;
  font-weight: bold;
}

.content-area {
  width: 1230px;
}

.ip-title {
  font-size: large;
  font-weight: bold;
}

.detail-item {
  padding-bottom: 10px;
}

.password-input {
  //top: -10px;
  //height: 10px;
  width: 175px;
}
</style>
