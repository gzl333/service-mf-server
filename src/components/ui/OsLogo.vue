<script setup lang="ts">
import { /* ref,  */computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

const props = defineProps({
  osName: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: false,
    default: 'lg'
  },
  defaultColor: {
    type: String,
    required: false,
    default: 'primary'
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

const getOsIcon = (osName: string) => {
  osName = osName?.toLowerCase()
  if (osName.includes('alma')) {
    return require('assets/svg/os_alma.svg')
  } else if (osName.includes('arch')) {
    return require('assets/svg/os_arch.svg')
  } else if (osName.includes('centos')) {
    return require('assets/svg/os_centos.svg')
  } else if (osName.includes('debian')) {
    return require('assets/svg/os_debian.svg')
  } else if (osName.includes('fedora') && osName.includes('core')) {
    return require('assets/svg/os_fedora_core.svg')
  } else if (osName.includes('fedora')) {
    return require('assets/svg/os_fedora.svg')
  } else if (osName.includes('freebsd')) {
    return require('assets/svg/os_freebsd.svg')
  } else if (osName.includes('openbsd')) {
    return require('assets/svg/os_openbsd.svg')
  } else if (osName.includes('rocky')) {
    return require('assets/svg/os_rocky.svg')
  } else if (osName.includes('ubuntu')) {
    return require('assets/svg/os_ubuntu.svg')
  } else if (osName.includes('vz')) {
    return require('assets/svg/os_vz.svg')
  } else if (osName.includes('win') && osName.includes('core')) {
    return require('assets/svg/os_windows_core.svg')
  } else if (osName.includes('win')) { // win比windows宽松
    return require('assets/svg/os_windows.svg')
  } else {
    return ''
  }
}

const icon = computed(() => getOsIcon(props.osName))

</script>

<template>

  <!--本地存在的svg-->
  <q-icon v-if="icon" :size="size">
    <img :src="icon"/>
  </q-icon>

  <!--本地没有的icon，使用material的icon，给一个默认颜色-->
  <q-icon v-else :size="size" :color="defaultColor" name="settings_applications"/>

</template>

<style lang="scss" scoped>
</style>
