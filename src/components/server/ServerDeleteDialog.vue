<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'

const props = defineProps({
  action: {
    type: String,
    required: true
  },
  serverId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: true
  }
})
/* const emits = */
defineEmits([
  ...useDialogPluginComponent.emits
])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const server = computed(() => props.isGroup ? store.tables.groupServerTable.byId[props.serverId] : store.tables.personalServerTable.byId[props.serverId])

const keepServerDeleteLock = () => {
  if (server.value.lock === 'free') {
    // 把lock状态改为lock-delete
    void store.toggleDeleteLockToLock({
      serverId: props.serverId,
      isGroup: props.isGroup
    })
  }
}
// 进入时检查lock状态
keepServerDeleteLock()

const check1 = ref(false)
const check2 = ref(false)

// lock toggle
const toggleBtn = ref<HTMLElement>()
const toggle = ref(computed(() => server.value.lock !== 'free'))

// hide对话框时
const onHideClick = () => {
  keepServerDeleteLock()
  onDialogHide()
}

// 取消时
const onCancelClick = () => {
  keepServerDeleteLock()
  onDialogCancel()
}

// 确定时
const onOKClick = () => {
  if (server.value.lock !== 'free') {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.server.ServerDeleteDialog.notify_cancel_delete_lock')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    // focus 未起作用
    // toggleBtn.value?.focus()
  } else {
    onDialogOK({})
  }
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onHideClick">
    <q-card class="q-dialog-plugin dialog-negative ">

      <q-card-section class="row items-center justify-center q-pb-md">
        <!--        <div class="text-negative">{{ action === 'delete' ? tc('components.server.ServerDeleteDialog.delete_host') : tc('components.server.ServerDeleteDialog.force_delete_server') }}</div>-->
        <div class="text-negative">{{ tc('components.server.ServerDeleteDialog.delete_host') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.ip_address') }}
          </div>
          <div class="col">
            {{ server.ipv4 }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.remarks') }}
          </div>
          <div class="col" style="max-width: 400px; word-break: break-all; word-wrap: break-word; white-space: normal;">
            {{ server.remarks }}
          </div>
        </div>

        <div v-if="isGroup" class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.group') }}
          </div>
          <div class="col">
            {{ store.tables.groupTable.byId[server.vo_id].name }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.org') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ?
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name :
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name_en
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.service_node') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ?
                store.tables.serviceTable.byId[server.service]?.name :
                store.tables.serviceTable.byId[server.service]?.name_en
            }}

            <span>
              <q-icon
                v-if="store.tables.serviceTable.byId[server.service]?.service_type.toLowerCase().includes('ev')"
                style="width: 100px;height: 20px">
                      <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
              </q-icon>
            </span>

            <span>
              <q-icon
                v-if="store.tables.serviceTable.byId[server.service]?.service_type.toLowerCase().includes('open')"
                style="width: 100px;height: 20px">
                      <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
              </q-icon>
            </span>

          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.configuration') }}
          </div>
          <div class="col">
            {{ server.vcpus }}{{ tc('components.server.ServerDeleteDialog.cores') }} / {{ server.ram / 1024 }}GB
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.operating_system') }}
          </div>
          <div class="col">
            {{ server.image }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.network_type') }}
          </div>
          <div class="col">
            {{
              server.public_ip ? tc('components.server.ServerDeleteDialog.public_network') : tc('components.server.ServerDeleteDialog.private_network')
            }}
          </div>
        </div>

        <div class="row  items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.available_period') }}
          </div>
          <div class="col">
            {{ new Date(server.creation_time).toLocaleString(i18n.global.locale) }} -
            {{
              server.expiration_time ? new Date(server.expiration_time).toLocaleString(i18n.global.locale) : tc('components.server.ServerDeleteDialog.permanently_valid')
            }}
            <!--            <q-icon-->
            <!--              v-if="server.expiration_time !== null && (new Date(server.expiration_time).getTime() - new Date().getTime()) < 0"-->
            <!--              name="help_outline" color="red" size="xs">-->
            <!--              <q-tooltip>{{ tc('云主机已到期') }}</q-tooltip>-->
            <!--            </q-icon>-->
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.read_carefully_check') }}
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check1" color="primary">
          <div :class="check1?'text-primary':'text-black'">
            {{ tc('components.server.ServerDeleteDialog.understand_delete') }}
          </div>
        </q-checkbox>

        <q-checkbox style="margin-left: -10px;" v-model="check2" color="primary">
          <div :class="check2?'text-primary':'text-black'">
            {{ tc('components.server.ServerDeleteDialog.understand_no_refund') }}
          </div>
        </q-checkbox>

        <div class="row items-center q-pt-sm">
          <div class="col text-grey-7">
            {{ tc('components.server.ServerDeleteDialog.cancel_lock') }}
          </div>
        </div>

        <q-toggle
          style="margin-left: -12px;"
          ref="toggleBtn"
          :disable="!check1"
          v-model="toggle"
          checked-icon="lock"
          unchecked-icon="lock_open"
          color="light-green"
          size="lg"
          @update:model-value="store.toggleDeleteLock({isGroup, serverId})"
        >
          <span :class="toggle?'text-black':'text-primary'">{{
              toggle ? tc('components.server.ServerDeleteDialog.locked') : tc('components.server.ServerDeleteDialog.unlocked')
            }}</span>
          <q-tooltip v-if="server.lock === 'free'">
            {{ tc('components.server.ServerDeleteDialog.locked.delete_server_unlock') }}
          </q-tooltip>
          <q-tooltip v-else>
            {{ tc('components.server.ServerDeleteDialog.locked.delete_server_lock') }}
          </q-tooltip>
        </q-toggle>

      </q-card-section>

      <q-card-actions align="between">

        <div class="row justify-center items-center">
          <q-btn class="q-ma-sm" :color="toggle || !check1 || !check2 ? 'grey' : 'red'"
                 unelevated no-caps
                 :disable="toggle || !check1 || !check2"
                 :label="tc('components.server.ServerDeleteDialog.confirm')"
                 @click="onOKClick"/>
          <div class="col">
            {{ tc('components.server.ServerDeleteDialog.if_no_pay') }}
            <q-btn type="a" color="primary" flat no-caps padding="none"
                   :label="tc('components.server.ServerDeleteDialog.rebuild_server')"
                   @click="()=> {onCancelClick(); store.triggerServerRebuildDialog( {serverId: server.id, isGroup})}"/>
          </div>
        </div>

        <q-btn class="q-ma-sm" color="primary" unelevated no-caps
               :label="tc('components.server.ServerDeleteDialog.cancel')" @click="onCancelClick"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
