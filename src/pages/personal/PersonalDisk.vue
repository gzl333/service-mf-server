<script setup lang="ts">
import { ref, computed, watch /* PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { DiskInterface, useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'

import DiskTable from 'components/disk/DiskTable.vue'
import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

// const props = defineProps({
//   foo: {
//     type: String as PropType<'bar'>,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
const exceptionNotifier = useExceptionNotifier()

// service_id下拉列表
const serviceOptions = computed(() => store.getAllServiceOptions)
const serviceSelection = ref('0')

// 搜索框
const search = ref('')

// 被pagination组件使用
const pagination = ref({
  page: 1, // 当前页码
  rowsPerPage: 10, // 每页条数
  count: 0 // 总共条数
})

// 复位分页
const resetPageSelection = () => {
  pagination.value.page = 1
}

// 存储disk对象数组
const rows = ref<DiskInterface[]>([])

// loadRows是否再loading
const isLoading = ref(false)

// 根据当前搜索条件，更新rows，并更新count值
const loadRows = async () => {
  // table loading
  isLoading.value = true
  // request
  try {
    const respGetDisk = await api.server.disk.getDisk({
      query: {
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,
        ...(serviceSelection.value !== '0' && { service_id: serviceSelection.value })
        // ...(props.isGroup && { vo_id: groupSelection.value }),
      }
    })
    // console.log(respGetVoucher.data.results)
    // 拿到rows值，给table用
    rows.value = respGetDisk.data.results
    // pagination count
    pagination.value.count = respGetDisk.data.count
  } catch (exception) {
    exceptionNotifier(exception)
  }
  // table stop loading
  isLoading.value = false
}

// setup时读取一次
loadRows()
// service选择更改时读取
watch(serviceSelection, loadRows)

</script>

<template>
  <div class="PersonalDisk">

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
            <q-select outlined dense stack-label :label="tc('pages.personal.ServerList.service_node_filter')"
                      v-model="serviceSelection"
                      :options="serviceOptions" emit-value map-options option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <DiskTable
      :rows="rows.filter(disk => disk.remarks.includes(search) || disk.mountpoint.includes(search))"
      :is-loading="isLoading"
    />

    <div class="row full-width items-center justify-end">
      <div class="col row items-center justify-end text-grey">
        <q-select color="grey"
                  v-model="pagination.rowsPerPage"
                  :options="[1, 2, 10,20,30,50,100]"
                  dense
                  options-dense
                  borderless
                  @update:model-value="resetPageSelection();loadRows()">
          <!--当前选项的内容插槽-->
          <!--                      <template v-slot:selected-item>-->
          <!--                            <span class="text-grey">-->
          <!--                            {{ pagination.rowsPerPage }}-->
          <!--                            </span>-->
          <!--                      </template>-->
        </q-select>
        项/页
      </div>

      <q-pagination v-model="pagination.page"
                    :max="Math.ceil(pagination.count / pagination.rowsPerPage )"
                    :max-pages="9"
                    direction-links
                    flat
                    :ripple="false"
                    @update:model-value="loadRows()"
      />
    </div>

  </div>
</template>

<style lang="scss" scoped>
.PersonalDisk {
}
</style>
