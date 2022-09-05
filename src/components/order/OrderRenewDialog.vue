<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import moment from 'moment'

import CloudPlatformLogo from 'components/ui/CloudPlatformLogo.vue'
import api from 'src/api'
import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  serverId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false,
    default: false
  }
})
// const emits
defineEmits([...useDialogPluginComponent.emits])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const exceptionNotifier = useExceptionNotifier()

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

// 续期最大月份
const MAX_MONTHS_RENEW = 6

// dom refs
const dateInput = ref<QInput>()
const monthInput = ref<QInput>()

const server = computed(() => props.isGroup ? store.tables.groupServerTable.byId[props.serverId] : store.tables.personalServerTable.byId[props.serverId])

const renewType = ref<'month' | 'date'>('month')
const monthCount = ref(1)

// expiration_time -> 转换为local time -> 分别取到date和time
const dateSelect = ref(moment.utc(server.value.expiration_time).local().format('YYYY-MM-DD'))
const timeSelect = ref(moment.utc(server.value.expiration_time).local().add(1, 'hour').format('HH:mm'))
/*
*     // 根据日期和时间的选择，生成本地时间对象
    const localDateTime = moment(dateSelect.value + ',' + timeSelect.value, 'YYYY-MM-DD,HH:mm')
    // 转换成UTC时间并转换成ISO格式string
    const utcDateTimeStr = localDateTime.utc().format()
    *  */

const targetTimeStr = computed(() => moment(dateSelect.value + ',' + timeSelect.value, 'YYYY-MM-DD,HH:mm').utc().format())

// 询价对象
const currentPrice = ref<{ original: string; trade: string } | null>(null)

// 询价函数
const getPrice = async () => {
  // prepaid时才询价
  if (server.value.pay_type === 'prepaid') {
    try {
      // 发出询价请求
      const respGetPriceRenew = await api.server['describe-price'].getDescribePriceRenewal({
        query: {
          resource_type: 'vm',
          instance_id: server.value.id,
          ...(renewType.value === 'month' ? { period: monthCount.value } : {}),
          ...(renewType.value === 'date' ? { renew_to_time: targetTimeStr.value } : {})
        }
      })
      // 拿到price
      currentPrice.value = respGetPriceRenew.data.price
    } catch (exception) {
      exceptionNotifier(exception)
      // 若询价失败，清除当前询价结果
      currentPrice.value = null
    }
  }
}

// setup时询价一次
getPrice()

// 根据selection进行询价
watch([renewType, monthCount, dateSelect, timeSelect], getPrice)

