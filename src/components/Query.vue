<script setup lang="ts">
import { queryProviderKey } from '@/stores/query'
import { type Source } from '@/modules/sources'
import Yasqe from '@triply/yasqe'
import { inject, ref, onMounted, computed } from 'vue';

const DEFAULT_QUERY = `\
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE {
  ?sub ?pred ?obj .
} LIMIT 10\
`;

let {
  sources,
  selectedSources,
  currentSparql,
  running,
  executeQuery,
  stopQuery,
} = inject(queryProviderKey)!;

const notReadyToRun = computed(() => 
  selectedSources.value.length < 1 || currentSparql.value.trim().length < 1
);

const onSourceSelectionChange = (nextSelection: { source: Source; selected: boolean }[]) => {
  sources.value.forEach((currentSource) => {
    if (nextSelection.includes(currentSource)) {
      currentSource.selected = true;
    } else {
      currentSource.selected = false;
    }
  });
}

const getSourceName = (source: { source: Source; selected: boolean }): string => {
  return source.source.name
}

const editorElement = ref(null);
onMounted(() => {
  if (editorElement.value !== null) {
    const previous = globalThis.yasqe?.getValue();
    globalThis.yasqe = new Yasqe(editorElement.value, { persistenceId: null });
    if (previous) globalThis.yasqe.setValue(previous);
    currentSparql.value = globalThis.yasqe.getValue();
    globalThis.yasqe.on('change', () => {
      if (globalThis.yasqe !== null) currentSparql.value = globalThis.yasqe.getValue()
    });
    if (currentSparql.value === "") globalThis.yasqe.setValue(DEFAULT_QUERY);
  }
});
</script>

<template>
  <div class="flex">
    <div class="label-container">
      <h3>Sources</h3>
      <MultiSelect
        :modelValue="selectedSources"
        @update:modelValue="onSourceSelectionChange"
        :options="sources"
        :maxSelectedLabels="3"
        class="multiselect"
        :optionLabel="getSourceName"
        placeholder="Select Sources"
        :pt="{
          header: { style: { display: 'none' } },
          listContainer: { style: { maxHeight: 'none' } }
        }"
      />
    </div>

    <div class="label-container query">
      <h3>SPARQL Query</h3>
      <div ref="editorElement" class="editor-wrapper"></div>
    </div>

    <div class="buttons">
      <Button
        v-if="!running"
        label="Run Query"
        @click="executeQuery"
        :disabled="notReadyToRun"
        v-tooltip="
          notReadyToRun
            ?  'Please provide a SPARQL query and at least one source.'
            : undefined
        "
        icon="pi pi-arrow-right"
        iconPos="right"
        size="small"
      />
      <Button
        v-else
        label="Stop Query"
        @click="stopQuery"
        severity="danger"
        icon="pi pi-stop"
        iconPos="right"
        size="small"
      />
    </div>
  </div>
</template>

<style scoped>
.flex {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.multiselect {
  width: 100%;
}

.label-container {
  display: flex;
  flex-direction: column;
}

.label-container.query {
  flex: 1;
  display: flex;
  flex-direction: column;

  /*
  By default this is auto, we have to set it to 0 so that it can be
  smaller than its content. This is important for the .editor-wrapper
  to overflow properly.
  */
  min-height: 0px;
}

.label-container > h3 {
  margin: 0px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 6px;
}

.editor-wrapper {
  flex: 1;
  overflow-y: auto;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
