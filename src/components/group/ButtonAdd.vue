<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc/* , locale */ } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

const fabButton = ref(false)
</script>

<template>
  <div class="ButtonAdd">
    <q-fab
      style="float: right; transform: translate(0, 65%);"
      v-model="fabButton"
      vertical-actions-align="right"
      color="primary"
      icon="add"
      :label="tc('components.group.ButtonAdd.new_build')"
      direction="down"
    >
      <q-fab-action :label="tc('components.group.ButtonAdd.new_project_group')" unelevated color="primary" icon="group"
                    @click="navigateToUrl('/my/server/group/create')"/>
      <q-fab-action :label="tc('components.group.ButtonAdd.new_cloud_host')" unelevated color="primary" icon="computer"
                    @click="navigateToUrl('/my/server/group/server/deploy')"/>
    </q-fab>
  </div>
</template>

<style lang="scss" scoped>
.ButtonAdd {
}
</style>
