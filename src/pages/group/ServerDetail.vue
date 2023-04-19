<script setup lang="ts">
// import { ref, computed } from "vue"
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
// import { i18n } from 'boot/i18n'

import ServerDetailCard from 'components/server/ServerDetailCard.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
const route = useRoute()
// const router = useRouter()
// const tc = i18n.global.tc

// 从route对象中读取id参数
const serverId = route.params.serverId as string

// load single sever
void store.loadSingleServer({
  serverId,
  isGroup: true
})

</script>

<template>
  <div class="ServerDetail">
    <server-detail-card :server-id="serverId" :is-group="true"/>
  </div>
</template>

<style lang="scss" scoped>
.ServerDetail {
}
</style>
