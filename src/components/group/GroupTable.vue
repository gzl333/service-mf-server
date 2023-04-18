<script setup lang="ts">
import { /* ref,  */computed, PropType } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore, GroupInterface } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import GroupRoleChip from 'components/group/GroupRoleChip.vue'

/* const props =  */
defineProps({
  groups: {
    type: Array as PropType<GroupInterface[]>,
    required: true
  },
  search: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// group分栏定义
const columns = computed(() => [
  {
    name: 'role',
    label: (() => tc('components.group.GroupTable.my_role'))(),
    field: 'role',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'name',
    label: (() => tc('name'))(),
    field: 'name',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; max-width: 200px;word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'company',
    label: (() => tc('components.group.GroupTable.org'))(),
    field: 'company',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; max-width: 150px;word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'desc',
    label: (() => tc('components.group.GroupTable.remarks'))(),
    field: 'desc',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; max-width: 150px;word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'creation_time',
    label: (() => tc('components.group.GroupTable.creation_time'))(),
    field: 'creation_time',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'member',
    label: (() => tc('components.group.GroupTable.members'))(),
    field: 'member',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  // {
  //   name: 'server',
  //   label: (() => tc('components.group.GroupTable.server'))(),
  //   field: 'server',
  //   align: 'center',
  //   style: 'padding: 15px 0px',
  //   headerStyle: 'padding: 0 5px'
  // },
  {
    name: 'order',
    label: (() => tc('components.group.GroupTable.order'))(),
    field: 'order',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'coupon',
    label: (() => tc('components.group.GroupTable.coupon'))(),
    field: 'coupon',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'balance',
    label: (() => tc('components.group.GroupTable.balance'))(),
    field: 'balance',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'operation',
    label: (() => tc('components.group.GroupTable.operation'))(),
    field: 'operation',
    align: 'center',
    style: 'padding: 15px 0px; height: 105px;', // 每一行被此处撑开，决定行高
    headerStyle: 'padding: 0 5px'
  }
])

// 搜索方法，可扩展成更模糊的
const searchMethod = (rows: GroupInterface[], terms: string): GroupInterface[] => rows.filter(group => group.id.toLowerCase().includes(terms) || group.name.toLowerCase().includes(terms) || group.description.toLowerCase().includes(terms) || group.company.toLowerCase().includes(terms))

</script>

<template>
  <div class="GroupTable">
    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="groups"
      :columns="columns"
      row-key="name"
      :loading="store.tables.groupTable.status === 'loading'"
      color="primary"
      :loading-label="tc('components.group.GroupTable.notify_loading')"
      :no-data-label="tc('components.group.GroupTable.notify_no_group')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      :filter="search"
      :filter-method="searchMethod"
      :no-results-label="tc('components.group.GroupTable.notify_no_result')"
    >

      <template v-slot:body="props">
        <q-tr :props="props">

          <q-td key="role" :props="props">
            <GroupRoleChip class="non-selectable" :role="props.row.myRole"/>
          </q-td>

          <q-td key="name" :props="props">
            <q-btn
              class="q-ma-none" :label="props.row.name" color="primary" padding="xs" flat dense unelevated no-caps
              @click="navigateToUrl(`/my/server/group/detail/${props.row.id}`)">
              <q-tooltip>
                {{ tc('components.group.GroupTable.details') }}
              </q-tooltip>
              <!--创建时间距离当下小于1小时则打上new标记-->
              <q-badge v-if="(new Date() - new Date(props.row.creation_time)) < 1000 * 60 * 60 * 1 "
                       color="light-green" floating transparent rounded align="middle">new
              </q-badge>
            </q-btn>
          </q-td>

          <q-td key="company" :props="props">
            {{ props.row.company }}
          </q-td>

          <q-td key="desc" :props="props">
            {{ props.row.description }}
<!--            <q-tooltip>-->
<!--              {{ props.row.description }}-->
<!--            </q-tooltip>-->
          </q-td>

          <q-td key="creation_time" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="member" :props="props">
            <q-btn color="primary" flat padding="none" dense no-caps
                   @click="navigateToUrl(`/my/server/group/detail/${props.row.id}?show=member`)">
              {{ store.tables.groupMemberTable.byId[props.row.id]?.members.length + 1 }}
              {{ tc('components.group.GroupTable.member') }}
            </q-btn>
          </q-td>

<!--          <q-td key="server" :props="props">-->
<!--            <q-btn color="primary" flat padding="none" dense no-caps-->
<!--                   @click="navigateToUrl(`/my/server/group/detail/${props.row.id}?show=server`)">-->
<!--              {{ store.getGroupServersByGroupId(props.row.id).length }}-->
<!--              {{ tc('components.group.GroupTable.servers') }}-->
<!--            </q-btn>-->
<!--          </q-td>-->

          <q-td key="order" :props="props">
            <q-btn color="primary" flat padding="none" dense no-caps
                   @click="navigateToUrl(`/my/server/group/detail/${props.row.id}?show=order`)">
              {{ store.getGroupOrdersByGroupId(props.row.id).length }}
              {{ tc('components.group.GroupTable.orders') }}
            </q-btn>
          </q-td>

          <q-td key="coupon" :props="props">
            <q-btn color="primary" flat padding="none" dense no-caps
                   @click="navigateToUrl(`/my/server/group/detail/${props.row.id}?show=coupon`)">
              {{ store.tables.groupTable.byId[props.row.id].coupons.length }}
              {{ tc('components.group.GroupTable.coupons') }}
            </q-btn>
          </q-td>

          <q-td key="balance" :props="props">
            <div class="row justify-center items-center"
                 :class="Number(store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[props.row.id].balance]?.balance) >= 0 ? 'text-black':'text-red'">
              {{ store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[props.row.id].balance]?.balance }}
              {{ tc('components.group.GroupTable.points') }}
            </div>
          </q-td>

          <q-td key="operation" :props="props">

            <div class="column justify-center items-start ">

              <q-btn icon="info" flat no-caps dense padding="none" color="primary"
                     @click="navigateToUrl(`/my/server/group/detail/${props.row.id}`)">
                {{ tc('components.group.GroupTable.check_details') }}
              </q-btn>

              <q-btn v-if="store.tables.groupTable.byId[props.row.id]?.myRole !== 'member'"
                     icon="edit" flat no-caps padding="none" color="primary" size="md" dense
                     @click="store.editGroupDialog(props.row.id)">
                {{ tc('components.group.GroupTable.edit_group_info') }}
              </q-btn>

              <q-btn v-if="store.tables.groupTable.byId[props.row.id]?.myRole ==='owner'"
                     icon="group_off" flat no-caps padding="none" dense
                     color="primary" size="md"
                     @click="store.deleteGroupDialog(props.row.id)">
                {{ tc('components.group.GroupTable.dismiss_group') }}
              </q-btn>

            </div>

          </q-td>

        </q-tr>
      </template>

      <template v-slot:bottom>
        <!--            todo 批量操作-->
      </template>

    </q-table>

    <!--    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">-->
    <!--      <q-btn fab icon="keyboard_arrow_up" color="primary"/>-->
    <!--    </q-page-scroller>-->

    <!--    <q-separator/>-->
  </div>
</template>

<style lang="scss" scoped>
.GroupTable {
}
</style>
