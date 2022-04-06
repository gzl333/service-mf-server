<script setup lang="ts">
import { PropType /* , ref, computed */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import useStore, { ServerInterface } from 'src/store'
// import { useRoute } from 'vue-router'
import { i18n } from 'boot/i18n'

defineProps({
  server: {
    type: Object as PropType<ServerInterface>,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const route = userRoute()
const tc = i18n.global.tc

</script>

<template>
  <span class="ServerStatus">
     <q-chip v-if="!server.status"
             class="text-bold" outline ripple="false" color="grey-5" :label="tc('获取中')"
             clickable
             @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 0"
            class="text-bold" outline ripple="false" color="red" :label="tc('未获取')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 1"
            class="text-bold" outline ripple="false" color="light-green" :label="tc('运行中')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 2"
            class="text-bold" outline :ripple="false" color="grey-9" :label="tc('已屏蔽')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 3"
            class="text-bold" outline :ripple="false" color="grey-9" :label="tc('已暂停')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 4"
            class="text-bold" outline :ripple="false" color="blue-5" :label="tc('关机中')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 5"
            class="text-bold" outline :ripple="false" color="grey-9" :label="tc('已关机')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 6"
            class="text-bold" outline :ripple="false" color="red" :label="tc('已崩溃')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 7"
            class="text-bold" outline :ripple="false" color="grey-9" :label="tc('被挂起')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 9"
            class="text-bold" outline :ripple="false" color="red" :label="tc('通讯失败')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 10"
            class="text-bold" outline :ripple="false" color="red" :label="tc('已丢失')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 11"
            class="text-bold" outline :ripple="false" color="blue-5" :label="tc('创建中')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 12"
            class="text-bold" outline :ripple="false" color="red" :label="tc('创建失败')"
            clickable
            @click="store.dispatch('server/loadSingleServerStatus', {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('刷新云主机状态') }}</q-tooltip>
    </q-chip>
  </span>
</template>

<style lang="scss" scoped>
.ServerStatus {
}
</style>
