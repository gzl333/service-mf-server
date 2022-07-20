<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
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

// todo WTF are these any???!!!
/* eslint-disable  @typescript-eslint/no-explicit-any */
// const map: any = ref(null)
const tree: any = ref(null)
const mapData: any = ref([])

void nextTick(() => {
  tree.value.setTicked(defaultTicked.value, true)
})

const transfer = (target: string[]) => {
  const coordinateArr = []
  for (const item of target) {
    const coordinateObj: Record<string, string | number | number[]> = {}
    coordinateObj.name = item
    coordinateObj.value = 12
    coordinateObj.LngAndLat = []
    for (const dataCenter of Object.values(store.tables.dataCenterTable.byId)) {
      if (dataCenter.name === item) {
        coordinateObj.LngAndLat.push(dataCenter.longitude)
        coordinateObj.LngAndLat.push(dataCenter.latitude)
      }
    }
    coordinateArr.push(coordinateObj)
  }
  mapData.value = coordinateArr
}
const labelData = [
  {
    name: (() => tc('pages.management.TotalResource.district_huairou'))(),
    value: 38.4,
    lng: 116.63853,
    lat: 40.322563
  },
  {
    name: (() => tc('pages.management.TotalResource.district_miyun'))(),
    value: 47.9,
    lng: 116.849551,
    lat: 40.382999
  },
  {
    name: (() => tc('pages.management.TotalResource.district_changping'))(),
    value: 196.3,
    lng: 116.237832,
    lat: 40.226854
  },
  {
    name: (() => tc('pages.management.TotalResource.district_shunyi'))(),
    value: 102,
    lng: 116.663242,
    lat: 40.1362
  },
  {
    name: (() => tc('pages.management.TotalResource.district_pinggu'))(),
    value: 42.3,
    lng: 117.128025,
    lat: 40.147115
  },
  {
    name: (() => tc('pages.management.TotalResource.district_mentougou'))(),
    value: 30.8,
    lng: 116.108179,
    lat: 39.94648
  },
  {
    name: (() => tc('pages.management.TotalResource.district_haidian'))(),
    value: 369.4,
    lng: 116.304872,
    lat: 39.96553
  },
  {
    name: (() => tc('pages.management.TotalResource.district_shijingshan'))(),
    value: 65.2,
    lng: 116.229612,
    lat: 39.912017
  },
  {
    name: (() => tc('pages.management.TotalResource.district_xicheng'))(),
    value: 129.8,
    lng: 116.372397,
    lat: 39.918561
  },
  {
    name: (() => tc('pages.management.TotalResource.district_dongcheng'))(),
    value: 90.5,
    lng: 116.42272,
    lat: 39.934579
  },
  {
    name: (() => tc('pages.management.TotalResource.district_chaoyang'))(),
    value: 395.5,
    lng: 116.449767,
    lat: 39.927254
  },
  {
    name: (() => tc('pages.management.TotalResource.district_daxing'))(),
    value: 156.2,
    lng: 116.348053,
    lat: 39.732833
  },
  {
    name: (() => tc('pages.management.TotalResource.district_fangshan'))(),
    value: 104.6,
    lng: 116.149892,
    lat: 39.755039
  },
  {
    name: (() => tc('pages.management.TotalResource.district_fengtai'))(),
    value: 232.4,
    lng: 116.293105,
    lat: 39.865042
  },
  {
    name: (() => tc('pages.management.TotalResource.district_tongzhou'))(),
    value: 42.3,
    lng: 116.662928,
    lat: 39.917001
  },
  {
    name: (() => tc('pages.management.TotalResource.district_yanqing'))(),
    value: 42.3,
    lng: 115.981186,
    lat: 40.462706
  }
]
const convertData = function (data: any) {
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
    zoom: 1.2
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
        formatter: function (params: any) {
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
  }, {
    name: (() => tc('pages.management.TotalResource.org_num'))(),
    type: 'map',
    mapType: 'bj',
    geoIndex: 0,
    itemStyle: {
      normal: { label: { show: true } },
      emphasis: { label: { show: true } }
    },
    data: labelData
  }]
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
            @update:ticked="transfer"
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
