<script setup lang="ts">
import { ref } from 'vue'
import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const store = useStore()
const tc = i18n.global.tc
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
      :label="tc('components.personal.ButtonAdd.create')"
      direction="down"
    >
      <q-fab-action :label="tc('components.personal.ButtonAdd.create_personal_server')" unelevated color="primary" icon="computer"
                    @click="navigateToUrl('/my/server/deploy')"/>
    </q-fab>
  </div>
</template>

<style lang="scss" scoped>
.ButtonAdd {
}
</style>
