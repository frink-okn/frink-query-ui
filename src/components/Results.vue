<script setup lang="ts">
import { queryProvivderKey } from '@/stores/query'
import { inject, computed } from 'vue'

const {
  results,
  possiblyIncomplete,
  errorMessage,
  progressText,
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
</script>

<template>
  <div class="flex">
    <div>
      <div>
        {{ progressText }}
        <span v-if="possiblyIncomplete" :style="{ fontStyle: 'italic' }">
          Possibly incomplete!
        </span>
      </div>
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
