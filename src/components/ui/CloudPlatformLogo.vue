<script setup lang="ts">
// import { ref, computed } from "vue"
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

import { computed, PropType } from 'vue'

const props = defineProps({
  platformName: {
    type: String,
    required: false,
    default: ''
  },
  logoStyle: {
    type: String as PropType<'horizontal' | 'vertical' | 'mark'>,
    required: false,
    default: 'horizontal'
  },
  width: {
    type: String,
    required: false,
    default: '100px'
  },
  height: {
    type: String,
    required: false,
    default: '20px'
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

const getPlatformIcon = (platformName: string, style: 'horizontal' | 'vertical' | 'mark') => {
  platformName = platformName?.toLowerCase()
  if (platformName?.includes('ev')) {
    if (style === 'horizontal') {
      return require('assets/svg/EVCloud-Logo-Horizontal.svg')
    } else if (style === 'vertical') {
      return require('assets/svg/EVCloud-Logo-Vertical.svg')
    } else if (style === 'mark') {
      return require('assets/svg/EVCloud-Logo-Mark.svg')
    }
  } else if (platformName?.includes('open')) {
    if (style === 'horizontal') {
      return require('assets/svg/OpenStack-Logo-Horizontal.svg')
    } else if (style === 'vertical') {
      return require('assets/svg/OpenStack-Logo-Vertical.svg')
    } else if (style === 'mark') {
      return require('assets/svg/OpenStack-Logo-Mark.svg')
    }
  } else if (platformName?.includes('ali')) {
    return require('assets/png/aliyun-logo.png')
  } else {
    return ''
  }
}

const iconSrc = computed(() => getPlatformIcon(props.platformName, props.logoStyle))

</script>

<template>
  <!--本地存在的svg-->
  <q-icon v-if="iconSrc" :style="{width, height}">
    <img :src="iconSrc" :style="{width, height}" alt=""/>
  </q-icon>

  <!--本地没有的icon，使用material的icon，给一个默认颜色-->
  <q-icon v-else-if="iconSrc !== ''" :style="{width, height}" :color="defaultColor" name="cloud"/>

</template>

<style lang="scss" scoped>
</style>
