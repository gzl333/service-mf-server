<script setup lang="ts">
// import { ref, computed } from "vue"
import useStore from 'src/store'
// import { useI18n } from 'vue-i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const { locale } = useI18n({ useScope: 'global' })

// code starts...
</script>

<template>
  <div class="ServerIndex">
    云主机首页

    <div> this is ServerIndex
      store: {{ store.counter }}
    </div>

    <q-btn @click="store.increment">+1</q-btn>
  </div>
</template>

<style lang="scss" scoped>
.ServerIndex {
}
</style>
