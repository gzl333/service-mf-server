<script setup lang="ts">
// import { ref, computed, watch/* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute/* , useRouter  */ } from 'vue-router'
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

// 预付最大月份
// const MAX_MONTHS = 6

// 是否允许使用后付费模式
// 目前判断个人账户或者项目组账户余额大于0
// const isAllowPostpaid = computed(() => {
//   if (props.isGroup) {
//     return Number(store.tables.groupBalanceTable.byId[store.tables.groupTable.byId[radioGroup.value]?.balance]?.balance) > 0
//   } else {
//     return Number(store.items?.personalBalance) > 0
//   }
// })

// // dom元素
// const input = ref<HTMLElement>()

// const groupId = route.query.group as string
// const serviceId = route.query.service as string
// const quotaId = route.query.quota as string

</script>

<template>
  <div class="ServerDeploy">

    <div class="row justify-center" style="padding-bottom: 200px;">
      <div class="content-fixed-width column">

        <div class="col-auto q-py-xl">
          <div class="text-h4 text-primary">
            Deploy New Server Instance
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Server Owner
          </div>
          <div>
            <q-btn>Personal Account</q-btn>
            <q-btn>Group Account</q-btn>
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Group (if choose group account)
          </div>
          <div>
            a list of available groups
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Payment Method
          </div>
          <div>
            <q-btn>Monthly / Yearly Prepaid</q-btn>
            <q-btn>Postpaid</q-btn>
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Usage Period (if choose postpaid)
          </div>
          <div>
            a prepaid period
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Service Unit
          </div>
          <div>
            a list available service units
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Server Operating System
          </div>
          <div>
            a list available OS
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Server Size
          </div>
          <div>
            a list available configurations
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Server Network
          </div>
          <div>
            a list available networks
          </div>
        </div>

        <div class="col-auto q-py-lg">
          <div class="text-h7 text-grey text-weight-bold">
            Server Remarks
          </div>
          <div>
            a remark input
          </div>
        </div>

      </div>
    </div>

    <q-page-sticky position="bottom">
      <div class="row justify-center bg-grey-3" style="height: 150px; width: 100vw;">

        <div class="content-fixed-width bg-green">
          hello
        </div>

      </div>
    </q-page-sticky>

  </div>
</template>

<style lang="scss" scoped>
.ServerDeploy {
}
</style>
