<script setup lang="ts">
import { ref } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

// import ButtonAdd from 'components/personal/ButtonAdd.vue'
// import CouponRedeemInput from 'components/coupon/CouponRedeemInput.vue'

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

const fabButton = ref(false)

const activeTab = ref(store.items.currentPath[1]) // keep selection when reloading

</script>

<template>
  <div class="PersonalIndex">
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

              <div class="row justify-between q-pt-lg q-pb-sm">

                <div class="col-auto row items-end text-h6 q-px-none">
                  {{ tc('pages.personal.PersonalIndex.personal_resource') }}
                </div>

                <div class="col-auto row justify-end items-center q-gutter-x-lg">

                  <div class="col-auto column items-end">
                    <div class="text-grey q-pa-none">
                      {{ tc('pages.personal.PersonalIndex.personal_account_balance') }}
                    </div>
                    <div class="row items-end">
                      <div class="text-h4">{{ store.items.personalBalance.balance }}</div>
                      <div class="text-h6">{{ tc('pages.personal.PersonalIndex.points') }}</div>
                    </div>
                  </div>

<!--                  <div class="col-auto column items-end">-->
<!--                    <div class="text-grey q-pa-none">-->
<!--                      {{ tc('personalCouponCount') }}-->
<!--                    </div>-->
<!--                    <div class="row items-end text-primary cursor-pointer"-->
<!--                         @click="navigateToUrl('/my/server/personal/coupon')">-->
<!--                      <div class="text-h4">-->
<!--                        {{ store.tables.personalCouponTable.allIds.length }}-->
<!--                      </div>-->
<!--                      <div class="text-h6">{{ tc('couponUnit', store.tables.personalCouponTable.allIds.length) }}</div>-->
<!--                    </div>-->
<!--                  </div>-->

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
                      :label="tc('pages.personal.PersonalIndex.server_list')"
                      :ripple="false"
                      @click="activeTab = 'list'; navigateToUrl('/my/server/personal/list')"
                    />
                    <q-tab
                      no-caps
                      class="q-px-none q-py-md q-mr-md text-bold"
                      name="disk"
                      icon="mdi-harddisk"
                      :label="tc('云硬盘列表')"
                      :ripple="false"
                      @click="activeTab = 'disk'; navigateToUrl('/my/server/personal/disk')"
                    />
                    <q-tab
                      no-caps
                      class="q-px-none q-py-md q-mr-md text-bold"
                      name="order"
                      icon="list_alt"
                      :label="tc('pages.personal.PersonalIndex.order_list')"
                      :ripple="false"
                      @click="activeTab = 'order'; navigateToUrl('/my/server/personal/order')"
                    />
                    <q-tab
                      no-caps
                      class="q-px-none q-py-md q-mr-md text-bold"
                      name="coupon"
                      icon="currency_yuan"
                      :label="tc('pages.personal.PersonalIndex.coupon_list')"
                      :ripple="false"
                      @click="activeTab = 'coupon'; navigateToUrl('/my/server/personal/coupon')"
                    />
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
                    <q-fab-action :label="tc('新建个人云主机')" unelevated color="primary" icon="computer"
                                  @click="navigateToUrl('/my/server/deploy')"/>
                    <q-fab-action :label="tc('新建个人云硬盘')" unelevated color="primary" icon="mdi-harddisk"
                                  @click="navigateToUrl('/my/server/deploy/disk')"/>
                  </q-fab>

                  <!--                  <q-btn style="float: right;-->
                  <!--                              transform: translate(0, 65%);-->
                  <!--                              padding: 16px;-->
                  <!--                              border-radius: 28px;-->
                  <!--                              min-height: 56px;-->
                  <!--                              min-width: 56px;"-->
                  <!--                         no-caps-->
                  <!--                         no-wrap-->
                  <!--                         rounded-->
                  <!--                         color="primary"-->
                  <!--                         icon="add"-->
                  <!--                         @click="navigateToUrl('/my/server/deploy')"-->
                  <!--                  >-->
                  <!--                    {{ tc('pages.personal.PersonalIndex.create') }}-->
                  <!--                  </q-btn>-->

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
    </q-scroll-area>
  </div>
</template>

<style lang="scss" scoped>
.PersonalIndex {
}
</style>
