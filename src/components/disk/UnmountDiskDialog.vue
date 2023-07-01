<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { DiskInterface, GroupInterface, ServerInterface, useStore } from 'stores/store'
import { /* useRoute, */ useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'
import api from 'src/api'
import OsLogo from 'components/ui/OsLogo.vue'
// import { navigateToUrl } from 'single-spa'
import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

// dialog行为:
// 1.确定账户: groupId 有则为具体group账户,没有则为个人账户
// 2.确定资源起点: 从server或disk进入,二选一, 带着serverId或者diskId进入
// 3.产生对应资源list: 然后确定serviceId， 带diskId则产生server list, 带serverId则产生disk list

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

const service = computed(() => store.tables.serviceTable.byId[props.disk.service.id])

/* disk进入,查询对应server数据 */
const server = ref<ServerInterface>()
const getServer = async () => {
  try {
    const respGetServer = await api.server.server.getServerId({
      path: {
        id: props.disk.server?.id || ''
      }
    })
    server.value = respGetServer.data.server
  } catch (exception) {
    // exceptionNotifier(exception, 'UnMountDisk')
  }
}
if (props.disk) {
  getServer()
}
/* disk进入,查询对应server数据 */

// 确定时
const onOKClick = async () => {
  // notify
  const dismiss = Notify.create({
    classes: 'notification-positive shadow-15',
    // icon: 'mdi-check-circle',
    spinner: true,
    textColor: 'positive',
    message: `${tc('正在卸载云硬盘')}`,
    position: 'bottom',
    closeBtn: true,
    timeout: 0, // infinite
    multiLine: false
  })

  try {
    /* const respMount =  */
    await api.server.disk.postDiskIdDetach({
      path: {
        id: props.disk?.id || ''
      },
      query: {
        server_id: props.disk?.server?.id || ''
      }
    })

    // notify
    dismiss()
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'mdi-check-circle',
      // spinner: true,
      textColor: 'positive',
      message: `${tc('成功卸载云硬盘')}`,
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
    exceptionNotifier(exception, 'UnMountDisk')
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary ">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('卸载云硬盘') }}</div>
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
            {{ tc('云主机') }}
          </div>

          <div class="col q-pa-sm bg-grey-2">

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('IP') }}</div>
              <div class="col"> {{ props.disk.server?.ipv4 }}</div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('备注') }}</div>
              <div class="col"
                   style="max-width: 270px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                {{ server?.remarks }}
              </div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('配置') }}</div>
              <div class="col row">
                <div>
                  {{ props.disk.server?.vcpus }}
                  {{ i18n.global.locale === 'zh' ? '核' : props.disk.server?.vcpus > 1 ? 'cores' : 'core' }}
                </div>
                /
                <div>{{ props.disk.server?.ram }}GB</div>
              </div>
            </div>

            <div class="row  items-center">
              <div class="col-3 text-grey-7"> {{ tc('操作系统') }}</div>
              <div class="col row items-center">
                <OsLogo class="col-auto" :os-name="props.disk?.server?.image " size="md"/>
                <div class="col-auto"> {{ props.disk?.server?.image }}</div>
              </div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('ID') }}</div>
              <div class="col"> {{ props.disk.server?.id }}</div>
            </div>

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

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('备注') }}</div>
              <div class="col"> {{ props.disk?.remarks }}</div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('创建时间') }}</div>
              <div class="col">
                {{ new Date(props.disk?.creation_time).toLocaleString(i18n.global.locale as string) }}
              </div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> ID</div>
              <div class="col"> {{ props.disk?.id }}</div>
            </div>

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
               :label="tc('卸载')"
               @click="onOKClick"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
