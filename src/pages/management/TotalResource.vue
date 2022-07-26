<script setup lang="ts">
import { computed, ref, nextTick, watch, Ref } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import ResourcePieChart from 'components/chart/ResourcePieChart.vue'
import BeijingMap from 'components/chart/BeijingMap.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

interface PointInterface {
  name: string
  value: number
  LngAndLat: number[]
}

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const treeData = computed(() => store.getMechanismTree)
const fedCpuNum = computed(() => store.getFedCpuPie)
const fedRamNum = computed(() => store.getFedRamPie)
const fedDiskNum = computed(() => store.getFedDiskPie)
const serviceCpuNum = computed(() => store.getServiceCpuPie)
const serviceRamNum = computed(() => store.getServiceRamPie)
const serviceDiskNum = computed(() => store.getServiceDiskPie)
const defaultTicked = computed(() => store.getDefaultTicked)
const ticked = ref([])
const tree: Ref = ref(null)
const mapData: Ref = ref([])

const translationMapping = {
  怀柔区: 'Huairou District',
  密云区: 'Miyun District',
  昌平区: 'Changping District',
  顺义区: 'Shunyi District',
  平谷区: 'Pinggu District',
  门头沟区: 'Mentougou District',
  海淀区: 'Haidian District',
  石景山区: 'Shijingshan District',
  西城区: 'Xicheng District',
  东城区: 'Dongcheng District',
  朝阳区: 'Chaoyang District',
  大兴区: 'Daxing District',
  房山区: 'Fangshan District',
  丰台区: 'Fengtai District',
  通州区: 'Tongzhou District',
  延庆区: 'Yanqing District'
}

void nextTick(() => {
  tree.value.setTicked(defaultTicked.value, true)
})

// 地图上的点
const mapPoints = (target: string[]) => {
  const coordinateArr = []
  // 页面第一次进来 默认全选 target为选中的值
  for (const item of target) {
    const coordinateObj: Record<string, string | number | number[]> = {}
    coordinateObj.name = item
    coordinateObj.value = 12
    coordinateObj.LngAndLat = []
    for (const dataCenter of Object.values(store.tables.dataCenterTable.byId)) {
      if (i18n.global.locale === 'zh') {
        if (dataCenter.name === item) {
          coordinateObj.LngAndLat.push(dataCenter.longitude)
          coordinateObj.LngAndLat.push(dataCenter.latitude)
          coordinateArr.push(coordinateObj)
        }
      } else {
        if (dataCenter.name_en === item) {
          coordinateObj.LngAndLat.push(dataCenter.longitude)
          coordinateObj.LngAndLat.push(dataCenter.latitude)
          coordinateArr.push(coordinateObj)
        }
      }
    }
  }
  mapData.value = coordinateArr
}

// 地图上初始的点
const convertData = function (data: PointInterface[]) {
  const res = []
  for (let i = 0; i < data.length; i++) {
    const geoCoord = data[i].LngAndLat
    if (geoCoord) {
      res.push({
        name: data[i].name,
        value: geoCoord.concat(data[i].value)
      })
    }
  }
  return res
}
const option = computed(() => ({
  tooltip: {
    show: true,
    trigger: 'item',
    formatter: '{b}'
  },
  // geo属性渲染地图 通过json文件
  geo: {
    map: 'bj',
    label: {
      normal: {
        show: false
      },
      emphasis: {
        show: false
      }
    },
    roam: false,
    itemStyle: {
      normal: {
        areaColor: '#ECEFF4',
        borderColor: '#4C566A'
      },
      emphasis: {
        areaColor: '#2B91B7'
      }
    },
    zoom: 1.2,
    // 通过nameMap属性进行映射翻译
    nameMap: i18n.global.locale === 'en' ? translationMapping : ''
  },
  series: [{
    name: (() => tc('pages.management.TotalResource.org'))(),
    type: 'effectScatter',
    coordinateSystem: 'geo',
    data: convertData(mapData.value),
    symbolSize: function (val: number[]) {
      return val[2]
    },
    showEffectOn: 'emphasis',
    rippleEffect: {
      number: 4,
      scale: 4,
      brushType: 'stroke'
    },
    hoverAnimation: true,
    label: {
      normal: {
        show: true,
        position: 'top',
        formatter: function (params: Record<string, never>) {
          return params.name
        },
        lineHeight: 15,
        backgroundColor: '#fafafa',
        borderColor: '#31CCEC',
        borderWidth: '1',
        borderRadius: 5,
        padding: [8, 10, 5],
        color: '#1d1d1d',
        fontSize: 14,
        fontWeight: 'normal'
      },
      emphasis: {
        show: true
      }
    },
    itemStyle: {
      normal: {
        color: '#027BE3'
      }
    }
  }
  // 地图点击事件 翻译后 事件失效 会影响翻译
  //   {
  //   name: (() => tc('pages.management.TotalResource.org_num'))(),
  //   type: 'map',
  //   mapType: 'bj',
  //   geoIndex: 0,
  //   itemStyle: {
  //     normal: { label: { show: true } },
  //     emphasis: { label: { show: true } }
  //   },
  //   data: labelData
  // }
  ]
}))

