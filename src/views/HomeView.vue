<script setup lang="ts">
import { computed, ref, type Ref, watch, onMounted } from 'vue'
import { QueryEngine } from '@comunica/query-sparql'
import { type Bindings, type BindingsStream } from '@comunica/types'
import SourceSelector from '@/components/SourceSelector.vue'
import { ArrayIterator } from 'asynciterator'
import { ActorQueryResultSerializeSparqlCsv } from '@comunica/actor-query-result-serialize-sparql-csv'
import { downloadTextAsFile, asBindings } from '@/modules/util'
import { exampleQueries } from '@/modules/queries'
import Yasqe from '@triply/yasqe'

const query = ref('')
const engine = new QueryEngine()
const queryContext = ref({
  sources: [{ type: 'sparql', value: 'https://frink.apps.renci.org/federation/sparql' }]
})
const setSourcesList: Ref<string[]> = ref([])
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

const queryInput = ref(null)
let yasqe: Yasqe | undefined = undefined
onMounted(() => {
  if (queryInput.value !== null) {
    yasqe = new Yasqe(queryInput.value)
    if (yasqe != undefined) {
      query.value = yasqe.getValue()
      yasqe.on('change', () => {
        if (yasqe != undefined) query.value = yasqe.getValue()
      })
      yasqe.setValue(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE {
  ?sub ?pred ?obj .
} LIMIT 10`)
    }
  }
})

function useExampleQuery(sparql: string, sources: string[]) {
  if (yasqe != undefined) {
    yasqe.setValue(sparql)
  }
  setSourcesList.value = sources
}

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
      :set-sources-list="setSourcesList"
      @change="
        (sources) => {
          queryContext = sources
        }
      "
    />
    <div id="example-queries">
      <h2>Examples</h2>
      <div v-for="query in exampleQueries" :key="query.title">
        <a @click="useExampleQuery(query.query, query.sources)">{{ query.title }} </a>
        <small class="source-pill" v-for="source in query.sources" :key="source">{{
          source
        }}</small>
      </div>
    </div>
    <div id="query-panel">
      <h2>Query</h2>
      <div id="query-input" ref="queryInput"></div>
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
.source-pill {
  margin-left: 0.5em;
}
</style>
