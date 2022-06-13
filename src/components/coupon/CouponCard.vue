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

</script>

<template>
  <div class="CouponCard">
    <q-card class="non-selectable" style="height: 50px; width: 330px;" flat bordered>
      <q-card-section horizontal>

        <q-card-section class="text-white bg-positive q-pa-sm full-height">

          <span class="text-h6">{{ coupon.balance }}</span>
          <span class="text-caption">{{ tc('点') }}</span>

        </q-card-section>

        <!--        <q-separator vertical/>-->

        <q-card-section class="q-pa-sm text-caption items-center" style="width: 230px;">
          <div class="row">
            <div class="col-4 text-grey"> {{ tc('适用资源') }}</div>
            <div v-if="coupon.coupon_type==='universal'" class="col-auto">全部资源</div>
            <div v-else>{{
                [...new Set(coupon.applicable_resource)]
                  .map(type => {
                    if (type === 'vm') {
                      return tc('云主机')
                    } else if (type === 'disk') {
                      return tc('云硬盘')
                    } else if (type === 'bucket') {
                      return tc('存储桶')
                    }
                  })
                  .reduce((prev, curr) => prev + '/' + curr)
              }}
            </div>
          </div>

          <div class="row">
            <div class="col-4 text-grey"> {{ tc('到期时间') }}</div>
            <div class="col-auto">{{ new Date(coupon.expiration_time).toLocaleString(i18n.global.locale) }}</div>
          </div>
        </q-card-section>

      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.CouponCard {
}
</style>
