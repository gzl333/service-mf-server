<script setup lang="ts">
import { PropType, ref, computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore, ServerInterface } from 'stores/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

const props = defineProps({
  server: {
    type: Object as PropType<ServerInterface>,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = userRoute()
const tc = i18n.global.tc

const toggle = ref(computed(() => props.server.lock === 'lock-operation'))
// 当前用户在group内的角色
const myRole = computed(() => store.tables.groupTable.byId[props.server?.vo_id || '']?.myRole)
</script>

<template>
  <div class="ServerOperationBtnGroup">
    <q-btn-group unelevated>

      <q-btn color="grey-3" padding="none">
        <q-toggle
          v-model="toggle"
          checked-icon="lock"
          unchecked-icon="lock_open"
          color="light-green"
          size="md"
          @click="store.toggleOperationLock({isGroup, serverId: server.id })"
        >
          <q-tooltip v-if="server.lock === 'lock-operation'">
            {{ tc('components.server.ServerOperationBtnGroup.server_operation_locked') }}
          </q-tooltip>
          <q-tooltip v-else>
            {{ tc('components.server.ServerOperationBtnGroup.server_operation_unlocked') }}
          </q-tooltip>
        </q-toggle>
      </q-btn>

      <q-btn-dropdown color="primary" dropdown-icon="expand_more" :ripple="false" split no-caps
                      :disable-main-btn="server.lock === 'lock-operation'"
                      :loading="server?.status===-1"
                      :icon="server?.status===5?'play_arrow':server?.status==1?'power_settings_new':'refresh'"
                      @click="server?.status===5 ? store.serverOperationDialog({serverId: server.id, action: 'start', isGroup})
                      : server?.status==1?store.serverOperationDialog({serverId: server.id, action: 'shutdown', isGroup})
                      : store.loadSingleServerStatus({isGroup, serverId: server.id})">

        <q-list style="text-align:center">
          <q-item clickable v-close-popup class="bg-white text-primary"
                  @click="navigateToUrl(isGroup ? `/my/server/group/server/detail/${server.id}` : `/my/server/personal/detail/${server.id}`)">
            <div class="row">
              <q-item-section class="col-auto">
                <q-icon name="info" size="sm"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-item-label>
                  {{ tc('components.server.ServerOperationBtnGroup.server_detail') }}
                </q-item-label>
              </q-item-section>
            </div>
          </q-item>

          <div v-if="server.pay_type === 'prepaid'">
            <q-item v-if="!isGroup || store.tables.groupTable.byId[server.vo_id].myRole !== 'member'"
                    clickable v-close-popup class="bg-white text-primary"
                    @click="store.renewOrderDialog(server.id, isGroup)">
              <div class="row">
                <q-item-section class="col-auto">
                  <q-icon name="autorenew" size="sm"/>
                </q-item-section>
                <q-item-section class="col-auto">
                  <q-item-label>
                    {{ tc('components.server.ServerOperationBtnGroup.server_renewal') }}
                  </q-item-label>
                </q-item-section>
              </div>
            </q-item>
          </div>

          <q-separator/>

          <q-item v-if="server.status!==1" clickable v-close-popup class="bg-white text-primary"
                  :disable="server.lock === 'lock-operation'"
                  @click="store.serverOperationDialog({ serverId: server.id, action: 'start', isGroup})">
            <div class="row">
              <q-item-section class="col-auto">
                <q-icon name="play_arrow" size="sm"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-item-section>
                  <q-item-label>{{ tc('components.server.ServerOperationBtnGroup.power_on') }}</q-item-label>
                </q-item-section>
              </q-item-section>
            </div>
          </q-item>

          <q-item v-if="server.status!==5" clickable v-close-popup class="bg-white text-primary"
                  :disable="server.lock === 'lock-operation'"
                  @click="store.serverOperationDialog({serverId: server.id, action: 'reboot', isGroup})">
            <div class="row">
              <q-item-section class="col-auto">
                <q-icon name="restart_alt" size="sm"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-item-section>
                  <q-item-label>{{ tc('components.server.ServerOperationBtnGroup.restart') }}</q-item-label>
                </q-item-section>
              </q-item-section>
            </div>
          </q-item>

          <q-item v-if="server.status!==5" clickable v-close-popup class="bg-white text-primary"
                  :disable="server.lock === 'lock-operation'"
                  @click="store.serverOperationDialog({serverId: server.id, action: 'shutdown', isGroup})">
            <div class="row">
              <q-item-section class="col-auto">
                <q-icon name="power_settings_new" size="sm"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-item-section>
                  <q-item-label>{{ tc('components.server.ServerOperationBtnGroup.power_off') }}</q-item-label>
                </q-item-section>
              </q-item-section>
            </div>
          </q-item>

          <q-item v-if="server.status!==5" clickable v-close-popup class="bg-white text-primary"
                  :disable="server.lock === 'lock-operation'"
                  @click="store.serverOperationDialog({serverId: server.id, action: 'poweroff', isGroup})">
            <div class="row">
              <q-item-section class="col-auto">
                <q-icon name="power_off" size="sm"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-item-section>
                  <q-item-label>{{ tc('components.server.ServerOperationBtnGroup.force_power_off') }}</q-item-label>
                </q-item-section>
              </q-item-section>
            </div>
          </q-item>

          <!--personal显示 || group不是member时显示-->
          <div v-if="!isGroup || isGroup && myRole!=='member'">

            <q-separator/>

            <q-item clickable v-close-popup class="bg-white text-primary"
                    :disable="server.lock === 'lock-operation'"
                    @click="store.triggerServerRebuildDialog({serverId: server.id, isGroup})">
              <div class="row">
                <q-item-section class="col-auto">
                  <q-icon name="build" size="sm"/>
                </q-item-section>
                <q-item-section class="col-auto">
                  <q-item-section>
                    <q-item-label>{{ tc('components.server.ServerOperationBtnGroup.rebuild_server') }}</q-item-label>
                  </q-item-section>
                </q-item-section>
              </div>
            </q-item>

            <q-separator/>

<!--            <q-item v-if="server.status!==1" clickable v-close-popup class="bg-white text-red"-->
<!--                    :disable="server.lock === 'lock-operation'"-->
<!--                    @click="store.serverOperationDialog({serverId: server.id, action: 'delete', isGroup})">-->
<!--              <div class="row">-->
<!--                <q-item-section class="col-auto">-->
<!--                  <q-icon name="delete" size="sm"/>-->
<!--                </q-item-section>-->
<!--                <q-item-section class="col-auto">-->
<!--                  <q-item-section>-->
<!--                    <q-item-label>{{ tc('components.server.ServerOperationBtnGroup.delete') }}</q-item-label>-->
<!--                  </q-item-section>-->
<!--                </q-item-section>-->
<!--              </div>-->
<!--            </q-item>-->

            <q-item clickable v-close-popup class="bg-white text-red"
                    :disable="server.lock === 'lock-operation'"
                    @click="store.serverOperationDialog({serverId: server.id, action: 'delete_force', isGroup})">
              <div class="row">
                <q-item-section class="col-auto">
                  <q-icon name="delete_forever" size="sm"/>
                </q-item-section>
                <q-item-section class="col-auto">
                  <q-item-section>
                    <q-item-label>{{ tc('components.server.ServerOperationBtnGroup.delete') }}</q-item-label>
                  </q-item-section>
                </q-item-section>
              </div>
            </q-item>

          </div>

        </q-list>
      </q-btn-dropdown>

    </q-btn-group>
  </div>
</template>

<style lang="scss" scoped>
.ServerOperationBtnGroup {
}
</style>
