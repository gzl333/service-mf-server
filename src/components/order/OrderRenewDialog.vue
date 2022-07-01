<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import moment from 'moment'

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
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

// dom refs
const dateInput = ref<QInput>()
const monthInput = ref<QInput>()

const server = computed(() => props.isGroup ? store.tables.groupServerTable.byId[props.serverId] : store.tables.personalServerTable.byId[props.serverId])

const renewType = ref<'month' | 'date'>('month')
const monthCount = ref(1)

// expiration_time -> 转换为local time -> 分别取到date和time
const dateSelect = ref(moment.utc(server.value.expiration_time).local().format('YYYY-MM-DD'))
const timeSelect = ref(moment.utc(server.value.expiration_time).local().format('HH:mm'))

// 预付最大月份
const MAX_MONTHS = 60

const onOKClick = () => {
  if (renewType.value === 'month') {
    // 校验输入
    if (monthCount.value < 1 || monthCount.value > MAX_MONTHS) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'error',
        textColor: 'negative',
        message: `预付时长应介于1-${MAX_MONTHS}个月之间`,
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
  } else {
    // 根据日期和时间的选择，生成本地时间对象
    const localDateTime = moment(dateSelect.value + ',' + timeSelect.value, 'YYYY-MM-DD,HH:mm')
    // 转换成UTC时间并转换成ISO格式string
    const utcDateTimeStr = localDateTime.utc().format()
    // 校验输入
    if (Date.parse(server.value.expiration_time) >= Date.parse(utcDateTimeStr)) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'mdi-alert',
        textColor: 'negative',
        message: `${tc('目标时间应晚于过期时间')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      dateInput.value?.focus()
      return
    }
    // 发送请求
    onDialogOK({ renew_to_time: utcDateTimeStr })
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('续期云主机') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            IP地址
          </div>
          <div class="col">
            {{ server.ipv4 }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            网络类型
          </div>
          <div class="col">
            {{ server.public_ip ? '公网' : '私网' }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            备注
          </div>
          <div class="col">
            {{ server.remarks }}
          </div>
        </div>

        <div v-if="isGroup" class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            项目组
          </div>
          <div class="col">
            {{ store.tables.groupTable.byId[server.vo_id].name }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            所属机构
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ? store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name :
                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service]?.data_center]?.name_en
            }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            服务节点
          </div>
          <div class="col">
            {{
              i18n.global.locale === 'zh' ? store.tables.serviceTable.byId[server.service]?.name : store.tables.serviceTable.byId[server.service]?.name_en
            }}

            <span>
              <q-icon
                v-if="store.tables.serviceTable.byId[server.service]?.service_type.toLowerCase().includes('ev')"
                style="width: 100px;height: 20px">
                      <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
              </q-icon>
            </span>

            <span>
              <q-icon
                v-if="store.tables.serviceTable.byId[server.service]?.service_type.toLowerCase().includes('open')"
                style="width: 100px;height: 20px">
                      <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
              </q-icon>
            </span>

          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            配置
          </div>
          <div class="col">
            {{ server.vcpus }}核 / {{ server.ram / 1024 }}GB
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            计费方式
          </div>
          <div v-if="server.pay_type === 'prepaid'" class="col">
            包月预付
          </div>
          <div v-if="server.pay_type === 'postpaid'" class="col">
            按量计费
          </div>
        </div>

        <div class="row items-center">
          <div class="col-2 text-grey-7">
            过期时间
          </div>
          <div class="col">
            <!--            {{ new Date(server.creation_time).toLocaleString(i18n.global.locale) }} - -->
            {{ server.expiration_time ? new Date(server.expiration_time).toLocaleString(i18n.global.locale) : '长期' }}
            <!--            <q-icon-->
            <!--              v-if="server.expiration_time !== null && (new Date(server.expiration_time).getTime() - new Date().getTime()) < 0"-->
            <!--              name="help_outline" color="red" size="xs">-->
            <!--              <q-tooltip>{{ tc('云主机已到期') }}</q-tooltip>-->
            <!--            </q-icon>-->
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section style="height: 150px;">

        <div v-if="server.pay_type === 'postpaid'">
          按量计费的云主机无需续期
        </div>

        <div v-if="server.pay_type === 'prepaid'">

          <div class="row q-pb-lg items-center ">
            <div class="col-2 text-grey-7">
              续期方式
            </div>

            <div class="col-10 q-gutter-x-sm">

              <q-btn style="width: 170px;"
                     :outline="renewType==='month'?false:true"
                     :ripple="false" dense unelevated
                     :color="renewType==='month'?'primary':'grey'"
                     @click="renewType = 'month'">
                {{ tc('指定续期时长') }}
              </q-btn>

              <q-btn style="width: 170px;"
                     :outline="renewType==='date'?false:true"
                     :ripple="false" dense unelevated
                     :color="renewType==='date'?'primary':'grey'"
                     @click="renewType = 'date'">
                {{ tc('指定过期时间') }}
              </q-btn>

            </div>
          </div>

          <div v-if="renewType === 'month'" class="row items-center">
            <div class="col-2 text-grey-7">
              续期时长
            </div>

            <div class="col-10 row items-start q-gutter-x-sm q-pt-md">

              <q-input ref="monthInput"
                       style="width: 347px;"
                       outlined v-model.number="monthCount" input-class="text-center text-primary"
                       :suffix="i18n.global.locale === 'zh' ? '个月' : 'Months'" dense
                       :rules="[val => (Number.isInteger(val) && val>0 && val <= MAX_MONTHS) || (i18n.global.locale === 'zh' ? `应为介于1-${MAX_MONTHS}之间的整数` : `Must be an integer between 1 and ${MAX_MONTHS}`)]">

                <template v-slot:prepend>
                  <q-icon name="remove" color="primary"
                          @click="monthCount = (monthCount < 1 ? 1 : monthCount - 1)"
                          class="cursor-pointer"/>
                </template>

                <template v-slot:append>
                  <q-icon name="add" color="primary"
                          @click="monthCount = (monthCount > MAX_MONTHS ? MAX_MONTHS : monthCount + 1)"
                          class="cursor-pointer"/>
                </template>

              </q-input>

            </div>
          </div>

          <div v-if="renewType === 'date'" class="row items-center">

            <div class="col-2 text-grey-7 q-pt-md">
              目标时间
            </div>

            <div class="col-10 row items-center q-gutter-x-sm q-pt-md">

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
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               :label="tc('创建订单')"
               :disable="server.pay_type === 'postpaid'"
               @click="onOKClick"/>

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               :label="tc('取消')"
               @click="onDialogCancel"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>