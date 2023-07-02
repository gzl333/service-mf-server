<script setup lang="ts">
import { PropType /* ref, */ /* computed */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore, DiskInterface, GroupInterface } from 'stores/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

/* const props =  */defineProps({
  disk: {
    type: Object as PropType<DiskInterface>,
    required: true
  },
  group: {
    type: Object as PropType<GroupInterface>,
    require: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = userRoute()
const tc = i18n.global.tc

// const toggleValue = computed(() => props.disk.lock === 'lock-operation')

// // 当前用户在group内的角色
// const myRole = computed(() => store.tables.groupTable.byId[props.disk?.vo_id || '']?.myRole)
</script>

<template>
  <div class="ServerOperationBtnGroup">
    <q-btn-group unelevated>

      <!--      <q-btn color="grey-3" padding="none">-->
      <!--        <q-toggle-->
      <!--          :model-value="toggleValue"-->
      <!--          checked-icon="lock"-->
      <!--          unchecked-icon="lock_open"-->
      <!--          color="light-green"-->
      <!--          size="md"-->
      <!--        >-->
      <!--          <q-tooltip v-if="disk.lock === 'lock-operation'">-->
      <!--            {{ tc('components.server.ServerOperationBtnGroup.server_operation_locked') }}-->
      <!--          </q-tooltip>-->
      <!--          <q-tooltip v-else>-->
      <!--            {{ tc('components.server.ServerOperationBtnGroup.server_operation_unlocked') }}-->
      <!--          </q-tooltip>-->
      <!--        </q-toggle>-->
      <!--      </q-btn>-->

      <q-btn-dropdown color="primary" dropdown-icon="expand_more" :ripple="false" split no-caps
                      :disable-main-btn="disk.lock === 'lock-operation'"
                      :icon="disk.server === null ? 'mdi-arrow-collapse' : 'mdi-arrow-expand'"
                      @click="disk.server === null ? store.mountDiskDialog(group, disk) : store.unmountDiskDialog(group, disk)">

        <q-list style="text-align:center">

          <!--          <q-item clickable v-close-popup class="bg-white text-primary"-->
          <!--                  @click="navigateToUrl(isGroup ? `/my/server/group/disk/detail/${disk.id}` : `/my/server/personal/disk/detail/${disk.id}`)">-->
          <!--            <div class="row">-->
          <!--              <q-item-section class="col-auto">-->
          <!--                <q-icon name="info" size="sm"/>-->
          <!--              </q-item-section>-->
          <!--              <q-item-section class="col-auto">-->
          <!--                <q-item-label>-->
          <!--                  {{ tc('云硬盘详情') }}-->
          <!--                </q-item-label>-->
          <!--              </q-item-section>-->
          <!--            </div>-->
          <!--          </q-item>-->

          <div v-if="disk.pay_type === 'prepaid'">
            <q-item v-if="!group || store.tables.groupTable.byId[disk.vo.id].myRole !== 'member'"
                    clickable v-close-popup class="bg-white text-primary"
            >
              <div class="row">
                <q-item-section class="col-auto">
                  <q-icon name="autorenew" size="sm"/>
                </q-item-section>
                <q-item-section class="col-auto">
                  <q-item-label>
                    {{ tc('云硬盘续期') }}
                  </q-item-label>
                </q-item-section>
              </div>
            </q-item>
          </div>

          <q-separator/>

          <q-item v-if="disk.server === null" clickable v-close-popup class="bg-white text-primary"
                  :disable="disk.lock === 'lock-operation'" @click="store.mountDiskDialog(group, disk)"
          >
            <div class="row">
              <q-item-section class="col-auto">
                <q-icon name="mdi-arrow-collapse" size="sm"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-item-section>
                  <q-item-label>{{ tc('挂载') }}</q-item-label>
                </q-item-section>
              </q-item-section>
            </div>
          </q-item>

          <q-item v-if="disk.server !== null" clickable v-close-popup class="bg-white text-primary"
                  :disable="disk.lock === 'lock-operation'" @click="store.unmountDiskDialog(group, disk)"
          >
            <div class="row">
              <q-item-section class="col-auto">
                <q-icon name="mdi-arrow-expand" size="sm"/>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-item-section>
                  <q-item-label>{{ tc('卸载') }}</q-item-label>
                </q-item-section>
              </q-item-section>
            </div>
          </q-item>

          <q-separator/>

          <q-item v-if="disk.server === null" clickable v-close-popup class="bg-white text-primary"
                  :disable="disk.lock === 'lock-operation'"
          >
            <div class="row">
              <q-item-section class="col-auto text-red">
                <q-icon name="power_settings_new" size="sm"/>
              </q-item-section>
              <q-item-section class="col-auto text-red">
                <q-item-section>
                  <q-item-label>{{ tc('删除云硬盘') }}</q-item-label>
                </q-item-section>
              </q-item-section>
            </div>
          </q-item>

        </q-list>
      </q-btn-dropdown>

    </q-btn-group>
  </div>
</template>

<style lang="scss" scoped>
</style>
