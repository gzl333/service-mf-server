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
    required: false,
    default: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// 不在component内加载table
const order = computed(() => props.isGroup ? store.tables.groupOrderTable.byId[props.orderId] : store.tables.personalOrderTable.byId[props.orderId])

</script>

<template>
  <span class="OrderStatus">

    <div v-if="order.status === 'unpaid'" class="text-bold text-primary">
       {{ tc('orderToPay') }}
    </div>

    <div v-if="order.status === 'cancelled'" class="text-bold text-black">
       {{ tc('orderCancelled') }}
    </div>

    <div v-if="order.status === 'refund'" class="text-bold text-black">
       {{ tc('orderCancelled') }}
    </div>

    <div v-if="order.status === 'paid' && order.resources[0].instance_status === 'wait'"
         class="text-bold text-light-green">
       {{ tc('orderRefunded') }}
    </div>

    <div v-if="order.status === 'paid' && order.resources[0].instance_status === 'success'"
         class="text-bold text-light-green">
       {{ tc('orderResourceDelivered') }}
    </div>

    <div v-if="order.status === 'paid' && order.resources[0].instance_status === 'failed'"
         class="text-bold text-red">
       {{ tc('orderResourceFailed') }}
    </div>

  </span>
</template>

<style lang="scss" scoped>
.OrderStatus {
}
</style>
