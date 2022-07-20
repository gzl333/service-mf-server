<script setup lang="ts">
import { PropType /* , ref, computed */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore, ServerInterface } from 'stores/store'
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
     <q-chip v-if="server.status === -1"
             class="text-bold" outline ripple="false" color="grey-5" :label="tc('components.server.ServerStatus.acquiring')"
             clickable
             @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 0"
            class="text-bold" outline ripple="false" color="red" :label="tc('components.server.ServerStatus.no_acquire')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 1"
            class="text-bold" outline ripple="false" color="light-green" :label="tc('components.server.ServerStatus.running')"
            clickable
            @click="store.loadSingleServerStatus( {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 2"
            class="text-bold" outline :ripple="false" color="grey-9" :label="tc('components.server.ServerStatus.blocked')"
            clickable
            @click="store.loadSingleServerStatus( {isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 3"
            class="text-bold" outline :ripple="false" color="grey-9" :label="tc('components.server.ServerStatus.paused')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 4"
            class="text-bold" outline :ripple="false" color="blue-5" :label="tc('components.server.ServerStatus.shutting_down')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 5"
            class="text-bold" outline :ripple="false" color="grey-9" :label="tc('components.server.ServerStatus.shut_down')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 6"
            class="text-bold" outline :ripple="false" color="red" :label="tc('components.server.ServerStatus.crashed')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 7"
            class="text-bold" outline :ripple="false" color="grey-9" :label="tc('components.server.ServerStatus.suspended')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 9"
            class="text-bold" outline :ripple="false" color="red" :label="tc('components.server.ServerStatus.communication_fail')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 10"
            class="text-bold" outline :ripple="false" color="red" :label="tc('components.server.ServerStatus.lost')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 11"
            class="text-bold" outline :ripple="false" color="blue-5" :label="tc('components.server.ServerStatus.creating')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>

    <q-chip v-if="server.status === 12"
            class="text-bold" outline :ripple="false" color="red" :label="tc('components.server.ServerStatus.create_fail')"
            clickable
            @click="store.loadSingleServerStatus({isGroup, serverId: server.id}) ">
      <q-tooltip>{{ tc('components.server.ServerStatus.refresh_host_status') }}</q-tooltip>
    </q-chip>
  </span>
</template>

<style lang="scss" scoped>
.ServerStatus {
}
</style>
