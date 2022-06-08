<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { /* Notify, */ useDialogPluginComponent } from 'quasar'

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
const methodSelect = ref('balance')
const methods = [
  {
    name: '账户余额',
    name_en: 'Balance Only',
    value: 'balance'
  },
  {
    name: '代金券',
    name_en: 'Coupon Only',
    value: 'cashcoupon'
  },
  {
    name: '余额+代金券组合支付(优先扣除代金券)',
    name_en: 'Balance and Coupon Mixed Payment(Coupon First)',
    value: 'coupon_balance'
  }
]

// 确定时
// const onOKClick = () => {
//   // if (select.value === '') {
//   //   Notify.create({
//   //     classes: 'notification-negative shadow-15',
//   //     icon: 'mdi-alert',
//   //     textColor: 'negative',
//   //     message: '请选择目标操作系统',
//   //     position: 'bottom',
//   //     closeBtn: true,
//   //     timeout: 5000,
//   //     multiLine: false
//   //   })
//   //   selectDom.value?.focus()
// }
// else
// {
//   // onDialogOK(select.value)
// }
// }
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
            <q-select outlined v-model="methodSelect" dense
                      :options="methods" map-options emit-value
                      :option-label="i18n.global.locale==='zh'?'name':'name_en'" option-value="value">

              <!--              &lt;!&ndash;当前选项的内容插槽&ndash;&gt;-->
              <!--              <template v-slot:selected-item="scope">-->
              <!--                      <span :class="select===scope.opt.id ? 'text-primary' : 'text-black'">-->
              <!--                        <q-icon v-if="getOsIconName(scope.opt.name)" :name="getOsIconName(scope.opt.name)"-->
              <!--                                class="q-pl-xs q-pr-md" flat size="md"/>-->
              <!--                      {{ scope.opt.name }}-->
              <!--                      </span>-->
              <!--              </template>-->

              <!--              &lt;!&ndash;待选项的内容插槽&ndash;&gt;-->
              <!--              <template v-slot:option="scope">-->
              <!--                <q-item v-bind="scope.itemProps">-->
              <!--                  <q-item-section avatar>-->
              <!--                    <q-icon v-if="getOsIconName(scope.opt.name)" :name="getOsIconName(scope.opt.name)" flat size="md"/>-->
              <!--                  </q-item-section>-->
              <!--                  <q-item-section>-->
              <!--                    <q-item-label>{{ scope.opt.name }}</q-item-label>-->
              <!--                    &lt;!&ndash;                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>&ndash;&gt;-->
              <!--                  </q-item-section>-->
              <!--                </q-item>-->
              <!--              </template>-->

            </q-select>
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

          <div v-if="methodSelect==='balance' || methodSelect==='coupon_balance'" class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              项目组账户余额
            </div>
            <div class="col"
                 :class="store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[order.vo_id].balance].balance.startsWith('-')?'text-red':''">
              {{ store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[order.vo_id].balance].balance }}
            </div>
          </div>

          <div v-if="methodSelect==='cashcoupon' || methodSelect==='coupon_balance'" class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              项目组代金券
            </div>
            <div class="col">
              a list of coupons
            </div>
          </div>

        </div>

        <div v-else>

          <div class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              个人账户余额
            </div>
            <div class="col" :class="store.items.personalBalance.balance.startsWith('-')?'text-red':''">
              {{ store.items.personalBalance.balance }}
            </div>
          </div>

          <div v-if="methodSelect==='cashcoupon' || methodSelect==='coupon_balance'" class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              个人代金券
            </div>
            <div class="col">
              a list of coupons
            </div>
          </div>

        </div>

        <div class="row items-center">
          <div class="col text-grey-7">
            请仔细阅读以下事项，并在确认后勾选：
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check" color="primary">
          <div :class="check?'text-primary':'text-black'">
            {{ tc('我了解重建云主机会抹去全部数据，且无法恢复') }}
          </div>
        </q-checkbox>

      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="between">
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('确认')" @click="onDialogOK"/>
        <q-btn class="q-ma-sm" color="primary" unelevated :label="tc('取消')" @click="onDialogCancel"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>

</style>
