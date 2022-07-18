<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
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

const store = useStore()
// const route = useRoute()
// const router = useRouter()
const tc = i18n.global.tc

// group filter
const groupSelection = ref('0')

const groupOptions = computed(() => store.getGroupOptions)

const rows = computed(() => store.getGroupServersByGroupId(groupSelection.value))
// 搜索框
const search = ref('')

</script>

<template>
  <div class="ServerList">
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
            <q-select outlined dense stack-label :label="tc('pages.ServerList.group_filter')" v-model="groupSelection"
                      :options="groupOptions" emit-value map-options option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="groupSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <server-table :servers="rows" :search="search.trim().toLowerCase()" is-group/>

<!--    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">-->
<!--      <q-btn fab icon="keyboard_arrow_up" color="primary"/>-->
<!--    </q-page-scroller>-->

  </div>
</template>

<style lang="scss" scoped>
.ServerList {
}
</style>
