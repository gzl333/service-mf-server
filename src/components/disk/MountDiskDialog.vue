<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { DiskInterface, GroupInterface, ServerInterface, useStore } from 'stores/store'
import { /* useRoute, */ useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, QSelect, useDialogPluginComponent } from 'quasar'
import api from 'src/api'
import OsLogo from 'components/ui/OsLogo.vue'
// import { navigateToUrl } from 'single-spa'
import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

// dialog行为:
// 1.确定账户: groupId 有则为具体group账户,没有则为个人账户
// 2.确定资源起点: 从server或disk进入,二选一, 带着serverId或者diskId进入
// 3.产生对应资源list: 然后确定serviceId， 带diskId则产生server list, 带serverId则产生disk list

const props = defineProps({
  group: {
    type: Object as PropType<GroupInterface>,
    required: false
  },
  disk: {
    type: Object as PropType<DiskInterface>,
    required: false
  },
  server: {
    type: Object as PropType<ServerInterface>,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
const router = useRouter()

const exceptionNotifier = useExceptionNotifier()

const {
  dialogRef,
  onDialogHide,
  // onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const service = computed(() => {
  if (props.disk) {
    return store.tables.serviceTable.byId[props.disk.service.id]
  } else if (props.server) {
    return store.tables.serviceTable.byId[props.server.service.id]
  }
  return null
})

/* disk进入,准备servers数据 */
// server selection dom
const selectDomServer = ref<QSelect>()
// server selection
const selectionServer = ref<ServerInterface>()
// servers容器
const servers = ref<ServerInterface[]>([])
// 获取当前groupId和serviceId对应的所有server
const updateServers = async () => {
  // 清空当前列表
  servers.value = []

  // 从分页数据中获取全部数据
  const PAGE_SIZE = 100 // 单次获取的page size
  let count = 0 // 结果总数，多页项目的数总和
  let page = 1 // current page

  try {
    // 先执行一次，再检查循环条件
    do {
      // 用当前分页条件获取数据
      let respGetServers

      // 个人账户
      if (!props.group) {
        respGetServers = await api.server.server.getServer({
          query: {
            page,
            page_size: PAGE_SIZE,
            service_id: service.value?.id
          }
        })
      } else { // group账户
        respGetServers = await api.server.server.getServerVo({
          path: {
            vo_id: props.group.id
          },
          query: {
            page,
            page_size: PAGE_SIZE,
            service_id: service.value?.id
          }
        })
      }

      // 保存数据
      for (const server of respGetServers.data.servers as ServerInterface[]) {
        // server options
        servers.value.push(server)
      }

      // 更新分页数据
      page += 1
      count = respGetServers.data.count
      // 核实容器内含有当前指定serviceId的image数量够不够，不够再去拿
    } while (servers.value.length < count) // do体内执行完毕后，再检查循环条件，决定是否开始下次循环

    // servers排序
    servers.value.sort((a: ServerInterface, b: ServerInterface) => a.ipv4.localeCompare(b.ipv4))

    // selection server 选择默认项
    selectionServer.value = servers.value[0]
  } catch (exception) {
    // exceptionNotifier(exception)
  }
}

if (props.disk) {
  updateServers()
}
/* disk进入,准备servers数据 */

/* server进入,准备disks数据 */
// disk selection dom
const selectDomDisk = ref<QSelect>()
// disk selection
const selectionDisk = ref<DiskInterface>()
// disks容器
const disks = ref<DiskInterface[]>([])
// 获取当前groupId和serviceId对应的所有disk
const updateDisks = async () => {
  // 清空当前列表
  disks.value = []

  // 从分页数据中获取全部数据
  const PAGE_SIZE = 100 // 单次获取的page size
  let count = 0 // 结果总数，多页项目的数总和
  let page = 1 // current page

  try {
    // 先执行一次，再检查循环条件
    do {
      // 用当前分页条件获取数据
      const respGetDisks = await api.server.disk.getDisk({
        query: {
          page,
          page_size: PAGE_SIZE,
          service_id: service.value?.id,
          ...(props.group ? { vo_id: props.group.id } : {})
        }
      })

      // 保存数据
      for (const disk of respGetDisks.data.results as DiskInterface[]) {
        // disk options
        disks.value.push(disk)
      }

      // 更新分页数据
      page += 1
      count = respGetDisks.data.count
      // 核实容器内含有当前指定serviceId的image数量够不够，不够再去拿
    } while (disks.value.length < count) // do体内执行完毕后，再检查循环条件，决定是否开始下次循环

    // 筛选剩下未被挂载的disk
    disks.value = disks.value.filter(disk => disk.server === null)

    // 排序
    disks.value.sort((a: DiskInterface, b: DiskInterface) => Number(a.size) - Number(b.size))

    // selection disk 选择默认项
    selectionDisk.value = disks.value[0]
  } catch (exception) {
    // exceptionNotifier(exception)
  }
}

if (props.server) {
  updateDisks()
}
/* server进入,准备disks数据 */

// 确定时
const onOKClick = async () => {
  // condition guard

  // disk进入但是没选server
  if (props.disk && !selectionServer.value) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('请选择云主机')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    selectDomServer.value?.focus()
    return
  }

  // server进入但是没选disk
  if (props.server && !selectionDisk.value) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('请选择云硬盘')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    selectDomServer.value?.focus()
    return
  }

  // notify
  const dismiss = Notify.create({
    classes: 'notification-positive shadow-15',
    // icon: 'mdi-check-circle',
    spinner: true,
    textColor: 'positive',
    message: `${tc('正在挂载云硬盘')}`,
    position: 'bottom',
    closeBtn: true,
    timeout: 0, // infinite
    multiLine: false
  })

  try {
    /* const respMount =  */
    await api.server.disk.postDiskIdAttach({
      path: {
        id: props.disk?.id || selectionDisk.value?.id || ''
      },
      query: {
        server_id: props.server?.id || selectionServer.value?.id || ''
      }
    })

    // notify
    dismiss()
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'mdi-check-circle',
      // spinner: true,
      textColor: 'positive',
      message: `${tc('成功挂载云硬盘')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })

    // close
    onDialogHide()

    // 应当更新disk数据
    // 目前使用刷新当前页面
    router.go(0)
  } catch (exception) {
    dismiss()
    exceptionNotifier(exception, 'MountDisk')
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary ">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('挂载云硬盘') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('所属账户') }}
          </div>
          <div class="col">
            {{ group ? group.name : tc('个人账户') }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('服务单元') }}
          </div>
          <div class="col">
            {{ i18n.global.locale === 'zh' ? service?.name : service?.name_en }}
          </div>
        </div>

        <!--从serverId进入-->
        <div v-if="server">

          <div class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              {{ tc('云主机') }}
            </div>
            <div class="col q-pa-sm bg-grey-2">

              <div class="row">
                <div class="col-3 text-grey-7"> {{ tc('IP') }}</div>
                <div class="col"> {{ server.ipv4 }}</div>
              </div>

              <div class="row">
                <div class="col-3 text-grey-7"> {{ tc('备注') }}</div>
                <div class="col"
                     style="max-width: 270px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                  {{ server.remarks }}
                </div>
              </div>

              <div class="row">
                <div class="col-3 text-grey-7"> {{ tc('配置') }}</div>
                <div class="col row">
                  <div>
                    {{ server.vcpus }}
                    {{ i18n.global.locale === 'zh' ? '核' : server.vcpus > 1 ? 'cores' : 'core' }}
                  </div>
                  /
                  <div>{{ server.ram }}GB</div>
                </div>
              </div>

              <div class="row  items-center">
                <div class="col-3 text-grey-7"> {{ tc('操作系统') }}</div>
                <div class="col row items-center">
                  <OsLogo class="col-auto" :os-name="server.image" size="md"/>
                  <div class="col-auto"> {{ server.image }}</div>
                </div>
              </div>

              <div class="row">
                <div class="col-3 text-grey-7"> {{ tc('ID') }}</div>
                <div class="col"> {{ server.id }}</div>
              </div>

            </div>
          </div>

          <div class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              {{ tc('云硬盘') }}
            </div>
            <div class="col">

              <!--              {{ disks }}-->

              <q-select ref="selectDomDisk"
                        v-if="disks.length !== 0"
                        v-model="selectionDisk"
                        :options="disks"
                        outlined
                        dense
              >

                <!--当前选项的内容插槽-->
                <template v-slot:selected-item="scope">
                  <div class="row items-center text-primary">

                    <q-icon class="col-auto" name="mdi-harddisk" size="lg"/>

                    <div class="column">
                      <div class="row q-gutter-md">
                        <div class="col-auto">{{ scope.opt.size }}GB</div>
                        <div class="col-auto">ID: {{ scope.opt.id }}</div>
                      </div>

                      <div class="row">
                        <div class="col-auto"
                             style="max-width: 290px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                          {{ tc('备注') }}: {{ scope.opt.remarks }}
                        </div>
                      </div>
                    </div>

                  </div>
                </template>

                <!--待选项的内容插槽-->
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <div class="row items-center">

                      <q-icon class="col-auto" name="mdi-harddisk" size="lg"/>

                      <div class="column">
                        <div class="row q-gutter-md">
                          <div class="col-auto">{{ scope.opt.size }}GB</div>
                          <div class="col-auto">ID: {{ scope.opt.id }}</div>
                        </div>

                        <div class="row">
                          <div class="col-auto"
                               style="max-width: 290px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                            {{ tc('备注') }}: {{ scope.opt.remarks }}
                          </div>
                        </div>
                      </div>

                    </div>
                  </q-item>
                </template>

              </q-select>

              <div v-else>
                {{ tc('暂无可挂载云硬盘') }}
              </div>

            </div>
          </div>

        </div>

        <!--从diskId进入-->
        <div v-else-if="disk">

          <div class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              {{ tc('云硬盘') }}
            </div>
            <div class="col q-pa-sm bg-grey-2">

              <div class="row">
                <div class="col-3 text-grey-7"> {{ tc('容量') }}</div>
                <div class="col"> {{ disk.size }}GB</div>
              </div>

              <div class="row">
                <div class="col-3 text-grey-7"> {{ tc('备注') }}</div>
                <div class="col"> {{ disk.remarks }}</div>
              </div>

              <div class="row">
                <div class="col-3 text-grey-7"> {{ tc('创建时间') }}</div>
                <div class="col"> {{ new Date(disk.creation_time).toLocaleString(i18n.global.locale as string) }}</div>
              </div>

              <div class="row">
                <div class="col-3 text-grey-7"> ID</div>
                <div class="col"> {{ disk.id }}</div>
              </div>

            </div>
          </div>

          <div class="row q-pb-lg items-center">
            <div class="col-3 text-grey-7">
              {{ tc('云主机') }}
            </div>
            <div class="col">

              <!--              {{ servers }}-->

              <q-select ref="selectDomServer"
                        v-if="servers.length !== 0"
                        v-model="selectionServer"
                        :options="servers"
                        outlined
                        dense
              >

                <!--当前选项的内容插槽-->
                <template v-slot:selected-item="scope">
                  <div class="row items-center text-primary">
                    <OsLogo class="col-auto" :os-name="scope.opt.image" size="lg"/>

                    <div class="col-auto column">
                      <div class="col-auto">
                        {{ scope.opt.ipv4 }}
                      </div>
                      <div class="col-auto"
                           style="max-width: 290px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                        {{ tc('备注') }}: {{ scope.opt.remarks }}
                      </div>
                    </div>

                  </div>
                </template>

                <!--待选项的内容插槽-->
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <div class="row items-center">

                      <OsLogo class="col-auto" :os-name="scope.opt.image" size="lg"/>

                      <div class="col-auto column">
                        <div class="col-auto">
                          {{ scope.opt.ipv4 }}
                        </div>
                        <div class="col-auto"
                             style="max-width: 290px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                          {{ tc('备注') }}: {{ scope.opt.remarks }}
                        </div>
                      </div>

                    </div>
                  </q-item>
                </template>

              </q-select>

              <div v-else>
                {{ tc('暂无可供挂载云主机') }}
              </div>

            </div>
          </div>

        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               outline
               no-caps
               :label="tc('取消')"
               @click="onDialogCancel"/>

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('挂载')"
               @click="onOKClick"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
