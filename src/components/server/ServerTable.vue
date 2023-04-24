<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore, ServerInterface } from 'stores/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import ServerStatus from 'components/server/ServerStatus.vue'
import ServerOperationBtnGroup from 'components/server/ServerOperationBtnGroup.vue'
import OsLogo from 'components/ui/OsLogo.vue'
import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'

const props = defineProps({
  servers: {
    type: Array as PropType<ServerInterface[]>,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false
  },
  isHideGroup: {
    type: Boolean,
    required: false
  },
  search: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = userRoute()
const { tc } = i18n.global

// 分栏定义
const columns = computed(() => [
  {
    name: 'ip',
    label: (() => tc('components.server.ServeTable.ip_address'))(),
    field: 'ip',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  ...((props.isGroup && !props.isHideGroup) ? [{ // 是group且不hide时加入这个配置
    name: 'group',
    label: (() => tc('components.server.ServeTable.group'))(),
    field: 'group',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; max-width: 120px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  }] : []),
  {
    name: 'serviceNode',
    label: (() => tc('components.server.ServeTable.service_node'))(),
    field: 'serviceNode',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px;  word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'image',
    label: (() => tc('components.server.ServeTable.operating_system'))(),
    field: 'image',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; min-width: 80px; max-width: 100px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'configuration',
    label: (() => tc('components.server.ServeTable.hardware_configuration'))(),
    field: 'configuration',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'billing',
    label: (() => tc('components.server.ServeTable.billing_method'))(),
    field: 'billing',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'note',
    label: (() => tc('components.server.ServeTable.remarks'))(),
    field: 'note',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 100px;padding: 15px 0px;word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'vnc',
    label: (() => tc('components.server.ServeTable.remote_control'))(),
    field: 'vnc',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'status',
    label: (() => tc('components.server.ServeTable.status'))(),
    field: 'status',
    align: 'center',
    style: 'padding: 15px 0px; width: 100px', // 固定宽度防止更新状态时抖动
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'operation',
    label: (() => tc('components.server.ServeTable.operation'))(),
    field: 'operation',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px;width: 150px;',
    headerStyle: 'padding: 0 2px'
  }])

// 当前用户在group内的角色
// const myRole = computed(() => store.tables.groupTable.byId[props.servers[0]?.vo_id || '']?.myRole)

// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()

// table row hover
const hoverRow = ref('')
const onMouseEnterRow = (rowName: string) => {
  hoverRow.value = rowName
}
const onMouseLeaveRow = () => {
  hoverRow.value = ''
}

// 搜索方法，可扩展成更模糊的
const searchMethod = (rows: ServerInterface[], terms: string): ServerInterface[] => rows.filter(server => server.id.toLowerCase().includes(terms) || server.ipv4.toLowerCase().includes(terms) || server.image.toLowerCase().includes(terms) || server.remarks.toLowerCase().includes(terms))

</script>

<template>
  <div class="ServerTable">
    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="servers"
      :columns="columns"
      row-key="name"
      :loading="isGroup ? store.tables.groupServerTable.status === 'loading' : store.tables.personalServerTable.status === 'loading' "
      color="primary"
      :loading-label="tc('components.server.ServeTable.notify_loading')"
      :no-data-label="tc('components.server.ServeTable.no_server_available')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      :filter="search"
      :filter-method="searchMethod"
      :no-results-label="tc('components.server.ServeTable.no_search_results')"
    >

      <template v-slot:body="props">
        <q-tr :props="props"
              @mouseenter="onMouseEnterRow(props.row.name)"
              @mouseleave="onMouseLeaveRow"
        >
          <q-td key="ip" :props="props">

            <q-btn
              class="q-ma-none" :label="props.row.ipv4" color="primary" padding="none" flat dense unelevated no-caps
              @click="navigateToUrl(isGroup ? `/my/server/group/server/detail/${props.row.id}` : `/my/server/personal/detail/${props.row.id}`)">
              <q-tooltip>
                {{ tc('components.server.ServeTable.server_detail') }}
              </q-tooltip>
              <!--创建时间距离当下小于1小时则打上new标记-->
              <q-badge style="top:-10px;"
                       v-if="(new Date() - new Date(props.row.creation_time)) < 1000 * 60 * 60 * 1 "
                       color="light-green" floating transparent rounded align="middle">
                new
              </q-badge>
            </q-btn>

            <q-btn v-if="hoverRow === props.row.name"
                   class="col-shrink q-px-xs q-ma-none" flat no-caps dense icon="content_copy" size="xs" color="primary"
                   @click="clickToCopy(props.row.ipv4)">
              <q-tooltip>
                {{ tc('components.server.ServeTable.copy_to_clipboard') }}
              </q-tooltip>
            </q-btn>
            <q-btn v-else
                   class="col-shrink q-px-xs q-ma-none invisible" flat dense icon="content_copy" size="xs">
            </q-btn>

          </q-td>

          <q-td v-if="isGroup && !isHideGroup" key="group" :props="props">
            <q-btn
              class="q-ma-none"
              color="primary"
              padding="none" flat dense unelevated no-caps
              :label="store.tables.groupTable.byId[props.row.vo_id]?.name"
              @click="navigateToUrl(`/my/server/group/detail/${props.row.vo_id}`)">
              <q-tooltip>
                {{ tc('components.server.ServeTable.group_detail') }}
              </q-tooltip>
            </q-btn>
          </q-td>

          <q-td key="serviceNode" :props="props">

            <div>
              {{
                i18n.global.locale === 'zh' ? props.row.service.name : props.row.service.name_en
              }}
            </div>

            <div>
              {{
                i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.service.id]?.data_center.id]?.name :
                  store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row.service.id]?.data_center.id]?.name_en
              }}
            </div>

            <CloudPlatformLogo :platform-name="props.row.service.service_type"/>

          </q-td>

          <q-td key="image" :props="props">

            <div>
              <OsLogo :os-name="props.row.image"/>
            </div>
            <div>
              {{ props.row.image }}
            </div>

            <q-tooltip :offset="[0, -15]">
              {{ props.row.image }}
              <!--              {{ props.row.image_desc }}-->
            </q-tooltip>

          </q-td>

          <q-td key="configuration" :props="props">
            <div> {{ props.row.vcpus }} {{
                i18n.global.locale === 'zh' ? '核' : props.row.vcpus > 1 ? 'cores' : 'core'
              }}
            </div>
            <div>{{ props.row.ram / 1024 }} GB</div>
          </q-td>

          <q-td key="billing" :props="props">

            <div v-if="props.row.pay_type === 'postpaid'">
              {{ tc('components.server.ServeTable.pay_as_go') }}
            </div>

            <div v-if="props.row.pay_type === 'prepaid'">
              <div class="column items-center">
                <div class="col-auto">
                  {{ tc('components.server.ServeTable.monthly_prepaid') }}

                  <q-tooltip class="text-center">

                    {{ tc('components.server.ServeTable.expiration_time') }}
                    <!--              日期时间格式根据locale值变化-->
                    <div v-if="i18n.global.locale==='zh'">
                      <div>{{
                          new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[0]
                        }}
                      </div>
                      <div>{{
                          new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[1]
                        }}
                      </div>
                    </div>

                    <div v-else>
                      <div>{{
                          new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[0]
                        }}
                      </div>
                      <div>{{
                          new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[1]
                        }}
                      </div>
                    </div>

                  </q-tooltip>
                </div>

                <div class="col-auto" v-if="(new Date(props.row.expiration_time).getTime() - new Date().getTime()) < 0">
                  <q-icon name="help_outline" color="red" size="xs">
                    <q-tooltip>{{ tc('components.server.ServeTable.notify_renew_server') }}</q-tooltip>
                  </q-icon>
                </div>

              </div>

              <!--              <q-btn class="col-auto" color="primary" padding="none" icon="autorenew" :ripple="false" dense flat-->
              <!--                     @click="store.renewOrderDialog(props.row.id, isGroup)">-->
              <!--                <q-tooltip> {{ tc('续期') }}</q-tooltip>-->
              <!--              </q-btn>-->

            </div>

          </q-td>

          <!--          <q-td key="creator" :props="props">-->
          <!--            {{ props.row.user.username }}-->
          <!--          </q-td>-->

          <q-td key="note" :props="props">
            <div class="row">
              <div class="col q-ma-none q-pa-none">
                {{ props.row.remarks }}
                <q-tooltip>
                  {{ props.row.remarks }}
                </q-tooltip>
              </div>

              <q-btn
                v-if="hoverRow === props.row.name && (!isGroup || (isGroup && store.tables.groupTable.byId[props.row?.vo_id]?.myRole !== 'member')) "
                :disable="props.row.lock === 'lock-operation'"
                class="col-shrink q-px-none q-ma-none" flat dense icon="edit" size="xs" color="primary"
                @click="store.editServerNoteDialog({serverId:props.row.id, isGroup})">
                <q-tooltip>
                  {{ tc('components.server.ServeTable.edit_remarks') }}
                </q-tooltip>
              </q-btn>

              <q-btn v-else
                     class="col-shrink q-px-none q-ma-none invisible" flat dense icon="edit" size="xs"/>

            </div>
          </q-td>
          <q-td key="vnc" :props="props" class="non-selectable q-pa-none">
            <q-btn v-if="props.row.status === 1" unelevated flat padding="none" size="lg" color="primary"
                   icon="computer"
                   @click="store.gotoVNC(props.row.id)">
              <q-tooltip>{{ tc('components.server.ServeTable.start_remote') }}</q-tooltip>
            </q-btn>
            <q-btn v-else unelevated flat padding="none" size="lg" color="grey-5" icon="computer">
              <q-tooltip>
                {{ tc('components.server.ServeTable.notify_start_before_remote') }}
              </q-tooltip>
            </q-btn>
          </q-td>

          <q-td key="status" :props="props" class="non-selectable">
            <ServerStatus :server="props.row" :is-group="isGroup"/>
          </q-td>

          <q-td key="operation" :props="props" class="non-selectable">
            <ServerOperationBtnGroup :server="props.row" :is-group="isGroup"/>
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
.ServerTable {
}
</style>
