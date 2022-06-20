<script setup lang="ts">
import { ref } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

// import ButtonAdd from 'components/personal/ButtonAdd.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
const tc = i18n.global.tc
// const route = useRoute()

const activeTab = ref(store.items.currentPath[1]) // keep selection when reloading

</script>

<template>
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
                {{ tc('个人资源') }}
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
                    name="list"
                    icon="computer"
                    :label="tc('云主机')"
                    :ripple="false"
                    @click="activeTab = 'list'; navigateToUrl('/my/server/personal/list')"
                  />
                </q-tabs>
              </div>
              <div class="col-1">
                <q-btn style="float: right;
                              transform: translate(0, 65%);
                              padding: 16px;
                              border-radius: 28px;
                              min-height: 56px;
                              min-width: 56px;"
                       rounded
                       color="primary"
                       icon="add"
                       @click="navigateToUrl('/my/server/personal/deploy')"
                >
                  {{ tc('新建') }}
                </q-btn>
                <!--                <ButtonAdd/>-->
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
</template>

<style lang="scss" scoped>
.PersonalIndex {
}
</style>
