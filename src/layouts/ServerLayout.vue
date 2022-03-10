<script setup lang="ts">
// import { ref, computed } from "vue"
import useStore from 'src/store'
// import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
console.log('@cnic/server store:', store.$state)

// the root layout of @cnic/server, load @cnic/server's  store here
void store.loadServerRole()

// code starts...
</script>

<template>
  <q-layout view="hHh LpR fFf">

    <q-drawer class="column" show-if-above side="left" bordered style="padding-top: 50px;">
      云主机服务列表
      <q-btn to="/my/server/create">TAB1</q-btn>
      <q-btn to="/my/server/2">TAB2</q-btn>
      <q-btn to="/my/server/3">TAB3</q-btn>
      <q-btn to="/my/server/4">TAB4</q-btn>
      <q-btn to="/my/server/5">TAB5</q-btn>
      <q-btn to="/my/server/6">TAB6</q-btn>
      <q-btn to="/my/server/7">TAB7</q-btn>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<style lang="scss" scoped>
.ServerLayout {
}
</style>
