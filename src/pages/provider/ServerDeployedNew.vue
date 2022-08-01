<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'
import { Dialog, Notify } from 'quasar'

import type { ServerInterface } from 'stores/store'

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

// service_id下拉列表
const serviceOptions = computed(() => store.getServiceOptionsByRole(store.items.fedRole === 'federal-admin'))
const serviceSelection = ref('0')

// 云主机是否过期
const validOptions = computed(() => [
  {
    value: null,
    label: `${tc('全部状态')}`
  },
  {
    value: true,
    label: `${tc('预付费-已过期')}`
  }
  // {
  //   value: false,
  //   label: `${tc('过期')}`
  // }
])
const validSelection = ref(null)

// 用户/项目组搜索条件下拉列表
const filterOptions = computed(() => [
  {
    value: '',
    label: `${tc('全部用户')}`
  },
  {
    value: 'username',
    label: `${tc('用户名')}`
  },
  {
    value: 'user-id',
    label: `${tc('用户ID')}`
  },
  {
    value: 'vo-id',
    label: `${tc('项目组ID')}`
  }
])
const filterSelection = ref('')

const filterInput = ref('')
const ipInput = ref('')

const isLoading = ref(false)
const rows = ref<ServerInterface[]>()

// 根据当前搜索条件，更新rows，并更新count值
const loadAdminServers = async () => {
  // table loading
  isLoading.value = true
  // request
  try {
    const respGetAdminServer = await api.server.server.getServer({
      query: {
        'as-admin': true,
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,
        ...(serviceSelection.value !== '0' && { service_id: serviceSelection.value }),
        ...(validSelection.value !== null && { expired: validSelection.value }),
        ...(filterSelection.value === 'username' && filterInput.value !== '' && { username: filterInput.value }),
        ...(filterSelection.value === 'user-id' && filterInput.value !== '' && { 'user-id': filterInput.value }),
        ...(filterSelection.value === 'vo-id' && filterInput.value !== '' && { 'vo-id': filterInput.value }),
        ...(ipInput.value !== '' && { 'ip-contain': ipInput.value })
      }
    })
    if (respGetAdminServer.status.toString().startsWith('2')) {
      // 拿到rows值，给table用
      rows.value = respGetAdminServer.data.servers
      // pagination count
      pagination.value.count = respGetAdminServer.data.count
    }
  } catch (error) {
    if (error instanceof Error) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'mdi-alert',
        textColor: 'negative',
        message: error.message,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
    }
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
  serviceSelection.value = '0'
  validSelection.value = null
  filterSelection.value = ''
  filterInput.value = ''
  ipInput.value = ''
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
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'image',
    label: (() => tc('components.server.ServeTable.operating_system'))(),
    field: 'image',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 100px;padding: 15px 0px'
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
    label: (() => tc('USER'))(),
    field: 'user',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
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
    style: 'max-width: 100px;padding: 15px 0px;white-space: normal;'
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
  // {
  //   name: 'status',
  //   label: (() => tc('components.server.ServeTable.status'))(),
  //   field: 'status',
  //   align: 'center',
  //   style: 'padding: 15px 0px; width: 100px', // 固定宽度防止更新状态时抖动
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
    name: 'operation',
    label: (() => tc('components.server.ServeTable.operation'))(),
    field: 'operation',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px;width: 150px;',
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
      const respUnlockServer = await api.server.server.postServerLock({
        path: { id: server.id },
        query: {
          lock: 'free',
          'as-admin': true
        }
      })

      if (respUnlockServer.status !== 200) {
        throw new Error()
      }

      // 删除云主机
      const respDeleteServer = await api.server.server.postServerAction({
        path: { id: server.id },
        body: { action: 'delete_force' },
        query: { 'as-admin': true }
      })

      if (respDeleteServer.status === 200) {
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
      } else {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: `云主机删除失败: ${server.ipv4}`,
          caption: `${respDeleteServer.data.message}`,
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: error.message,
          position: 'bottom',
          closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      }
    }
  })
}

</script>

