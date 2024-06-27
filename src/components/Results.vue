<script setup lang="ts">
import { ref } from 'vue';

const results = ref([
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
  {
    title: "Application of In Vitro Metabolism Activation in High-Throughput Screening",
    cell_label: "hepatocyte",
    article: "http://www.wikidata.org/entity/Q101214733",
    cell: "http://purl.obolibrary.org/obo/CL_0000182"
  },
]);

const columns = Object.keys(results.value[0]).map((c) => ({ name: c }));
const selectedColumns = ref(columns);
const onToggle = (val: { name: string }[]) => {
  selectedColumns.value = columns.filter(col => val.find((c) => c.name === col.name))
};
</script>

<template>
  <div class="flex">
    <div>
      <MultiSelect 
        :modelValue="selectedColumns"
        :options="columns"
        optionLabel="name"
        @update:modelValue="onToggle"
        placeholder="Select Columns"
      />
    </div>
    <DataTable
      class="table"
      :value="results"
      size="medium"
      scrollable
      removableSort
      height
      :pt="{
        tableContainer: {
          style: { minHeight: 0, height: '100%' }
        }
      }"
    >
      <Column
        v-for="col in selectedColumns"
        :field="col.name"
        :header="col.name"
        :key="col.name"
        sortable
      />
    </DataTable>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table {
  flex: 1;
  min-height: 0px;
  margin: 0 -0.75rem -0.75rem -0.75rem;
  --p-datatable-column-title-font-weight: 500;
}
</style>