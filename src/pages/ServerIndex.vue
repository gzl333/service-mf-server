<script setup lang="ts">
// import { computed } from 'vue'
import useStore from 'src/store'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { useMainStore } from '@cnic/main'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
const mainStore = useMainStore()

// code starts...
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const logMain = console.log

</script>

<template>
  <div class="ServerIndex">
    云主机首页

    <div> this is ServerIndex
      store: {{ store }}
    </div>

    <q-btn @click="store.increment">+1</q-btn>

    <div>
      mainStore: {{ mainStore }}
    </div>

    <q-btn @click="mainStore.increment">+1</q-btn>

    <q-btn @click="logMain(mainStore.getCounter)">log</q-btn>

    <div class="text-positive">{{ $t('翻译测试') }}</div>
  </div>
</template>

<style lang="scss" scoped>
.ServerIndex {
}
</style>