<template>
  <div class="ServerDeployed">

    <div class="row items-center justify-between q-pb-md">

      <div class="col row items-center justify-start q-gutter-x-lg">

        <q-select class="col-auto"
                  style="min-width: 150px;"
                  :label-color="serviceSelection !== '0' ? 'primary' : ''"
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
          <template v-slot:selected-item="scope">
                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
          </template>
        </q-select>

        <q-select class="col-auto"
                  style="min-width: 150px;"
                  :label-color="validSelection !== null ? 'primary' : ''"
                  outlined
                  dense
                  stack-label
                  :label="tc('筛选云主机管理状态')"
                  v-model="validSelection"
                  :options="validOptions"
                  emit-value
                  map-options
                  option-value="value"
                  option-label="label"
        >
          <!--当前选项的内容插槽-->
          <template v-slot:selected-item="scope">
                <span :class="validSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ scope.opt.label }}
                </span>
          </template>
        </q-select>

        <div class="col-auto row items-center no-wrap">
          <q-select class="col-auto"
                    style="min-width: 150px;"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选用户')"
                    :label-color="filterInput ? 'primary' : ''"
                    v-model="filterSelection"
                    :options="filterOptions"
                    emit-value
                    map-options
                    option-value="value"
                    option-label="label"
          >
            <!--当前选项的内容插槽-->
            <template v-slot:selected-item="scope">
                <span :class="filterSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ scope.opt.label }}
                </span>
            </template>
          </q-select>

          <q-input
            style="width: 250px;"
            v-if="filterSelection !== ''"
            :label-color="filterInput ? 'primary' : ''"
            v-model="filterInput"
            outlined
            dense
            :label="filterSelection==='username' ? tc('指定用户名') : filterSelection==='user-id' ? tc('指定用户ID') : tc('指定项目组ID')"
          >
            <template v-slot:append v-if="filterInput">
              <q-icon name="close" @click="filterInput = ''" class="cursor-pointer"/>
            </template>
          </q-input>
        </div>

        <q-input
          style="width: 250px;"
          :label-color="ipInput ? 'primary' : ''"
          v-model="ipInput"
          outlined
          dense
          :label="tc('筛选IP地址关键字')"
        >
          <template v-slot:append v-if="ipInput">
            <q-icon name="close" @click="ipInput = ''" class="cursor-pointer"/>
          </template>

        </q-input>

        <q-btn flat no-caps dense color="primary" @click="resetFilters();resetPageSelection();loadAdminServers()">
          重置
        </q-btn>

      </div>

      <div class="col-auto row justify-end">
        <q-btn unelevated no-caps color="primary" @click="resetPageSelection();loadAdminServers()">
          搜索
        </q-btn>
      </div>
    </div>

    <div class="row items-center">
      <div class="text-grey">搜索结果共计:</div>
      <div>{{ pagination.count }}</div>
    </div>

    <div v-if="pagination.count" class="row items-center justify-between q-pb-sm">

      <div class="row items-center">
        <div> 选中{{ rowSelection.length }}台</div>
        <!--        <q-btn flat dense no-caps color="primary">批量删除</q-btn>-->
      </div>

      <div class="row">
        <div class="row items-center justify-between text-grey">
          <q-select color="grey"
                    v-model="pagination.rowsPerPage"
                    :options="[10,15,20,30,50,100]"
                    dense
                    options-dense
                    borderless
                    @update:model-value="resetPageSelection();loadAdminServers()">
            <!--          &lt;!&ndash;当前选项的内容插槽&ndash;&gt;-->
            <!--          <template v-slot:selected-item>-->
            <!--                <span class="text-grey">-->
            <!--                {{ pagination.rowsPerPage }}-->
            <!--                </span>-->
            <!--          </template>-->
          </q-select>
          项/页
        </div>

        <q-pagination v-model="pagination.page"
                      :max="Math.ceil(pagination.count / pagination.rowsPerPage )"
                      :max-pages="9"
                      direction-links
                      outline
                      :ripple="false"
                      @update:model-value="loadAdminServers"
        />
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
      :no-data-label="tc('暂无')"
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
            {{ props.row.ipv4 }}
          </q-td>

          <q-td key="serviceNode" :props="props">
            <div>
              {{
                i18n.global.locale === 'zh' ? store.tables.serviceTable.byId[props.row.service.id]?.name : store.tables.serviceTable.byId[props.row.service.id]?.name_en
              }}
            </div>
            <div>
              {{
                i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.service.id]?.data_center]?.name :
                  store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.service.id]?.data_center]?.name_en
              }}
            </div>
          </q-td>

          <q-td key="image" :props="props">
            {{ props.row.image }}
          </q-td>

          <q-td key="configuration" :props="props">
            <div> {{ props.row.vcpus }} {{
                i18n.global.locale === 'zh' ? '核' : props.row.vcpus > 1 ? 'cores' : 'core'
              }}
            </div>
            <div>{{ props.row.ram / 1024 }}GB</div>
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

          <q-td key="vnc" :props="props">
            vnc
          </q-td>

          <q-td key="status" :props="props">
            status
          </q-td>

          <q-td key="creation" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="expiration" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div v-if="props.row.expiration_time === null">
                长期
              </div>
              <div v-else>
                <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
                <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
              </div>
            </div>

            <div v-else>
              <div v-if="props.row.expiration_time === null">
                长期
              </div>
              <div v-else>
                <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
                <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
              </div>
            </div>
          </q-td>

          <q-td key="operation" :props="props">
            <q-btn unelevated no-caps color="primary" @click="deleteServer(props.row)">
              删除
            </q-btn>
          </q-td>

        </q-tr>
      </template>

      <template v-slot:bottom>
        <!--   todo 批量操作 -->
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

.detail-area {
  width: 1230px;
  margin-top: 10px;
  padding: 15px 0;
  height: 120px;
  border: $grey-4 1px solid;
  border-radius: 5px;
}
</style>
