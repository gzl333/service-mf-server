<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'
import useGetOsIconName from 'src/hooks/useGetOsIconName'

const props = defineProps({
  serverId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: true
  }
})
/* const emits =  */
defineEmits([...useDialogPluginComponent.emits])

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
const images = computed(() => store.getImagesByServiceId(server.value.service))

const selectDom = ref<HTMLElement>()
const select = ref(server.value.image_id)
const check = ref(false)

// 获取os的icon名称
const getOsIconName = useGetOsIconName()

// 确定时
const onOKClick = () => {
  if (select.value === '') {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.server.ServeDeployCard.select_target_os')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    selectDom.value?.focus()
  } else {
    onDialogOK(select.value)
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary ">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('components.server.ServerRebuildDialog.rebuild_server') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.ip_address') }}
          </div>
          <div class="col">
            {{ server.ipv4 }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.remarks') }}
          </div>
          <div class="col">
            {{ server.remarks }}
          </div>
        </div>

        <div v-if="isGroup" class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.group') }}
          </div>
          <div class="col">
            {{ store.tables.groupTable.byId[server.vo_id].name }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.affiliation') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name :
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name_en
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.service_node') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ? store.tables.serviceTable.byId[server.service]?.name : store.tables.serviceTable.byId[server.service]?.name_en
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
            {{ tc('components.server.ServerRebuildDialog.hardware_configuration') }}
          </div>
          <div class="col">
            {{ server.vcpus }} {{ tc('components.server.ServerRebuildDialog.cores') }}/ {{ server.ram / 1024 }}GB
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.network_type') }}
          </div>
          <div class="col">
            {{ server.public_ip ? tc('components.server.ServerRebuildDialog.public_network')  : tc('components.server.ServerRebuildDialog.private_network')  }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.available_period') }}
          </div>
          <div class="col">
            {{ new Date(server.creation_time).toLocaleString(i18n.global.locale) }} -
            {{ server.expiration_time ? new Date(server.expiration_time).toLocaleString(i18n.global.locale) : '永久有效' }}
            <!--            <q-icon-->
            <!--              v-if="server.expiration_time !== null && (new Date(server.expiration_time).getTime() - new Date().getTime()) < 0"-->
            <!--              name="help_outline" color="red" size="xs">-->
            <!--              <q-tooltip>{{ tc('云主机已到期') }}</q-tooltip>-->
            <!--            </q-icon>-->
          </div>
        </div>

        <div class="row items-center">
          <div class="col-2 text-grey-7">
             {{ tc('components.server.ServerRebuildDialog.operating_system') }}
          </div>
          <div class="col">
            <q-icon v-if="getOsIconName(server.image)" :name="getOsIconName(server.image)" flat size="md"/>
            {{ server.image }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.target_operating_system') }}
          </div>
          <div class="col-8">
            <q-select ref="selectDom" v-if="images.length !== 0" outlined v-model="select" dense
                      :options="images" map-options emit-value option-label="name" option-value="id">

              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="select===scope.opt.id ? 'text-primary' : 'text-black'">
                  <q-icon v-if="getOsIconName(scope.opt.name)" :name="getOsIconName(scope.opt.name)"
                          class="q-pl-xs q-pr-md" flat size="md"/>
                {{ scope.opt.name }}
                </span>
              </template>

              <!--待选项的内容插槽-->
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon v-if="getOsIconName(scope.opt.name)" :name="getOsIconName(scope.opt.name)" flat size="md"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <!--                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>-->
                  </q-item-section>
                </q-item>
              </template>

            </q-select>
          </div>
        </div>

        <div class="row items-center">
          <div class="col text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.read_carefully_check') }}
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check" color="primary">
          <div :class="check?'text-primary':'text-black'">
            {{ tc('components.server.ServerRebuildDialog.understand_delete') }}
          </div>
        </q-checkbox>

      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="between">
        <q-btn class="q-ma-sm" :color="!check ? 'grey' : 'primary'" unelevated :label="tc('components.server.ServerRebuildDialog.confirm')" :disable="!check"
               @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('components.server.ServerRebuildDialog.cancel')" @click="onDialogCancel"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