const onOKClick = () => {
  if (renewType.value === 'month') {
    // 校验输入
    if (monthCount.value < 1 || monthCount.value > MAX_MONTHS_RENEW) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'error',
        textColor: 'negative',
        message: `${tc('components.order.OrderRenewDialog.prepaid_time_warning')}1-${MAX_MONTHS_RENEW} ${tc('components.order.OrderRenewDialog.prepaid_time_months')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      monthInput.value?.focus()
      return
    }

    // 发送请求
    onDialogOK({ period: monthCount.value })
  } else if (renewType.value === 'date') {
    // 不应超过MAX_MONTHS_RENEW
    if (moment.utc(targetTimeStr.value).isAfter(moment.utc(server.value.expiration_time).add(MAX_MONTHS_RENEW, 'month'))) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'mdi-alert',
        textColor: 'negative',
        message: `${tc('最大续期月份')}: ${MAX_MONTHS_RENEW}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      dateInput.value?.focus()
      return
    }

    // 不应晚于当前时间
    if (Date.parse(server.value.expiration_time) >= Date.parse(targetTimeStr.value)) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'mdi-alert',
        textColor: 'negative',
        message: `${tc('components.order.OrderRenewDialog.target_time_requirement')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      dateInput.value?.focus()
      return
    }

    // 发送请求
    onDialogOK({ renew_to_time: targetTimeStr.value })
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('components.order.OrderRenewDialog.renew_server') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.ip_address') }}
          </div>
          <div class="col">
            {{ server.ipv4 }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.network_type') }}
          </div>
          <div class="col">
            {{
              server.public_ip ? tc('components.order.OrderRenewDialog.public_network') : tc('components.order.OrderRenewDialog.private_network')
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.remarks') }}
          </div>
          <div class="col" style="max-width: 400px; word-break: break-all; word-wrap: break-word; white-space: normal;">
            {{ server.remarks }}
          </div>
        </div>

        <div v-if="isGroup" class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.group') }}
          </div>
          <div class="col">
            {{ store.tables.groupTable.byId[server.vo_id].name }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.org') }}
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name :
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name_en
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.service_node') }}
          </div>
          <div class="col row items-center">
            {{
              i18n.global.locale === 'zh' ? store.tables.serviceTable.byId[server.service]?.name : store.tables.serviceTable.byId[server.service]?.name_en
            }}

            <CloudPlatformLogo
              :platform-name="store.tables.serviceTable.byId[server.service]?.service_type"/>

            <!--            <span>-->
            <!--              <q-icon-->
            <!--                v-if="store.tables.serviceTable.byId[server.service]?.service_type.toLowerCase().includes('ev')"-->
            <!--                style="width: 100px;height: 20px">-->
            <!--                      <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>-->
            <!--              </q-icon>-->
            <!--            </span>-->

            <!--            <span>-->
            <!--              <q-icon-->
            <!--                v-if="store.tables.serviceTable.byId[server.service]?.service_type.toLowerCase().includes('open')"-->
            <!--                style="width: 100px;height: 20px">-->
            <!--                      <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>-->
            <!--              </q-icon>-->
            <!--            </span>-->

          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.configuration') }}
          </div>
          <div class="col">
            {{ server.vcpus }} {{ tc('components.order.OrderRenewDialog.cores') }} / {{ server.ram / 1024 }}GB
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.billing_method') }}
          </div>
          <div v-if="server.pay_type === 'prepaid'" class="col">
            {{ tc('components.order.OrderRenewDialog.monthly_prepaid') }}
          </div>
          <div v-if="server.pay_type === 'postpaid'" class="col">
            {{ tc('components.order.OrderRenewDialog.pay_as_go') }}
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('components.order.OrderRenewDialog.expiration_time') }}
          </div>
          <div class="col">
            <!--            {{ new Date(server.creation_time).toLocaleString(i18n.global.locale) }} - -->
            {{
              server.expiration_time ? new Date(server.expiration_time).toLocaleString(i18n.global.locale) : tc('components.order.OrderRenewDialog.long_term')
            }}
            <!--            <q-icon-->
            <!--              v-if="server.expiration_time !== null && (new Date(server.expiration_time).getTime() - new Date().getTime()) < 0"-->
            <!--              name="help_outline" color="red" size="xs">-->
            <!--              <q-tooltip>{{ tc('云主机已到期') }}</q-tooltip>-->
            <!--            </q-icon>-->
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div v-if="server.pay_type === 'postpaid'">
          {{ tc('components.order.OrderRenewDialog.no_prepayment_required') }}
        </div>

        <div v-if="server.pay_type === 'prepaid'">

          <div class="row q-pb-lg items-center ">
            <div class="col-3 text-grey-7">
              {{ tc('components.order.OrderRenewDialog.renew_type') }}
            </div>

            <div class="col-9 q-gutter-x-sm">

              <q-btn style="width: 160px;"
                     :outline="renewType==='month'?false:true"
                     :ripple="false" dense unelevated no-caps
                     :color="renewType==='month'?'primary':'grey'"
                     @click="renewType = 'month'">
                {{ tc('components.order.OrderRenewDialog.specify_renewal_period') }}
              </q-btn>

              <q-btn style="width: 160px;"
                     :outline="renewType==='date'?false:true"
                     :ripple="false" dense unelevated no-caps
                     :color="renewType==='date'?'primary':'grey'"
                     @click="renewType = 'date'">
                {{ tc('components.order.OrderRenewDialog.specify_expiration_time') }}
              </q-btn>

            </div>
          </div>

          <div v-if="renewType === 'month'" class="row items-center q-pb-lg">
            <div class="col-3 text-grey-7">
              {{ tc('components.order.OrderRenewDialog.renewal_period') }}
            </div>

            <div class="col-9 row items-start q-gutter-x-sm q-pt-md">

              <q-input ref="monthInput"
                       style="width: 347px;"
                       outlined v-model.number="monthCount" input-class="text-center text-primary"
                       :suffix="i18n.global.locale === 'zh' ? '个月' : 'Months'" dense
                       :rules="[val => (Number.isInteger(val) && val>0 && val <= MAX_MONTHS_RENEW) || (i18n.global.locale === 'zh' ? `应为介于1-${MAX_MONTHS_RENEW}之间的整数` : `Must be an integer between 1 and ${MAX_MONTHS_RENEW}`)]">

                <template v-slot:prepend>
                  <q-icon name="remove" color="primary"
                          @click="monthCount = (monthCount < 1 ? 1 : monthCount - 1)"
                          class="cursor-pointer"/>
                </template>

                <template v-slot:append>
                  <q-icon name="add" color="primary"
                          @click="monthCount = (monthCount > MAX_MONTHS_RENEW ? MAX_MONTHS_RENEW : monthCount + 1)"
                          class="cursor-pointer"/>
                </template>

              </q-input>

            </div>
          </div>

          <div v-if="renewType === 'date'" class="row items-center q-pb-lg">

            <div class="col-3 text-grey-7 q-pt-md">
              {{ tc('components.order.OrderRenewDialog.target_time') }}
            </div>

            <div class="col-9 row items-center q-gutter-x-sm q-pt-md">

              <q-input ref="dateInput"
                       style="width: 170px;"
                       v-model="dateSelect"
                       type="date"
                       outlined
                       dense/>

              <q-input v-model="timeSelect"
                       style="width: 170px;"
                       type="time"
                       outlined
                       dense/>
            </div>
          </div>

          <div class="row  items-center q-pb-lg">
            <div class="col-3 text-grey-7">
              {{ tc('originalPrice') }}
            </div>

            <div class="col-9 row items-center text-strike">
              {{ currentPrice?.original || '?' }} {{ tc('points') }}
            </div>
          </div>

          <div class="row items-center">
            <div class="col-3 text-grey-7">
              {{ tc('discountPrice') }}
            </div>

            <div class="col-9 row items-center text-primary text-h6">
              {{ currentPrice?.trade || '?' }} {{ tc('points', 123) }}
            </div>
          </div>

        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('components.order.OrderRenewDialog.place_order')"
               :disable="server.pay_type === 'postpaid'"
               @click="onOKClick"/>

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('components.order.OrderRenewDialog.cancel')"
               @click="onDialogCancel"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
