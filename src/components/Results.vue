<script setup lang="ts">
import { downloadTextAsFile } from '@/modules/util'
import { queryProviderKey } from '@/stores/query'
import { ActorQueryResultSerializeSparqlCsv } from '@comunica/actor-query-result-serialize-sparql-csv'
import { useLocalStorage } from '@vueuse/core'
import { inject, computed } from 'vue'

const { results, possiblyIncomplete, errorMessage, progressText, running } =
  inject(queryProviderKey)!

const columns = computed(() => Array.from(results.value?.[0]?.keys() ?? []))

const isWrapping = useLocalStorage('isWrapping', true)

function downloadResults() {
  if (results.value.length > 0) {
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
  <div v-if="results.length === 0 && !running" class="centered">
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

      <div v-if="results.length > 0" :style="{ display: 'flex', gap: '0.5rem' }">
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
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.value">{{ column.value }}</th>
          </tr>
        </thead>
        <tbody :class="{ 'dont-wrap-cells': !isWrapping }">
          <tr v-for="result in results" :key="result.values().toString">
            <td v-for="column in columns" :key="column.toString">
              {{ result.get(column)?.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
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

.table-wrapper {
  flex: 1;
  min-height: 0px;
  height: 100%;
  margin: 0 -0.75rem -0.75rem -0.75rem;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--p-slate-50);
  overflow: auto;
}

thead {
  background-color: var(--p-slate-200);
  box-shadow: 0px 3px 0px 0px var(--p-slate-300);
  position: sticky;
  top: 0px;
}

thead th {
  font-weight: 500;
}

thead th,
td {
  padding: 0.375rem 0.5rem;
  text-align: left;
  vertical-align: bottom;
}

tbody.dont-wrap-cells td {
  white-space: nowrap;
}

tr:not(:last-of-type) > td {
  border-bottom: 1px solid var(--p-slate-300);
}
</style>