watch(treeData, () => {
  void nextTick(() => {
    tree.value.expandAll()
  })
})
watch(defaultTicked, () => {
  void nextTick(() => {
    tree.value.setTicked(defaultTicked.value, true)
  })
})
</script>

<template>
  <div class="TotalResource">
    <div class="row">
      <div class="col-5 column">
        <div class="row items-center q-gutter-lg text-h6">
          <div class="col-auto row items-end">
            <div class="text-grey">{{ tc('pages.management.TotalResource.current_org_num') }}:</div>
            <div class="text-primary text-h4">{{ store.tables.dataCenterTable.allIds?.length }}</div>
          </div>
          <div class="col-auto row items-end">
            <div class="text-grey">{{ tc('pages.management.TotalResource.current_service_num') }}:</div>
            <div class="text-primary text-h4">
              {{ store.tables.serviceTable.allIds?.length }}
            </div>
          </div>
        </div>
        <div class="q-pa-md text-subtitle1">
          <q-tree
            ref="tree"
            :nodes="treeData"
            default-expand-all
            node-key="label"
            tick-strategy="strict"
            v-model:ticked="ticked"
            @update:ticked="mapPoints"
          />
        </div>
      </div>
      <div class="col-7">
        <BeijingMap :option="option" style="width: 600px; height: 450px"></BeijingMap>
      </div>
    </div>
    <q-separator class="q-my-md"/>
    <div class="row justify-between">
      <div class="col-auto text-h6 text-grey">{{ tc('pages.management.TotalResource.service_auto_resource_configuration') }}</div>
      <div class="col-auto row q-gutter-lg">
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_cpu') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{ serviceCpuNum.reduce((accumulator, item) => accumulator + item.value, 0) }}{{ tc('pages.management.TotalResource.cores') }}
          </div>
        </div>
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_ram') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{ serviceRamNum.reduce((accumulator, item) => accumulator + item.value, 0) / 1024 }}GB
          </div>
        </div>
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_disk') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{ serviceDiskNum.reduce((accumulator, item) => accumulator + item.value, 0) }}GB
          </div>
        </div>
      </div>
    </div>
    <div class="row q-mt-lg">
      <resource-pie-chart :data="serviceCpuNum" title="CPU"></resource-pie-chart>
      <resource-pie-chart :data="serviceRamNum" :title="tc('pages.management.TotalResource.ram')"></resource-pie-chart>
      <resource-pie-chart :data="serviceDiskNum" :title="tc('pages.management.TotalResource.disk')"></resource-pie-chart>
    </div>
    <q-separator class="q-my-md"/>
    <div class="row justify-between">
      <div class="col-auto text-h6 text-grey">{{ tc('pages.management.TotalResource.federal_resource_allocation') }}</div>
      <div class="col-auto row q-gutter-lg">
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_cpu') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{ fedCpuNum.reduce((accumulator, item) => accumulator + item.value, 0) }}{{ tc('pages.management.TotalResource.cores') }}
          </div>
        </div>
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_ram') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{ fedRamNum.reduce((accumulator, item) => accumulator + item.value, 0) / 1024 }}GB
          </div>
        </div>
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_disk') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{ fedDiskNum.reduce((accumulator, item) => accumulator + item.value, 0) }}GB
          </div>
        </div>
      </div>
    </div>
    <div class="row q-mt-lg">
      <resource-pie-chart :data="fedCpuNum" title="CPU"></resource-pie-chart>
      <resource-pie-chart :data="fedRamNum" :title="tc('pages.management.TotalResource.ram')"></resource-pie-chart>
      <resource-pie-chart :data="fedDiskNum" :title="tc('pages.management.TotalResource.disk')"></resource-pie-chart>
    </div>
    <q-separator class="q-my-lg"/>
  </div>
</template>

<style lang="scss" scoped>
.TotalResource {
}
</style>
