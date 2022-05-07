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
      :label="tc('新建')"
      direction="down"
    >
      <q-fab-action :label="tc('新建个人云主机')" unelevated color="primary" icon="computer"
                    @click="navigateToUrl('/my/server/personal/deploy')"/>
    </q-fab>
  </div>
</template>

<style lang="scss" scoped>
.ButtonAdd {
}
</style>
