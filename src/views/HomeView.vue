<script setup lang="ts">
import { computed, ref, type Ref, watch } from 'vue'
import { QueryEngine } from '@comunica/query-sparql'
import { type Bindings, type BindingsStream } from '@comunica/types'
import SourceSelector from '@/components/SourceSelector.vue'
import { ArrayIterator } from 'asynciterator'
import { ActorQueryResultSerializeSparqlCsv } from '@comunica/actor-query-result-serialize-sparql-csv'
import { downloadTextAsFile, asBindings } from '@/modules/util'

const query = ref('')
const engine = new QueryEngine()
const queryContext = ref({
  sources: [{ type: 'sparql', value: 'https://frink.apps.renci.org/federation/sparql' }]
})
const results: Ref<Array<Bindings>> = ref([])
const bindingsStream = ref<BindingsStream>(new ArrayIterator<Bindings>([]))
const running = ref(false)
const possiblyIncomplete = ref(false)
const notReadyToRun = computed(
  () => queryContext.value.sources.length < 1 || query.value.trim().length < 1
)
const errorMessage: Ref<string> = ref('')
const columns = computed(() => {
  if (results.value.length > 0) {
    return Array.from(results.value[0].keys())
  } else {
    return []
  }
})
const startTime: Ref<Date | undefined> = ref()
const stopTime: Ref<Date | undefined> = ref()
let updateTimerHandle = setInterval(() => {}, 2147483647)

async function executeQuery() {
  if (queryContext.value.sources.length < 1) return
  results.value = []
  errorMessage.value = ''
  // @ts-expect-error
  const result = await engine.query(query.value, queryContext.value).catch((error) => {
    running.value = false
    possiblyIncomplete.value = true
    errorMessage.value = error.toLocaleString()
  })
  if (result) {
    switch (result.resultType) {
      case 'bindings':
        bindingsStream.value = await result.execute()
        break
      case 'quads':
        bindingsStream.value = (await result.execute()).map(asBindings)
        break
      case 'boolean':
        bindingsStream.value = new ArrayIterator<Bindings>([asBindings(await result.execute())])
        break
    }
    running.value = true
    bindingsStream.value.on('data', (item) => results.value.push(item))
    bindingsStream.value.on('end', () => {
      running.value = false
      possiblyIncomplete.value = false
    })
    bindingsStream.value.on('error', (error) => {
      running.value = false
      possiblyIncomplete.value = true
      errorMessage.value = error.toLocaleString()
    })
  }
}

watch(running, (newRunning, oldRunning) => {
  if (newRunning) {
    startTimer()
  } else {
    stopTimer()
  }
})

function stopQuery() {
  if (!bindingsStream.value.done) possiblyIncomplete.value = true
  bindingsStream.value?.destroy()
  running.value = false
}

function startTimer() {
  startTime.value = new Date()
  stopTime.value = undefined
  updateTimerHandle = setInterval(() => (stopTime.value = new Date()), 100)
}

function stopTimer() {
  clearInterval(updateTimerHandle)
  stopTime.value = new Date()
}

const progressText = computed(() => {
  const count = results.value.length
  const start = startTime.value
  const end = stopTime.value
  const elapsed = start !== undefined && end !== undefined ? end.valueOf() - start.valueOf() : 0
  return `${count.toLocaleString()} result${count === 1 ? '' : 's'} in ${(elapsed / 1000).toFixed(1)}s`
})

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
  <main>
    <SourceSelector
      @change="
        (sources) => {
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
      <button v-else @click="executeQuery" :disabled="notReadyToRun">Run Query</button>
      <p v-if="errorMessage.length > 0" class="error">{{ errorMessage }}</p>
    </div>
    <hr />
    <div id="results">
      <h2>
        Results <small v-if="!running && possiblyIncomplete">&lt;possibly incomplete&gt;</small>
      </h2>
      <p>{{ progressText }}</p>
      <p>
        <button @click="downloadResults" :disabled="running || results.length === 0">
          Download Results
        </button>
      </p>
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
.error {
  color: var(--red-600);
  border-color: var(--red-600);
}
</style>
