<script setup lang="ts">
import { ref, reactive/* , computed */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { useDialogPluginComponent, Notify } from 'quasar'
import api from 'src/api'
import { navigateToUrl } from 'single-spa'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

/* const props =  */
const props = defineProps({
  groupId: {
    type: String,
    required: true
  }
})
/* const emits =  */
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

const usernames = reactive<Record<string, string>>({ 1: '' })
const userCount = ref(1)
const addCount = () => {
  if (userCount.value >= 10) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.group.GroupAddMemberDialog.notify_max_members')}`,
      position: 'bottom',
      // closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  userCount.value += 1
  usernames[userCount.value.toString()] = ''
}

// 点击ok的事件函数
const onOKClick = async () => {
  // 去除空白填写
  const usernameArray = Object.values(usernames).filter(username => username !== '')

  // 检查数据，空数组不发送请求
  if (usernameArray.length === 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.group.GroupAddMemberDialog.notify_account')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  // todo 正则检查email格式

  try {
    // 发送patch请求
    const respPostAddMembers = await api.server.vo.postVoAddMembers({
      path: { id: props.groupId },
      body: { usernames: usernameArray }
    })
    // 此请求可能有多个成功，多个失败混在一起。因此不能用状态码判断。
    // 把成功的账户member信息存入table
    for (const member of respPostAddMembers.data.success) {
      // 存入单个member
      // 增加成员，修改角色用。为了避免数组有重复，采取以下逻辑：
      // 删掉已有的同名member
      store.tables.groupMemberTable.byId[props.groupId].members = store.tables.groupMemberTable.byId[props.groupId].members.filter((memberGroup) => {
        return memberGroup.user.username !== member.user.username
      })
      // 增加新拿到的member
      store.tables.groupMemberTable.byId[props.groupId].members.unshift(member)
      // 通知：单个member成功信息
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'mdi-check-circle',
        textColor: 'positive',
        message: `${tc('store.notify.add_group_member_success')}: ` + member.user.username,
        position: 'bottom',
        // closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
    }
    // 通知：失败账户错误信息
    for (const member of respPostAddMembers.data.failed) {
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'mdi-alert',
        textColor: 'negative',
        message: `${tc('store.notify.add_group_member_fail')}.` + member.message + ': ' + member.username,
        position: 'bottom',
        // closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
    }
    // onDialogOK仅作为关闭dialog的函数使用
    onDialogOK()
    // 跳转到成员列表
    navigateToUrl('/my/server/group/detail/' + props.groupId + '?show=member')
  } catch (exception) {
    exceptionNotifier(exception)
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="q-dialog-plugin dialog-primary">
      <!--
        ...content
        ... use q-card-section for it?
      -->
      <q-card-section>
        <div class="text-h6 q-pb-lg">{{ tc('components.group.GroupAddMemberDialog.add_members') }}</div>
      </q-card-section>

      <q-card-section>
        <div class="row items-center q-pb-md">
          <div class="col-3 text-grey">{{ tc('components.group.GroupAddMemberDialog.group_name') }}</div>
          <div class="col">
            {{ store.tables.groupTable.byId[groupId]?.name }}
          </div>
        </div>

        <div v-for="index in userCount" :key="index" class="row items-center q-pb-md">
          <div class="col-3 text-grey">{{ tc('components.group.GroupAddMemberDialog.user_account') }} {{ index }}</div>
          <div class="col">
            <q-input outlined dense v-model.trim="usernames[index.toString()]" autofocus>
              <template v-slot:append>
                <q-icon v-if="usernames[index.toString()] !== ''" name="close" @click="usernames[index.toString()] = ''"
                        class="cursor-pointer"/>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row justify-center items-center">
          <div class="col-auto">
            <q-btn class="text-center" flat no-caps padding="none" icon="add" color="primary"
                   @click="addCount">
              {{ tc('components.group.GroupAddMemberDialog.more_accounts') }}
            </q-btn>
          </div>
        </div>

      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn color="primary" unelevated no-caps @click="onDialogCancel">
          {{ tc('components.group.GroupAddMemberDialog.cancel') }}
        </q-btn>
        <q-btn color="primary" outline no-caps @click="onOKClick">
          {{ tc('components.group.GroupAddMemberDialog.confirm') }}
        </q-btn>
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
