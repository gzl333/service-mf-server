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

const activeTab = ref(store.items.currentPath[1]) // keep selection when reloading

</script>

<template>
  <div class="ManagementIndex">
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
                  {{ tc('pages.management.ManagementIndex.resource_management') }}
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
                      name="resource"
                      icon="format_list_bulleted"
                      :label="tc('pages.management.ManagementIndex.resource_stat')"
                      :ripple="false"
                      @click="activeTab = 'resource'; navigateToUrl('/my/server/management/resource')"
                    />
                    <!--                  <q-tab-->
                    <!--                    no-caps-->
                    <!--                    class="q-px-none q-py-md q-mx-sm"-->
                    <!--                    name="server"-->
                    <!--                    icon="computer"-->
                    <!--                    :label="tc('云主机')"-->
                    <!--                    :ripple="false"-->
                    <!--                    @click="activeTab = 'server'; navigateToUrl('/my/server/group/server/list')"-->
                    <!--                  />-->
                  </q-tabs>
                </div>
                <div class="col-1">
                  <!--                <ButtonAdd/>-->
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
.ManagementIndex {
}
</style>
