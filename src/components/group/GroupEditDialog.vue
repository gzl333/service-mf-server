<script setup lang="ts">
import { ref/* , computed */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { useDialogPluginComponent } from 'quasar'

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

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

// 以下写法是否正确？
// const groupName = ref(computed(() => $store.state.account.tables.groupTable.byId[props.groupId].name).value)
const groupName = ref(store.tables.groupTable.byId[props.groupId].name)
const groupCompany = ref(store.tables.groupTable.byId[props.groupId].company)
const groupDescription = ref(store.tables.groupTable.byId[props.groupId].description)

// 点击ok的事件函数
const onOKClick = () => {
  // payload是传给onOK的实参, data从这里传到action里面
  onDialogOK({
    name: groupName.value,
    company: groupCompany.value,
    description: groupDescription.value
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
        <div class="text-h6 q-pb-lg">{{ tc('components.group.GroupEditDialog.edit_group_information') }}</div>
      </q-card-section>

      <q-card-section>
        <div class="row items-center q-pb-md">
          <div class="col-2 text-grey q-pb-md">{{ tc('components.group.GroupEditDialog.group_name') }}</div>
          <div class="col">
            <q-input outlined dense v-model="groupName" maxlength="15" counter/>
          </div>
        </div>

        <div class="row items-center q-pb-md">
          <div class="col-2 text-grey q-pb-md">{{ tc('components.group.GroupEditDialog.affiliation') }}</div>
          <div class="col">
            <q-input outlined dense v-model="groupCompany" maxlength="15" counter/>
          </div>
        </div>

        <div class="row items-center q-pb-md">
          <div class="col-2 text-grey q-pb-md">{{ tc('components.group.GroupEditDialog.remarks') }}</div>
          <div class="col">
            <q-input outlined dense v-model="groupDescription" maxlength="15" counter/>
          </div>
        </div>
      </q-card-section>

      <!-- buttons example -->
      <q-card-actions align="right">
        <q-btn color="primary" unelevated @click="onDialogCancel">
          {{ tc('components.group.GroupEditDialog.cancel') }}
        </q-btn>
        <q-btn color="primary" outline @click="onOKClick">
          {{ tc('components.group.GroupEditDialog.confirm') }}
        </q-btn>
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
