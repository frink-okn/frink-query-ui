<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { defaultSources } from '@/modules/sources'

type Source = { type: 'sparql' | 'qpf' | 'file'; value: string }
const props = defineProps<{
  setSourcesList: string[]
}>()
const emit = defineEmits<{
  change: [{ sources: Source[] }]
}>()
const sourceSelections = ref(
  defaultSources.map((source) => {
    return { selected: false, source: source }
  })
)
sourceSelections.value.forEach((source) => {
  if (source.source.name === 'FRINK Federated SPARQL') source.selected = true
})
watch(
  sourceSelections,
  (newSelections) => {
    const filtered = newSelections.filter((item) => item.selected)
    const useTPF = filtered.length > 1
    const sources = filtered.map((item) => {
      switch (item.source.type) {
        case 'compound':
          return useTPF
            ? ({ type: 'qpf', value: item.source.tpfEndpoint } as Source)
            : ({ type: 'sparql', value: item.source.sparqlEndpoint } as Source)
        case 'sparql':
          return { type: 'sparql', value: item.source.endpoint } as Source
      }
    })
    emit('change', { sources: sources })
  },
  { deep: true }
)
watch(props, (newProps, oldProps) => {
  const newSelections = newProps.setSourcesList
  if (newSelections.length > 0) {
    sourceSelections.value.forEach((sourceSelection) => (sourceSelection.selected = false))
    newProps.setSourcesList.forEach((selection) =>
      sourceSelections.value.forEach((sourceSelection) => {
        if (sourceSelection.source.shortname === selection) {
          sourceSelection.selected = true
        }
      })
    )
  }
})
</script>

<template>
  <div>
    <h2>Sources</h2>
    <div v-for="source in sourceSelections" :key="source.source.toString">
      <input
        type="checkbox"
        :id="source.source.name"
        v-model="source.selected"
      />
      <label :for="source.source.name">{{ source.source.name }}</label>
    </div>
  </div>
</template>

<style scoped></style>
