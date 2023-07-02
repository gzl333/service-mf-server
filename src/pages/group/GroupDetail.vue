<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import GroupMemberTable from 'components/group/GroupMemberTable.vue'
import GroupRoleChip from 'components/group/GroupRoleChip.vue'
import ServerTable from 'components/server/ServerTable.vue'
import OrderTable from 'components/order/OrderTable.vue'
import CouponTable from 'components/coupon/CouponTable.vue'

// import CouponRedeemInput from 'components/coupon/CouponRedeemInput.vue'
import GroupDiskList from 'pages/group/GroupDiskList.vue'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
const route = useRoute()
const router = useRouter()
const tc = i18n.global.tc

// url传参
const show = route.query.show as 'server' | 'disk' | 'member' | 'order' | 'coupon' | undefined // 子tab展示哪个部分
// 从route对象中读取id参数
const groupId = route.params.groupId as string

// group对象
const group = computed(() => store.tables.groupTable.byId[groupId])

// groupMember
const groupMember = computed(() => store.tables.groupMemberTable.byId[groupId])

// groupServer
// 根据当前页面需求，更新group server
void store.loadGroupServerTable({
  groupId,
  pageSize: 999
})
// 这个getter很重要，避免快速切换组列表页面时，table内混入了其他组的server
const servers = computed(() => store.getGroupServersByGroupId(groupId))

// groupOrder
// 根据当前页面需求，更新group order
void store.loadGroupOrderTable({
  groupId,
  pageSize: 999
})
const orders = computed(() => store.getGroupOrdersByGroupId(groupId))

// groupCoupon
void store.loadGroupCouponTable({
  groupId,
  pageSize: 999
})
const coupons = computed(() => store.getGroupCouponsByGroupId(groupId))

const tab = ref(show ?? 'server')

const clickToCopy = useCopyToClipboard()

</script>

