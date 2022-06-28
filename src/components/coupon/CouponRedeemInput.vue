<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'
import { Notify } from 'quasar'

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

const coupon = ref('')

const redeemCoupon = async () => {
  // 分割出id和coupon_code
  const positionSplit = coupon.value.indexOf('#')
  const couponId = coupon.value.slice(0, positionSplit)
  const couponCode = coupon.value.slice(positionSplit + 1)
  console.log(couponId, couponCode)
  // 校验coupon格式
  if (positionSplit === -1 || couponId.length <= 0 || couponCode.length <= 0) {
    // notify
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('代金券输入有误，请检查输入')}`,
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
    if (respPostCashCoupon.status.toString().startsWith('2')) {
      Notify.create({
        classes: 'notification-positive shadow-15',
        textColor: 'positive',
        icon: 'check_circle',
        message: `${tc('成功兑换代金券')}: ${respPostCashCoupon.data.id}}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      // 更新对应表
      props.isGroup ? await store.loadGroupCouponTable() : await store.loadPersonalCouponTable()
      // 跳转 todo
      props.isGroup ? navigateToUrl(`/my/server/group/detail/${props.groupId}?show=coupon`) : navigateToUrl('/my/server/personal/coupon')
    } else {
      throw new Error(respPostCashCoupon.data.code + ':' + respPostCashCoupon.data.message)
    }
  } catch (error) {
    if (error instanceof Error) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'mdi-alert',
        textColor: 'negative',
        message: error.message,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
    }
  }
}
</script>

<template>
  <q-input class="col-auto" v-model="coupon" outlined dense>
    <template v-slot:append>
      <q-btn color="primary" flat dense @click="redeemCoupon">{{ tc('兑换') }}</q-btn>
    </template>
    <q-tooltip>
      {{ isGroup ? tc('兑换到项目组') + ': ' + store.tables.groupTable.byId[groupId]?.name : tc('兑换到个人账户') }}
    </q-tooltip>
  </q-input>
</template>

<style lang="scss" scoped>
</style>
