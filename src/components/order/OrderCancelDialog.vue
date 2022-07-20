<script setup lang="ts">
import { computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { useDialogPluginComponent } from 'quasar'

import OrderStatus from 'components/order/OrderStatus.vue'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: true
  }
})
// const emits =
defineEmits([...useDialogPluginComponent.emits])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const order = computed(() => props.isGroup ? store.tables.groupOrderTable.byId[props.orderId] : store.tables.personalOrderTable.byId[props.orderId])

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('components.order.OrderCancelDialog.cancel_order') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderCancelDialog.order_id') }}
          </div>
          <div class="col">
            {{ order.id }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderCancelDialog.order_status') }}
          </div>
          <div class="col">
            <OrderStatus :is-group="isGroup" :order-id="order.id"/>
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderCancelDialog.order_creation_time') }}
          </div>
          <div class="col">
            {{ new Date(order.creation_time).toLocaleString(i18n.global.locale) }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderCancelDialog.affiliation') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ?
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[order.service_id].data_center].name :
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[order.service_id].data_center].name_en
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderCancelDialog.service_node') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ?
                store.tables.serviceTable.byId[order.service_id].name :
                store.tables.serviceTable.byId[order.service_id].name_en
            }}
          </div>
        </div>

<!--        <div class="row q-pb-lg items-center">-->
<!--          <div class="col-3 text-grey-7">-->
<!--            订单金额-->
<!--          </div>-->
<!--          <div class="col">-->
<!--            {{ order.total_amount }}点-->
<!--          </div>-->
<!--        </div>-->

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderCancelDialog.amount_payable') }}
          </div>
          <div class="col">
            {{ order.payable_amount }} {{ tc('components.order.OrderCancelDialog.point') }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('components.order.OrderCancelDialog.cancel_order')" @click="onDialogOK(true)"/>
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('components.order.OrderCancelDialog.holder_order')" @click="onDialogCancel"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
