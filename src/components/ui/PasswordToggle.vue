<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

// const props =
defineProps({
  text: {
    type: String,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

const isVisible = ref(false)

</script>

<template>
  <!--根据内容改变长度的input. 一个字母占8像素，一个汉字占16像素.https://github.com/quasarframework/quasar/issues/1958-->
  <q-input
    :input-style="{width:`${text.length * (isVisible ? 9 : 5)}px`}"
    :model-value="text" readonly borderless dense
    :type="isVisible ? 'text':'password'">
    <template v-slot:append>
      <q-icon :name="isVisible ? 'visibility_off' : 'visibility'" @click="isVisible = !isVisible"/>
    </template>
  </q-input>
</template>

<style lang="scss" scoped>
</style>