<template>
  <div class="GroupDetail">
    <div class="column items-center justify-center q-py-md">
      <div class="col q-pa-none">

        <div class="row items-center title-area">
          <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense no-caps
                 @click="router.back()"/>
          <span>{{ tc('pages.group.GroupDetail.group_detail') }}</span>
        </div>

        <!--直接从url进入本页面时，tables尚未载入，应显示loading界面。对取属性进行缓冲，不出现undefined错误-->
        <div class="row content-area">
          <div v-if="!groupMember || !group" class="col">
            {{ tc('pages.group.GroupDetail.loading') }}
          </div>

          <div v-else class="col">

            <div class="row items-center justify-between q-pt-lg">

              <!--              <div class="col-auto column items-start">-->
              <!--                <div class="text-grey q-pa-none" style="font-size: 5px;">{{ tc('代金券') }}</div>-->
              <!--                <CouponRedeemInput style="width: 280px;" :is-group="true" :group-id="groupId"/>-->
              <!--              </div>-->
              <div class="col-auto column items-start">
                <div class="text-grey q-pa-none">{{ tc('pages.group.GroupDetail.name') }}</div>
                <div class="row items-end">
                  <div class="text-h5 text-weight-bold">{{ group.name }}
                  </div>
                </div>
              </div>

              <div class="col-auto column items-end">
                <div class="text-grey q-pa-none">{{ tc('pages.group.GroupDetail.group_account_balance') }}</div>
                <div class="row items-end">
                  <div class="text-h4">{{ group.stats.balance }}</div>
                  <div class="text-h6">{{ tc('pages.group.GroupDetail.points') }}
                  </div>
                </div>
              </div>

            </div>

            <!--项目组详情开始-->
            <div class="row items-start justify-evenly detail-area ">

              <div class="col-auto ">
                <div class="column justify-start items-center" style="min-height: 80px;">
                  <div class="col-2 text-grey">
                    {{ tc('pages.group.GroupDetail.remark') }}
                  </div>
                  <div class="col-10">
                    <div class="row justify-center items-center ellipsis wrap"
                         style="max-width: 200px; min-height: 70px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                      <!--                      {{ group.description.slice(0, 30) }}-->
                      {{ group.description }}
                      <q-tooltip>
                        {{ group.description }}
                      </q-tooltip>
                    </div>
                  </div>

                </div>
              </div>

              <div class="col-auto ">
                <div class="column  justify-start items-center" style="min-height: 80px;">
                  <div class="col-2 text-grey">
                    {{ tc('pages.group.GroupDetail.org') }}
                  </div>
                  <div class="col-10">
                    <div class="row justify-center items-center ellipsis"
                         style="max-width: 200px; min-height: 70px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                      {{ group.company }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-auto ">
                <div class="column justify-start items-center" style="min-height: 80px">
                  <div class="col-2 text-grey">
                    {{ tc('pages.group.GroupDetail.owner') }}
                  </div>
                  <div class="col-10">
                    <div class="row justify-center items-center" style="min-height: 70px">
                      {{ group.owner.username }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-auto ">
                <div class="column justify-start items-center" style="min-height: 80px">
                  <div class="col-2 text-grey">
                    {{ tc('pages.group.GroupDetail.creation_time') }}
                  </div>
                  <div class="col-10">
                    <div class="row justify-center items-center" style="min-height: 70px">

                      <div v-if="i18n.global.locale==='zh'" class="column justify-center items-center">
                        <div class="col">
                          {{ new Date(group.creation_time).toLocaleString(i18n.global.locale as string).split(' ')[0] }}
                        </div>
                        <div class="col">
                          {{ new Date(group.creation_time).toLocaleString(i18n.global.locale as string).split(' ')[1] }}
                        </div>
                      </div>

                      <div v-else class="column justify-center items-center">
                        <div class="col">
                          {{ new Date(group.creation_time).toLocaleString(i18n.global.locale as string).split(',')[0] }}
                        </div>
                        <div class="col">
                          {{ new Date(group.creation_time).toLocaleString(i18n.global.locale as string).split(',')[1] }}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div class="col-auto ">
                <div class="column justify-start items-center" style="min-height: 80px">
                  <div class="col-2 text-grey">
                    {{ tc('pages.group.GroupDetail.my_role') }}
                  </div>
                  <div class="col-10">
                    <div class="row justify-center items-center" style="min-height: 70px">
                      <group-role-chip :role="group.myRole"/>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-auto ">
                <div class="column justify-start items-center" style="min-height: 80px;">
                  <div class="col-2 text-grey">
                    ID
                  </div>
                  <div class="col-10">
                    <div class="row justify-center items-center ellipsis wrap"
                         style="max-width: 100px; min-height: 70px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                      <div class="col-auto">
                        {{ group.id }}
                      </div>
                      <q-btn class="col-shrink q-px-xs q-ma-none" flat no-caps dense icon="content_copy" size="xs"
                             color="primary"
                             @click="clickToCopy(group.id)">
                        <q-tooltip>
                          {{ tc('components.server.ServeTable.copy_to_clipboard') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="group.myRole !== 'member'" class="col-auto ">
                <div class="column justify-start items-center" style="min-height: 80px">
                  <div class="col-2 text-grey">
                    {{ tc('pages.group.GroupDetail.operation') }}
                  </div>
                  <div class="col-10">
                    <div class="row justify-center items-center q-gutter-sm" style="min-height: 70px">

                      <q-btn icon="edit" flat no-caps padding="none" color="primary" size="md"
                             @click="store.editGroupDialog(groupId)">
                        <q-tooltip>{{ tc('pages.group.GroupDetail.edit_group_info') }}</q-tooltip>
                      </q-btn>

                      <q-btn icon="add" flat no-caps padding="none" color="primary" size="md"
                             @click="store.addGroupMemberDialog(groupId)">
                        <q-tooltip>{{ tc('pages.group.GroupDetail.add_member') }}</q-tooltip>
                      </q-btn>

                      <q-btn icon="currency_yuan" flat no-caps padding="none" color="primary" size="md"
                             @click="store.redeemCouponDialog(groupId)">
                        <q-tooltip>{{ tc('pages.group.GroupDetail.redeem_coupon') }}</q-tooltip>
                      </q-btn>

                      <q-btn v-if="group.myRole ==='owner'" icon="group_off" flat no-caps padding="none"
                             color="red" size="md"
                             @click="store.deleteGroupDialog(groupId)">
                        <q-tooltip>{{ tc('pages.group.GroupDetail.delete_group') }}</q-tooltip>
                      </q-btn>

                    </div>
                  </div>
                </div>
              </div>

            </div>
            <!--项目组详情结束-->

            <div class="column items-start q-py-none q-px-none">

              <div class="col-auto">
                <div class="row no-wrap justify-between items-center q-pt-lg  content-area">

                  <q-tabs
                    class="col-auto"
                    v-model="tab"
                    active-color="primary"
                    align="left"
                    inline-label
                  >

                    <q-tab class="q-px-none q-py-none q-mr-md"
                           no-caps
                           :ripple="false"
                           name="server"
                           icon="computer"
                           :label="tc('pages.group.GroupDetail.server')"
                           @click="navigateToUrl(`/my/server/group/detail/${groupId}?show=server`)"/>

                    <q-tab class="q-px-none q-py-none q-mr-md"
                           no-caps
                           :ripple="false"
                           name="disk"
                           icon="mdi-harddisk"
                           :label="tc('云硬盘')"
                           @click="navigateToUrl(`/my/server/group/detail/${groupId}?show=disk`)"/>

                    <q-tab class="q-px-none q-py-none q-mr-md"
                           no-caps
                           :ripple="false"
                           name="member"
                           icon="group"
                           :label="tc('pages.group.GroupDetail.member')"
                           @click="navigateToUrl(`/my/server/group/detail/${groupId}?show=member`)"/>

                    <q-tab class="q-px-none q-py-none q-mr-md"
                           no-caps
                           :ripple="false"
                           name="order"
                           icon="list_alt"
                           :label="tc('pages.group.GroupDetail.order')"
                           @click="navigateToUrl(`/my/server/group/detail/${groupId}?show=order`)"/>

                    <q-tab class="q-px-none q-py-none q-mr-md"
                           no-caps
                           :ripple="false"
                           name="coupon"
                           icon="currency_yuan"
                           :label="tc('pages.group.GroupDetail.coupon')"
                           @click="navigateToUrl(`/my/server/group/detail/${groupId}?show=coupon`)"/>

                  </q-tabs>

                  <q-btn v-show="tab==='member' && group.myRole !== 'member' " class="col-shrink" icon="add" size="md"
                         unelevated no-caps dense padding="xs"
                         color="primary" @click="store.addGroupMemberDialog(groupId)">
                    {{ tc('pages.group.GroupDetail.add_member') }}
                  </q-btn>

                  <q-btn v-show="tab==='server' && group.myRole !== 'member'" class="col-shrink" icon="add" size="md"
                         unelevated dense no-caps padding="xs"
                         color="primary"
                         @click="navigateToUrl(`/my/server/deploy?group=${groupId}`)">
                    {{ tc('pages.group.GroupDetail.create_server') }}
                  </q-btn>

                  <q-btn v-show="tab==='disk' && group.myRole !== 'member'" class="col-shrink" icon="add" size="md"
                         unelevated dense no-caps padding="xs"
                         color="primary"
                         @click="navigateToUrl(`/my/server/deploy/disk?group=${groupId}`)">
                    {{ tc('新建云硬盘') }}
                  </q-btn>

                  <q-btn v-show="tab==='coupon'" class="col-shrink" icon="currency_yuan" size="md"
                         unelevated dense no-caps padding="xs"
                         color="primary"
                         @click="store.redeemCouponDialog(groupId)">
                    {{ tc('pages.group.GroupDetail.redeem_coupon') }}
                  </q-btn>

                </div>

                <q-separator/>

              </div>
              <div class="col-auto content-area">
                <q-tab-panels v-model="tab">

                  <q-tab-panel class="q-pa-none overflow-hidden" name="server">
                    <server-table :servers="servers" is-group is-hide-group/>
                  </q-tab-panel>

                  <q-tab-panel class="q-pa-none overflow-hidden" name="disk">
                   <group-disk-list :group="group"/>
                  </q-tab-panel>

                  <q-tab-panel class="q-pa-none overflow-hidden" name="member">
                    <group-member-table :group-id="group.id"/>
                  </q-tab-panel>

                  <q-tab-panel class="q-pa-none overflow-hidden" name="order">
                    <OrderTable :orders="orders" :isGroup="true" :isHideGroup="true"/>
                  </q-tab-panel>

                  <q-tab-panel class="q-pa-none overflow-hidden" name="coupon">
                    <CouponTable :coupons="coupons" :isGroup="true" :isHideGroup="true"/>
                  </q-tab-panel>

                </q-tab-panels>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.GroupDetail {
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

.detail-area {
  margin-top: 10px;
  padding: 15px 0;
  //min-height: 100px;
  border: $grey-4 1px solid;
  border-radius: 5px;
}
</style>
