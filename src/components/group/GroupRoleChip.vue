<script setup lang="ts">
// import { ref, computed } from "vue"
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

const props = defineProps({
  role: {
    type: String,
    required: true
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc/* , locale  */ } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

</script>

<template>
  <div class="GroupRoleChip">

    <q-chip v-if="props.role === 'owner'"
            square color="light-green" text-color="white" icon="mdi-account-star">
      <div style=" width: 45px;text-align: center">
        {{ tc('components.group.GroupRoleChip.group_leader') }}
      </div>
    </q-chip>

    <q-chip v-if="props.role === 'leader'"
            square color="teal" text-color="white" icon="mdi-account-tie">
      <div style=" width: 45px;text-align: center">
        {{ tc('components.group.GroupRoleChip.admin') }}
      </div>
    </q-chip>

    <q-chip v-if="props.role === 'member'"
            square color="blue-grey" text-color="white" icon="mdi-account">
      <div style=" width: 45px;text-align: center">
        {{ tc('components.group.GroupRoleChip.group_members') }}
      </div>
    </q-chip>

  </div>
</template>

<style lang="scss" scoped>
.GroupRoleChip {
}
.chip {
  width: 100px;
  //text-align: center;
}
</style>
