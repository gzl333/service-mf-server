<script setup lang="ts">
import { /* ref,  */computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { /* useRoute, */ useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'
import useGetOsIconName from 'src/hooks/useGetOsIconName'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  },
  isGroup: {
    type: Boolean,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
const router = useRouter()

const order = computed(() => props.isGroup ? store.tables.groupOrderTable.byId[props.orderId] : store.tables.personalOrderTable.byId[props.orderId])

// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()
// 获取os的icon名称
const getOsIconName = useGetOsIconName()

</script>

<template>
  <div class="OrderDetailCard">
    <div class="column items-center justify-center q-py-md">
      <div class="col">

        <div class="row items-center title-area">
          <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
                 @click="router.back()"/>
          <span v-if="isGroup">项目组订单详情</span>
          <span v-else>个人订单详情</span>
        </div>

        <!--直接从url进入本页面时，tables尚未载入，应显示loading界面。对取属性进行缓冲，不出现undefined错误-->
        <div class="row">
          <!--todo 区分读取中和读取错误          -->
          <div v-if="!order" class="col">
            正在加载，请稍候
          </div>

          <div v-else class="col content-area">
            <div class="row justify-end items-center q-pt-md">

              <div class="col-8 row">

                <div class="col-auto">
                  <div class="text-grey">订单ID</div>
                  <div class="row items-center">
                    <div class="text-h6">{{ order.id }}</div>
                    <!--创建时间距离当下小于1小时则打上new标记-->
                    <q-badge style="top:-10px;"
                             v-if="(new Date() - new Date(order.creation_time)) < 1000 * 60 * 60 * 1 "
                             color="light-green" floating transparent rounded align="middle">
                      new
                    </q-badge>
                    <q-btn class="col-shrink q-px-xs" flat color="primary" icon="content_copy" size="sm"
                           @click="clickToCopy(order.id)">
                      <q-tooltip>
                        复制
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <div class="col-auto q-pl-lg">
                  <div class="text-grey">资源类型</div>
                  <div class="text-h6">
                    {{ order.resource_type === 'vm' ? '云主机' : order.resource_type === 'disk' ? '云硬盘' : '存储桶' }}
                  </div>
                </div>

                <div class="col-auto q-pl-lg">
                  <div class="text-grey">下单时间</div>
                  <div class="text-h6">{{ new Date(order.creation_time).toLocaleString(i18n.global.locale) }}</div>
                </div>

              </div>

              <div class="col-4 row justify-end">

                <div class="col-auto q-pr-lg">
                  <div class="text-grey">应付金额</div>
                  <div class="text-h6">{{ order.pay_amount }}点</div>
                </div>

                <div class="col-auto q-pr-lg">
                  <div class="text-grey">订单状态</div>
                  <div class="text-h6">
                    {{
                      order.status === 'paid' ? '已支付' : order.status === 'unpaid' ? '未支付' : order.status === 'cancelled' ? '取消' : '退款'
                    }}
                  </div>
                </div>

                <q-btn color="primary" unelevated @click="store.payOrderDialog(order.id, isGroup)">支付</q-btn>

              </div>

            </div>

            <div class="q-mt-lg text-grey">资源信息</div>
            <div class="row justify-center section">
              <div class="col-4">

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">CPU</div>
                  <div class="col-shrink">
                    {{ order.instance_config.vm_cpu }}核
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">内存</div>
                  <div class="col-shrink">
                    {{ order.instance_config.vm_ram / 1024 }}GB
                  </div>
                </div>

                <div class="row items-center">
                  <div class="col-3 text-grey">系统磁盘</div>
                  <div class="col-shrink">
                    {{ order.instance_config.vm_systemdisk_size }}GB
                  </div>
                </div>

              </div>

              <div class="col-4">

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">IP地址类型</div>
                  <div class="col-shrink">
                    {{ order.instance_config.vm_public_ip ? '公网' : '私网' }}
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">网段</div>
                  <div class="col-shrink">
                    {{
                      store.tables.serviceNetworkTable.byLocalId[`${order.service_id}-${order.instance_config.vm_network_id}`].name
                    }}
                  </div>
                </div>

                <div class="row items-center">
                  <div class="col-3 text-grey">操作系统</div>
                  <div class="col-shrink">
                    <q-icon
                      v-if="getOsIconName(store.tables.serviceImageTable.byLocalId[`${order.service_id}-${order.instance_config.vm_image_id}`].name)"
                      :name="getOsIconName(store.tables.serviceImageTable.byLocalId[`${order.service_id}-${order.instance_config.vm_image_id}`].name)"
                      flat size="md"/>
                    {{
                      store.tables.serviceImageTable.byLocalId[`${order.service_id}-${order.instance_config.vm_image_id}`].name
                    }}
                  </div>
                </div>

              </div>

              <div class="col-4">

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">所属机构</div>
                  <div class="col-shrink">
                    {{
                      store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[order.service_id].data_center].name
                    }}
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">服务节点</div>
                  <div class="col-shrink">
                    {{
                      store.tables.serviceTable.byId[order.service_id].name
                    }}
                  </div>
                </div>

                <div class="row items-center">
                  <div class="col-3 text-grey">服务类型</div>
                  <div class="col-shrink">
                    <q-icon
                      v-if="store.tables.serviceTable.byId[order.service_id].service_type.toLowerCase().includes('ev')"
                      style="width: 130px;height: 25px">
                      <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 130px;height: 25px"/>
                    </q-icon>

                    <q-icon
                      v-if="store.tables.serviceTable.byId[order.service_id].service_type.toLowerCase().includes('open')"
                      style="width: 130px;height: 25px">
                      <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 130px;height: 25px"/>
                    </q-icon>
                  </div>
                </div>

              </div>

            </div>

            <div class="q-mt-lg text-grey">订单信息</div>
            <div class="row justify-center section">
              <div class="col-4">

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">支付类型</div>
                  <div class="col-shrink">
                    {{ order.pay_type === 'prepaid' ? '预付费' : '后付费' }}
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">支付时间</div>
                  <div class="col-shrink">
                    {{ order.payment_time === null ? '待支付' : order.payment_time }}
                  </div>
                </div>

                <div class="row items-center">
                  <div class="col-3 text-grey">订单类型</div>
                  <div class="col-shrink">
                    {{
                      order.order_type === 'new' ? '新购' : order.order_type === 'renewal' ? '续费' : order.order_type === 'upgrade' ? '升级' : '降级'
                    }}
                  </div>
                </div>

              </div>

              <div class="col-4">

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">订单金额</div>
                  <div class="col-shrink">
                    {{ order.total_amount }}点
                  </div>
                </div>

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">折扣金额</div>
                  <div class="col-shrink">
                    {{ Number.parseFloat(order.total_amount - order.pay_amount).toFixed(2) }}点
                  </div>
                </div>

                <div class="row items-center">
                  <div class="col-3 text-grey">应付金额</div>
                  <div class="col-shrink">
                    {{ order.pay_amount }}点
                  </div>
                </div>

              </div>

              <div class="col-4">

                <div class="row q-pb-md items-center">
                  <div class="col-3 text-grey">下单用户</div>
                  <div class="col-shrink">
                    {{ order.username }}
                  </div>
                </div>

                <div v-if="isGroup" class="row q-pb-md items-center">
                  <div class="col-3 text-grey">所属项目组</div>
                  <div class="col-shrink">
                    <q-btn
                      class="q-ma-none"
                      color="primary"
                      padding="none" flat dense unelevated
                      :label="order.vo_name"
                      @click="navigateToUrl(`/my/server/group/detail/${order.vo_id}`)">
                      <q-tooltip>
                        {{ tc('项目组详情') }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        <!--        <pre>{{ order }}</pre>-->

      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.OrderDetailCard {
}

.title-area {
  width: 1230px;
  text-align: left;
  color: $primary;
  font-size: large;
  font-weight: bold;
}

.content-area {
  width: 1230px;
}

.ip-title {
  font-size: large;
  font-weight: bold;
}

.detail-item {
  padding-bottom: 10px;
}

.section {
  margin-bottom: 30px;
  padding: 10px 20px;
  border: 1px solid $grey-4;
  border-radius: 5px;
}
</style>
