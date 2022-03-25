<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
import useStore from 'src/store'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
const tc = i18n.global.tc

const images = ref()
const updateImages = async () => {
  images.value = (await store.getImages()).data
}
// await (async () => {
//   images.value = (await store.getImages()).data
// })()

const notify = () => {
  // 弹出通知
  Notify.create({
    classes: 'notification-positive shadow-15',
    icon: 'mdi-check-circle',
    textColor: 'light-green',
    message: '项目组信息修改成功',
    position: 'bottom',
    closeBtn: true,
    timeout: 5000,
    multiLine: false
  })
}

const alert = ref(false)
</script>

<template>
  <div class="ServerIndex">
    this is ServerIndex

    <div>
      <q-btn @click="store.increment">add</q-btn>
      server store: {{ store.counter }}
    </div>

    <div class="text-primary">{{ tc('翻译测试') }}</div>

    <div>
      <q-btn @click="updateImages">update images</q-btn>
      fed images: {{ images }}
    </div>

    <div>
      <q-btn @click="notify">notify</q-btn>
    </div>

    <q-btn label="Alert" color="primary" @click="alert = true"/>

    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>

<!--        <q-card-section class="q-pt-none">-->
<!--          <div>token: {{ store.items.tokenAccess }}</div>-->
<!--          <div>tokenDecoded: {{ store.items.tokenDecoded }}</div>-->
<!--        </q-card-section>-->

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<style lang="scss" scoped>
.ServerIndex {
}
</style>
