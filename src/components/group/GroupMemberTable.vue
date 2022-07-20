<script setup lang="ts">
import { /* ref, */ computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import GroupRoleChip from 'components/group/GroupRoleChip.vue'

const props = defineProps({
  groupId: {
    type: String,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const columns = computed(() => [
  {
    name: 'username',
    label: (() => tc('components.group.GroupMemberTable.user_name'))(),
    field: 'username',
    align: 'center',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'role',
    label: (() => tc('components.group.GroupMemberTable.role'))(),
    field: 'role',
    align: 'center',
    style: 'padding: 15px 5px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'time',
    label: (() => tc('components.group.GroupMemberTable.join_time'))(),
    field: 'time',
    align: 'center',
    style: 'padding: 15px 5px',
    headerStyle: 'padding: 0 5px'
  },
  {
    name: 'inviter',
    label: (() => tc('components.group.GroupMemberTable.inviter'))(),
    field: 'inviter',
    align: 'center',
    style: 'padding: 15px 5px',
    headerStyle: 'padding: 0 5px'
  },
  ...(store.tables.groupTable.byId[props.groupId]?.myRole !== 'member' ? [{
    name: 'operation',
    label: (() => tc('components.group.GroupMemberTable.operation'))(),
    field: 'operation',
    align: 'center',
    style: 'padding: 15px 5px',
    headerStyle: 'padding: 0 5px'
  }] : [])
])

const members = computed(() => store.getGroupMembersByGroupId(props.groupId))

</script>

<template>
  <div class="GroupMemberTable">
    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="members"
      :columns="columns"
      row-key="name"
      :loading="store.tables.groupMemberTable.status === 'loading'"
      color="primary"
      :loading-label="tc('components.group.GroupMemberTable.network_wait')"
      :no-data-label="tc('components.group.GroupMemberTable.no_members')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
    >

      <template v-slot:body="props">
        <q-tr :props="props">

          <q-td key="username" :props="props">
            <q-btn flat padding="none" no-caps no-wrap :ripple="false">
              {{ props.row.user.username }}
              <!--创建时间距离当下小于1小时则打上new标记-->
              <q-badge v-if="(new Date() - new Date(props.row.join_time)) < 1000 * 60 * 60 * 1 "
                       color="light-green" floating transparent rounded align="middle">new
              </q-badge>
            </q-btn>

          </q-td>

          <q-td key="role" :props="props">
            <group-role-chip :role="props.row.role"/>
          </q-td>

          <q-td key="time" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.join_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.join_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.join_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.join_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="inviter" :props="props">
            {{ props.row.inviter }}
          </q-td>

          <q-td key="operation" :props="props">
            <div class="column justify-center items-center q-gutter-xs">
              <q-btn v-if="store.tables.groupTable.byId[groupId]?.myRole === 'owner' && props.row.role === 'member'" icon="mdi-account-multiple-check" flat dense padding="none"
                     color="primary"
                     @click="store.editGroupMemberRoleDialog( {groupId, member_id: props.row.id, role:'leader', role_name: tc('components.group.GroupMemberTable.admin')})">
                {{ tc('components.group.GroupMemberTable.set_admin') }}
              </q-btn>

              <q-btn v-if="store.tables.groupTable.byId[groupId]?.myRole === 'owner' && props.row.role === 'leader'" icon="mdi-account-multiple-remove" flat dense padding="none" color="primary"
                     @click="store.editGroupMemberRoleDialog({groupId, member_id: props.row.id, role:'member', role_name: tc('components.group.GroupMemberTable.group_members')})">
                {{ tc('components.group.GroupMemberTable.cancel_admin') }}
              </q-btn>

              <q-btn icon="remove_circle" flat dense padding="none" color="primary"
                     @click="store.removeSingleGroupMemberDialog( {groupId, username: props.row.user.username})">
                {{ tc('components.group.GroupMemberTable.remove_project_group') }}
              </q-btn>
            </div>
          </q-td>

        </q-tr>
      </template>

      <!--      <template v-slot:bottom>-->
      <!--      todo 批量操作-->
      <!--      </template>-->

    </q-table>

    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="primary"/>
    </q-page-scroller>

    <q-separator/>
  </div>
</template>

<style lang="scss" scoped>
.GroupMemberTable {
}
</style>
