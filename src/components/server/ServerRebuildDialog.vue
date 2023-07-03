<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { ImageInterface, useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'

import OsLogo from 'components/ui/OsLogo.vue'
import api from 'src/api'

const props = defineProps({
  serverId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: true
  }
})
/* const emits =  */
defineEmits([...useDialogPluginComponent.emits])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// trigger这个dialog的地方负责load table, 此处不load相关table

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const server = computed(() => props.isGroup ? store.tables.groupServerTable.byId[props.serverId] : store.tables.personalServerTable.byId[props.serverId])
const images = ref<ImageInterface[]>([])
// // 当前images里面可供选择的release数组， 由images数组归并而来, 由images自动筛选、归并、去重、排序、整理格式
// const imageReleases = computed(() =>
//   images.value
//     .filter(image => image.serviceId === server.value.service.id)
//     .reduce((accumulator: string[], item) => {
//       if (!accumulator.includes(item.release)) {
//         accumulator.push(item.release)
//       }
//       return accumulator
//     }, [])
//     .sort((a, b) => a.localeCompare(b, 'en-US'))
// )
//
// // selectionImageRelease 选择默认项
// const chooseImageRelease = () => {
//   selectionImageRelease.value = imageReleases.value[0]
// }

const updateImages = async (serviceId: string) => {
  // 清空当前images列表
  images.value = []

  // 从分页数据中获取全部数据
  const PAGE_SIZE = 100 // 单次获取的page size
  let count = 0 // 结果总数，多页项目的数总和
  let page = 1 // current page

  try {
    // 先执行一次，再检查循环条件
    do {
      // 用当前分页条件获取数据
      const respGetImage = await api.server.image.getImagePaginate({
        query: {
          page,
          page_size: PAGE_SIZE,
          service_id: serviceId
        }
      })

      // 保存数据
      for (const image of respGetImage.data.results as ImageInterface[]) {
        // 增加serviceId标识,在读取images过程中，用户可能改变serviceId的选择，多个结果都会存入images容器，这个字段使用的时候方便筛选区分
        Object.assign(image, { serviceId })

        // image options
        images.value.push(image)
      }

      // 更新分页数据
      page += 1
      count = respGetImage.data.count
      // 核实容器内含有当前指定serviceId的image数量够不够，不够再去拿
    } while (images.value.filter(image => image.serviceId === serviceId).length < count) // do体内执行完毕后，再检查循环条件，决定是否开始下次循环
  } catch (exception) {
    // exceptionNotifier(exception)
  }

  // chooseImageRelease()
}

updateImages(server.value.service.id)

const selectDom = ref<HTMLElement>()
const select = ref(server.value.image_id)
// image的发行版, 不是image的最终选择，只用来筛选image第二个selection的显示选项
// const selectionImageRelease = ref('')

const check = ref(false)

