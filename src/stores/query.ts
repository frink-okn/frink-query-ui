import { defaultSources, type Source } from "@/modules/sources";
import { QueryEngine } from "@comunica/query-sparql";
import { ArrayIterator } from 'asynciterator';
import type { QueryStringContext, BindingsStream, Bindings } from "@comunica/types"
import { computed, ref, type ComputedRef, type InjectionKey, type Ref } from "vue";
import { asBindings } from "@/modules/util";

export const queryProvivderKey = Symbol() as InjectionKey<{
  currentSparql: Ref<string>;
  sources: Ref<{ source: Source, selected: boolean }[]>
  selectedSources: ComputedRef<{ source: Source, selected: true }[]>,
  queryContext: ComputedRef<{ type: 'qpf' | 'sparql', value: string }[]>,
  running: boolean,
  executeQuery: () => Promise<void>,
  stopQuery: () => void,
}>;

const engine = new QueryEngine();

const currentSparql = ref("");

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

export const queryProvider = {
  currentSparql,
  sources,
  selectedSources,
  queryContext,
  running,
  executeQuery,
  stopQuery,
}