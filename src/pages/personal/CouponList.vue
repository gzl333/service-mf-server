<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import CouponTable from 'components/coupon/CouponTable.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// service_id下拉列表
const serviceOptions = computed(() => store.getPersonalAvailableServices)
const serviceSelection = ref('0')

// 获取云主机列表数据
const rows = computed(() => store.getPersonalCouponsByServiceId(serviceSelection.value))

// 搜索框
const search = ref('')
</script>

<template>
  <div class="CouponList">
    <div class="row items-center justify-between q-py-md">

      <div class="col-3">
        <div class="row justify-start">
          <div class="col">
            <q-input dense outlined v-model="search">
              <template v-slot:prepend>
                <q-icon name="search"/>
              </template>
              <template v-slot:append v-if="search">
                <q-icon name="close" @click="search = ''" class="cursor-pointer"/>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="col-3">
        <div class="row justify-end">
          <div class="col">
            <q-select outlined dense stack-label :label="tc('筛选服务节点')" v-model="serviceSelection"
                      :options="serviceOptions" emit-value map-options option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <CouponTable :coupons="rows" :search="search.trim().toLowerCase()"/>

  </div>
</template>

<style lang="scss" scoped>
.CouponList {
}
</style>