// 确定时
const onOKClick = () => {
  if (select.value === '') {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.server.ServeDeployCard.select_target_os')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    selectDom.value?.focus()
  } else {
    onDialogOK(select.value)
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary ">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('components.server.ServerRebuildDialog.rebuild_server') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.ip_address') }}
          </div>
          <div class="col">
            {{ server.ipv4 }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.remarks') }}
          </div>
          <div class="col" style="max-width: 400px; word-break: break-all; word-wrap: break-word; white-space: normal;">
            {{ server.remarks }}
          </div>
        </div>

        <div v-if="isGroup" class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.group') }}
          </div>
          <div class="col">
            {{ store.tables.groupTable.byId[server.vo_id].name }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.org') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service.id]?.data_center.id]?.name :
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service.id]?.data_center.id]?.name_en
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.service_node') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ? store.tables.serviceTable.byId[server.service.id]?.name : store.tables.serviceTable.byId[server.service.id]?.name_en
            }}

            <span>
              <q-icon
                v-if="store.tables.serviceTable.byId[server.service.id]?.service_type.toLowerCase().includes('ev')"
                style="width: 100px;height: 20px">
                      <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 100px;height: 20px" alt=""/>
              </q-icon>
            </span>

            <span>
              <q-icon
                v-if="store.tables.serviceTable.byId[server.service.id]?.service_type.toLowerCase().includes('open')"
                style="width: 100px;height: 20px">
                      <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 100px;height: 20px" alt=""/>
              </q-icon>
            </span>

          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.hardware_configuration') }}
          </div>
          <div class="col">
            {{ server.vcpus }} {{ tc('components.server.ServerRebuildDialog.cores') }}/ {{ server.ram }}GB
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.network_type') }}
          </div>
          <div class="col">
            {{
              server.public_ip ? tc('components.server.ServerRebuildDialog.public_network') : tc('components.server.ServerRebuildDialog.private_network')
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.available_period') }}
          </div>
          <div class="col">
            {{ new Date(server.creation_time).toLocaleString(i18n.global.locale as string) }} -
            {{
              server.expiration_time ? new Date(server.expiration_time).toLocaleString(i18n.global.locale as string) : tc('永久有效')
            }}
            <!--            <q-icon-->
            <!--              v-if="server.expiration_time !== null && (new Date(server.expiration_time).getTime() - new Date().getTime()) < 0"-->
            <!--              name="help_outline" color="red" size="xs">-->
            <!--              <q-tooltip>{{ tc('云主机已到期') }}</q-tooltip>-->
            <!--            </q-icon>-->
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.operating_system') }}
          </div>
          <div class="col">
            <OsLogo :os-name="server.image" size="md"/>
            {{ server.image }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.target_operating_system') }}
          </div>
          <div class="col-8">
<!--            <q-select-->
<!--              class="col-auto"-->
<!--              style="min-width: 220px;"-->
<!--              v-model="selectionImageRelease"-->
<!--              :options="imageReleases"-->
<!--              outlined-->
<!--              dense-->
<!--            >-->

<!--              &lt;!&ndash;当前选项的内容插槽&ndash;&gt;-->
<!--              <template v-slot:selected-item="scope">-->

<!--                <div class="row items-center"-->
<!--                     :class="selectionImageRelease===scope.opt ? 'text-primary' : 'text-black'"-->
<!--                >-->
<!--                  <OsLogo :os-name="scope.opt" size="sm"/>-->
<!--                  {{ scope.opt }}-->
<!--                </div>-->

<!--              </template>-->

<!--              &lt;!&ndash;待选项的内容插槽&ndash;&gt;-->
<!--              <template v-slot:option="scope">-->
<!--                <q-item v-bind="scope.itemProps">-->

<!--                  <div class="row items-center">-->
<!--                    <OsLogo :os-name="scope.opt" size="sm"/>-->
<!--                    <q-item-label>{{ scope.opt }}</q-item-label>-->
<!--                  </div>-->

<!--                  &lt;!&ndash;                      <q-item-section avatar>&ndash;&gt;-->
<!--                  &lt;!&ndash;                        <OsLogo :os-name="scope.opt" size="md"/>&ndash;&gt;-->
<!--                  &lt;!&ndash;                      </q-item-section>&ndash;&gt;-->

<!--                  &lt;!&ndash;                      <q-item-section>&ndash;&gt;-->
<!--                  &lt;!&ndash;                        <q-item-label>{{ scope.opt }}</q-item-label>&ndash;&gt;-->
<!--                  &lt;!&ndash;                      </q-item-section>&ndash;&gt;-->

<!--                </q-item>-->
<!--              </template>-->

<!--            </q-select>-->

            <q-select ref="selectDom" v-if="images.length !== 0" outlined v-model="select" dense
                      :options="images" map-options emit-value option-label="name" option-value="id">

              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <div class="row items-center"
                     :class="select===scope.opt.id ? 'text-primary' : 'text-black'"
                >
                  <OsLogo :os-name="scope.opt.name" size="md"/>
                  {{ scope.opt.name }}
                </div>
              </template>

              <!--待选项的内容插槽-->
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <div class="row items-center">
                    <OsLogo :os-name="scope.opt.name" size="md"/>
                    {{ scope.opt.name }}
                  </div>
                  <!--                  <q-item-section avatar>-->
                  <!--                    <OsLogo :os-name="scope.opt.name" size="md"/>-->
                  <!--                  </q-item-section>-->
                  <!--                  <q-item-section>-->
                  <!--                    <q-item-label>-->
                  <!--                      {{ scope.opt.name }}-->
                  <!--                    </q-item-label>-->
                  <!--                  </q-item-section>-->
                </q-item>
              </template>

            </q-select>
          </div>
        </div>

        <div class="row items-center">
          <div class="col text-grey-7">
            {{ tc('components.server.ServerRebuildDialog.read_carefully_check') }}
          </div>
        </div>

        <q-checkbox style="margin-left: -10px;" v-model="check" color="primary">
          <div :class="check?'text-primary':'text-black'">
            {{ tc('components.server.ServerRebuildDialog.understand_rebuild') }}
          </div>
        </q-checkbox>

      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="between">

        <q-btn class="q-ma-sm" color="primary" outline no-caps
               :label="tc('components.server.ServerRebuildDialog.cancel')" @click="onDialogCancel"/>

        <q-btn class="q-ma-sm" :color="!check ? 'grey' : 'primary'" unelevated no-caps
               :label="tc('components.server.ServerRebuildDialog.confirm')" :disable="!check"
               @click="onOKClick"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
