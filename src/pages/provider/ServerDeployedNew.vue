<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const searchFactors = ref<string[]>([])

// service_id下拉列表
const serviceOptions = computed(() => store.getServiceOptions)
const serviceSelection = ref('0')

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
  {
    name: 'vnc',
    label: (() => tc('components.server.ServeTable.remote_control'))(),
    field: 'vnc',
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
    style: 'padding: 15px 0px;width: 150px;',
    headerStyle: 'padding: 0 2px'
  }])

// 被pagination组件使用。
const pagination = ref({
  page: 1, // 当前页码
  rowsPerPage: 10, // 每页条数
  count: 0 // 总共条数
})

// 更新表格，并更细count值
const reloadTable = async () => {
  // 更新table并保存count值
  // pagination.value.count = await $store.dispatch('provider/loadAdminQuotaApplicationTable', {
  //   page: pagination.value.page,
  //   pageSize: pagination.value.rowsPerPage,
  //   serviceId: serviceSelection.value,
  //   status: statusSelection.value
  // })
}

// 当两个筛选参数变化时,当rowsPerPage变化时
const resetAndReloadTable = () => {
  // 分页信息复位
  pagination.value.page = 1
  // 更新table
  void reloadTable()
}

// onMounted时加载初始table第一页
onMounted(reloadTable)

</script>

<template>
  <div class="ServerDeployed">

    <!--    <div class="row content-area">-->

    <div class="row">
      {{ tc('pages.provider.ServerDeployedNew.search_condition') }}:
    </div>
    <!--项目组详情开始-->
    <div class="row items-center justify-evenly detail-area">

      <div class="col-auto row items-center">
        <q-checkbox v-model="searchFactors" val="ip" color="primary">
          {{ tc('pages.provider.ServerDeployedNew.ip_address') }}
        </q-checkbox>
        <q-input outlined dense/>
      </div>

      <div class="col-auto row items-center">
        <q-checkbox v-model="searchFactors" val="username" color="primary">
          {{ tc('pages.provider.ServerDeployedNew.user_account') }}
        </q-checkbox>
        <q-input outlined dense/>
      </div>

      <div class="col-auto row items-center">
        <q-checkbox v-model="searchFactors" val="vo" color="primary">
          {{ tc('pages.provider.ServerDeployedNew.group_id') }}
        </q-checkbox>
        <q-input outlined dense/>
      </div>

      <div class="col-auto row items-center">
        <q-checkbox v-model="searchFactors" val="service" color="primary">
          {{ tc('pages.provider.ServerDeployedNew.service_node') }}
        </q-checkbox>
        <q-select outlined dense stack-label :label="tc('pages.provider.ServerDeployedNew.service_node_filter')" v-model="serviceSelection"
                  :options="serviceOptions" emit-value map-options option-value="value"
                  :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
          <!--当前选项的内容插槽-->
          <template v-slot:selected-item="scope">
                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
          </template>
        </q-select>
      </div>

    </div>

    <!--    </div>-->

    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :loading="false"
      color="primary"
      loading-label="网络请求中，请稍候..."
      no-data-label="暂无配额申请"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
    >
      <template v-slot:body="props">
        <q-tr :props="props">

          <q-td key="duration_days" :props="props">
            test
          </q-td>

        </q-tr>
      </template>

      <!--      <template v-slot:bottom>-->
      <!--   todo 批量操作 -->
      <!--      </template>-->
    </q-table>

    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="primary" />
    </q-page-scroller>

    <q-separator/>

    <div v-if="pagination.count" class="row justify-between items-center q-gutter-sm">

      <div class="row items-center justify-between text-grey">
        共计 <span class="text-black">{{ pagination.count }}</span> 项筛选结果，

        <q-select color="grey" v-model="pagination.rowsPerPage" :options="[5,10,15,20,25,30]" dense options-dense
                  borderless
                  @update:model-value="resetAndReloadTable">
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
                    @update:model-value="reloadTable"
      />

    </div>

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
