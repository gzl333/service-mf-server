<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import { navigateToUrl } from 'single-spa'
import { CouponInterface, useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

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
    label: (() => tc('代金券ID'))(),
    field: 'id',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  ...((props.isGroup && !props.isHideGroup) ? [{ // 是group且不hide时加入这个配置
    name: 'group',
    label: (() => tc('所属组'))(),
    field: 'group',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px;max-width: 120px;white-space: normal;'
  }] : []),
  {
    name: 'serviceNode',
    label: (() => tc('服务节点'))(),
    field: 'serviceNode',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'redeemTime',
    label: (() => tc('兑换日期'))(),
    field: 'redeemTime',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'expirationTime',
    label: (() => tc('失效日期'))(),
    field: 'expirationTime',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'face',
    label: (() => tc('原始面额'))(),
    field: 'face',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 100px;padding: 15px 0px'
  },
  {
    name: 'balance',
    label: (() => tc('可用余额'))(),
    field: 'balance',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'status',
    label: (() => tc('状态'))(),
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
      :loading-label="tc('网络请求中，请稍候...')"
      :no-data-label="tc('暂无可用代金券')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      :filter="search"
      :filter-method="searchMethod"
      :no-results-label="tc('无搜索结果')"
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
                    {{ tc('复制到剪切板') }}
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
              padding="none" flat dense unelevated
              :label="store.tables.groupTable.byId[props.row.vo?.id]?.name"
              @click="navigateToUrl(`/my/server/group/detail/${props.row.vo?.id}`)">
              <q-tooltip>
                {{ tc('项目组详情') }}
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
                  Object.values(store.tables.serviceTable.byId).filter(service => service.pay_app_service_id === props.row?.app_service?.id)[0]?.name :
                  Object.values(store.tables.serviceTable.byId).filter(service => service.pay_app_service_id === props.row?.app_service?.id)[0]?.name_en
              }}
            </div>
            <div>
              {{
                i18n.global.locale === 'zh' ?
                  store.tables.dataCenterTable.byId[Object.values(store.tables.serviceTable.byId).filter(service => service.pay_app_service_id === props.row?.app_service?.id)[0]?.data_center]?.name :
                  store.tables.dataCenterTable.byId[Object.values(store.tables.serviceTable.byId).filter(service => service.pay_app_service_id === props.row?.app_service?.id)[0]?.data_center]?.name_en
              }}
            </div>

            <div>
              <q-icon
                v-if="Object.values(store.tables.serviceTable.byId).filter(service => service.pay_app_service_id === props.row?.app_service?.id)[0]?.service_type.toLowerCase().includes('ev')">
                <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
              </q-icon>
              <!--                            <q-tooltip>{{tc('该节点的服务类型为EVCloud')}}</q-tooltip>-->
            </div>

            <div>
              <q-icon
                v-if="Object.values(store.tables.serviceTable.byId).filter(service => service.pay_app_service_id === props.row?.app_service?.id)[0]?.service_type.toLowerCase().includes('open')">
                <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
              </q-icon>
              <!--                            <q-tooltip>{{tc('该节点的服务类型为OpenStack')}}</q-tooltip>-->
            </div>

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
            {{ props.row.face_value }}点
          </q-td>

          <q-td key="balance" :props="props">
            <div class="text-light-green">
              {{ props.row.balance }}点
            </div>
          </q-td>

          <q-td key="status" :props="props">

            <div v-if="(new Date() - new Date(props.row.expiration_time)) < 0" class="text-light-green">
              <q-icon name="check_circle" color="light-green" size="sm"/>
              {{ tc('可用') }}
            </div>

            <div v-else class="text-red">
              <q-icon name="cancel" color="red" size="sm"/>
              {{ tc('失效') }}
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
