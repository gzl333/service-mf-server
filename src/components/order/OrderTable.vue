<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore, OrderInterface } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import OrderStatus from 'components/order/OrderStatus.vue'
import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'

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
    label: (() => tc('components.order.OrderTable.order_id'))(),
    field: 'id',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  ...((props.isGroup && !props.isHideGroup) ? [{ // 是group且不hide时加入这个配置
    name: 'group',
    label: (() => tc('components.order.OrderTable.group'))(),
    field: 'group',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px;max-width: 120px;word-break: break-all; word-wrap: break-word; white-space: normal;'
  }] : []),
  {
    name: 'service',
    label: (() => tc('components.order.OrderTable.service_node'))(),
    field: 'service',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px; min-width: 150px; max-width: 200px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'config',
    label: (() => tc('components.order.OrderTable.hardware_configuration'))(),
    field: 'config',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'network',
    label: (() => tc('components.order.OrderTable.network_type'))(),
    field: 'network',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'time',
    label: (() => tc('components.order.OrderTable.place_time'))(),
    field: 'time',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'order_type',
    label: (() => tc('components.order.OrderTable.order_type'))(),
    field: 'order_type',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'pay_type',
    label: (() => tc('components.order.OrderTable.billing_method'))(),
    field: 'pay_type',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'pay',
    label: (() => tc('components.order.OrderTable.order_amount'))(),
    field: 'pay',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'status',
    label: (() => tc('components.order.OrderTable.status'))(),
    field: 'status',
    align: 'center',
    style: 'padding: 15px 0px; width: 100px', // 固定宽度防止更新状态时抖动
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'operation',
    label: (() => tc('components.order.OrderTable.operation'))(),
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
      :loading-label="tc('components.order.OrderTable.notify_loading')"
      :no-data-label="tc('components.order.OrderTable.notify_no_order')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      :filter="search"
      :filter-method="searchMethod"
      :no-results-label="tc('components.order.OrderTable.notify_no_results')"
    >

      <template v-slot:body="props">
        <q-tr :props="props"
              @mouseenter="onMouseEnterRow(props.row.id)"
              @mouseleave="onMouseLeaveRow"
        >
          <q-td key="id" :props="props">

            <q-btn
              class="q-ma-none" :label="props.row.id" color="primary" padding="none" flat dense unelevated no-caps
              @click="navigateToUrl(isGroup ? `/my/server/group/order/detail/${props.row.id}` : `/my/server/personal/order/detail/${props.row.id}`)">
              <q-tooltip>
                {{ tc('components.order.OrderTable.order_details') }}
              </q-tooltip>
              <!--创建时间距离当下小于1小时则打上new标记-->
              <q-badge style="top:-10px;"
                       v-if="(new Date() - new Date(props.row.creation_time)) < 1000 * 60 * 60 * 1 "
                       color="light-green" floating transparent rounded align="middle">
                new
              </q-badge>
            </q-btn>

            <q-btn v-if="hoverRow === props.row.id"
                   class="col-shrink q-px-xs q-ma-none" flat dense no-caps icon="content_copy" size="xs" color="primary"
                   @click="clickToCopy(props.row.id)">
              <q-tooltip>
                {{ tc('components.order.OrderTable.copy_to_clipboard') }}
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
              padding="none" flat dense unelevated no-caps
              :label="store.tables.groupTable.byId[props.row.vo_id]?.name"
              @click="navigateToUrl(`/my/server/group/detail/${props.row.vo_id}`)">
              <q-tooltip>
                {{ tc('components.order.OrderTable.group_detail') }}
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

            <CloudPlatformLogo
              :platform-name="store.tables.serviceTable.byId[props.row.service_id]?.service_type" />

          </q-td>

          <q-td key="config" :props="props">
            <div> {{ props.row.instance_config.vm_cpu }} {{ tc('components.order.OrderTable.cores') }}</div>
            <div> {{ props.row.instance_config.vm_ram / 1024 }}GB</div>

          </q-td>

          <q-td key="network" :props="props">
            <!--            {{ props.row.instance_config }}-->
            {{
              props.row.instance_config.vm_public_ip ? tc('components.order.OrderTable.public_network') : tc('components.order.OrderTable.private_network')
            }}
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

          <q-td key="order_type" :props="props">
            <div v-if="props.row.order_type === 'new'">
              {{ tc('components.order.OrderTable.new_purchase') }}
            </div>

            <div v-if="props.row.order_type === 'renewal'">
              {{ tc('components.order.OrderTable.renewal') }}
            </div>

            <div v-if="props.row.order_type === 'upgrade'">
              {{ tc('components.order.OrderTable.upgrade') }}
            </div>

            <div v-if="props.row.order_type === 'downgrade'">
              {{ tc('components.order.OrderTable.downgrade') }}
            </div>
          </q-td>

          <q-td key="pay_type" :props="props">
            <div v-if="props.row.pay_type === 'prepaid'">
              {{ tc('components.order.OrderTable.monthly_prepaid') }}
            </div>

            <div v-if="props.row.pay_type === 'postpaid'">
              {{ tc('components.order.OrderTable.pay_as_go') }}
            </div>
          </q-td>

          <q-td key="pay" :props="props">
            {{ props.row.payable_amount }} {{ tc('components.order.OrderTable.points') }}
          </q-td>

          <q-td key="status" :props="props" class="non-selectable">
            <OrderStatus :order-id="props.row.id" :is-group="isGroup"/>
          </q-td>

          <q-td key="operation" :props="props" class="non-selectable">
            <div class="row justify-center">
              <div class="column justify-center items-start q-gutter-xs">

                <q-btn icon="info" flat no-caps dense padding="none" color="primary"
                       @click="navigateToUrl(isGroup ? `/my/server/group/order/detail/${props.row.id}` : `/my/server/personal/order/detail/${props.row.id}`)">
                  {{ tc('components.order.OrderTable.check_details') }}
                </q-btn>

                <q-btn
                  v-if="(!isGroup || store.tables.groupTable.byId[props.row.vo_id]?.myRole !== 'member') && props.row.status === 'paid' && props.row.resources[0].instance_status === 'failed'"
                  icon="published_with_changes" flat no-caps dense padding="none" color="primary"
                  @click="store.reclaimOrderResource(props.row.id, isGroup)">
                  {{ tc('orderResourceReclaim') }}
                </q-btn>

                <q-btn
                  v-if="(!isGroup || store.tables.groupTable.byId[props.row.vo_id]?.myRole !== 'member') && props.row.status === 'unpaid'"
                  icon="currency_yen" flat no-caps dense padding="none" color="primary"
                  @click="store.payOrderDialog(props.row.id, isGroup)">
                  {{ tc('components.order.OrderTable.pay_orders') }}
                </q-btn>

                <q-btn
                  v-if="(!isGroup || store.tables.groupTable.byId[props.row.vo_id]?.myRole !== 'member') && props.row.status === 'unpaid'"
                  icon="close" flat no-caps dense padding="none" color="primary"
                  @click="store.cancelOrderDialog(props.row.id, isGroup)">
                  {{ tc('components.order.OrderTable.cancel_order') }}
                </q-btn>
              </div>
            </div>
          </q-td>

        </q-tr>
      </template>

      <template v-slot:bottom>
        <!--            todo 批量操作-->
      </template>
    </q-table>

    <!--    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">-->
    <!--      <q-btn fab icon="keyboard_arrow_up" color="primary"/>-->
    <!--    </q-page-scroller>-->

    <!--    <q-separator/>-->
  </div>
</template>

<style lang="scss" scoped>
.OrderTable {
}
</style>
