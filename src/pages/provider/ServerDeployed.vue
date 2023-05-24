<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'
import { Dialog, Notify } from 'quasar'

import type { ServerInterface } from 'stores/store'

import OsLogo from 'components/ui/OsLogo.vue'
import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'
import ServerStatusLocal from 'components/provider/ServerStatusLocal.vue'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'
import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

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

const exceptionNotifier = useExceptionNotifier()
// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()

// 筛选服务单元
const serviceOptions = computed(() => store.getServiceOptionsByRole(store.items.fedRole === 'federal-admin'))
const serviceSelection = ref('all')

// 筛选云主机计费方式
const paymentOptions = computed(() => [
  {
    value: 'all',
    label: `${tc('全部方式')}`
  },
  {
    value: 'postpaid',
    label: `${tc('按量计费')}`
  },
  {
    value: 'prepaid',
    label: `${tc('包月预付')}`
  },
  {
    value: 'expired',
    label: `${tc('包月预付-已过期')}`
  }
])
const paymentSelection = ref('all')

// 筛选网络类型
const networkOptions = computed(() => [
  {
    value: 'all',
    label: `${tc('全部网络类型')}`
  },
  {
    value: 'true',
    label: `${tc('公网IP')}`
  },
  {
    value: 'false',
    label: `${tc('私网IP')}`
  }
])
const networkSelection = ref('all')

// 筛选创建者
const creatorOptions = computed(() => [
  {
    value: 'all',
    label: `${tc('全部用户')}`
  },
  {
    value: 'username',
    label: `${tc('用户名关键字')}`
  },
  {
    value: 'user-id',
    label: `${tc('用户ID')}`
  }
])
const creatorSelection = ref('all')
const creatorInput = ref('')

// 筛选项目组
const groupOptions = computed(() => [
  {
    value: 'all',
    label: `${tc('全部项目组')}`
  },
  {
    value: 'exclude-vo',
    label: `${tc('排除项目组')}`
  },
  {
    value: 'vo-name',
    label: `${tc('项目组名关键字')}`
  },
  {
    value: 'vo-id',
    label: `${tc('项目组ID')}`
  }
])
const groupSelection = ref('all')
const groupInput = ref('')

// ip,remark input
const ipInput = ref('')
const remarkInput = ref('')

const isLoading = ref(false)

const rows = ref<ServerInterface[]>([])

// 根据serverId，用管理员身份查询server status
const loadSingleServerStatus = async (serverId: string) => {
  try {
    const respStatus = await api.server.server.getServerStatus({
      path: { id: serverId },
      query: { 'as-admin': true }
    })
    return respStatus.data.status.status_code
  } catch (exception) {
    // 在异常发生处进行提示
    exceptionNotifier(exception)
    // 向更高层抛出异常，供上层按需处理
    throw (exception)
  }
}

// 更新在rows里面当前server的status
const updateSingleSeverStatusInRows = async (serverId: string) => {
  const server = rows.value.find((server: ServerInterface) => server.id === serverId)
  server!.status = -1
  try {
    const status = await loadSingleServerStatus(serverId)
    server!.status = status
  } catch (exception) {
    server!.status = 0
  }
}

