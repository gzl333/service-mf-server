<script setup lang="ts">
// import { ref, computed } from "vue"
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
// import { i18n } from 'boot/i18n'

import OrderDetailCard from 'components/order/OrderDetailCard.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
const store = useStore()
const route = useRoute()
// const router = useRouter()

// 从route对象中读取id参数
const orderId = route.params.orderId as string

// // load table
// if (store.tables.personalOrderTable.status === 'init') {
//   void store.loadPersonalOrderTable()
// }

// load single order
void store.loadSingleOrder({
  isGroup: false,
  orderId
})

</script>

<template>
  <div class="PersonalDetail">
    <OrderDetailCard :orderId="orderId" :isGroup="false"/>
  </div>
</template>

<style lang="scss" scoped>
.PersonalDetail {
}
</style>
