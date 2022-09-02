<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import api from 'src/api'
import { navigateToUrl } from 'single-spa'
import { AxiosError } from 'axios'
// import moment from 'moment'

const props = defineProps({
  groupId: {
    type: String,
    required: false
  }
})
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

// btn loading
const isLoading = ref(false)

// 如果传入groupId则优先选中group模式
const redeemType = ref<'personal' | 'group'>(props.groupId ? 'group' : 'personal')
const coupon = ref('')

const groupOptions = computed(() => store.getGroupOptionsWithoutAll)
const groupSelection = ref('')

const selectDefaultGroup = () => {
  // 优先选中传入的groupId
  groupSelection.value = props.groupId || groupOptions.value[0]?.value
}
// setup时选中一次
selectDefaultGroup()
// options更新时随时更新选中
watch(groupOptions, selectDefaultGroup)

const onOKClick = async () => {
  // 校验coupon格式
  if (coupon.value.length === 0) {
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
  // 发送请求,兑换代金券
  try {
    isLoading.value = true
    const respPostCashCoupon = await api.server.cashcoupon.postCashCouponExchange({
      query: {
        code: coupon.value,
        ...(redeemType.value === 'group' && { vo_id: props.groupId })
      }
    })
    isLoading.value = false
    Notify.create({
      classes: 'notification-positive shadow-15',
      textColor: 'positive',
      icon: 'check_circle',
      message: `${tc('store.notify.redeem_success')}: ${respPostCashCoupon.data.id}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    // 更新对应表
    redeemType.value === 'group' ? await store.loadGroupCouponTable() : await store.loadPersonalCouponTable()
    // 关闭dialog
    onDialogOK()
    // 跳转
    redeemType.value === 'group' ? navigateToUrl(`/my/server/group/detail/${props.groupId}?show=coupon`) : navigateToUrl('/my/server/personal/coupon')
  } catch (exception) {
    isLoading.value = false
    if (exception instanceof AxiosError) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'mdi-alert',
        textColor: 'negative',
        message: exception?.response?.data.code,
        caption: exception?.response?.data.message,
        position: 'bottom',
        // closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
    }
  }
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
            {{ tc('components.coupon.RedeemCouponDialog.redeem_to') }}
          </div>

          <div class="col-10 row justify-center ">

            <q-btn class="col q-mr-sm"
                   :outline="redeemType==='personal'?false:true"
                   :ripple="false" dense unelevated no-caps
                   :color="redeemType==='personal'?'primary':'grey'"
                   @click="redeemType = 'personal'">
              {{ tc('components.coupon.RedeemCouponDialog.personal_account') }}
            </q-btn>

            <q-btn class="col"
                   :outline="redeemType==='group'?false:true"
                   :ripple="false" dense unelevated no-caps
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
                      :label="tc('components.coupon.RedeemCouponDialog.select_group')"
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
                <q-btn flat no-caps padding="none" color="primary"
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
            <q-input ref="inputDom" outlined v-model.trim="coupon" dense
                     :label="tc('components.coupon.RedeemCouponDialog.notify_input_code')" @keydown.enter="onOKClick">
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
               no-caps
               :label="tc('components.coupon.RedeemCouponDialog.redeem')"
               @click="onOKClick"
               :loading="isLoading"
        />

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('components.coupon.RedeemCouponDialog.cancel')"
               @click="onDialogCancel"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
