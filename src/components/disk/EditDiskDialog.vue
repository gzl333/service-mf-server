<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { DiskInterface, GroupInterface, useStore } from 'stores/store'
import { /* useRoute, */ useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'
import api from 'src/api'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  group: {
    type: Object as PropType<GroupInterface>,
    required: false
  },
  disk: {
    type: Object as PropType<DiskInterface>,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
const router = useRouter()

const exceptionNotifier = useExceptionNotifier()

const {
  dialogRef,
  onDialogHide,
  // onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const input = ref(props.disk?.remarks || '')

const service = computed(() => store.tables.serviceTable.byId[props.disk.service.id])

// 确定时
const onOKClick = async () => {
  // notify
  const dismiss = Notify.create({
    classes: 'notification-positive shadow-15',
    // icon: 'mdi-check-circle',
    spinner: true,
    textColor: 'positive',
    message: `${tc('正在修改云硬盘备注')}`,
    position: 'bottom',
    closeBtn: true,
    timeout: 0, // infinite
    multiLine: false
  })

  try {
    /* const respMount =  */
    await api.server.disk.postDiskIdRemark({
      path: {
        id: props.disk?.id || ''
      },
      query: {
        remark: input.value
      }
    })

    // notify
    dismiss()
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'mdi-check-circle',
      // spinner: true,
      textColor: 'positive',
      message: `${tc('成功修改云硬盘备注')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })

    // close
    onDialogHide()

    // 应当更新disk数据
    // 目前使用刷新当前页面
    router.go(0)
  } catch (exception) {
    dismiss()
    exceptionNotifier(exception, 'EditDiskRemark')
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary ">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('修改云硬盘备注') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('所属账户') }}
          </div>
          <div class="col">
            {{ group ? group.name : tc('个人账户') }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('服务单元') }}
          </div>
          <div class="col">
            {{ i18n.global.locale === 'zh' ? service?.name : service?.name_en }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('云硬盘') }}
          </div>
          <div class="col q-pa-sm bg-grey-2">

            <!--            {{ props.disk }}-->

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('容量') }}</div>
              <div class="col"> {{ props.disk?.size }}GB</div>
            </div>

            <!--            <div class="row">-->
            <!--              <div class="col-3 text-grey-7"> {{ tc('备注') }}</div>-->
            <!--              <div class="col"> {{ props.disk?.remarks }}</div>-->
            <!--            </div>-->

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('创建时间') }}</div>
              <div class="col">
                {{ new Date(props.disk?.creation_time).toLocaleString(i18n.global.locale as string) }}
              </div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7">ID</div>
              <div class="col"> {{ props.disk?.id }}</div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7">{{ tc('所在云主机') }}</div>
              <div class="col"> {{ props.disk?.server === null ? tc('未挂载') : props.disk?.server.ipv4 }}</div>
            </div>

          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('备注') }}
          </div>
          <div class="col">
            <q-input class="q-pt-md"
                     v-model="input"
                     maxlength="100"
                     clearable
                     clear-icon="close"
                     outlined
                     dense
                     counter/>
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               outline
               no-caps
               :label="tc('取消')"
               @click="onDialogCancel"/>

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('修改')"
               @click="onOKClick"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
