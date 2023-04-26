<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'
import { Notify } from 'quasar'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  isGroup: {
    type: Boolean,
    required: false,
    default: false
  },
  groupId: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const exceptionNotifier = useExceptionNotifier()

const coupon = ref('')

const redeemCoupon = async () => {
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
      message: `${tc('components.coupon.CouponRedeemInput.notification_input')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  // 兑换代金券
  try {
    const respPostCashCoupon = await api.server.cashcoupon.postCashCoupon({
      query: {
        id: couponId,
        coupon_code: couponCode,
        ...(props.isGroup && { vo_id: props.groupId })
      }
    })
    Notify.create({
      classes: 'notification-positive shadow-15',
      textColor: 'positive',
      icon: 'check_circle',
      message: `${tc('components.coupon.CouponRedeemInput.notification_success')}: ${respPostCashCoupon.data.id}}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    // 更新对应表
    props.isGroup ? await store.loadGroupCouponTable({ groupId: props.groupId as string }) : await store.loadPersonalCouponTable()
    // 跳转
    props.isGroup ? navigateToUrl(`/my/server/group/detail/${props.groupId}?show=coupon`) : navigateToUrl('/my/server/personal/coupon')
  } catch (exception) {
    exceptionNotifier(exception)
  }
}
</script>

<template>
  <q-input class="col-auto" v-model="coupon" outlined dense>
    <template v-slot:append>
      <q-btn color="primary" flat dense @click="redeemCoupon">{{
          tc('components.coupon.CouponRedeemInput.redeem')
        }}
      </q-btn>
    </template>
    <q-tooltip>
      {{
        isGroup ? tc('components.coupon.CouponRedeemInput.redeem_group') + ': ' + store.tables.groupTable.byId[groupId]?.name : tc('components.coupon.CouponRedeemInput.redeem_personal')
      }}
    </q-tooltip>
  </q-input>
</template>

<style lang="scss" scoped>
</style>
