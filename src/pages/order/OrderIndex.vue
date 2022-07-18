<script setup lang="ts">
import { ref/* , computed  */ } from 'vue'
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
  <div class="OrderIndex">
    <div class="PersonalIndex">
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
                  {{ tc('pages.OrderIndex.order') }}
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
                      class="q-px-none q-py-md q-mr-md text-bold"
                      name="personal"
                      icon="person"
                      :label="tc('pages.OrderIndex.personal_order')"
                      :ripple="false"
                      @click="activeTab = 'personal'; navigateToUrl('/my/server/personal/order')"
                    />
                    <q-tab
                      no-caps
                      class="q-px-none q-py-md q-mr-md text-bold"
                      name="group"
                      icon="group"
                      :label="tc('pages.OrderIndex.group_order')"
                      :ripple="false"
                      @click="activeTab = 'group'; navigateToUrl('/my/server/group/order')"
                    />
                  </q-tabs>
                </div>
                <div class="col-1">
                  <!--                  <ButtonAdd/>-->
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-separator/>

        <div class="col-auto q-pt-xl">
          <div class="row justify-center">
            <router-view class="content-fixed-width"/>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.OrderIndex {
}
</style>
