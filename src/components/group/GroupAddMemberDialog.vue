<script setup lang="ts">
import { ref, reactive/* , computed */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { useDialogPluginComponent, Notify, QSelect } from 'quasar'
import api from 'src/api'
import { navigateToUrl } from 'single-spa'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

import type { UserInterface } from 'stores/store'

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

// old inputs
// const usernames = reactive<Record<string, string>>({ 1: '' })

// count
const userCount = ref(1)
// user select 选择结果
const userModels = reactive<Record<string, UserInterface | null>>({ 1: null })
// user options
const userOptions = ref<UserInterface[]>()

// q-select的筛选函数
const userFilter = async (
  val: string,
  update: (arg0: () => Promise<void>, arg1: (ref: QSelect) => void) => void, abort: () => void
) => {
  // 从第几位输入开始获取列表
  if (val.length < 1) {
    abort()
    return
  }
  // update是回调函数注册器：参数为在select的输入有变化时调用的回调函数
  update(async () => {
    const respUsers = await api.server.user.getUser({ query: { search: val } })
    userOptions.value = respUsers.data.results
  },
  // "ref" is the Vue reference to the QSelect
  ref => {
    if (val !== '' && ref.options!.length > 0 && ref.getOptionIndex() === -1) {
      ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
      ref.toggleOption(ref.options![ref.getOptionIndex()], true) // toggle the focused option
    }
  }
  )
}

// 账户数量变化
const addCount = () => {
  if (userCount.value >= 10) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('components.group.GroupAddMemberDialog.notify_max_members')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  userCount.value += 1
  Object.assign(userModels, { [userCount.value]: null })
  // userModels[userCount.value.toString()] = null
}

const subCount = () => {
  if (userCount.value === 1) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('最少增加1个成员')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  delete userModels[userCount.value.toString()]
  userCount.value -= 1
}

// 点击ok的事件函数
const onOKClick = async () => {
  // 去除空白填写
  const usernameArray = [...new Set(Object.values(userModels).filter(user => user !== null).map(user => user!.username))]

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
  // 正则检查email格式

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

            <!--            <q-input outlined dense v-model.trim="usernames[index.toString()]" autofocus>-->
            <!--              <template v-slot:append>-->
            <!--                <q-icon v-if="usernames[index.toString()] !== ''" name="close" @click="usernames[index.toString()] = ''"-->
            <!--                        class="cursor-pointer"/>-->
            <!--              </template>-->
            <!--            </q-input>-->

            <q-select
              v-model="userModels[index.toString()]"
              :options="userOptions"
              @filter="userFilter"
              label-color="grey"
              :label="tc('请输入关键字，并选择用户名')"
              outlined
              dense
              use-input
              fill-input
              hide-selected
              clearable
              input-debounce="0"
              option-value="id"
              option-label="username"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ tc('暂无筛选结果') }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

          </div>
        </div>

        <div class="row justify-center items-center q-gutter-md">
          <q-btn class="text-center col-auto" flat no-caps padding="none" icon="add" color="primary"
                 @click="addCount">
            {{ tc('components.group.GroupAddMemberDialog.more_accounts') }}
          </q-btn>
          <q-btn class="text-center col-auto" flat no-caps padding="none" icon="remove" color="primary"
                 @click="subCount">
            {{ tc('更少账户') }}
          </q-btn>
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
