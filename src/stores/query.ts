import { defaultSources, type Source } from "@/modules/sources";
import { QueryEngine } from "@comunica/query-sparql";
import { ArrayIterator } from 'asynciterator';
import type { QueryStringContext, BindingsStream, Bindings } from "@comunica/types"
import { computed, ref, watch, type ComputedRef, type InjectionKey, type Ref } from "vue";
import { asBindings } from "@/modules/util";
import type Yasqe from "@triply/yasqe";

export const queryProvivderKey = Symbol() as InjectionKey<{
  currentSparql: Ref<string>;
  sources: Ref<{ source: Source, selected: boolean }[]>
  selectedSources: ComputedRef<{ source: Source, selected: true }[]>,
  queryContext: ComputedRef<{ type: 'qpf' | 'sparql', value: string }[]>,
  running: Ref<boolean>,
  executeQuery: () => Promise<void>,
  stopQuery: () => void,
  results: Ref<Bindings[]>,
  possiblyIncomplete: Ref<boolean>,
  errorMessage: Ref<string>,
  loadQuery: (sparql: string, selectedSources: string[]) => void,
  progressText: ComputedRef<string>,
}>;

const engine = new QueryEngine();

const currentSparql = ref("");

declare global {
  var yasqe: Yasqe | null;
}
globalThis.yasqe = null;

const sources = ref(defaultSources.map((source) => ({
  source,
  selected: source.name === "FRINK Federated SPARQL"
})));

const selectedSources = computed(() => (
  sources.value.filter((source) => source.selected)
));

const queryContext = computed(() => {
  const useTPF = selectedSources.value.length > 1;
  return selectedSources.value.map((item) => {
    switch (item.source.type) {
      case 'compound':
        return useTPF
          ? ({ type: 'qpf', value: item.source.tpfEndpoint })
          : ({ type: 'sparql', value: item.source.sparqlEndpoint })
      case 'sparql':
        return { type: 'sparql', value: item.source.endpoint }
    }
  });
});

const results = ref<Bindings[]>([]);
const bindingsStream = ref<BindingsStream>(new ArrayIterator<Bindings>([]));
const running = ref(false);
const possiblyIncomplete = ref(false);
const errorMessage = ref("");

const executeQuery = async () => {
  if (queryContext.value.length < 1) return;
  results.value = [];
  errorMessage.value = '';
  possiblyIncomplete.value = false;
  
  const result = await engine.query(
    currentSparql.value, 
    { sources: queryContext.value } as QueryStringContext
  ).catch((error) => {
    running.value = false;
    possiblyIncomplete.value = true;
    errorMessage.value = error.toLocaleString();
  });
  if (result) {
    switch (result.resultType) {
      case 'bindings':
        bindingsStream.value = await result.execute();
        break
      case 'quads':
        bindingsStream.value = (await result.execute()).map(asBindings);
        break
      case 'boolean':
        bindingsStream.value = new ArrayIterator<Bindings>([asBindings(await result.execute())]);
        break
    }
    running.value = true;
    bindingsStream.value.on('data', (item) => results.value.push(item));
    bindingsStream.value.on('end', () => {
      running.value = false;
      possiblyIncomplete.value = false;
    });
    bindingsStream.value.on('error', (error) => {
      running.value = false;
      possiblyIncomplete.value = true;
      errorMessage.value = error.toLocaleString();
    });
  }
}

const stopQuery = () => {
  if (!bindingsStream.value.done) possiblyIncomplete.value = true;
  bindingsStream.value?.destroy();
  running.value = false;
}

const loadQuery = (sparql: string, selectedSources: string[]) => {
  currentSparql.value = sparql;
  globalThis.yasqe?.setValue(sparql);
  for (const s of sources.value) {
    s.selected = selectedSources.includes(s.source.shortname);
  }
}

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
  return `${count.toLocaleString()} result${count === 1 ? '' : 's'} in ${(elapsed / 1000).toFixed(1)}s.`
});

export const queryProvider = {
  currentSparql,
  sources,
  selectedSources,
  queryContext,
  running,
  executeQuery,
  stopQuery,
  results,
  possiblyIncomplete,
  errorMessage,
  loadQuery,
  progressText,
}