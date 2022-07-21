<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
// import moment from 'moment'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])
defineEmits([...useDialogPluginComponent.emits])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

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

// dom ref
const inputDom = ref<QInput>()

const redeemType = ref<'personal' | 'group'>('personal')
const coupon = ref('')

const groupOptions = computed(() => store.getGroupOptionsWithoutAll)
const groupSelection = ref('')

const selectDefaultGroup = () => {
  groupSelection.value = groupOptions.value[0]?.value
}
selectDefaultGroup()
watch(groupOptions, selectDefaultGroup)

const onOKClick = () => {
  // 分割出id和coupon_code
  const positionSplit = coupon.value.trim().indexOf('#')
  const couponId = coupon.value.slice(0, positionSplit)
  const couponCode = coupon.value.slice(positionSplit + 1)
  // 校验coupon格式
  if (positionSplit === -1 || couponId.length <= 0 || couponCode.length <= 0) {
    // notify
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.coupon.RedeemCouponDialog.notify_wrong_code')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    inputDom.value?.focus()
    return
  }
  // 校验项目组选择
  if (redeemType.value === 'group' && groupOptions.value.length === 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.coupon.RedeemCouponDialog.notify_no_group')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  // 发送请求
  onDialogOK({
    couponId,
    couponCode,
    ...(redeemType.value === 'group' && { groupId: groupSelection.value })
  })
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('components.coupon.RedeemCouponDialog.redeem_coupon') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section style="height: 180px;">

        <div class="row q-pb-lg items-center ">
          <div class="col-2 text-grey-7">
           {{tc('components.coupon.RedeemCouponDialog.redeem_to')}}
          </div>

          <div class="col-10 row justify-center ">

            <q-btn class="col q-mr-sm"
                   :outline="redeemType==='personal'?false:true"
                   :ripple="false" dense unelevated
                   :color="redeemType==='personal'?'primary':'grey'"
                   @click="redeemType = 'personal'">
              {{ tc('components.coupon.RedeemCouponDialog.personal_account') }}
            </q-btn>

            <q-btn class="col"
                   :outline="redeemType==='group'?false:true"
                   :ripple="false" dense unelevated
                   :color="redeemType==='group'?'primary':'grey'"
                   @click="redeemType = 'group'">
              {{ tc('components.coupon.RedeemCouponDialog.group_account') }}
            </q-btn>

          </div>
        </div>

        <div v-if="redeemType === 'group'"
             class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.coupon.RedeemCouponDialog.group') }}
          </div>
          <div class="col">

            <q-select v-if="groupOptions.length !== 0" outlined dense stack-label v-model="groupSelection"
                      :options="groupOptions" emit-value map-options option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="groupSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
              </template>
            </q-select>

            <div v-else>
              <div class="row items-center">
                {{ tc('components.coupon.RedeemCouponDialog.notify_no_group') }}
                <q-btn flat padding="none" color="primary"
                       :to="'/my/server/group/create'">
                  {{ tc('components.coupon.RedeemCouponDialog.create_group') }}
                </q-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="row items-center">
          <div class="col-2 text-grey-7">
            {{ tc('components.coupon.RedeemCouponDialog.redeem_code') }}
          </div>
          <div class="col">
            <q-input ref="inputDom" outlined v-model="coupon" dense :label="tc('components.coupon.RedeemCouponDialog.notify_input_code')" @keydown.enter="onOKClick">
              <template v-slot:append>
                <q-icon v-if="coupon !== ''" name="close" @click="coupon = ''" class="cursor-pointer"/>
              </template>
            </q-input>
          </div>
        </div>

      </q-card-section>

      <!--      <q-separator/>-->

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               :label="tc('components.coupon.RedeemCouponDialog.redeem')"
               @click="onOKClick"
        />

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               :label="tc('components.coupon.RedeemCouponDialog.cancel')"
               @click="onDialogCancel"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
