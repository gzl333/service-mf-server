<template>
  <q-page class="row items-center justify-evenly">
    <div class="row justify-center text-primary">
      @cnic/server
    </div>

    <div>localGet{{ localCount }}</div>
    <div>computedCount {{ computedCount }}</div>

    <q-btn label="get new count" @click="click"/>

    <div>countRef {{ countRef }}</div>

    <div class="row justify-center">
      <example-component
        title="Example component"
        active
        :todos="todos"
        :meta="meta"
      ></example-component>
    </div>

  </q-page>
</template>

<script lang="ts">
import { Todo, Meta } from 'components/models'
import ExampleComponent from 'components/CompositionComponent.vue'
import { computed, defineComponent, ref, watch } from 'vue'

import { getCount, countRef } from 'src/single-spa-entry'

export default defineComponent({
  name: 'PageIndex',
  components: { ExampleComponent },
  setup () {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    const computedCount = computed(() => getCount())

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    const localCount = ref(0)
    const click = () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
      localCount.value = getCount()
    }

    console.log(countRef)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    watch(countRef, () => console.log('updating:', countRef.value))

    const todos = ref<Todo[]>([
      {
        id: 1,
        content: 'ct1'
      },
      {
        id: 2,
        content: 'ct2'
      },
      {
        id: 3,
        content: 'ct3'
      },
      {
        id: 4,
        content: 'ct4'
      },
      {
        id: 5,
        content: 'ct5'
      }
    ])
    const meta = ref<Meta>({
      totalCount: 1200
    })
    return {
      todos,
      meta,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      click,
      localCount,
      computedCount,
      countRef
    }
  }
})
</script>
