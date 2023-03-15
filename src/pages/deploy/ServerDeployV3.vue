<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String as PropType<'bar'>,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

const isShow = ref(false)

</script>

<template>
  <div class="ServerDeployV3">

    <q-scroll-area style="height: calc(100vh - 60px);">
      this is ServerDeployV3
    </q-scroll-area>

    <q-page-sticky style="width: 300px;" expand position="right">
      <div class="column justify-end full-height full-width">

        <div v-show="isShow" class="col row justify-center items-center bg-blue-1">
          summary
        </div>

        <div class="col-auto column justify-center items-center bg-red-1">
          <q-btn
            class=""
            style="transform: translate(0, -50%);"
            color="primary"
            rounded
            :icon="isShow ? 'expand_more' : 'expand_less' "
            @click="isShow = !isShow"
          >
            展开详情
          </q-btn>

          <q-btn color="primary">
            confirm
          </q-btn>
        </div>

      </div>
    </q-page-sticky>

  </div>
</template>

<style lang="scss" scoped>
.ServerDeployV3 {
}
</style>
