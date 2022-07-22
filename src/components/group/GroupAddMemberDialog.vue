<script setup lang="ts">
import { ref, reactive/* , computed */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { useDialogPluginComponent, Notify } from 'quasar'

/* const props =  */
defineProps({
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

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const usernames = reactive<Record<string, string>>({})
const userCount = ref(1)
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
  usernames[userCount.value.toString()] = ''
}

// 点击ok的事件函数
const onOKClick = () => {
  // 检查数据，空数组不发送请求
  // todo 正则检查email格式
  if (Object.values(usernames).length === 0) {
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

  // payload是传给onOK的实参, data从这里传到action里面
  onDialogOK({
    // groupId: props.groupId,
    usernames: Object.values(usernames)
  })
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
        <div class="text-h6 q-pb-lg">{{tc('components.group.GroupAddMemberDialog.add_members')}}</div>
      </q-card-section>

      <q-card-section>
        <div class="row items-center q-pb-md">
          <div class="col-3 text-grey">{{tc('components.group.GroupAddMemberDialog.group_name')}}</div>
          <div class="col">
            {{ store.tables.groupTable.byId[groupId]?.name }}
          </div>
        </div>

        <div v-for="index in userCount" :key="index" class="row items-center q-pb-md">
          <div class="col-3 text-grey">{{tc('components.group.GroupAddMemberDialog.user_account')}} {{ index }}</div>
          <div class="col">
            <q-input outlined dense v-model="usernames[index.toString()]" autofocus/>
          </div>
        </div>

        <div class="row justify-center items-center">
          <div class="col-auto">
            <q-btn class="text-center" flat padding="none" icon="add" color="primary"
                   @click="addCount">
              {{tc('components.group.GroupAddMemberDialog.more_accounts')}}
            </q-btn>
          </div>
        </div>

      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn color="primary" unelevated @click="onDialogCancel">
          {{ tc('components.group.GroupAddMemberDialog.cancel') }}
        </q-btn>
        <q-btn color="primary" outline @click="onOKClick">
          {{ tc('components.group.GroupAddMemberDialog.confirm') }}
        </q-btn>
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
