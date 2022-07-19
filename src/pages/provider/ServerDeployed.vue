<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

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

// 获取列表数据
const rows = computed(() => store.getAdminServers)
const filterOptions = computed(() => store.getServices)

// 列表分栏定义
const columns = [
  {
    name: 'ipv4',
    label: (() => tc('pages.provider.ServerDeployed.ip_address'))(),
    field: 'ipv4',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'service',
    label: (() => tc('pages.provider.ServerDeployed.service_node'))(),
    field: 'service',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'user',
    label: (() => tc('pages.provider.ServerDeployed.user'))(),
    field: 'user',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'remark',
    label: (() => tc('pages.provider.ServerDeployed.remark'))(),
    field: 'remark',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'image',
    label: (() => tc('pages.provider.ServerDeployed.operating_system'))(),
    field: 'image',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'configuration',
    label: (() => tc('pages.provider.ServerDeployed.cpu_and_ram'))(),
    field: 'configuration',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'public_ip',
    label: (() => tc('pages.provider.ServerDeployed.network_type'))(),
    field: 'public_ip',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'creation_time',
    label: (() => tc('pages.provider.ServerDeployed.creation_time'))(),
    field: 'creation_time',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'expiration_time',
    label: (() => tc('pages.provider.ServerDeployed.expiration_time'))(),
    field: 'expiration_time',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  }
  // {
  //   name: 'center_quota',
  //   label: '配额类型',
  //   field: 'center_quota',
  //   align: 'center',
  //   style: 'padding: 15px 0px',
  //   headerStyle: 'padding: 0 5px'
  // }
]

// todo WTF are these any???!!!
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
const searchQuery: any = ref({
  page: 1,
  page_size: 15,
  service_id: {
    label: (() => tc('pages.provider.ServerDeployed.total_service'))(),
    value: ''
  },
  'as-admin': true
})
const paginationTable = ref({
  page: 1,
  count: 0,
  rowsPerPage: 15
})
const disable = ref(true)
const options = ref([(() => tc('pages.provider.ServerDeployed.user_id'))(), (() => tc('pages.provider.ServerDeployed.user_account'))(), 'VOID'])

const model = ref(null)
const text = ref('')
const change = () => {
  delete searchQuery.value.username
  delete searchQuery.value['user-id']
  delete searchQuery.value['vo-id']
  if (model.value !== null) {
    disable.value = false
  } else {
    text.value = ''
    disable.value = true
  }
}

/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
const getData = (query: any) => {
  if (Object.prototype.toString.call(searchQuery.value.service_id) === '[object Object]') {
    searchQuery.value.service_id = ''
  }
  const response = store.loadAdminServerTable(query)
  return response
}
const search = () => {
  searchQuery.value.page = 1
  paginationTable.value.count = 0
  paginationTable.value.page = 1
  if (model.value === null) {
    void getData(searchQuery.value).then((res) => {
      paginationTable.value.count = res.data.count
    }).catch(() => {
      paginationTable.value.count = 0
    })
  } else {
    if (model.value === (() => tc('pages.provider.ServerDeployed.user_id'))()) {
      searchQuery.value['user-id'] = text.value
    } else if (model.value === (() => tc('pages.provider.ServerDeployed.user_account'))()) {
      searchQuery.value.username = text.value
    } else {
      searchQuery.value['vo-id'] = text.value
    }
    void getData(searchQuery.value).then((res) => {
      paginationTable.value.count = res.data.count
    }).catch(() => {
      paginationTable.value.count = 0
    })
  }
}
const changePagination = (val: number) => {
  searchQuery.value.page = val
  void getData(searchQuery.value)
}
const changePageSize = () => {
  searchQuery.value.page_size = paginationTable.value.rowsPerPage
  searchQuery.value.page = 1
  paginationTable.value.page = 1
  void getData(searchQuery.value)
}
onMounted(() => {
  void getData(searchQuery.value).then((res) => {
    paginationTable.value.count = res.data.count
  })
})
</script>

