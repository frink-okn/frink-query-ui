<script setup lang="ts">
import { queryProvivderKey } from '@/stores/query'
import { ref, inject, computed, watch } from 'vue'

const {
  results,
  running,
  possiblyIncomplete,
  errorMessage,
} = inject(queryProvivderKey)!

const columns = computed(() => {
  if (results.value.length > 0) {
    return Array.from(results.value[0].keys())
  } else {
    return []
  }
})

const jsonResults = computed(() =>
  results.value.map((result) =>
    columns.value.reduce(
      (row, currentCol) => {
        row[currentCol.value] = result.get(currentCol)?.value ?? ''
        return row
      },
      {} as Record<string, string>
    )
  )
);

const startTime = ref<Date | undefined>();
const stopTime = ref<Date | undefined>();
let updateTimerHandle = setInterval(() => {}, 2147483647);
const startTimer = () => {
  startTime.value = new Date();
  stopTime.value = undefined;
  updateTimerHandle = setInterval(() => (stopTime.value = new Date()), 100);
}
const stopTimer = () => {
  clearInterval(updateTimerHandle);
  stopTime.value = new Date();
}
watch(running, (newRunning) => {
  newRunning ? startTimer() : stopTimer()
});

const progressText = computed(() => {
  const count = results.value.length
  const start = startTime.value
  const end = stopTime.value
  const elapsed = start !== undefined && end !== undefined ? end.valueOf() - start.valueOf() : 0
  return `${count.toLocaleString()} result${count === 1 ? '' : 's'} in ${(elapsed / 1000).toFixed(1)}s`
});
</script>

<template>
  <div class="flex">
    <div>
      <div>{{ progressText }}</div>
      <div v-if="possiblyIncomplete">Possibly incomplete!</div>
      <div v-if="errorMessage.length > 0">{{ errorMessage }}</div>
    </div>
    <DataTable
      class="table"
      :value="jsonResults"
      size="medium"
      scrollable
      removableSort
      height
      :pt="{
        tableContainer: {
          style: { minHeight: 0, height: '100%' }
        }
      }"
    >
      <Column
        v-for="col in columns"
        :field="col.value"
        :header="col.value"
        :key="col.value"
        sortable
      />
    </DataTable>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table {
  flex: 1;
  min-height: 0px;
  margin: 0 -0.75rem -0.75rem -0.75rem;
  --p-datatable-column-title-font-weight: 500;
}
</style>
