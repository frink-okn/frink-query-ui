<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { QueryEngine } from '@comunica/query-sparql'
import { type Bindings, type BindingsStream } from '@comunica/types'
import SourceSelector from '@/components/SourceSelector.vue'

const query = ref('')
const engine = new QueryEngine()
const queryContext = ref({
  sources: [{ type: 'sparql', value: 'https://frink.apps.renci.org/federation/sparql' }]
})
const results: Ref<Array<Bindings>> = ref([])
const bindingsStream = ref<BindingsStream>()
const running = ref(false)
const columns = computed(() => {
  if (results.value.length > 0) {
    return Array.from(results.value[0].keys())
  } else {
    return []
  }
})
async function executeQuery() {
  results.value = []
  // @ts-expect-error
  bindingsStream.value = await engine.queryBindings(query.value, queryContext.value)
  running.value = true
  bindingsStream.value.on('data', (item) => results.value.push(item))
  bindingsStream.value.on('end', () => (running.value = false))
}
function stopQuery() {
  bindingsStream.value?.destroy()
  bindingsStream.value = undefined
  running.value = false
}
</script>

<template>
  <main>
    <SourceSelector
      @change="
        (sources) => {
          console.log(sources)
          queryContext = sources
        }
      "
    />
    <div id="query-panel">
      <h2>Query</h2>
      <textarea
        id="query-input"
        v-model="query"
        placeholder="Enter your SPARQL query here"
      ></textarea>
      <button v-if="running" @click="stopQuery" class="stop">Stop Query</button>
      <button v-else @click="executeQuery">Run Query</button>
    </div>
    <hr />
    <div id="results">
      <h2>Results</h2>
      <p><button :disabled="running || results.length === 0">Download Results</button></p>
      <table>
        <tr>
          <th v-for="column in columns" :key="column.value">{{ column.value }}</th>
        </tr>
        <tr v-for="result in results" :key="result.values().toString">
          <td v-for="column in columns" :key="column.toString">
            {{ result.get(column)?.value }}
          </td>
        </tr>
      </table>
    </div>
  </main>
</template>

<style scoped>
#query-input {
  width: 100%;
  height: 20em;
  font-family: monospace;
  margin-bottom: 0.5em;
}
.stop {
  background-color: var(--red);
}
.stop:hover {
  background-color: var(--red-600);
  border-color: var(--red-600);
}
</style>
