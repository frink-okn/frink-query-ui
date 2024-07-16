<script setup lang="ts">
import { downloadTextAsFile } from '@/modules/util'
import { queryProviderKey } from '@/stores/query'
import RDFTermDisplay from '@/components/RDFTermDisplay.vue'
import { ActorQueryResultSerializeSparqlCsv } from '@comunica/actor-query-result-serialize-sparql-csv'
import { useLocalStorage } from '@vueuse/core'
import { inject, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { Bindings } from '@comunica/types'

const { results, columns, possiblyIncomplete, errorMessage, progressText, running } =
  inject(queryProviderKey)!

const isWrapping = useLocalStorage('isWrapping', true)

function downloadResults() {
  if (results.value && results.value.length > 0) {
    const variables = Array.from(results.value[0].keys())
    const header = `${variables.map((v) => v.value).join(',')}\r\n`
    const body = results.value
      .map(
        (result) =>
          `${variables
            .map((v) => ActorQueryResultSerializeSparqlCsv.bindingToCsvBindings(result.get(v)))
            .join(',')}\r\n`
      )
      .join('')
    downloadTextAsFile([header, body], 'sparql-results.csv', 'text/csv')
  }
}
</script>

<template>
  <div v-if="!results && !running" class="centered">
    <p>Please run a query to view the results here.</p>
  </div>
  <div v-else class="flex">
    <header :style="{ display: 'flex' }">
      <div :style="{ flex: 1 }">
        <div>
          {{ progressText }}
          <span v-if="possiblyIncomplete" :style="{ fontStyle: 'italic' }">
            Possibly incomplete!
          </span>
        </div>
        <div v-if="errorMessage.length > 0" :style="{ color: 'var(--p-rose-500)' }">
          {{ errorMessage }}
        </div>
      </div>
      <div v-if="results && results.length > 0" :style="{ display: 'flex', gap: '0.5rem' }">
        <Button
          v-tooltip.left="'Toggle cell content wrapping'"
          @click="isWrapping = !isWrapping"
          icon="pi pi-align-justify"
          severity="secondary"
        />
        <Button
          v-tooltip.left="'Download results'"
          @click="downloadResults()"
          icon="pi pi-download"
        />
      </div>
    </header>
    <DataTable
      :value="results"
      removableSort
      paginator
      :resizableColumns="true"
      columnResizeMode="expand"
      scrollable
      scrollHeight="flex"
      :rows="50"
      height
      :pt="{
        tableContainer: {
          style: { minHeight: 0, height: '100%' }
        }
      }"
    >
      <Column
        v-for="column in columns"
        :key="column.value"
        :field="column.value"
        :header="column.value"
        :sortable="true"
        :sortField="(item: Bindings) => item.get(column)?.value ?? ''"
        ><template #body="slotProps"
          ><div :class="{ 'wrap-cells': isWrapping }">
            <RDFTermDisplay :term="slotProps.data.get(column)" /></div></template
      ></Column>
    </DataTable>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
}

.p-datatable {
  flex: 1;
  min-height: 0px;
  margin: 0 -0.75rem -0.75rem -0.75rem;
}

.run-query-message {
  padding: 4px 0px;
}

.centered {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.centered > p {
  margin: 0;
  font-style: italic;
  font-size: 1.5rem;
  color: var(--p-slate-400);
}

.wrap-cells {
  white-space: wrap;
}
</style>
