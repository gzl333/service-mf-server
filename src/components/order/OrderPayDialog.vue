<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'

import CouponCard from 'components/coupon/CouponCard.vue'

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
const coupons = computed(() => {
  const coupons = props.isGroup ? Object.values(store.tables.groupCouponTable.byId).filter(coupon => coupon?.vo?.id === order.value.vo_id) : Object.values(store.tables.personalCouponTable.byId)
  return coupons
  // 筛选能适用当前server -> serviceId -> app_service_id的coupon
    .filter(coupon => coupon?.app_service?.service_id === order.value.service_id)
  // 筛选有效期
    .filter(coupon => (Date.now() - new Date(coupon.expiration_time).getTime()) < 0)
  // 映射为couponId，供option group使用
    .map(coupon => ({
      label: coupon.id,
      value: coupon.id
    }))
}
)

const methodSelect = ref('cashcoupon')
const couponSelect = ref([])

const onOKClick = () => {
  if (methodSelect.value === 'cashcoupon' && couponSelect.value.length === 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.order.OrderPayDialog.choose_coupon')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else {
    onDialogOK({
      payment_method: methodSelect.value,
      coupon_ids: couponSelect.value
    })
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary" style="height: 550px;">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ isGroup ? tc('components.order.OrderPayDialog.pay_group_order') : tc('components.order.OrderPayDialog.pay_personal_orders') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{tc('components.order.OrderPayDialog.order_id')}}
          </div>
          <div class="col">
            {{ order.id }}
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{tc('components.order.OrderPayDialog.amount_payable')}}
          </div>
          <div class="col">
            {{ order.payable_amount }} {{tc('components.order.OrderPayDialog.point')}}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderPayDialog.payment_method') }}
          </div>
          <div class="col-9 q-gutter-x-sm">

            <q-btn style="width: 180px;"
                   :outline="methodSelect==='cashcoupon'?false:true"
                   :ripple="false" dense unelevated
                   :color="methodSelect==='cashcoupon'?'primary':'grey'"
                   @click="methodSelect = 'cashcoupon'">
              {{ tc('components.order.OrderPayDialog.coupons') }}
            </q-btn>

            <q-btn style="width: 180px;"
                   :outline="methodSelect==='balance'?false:true"
                   :ripple="false" dense unelevated
                   :color="methodSelect==='balance'?'primary':'grey'"
                   @click="methodSelect = 'balance'">
              {{ tc('components.order.OrderPayDialog.available_balance') }}
            </q-btn>

          </div>
        </div>

        <div v-if="isGroup" class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderPayDialog.group') }}
          </div>
          <div class="col">
            {{ order.vo_name }}
          </div>
        </div>

        <div v-if="methodSelect==='cashcoupon' || methodSelect==='coupon_balance'"
             class="row q-pb-lg items-start">

          <div class="col-3 text-grey-7">
            {{ isGroup ? tc('components.order.OrderPayDialog.group_coupon') : tc('components.order.OrderPayDialog.personal_voucher') }}

            <div class="row text-black">
              <div>{{ tc('components.order.OrderPayDialog.selected') }}</div>
              <div>{{ couponSelect.length }}个</div>
            </div>

          </div>

          <div class="col">

            <q-scroll-area class="col bg-grey-2"
                           :style="isGroup ? 'height: 200px;' : 'height: 250px;'"
                           visible>

              <div v-if="coupons.length === 0" class="col">

                <div v-if="isGroup">
                  {{ tc('components.order.OrderPayDialog.notify_group_no_coupon') }}
                </div>

                <div v-else>
                  {{ tc('components.order.OrderPayDialog.notify_personal_no_coupon') }}
                </div>

                <!--                <div>-->
                <!--                  {{ tc('已有代金券需要兑换？')}}-->
                <!--                  <q-btn flat dense color="primary">{{tc('兑换代金券')}}</q-btn>-->
                <!--                </div>-->

              </div>

              <q-option-group
                v-else
                v-model="couponSelect"
                type="checkbox"
                :options="coupons"
              >
                <template v-slot:label="opt">
                  <CouponCard class="q-pt-sm" :coupon-id="opt.value" :is-group="isGroup"/>
                </template>
              </q-option-group>

            </q-scroll-area>

          </div>

        </div>

        <div v-if="methodSelect==='balance' || methodSelect==='coupon_balance'" class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ isGroup ? tc('components.order.OrderPayDialog.group_account_balance') : tc('components.order.OrderPayDialog.personal_account_balance') }}
          </div>

          <div v-if="isGroup" class="col"
               :class="store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[order.vo_id].balance].balance.startsWith('-')?'text-red':''">
            {{ store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[order.vo_id].balance].balance }}
          </div>

          <div v-else class="col" :class="store.items.personalBalance.balance.startsWith('-')?'text-red':''">
            {{ store.items.personalBalance.balance }} {{tc('components.order.OrderPayDialog.point') }}
          </div>

        </div>

      </q-card-section>

      <!--      <q-separator/>-->

      <q-card-actions align="between" class="absolute-bottom">
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('components.order.OrderPayDialog.confirm_pay')" @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('components.order.OrderPayDialog.cancel')" @click="onDialogCancel"/>
      </q-card-actions>

      <!--      <pre> {{ coupons }}</pre>-->
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>

</style>
