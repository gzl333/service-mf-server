<script setup lang="ts">
import { computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

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
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const order = computed(() => props.isGroup ? store.tables.groupOrderTable.byId[props.orderId] : store.tables.personalOrderTable.byId[props.orderId])

</script>

<template>
  <span class="OrderStatus">

    <div v-if="order.status === 'unpaid'" class="text-bold text-red" >
       {{ tc('待支付') }}
    </div>

     <div v-if="order.status === 'paid'" class="text-bold text-light-green" >
       {{ tc('已支付') }}
    </div>

    <div v-if="order.status === 'cancelled'" class="text-bold text-black">
       {{ tc('已取消') }}
    </div>

    <div v-if="order.status === 'refund'" class="text-bold text-black">
       {{ tc('已退款') }}
    </div>
  </span>
</template>

<style lang="scss" scoped>
.OrderStatus {
}
</style>
