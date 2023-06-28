<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const fabButton = ref(false)

const activeTab = ref(store.items.currentPath[1]) // keep selection when reloading

// 此处为group相关页面的根UI，应加载group的基础table(groupTable & groupMemberTable)
store.softLoadGroupBasicTables()
</script>

<template>
  <div class="GroupIndex">
    <q-scroll-area style="height: calc(100vh - 60px);">
      <div class="column">

        <!--      <div class="col-auto">-->
        <!--        <div class="row justify-center">-->
        <!--          <global-header-content class="content-fixed-width"/>-->
        <!--        </div>-->
        <!--      </div>-->

        <!--      <q-separator/>-->

        <div class="col-auto">
          <div class="row justify-center">
            <div class="content-fixed-width">
              <div class="row">
                <div class="text-h6 q-pt-lg q-px-none">
                  {{ tc('pages.group.GroupIndex.group_resource') }}
                </div>
              </div>

              <div class="row">
                <div class="col">

                  <q-tabs
                    v-model="activeTab"
                    indicator-color="primary"
                    active-color="primary"
                    align="left"
                    inline-label
                  >
                    <q-tab
                      no-caps
                      class="q-px-none q-py-md q-mr-md"
                      name="list"
                      icon="format_list_bulleted"
                      :label="tc('pages.group.GroupIndex.group_list')"
                      :ripple="false"
                      @click="activeTab = 'list'; navigateToUrl('/my/server/group/list')"
                    />
                    <!--                  <q-tab-->
                    <!--                    no-caps-->
                    <!--                    class="q-px-none q-py-md q-mx-sm"-->
                    <!--                    name="server"-->
                    <!--                    icon="computer"-->
                    <!--                    :label="tc('pages.group.GroupIndex.server_list')"-->
                    <!--                    :ripple="false"-->
                    <!--                    @click="activeTab = 'server'; navigateToUrl('/my/server/group/server/list')"-->
                    <!--                  />-->
                    <!--                  <q-tab-->
                    <!--                    no-caps-->
                    <!--                    class="q-px-none q-py-md q-mx-sm"-->
                    <!--                    name="order"-->
                    <!--                    icon="list_alt"-->
                    <!--                    :label="tc('pages.group.GroupIndex.order_list')"-->
                    <!--                    :ripple="false"-->
                    <!--                    @click="activeTab = 'order'; navigateToUrl('/my/server/group/order')"-->
                    <!--                  />-->
                    <!--                  <q-tab-->
                    <!--                    no-caps-->
                    <!--                    class="q-px-none q-py-md q-mx-sm"-->
                    <!--                    name="coupon"-->
                    <!--                    icon="currency_yuan"-->
                    <!--                    :label="tc('pages.group.GroupIndex.coupon_list')"-->
                    <!--                    :ripple="false"-->
                    <!--                    @click="activeTab = 'coupon'; navigateToUrl('/my/server/group/coupon')"-->
                    <!--                  />-->
                  </q-tabs>
                </div>
                <div class="col-1">
                  <q-fab
                    style="float: right; transform: translate(0, 65%);"
                    v-model="fabButton"
                    vertical-actions-align="right"
                    color="primary"
                    icon="add"
                    :label="tc('components.group.ButtonAdd.create')"
                    direction="down"
                  >
                    <q-fab-action :label="tc('components.group.ButtonAdd.create_group')" unelevated color="primary"
                                  icon="group"
                                  @click="navigateToUrl('/my/server/group/create')"/>
                    <q-fab-action :label="tc('components.group.ButtonAdd.create_server')" unelevated color="primary"
                                  icon="computer"
                                  @click="navigateToUrl('/my/server/deploy?isgroup=true')"/>
                    <q-fab-action :label="tc('新建组云硬盘')" unelevated color="primary"
                                  icon="mdi-harddisk"
                                  @click="navigateToUrl('/my/server/deploy/disk?isgroup=true')"/>
                  </q-fab>
                </div>
              </div>
            </div>

          </div>
        </div>

        <q-separator/>

        <!--      <q-scroll-area style="height: calc(100vh - 300px); width: 1720px;" visible>-->

        <div class="col-auto q-pt-xl">
          <div class="row justify-center">
            <!--          <div class="col"/>-->
            <!--          <div class="col-xs-12 col-md-10">-->
            <router-view class="content-fixed-width"/>
            <!--          </div>-->
            <!--          <div class="col"/>-->
          </div>
        </div>

        <!--      </q-scroll-area>-->

      </div>
    </q-scroll-area>
  </div>
</template>

<style lang="scss" scoped>
.GroupIndex {
}
</style>
