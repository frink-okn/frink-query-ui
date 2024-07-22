<script setup lang="ts">
import PageWrapper from '@/components/PageWrapper.vue'
import { savedQueriesProviderKey } from '@/stores/savedQueries'
import { inject, ref } from 'vue'

const { savedQueries, deleteAllQueries } = inject(savedQueriesProviderKey)!

const popover = ref()
const togglePopover = (event: any) => {
  popover.value.toggle(event)
}
</script>

<template>
  <PageWrapper title="Settings">
    <h4>Saved Queries</h4>
    <hr />
    <label>
      Delete all saved queries
      <Button
        label="Delete"
        severity="danger"
        :disabled="savedQueries.length === 0"
        @click="togglePopover"
        v-tooltip="savedQueries.length === 0 ? 'No queries to delete.' : undefined"
      />
    </label>
  </PageWrapper>

  <Popover ref="popover">
    <p :style="{ margin: '0px', marginBottom: '0.5rem' }">Are you sure?</p>
    <div :style="{ display: 'flex', gap: '0.5rem' }">
      <Button
        label="Cancel"
        @click="togglePopover"
        severity="secondary"
        size="small"
        :style="{ flex: '1' }"
      />
      <Button
        label="Delete"
        @click="
          (e: MouseEvent) => {
            deleteAllQueries()
            togglePopover(e)
          }
        "
        size="small"
        severity="danger"
        icon="pi pi-trash"
        iconPos="right"
        :style="{ flex: '1' }"
      />
    </div>
  </Popover>
</template>

<style scoped>
h4:first-of-type {
  margin-top: 0.5rem;
}

hr {
  margin: 1rem 0;
}

@media (max-width: 800px) {
  hr {
    margin: 0.5rem 0;
  }
}

label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.5rem 0px;
}
</style>
