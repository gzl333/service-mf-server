<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { /* useRoute,  */useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'
import useGetOsIconName from 'src/hooks/useGetOsIconName'

import ServerStatus from 'components/server/ServerStatus.vue'
import GroupRoleChip from 'components/group/GroupRoleChip.vue'
import PasswordToggle from 'components/ui/PasswordToggle.vue'

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
// const route = useRoute()
const router = useRouter()

// todo 未传参id时，跳转处理
// if (!props.serverId) {
//   void $router.push({ path: '/my/personal/server' })
// }

// server info
const server = computed(() => props.isGroup ? store.tables.groupServerTable.byId[props.serverId] : store.tables.personalServerTable.byId[props.serverId])
// service info
const service = computed(() => store.tables.serviceTable.byId[server.value?.service])
// quota info
// const quota = computed(() => props.isGroup ? store.tables.groupQuotaTable.byId[server.value.user_quota] : store.tables.personalQuotaTable.byId[server.value?.user_quota])
// vpn info
const vpn = computed(() => store.tables.userVpnTable.byId[server.value?.service])

// lock toggle
const toggle = ref(computed(() => server.value.lock === 'lock-operation'))

// 当前用户在group内的角色
const myRole = computed(() => store.tables.groupTable.byId[server.value?.vo_id || '']?.myRole)

// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()

// 获取os的icon名称
const getOsIconName = useGetOsIconName()

const gotoManualVpn = () => {
  // 中文访问/manual 英文访问/manual/en
  const url = computed(() => location.origin + (i18n.global.locale === 'zh' ? '/manual/vpn' : '/manual/en/vpn'))
  window.open(url.value)
}

</script>

<template>
  <div class="ServerDetailCard">
    <div class="column items-center justify-center ">
      <div class="col">

        <div class="row items-center title-area">
          <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
                 @click="router.back()"/>
          <span v-if="isGroup">{{tc('components.server.ServeDetailCard.group_server_detail')}}</span>
          <span v-else>{{tc('components.server.ServeDetailCard.personal_server_detail')}}</span>
        </div>

        <!--直接从url进入本页面时，tables尚未载入，应显示loading界面。对取属性进行缓冲，不出现undefined错误-->
        <div class="row">

          <!--todo 区分读取中和读取错误          -->
          <!--          <div v-if="!server || !service || (service.need_vpn && !vpn) " class="col">-->
          <div v-if="!server || !service " class="col">
            {{tc('components.server.ServeDetailCard.notify_loading')}}
          </div>

          <div v-else class="col content-area">
            <div class="row justify-center items-start q-pt-md">
              <div class="col-4">
                <div class="row items-center q-pt-xs">
                  <q-btn
                    class="col-shrink text-h4 text-bold" flat no-caps padding="none" color="primary"
                    @click="clickToCopy(server.ipv4)">{{ server.ipv4 }}
                    <q-tooltip>
                      {{tc('components.server.ServeDetailCard.copy')}}
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
                  <div class="col-auto">
                    <span>
                      {{ server.remarks }}
                      <q-tooltip>{{tc('components.server.ServeDetailCard.remarks')}}</q-tooltip>
                    </span>

                    <q-btn v-if="!isGroup || isGroup && myRole!=='member'"
                           :disable="toggle"
                           class="col-shrink q-px-xs" flat dense icon="edit" size="sm" color="primary"
                           @click="store.editServerNoteDialog({serverId:server.id, isGroup})">
                      <q-tooltip>
                        {{tc('components.server.ServeDetailCard.edit_remarks')}}
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
                  @click="store.toggleOperationLock( {isGroup:isGroup, serverId: serverId })"
                >
                  <q-tooltip v-if="server.lock === 'lock-operation'">
                    {{ tc('components.server.ServeDetailCard.server_operation_locked') }}
                  </q-tooltip>
                  <q-tooltip v-else>
                    {{ tc('components.server.ServeDetailCard.server_operation_unlocked') }}
                  </q-tooltip>
                </q-toggle>

                <q-btn :disable="!server.status"
                       unelevated flat padding="none" size="lg" :color="server.status==1?'primary':'grey-5'"
                       icon="computer"
                       @click="server.status==1?store.gotoVNC(server.id):''">
                  <q-tooltip v-if="server.status==1">
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

                  <q-btn v-if="server.status && server.status !== 1"
                         :disable="server.lock === 'lock-operation'"
                         icon="delete" text-color="red"
                         unelevated flat padding="none" size="lg"
                         @click="store.serverOperationDialog({ serverId: server.id, action: 'delete', isGroup, isJump: true})">
                    <q-tooltip>
                     {{ tc('components.server.ServeDetailCard.delete') }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn v-if="server.status && server.status"
                         :disable="server.lock === 'lock-operation'"
                         icon="delete_forever" text-color="red"
                         unelevated flat padding="none" size="lg"
                         @click="store.serverOperationDialog({ serverId: server.id, action: 'delete_force', isGroup, isJump: true})">
                    <q-tooltip>
                      {{ tc('components.server.ServeDetailCard.force_delete') }}
                    </q-tooltip>
                  </q-btn>

                </span>
              </div>
            </div>

            <div class="row justify-center q-pt-xl ">
              <div class="col-4">

                <div class="row q-pb-md items-center">
                  <div class="col-4 text-grey">{{ tc('components.server.ServeDetailCard.initial_os_username') }}</div>
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
                  <div class="col-4 text-grey">{{ tc('components.server.ServeDetailCard.initial_os_password') }}</div>
                  <div class="col-shrink">
                    <div v-if="server?.default_password === null || server?.default_password===''">
                      {{ tc('components.server.ServeDetailCard.unavailable_from_service') }}
                    </div>

                    <div v-else class="row">
                      <PasswordToggle style="max-width: 200px; min-width: 32px;" :text="server?.default_password"/>

                      <q-btn class="q-px-xs" flat color="primary" icon="content_copy" size="sm"
                             @click="clickToCopy(server?.default_password, true)">
                        <q-tooltip>
                          {{ tc('components.server.ServeDetailCard.copy') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>

                <div v-if="!service.need_vpn && vpn" class="row q-pb-md items-center">
                  <div class="col-4 text-grey">VPN</div>
                  <div class="col-auto">{{ tc('components.server.ServeDetailCard.vpn_not_required') }}</div>
                </div>

                <div v-if="service.need_vpn" class="row q-pb-md items-center ">
                  <div class="col-4 text-grey ">{{ tc('components.server.ServeDetailCard.vpn_account_status') }}</div>
                  <div class="col">
                    <div v-if="vpn?.active" class="col-shrink row items-center">
                      <q-icon name="check_circle" color="light-green" size="sm"/>
                      {{ tc('components.server.ServeDetailCard.activated') }}
                    </div>

                    <div v-else class="col-shrink row items-center">
                      <q-icon name="cancel" color="red" size="sm"/>
                      {{ tc('components.server.ServeDetailCard.deactivated') }}
                    </div>
                  </div>
                </div>

                <div v-if="service.need_vpn && vpn?.active" class="row q-pb-md items-center ">
                  <div class="col-4 text-grey ">{{ tc('components.server.ServeDetailCard.vpn_username') }}</div>
                  <div class="col">
                    {{ vpn?.username }}
                    <q-btn class="col-shrink q-px-xs" flat color="primary" icon="content_copy" size="sm"
                           @click="clickToCopy(vpn?.username)">
                      <q-tooltip>
                        {{ tc('components.server.ServeDetailCard.copy') }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <div v-if="service.need_vpn && vpn?.active && vpn" class="row q-pb-md items-center">
                  <div class="col-4 text-grey">{{ tc('components.server.ServeDetailCard.vpn_password') }}</div>

                  <div class="col-shrink">

                    <div class="row">
                      <PasswordToggle style="max-width: 200px; min-width: 32px;" :text="vpn?.password"/>

                      <q-btn class="q-px-xs" flat color="primary" icon="content_copy" size="sm"
                             @click="clickToCopy(vpn?.password, true)">
                        <q-tooltip>
                          {{ tc('components.server.ServeDetailCard.copy') }}
                        </q-tooltip>
                      </q-btn>
                    </div>

                  </div>

                </div>

                <div v-if="service.need_vpn && vpn?.active" class="row q-pb-md items-center">
                  <div class="col-4 text-grey">{{ tc('components.server.ServeDetailCard.vpn_config') }}</div>
                  <div class="col">
                    <q-btn :label="tc('components.server.ServeDetailCard.download')" class=" " color="primary" padding="none" dense flat no-caps
                           @click="store.fetchConfig(server.service)"/>
                  </div>
                </div>

                <div v-if="service.need_vpn && vpn?.active" class="row q-pb-md items-center">
                  <div class="col-4 text-grey">{{ tc('components.server.ServeDetailCard.vpn_ca') }}</div>
                  <div class="col">
                    <q-btn :label="tc('components.server.ServeDetailCard.download')" class="" color="primary" padding="none" dense flat no-caps
                           @click="store.fetchCa(server.service)"/>
                  </div>
                </div>

                <div v-if="service.need_vpn && vpn?.active" class="row q-pb-md items-center">
                  <!--                  <div class="col-3 text-grey">VPN 使用方法</div>-->
                  <!--                  <div class="col">-->
                  <q-btn :label="tc('components.server.ServeDetailCard.view_vpn_usage')" class="" color="primary" padding="none" dense flat no-caps
                         @click="gotoManualVpn"/>
                  <!--                  </div>-->
                </div>

              </div>

              <div class="col-4">
                <div v-if="isGroup" class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.group') }}</div>
                  <div class="col-shrink">
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

                <!--                <div class="row q-pb-md items-center">-->
                <!--                  <div class="col-3 text-grey">关联配额</div>-->
                <!--                  <div class="col-shrink">-->

                <!--                    <div v-if="quota">-->
                <!--                      <q-btn label="配额详情" flat dense color="primary" padding="none"-->
                <!--                             :to="{path: isGroup ? `/my/group/quota/detail/${quota?.id}` : `/my/personal/quota/detail/${quota?.id}`}">-->
                <!--                        <q-tooltip>-->
                <!--                          配额详情-->
                <!--                        </q-tooltip>-->
                <!--                      </q-btn>-->
                <!--                      &lt;!&ndash;                      {{ quota?.display }}&ndash;&gt;-->
                <!--                    </div>-->

                <!--                    <div v-else>关联配额已删除</div>-->

                <!--                  </div>-->
                <!--                </div>-->

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.creator') }}</div>
                  <div class="col-shrink">
                    {{ server.user.username }}
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.server_id') }}</div>
                  <div class="col">
                    {{ server.id }}
                    <!--                    <q-btn class="q-px-xs" flat color="primary" icon="content_copy" size="sm"-->
                    <!--                           @click="clickToCopy(server.id)">-->
                    <!--                      <q-tooltip>-->
                    <!--                        复制-->
                    <!--                      </q-tooltip>-->
                    <!--                    </q-btn>-->
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.hardware_configuration') }}</div>
                  <div class="col"> {{ server.vcpus }} {{ tc('components.server.ServeDetailCard.cores') }} CPU / {{ server.ram / 1024 }}GB {{ tc('components.server.ServeDetailCard.memory') }}</div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{ tc('components.server.ServeDetailCard.network_type') }}</div>
                  <div class="col"> {{ server.public_ip ? tc('components.server.ServeDetailCard.public_network') : tc('components.server.ServeDetailCard.private_network') }}</div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{tc('components.server.ServeDetailCard.operating_system')}}</div>
                  <div class="col">
                    <q-icon v-if="getOsIconName(server.image)" :name="getOsIconName(server.image)" flat size="md"/>
                    {{ server.image }}
                  </div>
                </div>

                <div v-if="server.image_desc" class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{tc('components.server.ServeDetailCard.system_specification')}}</div>
                  <div class="col"> {{ server.image_desc }}</div>
                </div>

              </div>

              <div class="col-4">

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{tc('components.server.ServeDetailCard.billing_type')}}</div>
                  <div v-if="server.pay_type === 'prepaid'" class="col">
                    {{tc('components.server.ServeDetailCard.monthly_prepaid')}}
                  </div>
                  <div v-if="server.pay_type === 'postpaid'" class="col">
                    {{tc('components.server.ServeDetailCard.pay_as_go')}}
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{tc('components.server.ServeDetailCard.create_time')}}</div>
                  <div class="col">
                    {{ new Date(server.creation_time).toLocaleString(i18n.global.locale) }}
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{tc('components.server.ServeDetailCard.expiration_time')}}</div>
                  <div class="col row items-center">
                    <div class="col-auto">
                      {{
                        server.expiration_time ? new Date(server.expiration_time).toLocaleString(i18n.global.locale) : tc('components.server.ServeDetailCard.long_term')
                      }}
                    </div>
                    <div v-if="server.pay_type === 'prepaid'" class="col-auto">
                      <q-btn v-if="!isGroup || store.tables.groupTable.byId[server.vo_id].myRole !== 'member'"
                             color="primary" padding="none" icon="autorenew" :ripple="false" dense flat no-caps
                             @click="store.renewOrderDialog(server.id, isGroup)">
                        {{tc('components.server.ServeDetailCard.renewal')}}
                      </q-btn>
                    </div>

                    <!--                    <q-icon-->
                    <!--                      v-if="server.expiration_time !== null && (new Date(server.expiration_time).getTime() - new Date().getTime()) < 0"-->
                    <!--                      name="help_outline" color="red" size="xs">-->
                    <!--                      <q-tooltip>{{ tc('云主机已到期') }}</q-tooltip>-->
                    <!--                    </q-icon>-->
                  </div>
                </div>

                <!--                <div class="row q-pb-md items-center" v-if="server.expiration_time">-->
                <!--                  <div class="col-3 text-grey">可用天数</div>-->
                <!--                  <div class="col">-->
                <!--                    {{-->
                <!--                      Math.ceil((new Date(server.expiration_time) - new Date(server.creation_time)) / (1000 * 60 * 60 * 24))-->
                <!--                    }}天-->
                <!--                  </div>-->
                <!--                </div>-->

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{tc('components.server.ServeDetailCard.org')}}</div>
                  <div class="col">
                    {{ store.tables.dataCenterTable.byId[service.data_center]?.name }}
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{tc('components.server.ServeDetailCard.service_node')}}</div>
                  <div class="col"> {{ service.name }}</div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">{{tc('components.server.ServeDetailCard.service_type')}}</div>
                  <div class="col">

                    <!--                    <q-icon-->
                    <!--                      v-if="service.service_type.toLowerCase().includes('ev')"-->
                    <!--                      name="img:~assets/svg/EVCloud-Logo-Horizontal.svg"-->
                    <!--                      style="width: 130px;height: 25px"/>-->

                    <q-icon
                      v-if="service.service_type.toLowerCase().includes('ev')" style="width: 130px;height: 25px">
                      <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 130px;height: 25px"/>
                    </q-icon>

                    <q-icon
                      v-if="service.service_type.toLowerCase().includes('open')" style="width: 130px;height: 25px">
                      <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 130px;height: 25px"/>
                    </q-icon>

                  </div>
                </div>

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
