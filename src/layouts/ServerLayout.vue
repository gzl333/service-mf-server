<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
import { navigateToUrl } from 'single-spa'
import useStore from 'src/store'
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
const tc = i18n.global.tc

// the root layout of @cnic/server, load @cnic/server's  store here
console.log('@cnic/server store:', store.$state)
void store.loadServerRole()

// code starts...
const releaseTime = process.env.releaseTime
const activeItem = ref('index')
</script>

<template>
  <q-layout view="hHh LpR fFf">

    <q-drawer :model-value="true" style="padding-top: 60px;" :breakpoint="0" side="left" width="120" elevated>

      <div class="column full-height bg-grey-3">
        <q-scroll-area class="col non-selectable" visible>

          <q-list>

            <q-item>
              <q-item-section class="column items-center q-py-sm text-weight-bold text-grey-8">
                {{ tc('云主机') }}
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'index'"
              @click="activeItem = 'index'; navigateToUrl('/my/server')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="person" size="lg"/>
                <div class="text-center active-text">{{ tc('index') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'personal'"
              @click="activeItem = 'personal'; navigateToUrl('/my/server/create')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="person" size="lg"/>
                <div class="ttext-center active-text">{{ tc('个人资源') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'group'"
              @click="activeItem = 'group'"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="group" size="lg"/>
                <div class="text-center active-text">{{ tc('项目组资源') }}</div>
              </q-item-section>
            </q-item>

            <!--          <q-item-->
            <!--            clickable-->
            <!--            :active="activeItem === 'vpn'"-->
            <!--            @click="activeItem = 'vpn'"-->
            <!--            active-class="active-item"-->
            <!--            to='/my/vpn'-->
            <!--          >-->
            <!--            <q-item-section class="column items-center">-->
            <!--              <q-icon name="vpn_lock" size="lg"/>-->
            <!--              <div class="text-c-blue5 text-bold text-center line-height-1em">VPN</div>-->
            <!--            </q-item-section>-->
            <!--          </q-item>-->

            <!--有服务管理权限的用户才能看到，同时在路由里进行权限限制-->
            <q-item v-if="store.items.adminServiceIds.length > 0"
                    clickable
                    :active="activeItem === 'provider'"
                    @click="activeItem = 'provider'"
                    active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="cloud_upload" size="lg"/>
                <div class="text-center active-text">{{ tc('资源提供') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'federation'"
              @click="activeItem = 'federation'"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="construction" size="lg"/>
                <div class="text-center active-text">{{ tc('资源统计') }}</div>
              </q-item-section>
            </q-item>

          </q-list>

          <div class="text-grey text-body2 text-center q-pt-xl">v0.2.11 beta</div>
          <div class="text-grey text-body2 text-center">release time: {{ new Date(releaseTime).toLocaleString()}}</div>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <q-scroll-area style="height: 100vh;">
        <router-view/>
      </q-scroll-area>
    </q-page-container>

  </q-layout>
</template>

<style lang="scss" scoped>
.ServerLayout {
}

.active-item {
  background-color: $grey-4;

  .active-text {
    color: $primary;
  }
}
</style>
