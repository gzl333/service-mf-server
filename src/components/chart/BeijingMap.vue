<script setup lang="ts">
import { ref, /* computed, */ onMounted, watch, toRefs } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

import * as echarts from 'echarts'
import bj from 'src/assets/json/Beijing.json'
import { GeoJSONSourceInput } from 'echarts/types/src/coord/geo/geoTypes'

const props = defineProps({
  option: {
    type: Object,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

const container = ref<HTMLElement>()
onMounted(() => {
  const chart = echarts.init(container.value!)
  echarts.registerMap('bj', bj as GeoJSONSourceInput)
  chart.setOption(props.option)
  const { option } = toRefs(props)
  watch(option, () => {
    chart.setOption(props.option)
  }, { deep: true })
})

</script>

<template>
  <div class="BeijingChart">
    <div ref="container" style="width: 100%; height: 100%;"/>
  </div>
</template>

<style lang="scss" scoped>
.BeijingChart {
}
</style>
