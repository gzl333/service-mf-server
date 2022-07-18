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

// group filter
const groupSelection = ref('0')

const groupOptions = computed(() => store.getGroupOptions)
// const groupOptions = computed(() => store.getGroupOptionsByMyRole(['owner', 'leader']))

const rows = computed(() => store.getGroupCouponsByGroupId(groupSelection.value))

// 搜索框
const search = ref('')
</script>

<template>
  <div class="GroupCouponList">
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
            <q-select outlined dense stack-label :label="tc('pages.GroupCouponList.group_filter')" v-model="groupSelection"
                      :options="groupOptions" emit-value map-options option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="groupSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <CouponTable :coupons="rows" :isGroup="true" :search="search.trim().toLowerCase()"/>
  </div>
</template>

<style lang="scss" scoped>
.GroupCouponList {
}
</style>
