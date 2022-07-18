<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import GroupTable from 'components/group/GroupTable.vue'

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
const { tc } = i18n.global

// role filter
const roleSelection = ref('all')

const roleOptions = [
  {
    value: 'all',
    label: (() => tc('pages.GroupList.all_groups'))(),
    labelEn: 'All Groups'
  },
  {
    value: 'owner',
    label: (() => tc('pages.GroupList.as_group_owner'))(),
    labelEn: 'As Group Owner'
  },
  {
    value: 'leader',
    label: (() => tc('pages.GroupList.as_group_manager'))(),
    labelEn: 'AS Group Manager'
  },
  {
    value: 'member',
    label: (() => tc('pages.GroupList.as_group_member'))(),
    labelEn: 'As Group Member'
  }
]

// group data
const groups = computed(() => store.getGroupsByFilter(roleSelection.value))

// 搜索框
const search = ref('')

</script>

<template>
  <div class="GroupList">

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

      <div class="col-2">
        <div class="row justify-end">
          <div class="col">
            <q-select outlined dense stack-label :label="tc('pages.GroupList.my_role_filter')" v-model="roleSelection"
                      :options="roleOptions" emit-value map-options option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="roleSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
              </template>
            </q-select>
          </div>
        </div>
      </div>

    </div>

    <GroupTable :groups="groups" :search="search.trim().toLowerCase()"/>

  </div>
</template>

<style lang="scss" scoped>
.GroupList {
}
</style>
