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
/* const emits = */ defineEmits([
  ...useDialogPluginComponent.emits
])

const { tc, locale } = i18n.global
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
      message: '请取消云主机的删除锁定',
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
        <div class="text-negative">{{ action === 'delete' ? tc('删除云主机') : tc('强制删除云主机') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            IP地址
          </div>
          <div class="col">
            {{ server.ipv4 }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            备注
          </div>
          <div class="col">
            {{ server.remarks }}
          </div>
        </div>

        <div v-if="isGroup" class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            项目组
          </div>
          <div class="col">
            {{ store.tables.groupTable.byId[server.vo_id].name }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            所属机构
          </div>
          <div class="col">
            {{
              locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name :
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name_en
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            服务节点
          </div>
          <div class="col">
            {{
              locale === 'zh' ? store.tables.serviceTable.byId[server.service]?.name : store.tables.serviceTable.byId[server.service]?.name_en
            }}

            <span>
              <q-icon
                v-if="store.tables.serviceTable.byId[server.service]?.service_type.toLowerCase().includes('ev')"
                name="img:svg/EVCloud-Logo-Horizontal.svg"
                style="width: 100px;height: 20px"/>
              <!--            <q-tooltip>{{ tc('该节点的服务类型为EVCloud') }}</q-tooltip>-->
            </span>

            <span>
              <q-icon
                v-if="store.tables.serviceTable.byId[server.service]?.service_type.toLowerCase().includes('open')"
                name="img:svg/OpenStack-Logo-Horizontal.svg"
                style="width: 100px;height: 20px"/>
              <!--            <q-tooltip>{{ tc('该节点的服务类型为OpenStack') }}</q-tooltip>-->
            </span>

          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            配置
          </div>
          <div class="col">
            {{ server.vcpus }}核 / {{ server.ram / 1024 }}GB
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            操作系统
          </div>
          <div class="col">
            {{ server.image }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            IP类型
          </div>
          <div class="col">
            {{ server.public_ip ? '公网' : '私网' }}
          </div>
        </div>

        <div class="row  items-center">
          <div class="col-2 text-grey-7">
            可用期
          </div>
          <div class="col">
            {{ new Date(server.creation_time).toLocaleString(locale) }} -
            {{ server.expiration_time ? new Date(server.expiration_time).toLocaleString(locale) : '永久有效' }}
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
            请仔细阅读以下事项，并在确认后勾选：
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check1" color="primary">
          <div :class="check1?'text-primary':'text-black'">
            {{ tc('我了解删除云主机会丢失全部数据，且无法自行恢复') }}
          </div>
        </q-checkbox>

        <q-checkbox style="margin-left: -10px;" v-model="check2" color="primary">
          <div :class="check2?'text-primary':'text-black'">
            {{ tc('我了解已经消耗的云主机配额不会释放') }}
          </div>
        </q-checkbox>

        <div class="row items-center q-pt-sm">
          <div class="col text-grey-7">
            请解除锁定，并确认删除：
          </div>
        </div>

        <q-toggle
          style="margin-left: -12px;"
          ref="toggleBtn"
          :disable="!check1 || !check2"
          v-model="toggle"
          checked-icon="lock"
          unchecked-icon="lock_open"
          color="light-green"
          size="lg"
          @update:model-value="store.toggleDeleteLock({isGroup:isGroup, serverId: serverId})"
        >
          <span :class="toggle?'text-black':'text-primary'">{{ toggle ? tc('已锁定') : tc('已解除锁定') }}</span>
          <q-tooltip v-if="server.lock === 'free'">
            {{ tc('未锁定云主机删除操作') }}
          </q-tooltip>
          <q-tooltip v-else>
            {{ tc('已锁定云主机删除操作') }}
          </q-tooltip>
        </q-toggle>

      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="between">

        <div class="row justify-center items-center">
          <q-btn class="q-ma-sm" :color="toggle || !check1 || !check2 ? 'grey' : 'primary'"
                 unelevated
                 :disable="toggle || !check1 || !check2"
                 :label="tc('确认')"
                 @click="onOKClick"/>
          <div class="col">
            {{ tc('不想重新申请配额？请尝试') }}
            <q-btn type="a" color="primary" flat padding="none" label="重建云主机"
                   @click="()=> {onCancelClick(); store.triggerServerRebuildDialog( {serverId: server.id, isGroup})}"/>
          </div>
        </div>

        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('取消')" @click="onCancelClick"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>

</style>
