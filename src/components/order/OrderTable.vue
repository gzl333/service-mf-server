<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore, OrderInterface } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

const props = defineProps({
  orders: {
    type: Array as PropType<OrderInterface[]>,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false
  },
  isHideGroup: {
    type: Boolean,
    required: false
  },
  search: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// 分栏定义
const columns = computed(() => [
  {
    name: 'id',
    label: i18n.global.locale === 'zh' ? '订单ID' : 'Order ID',
    field: 'id',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  ...((props.isGroup && !props.isHideGroup) ? [{ // 是group且不hide时加入这个配置
    name: 'group',
    label: i18n.global.locale === 'zh' ? '所属组' : 'Group',
    field: 'group',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px;max-width: 120px;white-space: normal;'
  }] : []),
  {
    name: 'service',
    label: i18n.global.locale === 'zh' ? '服务节点' : 'Service Node',
    field: 'service',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'total',
    label: i18n.global.locale === 'zh' ? '订单金额' : 'Order Due',
    field: 'total',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 100px;padding: 15px 0px'
  },
  {
    name: 'pay',
    label: i18n.global.locale === 'zh' ? '支付金额' : 'Payment Due',
    field: 'pay',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'time',
    label: i18n.global.locale === 'zh' ? '下单时间' : 'Time',
    field: 'time',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'status',
    label: i18n.global.locale === 'zh' ? '状态' : 'Status',
    field: 'status',
    align: 'center',
    style: 'padding: 15px 0px; width: 100px', // 固定宽度防止更新状态时抖动
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'operation',
    label: i18n.global.locale === 'zh' ? '操作' : 'Operations',
    field: 'operation',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px;width: 150px;',
    headerStyle: 'padding: 0 2px'
  }])

// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()

// table row hover
const hoverRow = ref('')
const onMouseEnterRow = (rowName: string) => {
  hoverRow.value = rowName
}
const onMouseLeaveRow = () => {
  hoverRow.value = ''
}

// 搜索方法，可扩展成更模糊的
const searchMethod = (rows: OrderInterface[], terms: string): OrderInterface[] => rows.filter(order => order.id.toLowerCase().includes(terms) || order.total_amount.toLowerCase().includes(terms) || order.pay_amount.toLowerCase().includes(terms))

</script>

<template>
  <div class="OrderTable">
    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="orders"
      :columns="columns"
      row-key="name"
      :loading="isGroup ? store.tables.groupOrderTable.status === 'loading' : store.tables.personalOrderTable.status === 'loading' "
      color="primary"
      loading-label="网络请求中，请稍候..."
      no-data-label="暂无订单"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      :filter="search"
      :filter-method="searchMethod"
      no-results-label="无搜索结果"
    >

      <template v-slot:body="props">
        <q-tr :props="props"
              @mouseenter="onMouseEnterRow(props.row.name)"
              @mouseleave="onMouseLeaveRow"
        >
          <q-td key="id" :props="props">

            <q-btn
              class="q-ma-none" :label="props.row.id" color="primary" padding="none" flat dense unelevated no-caps
              @click="navigateToUrl(isGroup ? `/my/server/order/group/detail/${props.row.id}` : `/my/server/order/personal/detail/${props.row.id}`)">
              <q-tooltip>
                {{ tc('订单详情') }}
              </q-tooltip>
              <!--创建时间距离当下小于1小时则打上new标记-->
              <q-badge style="top:-10px;"
                       v-if="(new Date() - new Date(props.row.creation_time)) < 1000 * 60 * 60 * 1 "
                       color="light-green" floating transparent rounded align="middle">
                new
              </q-badge>
            </q-btn>

            <q-btn v-if="hoverRow === props.row.name"
                   class="col-shrink q-px-xs q-ma-none" flat dense icon="content_copy" size="xs" color="primary"
                   @click="clickToCopy(props.row.id)">
              <q-tooltip>
                {{ tc('复制到剪切板') }}
              </q-tooltip>
            </q-btn>
            <q-btn v-else
                   class="col-shrink q-px-xs q-ma-none invisible" flat dense icon="content_copy" size="xs">
            </q-btn>

          </q-td>

          <q-td v-if="isGroup && !isHideGroup" key="group" :props="props">
            <q-btn
              class="q-ma-none"
              color="primary"
              padding="none" flat dense unelevated
              :label="store.tables.groupTable.byId[props.row.vo_id]?.name"
              @click="navigateToUrl(`/my/server/group/detail/${props.row.vo_id}`)">
              <q-tooltip>
                {{ tc('项目组详情') }}
              </q-tooltip>
            </q-btn>
          </q-td>

          <q-td key="service" :props="props">
            <div>
              {{
                i18n.global.locale === 'zh' ? store.tables.serviceTable.byId[props.row.service_id]?.name : store.tables.serviceTable.byId[props.row.service_id]?.name_en
              }}
            </div>
            <div>
              {{
                i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.service_id]?.data_center]?.name :
                  store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.service_id]?.data_center]?.name_en
              }}
            </div>

            <div>
              <q-icon
                v-if="store.tables.serviceTable.byId[props.row.service_id]?.service_type.toLowerCase().includes('ev')">
                <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
              </q-icon>
            </div>

            <div>
              <q-icon
                v-if="store.tables.serviceTable.byId[props.row.service_id]?.service_type.toLowerCase().includes('open')">
                <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
              </q-icon>
            </div>
          </q-td>

          <q-td key="total" :props="props">
            {{ props.row.total_amount }}点
          </q-td>

          <q-td key="pay" :props="props">
            {{ props.row.pay_amount }}点
          </q-td>

          <q-td key="time" :props="props">
            <!--              日期时间格式根据locale值变化-->
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>
            <div v-else>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>
          <q-td key="status" :props="props" class="non-selectable">
            <!--            <ServerStatus :server="props.row" :is-group="isGroup"/>-->
            {{ props.row.status }}
          </q-td>

          <q-td key="operation" :props="props" class="non-selectable">
            <!--            <ServerOperationBtnGroup :server="props.row" :is-group="isGroup"/>-->
            支付、查看详情、取消
          </q-td>

        </q-tr>
      </template>

      <!--      <template v-slot:bottom>-->
      <!--      todo 批量操作-->
      <!--      </template>-->
    </q-table>

    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="primary"/>
    </q-page-scroller>

    <q-separator/>
  </div>
</template>

<style lang="scss" scoped>
.OrderTable {
}
</style>
