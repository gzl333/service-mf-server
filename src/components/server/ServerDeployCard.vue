<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { /*  useRoute, */ useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import api from 'src/api'

import useGetOsIconName from 'src/hooks/useGetOsIconName'

const props = defineProps({
  isGroup: {
    type: Boolean,
    required: true
  },
  groupId: {
    type: String,
    required: false
  },
  serviceId: {
    type: String,
    required: false
  },
  quotaId: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const {
  tc,
  locale
} = i18n.global
const store = useStore()
// const route = useRoute()
const router = useRouter()

// 不可用配额是否折叠
const isFolded = ref(true)

// 获取os的icon名称
const getOsIconName = useGetOsIconName()

// dom元素
const input = ref<HTMLElement>()

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
const quotasValid = computed(() => props.isGroup ? store.getGroupValidQuotasByServiceId(radioService.value, radioGroup.value) : store.getPersonalValidQuotasByServiceId(radioService.value))
const quotasInvalid = computed(() => props.isGroup ? store.getGroupInvalidQuotasByServiceId(radioService.value, radioGroup.value) : store.getPersonalInvalidQuotasByServiceId(radioService.value))
// 当前quota对象
const currentQuota = computed(() => props.isGroup ? store.tables.groupQuotaTable.byId[radioQuota.value] : store.tables.personalQuotaTable.byId[radioQuota.value])
// radio选项 初始状态 (1)
const radioGroup = ref('')
const radioService = ref('')
const radioDataCenter = computed(() => store.tables.serviceTable.byId[radioService.value]?.data_center || '')
const radioQuota = ref('')
const radioNetwork = ref('')
const radioImage = ref('')
const radioFlavor = ref('')
const inputRemarks = ref('')

/* table 进入页面过程中选择默认项 */

/* 分为显示和选择动作两部分。
* 显示部分在标签里进行逻辑判断，哪些显示，哪些不显示
* 选择动作在ts部分，radio真正选择了哪些值 */

// 选择network选项的逻辑
// network选项取决于两部分：  1.该服务的network配置，公网/私网各有多少，这是最基础条件。2.配额里公网/私网的余额。
const chooseNetwork = () => {
  // radioQuota选了才选network，否则为空
  if (!radioQuota.value) {
    radioNetwork.value = ''
  } else {
    if (privateNetworks.value.length === 0 && publicNetworks.value.length === 0) {
      // 1. 配置里私网公网都没有： 选项必为空
      radioNetwork.value = ''
    } else if (privateNetworks.value.length > 0 && publicNetworks.value.length === 0) {
      // 2. 配置里私网有，公网没有：查看配额余额，有私网则选私网里第一项；没有私网，则选项为空
      if (currentQuota.value?.private_ip_total - currentQuota.value?.private_ip_used > 0) {
        radioNetwork.value = privateNetworks.value[0]?.id
      } else {
        radioNetwork.value = ''
      }
    } else if (privateNetworks.value.length === 0 && publicNetworks.value.length > 0) {
      // 3. 配置里私网没有，公网有：查看配额余额，有公网则选公网第一项；没有公网，则选项为空
      if (currentQuota.value?.public_ip_total - currentQuota.value?.public_ip_used > 0) {
        radioNetwork.value = publicNetworks.value[0]?.id
      } else {
        radioNetwork.value = ''
      }
    } else {
      // 4. 配置里私网公网都有： 查看配额余额，有私网则选私网里第一项；没有私网则看有没有公网，有则选择公网第一项；配额余额里公网私网都没有，则选项为空
      if (currentQuota.value?.private_ip_total - currentQuota.value?.private_ip_used > 0) {
        radioNetwork.value = privateNetworks.value[0]?.id
      } else if (currentQuota.value?.public_ip_total - currentQuota.value?.public_ip_used > 0) {
        radioNetwork.value = publicNetworks.value[0]?.id
      } else {
        radioNetwork.value = ''
      }
    }
  }
}

// radio默认选择 (2)
const chooseRadioDefaults = () => {
  if (props.quotaId) {
    // quota使用指定id
    radioQuota.value = props.quotaId
    // group和service用quota的归属信息算出来
    radioGroup.value = store.tables.groupQuotaTable.byId[props.quotaId]?.vo_id as string
    radioService.value = props.isGroup ? store.tables.groupQuotaTable.byId[props.quotaId]?.service : store.tables.personalQuotaTable.byId[props.quotaId]?.service
  } else {
    radioGroup.value = props.groupId || groups.value[0]?.id || ''
    radioService.value = props.serviceId || services.value[0]?.id || ''
    radioQuota.value = quotasValid.value[0]?.id || ''
  }
  // 选择network
  chooseNetwork()
  // image和flavor， 没选择quota，则为空；选择了quota的情况下：image flavor 总是默认选第一项
  radioImage.value = radioQuota.value ? images.value[0]?.id || '' : ''
  radioFlavor.value = radioQuota.value ? flavors.value[0]?.id || '' : ''
}
// setup时调用一次 (3) table已加载时进入页面要选一次默认值
chooseRadioDefaults()
// 根据table的变化情况再调用 (4) table未加载时进入页面，每变化一次都要选一次默认值
watch([store.tables, store.tables.groupTable, store.tables.groupMemberTable], chooseRadioDefaults)
/* table 进入页面过程中选择默认项 */

/* (5) 在table都加载后，3个radio，随着group/service变化选择默认项 */
watch([radioGroup, radioService], () => {
  // 在group/service变化后, quota 总是默认选第一项
  radioQuota.value = quotasValid.value[0]?.id || ''
  // 在group/service变化后,image和flavor， 没选择quota，则为空；选择了quota的情况下：image flavor 总是默认选第一项
  radioImage.value = radioQuota.value ? images.value[0]?.id || '' : ''
  radioFlavor.value = radioQuota.value ? flavors.value[0]?.id || '' : ''
  // 切换group/service时，不可用quota也恢复折叠
  isFolded.value = true
})
/* 在table都加载后，3个radio，随着group/service变化选择默认项 */

/* (6) 在table都加载后，network radio，随着quota变化选择默认项 */
watch(radioQuota, chooseNetwork)
/* 在table都加载后，network radio，随着quota变化选择默认项 */

/* 新建云主机 */
const isDeploying = ref(false)
const deployServer = async () => {
  if (!radioQuota.value) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: '请选择可用配额',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (!radioNetwork.value) {
    // 如果radio没有选择全，则弹出通知
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: '请选择可用网络类型',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (!radioImage.value) {
    // 如果radio没有选择全，则弹出通知
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: '请选择可用操作系统',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (!radioFlavor.value) {
    // 如果radio没有选择全，则弹出通知
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: '请选择可用硬件配置',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  } else if (!inputRemarks.value) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: '请填写备注',
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    input.value?.focus()
  } else {
    isDeploying.value = true
    const selection = {
      service_id: radioService.value,
      network_id: radioNetwork.value,
      image_id: radioImage.value,
      flavor_id: radioFlavor.value,
      quota_id: radioQuota.value,
      remarks: inputRemarks.value
    }

    const respPostServer = await api.server.server.postServer({ body: selection })

    if (respPostServer.status === 201) {
      // 更新personal/group ServerTable,根据返回的serverId获取该server的全部信息，存入table
      void await store.loadSingleServer({
        serverId: respPostServer.data.id,
        isGroup: props.isGroup
      })
      // 更新personal/group quotaTable, 因为quota已经消耗了一部分。连带里面servers字段也更新了。
      props.isGroup ? void store.loadGroupQuotaTable() : void store.loadPersonalQuotaTable()
      // notify
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: `成功新建云主机: ${props.isGroup ? store.tables.groupServerTable.byId[respPostServer.data.id].ipv4 : store.tables.personalServerTable.byId[respPostServer.data.id].ipv4}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 15000,
        multiLine: false
      })
      // 跳转
      void router.back()
    } else if (respPostServer.status === 202) {
      // notify
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'check_circle',
        textColor: 'positive',
        message: '云主机新建中，请稍候...',
        position: 'bottom',
        closeBtn: true,
        timeout: 15000,
        multiLine: false
      })
      // 跳转
      void router.back()
    }
    // 改变按钮状态，不管响应结果如何，得到响应之后就恢复按钮状态
    isDeploying.value = false
  }
}
/* 新建云主机 */
</script>

<template>
  <div class="ServerDeployCard">

    <div v-if="!dataCenters">
      <q-inner-loading>
        <q-spinner size="50px" color="primary"/>
      </q-inner-loading>
    </div>

    <div v-else>

      <div v-if="isGroup" class="section">
        <div class="text-h7 text-primary section-title">
          {{ tc('项目组') }}
        </div>
        <div class="row items-center q-gutter-md q-pb-lg">
          <div class="col-auto text-bold row items-center ">
            {{ tc('使用该云主机的项目组') }}
            <q-icon name="help_outline" color="grey" size="xs">
              <q-tooltip>{{ tc('只有组长和管理员可以创建项目组云主机') }}</q-tooltip>
            </q-icon>
          </div>
          <q-select v-if="groups.length !== 0" class="col-4" outlined v-model="radioGroup" dense
                    :options="groups" map-options emit-value option-label="name" option-value="id">

            <!--当前选项的内容插槽-->
            <template v-slot:selected-item="scope">
                <span :class="radioGroup===scope.opt.id ? 'text-primary' : 'text-black'">
                {{ scope.opt.name }}
                </span>
            </template>

          </q-select>
          <div v-else>
            <div class="row items-center">
              {{ tc('暂无项目组，请') }}
              <q-btn v-if="isGroup" flat padding="none" color="primary"
                     :to="'/my/group/create'">
                {{ tc('创建项目组') }}
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <div class="col section">
        <div class="text-h7 text-primary section-title">
          {{ tc('服务节点') }}
        </div>
        <div v-for="dataCenter in dataCenters" :key="dataCenter.id" class="row  item-row">

          <div class="col-auto item-title text-bold">
            {{ locale === 'zh' ? dataCenter.name : dataCenter.name_en }}
          </div>

          <div class="col">
            <div class="row items-center q-pb-sm"
                 v-for="service in dataCenter.services.map(id => store.tables.serviceTable.byId[id])"
                 :key="service.id">

              <q-radio class="col-auto non-selectable" dense v-model="radioService" :val="service.id" :key="service.id">

                <span :class="radioService===service.id ? 'text-primary' : 'text-black'">
                  {{ locale === 'zh' ? service.name : service.name_en }}
                </span>
                <span>
                  <q-icon
                    class="q-px-sm"
                    v-if="service.service_type.toLowerCase().includes('ev')"
                    style="width: 100px;height: 20px">
                      <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
                  </q-icon>
                </span>
                <span>
                  <q-icon
                    class="q-px-sm"
                    v-if="service.service_type.toLowerCase().includes('open')"
                    style="width: 100px;height: 20px">
                      <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>
                  </q-icon>
                </span>

              </q-radio>

            </div>

          </div>

        </div>
      </div>

      <div class="col section">
        <div class="text-h7 text-primary section-title row justify-between">
          {{ tc('云主机配额') }}

          <q-btn v-if="isGroup" unelevated icon="add" padding="xs" color="primary"
                 :to="`/my/group/quota/apply?group=${radioGroup}&service=${radioService}`">
            {{ tc('申请新配额') }}
          </q-btn>
          <q-btn v-else unelevated icon="add" padding="xs" color="primary"
                 :to="`/my/personal/quota/apply?service=${radioService}`">
            {{ tc('申请新配额') }}
          </q-btn>
        </div>

        <div class="row item-row">
          <div class="col-1  text-bold">
            {{ tc('可用配额') }}
          </div>
          <div class="col">

            <div v-if="quotasValid.length === 0" class="row items-center">
              {{ tc('无') }}
            </div>

            <div v-else>
              <q-radio v-for="quota in quotasValid" :val="quota.id" :key="quota.id"
                       class="radio non-selectable"
                       dense v-model="radioQuota"
                       :disable="quota.expired || quota.exhausted">
                <div>{{ quota }}</div>
                <!--                <quota-detail-card-dense :quota="quota" :is-group="isGroup"/>-->
                <!--                <q-btn label="a" :to="{path: '/'}"/>-->
              </q-radio>
            </div>

          </div>
        </div>

        <!--        <q-separator spaced="lg"/>-->

        <div class="row item-row">
          <div class="col-1  text-bold">
            {{ tc('不可用配额') }}
          </div>
          <div class="col">
            <div v-if="quotasInvalid.length === 0">{{ tc('无') }}</div>
            <div v-else>
              <div class="row">
                <!--                <q-btn class="q-pa-none" color="primary" flat dense padding="none" size="md"-->
                <!--                       @click="isFolded=!isFolded">-->
                <!--                  {{ isFolded ? tc('展开') : tc('折叠') }}-->
                <!--                </q-btn>-->
                <a class="text-primary cursor-pointer"
                   @click="isFolded=!isFolded" :to="{path:'/my'}">{{ isFolded ? tc('展开') : tc('收起') }}</a>
              </div>
              <div v-if="!isFolded">
                <q-radio v-for="quota in quotasInvalid" :val="quota.id" :key="quota.id"
                         class="radio non-selectable"
                         v-model="radioQuota"
                         dense :disable="quota.expired || quota.exhausted">
                  <div>{{ quota }}</div>
                  <!--                  <quota-detail-card-dense :quota="quota" :is-group="isGroup"/>-->
                </q-radio>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col section">

        <div class="text-h7 text-primary section-title">
          {{ tc('网络类型') }}
        </div>
        <!--未选择配额-->
        <div v-if="!radioQuota" class="row item-row">
          <div class="col-shrink item-title">
            {{ tc('请选择可用配额以列举网络类型') }}
          </div>
        </div>
        <!--选择了配额-->
        <div v-else>
          <!--显示部分，只要符合条件就都显示；选择部分只能选一个，不可以都选-->
          <div
            v-if="privateNetworks.length > 0 && (currentQuota.private_ip_total - currentQuota.private_ip_used)>0"
            class="row item-row">
            <div class="col-1 text-bold">
              {{ tc('私网IP段') }}
            </div>
            <div class="col">
              <q-radio v-for="network in privateNetworks" :val="network.id" :key="network.id" v-model="radioNetwork"
                       class="radio non-selectable" dense>
                <div :class="radioNetwork===network.id ? 'text-primary' : 'text-black'">
                  {{ network.name }}
                </div>
              </q-radio>
            </div>
          </div>

          <div
            v-if="publicNetworks.length > 0 && (currentQuota.public_ip_total-currentQuota.public_ip_used)>0"
            class="row item-row">
            <div class="col-1 text-bold">
              {{ tc('公网IP段') }}
            </div>
            <div class="col">
              <q-radio v-for="network in publicNetworks" :val="network.id" :key="network.id" v-model="radioNetwork"
                       class="radio non-selectable" dense>
                <div :class="radioNetwork===network.id ? 'text-primary' : 'text-black'">
                  {{ network.name }}
                </div>
              </q-radio>
            </div>
          </div>

          <!--节点配置只有公网，但余额只有私网；节点配置只有私网，余额只有公网。则无可用配额-->
          <div
            v-if="((publicNetworks.length>0 && privateNetworks.length===0) && ((currentQuota.private_ip_total - currentQuota.private_ip_used)>0) && ((currentQuota.public_ip_total - currentQuota.public_ip_used)===0)) ||
                  ((publicNetworks.length===0 && privateNetworks.length>0) && ((currentQuota.private_ip_total - currentQuota.private_ip_used)===0) && ((currentQuota.public_ip_total - currentQuota.public_ip_used)>0))"
            class="row item-row">
            <div class="col-shrink item-title">
              {{ tc('暂无可用网络类型，请选择其他配额') }}
            </div>
          </div>

          <div v-if="publicNetworks.length === 0 && privateNetworks.length === 0"
               class="row item-row">
            <div class="col-shrink item-title">
              {{ tc('该服务节点无可用网络类型，请选择其它服务节点') }}
            </div>
          </div>

        </div>

      </div>

      <div class="col section">
        <div class="text-h7 text-primary section-title">
          {{ tc('操作系统') }}
        </div>

        <div v-if="!radioQuota" class="row item-row">
          <div class="col-shrink item-title">
            {{ tc('请选择可用配额以列举操作系统') }}
          </div>
        </div>

        <div v-else>
          <div v-if="images.length > 0" class="row item-row">
            <div class="col">
              <q-radio v-for="image in images" :val="image.id" :key="image.id"
                       class="radio non-selectable" dense v-model="radioImage">
                <div class="column items-center q-pr-md" :class="radioImage===image.id ? 'text-primary' : 'text-black'">
                  <div>
                    <q-icon v-if="getOsIconName(image.name)" :name="getOsIconName(image.name)" flat size="md"/>
                  </div>
                  {{ image.name }}
                </div>
              </q-radio>
            </div>
          </div>
          <div v-else class="row item-row">
            <div class="col-shrink item-title">
              {{ tc('该服务节点无可用操作系统，请选择其它服务节点') }}
            </div>
          </div>
        </div>
      </div>

      <div class="col section">
        <div class="text-h7 text-primary section-title">
          CPU/{{ tc('内存') }}
        </div>

        <div v-if="!radioQuota" class="row item-row">
          <div class="col-shrink item-title">
            {{ tc('请选择可用配额以列举配置') }}
          </div>
        </div>

        <div v-else>
          <div v-if="flavors.length > 0" class="row item-row">
            <div class="col">
              <q-radio v-for="flavor in flavors" :val="flavor.id" :key="flavor.id"
                       class="radio non-selectable" dense v-model="radioFlavor">
                <div :class="radioFlavor===flavor.id ? 'text-primary' : 'text-black'">
                  {{ `${flavor.vcpus}${tc('核')}/${flavor.ram / 1024}GB` }}
                </div>
              </q-radio>
            </div>
          </div>
          <div v-else class="row item-row">
            <div class="col-shrink item-title">
              {{ tc('该服务节点无可用配置，请选择其它服务节点') }}
            </div>
          </div>
        </div>
      </div>

      <div class="col section">
        <div class="text-h7 text-primary section-title">
          {{ tc('备注') }}
        </div>
        <div class="row item-row">
          <div class="col-6">
            <q-input ref="input" class="input-remarks" v-model="inputRemarks" maxlength="30" dense outlined counter/>
          </div>
        </div>
      </div>

      <div class="col summarize-section">
        <div class="text-h7 text-primary section-title">
          {{ tc('所选配置') }}
        </div>

        <div v-if="isGroup" class="row item-row items-center">
          <div class="col-shrink item-title-narrow text-grey">
            {{ tc('项目组') }}
          </div>
          <div class="col">
            <div v-if="radioGroup !== ''">
              {{ store.tables.groupTable.byId[radioGroup]?.name }}
            </div>
            <div v-else class="text-red">{{ tc('请选择项目组') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-shrink item-title-narrow text-grey">
            {{ tc('服务节点') }}
          </div>
          <div class="col">
            <div
              v-if="store.tables.dataCenterTable.byId[radioDataCenter] && store.tables.serviceTable.byId[radioService]">

              <span>
                {{
                  locale === 'zh' ?
                    `${store.tables.dataCenterTable.byId[radioDataCenter]?.name} - ${store.tables.serviceTable.byId[radioService]?.name}` :
                    `${store.tables.dataCenterTable.byId[radioDataCenter]?.name_en} - ${store.tables.serviceTable.byId[radioService]?.name_en}`
                }}
              </span>

              <span>
                <q-icon
                  v-if="store.tables.serviceTable.byId[radioService]?.service_type.toLowerCase().includes('ev')"
                  name="img:svg/EVCloud-Logo-Horizontal.svg"
                  style="width: 100px;height: 20px"/>
                <!--                <q-tooltip>{{ tc('该节点的服务类型为EVCloud') }}</q-tooltip>-->
              </span>

              <span>
                <q-icon
                  v-if="store.tables.serviceTable.byId[radioService]?.service_type.toLowerCase().includes('open')"
                  name="img:svg/OpenStack-Logo-Horizontal.svg"
                  style="width: 100px;height: 20px"/>
                <!--                <q-tooltip>{{ tc('该节点的服务类型为OpenStack') }}</q-tooltip>-->
              </span>

            </div>
            <div v-else class="text-red">{{ tc('请选择服务节点') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-shrink item-title-narrow text-grey">
            {{ tc('云主机配额') }}
          </div>
          <div v-if="isGroup" class="col">
            <div v-if="store.tables.groupQuotaTable.byId[radioQuota]?.display">
              {{ store.tables.groupQuotaTable.byId[radioQuota]?.display }}
            </div>
            <div v-else class="text-red">{{ tc('请选择云主机配额') }}</div>
          </div>
          <div v-else class="col">
            <div v-if="store.tables.personalQuotaTable.byId[radioQuota]?.display">
              {{ store.tables.personalQuotaTable.byId[radioQuota]?.display }}
            </div>
            <div v-else class="text-red">{{ tc('请选择云主机配额') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-shrink item-title-narrow text-grey">
            {{ tc('网络类型') }}
          </div>
          <div class="col">
            <div
              v-if="store.tables.serviceNetworkTable.byLocalId[`${radioService}-${radioNetwork}`]?.name">
              {{ store.tables.serviceNetworkTable.byLocalId[`${radioService}-${radioNetwork}`]?.name }}
            </div>
            <div v-else class="text-red">{{ tc('请选择网络类型') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-shrink item-title-narrow text-grey">
            {{ tc('操作系统') }}
          </div>
          <div class="col">
            <div
              v-if="store.tables.serviceImageTable.byLocalId[`${radioService}-${radioImage}`]?.name">
              <q-icon
                v-if="getOsIconName(store.tables.serviceImageTable.byLocalId[`${radioService}-${radioImage}`]?.name)"
                :name="getOsIconName(store.tables.serviceImageTable.byLocalId[`${radioService}-${radioImage}`]?.name)"
                flat size="md"/>
              {{ store.tables.serviceImageTable.byLocalId[`${radioService}-${radioImage}`]?.name }}
            </div>
            <div v-else class="text-red">{{ tc('请选择操作系统') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-shrink item-title-narrow text-grey">
            CPU/{{ tc('内存') }}
          </div>
          <div class="col ">
            <div v-if="store.tables.fedFlavorTable.byId[radioFlavor]">
              {{
                `${store.tables.fedFlavorTable.byId[radioFlavor].vcpus}核/${store.tables.fedFlavorTable.byId[radioFlavor].ram / 1024}GB`
              }}
            </div>
            <div v-else class="text-red">{{ tc('请选择配置') }}</div>
          </div>
        </div>

        <div class="row item-row items-center">
          <div class="col-shrink item-title-narrow text-grey">
            {{ tc('备注') }}
          </div>
          <div v-if="inputRemarks" class="col">
            {{ inputRemarks }}
          </div>
          <div v-else class="text-red">{{ tc('请填写备注') }}</div>
        </div>

      </div>

      <q-btn color="primary q-mb-xl" @click="deployServer" unelevated :loading="isDeploying">
        {{ tc('新建云主机') }}
      </q-btn>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.ServerDeployCard {
}

.title-area {
  width: 1230px;
  text-align: left;
  color: $primary;
  font-size: large;
  font-weight: bold;
}

.stepper {
  width: 1230px;
}

.section {
  margin-bottom: 30px;
  padding: 10px 20px;
  border: 1px solid $grey-4;
  border-radius: 5px;
}

.summarize-section {
  margin-bottom: 30px;
  padding: 10px 20px;
  border: 1.5px solid $primary;
  border-radius: 5px;
}

.section-title {
  padding-bottom: 15px;
}

.item-row {
  padding: 5px 0;
}

.item-title {
  text-align: left;
  padding-right: 50px;
  min-width: 250px;
}

.item-title-narrow {
  text-align: left;
  padding-right: 50px;
  min-width: 130px;
}

.radio {
  margin-bottom: 5px;
  padding: 0 10px;
}
</style>
