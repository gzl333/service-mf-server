<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import { navigateToUrl } from 'single-spa'
import { CouponInterface, useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'

const props = defineProps({
  coupons: {
    type: Array as PropType<CouponInterface[]>,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false,
    default: false
  },
  isHideGroup: {
    type: Boolean,
    required: false,
    default: false
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
    label: (() => tc('components.coupon.CouponTable.coupon_id'))(),
    field: 'id',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  ...((props.isGroup && !props.isHideGroup) ? [{ // 是group且不hide时加入这个配置
    name: 'group',
    label: (() => tc('components.coupon.CouponTable.group'))(),
    field: 'group',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px;max-width: 120px;white-space: normal;'
  }] : []),
  {
    name: 'serviceNode',
    label: (() => tc('components.coupon.CouponTable.service_node'))(),
    field: 'serviceNode',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'redeemTime',
    label: (() => tc('components.coupon.CouponTable.redeem_date'))(),
    field: 'redeemTime',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'expirationTime',
    label: (() => tc('components.coupon.CouponTable.expiration_date'))(),
    field: 'expirationTime',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'face',
    label: (() => tc('components.coupon.CouponTable.original_value'))(),
    field: 'face',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 100px;padding: 15px 0px'
  },
  {
    name: 'balance',
    label: (() => tc('components.coupon.CouponTable.available_balance'))(),
    field: 'balance',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'status',
    label: (() => tc('components.coupon.CouponTable.status'))(),
    field: 'status',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 100px;padding: 15px 0px;white-space: normal;'
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
const searchMethod = (rows: CouponInterface[], terms: string): CouponInterface[] => rows.filter(coupon => coupon.id.toLowerCase().includes(terms))

</script>

<template>
  <div class="CouponTable">
    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="coupons"
      :columns="columns"
      row-key="name"
      :loading="isGroup ? store.tables.groupCouponTable.status === 'loading' : store.tables.personalCouponTable.status === 'loading' "
      color="primary"
      :loading-label="tc('components.coupon.CouponTable.network_loading')"
      :no-data-label="tc('components.coupon.CouponTable.no_coupon')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      :filter="search"
      :filter-method="searchMethod"
      :no-results-label="tc('components.coupon.CouponTable.no_search_results')"
    >

      <template v-slot:body="props">
        <q-tr :props="props"
              @mouseenter="onMouseEnterRow(props.row.id)"
              @mouseleave="onMouseLeaveRow"
        >
          <q-td key="id" :props="props">

            <div class="column justify-center items-center">
              <!--创建时间距离当下小于1小时则打上new标记-->
              <q-badge v-if="(new Date() - new Date(props.row.granted_time)) < 1000 * 60 * 60 * 1 "
                       class="col-shrink" style="width: 35px;"
                       color="light-green" transparent rounded align="middle">
                new
              </q-badge>

              <div class="col-auto">
                {{ props.row.id }}
                <q-btn v-if="hoverRow === props.row.id"
                       class="col-shrink q-px-xs q-ma-none" flat dense icon="content_copy" size="xs" color="primary"
                       @click="clickToCopy(props.row.id)">
                  <q-tooltip>
                    {{ tc('components.coupon.CouponTable.copy_to_clipboard') }}
                  </q-tooltip>
                </q-btn>
                <q-btn v-else
                       class="col-shrink q-px-xs q-ma-none invisible" flat dense icon="content_copy" size="xs">
                </q-btn>
              </div>

            </div>

          </q-td>

          <q-td v-if="isGroup && !isHideGroup" key="group" :props="props">
            <q-btn
              class="q-ma-none"
              color="primary"
              padding="none" flat dense unelevated no-caps
              :label="store.tables.groupTable.byId[props.row.vo?.id]?.name"
              @click="navigateToUrl(`/my/server/group/detail/${props.row.vo?.id}`)">
              <q-tooltip>
                {{ tc('components.coupon.CouponTable.group_detail') }}
              </q-tooltip>
            </q-btn>
          </q-td>

          <q-td key="serviceNode" :props="props">

            <!--            <div v-if="props.row.app_service === null">-->

            <!--            </div>-->

            <!--            <div v-else>-->

            <!--            </div>-->

            <div>
              {{
                i18n.global.locale === 'zh' ?
                  store.tables.serviceTable.byId[props.row.app_service.service_id]?.name :
                  store.tables.serviceTable.byId[props.row.app_service.service_id]?.name_en
              }}
            </div>
            <div>
              {{
                i18n.global.locale === 'zh' ?
                  store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.app_service.service_id]?.data_center]?.name :
                  store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.app_service.service_id]?.data_center]?.name_en
              }}
            </div>

            <CloudPlatformLogo
              :platform-name="store.tables.serviceTable.byId[props.row.app_service.service_id]?.service_type"/>

          </q-td>

          <q-td key="redeemTime" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="expirationTime" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="face" :props="props">
            {{ props.row.face_value }} {{ tc('components.coupon.CouponTable.points') }}
          </q-td>

          <q-td key="balance" :props="props">
            <div class="text-bold">
              {{ props.row.balance }} {{ tc('components.coupon.CouponTable.points') }}
            </div>
          </q-td>

          <q-td key="status" :props="props">

            <div class="row justify-center">
              <div v-if="(new Date() - new Date(props.row.expiration_time)) < 0"
                   class="row items-center text-light-green">
                <q-icon name="check_circle" color="light-green" size="sm"/>
                {{ tc('components.coupon.CouponTable.valid') }}
              </div>

              <div v-else class="row items-center text-red">
                <q-icon name="cancel" color="red" size="sm"/>
                {{ tc('components.coupon.CouponTable.invalid') }}
              </div>
            </div>

          </q-td>

        </q-tr>
      </template>

      <template v-slot:bottom>
        <!--            todo 批量操作-->
      </template>

    </q-table>

  </div>
</template>

<style lang="scss" scoped>
.CouponTable {
}
</style>
