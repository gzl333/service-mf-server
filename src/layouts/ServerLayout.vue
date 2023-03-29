<script setup lang="ts">
import { computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = useRoute()
const tc = i18n.global.tc

// the root layout of @cnic/server, load @cnic/server's  store here
console.log('@cnic/server store:', store.$state)
void store.loadAllItems()
void store.loadAllTables()
// void store.forceLoadAccountTable()

const activeItem = computed(() => store.items.currentPath[0])

const appVersion = process.env.appVersion
const releaseTime = process.env.releaseTime

</script>

<template>
  <q-layout view="hHh LpR fFf">

    <q-drawer :model-value="true" style="padding-top: 60px;" :breakpoint="0" side="left" width="120" bordered>

      <div class="column full-height bg-grey-2">
        <q-scroll-area class="col non-selectable" visible>

          <q-list>

            <q-item>
              <q-item-section class="column items-center q-py-sm text-center text-weight-bold text-grey-8">
                {{ tc('layouts.server') }}
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'personal'"
              @click="activeItem = 'personal'; navigateToUrl('/my/server/personal')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="person" size="lg"/>
                <div class="active-text text-center">{{ tc('layouts.personal') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'group'"
              @click="activeItem = 'group'; navigateToUrl('/my/server/group')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="group" size="lg"/>
                <div class="active-text text-center">{{ tc('layouts.group') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'vpn'"
              @click="activeItem = 'vpn'; navigateToUrl('/my/server/vpn')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="vpn_lock" size="lg"/>
                <div class="active-text text-center">VPN</div>
              </q-item-section>
            </q-item>

            <!--            <q-item-->
            <!--              clickable-->
            <!--              :active="activeItem === 'order'"-->
            <!--              @click="activeItem = 'order'; navigateToUrl('/my/server/order')"-->
            <!--              active-class="active-item"-->
            <!--            >-->
            <!--              <q-item-section class="column items-center">-->
            <!--                <q-icon name="list_alt" size="lg"/>-->
            <!--                <div class="active-text text-center">{{ tc('订单') }}</div>-->
            <!--              </q-item-section>-->
            <!--            </q-item>-->

            <q-item
              clickable
              :active="activeItem === 'management'"
              @click="activeItem = 'management'; navigateToUrl('/my/server/management')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="cloud_upload" size="lg"/>
                <div class="active-text text-center">{{ tc('layouts.management') }}</div>
              </q-item-section>
            </q-item>

            <!--联邦管理员、服务管理员可以看到此按钮，路由里暂未限制权限-->
            <q-item v-if="store.items.fedRole === 'federal-admin' || store.items.adminServiceIds.length > 0"
                    clickable
                    :active="activeItem === 'provider'"
                    @click="activeItem = 'provider'; navigateToUrl('/my/server/provider')"
                    active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="manage_accounts" size="lg"/>
                <div class="active-text text-center">{{ tc('layouts.provider') }}</div>
              </q-item-section>
            </q-item>

          </q-list>

          <div class="row justify-center q-pt-lg">
            <q-btn flat no-caps no-wrap color="primary" :ripple="false" dense
                   @click="navigateToUrl('/my/wallet/account?trigger=redeem')">
              {{ tc('layouts.redeem') }}
            </q-btn>
          </div>

          <div class="row justify-center q-pt-lg">
            <q-icon class="text-center" name="info" color="grey-5" size="xs">
              <q-tooltip class="bg-grey-3">

                <div class="text-grey text-caption text-center">{{ tc('appVersion') }}</div>
                <div class="text-grey text-caption text-center">
                  {{ appVersion }}
                </div>

                <div class="text-grey text-caption text-center">{{ tc('releaseTime') }}</div>
                <div class="text-grey text-caption text-center">
                  {{ new Date(releaseTime).toLocaleString(i18n.global.locale) }}
                </div>

              </q-tooltip>
            </q-icon>
          </div>

        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page>
        <!--      <q-scroll-area style="height: calc(100vh - 60px);">-->
        <router-view :key="$route.fullPath"/>
        <!--      </q-scroll-area>-->
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<style lang="scss" scoped>
.active-item {
  background-color: #DBF0FC; // $grey-4;

  .active-text {
    color: $primary;
  }
}
</style>
