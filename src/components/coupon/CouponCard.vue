<script setup lang="ts">
import { /* ref, */ computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

const props = defineProps({
  couponId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const coupon = computed(() => props.isGroup ? store.tables.groupCouponTable.byId[props.couponId] : store.tables.personalCouponTable.byId[props.couponId])
const service = computed(() => Object.values(store.tables.serviceTable.byId).filter(service => service.pay_app_service_id === coupon.value?.app_service?.id)[0])

</script>

<template>
  <div class="CouponCard">
    <q-card class="non-selectable" style="width: 330px;" flat bordered>
      <q-card-section horizontal>

        <q-card-section style="width: 120px;" class="column justify-center text-white bg-positive">

          <div class="col-shrink text-caption row items-end q-pa-none">{{ tc('components.coupon.CouponCard.balance') }}</div>
          <div class="col-shrink text-h6 q-pa-none">{{ coupon.balance }}</div>

        </q-card-section>

        <q-card-section style="width: 210px;" class="q-pa-none text-caption items-center full-height">

          <div v-if="isGroup" class="col-4 text-grey"> {{ tc('components.coupon.CouponCard.group') }}</div>
          <div v-if="isGroup" class="col-auto">{{ coupon.vo.name }}</div>

          <div class="col-4 text-grey"> {{ tc('components.coupon.CouponCard.service') }}</div>
          <div class="col-auto">{{ i18n.global.locale === 'zh' ? service.name : service.name_en }}</div>

          <div class="col-4 text-grey"> {{ tc('components.coupon.CouponCard.expiration_time') }}</div>
          <div class="col-auto">{{ new Date(coupon.expiration_time).toLocaleString(i18n.global.locale) }}</div>

        </q-card-section>

      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.CouponCard {
}
</style>