<template>
  <div class="ServerDeployed">
    <div class="row q-col-gutter-md q-pb-md">
      <div class="row col-6 items-center q-col-gutter-xs">
        <div class="col-2 text-subtitle1">{{ tc('pages.provider.ServerDeployed.search_condition') }}:</div>
        <q-select outlined dense clearable v-model="model" :options="options" :label="tc('pages.provider.ServerDeployed.select')" class="col-5"
                  @update:model-value="change"/>
        <q-input outlined dense v-model="text" :label="tc('pages.provider.ServerDeployed.enter')" :disable="disable" class="col-5"/>
      </div>
      <div class="col-5 row items-center">
        <q-select map-options emit-value outlined dense stack-label :label="tc('pages.provider.ServerDeployed.service_select')" :options="filterOptions"
                  v-model="searchQuery.service_id" class="col-7" color="primary"/>
        <q-btn outline color="primary" text-color="black" :label="tc('pages.provider.ServerDeployed.search')" class="col-3 q-ml-md" @click="search"/>
      </div>
    </div>
    <q-table
      flat
      table-header-class="bg-grey-1 text-grey"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :loading="store.tables.adminServerTable.status === 'loading'"
      color="primary"
      :loading-label="tc('pages.provider.ServerDeployed.requesting')"
      :no-data-label="tc('pages.provider.ServerDeployed.no_server')"
      hide-pagination
      :pagination="{ rowsPerPage: 0 }"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="ipv4" :props="props">
            {{ props.row.ipv4 }}
            <!--            <q-btn-->
            <!--              class="q-ma-none" :label="props.row.ipv4" color="primary" padding="none" flat dense unelevated-->
            <!--              :to="{path: '/my/group_obsolete/server/detail/' + props.row.id}">-->
            <!--              <q-tooltip>-->
            <!--                {{ $t('进入云主机详情') }}-->
            <!--              </q-tooltip>-->
            <!--            </q-btn>-->
          </q-td>
          <q-td key="service" :props="props">
            <div>{{ store.tables.serviceTable.byId[props.row.service]?.name }}</div>
          </q-td>
          <q-td key="user" :props="props">
            {{ props.row.user.username }}
          </q-td>
          <q-td key="remark" :props="props">
            {{ props.row.remarks }}
          </q-td>
          <q-td key="image" :props="props">
            {{ props.row.image }}
          </q-td>
          <q-td key="configuration" :props="props">
            {{ `${props.row.vcpus}tc('pages.provider.ServerDeployed.cores')/${props.row.ram / 1024}GB` }} //
          </q-td>
          <q-td key="public_ip" :props="props">
            {{ props.row.public_ip === true ? tc('pages.provider.ServerDeployed.public_net') : tc('pages.provider.ServerDeployed.private_net') }} //
          </q-td>
          <q-td key="creation_time" :props="props">
            {{ new Date(props.row.creation_time).toLocaleString() }}
          </q-td>
          <q-td key="expiration_time" :props="props">
            {{ new Date(props.row.expiration_time).toLocaleString() }}
          </q-td>
<!--          <q-td key="center_quota" :props="props">-->
          <!--            {{ props.row.center_quota === 1 ? '私有配额' : '共享配额' }}-->
          <!--          </q-td>-->
        </q-tr>
      </template>
    </q-table>
    <q-separator/>
    <div class="row q-pa-sm text-grey justify-between items-center">
      <div class="row items-center">
        <span class="q-pr-md">{{ tc('pages.provider.ServerDeployed.total_server') }}：{{ paginationTable.count }}</span>
        <q-select color="grey" v-model="paginationTable.rowsPerPage" :options="[5,10,15,20,25,30]" dense options-dense
                  borderless @update:model-value="changePageSize">
        </q-select>
        <span>/{{ tc('pages.provider.ServerDeployed.page') }}</span>
      </div>
      <q-pagination
        v-model="paginationTable.page"
        :max="Math.ceil(paginationTable.count/paginationTable.rowsPerPage)"
        :max-pages="9"
        direction-links
        outline
        :ripple="false"
        @update:model-value="changePagination"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ServerDeployed {
}
</style>
