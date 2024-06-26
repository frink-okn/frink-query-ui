<script setup lang="ts">
import Yasqe from '@triply/yasqe';
import { ref, onMounted } from 'vue';
import About from '@/views/about/about.md';

const sourcesOptions = [
  { name: "Climatepub4-KG" },
  { name: "DREAM-KG" },
  { name: "SCALES" },
  { name: "Secure Chain KG" },
  { name: "SOC-KG" },
  { name: "SUD-OKN" },
  { name: "Ubergraph" },
  { name: "UF-OKN" },
  { name: "Wikidata" },
  { name: "FRINK Federated SPARQL" },
];
const selectedSources = ref<string[]>([]);

const query = ref('');
const queryElement = ref(null)
let yasqe: Yasqe | undefined = undefined
onMounted(() => {
  if (queryElement.value !== null) {
    yasqe = new Yasqe(queryElement.value)
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
</script>

<template>
  <div class="flex">
    <div class="label-container">
      <h3>Sources</h3>
      <MultiSelect
        v-model="selectedSources"
        :options="sourcesOptions"
        :maxSelectedLabels="3"
        class="multiselect"
        optionLabel="name"
        placeholder="Select Sources"
        :pt="{
          header: { style: { display: 'none' } },
          listContainer: { style: { maxHeight: 'none' }}
        }"
      />
    </div>

    <div class="label-container query">
      <h3>SPARQL Query</h3>
      <div ref="queryElement" class="editor-wrapper"></div>
    </div>

    <div class="buttons">
      <Button
        label="Save Query"
        severity="secondary"
        icon="pi pi-bookmark"
        iconPos="right"
        size="small"
      />
      <Button
        label="Run Query"
        icon="pi pi-arrow-right"
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