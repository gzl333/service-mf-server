<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { GroupInterface, useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
// import api from 'src/api'
// import { exportFile, Notify } from 'quasar'
import type { DiskInterface } from 'stores/store'

// import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'
import DiskOperationBtnGroup from 'components/disk/DiskOperationBtnGroup.vue'
import { navigateToUrl } from 'single-spa'

/* const props = */
defineProps({
  isLoading: {
    type: Boolean,
    required: true,
    default: false
  },
  rows: {
    type: Array as PropType<DiskInterface[]>,
    required: true
  },
  group: {
    type: Object as PropType<GroupInterface>,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
// const exceptionNotifier = useExceptionNotifier()
const clickToCopy = useCopyToClipboard()

// table row hover
const hoverRow = ref('')
const onMouseEnterRow = (rowName: string) => {
  hoverRow.value = rowName
}
const onMouseLeaveRow = () => {
  hoverRow.value = ''
}

// 分栏定义
const columns = computed(() => [
  {
    name: 'id',
    label: (() => tc('ID'))(),
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 240px;padding: 15px 0px'
  },
  {
    name: 'serviceNode',
    label: (() => tc('服务单元'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px; word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'size',
    label: (() => tc('容量'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'validTime',
    label: (() => tc('有效期'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'remarks',
    label: (() => tc('备注'))(),
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 2px',
    style: 'max-width: 100px;padding: 15px 0px;word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'server',
    label: (() => tc('所在主机'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'status',
    label: (() => tc('挂载状态'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px;width: 100px;',
    headerStyle: 'padding: 0 2px'
  }])

// // row selection
// const rowSelection = ref<DiskInterface[]>([])
// const clearRowSelection = () => {
//   rowSelection.value = []
// }

</script>

<template>
  <q-table
    flat
    card-class=""
    table-class=""
    table-header-class="bg-grey-1 text-grey"
    :rows="rows"
    :columns="columns"
    :loading="isLoading"
    color="primary"
    :loading-label="tc('网络请求中，请稍候...')"
    :no-data-label="tc('无搜索结果')"
    hide-pagination
    :pagination="{rowsPerPage: 0}"
    row-key="id"
  >

    <!--    <template v-slot:header-selection="scope">-->
    <!--      <q-checkbox v-model="scope.selected" dense size="xs">-->
    <!--        <q-tooltip> {{ tc('选择本页全部') }}</q-tooltip>-->
    <!--      </q-checkbox>-->
    <!--    </template>-->

    <!--      <template v-slot:top>-->

    <!--        <div class="row full-width items-center justify-between">-->

    <!--          <div class="col-auto row items-center">-->
    <!--            <div v-if="pagination.count" class="col-auto row items-center">-->
    <!--              <div class="text-grey">{{ tc('选中') }}</div>-->
    <!--              <div class="">{{ rowSelection.length }}</div>-->
    <!--              <div class="q-px-xs">/</div>-->
    <!--            </div>-->

    <!--            <div class="col-auto text-grey">{{ tc('搜索总计') }}</div>-->
    <!--            <div class="col-auto ">{{ pagination.count }}</div>-->
    <!--          </div>-->

    <!--          <div class="col-auto row items-center q-gutter-x-xs">-->
    <!--            <div class="col-auto text-grey">{{tc('批量操作')}}</div>-->
    <!--            <q-btn-->
    <!--              :disable="rowSelection.length === 0"-->
    <!--              class="col-auto"-->
    <!--              color="primary"-->
    <!--              :label="tc('导出')"-->
    <!--              flat-->
    <!--              no-caps-->
    <!--              dense-->
    <!--            />-->
    <!--          </div>-->
    <!--        </div>-->

    <!--      </template>-->

    <template v-slot:body="props">
      <q-tr :props="props"
            @mouseenter="onMouseEnterRow(props.row?.id)"
            @mouseleave="onMouseLeaveRow"
      >

        <!--        <q-td auto-width>-->
        <!--          <q-checkbox v-model="props.selected" dense size="xs"/>-->
        <!--        </q-td>-->

        <q-td key="id" :props="props">
          <div class="row items-center justify-center">
            <div class="col-shrink">
              {{ props.row?.id }}

              <!--创建时间距离当下小于1小时则打上new标记-->
              <q-badge
                v-if="(new Date() - new Date(props.row?.creation_time)) < 1000 * 60 * 60 * 1 "
                color="light-green" floating transparent rounded align="middle">
                new
              </q-badge>

            </div>

            <q-btn v-if="hoverRow === props.row?.id"
                   class="col-shrink q-px-xs q-ma-none" flat no-caps dense icon="content_copy" size="xs" color="primary"
                   @click="clickToCopy(props.row?.id)">
              <q-tooltip>
                {{ tc('components.server.ServeTable.copy_to_clipboard') }}
              </q-tooltip>
            </q-btn>
            <q-btn v-else
                   class="col-shrink q-px-xs q-ma-none invisible" flat dense icon="content_copy" size="xs">
            </q-btn>

          </div>

        </q-td>

        <q-td key="serviceNode" :props="props">
          <div>
            {{
              i18n.global.locale === 'zh' ? props.row?.service.name : props.row?.service.name_en
            }}
          </div>

          <div>
            {{
              i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row?.service.id]?.data_center.id]?.name :
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[props.row?.service.id]?.data_center.id]?.name_en
            }}
          </div>

          <CloudPlatformLogo :platform-name="store.tables.serviceTable.byId[props.row?.service.id]?.service_type"/>

        </q-td>

        <q-td key="size" :props="props">
          <div>
            <q-icon name="mdi-harddisk" color="primary" size="md"></q-icon>
          </div>
          <div>{{ props.row?.size }}GB</div>
        </q-td>

        <q-td key="validTime" :props="props">
          <div class="row items-center justify-center">

            <div class="col-auto">
              <div v-if="i18n.global.locale==='zh'">
                <div>{{
                    new Date(props.row?.creation_time).toLocaleString(i18n.global.locale as string).split(' ')[0]
                  }}
                </div>
                <div>{{
                    new Date(props.row?.creation_time).toLocaleString(i18n.global.locale as string).split(' ')[1]
                  }}
                </div>
              </div>

              <div v-else>
                <div>{{
                    new Date(props.row?.creation_time).toLocaleString(i18n.global.locale as string).split(',')[0]
                  }}
                </div>
                <div>{{
                    new Date(props.row?.creation_time).toLocaleString(i18n.global.locale as string).split(',')[1]
                  }}
                </div>
              </div>
            </div>

            <div class="col-auto q-px-sm">
              -
            </div>

            <div class="col-auto">
              <div v-if="i18n.global.locale==='zh'">
                <div>{{
                    new Date(props.row?.expiration_time).toLocaleString(i18n.global.locale as string).split(' ')[0]
                  }}
                </div>
                <div>{{
                    new Date(props.row?.expiration_time).toLocaleString(i18n.global.locale as string).split(' ')[1]
                  }}
                </div>
              </div>

              <div v-else>
                <div>{{
                    new Date(props.row?.expiration_time).toLocaleString(i18n.global.locale as string).split(',')[0]
                  }}
                </div>
                <div>{{
                    new Date(props.row?.expiration_time).toLocaleString(i18n.global.locale as string).split(',')[1]
                  }}
                </div>
              </div>
            </div>

          </div>

          <div class="row items-center justify-center">

            <q-badge
              v-if="((new Date() - new Date(props.row?.expiration_time)) < 0 ) && ((new Date() - new Date(props.row?.creation_time)) > 0)"
              color="green">
              {{ tc('有效期内') }}
            </q-badge>

            <q-badge
              v-if="(new Date() - new Date(props.row?.expiration_time)) > 0"
              color="negative">
              {{ tc('已过期') }}
            </q-badge>

            <q-badge
              v-if="(new Date(props.row?.creation_time) - new Date()) > 0"
              color="primary">
              {{ tc('待生效') }}
            </q-badge>

          </div>

        </q-td>

        <q-td key="remarks" :props="props">

          <div class="row">
            <div class="col q-ma-none q-pa-none">
              {{ props.row?.remarks }}
              <q-tooltip>
                {{ props.row?.remarks }}
              </q-tooltip>
            </div>

            <q-btn
              v-if="hoverRow === props.row?.id && (!group || (group && store.tables.groupTable.byId[props.row?.vo_id]?.myRole !== 'member')) "
              :disable="props.row?.lock === 'lock-operation'"
              class="col-shrink q-px-none q-ma-none" flat dense icon="edit" size="xs" color="primary"
            >
            </q-btn>

            <q-btn v-else
                   class="col-shrink q-px-none q-ma-none invisible" flat dense icon="edit" size="xs"/>
          </div>
        </q-td>

        <q-td key="server" :props="props">
          <div v-if="props.row?.server === null">
            {{ tc('无') }}
          </div>

          <div v-else>
            <q-btn color="primary"
                   padding="none"
                   dense
                   flat
                   @click="navigateToUrl(`/my/server/${group ? 'group/server' : 'personal'}/detail/${props.row?.server?.id}`)">
              {{ props.row?.server?.ipv4 }}
            </q-btn>
          </div>
        </q-td>

        <q-td key="status" :props="props">

          <q-chip v-if="props.row?.server === null" class="text-weight-bold non-selectable" outline color="primary"
                  :ripple="false">
            {{ tc('未挂载') }}
          </q-chip>

          <q-chip v-else outline color="green" class="text-weight-bold non-selectable" :ripple="false">
            {{ tc('已挂载') }}
          </q-chip>

        </q-td>

        <q-td key="operation" :props="props">
          <DiskOperationBtnGroup :disk="props.row" :group="group"/>
        </q-td>

      </q-tr>
    </template>

    <!--    <template v-slot:bottom>-->

    <!--      <div class="row full-width items-center justify-end">-->
    <!--        <div class="col row items-center justify-end text-grey">-->
    <!--          <q-select color="grey"-->
    <!--                    v-model="pagination.rowsPerPage"-->
    <!--                    :options="[10,20,30,50,100]"-->
    <!--                    dense-->
    <!--                    options-dense-->
    <!--                    borderless-->
    <!--                    @update:model-value="resetPageSelection();loadRows();clearRowSelection()">-->
    <!--            &lt;!&ndash;当前选项的内容插槽&ndash;&gt;-->
    <!--            &lt;!&ndash;                      <template v-slot:selected-item>&ndash;&gt;-->
    <!--            &lt;!&ndash;                            <span class="text-grey">&ndash;&gt;-->
    <!--            &lt;!&ndash;                            {{ pagination.rowsPerPage }}&ndash;&gt;-->
    <!--            &lt;!&ndash;                            </span>&ndash;&gt;-->
    <!--            &lt;!&ndash;                      </template>&ndash;&gt;-->
    <!--          </q-select>-->
    <!--          项/页-->
    <!--        </div>-->

    <!--        <q-pagination v-model="pagination.page"-->
    <!--                      :max="Math.ceil(pagination.count / pagination.rowsPerPage )"-->
    <!--                      :max-pages="9"-->
    <!--                      direction-links-->
    <!--                      flat-->
    <!--                      :ripple="false"-->
    <!--                      @update:model-value="loadRows();clearRowSelection()"-->
    <!--        />-->
    <!--      </div>-->

    <!--    </template>-->
  </q-table>

  <q-separator/>

</template>

<style lang="scss" scoped>
</style>
