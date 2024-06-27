import { defaultSources, type Source } from "@/modules/sources";
import { computed, ref, type ComputedRef, type InjectionKey, type Ref } from "vue";

export const queryProvivderKey = Symbol() as InjectionKey<{
  currentSparql: Ref<string>;
  sources: Ref<{ source: Source, selected: boolean }[]>
  selectedSources: ComputedRef<{ source: Source, selected: true }[]>
}>;

const currentSparql = ref("");

const sources = ref(defaultSources.map((source) => ({
  source,
  selected: source.name === "FRINK Federated SPARQL"
})));
const selectedSources = computed(() => (
  sources.value.filter((source) => source.selected)
));

export const queryProvider = {
  currentSparql,
  sources,
  selectedSources
}