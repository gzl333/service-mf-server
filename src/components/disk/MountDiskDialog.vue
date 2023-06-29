<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

const props = defineProps({
  isGroup: {
    type: Boolean,
    required: false,
    default: false
  },
  diskId: {
    type: String,
    required: false,
    default: ''
  },
  serverId: {
    type: String,
    required: false,
    default: ''
  }
})
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

// diskId/serverId二选一传入，然后确定serviceId， 产生disk list和server list
// 默认选中传入的参数所对应的disk/server实例

</script>

<template>
  <div class="MountDiskDialog">
    this is MountDiskDialog
  </div>
</template>

<style lang="scss" scoped>
.MountDiskDialog {
}
</style>
