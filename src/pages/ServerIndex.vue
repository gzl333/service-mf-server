<script setup lang="ts">
// import { ref, computed } from "vue"
import useStore from 'src/store'
import { i18n } from 'boot/i18n'

// @ts-expect-error
import { useStoreMain } from '@cnic/main'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
const storeMain = useStoreMain()

// code starts...
</script>

<template>
  <div class="ServerIndex">
    this is ServerIndex

    <div>
      <q-btn @click="store.increment">add</q-btn>
      server store: {{ store.counter }}
    </div>

    <div class="text-primary">{{ i18n.global.tc('翻译测试') }}</div>

    <div>
      <q-btn @click="storeMain.increment">add</q-btn>
      main store: {{ storeMain.counter }}
    </div>

  </div>
</template>

<style lang="scss" scoped>
.ServerIndex {
}
</style>
