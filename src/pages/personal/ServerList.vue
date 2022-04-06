<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import useStore from 'src/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

import ServerTable from 'components/server/ServerTable.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const store = useStore()
// const route = userRoute()
const tc = i18n.global.tc

// service_id下拉列表
// const serviceOptions = computed(() => store.getters['server/getPersonalAvailableServices'])
const serviceOptions = computed(() => [])
const serviceSelection = ref('0')

// 获取云主机列表数据
// const rows = computed(() => store.getters['server/getPersonalServersByServiceId'](serviceSelection.value))

// demo
const rows = [
  {
    id: 'c20b87a2-eddc-11eb-95b1-c8009fe2eb03',
    name: '9b4b717d6fcb4d27b079e071bedf0225',
    vcpus: 1,
    ram: 1024,
    ipv4: '10.0.90.237',
    public_ip: false,
    image: 'aiops',
    creation_time: '2021-07-26T06:43:16.908089Z',
    expiration_time: '2021-09-30T06:43:16.905057Z',
    remarks: '5566',
    classification: 'personal',
    image_id: '2',
    image_desc: '',
    default_user: 'root',
    default_password: 'cnic.cn',
    pay_type: 'postpaid',
    endpoint_url: 'https://vms.cstcloud.cn/',
    service: '82a060ea-b93b-11eb-90bc-c8009fe2eb03',
    user_quota: '71234804-ea97-11eb-9aaa-c8009fe2eb03',
    center_quota: 1,
    vo_id: null,
    user: {
      id: '6',
      username: 'zlguo@cnic.cn'
    },
    lock: 'lock-delete',
    status: 5
  },
  {
    id: 'cbfc0620-82fb-11eb-af7b-c8009fe2eb02',
    name: '72cc7dc1d07f4379a584b6ad54f0593a',
    vcpus: 1,
    ram: 1024,
    ipv4: '159.226.235.87',
    public_ip: true,
    image: 'Windows 10',
    creation_time: '2021-03-12T06:25:53.564106Z',
    expiration_time: null,
    remarks: 'test server',
    classification: 'personal',
    image_id: '1',
    image_desc: 'win10 64bit',
    default_user: 'root',
    default_password: 'cnic.cn',
    pay_type: 'postpaid',
    endpoint_url: 'https://vms.cstcloud.cn/',
    service: '1',
    user_quota: '70ef572e-7fdf-11eb-b60f-c8009fe2eb02',
    center_quota: 2,
    vo_id: null,
    user: {
      id: '6',
      username: 'zlguo@cnic.cn'
    },
    lock: 'lock-delete',
    status: 5
  },
  {
    id: '9219dfbe-7fdf-11eb-a828-c8009fe2eb02',
    name: 'b2d71fd409694ab7b51bcca34a2721c5',
    vcpus: 1,
    ram: 1024,
    ipv4: '10.107.50.10',
    public_ip: false,
    image: 'CentOS_8.3',
    creation_time: '2021-03-08T07:26:17.056294Z',
    expiration_time: null,
    remarks: 'ccc',
    classification: 'personal',
    image_id: '',
    image_desc: '',
    default_user: 'root',
    default_password: 'cnic.cn',
    pay_type: 'postpaid',
    endpoint_url: 'https://vms.cstcloud.cn/',
    service: '2',
    user_quota: '6',
    center_quota: 2,
    vo_id: null,
    user: {
      id: '6',
      username: 'zlguo@cnic.cn'
    },
    lock: 'lock-operation',
    status: 10
  }
]

// 搜索框
const search = ref('')

</script>

<template>
  <div class="ServerList" style="height: 2000px">
    <div class="row items-center justify-between q-py-md">

      <div class="col-3">
        <div class="row justify-start">
          <div class="col">
            <q-input dense outlined v-model="search">
              <template v-slot:prepend>
                <q-icon name="search"/>
              </template>
              <template v-slot:append v-if="search">
                <q-icon name="close" @click="search = ''" class="cursor-pointer"/>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="col-3">
        <div class="row justify-end">
          <div class="col">
            <q-select outlined dense stack-label :label="tc('筛选服务节点')" v-model="serviceSelection"
                      :options="serviceOptions" emit-value map-options option-value="value"
                      :option-label="i18n.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <ServerTable :servers="rows" :search="search.trim().toLowerCase()"/>

  </div>
</template>

<style lang="scss" scoped>
.ServerList {
}
</style>
