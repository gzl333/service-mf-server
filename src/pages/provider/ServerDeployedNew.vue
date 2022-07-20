<script setup lang="ts">
import { ref, computed } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

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
// const router = useRouter()

const searchFactors = ref<string[]>([])

// service_id下拉列表
const serviceOptions = computed(() => store.getServiceOptions)
const serviceSelection = ref('0')

</script>

<template>
  <div class="ServerDeployed">

    <!--    <div class="row content-area">-->

    <div class="row">
      {{ tc('pages.provider.ServerDeployedNew.search_condition') }}:
    </div>
    <!--项目组详情开始-->
    <div class="row items-center justify-evenly detail-area">

      <div class="col-auto row items-center">
        <q-checkbox v-model="searchFactors" val="ip" color="primary">
          {{ tc('pages.provider.ServerDeployedNew.ip_address') }}
        </q-checkbox>
        <q-input outlined dense/>
      </div>

      <div class="col-auto row items-center">
        <q-checkbox v-model="searchFactors" val="username" color="primary">
          {{ tc('pages.provider.ServerDeployedNew.user_account') }}
        </q-checkbox>
        <q-input outlined dense/>
      </div>

      <div class="col-auto row items-center">
        <q-checkbox v-model="searchFactors" val="vo" color="primary">
          {{ tc('pages.provider.ServerDeployedNew.group_id') }}
        </q-checkbox>
        <q-input outlined dense/>
      </div>

      <div class="col-auto row items-center">
        <q-checkbox v-model="searchFactors" val="service" color="primary">
          {{ tc('pages.provider.ServerDeployedNew.service_node') }}
        </q-checkbox>
        <q-select outlined dense stack-label :label="tc('pages.provider.ServerDeployedNew.service_node_filter')" v-model="serviceSelection"
                  :options="serviceOptions" emit-value map-options option-value="value"
                  :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
          <!--当前选项的内容插槽-->
          <template v-slot:selected-item="scope">
                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
          </template>
        </q-select>
      </div>

    </div>

    <!--    </div>-->

  </div>
</template>

<style lang="scss" scoped>
.ServerDeployed {
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
  width: 1230px;
  margin-top: 10px;
  padding: 15px 0;
  height: 120px;
  border: $grey-4 1px solid;
  border-radius: 5px;
}
</style>
