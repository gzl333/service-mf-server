<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
import { navigateToUrl } from 'single-spa'
import useStore from 'src/store'
import { useRoute } from 'vue-router'
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

const route = useRoute()
const paths = route.path.split('/')
const activeItem = ref(paths[3] || 'personal') // keep selection when reloading

const releaseTime = process.env.releaseTime

</script>

<template>
  <q-layout view="hHh LpR fFf">

    <q-drawer :model-value="true" style="padding-top: 60px;" :breakpoint="0" side="left" width="120" bordered>

      <div class="column full-height">
        <q-scroll-area class="col non-selectable" visible>

          <q-list>

            <q-item>
              <q-item-section class="column items-center q-py-sm text-weight-bold text-grey-8">
                {{ tc('云主机') }}
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
                <div class="active-text">{{ tc('个人') }}</div>
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
                <div class="active-text">{{ tc('项目组') }}</div>
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
                <div class="active-text">VPN</div>
              </q-item-section>
            </q-item>

            <!--有服务管理权限的用户才能看到，同时在路由里进行权限限制-->
            <q-item v-if="store.items.adminServiceIds.length > 0"
                    clickable
                    :active="activeItem === 'provider'"
                    @click="activeItem = 'provider'; navigateToUrl('/my/server/provider')"
                    active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="cloud_upload" size="lg"/>
                <div class="active-text">{{ tc('提供者') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'management'"
              @click="activeItem = 'management'; navigateToUrl('/my/server/management')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="construction" size="lg"/>
                <div class="active-text">{{ tc('资源管理') }}</div>
              </q-item-section>
            </q-item>

          </q-list>

          <div class="text-grey text-body2 text-center q-pt-xl">v0.3.1</div>
          <div class="text-grey text-body2 text-center">{{ new Date(releaseTime).toLocaleString() }}</div>
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
  background-color: #DBF0FC; // $grey-4;

  .active-text {
    color: $primary;
  }
}
</style>
