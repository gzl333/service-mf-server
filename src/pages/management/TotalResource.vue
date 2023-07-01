<script setup lang="ts">
import { computed, ref, reactive, nextTick, watch /* onMounted  */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { QTree } from 'quasar'

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

// 加载两个配额相关的table
if (store.tables.serviceAllocationTable.status === 'init') {
  store.loadServiceAllocationTable()
}
if (store.tables.fedAllocationTable.status === 'init') {
  store.loadFedAllocationTable()
}

// 饼图
const fedCpuNum = computed(() => store.getFedCpuPie)
const fedRamNum = computed(() => store.getFedRamPie)
const fedDiskNum = computed(() => store.getFedDiskPie)
const serviceCpuNum = computed(() => store.getServiceCpuPie)
const serviceRamNum = computed(() => store.getServiceRamPie)
const serviceDiskNum = computed(() => store.getServiceDiskPie)

// tree
const tree = ref<QTree>()
const treeData = computed(() => store.getMechanismTree)

// tree中机构的toggle model
const toggleDatacenter = reactive({})
const buildToggleModel = () => {
  if (store.tables.dataCenterTable.status === 'total') {
    for (const datacenterId of store.tables.dataCenterTable.allIds) {
      Object.assign(toggleDatacenter, { [datacenterId]: true })
    }
  }
}
// setup时运行一次
buildToggleModel()
// 异步更新table时运行
watch(store.tables.dataCenterTable, buildToggleModel)

watch(treeData, () => {
  void nextTick(() => {
    tree.value?.expandAll()
  })
})

// 地图上的点

// 把toggleDatacenter的选择值转化为echarts所需的经纬度对象
const mapData = computed(() =>
  Object.entries(toggleDatacenter)
    .filter(datacenter => datacenter[1])
    .map(datacenter => datacenter[0])
    .map(datacenterId => {
      const coordinateObj: Record<string, string | number | number[]> = {}
      const datacenter = store.tables.dataCenterTable.byId[datacenterId]
      coordinateObj.name = i18n.global.locale === 'zh' ? datacenter.name : datacenter.name_en
      coordinateObj.value = [datacenter.longitude, datacenter.latitude, 12]
      return coordinateObj
    })
)

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
    data: mapData.value,
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

</script>

<template>
  <div class="TotalResource">

    <!--    <pre>{{ treeData }}</pre>-->

    <div class="row items-center q-gutter-lg text-h6">
      <div class="col-auto row items-end">
        <div class="text-grey">{{ tc('pages.management.TotalResource.current_org_num') }}:</div>
        <div class="text-primary text-h4">{{
            store.tables.dataCenterTable.allIds?.filter(dataCenterId => store.tables.dataCenterTable.byId[dataCenterId]?.status.code === 1).length
          }}
        </div>
      </div>
      <div class="col-auto row items-end">
        <div class="text-grey">{{ tc('pages.management.TotalResource.current_service_num') }}:</div>
        <div class="text-primary text-h4">
          {{
            store.tables.serviceTable.allIds?.filter(serviceId => store.tables.serviceTable.byId[serviceId]?.status === 'enable').length
          }}
        </div>
      </div>
    </div>

    <div class="row">

      <q-scroll-area class="col-4 bg-grey-2 q-pa-sm text-subtitle1" style="height: 500px;" visible>

        <q-tree
          ref="tree"
          :nodes="treeData"
          default-expand-all
          node-key="label"
        >
          <template v-slot:header-datacenter="prop">
            <div class="row items-center">

              <q-toggle
                class="col-auto"
                v-model="toggleDatacenter[prop.node.id]"
                color="green-3"
                dense
                size="30px"
              >
                <q-tooltip>
                  {{ tc('在地图上显示') }}
                </q-tooltip>
              </q-toggle>

              <div class="col-auto text-weight-bold text-primary">{{ prop.node.label }}</div>

            </div>
          </template>

        </q-tree>
      </q-scroll-area>

      <div class="col-8 row items-center justify-center">
        <BeijingMap class="col" style="width: 600px; height: 500px" :option="option"></BeijingMap>
      </div>

    </div>

    <q-separator class="q-my-md"/>

    <div class="row justify-between">
      <div class="col-auto text-h6 text-grey">
        {{ tc('pages.management.TotalResource.service_auto_resource_configuration') }}
      </div>
      <div class="col-auto row q-gutter-lg">
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_cpu') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{
              serviceCpuNum.reduce((accumulator, item) => accumulator + item.value, 0)
            }}{{ tc('pages.management.TotalResource.cores') }}
          </div>
        </div>
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_ram') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{ serviceRamNum.reduce((accumulator, item) => accumulator + item.value, 0) }}GB
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
      <resource-pie-chart :data="serviceDiskNum"
                          :title="tc('pages.management.TotalResource.disk')"></resource-pie-chart>
    </div>

    <q-separator class="q-my-md"/>

    <div class="row justify-between">
      <div class="col-auto text-h6 text-grey">{{
          tc('pages.management.TotalResource.federal_resource_allocation')
        }}
      </div>
      <div class="col-auto row q-gutter-lg">
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_cpu') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{
              fedCpuNum.reduce((accumulator, item) => accumulator + item.value, 0)
            }}{{ tc('pages.management.TotalResource.cores') }}
          </div>
        </div>
        <div class="col-auto row">
          <div class="col-auto text-h6 text-grey">
            {{ tc('pages.management.TotalResource.total_ram') }}:
          </div>
          <div class="col-auto text-h6 text-primary">
            {{ fedRamNum.reduce((accumulator, item) => accumulator + item.value, 0) }}GB
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
