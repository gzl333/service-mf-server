<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'

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
const coupons = computed(() => Object.values(store.tables.couponTable.byId)
  .filter(coupon => props.isGroup ? coupon.vo?.id === order.value.vo_id : coupon.vo === null)
  .map(coupon => Object.assign(coupon, {
    label: coupon.id,
    value: coupon.id
  })))

const methodSelect = ref('balance')
const couponSelect = ref([])

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
    <q-card class="q-dialog-plugin dialog-primary ">

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
              style="border: 1px solid #1976D2"
              v-model="methodSelect"
              unelevated
              no-caps
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
               class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              项目组代金券
            </div>
            <div class="col">

              <q-option-group
                v-model="couponSelect"
                type="checkbox"
                :options="coupons"
              >
                <template v-slot:label="opt">
                  <div class="row items-center">
                    <span class="text-teal">{{ opt.balance }}</span>
                  </div>
                </template>
              </q-option-group>

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
               class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              个人代金券
            </div>
            <div class="col">

              <q-option-group
                v-model="couponSelect"
                type="checkbox"
                :options="coupons"
              >
                <template v-slot:label="opt">
                  <div class="row items-center">
                    <span class="text-teal">{{ opt }}</span>
                  </div>
                </template>
              </q-option-group>

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

        <!--        <div class="row items-center">-->
        <!--          <div class="col text-grey-7">-->
        <!--            请仔细阅读以下事项，并在确认后勾选：-->
        <!--          </div>-->
        <!--        </div>-->

        <!--        <q-checkbox style="margin-left: -10px;" v-model="check" color="primary">-->
        <!--          <div :class="check?'text-primary':'text-black'">-->
        <!--            {{ tc('我了解重建云主机会抹去全部数据，且无法恢复') }}-->
        <!--          </div>-->
        <!--        </q-checkbox>-->

      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('确认支付')" @click="onOKClick"/>
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('取消')" @click="onDialogCancel"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>

</style>
