<script setup lang="ts">
// import { ref, computed } from "vue"
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import ServerDeployCard from 'components/server/ServerDeployCard.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const store = useStore()
const route = useRoute()
const router = useRouter()
const tc = i18n.global.tc

const serviceId = route.query.service as string
const quotaId = route.query.quota as string

</script>

<template>
  <div class="ServerDeploy">
    <div class="column q-py-md">

      <div class="col">
        <div class="row items-center title-area q-pb-md">
          <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
                 @click="router.back()"/>
          <span>{{ tc('pages.personal.ServerDeploy.create_personal_server') }}</span>
        </div>
      </div>

      <div class="col">
        <ServerDeployCard :isGroup="false" :quotaId="quotaId" :serviceId="serviceId"/>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.ServerDeploy {
}

.title-area {
  width: 1230px;
  text-align: left;
  color: $primary;
  font-size: large;
  font-weight: bold;
}
</style>
