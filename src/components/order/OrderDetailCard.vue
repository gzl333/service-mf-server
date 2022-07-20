<script setup lang="ts">
import { /* ref,  */computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { /* useRoute, */ useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

// import useCopyToClipboard from 'src/hooks/useCopyToClipboard'
import useGetOsIconName from 'src/hooks/useGetOsIconName'
import OrderStatus from 'components/order/OrderStatus.vue'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false,
    default: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
const router = useRouter()

const order = computed(() => props.isGroup ? store.tables.groupOrderTable.byId[props.orderId] : store.tables.personalOrderTable.byId[props.orderId])

// 判断订单中涉及的云主机是否已经存在personal/group server table中。在的话可以展示相关信息。
const isServerExisted = computed(() => props.isGroup ? store.tables.groupServerTable.allIds.includes(order.value.resources[0].instance_id) : store.tables.personalServerTable.allIds.includes(order.value.resources[0].instance_id))

// 复制信息到剪切板
// const clickToCopy = useCopyToClipboard()
// 获取os的icon名称
const getOsIconName = useGetOsIconName()

</script>

<template>
  <div class="OrderDetailCard">
    <div class="column items-center justify-center q-py-md">
      <div class="col">

        <div class="row items-center title-area">
          <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
                 @click="router.back()"/>
          <span v-if="isGroup">{{tc('components.order.OrderDetailCard.project_order_details')}}</span>
          <span v-else>{{tc('components.order.OrderDetailCard.personal_order_details')}}</span>
        </div>

        <!--直接从url进入本页面时，tables尚未载入，应显示loading界面。对取属性进行缓冲，不出现undefined错误-->
        <div class="row">
          <!--todo 区分读取中和读取错误          -->
          <div v-if="!order" class="col">
            {{tc('components.order.OrderDetailCard.loading_wait')}}
          </div>

          <div v-else class="col content-area">

            <div class="row justify-between items-end q-mt-lg text-grey">

              <div class="col-auto">{{tc('components.order.OrderDetailCard.order_id')}}  {{ order.id }}</div>

              <div class="col-auto text-right row justify-end items-center q-gutter-x-md">

                <div v-if="isGroup" class="col-auto">
                  {{tc('components.order.OrderDetailCard.project_group')}}
                  <q-btn
                    color="primary"
                    padding="none" flat dense unelevated
                    :label="order.vo_name"
                    @click="navigateToUrl(`/my/server/group/detail/${order.vo_id}`)">
                    <q-tooltip>
                      {{ tc('components.order.OrderDetailCard.project_detail') }}
                    </q-tooltip>
                  </q-btn>
                </div>

                <div class="col-auto">{{ tc('components.order.OrderDetailCard.oder_user') }}   {{ order.username }}</div>

                <q-btn v-if="(!isGroup || store.tables.groupTable.byId[order.vo_id]?.myRole !== 'member') && order.status === 'unpaid'"
                       class="col-auto"
                       color="primary"
                       padding="none"
                       flat
                       dense
                       @click="store.cancelOrderDialog(order.id, isGroup)">
                  {{ tc('components.order.OrderDetailCard.cancel_order') }}
                </q-btn>

              </div>

            </div>

            <div class="row no-wrap justify-center items-center section" style="height: 160px;">

              <div class="col-1 q-mr-sm column justify-center items-center">

                <div v-if="order.order_type === 'new'" class="col-auto text-bold text-h6">
                  {{ tc('components.order.OrderDetailCard.new_purchase') }}
                </div>

                <div v-if="order.order_type === 'renewal'" class="col-auto text-bold text-h6">
                  {{ tc('components.order.OrderDetailCard.renewal') }}
                </div>

                <div v-if="order.order_type === 'upgrade'" class="col-auto text-bold text-h6">
                  {{ tc('components.order.OrderDetailCard.upgrade') }}
                </div>

                <div v-if="order.order_type === 'downgrade'" class="col-auto text-bold text-h6">
                  {{ tc('components.order.OrderDetailCard.downgrade') }}
                </div>

                <div class="col-auto text-bold text-h6">
                  {{ order.pay_type === 'prepaid' ? tc('components.order.OrderDetailCard.monthly_prepaid') : tc('components.order.OrderDetailCard.pay_as_go') }}
                </div>

              </div>

              <q-separator vertical/>

              <div class="col-7 q-lr-md">
                <q-stepper
                  flat
                  done-color="light-green"
                >
                  <q-step
                    name="placed"
                    :title="tc('components.order.OrderDetailCard.submit_order')"
                    :caption="new Date(order.creation_time).toLocaleString(i18n.global.locale)"
                    icon="list_alt"
                    :done="true"
                  >
                  </q-step>

                  <q-step
                    v-if="order.status === 'cancelled'"
                    name="cancelled"
                    :title="tc('components.order.OrderDetailCard.cancel_order')"
                    :caption="new Date(order.cancelled_time).toLocaleString(i18n.global.locale)"
                    icon="close"
                    :done="order.status === 'cancelled'"
                    done-icon="close"
                    done-color="black"
                  >
                  </q-step>

                  <q-step
                    v-else
                    :disable="order.pay_type === 'postpaid'"
                    name="paid"
                    :title="tc('components.order.OrderDetailCard.pay_order')"
                    :caption="order.pay_type === 'postpaid' ? tc('components.order.OrderDetailCard.pay_without_prepayment'): order.status === 'paid' ?new Date(order.payment_time).toLocaleString(i18n.global.locale): tc('components.order.OrderDetailCard.to_be_paid')"
                    icon="currency_yen"
                    :done="order.status === 'paid'"
                  >
                  </q-step>

                  <q-step
                    v-if="order.status === 'unpaid' || order.status === 'paid'"
                    name="delivered"
                    :title="tc('components.order.OrderDetailCard.resource_delivery')"
                    :caption="order.status === 'paid' ? new Date(order.resources[0]?.delivered_time).toLocaleString(i18n.global.locale): tc('components.order.OrderDetailCard.to_be_delivered')"
                    icon="task_alt"
                    :done="order.status === 'paid'"
                  >
                  </q-step>

                </q-stepper>

              </div>

              <q-separator vertical/>

              <div class="col-4 q-pl-md column items-center justify-center full-height">

                <OrderStatus :is-group="isGroup" :order-id="order.id" class="text-h6"/>

                <q-btn v-if="(!isGroup || store.tables.groupTable.byId[order.vo_id]?.myRole !== 'member') && order.status === 'unpaid'"
                       class="col-auto"
                       color="primary"
                       size="md"
                       unelevated
                       @click="store.payOrderDialog(order.id, isGroup)">
                  {{ tc('components.order.OrderDetailCard.to_be_delivered') }}
                </q-btn>

              </div>

            </div>

            <div class="row justify-between items-end q-mt-lg text-grey">

              <div class="col-auto"> {{ tc('components.order.OrderDetailCard.resource_information') }}</div>

              <div class="col-auto text-right row justify-end items-center q-gutter-x-md">

                <q-btn
                  v-if="isServerExisted"
                  class="col-auto"
                  color="primary"
                  flat
                  dense
                  @click="navigateToUrl(isGroup?`/my/server/group/server/detail/${order.resources[0].instance_id}`:`/my/server/personal/detail/${order.resources[0].instance_id}`)">
                  {{ tc('components.order.OrderDetailCard.view_resources') }}
                </q-btn>

              </div>

            </div>

            <div class="justify-center section">

              <div class="row">
                <div class="col-4">

                  <div class="row q-pb-md items-center">
                    <div class="col-3 text-grey">CPU</div>
                    <div class="col-shrink">
                      {{ order.instance_config.vm_cpu }} {{ tc('components.order.OrderDetailCard.nuclear') }}
                    </div>
                  </div>

                  <div class="row q-pb-md items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.memory') }}</div>
                    <div class="col-shrink">
                      {{ order.instance_config.vm_ram / 1024 }}GB
                    </div>
                  </div>

                  <div class="row q-pb-md items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.system_disk') }}</div>
                    <div class="col-shrink">
                      {{ order.instance_config.vm_systemdisk_size }}GB
                    </div>
                  </div>

                  <div v-if="isServerExisted" class="row  items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.cloud_host_id') }}</div>
                    <div class="col-shrink">
                      <div v-for="server in order.resources" :key="server.id">
                        {{ server.id }}
                      </div>
                    </div>
                  </div>

                </div>

                <div class="col-4">

                  <div v-if="isServerExisted" class="row q-pb-md items-center">

                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.ip_address') }}</div>
                    <div class="col-shrink">
                      <q-btn flat color="primary" no-caps
                             padding="none"
                             @click="navigateToUrl(isGroup?`/my/server/group/server/detail/${order.resources[0].instance_id}`:`/my/server/personal/detail/${order.resources[0].instance_id}`)">
                        {{
                          isGroup ? store.tables.groupServerTable.byId[order.resources[0].instance_id]?.ipv4 : store.tables.personalServerTable.byId[order.resources[0].instance_id]?.ipv4
                        }}
                      </q-btn>
                    </div>

                  </div>

                  <div class="row q-pb-md items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.ip_address_type') }}</div>
                    <div class="col-shrink">
                      {{ order.instance_config.vm_public_ip ? tc('components.order.OrderDetailCard.public_network') : tc('components.order.OrderDetailCard.private_network') }}
                    </div>
                  </div>

                  <div class="row q-pb-md items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.network_segment') }}</div>
                    <div class="col-shrink">
                      {{
                        store.tables.serviceNetworkTable.byLocalId[`${order.service_id}-${order.instance_config.vm_network_id}`]?.name
                      }}
                    </div>
                  </div>

                  <div class="row items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.operating_system') }}</div>
                    <div class="col-shrink">
                      <q-icon
                        v-if="getOsIconName(store.tables.serviceImageTable.byLocalId[`${order.service_id}-${order.instance_config.vm_image_id}`]?.name)"
                        :name="getOsIconName(store.tables.serviceImageTable.byLocalId[`${order.service_id}-${order.instance_config.vm_image_id}`]?.name)"
                        flat size="md"/>
                      {{
                        store.tables.serviceImageTable.byLocalId[`${order.service_id}-${order.instance_config.vm_image_id}`]?.name
                      }}
                    </div>
                  </div>

                </div>

                <div class="col-4">

                  <div class="row q-pb-md items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.affiliation') }}</div>
                    <div class="col-shrink">
                      {{
                        i18n.global.locale === 'zh' ?
                          store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[order.service_id].data_center]?.name :
                          store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[order.service_id].data_center]?.name_en
                      }}
                    </div>
                  </div>

                  <div class="row q-pb-md items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.service_node') }}</div>
                    <div class="col-shrink">
                      {{
                        i18n.global.locale === 'zh' ?
                          store.tables.serviceTable.byId[order.service_id]?.name :
                          store.tables.serviceTable.byId[order.service_id]?.name_en
                      }}
                    </div>
                  </div>

                  <div class="row items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.service_type') }}</div>
                    <div class="col-shrink">
                      <q-icon
                        v-if="store.tables.serviceTable.byId[order.service_id].service_type.toLowerCase().includes('ev')"
                        style="width: 130px;height: 25px">
                        <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 130px;height: 25px"/>
                      </q-icon>

                      <q-icon
                        v-if="store.tables.serviceTable.byId[order.service_id].service_type.toLowerCase().includes('open')"
                        style="width: 130px;height: 25px">
                        <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 130px;height: 25px"/>
                      </q-icon>
                    </div>
                  </div>

                </div>
              </div>

              <q-separator class="q-mb-lg q-mt-md"/>

              <div class="row justify-end">
                <div class="col-4">

                  <div class="row q-pb-md items-center">
                    <div class="col-3 text-grey">{{ tc('components.order.OrderDetailCard.total_billing') }}</div>
                    <div class="col-shrink">
                      {{ order.total_amount }} {{ tc('components.order.OrderDetailCard.point') }}
                    </div>
                  </div>

                  <div v-if="order.status === 'unpaid' || order.status === 'cancelled'">

                    <div v-if="(Number(order.payable_amount) - Number(order.total_amount)) < 0"
                         class="row q-pb-md items-center">
                      <div class="col-3 text-grey"> {{tc('components.order.OrderDetailCard.discount')}}</div>
                      <div class="col-shrink">
                        {{ (Number(order.payable_amount) - Number(order.total_amount)).toFixed(2) }} {{ tc('components.order.OrderDetailCard.point') }}
                      </div>
                    </div>

                    <div class="row items-center text-primary">
                      <div class="col-3">{{tc('components.order.OrderDetailCard.payable')}}</div>
                      <div class="col-shrink text-bold text-h5">
                        {{ order.payable_amount }} {{ tc('components.order.OrderDetailCard.point') }}
                      </div>
                    </div>

                  </div>

                  <div v-if="order.status === 'paid'">

                    <div v-if="(order.pay_amount - order.total_amount) < 0"
                         class="row q-pb-md items-center">
                      <div class="col-3 text-grey">{{tc('components.order.OrderDetailCard.discount')}}</div>
                      <div class="col-shrink">
                        {{ (Number(order.pay_amount) - Number(order.total_amount)).toFixed(2) }} {{ tc('components.order.OrderDetailCard.point') }}
                      </div>
                    </div>

                    <div class="row items-center text-primary">
                      <div class="col-3 ">{{ tc('components.order.OrderDetailCard.actually_paid') }}</div>
                      <div class="col-shrink text-bold text-h5 ">
                        {{ order.pay_amount }} {{ tc('components.order.OrderDetailCard.point') }}
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>

            <!--                        <pre> {{ order }} </pre>-->

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.OrderDetailCard {
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

.ip-title {
  font-size: large;
  font-weight: bold;
}

.detail-item {
  padding-bottom: 10px;
}

.section {
  margin-bottom: 30px;
  padding: 10px 20px;
  border: 1px solid $grey-4;
  border-radius: 5px;
}
</style>
