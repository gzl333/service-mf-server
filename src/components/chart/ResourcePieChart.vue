<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import * as echarts from 'echarts/core'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout
])

const container = ref<HTMLElement>()

onMounted(() => {
  const chart = echarts.init(container.value!)
  const option = computed(() => ({
    title: {
      text: props.title,
      right: 120
    },
    tooltip: {
      trigger: 'item',
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      formatter: function (data: Record<string, any>) {
        if (props.title === '内存') {
          return data.seriesName + '<br/>' + data.name + ': ' + data.value / 1024 + ' GB'
        } else if (props.title === 'CPU') {
          return data.seriesName + '<br/>' + data.name + ': ' + data.value + ` ${tc('components.chart.ResourcePieChart.core')}`
        } else {
          return data.seriesName + '<br/>' + data.name + ': ' + data.value + ' GB'
        }
      }
    },
    legend: {
      orient: 'vertical',
      type: 'scroll',
      left: 0,
      top: 0,
      textStyle: {
        fontSize: 12,
        fontWeight: 'bold'
      }
    },
    // color: ['#F2C037', '#4caf50', '#027BE3'],
    series: [
      {
        name: `${tc('components.chart.ResourcePieChart.provider')}`,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        center: ['65%', '50%'],
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '11',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data
      }
    ]
  }))
  chart.setOption(option.value)
  watch(option, () => {
    chart.setOption(option.value)
  })
})

</script>

<template>
  <div class="ResourcePieChart">
    <div ref="container" :style="{ width: '410px', height: '260px' }"/>
  </div>
</template>

<style lang="scss" scoped>
.ResourcePieChart {
}
</style>