// 根据当前搜索条件，更新rows，并更新count值
const loadAdminServers = async () => {
  // table loading
  isLoading.value = true
  // request
  try {
    const respGetAdminServer = await api.server.server.getServer({
      query: {
        'as-admin': 'true',
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,
        ...(serviceSelection.value !== 'all' && { service_id: serviceSelection.value }),
        ...(paymentSelection.value !== 'all' && { status: paymentSelection.value }),
        ...(networkSelection.value !== 'all' && { public: networkSelection.value }),
        ...(ipInput.value !== '' && { 'ip-contain': ipInput.value }),
        ...(remarkInput.value !== '' && { remark: remarkInput.value }),
        ...(creatorSelection.value === 'user-id' && creatorInput.value !== '' && { 'user-id': creatorInput.value }),
        ...(creatorSelection.value === 'username' && creatorInput.value !== '' && { username: creatorInput.value }),
        ...(groupSelection.value === 'exclude-vo' && { 'exclude-vo': 'true' }),
        ...(groupSelection.value === 'vo-id' && groupInput.value !== '' && { 'vo-id': groupInput.value }),
        ...(groupSelection.value === 'vo-name' && groupInput.value !== '' && { 'vo-name': groupInput.value })
      }
    })
    // 拿到rows值，给table用
    rows.value = respGetAdminServer.data.servers
    // pagination count
    pagination.value.count = respGetAdminServer.data.count

    // 更新每个server status
    for (const server of rows.value) {
      // status -> -1，UI则显示为获取中
      server.status = -1

      // 异步获取status
      new Promise((resolve) => resolve(loadSingleServerStatus(server.id)))
        .then(value => {
          server.status = value as number
        })
        .catch(() => {
          server.status = 0
        })
    }
  } catch (exception) {
    exceptionNotifier(exception)
  }
  // table stop loading
  isLoading.value = false
}

// 复位分页
const resetPageSelection = () => {
  pagination.value.page = 1
}

// 重置所有搜索条件
const resetFilters = () => {
  serviceSelection.value = 'all'
  paymentSelection.value = 'all'
  networkSelection.value = 'all'
  ipInput.value = ''
  remarkInput.value = ''
  creatorSelection.value = 'all'
  creatorInput.value = ''
  groupSelection.value = 'all'
  groupInput.value = ''
}

// onMounted时加载初始table第一页
onMounted(loadAdminServers)

