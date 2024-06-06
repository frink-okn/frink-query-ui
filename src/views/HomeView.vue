<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { QueryEngine } from '@comunica/query-sparql'
import { type Bindings, type BindingsStream } from '@comunica/types'
import SourceSelector from '@/components/SourceSelector.vue'
import { DataFactory } from 'rdf-data-factory'
import { BindingsFactory } from '@comunica/bindings-factory'
import { ArrayIterator } from 'asynciterator'
import { ActorQueryResultSerializeSparqlCsv } from '@comunica/actor-query-result-serialize-sparql-csv'

const DF = new DataFactory()
const BF = new BindingsFactory(DF)
const query = ref('')
const engine = new QueryEngine()
const queryContext = ref({
  sources: [{ type: 'sparql', value: 'https://frink.apps.renci.org/federation/sparql' }]
})
const results: Ref<Array<Bindings>> = ref([])
const bindingsStream = ref<BindingsStream>(new ArrayIterator<Bindings>([]))
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
  const result = await engine.query(query.value, queryContext.value)
  switch (result.resultType) {
    case 'bindings':
      bindingsStream.value = await result.execute()
      break
    case 'quads':
      bindingsStream.value = (await result.execute()).map<Bindings>((quad) => {
        return BF.fromRecord({
          subject: quad.subject,
          predicate: quad.predicate,
          object: quad.predicate,
          graph: quad.graph
        })
      })
      break
    case 'boolean':
      bindingsStream.value = new ArrayIterator<Bindings>([
        BF.fromRecord({
          result: (await result.execute())
            ? DF.literal('true', DF.namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
            : DF.literal('false', DF.namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
        })
      ])
      break
  }
  running.value = true
  bindingsStream.value.on('data', (item) => results.value.push(item))
  bindingsStream.value.on('end', () => (running.value = false))
}

function stopQuery() {
  bindingsStream.value?.destroy()
  running.value = false
}

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
    const blob = new Blob([header, body])
    const a = document.createElement('a')
    a.download = 'sparql-results.csv'
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/csv', a.download, a.href].join(':')
    const e = document.createEvent('MouseEvents')
    e.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    )
    a.dispatchEvent(e)
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
      <button v-else @click="executeQuery">Run Query</button>
    </div>
    <hr />
    <div id="results">
      <h2>Results</h2>
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
</style>
