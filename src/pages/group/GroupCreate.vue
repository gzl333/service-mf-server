<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
import { /* useRoute,  */useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

// @ts-expect-error
import { useStoreMain } from '@cnic/main'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
const router = useRouter()
const storeMain = useStoreMain()

// 返回上一页
const goBack = () => {
  router.go(-1)
}

const groupName = ref('')
const groupDesc = ref('')
const groupCompany = ref(computed(() => storeMain.items.tokenDecoded?.orgName).value)

</script>

<template>
  <div class="GroupCreate">
    <div class="column items-center justify-center q-py-md">
      <div class="col q-pa-none">

        <div class="row title-area">
          <div class="col">
            <q-btn icon="arrow_back_ios" color="primary" flat unelevated dense
                   @click="goBack"/>
            新建项目组
          </div>
        </div>

        <div class="column content-area q-pt-lg">

          <div class="col">

            <div class="row items-center q-pb-md">
              <div class="col-1 text-grey q-pb-md">
                项目组名称
              </div>
              <div class="col-3">
                <q-input outlined dense v-model="groupName" maxlength="15" counter>
                  <template v-if="groupName !== ''" v-slot:append>
                    <q-icon name="close" @click="groupName = ''" class="cursor-pointer"/>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row items-center q-pb-md">
              <div class="col-1 text-grey q-pb-md">
                项目组描述
              </div>
              <div class="col-3">
                <q-input outlined dense v-model="groupDesc" maxlength="15" counter>
                  <template v-if="groupDesc !== ''" v-slot:append>
                    <q-icon name="close" @click="groupDesc = ''" class="cursor-pointer"/>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row items-center q-pb-md">
              <div class="col-1 text-grey q-pb-md">
                所属单位
              </div>
              <div class="col-3">
                <q-input outlined dense v-model="groupCompany" maxlength="15" counter>
                  <template v-if="groupCompany !== ''" v-slot:append>
                    <q-icon name="close" @click="groupCompany = ''" class="cursor-pointer"/>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row items-center q-pt-lg ">
              <div class="col-1">
                <q-btn outline color="primary"
                       @click="store.createGroupDialog({name: groupName, company: groupCompany, description: groupDesc})">
                  {{ tc('创建') }}
                </q-btn>
              </div>
              <div class="col-3">
                <q-btn unelevated color="primary" @click="goBack">
                  {{ tc('放弃') }}
                </q-btn>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.GroupCreate {
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
  height: 120px;
  border: $grey-4 1px solid;
  border-radius: 5px;
}
</style>