// 分栏定义
const columns = computed(() => [
  {
    name: 'ip',
    label: (() => tc('components.server.ServeTable.ip_address'))(),
    field: 'ip',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  {
    name: 'serviceNode',
    label: (() => tc('components.server.ServeTable.service_node'))(),
    field: 'serviceNode',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px; word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'image',
    label: (() => tc('components.server.ServeTable.operating_system'))(),
    field: 'image',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; min-width: 80px; max-width: 100px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'configuration',
    label: (() => tc('components.server.ServeTable.hardware_configuration'))(),
    field: 'configuration',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'group',
    label: (() => tc('GROUP'))(),
    field: 'group',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'user',
    label: (() => tc('创建者'))(),
    field: 'user',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; max-width: 150px; word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'billing',
    label: (() => tc('components.server.ServeTable.billing_method'))(),
    field: 'billing',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'note',
    label: (() => tc('components.server.ServeTable.remarks'))(),
    field: 'note',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; max-width: 100px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  // {
  //   name: 'vnc',
  //   label: (() => tc('components.server.ServeTable.remote_control'))(),
  //   field: 'vnc',
  //   align: 'center',
  //   classes: 'ellipsis',
  //   style: 'padding: 15px 0px',
  //   headerStyle: 'padding: 0 2px'
  // },
  {
    name: 'creation',
    label: (() => tc('CREATION'))(),
    field: 'creation',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'expiration',
    label: (() => tc('EXPIRATION'))(),
    field: 'expiration',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'status',
    label: (() => tc('components.server.ServeTable.status'))(),
    field: 'status',
    align: 'center',
    style: 'padding: 15px 0px; width: 100px', // 固定宽度防止更新状态时抖动
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'operation',
    label: (() => tc('components.server.ServeTable.operation'))(),
    field: 'operation',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px;width: 100px;',
    headerStyle: 'padding: 0 2px'
  }])

// 被pagination组件使用
const pagination = ref({
  page: 1, // 当前页码
  rowsPerPage: 10, // 每页条数
  count: 0 // 总共条数
})

// row selection
const rowSelection = ref<ServerInterface[]>([])
const clearRowSelection = () => {
  rowSelection.value = []
}

const deleteServer = (server: ServerInterface) => {
  Dialog.create({
    class: 'dialog-primary',
    title: `确认删除：${server.ipv4}`,
    focus: 'cancel',
    message: `云主机用户: ${server.user.username}`,
    ok: {
      label: i18n.global.tc('store.dialog.confirm'),
      push: false,
      // flat: true,
      outline: true,
      color: 'primary'
    },
    cancel: {
      label: i18n.global.tc('store.dialog.cancel'),
      push: false,
      flat: false,
      unelevated: true,
      color: 'primary'
    }
  }).onOk(async () => {
    Notify.create({
      classes: 'notification-primary shadow-15',
      textColor: 'primary',
      spinner: true,
      icon: 'check_circle',
      message: `正在删除云主机: ${server.ipv4}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 3000,
      multiLine: false
    })

    try {
      // 解除删除锁
      void await api.server.server.postServerLock({
        path: { id: server.id },
        query: {
          lock: 'free',
          'as-admin': true
        }
      })
      // 删除云主机
      void await api.server.server.postServerAction({
        path: { id: server.id },
        body: { action: 'delete_force' },
        query: { 'as-admin': true }
      })
      Notify.create({
        classes: 'notification-positive shadow-15',
        textColor: 'positive',
        // spinner: true,
        icon: 'check_circle',
        message: `云主机删除成功: ${server.ipv4}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      // load server，但是不reset page selection，保持在原位，减少页面跳动
      loadAdminServers()
    } catch (exception) {
      exceptionNotifier(exception)
    }
  })
}

const stopServer = (server: ServerInterface) => {
  Dialog.create({
    class: 'dialog-primary',
    title: `确认关机：${server.ipv4}`,
    focus: 'cancel',
    message: `云主机用户: ${server.user.username}`,
    ok: {
      label: i18n.global.tc('store.dialog.confirm'),
      push: false,
      // flat: true,
      outline: true,
      color: 'primary'
    },
    cancel: {
      label: i18n.global.tc('store.dialog.cancel'),
      push: false,
      flat: false,
      unelevated: true,
      color: 'primary'
    }
  }).onOk(async () => {
    Notify.create({
      classes: 'notification-primary shadow-15',
      textColor: 'primary',
      spinner: true,
      icon: 'check_circle',
      message: `正在关机云主机: ${server.ipv4}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 3000,
      multiLine: false
    })

    try {
      // 解除操作锁
      void await api.server.server.postServerLock({
        path: { id: server.id },
        query: {
          lock: 'lock-delete',
          'as-admin': true
        }
      })

      // 关机云主机
      void await api.server.server.postServerAction({
        path: { id: server.id },
        body: { action: 'poweroff' },
        query: { 'as-admin': true }
      })

      Notify.create({
        classes: 'notification-positive shadow-15',
        textColor: 'positive',
        // spinner: true,
        icon: 'check_circle',
        message: `云主机关机成功: ${server.ipv4}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      // load server，但是不reset page selection，保持在原位，减少页面跳动
      loadAdminServers()
    } catch (exception) {
      exceptionNotifier(exception)
    }
  })
}

</script>

<template>
  <div class="ServerDeployed">

    <div class=" column items-start justify-between q-mb-lg">

      <div class="col row full-width items-center justify-start q-pb-sm">

        <div class="col row q-gutter-x-md">
          <q-select class="col-auto"
                    style="min-width: 170px; max-width: 250px;"
                    :label-color="serviceSelection !== 'all' ? 'primary' : ''"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选服务单元')"
                    v-model="serviceSelection"
                    :options="serviceOptions"
                    emit-value
                    map-options
                    option-value="value"
                    :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
            <!--当前选项的内容插槽-->
            <!--          <template v-slot:selected-item="scope">-->
            <!--                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
            <!--                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}-->
            <!--                </span>-->
            <!--          </template>-->

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-tooltip>
                  <div v-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'enable'">
                    服务单元运行中
                  </div>
                  <div v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'">
                    服务单元暂停服务
                  </div>
                  <div v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'">
                    服务单元已删除
                  </div>
                  <div v-else>
                    全部服务单元
                  </div>
                </q-tooltip>
                <q-item-section avatar>
                  <q-icon v-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'enable'"
                          color="light-green" name="play_arrow"/>
                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'" color="red"
                          name="pause"/>
                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'"
                          color="black" name="clear"/>
                  <q-icon v-else color="primary" name="done_all"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>

          </q-select>

          <q-select class="col-auto"
                    style="min-width: 170px;"
                    :label-color="paymentSelection !== 'all' ? 'primary' : ''"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选云主机计费方式')"
                    v-model="paymentSelection"
                    :options="paymentOptions"
                    emit-value
                    map-options
                    option-value="value"
                    option-label="label"
          >
            <!--当前选项的内容插槽-->
            <!--          <template v-slot:selected-item="scope">-->
            <!--                <span :class="validSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
            <!--                  {{ scope.opt.label }}-->
            <!--                </span>-->
            <!--          </template>-->
          </q-select>

          <q-select class="col-auto"
                    style="min-width: 170px;"
                    :label-color="networkSelection !== 'all' ? 'primary' : ''"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选网络类型')"
                    v-model="networkSelection"
                    :options="networkOptions"
                    emit-value
                    map-options
                    option-value="value"
                    option-label="label"
          >
            <!--当前选项的内容插槽-->
            <!--          <template v-slot:selected-item="scope">-->
            <!--                <span :class="networkSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
            <!--                  {{ scope.opt.label }}-->
            <!--                </span>-->
            <!--          </template>-->
          </q-select>

          <q-input
            style="width: 250px;"
            :label-color="ipInput ? 'primary' : ''"
            v-model.trim="ipInput"
            outlined
            dense
            :label="tc('筛选IP地址关键字')"
            @keyup.enter="resetPageSelection();loadAdminServers();clearRowSelection()"
          >
            <template v-slot:append v-if="ipInput">
              <q-icon name="close" @click="ipInput = ''" class="cursor-pointer"/>
            </template>

          </q-input>

          <q-input
            style="width: 250px;"
            :label-color="remarkInput ? 'primary' : ''"
            v-model.trim="remarkInput"
            outlined
            dense
            :label="tc('筛选云主机备注关键字')"
            @keyup.enter="resetPageSelection();loadAdminServers();clearRowSelection()"
          >
            <template v-slot:append v-if="remarkInput">
              <q-icon name="close" @click="remarkInput = ''" class="cursor-pointer"/>
            </template>

          </q-input>
        </div>

      </div>

      <div class="col row full-width items-center justify-between">

        <div class="col row q-gutter-x-md">

          <div class="col-auto row items-center no-wrap">
            <q-select class="col-auto"
                      style="min-width: 170px;"
                      outlined
                      dense
                      stack-label
                      :label="tc('筛选项目组')"
                      :label-color="((groupSelection === 'exclude-vo') || (groupSelection !== 'all' && groupSelection !== 'exclude-vo' && groupInput)) ? 'primary' : ''"
                      v-model="groupSelection"
                      :options="groupOptions"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
            >
              <!--当前选项的内容插槽-->
              <!--            <template v-slot:selected-item="scope">-->
              <!--                <span :class="groupSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
              <!--                  {{ scope.opt.label }}-->
              <!--                </span>-->
              <!--            </template>-->
            </q-select>

            <q-input
              style="width: 250px;"
              v-if="groupSelection !== 'all' && groupSelection !== 'exclude-vo'"
              :label-color="groupInput ? 'primary' : ''"
              v-model.trim="groupInput"
              outlined
              dense
              :label="groupSelection==='vo-name' ? tc('项目组名关键字') : groupSelection==='vo-id' ? tc('准确的项目组ID') : ''"
              @keyup.enter="resetPageSelection();loadAdminServers();clearRowSelection()"
            >
              <template v-slot:append v-if="groupInput">
                <q-icon name="close" @click="groupInput = ''" class="cursor-pointer"/>
              </template>
            </q-input>

          </div>

          <div class="col-auto row items-center no-wrap">
            <q-select class="col-auto"
                      style="min-width: 170px;"
                      outlined
                      dense
                      stack-label
                      :label="tc('筛选创建者')"
                      :label-color="creatorInput ? 'primary' : ''"
                      v-model="creatorSelection"
                      :options="creatorOptions"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
            >
              <!--当前选项的内容插槽-->
              <!--            <template v-slot:selected-item="scope">-->
              <!--                <span :class="creatorSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
              <!--                  {{ scope.opt.label }}-->
              <!--                </span>-->
              <!--            </template>-->
            </q-select>

            <q-input
              style="width: 250px;"
              v-if="creatorSelection !== 'all'"
              :label-color="creatorInput ? 'primary' : ''"
              v-model.trim="creatorInput"
              outlined
              dense
              :label="creatorSelection==='username' ? tc('用户名关键字') : creatorSelection==='user-id' ? tc('准确的用户ID') : ''"
              @keyup.enter="resetPageSelection();loadAdminServers();clearRowSelection()"
            >
              <template v-slot:append v-if="creatorInput">
                <q-icon name="close" @click="creatorInput = ''" class="cursor-pointer"/>
              </template>
            </q-input>
          </div>

        </div>

        <div class="col-auto q-gutter-x-sm">
          <q-btn flat no-caps dense color="primary"
                 @click="resetFilters();resetPageSelection();loadAdminServers();clearRowSelection()">
            重置
          </q-btn>
          <q-btn unelevated no-caps color="primary"
                 @click="resetPageSelection();loadAdminServers();clearRowSelection()">
            搜索
          </q-btn>
        </div>
      </div>

    </div>

    <div class="row items-center justify-between">

      <div v-if="pagination.count" class="col-auto row items-center">

        <div class="text-grey">{{ tc('选中总计') }}</div>
        <div class="">{{ rowSelection.length }}</div>

        <!--        <q-btn class="col-auto q-mx-md" flat no-caps dense color="primary">批量删除</q-btn>-->

      </div>

      <div class="col-auto row items-center">
        <div class="col-auto text-grey">{{ tc('搜索结果总计') }}</div>
        <div class="col-auto ">{{ pagination.count }}</div>
      </div>

    </div>

    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="rows"
      :columns="columns"
      :loading="isLoading"
      color="primary"
      :loading-label="tc('网络请求中，请稍候...')"
      :no-data-label="tc('无搜索结果')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      row-key="id"
      selection="multiple"
      v-model:selected="rowSelection"
    >

      <template v-slot:header-selection="scope">
        <q-checkbox style="" v-model="scope.selected" dense size="xs"/>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">

          <q-td auto-width>
            <q-checkbox v-model="props.selected" dense size="xs"/>
          </q-td>

          <q-td key="ip" :props="props">

            <div class="column">
              {{ props.row.ipv4 }}

              <div class="row justify-center">

                <q-btn
                  class="text-caption"
                  flat
                  dense
                  color="primary"
                  @click="clickToCopy(props.row.ipv4)">
                  {{ tc('复制IP') }}
                </q-btn>

                <q-btn
                  class="text-caption"
                  flat
                  dense
                  color="primary"
                  @click="clickToCopy(props.row.id)"
                >

                  {{ tc('复制ID') }}

                  <q-tooltip>{{ props.row.id }}</q-tooltip>

                </q-btn>

              </div>

            </div>

          </q-td>

          <q-td key="serviceNode" :props="props">
            <div>
              {{
                i18n.global.locale === 'zh' ? props.row.service.name : props.row.service.name_en
              }}
            </div>
            <div>
              {{
                i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.service.id]?.data_center.id]?.name :
                  store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.service.id]?.data_center.id]?.name_en
              }}
            </div>

            <CloudPlatformLogo :platform-name="props.row.service.service_type"/>

          </q-td>

          <q-td key="image" :props="props">
            <OsLogo :os-name="props.row.image"/>
            <div> {{ props.row.image }}</div>
          </q-td>

          <q-td key="configuration" :props="props">
            <div> {{ props.row.vcpus }} {{
                i18n.global.locale === 'zh' ? '核' : props.row.vcpus > 1 ? 'cores' : 'core'
              }}
            </div>
            <div>{{ props.row.ram }}GB</div>
          </q-td>

          <q-td key="group" :props="props">
            <div v-if="props.row.classification === 'personal'"> 个人</div>
            <div v-if="props.row.classification === 'vo'"> 项目组</div>
          </q-td>

          <q-td key="user" :props="props">
            {{ props.row.user.username }}
          </q-td>

          <q-td key="billing" :props="props">
            {{ props.row.pay_type }}
          </q-td>

          <q-td key="note" :props="props">
            {{ props.row.remarks }}
          </q-td>

          <!--          <q-td key="vnc" :props="props">-->
          <!--            vnc-->
          <!--          </q-td>-->
          <!--          -->
          <q-td key="creation" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{
                  new Date(props.row.creation_time).toLocaleString(i18n.global.locale as string).split(' ')[0]
                }}
              </div>
              <div>{{
                  new Date(props.row.creation_time).toLocaleString(i18n.global.locale as string).split(' ')[1]
                }}
              </div>
            </div>

            <div v-else>
              <div>{{
                  new Date(props.row.creation_time).toLocaleString(i18n.global.locale as string).split(',')[0]
                }}
              </div>
              <div>{{
                  new Date(props.row.creation_time).toLocaleString(i18n.global.locale as string).split(',')[1]
                }}
              </div>
            </div>
          </q-td>

          <q-td key="expiration" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div v-if="props.row.expiration_time === null">
                长期
              </div>
              <div v-else>
                <div>{{
                    new Date(props.row.expiration_time).toLocaleString(i18n.global.locale as string).split(' ')[0]
                  }}
                </div>
                <div>{{
                    new Date(props.row.expiration_time).toLocaleString(i18n.global.locale as string).split(' ')[1]
                  }}
                </div>
              </div>
            </div>

            <div v-else>
              <div v-if="props.row.expiration_time === null">
                长期
              </div>
              <div v-else>
                <div>{{
                    new Date(props.row.expiration_time).toLocaleString(i18n.global.locale as string).split(',')[0]
                  }}
                </div>
                <div>{{
                    new Date(props.row.expiration_time).toLocaleString(i18n.global.locale as string).split(',')[1]
                  }}
                </div>
              </div>
            </div>
          </q-td>

          <q-td key="status" :props="props" class="non-selectable">
            <ServerStatusLocal :server="props.row" @click="updateSingleSeverStatusInRows(props.row.id)"/>
          </q-td>

          <q-td key="operation" :props="props">
            <div class="column">

              <q-btn flat dense no-caps color="primary" @click="store.gotoVNC(props.row.id, true)">
                远程控制
              </q-btn>

              <q-btn flat dense no-caps color="primary" @click="stopServer(props.row)">
                关机
              </q-btn>

              <q-btn flat dense no-caps color="negative" @click="deleteServer(props.row)">
                删除
              </q-btn>

            </div>
          </q-td>

        </q-tr>
      </template>

      <template v-slot:bottom>
        <div class="row full-width items-center justify-end">
          <div class="col row items-center justify-end text-grey">
            <q-select color="grey"
                      v-model="pagination.rowsPerPage"
                      :options="[10,20,30,50,100]"
                      dense
                      options-dense
                      borderless
                      @update:model-value="resetPageSelection();loadAdminServers();clearRowSelection()">
              <!--当前选项的内容插槽-->
              <!--                      <template v-slot:selected-item>-->
              <!--                            <span class="text-grey">-->
              <!--                            {{ pagination.rowsPerPage }}-->
              <!--                            </span>-->
              <!--                      </template>-->
            </q-select>
            项/页
          </div>

          <q-pagination v-model="pagination.page"
                        :max="Math.ceil(pagination.count / pagination.rowsPerPage )"
                        :max-pages="9"
                        direction-links
                        outline
                        :ripple="false"
                        @update:model-value="loadAdminServers();clearRowSelection()"
          />
        </div>
      </template>
    </q-table>

  </div>
</template>

<style lang="scss" scoped>
.ServerDeployed {
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

.border-area {
  width: 1230px;
  //margin-top: 10px;
  padding: 20px 20px;
  //height: 120px;
  border: $grey-4 1px solid;
  border-radius: 5px;
}
</style>
