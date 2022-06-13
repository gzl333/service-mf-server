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
const coupons = computed(() => (props.isGroup ? Object.values(store.tables.groupCouponTable.byId) : Object.values(store.tables.personalCouponTable.byId))
  // 如果是专用券：只留能用vm && 与当前order的service相同的
  .filter(coupon => coupon.coupon_type === 'special' ? coupon.applicable_resource.includes('vm') && coupon?.service?.id === order.value.service_id : true)
  // 映射为couponId，供option group使用
  .map(coupon => ({
    label: coupon.id,
    value: coupon.id
  }))
)

const methodSelect = ref('balance')
const couponSelect = ref([])

// 计算选择coupon区域的理想高度
const heightCouponFull = computed(() => {
  if (coupons.value.length === 0) {
    return 8
  } else if (coupons.value.length === 1) {
    return 66
  } else if (coupons.value.length === 2) {
    return 124
  } else {
    return 182
  }
})
const heightCouponMin = computed(() => {
  if (coupons.value.length === 0) {
    return 8
  } else if (coupons.value.length === 1) {
    return 66
  } else if (coupons.value.length === 2) {
    return 124
  } else {
    return 150
  }
})

// 计算对话框的总体高度
const heightTotal = computed(() => props.isGroup ? (heightCouponFull.value + 410) : (heightCouponFull.value + 380))

const onOKClick = () => {
  if (methodSelect.value === 'cashcoupon' && couponSelect.value.length === 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('请选择要使用的代金券')}`,
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
    <q-card class="q-dialog-plugin dialog-primary" :style="`height: ${heightTotal}px;`">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ isGroup ? tc('支付项目组订单') : tc('支付个人订单') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            订单ID
          </div>
          <div class="col">
            {{ order.id }}
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            应付金额
          </div>
          <div class="col">
            {{ order.pay_amount }}点
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('支付方式') }}
          </div>
          <div class="col-8">
            <q-btn-toggle
              v-model="methodSelect"
              :ripple="false"
              unelevated
              no-caps
              text-color="primary"
              toggle-color="primary"
              :options="[{value: 'balance', slot: 'one'},
                         {value: 'cashcoupon', slot: 'two'},
                         {value: 'coupon_balance', slot: 'three'}]">
              <template v-slot:one>
                {{ tc('账户余额') }}
                <q-tooltip>{{ tc('只从账户余额中扣除') }}</q-tooltip>
              </template>

              <template v-slot:two>
                {{ tc('代金券') }}
                <q-tooltip>{{ tc('只从代金券中扣除') }}</q-tooltip>
              </template>

              <template v-slot:three>
                {{ tc('组合支付') }}
                <q-tooltip>{{ tc('余额+代金券组合支付，优先扣除代金券') }}</q-tooltip>
              </template>
            </q-btn-toggle>
          </div>
        </div>

        <div v-if="isGroup">

          <div class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              所属项目组
            </div>
            <div class="col">
              {{ order.vo_name }}
            </div>
          </div>

          <div v-if="methodSelect==='cashcoupon' || methodSelect==='coupon_balance'"
               class="row q-pb-lg items-start">

            <div class="col-3 text-grey-7">
              项目组代金券
            </div>

            <div class="col">

              <div class="row">
                <div>已选</div>
                <div class="text-black">{{ couponSelect.length }}个</div>
              </div>

              <div v-if="coupons.length === 0" class="col">{{ tc('暂无可用代金券') }}</div>

              <q-scroll-area v-else class="col bg-grey-2"
                             :style="methodSelect === 'cashcoupon' ? `height: ${heightCouponFull}px;` : `height: ${heightCouponMin}px;`"
                             visible>
                <q-option-group
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
              项目组账户余额
            </div>
            <div class="col"
                 :class="store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[order.vo_id].balance].balance.startsWith('-')?'text-red':''">
              {{ store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[order.vo_id].balance].balance }}
            </div>
          </div>

        </div>

        <div v-else>

          <div v-if="methodSelect==='cashcoupon' || methodSelect==='coupon_balance'"
               class="row q-pb-lg items-start">

            <div class="col-3 text-grey-7">
              个人代金券
            </div>

            <div class="col">

              <div class="row">
                <div>已选</div>
                <div class="text-black">{{ couponSelect.length }}个</div>
              </div>

              <div v-if="coupons.length === 0" class="col">{{ tc('暂无可用代金券') }}</div>

              <q-scroll-area v-else class="col bg-grey-2"
                             :style="methodSelect === 'cashcoupon' ? `height: ${heightCouponFull}px;` : `height: ${heightCouponMin}px;`"
                             visible>
                <q-option-group
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
              个人账户余额
            </div>
            <div class="col" :class="store.items.personalBalance.balance.startsWith('-')?'text-red':''">
              {{ store.items.personalBalance.balance }}点
            </div>
          </div>

        </div>

      </q-card-section>

      <q-card-actions align="between" class="absolute-bottom">
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('确认支付')" @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('取消')" @click="onDialogCancel"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>

</style>
