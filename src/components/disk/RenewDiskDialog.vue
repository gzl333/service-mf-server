<script setup lang="ts">
import { ref, computed, watch, PropType } from 'vue'
import { navigateToUrl } from 'single-spa'
import { DiskInterface, GroupInterface, useStore } from 'stores/store'
// import { /* useRoute, */ useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import api from 'src/api'
import moment from 'moment'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  group: {
    type: Object as PropType<GroupInterface>,
    required: false
  },
  disk: {
    type: Object as PropType<DiskInterface>,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const exceptionNotifier = useExceptionNotifier()

const {
  dialogRef,
  onDialogHide,
  // onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const service = computed(() => store.tables.serviceTable.byId[props.disk.service.id])

// 续期最大月份
const MAX_MONTHS_RENEW = 6

// dom refs
const dateInput = ref<QInput>()
const monthInput = ref<QInput>()

const renewType = ref<'month' | 'date'>('month')
const monthCount = ref(1)

// expiration_time -> 转换为local time -> 分别取到date和time
const dateSelect = ref(moment.utc(props.disk?.expiration_time).local().format('YYYY-MM-DD'))
const timeSelect = ref(moment.utc(props.disk?.expiration_time).local().add(1, 'hour').format('HH:mm'))
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
  if (props.disk?.pay_type === 'prepaid') {
    try {
      // 发出询价请求
      const respGetPriceRenew = await api.server['describe-price'].getDescribePriceRenewal({
        query: {
          resource_type: 'disk',
          instance_id: props.disk?.id,
          ...(renewType.value === 'month' ? { period: monthCount.value } : {}),
          ...(renewType.value === 'date' ? { renew_to_time: targetTimeStr.value } : {})
        }
      })
      // 拿到price
      currentPrice.value = respGetPriceRenew.data.price
    } catch (exception) {
      // exceptionNotifier(exception, 'GetPriceRenewDisk')
      // 若询价失败，清除当前询价结果
      currentPrice.value = null
    }
  }
}

// setup时询价一次
getPrice()

// 根据selection进行询价
watch([renewType, monthCount, dateSelect, timeSelect], getPrice)

// check inputs
const checkInput = () => {
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
      return false
    }
    return true
  } else if (renewType.value === 'date') {
    // 不应超过MAX_MONTHS_RENEW
    if (moment.utc(targetTimeStr.value).isAfter(moment.utc(props.disk?.expiration_time).add(MAX_MONTHS_RENEW, 'month'))) {
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
      return false
    }

    // 不应晚于当前时间
    if (Date.parse(props.disk?.expiration_time || '') >= Date.parse(targetTimeStr.value)) {
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
      return false
    }

    return true
  }

  return true
}

// 确定时
const onOKClick = async () => {
  if (!checkInput()) {
    return
  }

  // notify
  const dismiss = Notify.create({
    classes: 'notification-positive shadow-15',
    // icon: 'mdi-check-circle',
    spinner: true,
    textColor: 'positive',
    message: `${tc('正在续期云硬盘')}`,
    position: 'bottom',
    closeBtn: true,
    timeout: 0, // infinite
    multiLine: false
  })

  try {
    /* const respMount =  */
    await api.server.disk.postDiskIdRenew({
      path: {
        id: props.disk?.id || ''
      },
      query: {
        ...(renewType.value === 'month' ? { period: monthCount.value } : {}),
        ...(renewType.value === 'date' ? { renew_to_time: targetTimeStr.value } : {})
      }
    })

    // notify
    dismiss()
    Notify.create({
      classes: 'notification-positive shadow-15',
      icon: 'mdi-check-circle',
      // spinner: true,
      textColor: 'positive',
      message: `${tc('成功续期云硬盘')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })

    // close
    onDialogHide()

    // jump
    navigateToUrl(props.group ? `/my/server/group/detail/${props.group?.id}?show=order` : '/my/server/personal/order')
  } catch (exception) {
    dismiss()
    exceptionNotifier(exception, 'RenewDisk')
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary ">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('续期云硬盘') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('所属账户') }}
          </div>
          <div class="col">
            {{ group ? group.name : tc('个人账户') }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('服务单元') }}
          </div>
          <div class="col">
            {{ i18n.global.locale === 'zh' ? service?.name : service?.name_en }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('云硬盘') }}
          </div>
          <div class="col q-pa-sm bg-grey-2">

            <!--            {{ props.disk }}-->

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('容量') }}</div>
              <div class="col"> {{ props.disk?.size }}GB</div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('备注') }}</div>
              <div class="col"> {{ props.disk?.remarks }}</div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('创建时间') }}</div>
              <div class="col">
                {{ new Date(props.disk?.creation_time).toLocaleString(i18n.global.locale as string) }}
              </div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> {{ tc('到期时间') }}</div>
              <div class="col">
                {{ new Date(props.disk?.expiration_time).toLocaleString(i18n.global.locale as string) }}
              </div>
            </div>

            <div class="row">
              <div class="col-3 text-grey-7"> ID</div>
              <div class="col"> {{ props.disk?.id }}</div>
            </div>

          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div v-if="props.disk?.pay_type === 'postpaid'">
          {{ tc('components.order.OrderRenewDialog.no_prepayment_required') }}
        </div>

        <div v-if="props.disk?.pay_type === 'prepaid'">

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
                       style="width: 160px;"
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
                       style="width: 160px;"
                       v-model="dateSelect"
                       type="date"
                       outlined
                       dense/>

              <q-input v-model="timeSelect"
                       style="width: 160px;"
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
               outline
               no-caps
               :label="tc('取消')"
               @click="onDialogCancel"/>

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('下单')"
               @click="onOKClick"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
