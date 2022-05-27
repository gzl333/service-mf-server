<script setup lang="ts">
import { /* ref,  */computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const order = computed(() => props.isGroup ? store.tables.groupOrderTable.byId[props.orderId] : store.tables.personalOrderTable.byId[props.orderId])

</script>

<template>
  <div class="OrderDetailCard">
    this is OrderDetailCard
    <pre>{{ order }}</pre>
  </div>
</template>

<style lang="scss" scoped>
.OrderDetailCard {
}
</style>
