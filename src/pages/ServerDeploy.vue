<script setup lang="ts">
import { ref, computed, watch/* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
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
const store = useStore()
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

// radio选项数据
// // 全局数据
// owner/leader权限才能建立云主机， member不能建立
const groups = computed(() => store.getGroupsByMyRole(['owner', 'leader']))
const dataCenters = computed(() => Object.values(store.tables.dataCenterTable.byId))
const services = computed(() => Object.values(store.tables.serviceTable.byId))
const flavors = computed(() => Object.values(store.tables.fedFlavorTable.byId))
// radioService的选项数据根据dataCenters动态生成,此处没有
// //依赖radioService Id选择值的数据
const publicNetworks = computed(() => store.getPublicNetworksByServiceId(radioService.value))
const privateNetworks = computed(() => store.getPrivateNetworksByServicedId(radioService.value))
const images = computed(() => store.getImagesByServiceId(radioService.value))

// radio选项 初始状态 (1)
const selectionOwner = ref<'personal' | 'group'>('personal')
const radioPayment = ref<'prepaid' | 'postpaid'>('prepaid')
const radioPeriod = ref(1)
const selectionGroup = ref('')
const radioService = ref('')
const radioDataCenter = computed(() => store.tables.serviceTable.byId[radioService.value]?.data_center || '')
// const radioQuota = ref('')
const radioNetwork = ref('')
const radioImage = ref('')
const radioFlavor = ref('')
const inputRemarks = ref('')

</script>

<template>
  <div class="ServerDeploy">

    <q-scroll-area style="height: calc(100vh - 60px);">

      <div class="row justify-center" style="padding-bottom: 200px;">
        <div class="content-fixed-width column">

          <div class="col-auto q-py-xl row items-center">
            <q-btn class="col-auto" flat dense color="primary" icon="arrow_back_ios" size="xl"/>
            <div class="col-auto text-h4 text-primary">
              Deploy Server Instance
            </div>
          </div>

          <div class="col-auto q-py-lg">
            <div class="q-py-md text-h6 text-grey">
              Server Owner
            </div>
            <div class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionOwner === 'personal' ? 'shadow-14' : ''"
                :color="selectionOwner === 'personal' ? 'white' : 'grey-4'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionOwner = 'personal'"
              >
                <div class="column items-center justify-center q-pa-md"
                     style="width: 250px;height: 150px;">

                  <div class="col-7 text-black">
                    Personal Account
                  </div>
                  <div class="col-5 text-black">
                    New server will belong to your personal account.
                  </div>
                </div>
              </q-btn>

              <q-btn
                :class="selectionOwner === 'group' ? 'shadow-14' : ''"
                :color="selectionOwner === 'group' ? 'white' : 'grey-4'"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionOwner = 'group'"
              >
                <div class="column items-center justify-center q-pa-md"
                     style="width: 250px;height: 150px;">

                  <div class="col-7 text-black">
                    Group Account
                  </div>
                  <div class="col-5 text-black">
                    New server will belong to one of your group accounts.
                  </div>
                </div>
              </q-btn>

            </div>
          </div>

          <div v-if="selectionOwner === 'group'" class="col-auto q-py-lg">
            <div class="q-py-md text-h6 text-grey">
              Group
            </div>
            <div class="row items-center q-gutter-lg">
              <q-btn
                :class="selectionGroup === group.id ? 'shadow-14' : ''"
                :color="selectionGroup === group.id ? 'white' : 'grey-4'"
                v-for="group in groups"
                :val="group.id"
                :key="group.id"
                outline
                dense
                no-caps
                :ripple="false"
                @click="selectionGroup = group.id"
              >
                <div class="column items-center justify-center q-pa-md"
                     style="width: 250px;height: 150px;">

                  <div class="col-7 text-black">
                    {{ group.name }}
                  </div>
                  <div class="col-5 text-black">
                    Your group.
                  </div>
                </div>
              </q-btn>
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

    </q-scroll-area>

    <q-page-sticky position="bottom">
      <div class="row justify-center bg-white shadow-10 content-fixed-width">
        <div class="col-auto" style="height: 150px">
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
