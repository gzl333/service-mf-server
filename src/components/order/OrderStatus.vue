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
     <q-chip v-if="order.status === 'paid'" :clickable="false" square
             class="text-bold" outline ripple="false" color="light-green">
       {{ tc('已支付') }}
    </q-chip>

    <q-chip v-if="order.status === 'unpaid'" :clickable="false" square
            class="text-bold" outline ripple="false" color="red">
       {{ tc('待支付') }}
    </q-chip>

    <q-chip v-if="order.status === 'cancelled'" :clickable="false" square
            class="text-bold" outline ripple="false" color="black">
       {{ tc('已取消') }}
    </q-chip>

    <q-chip v-if="order.status === 'refund'" :clickable="false" square
            class="text-bold" outline ripple="false" color="primary">
       {{ tc('已退款') }}
    </q-chip>
  </span>
</template>

<style lang="scss" scoped>
.OrderStatus {
}
</style>
