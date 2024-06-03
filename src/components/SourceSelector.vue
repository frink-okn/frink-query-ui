<script setup lang="ts">
import { ref, watch } from 'vue'
import { defaultSources } from '@/modules/sources'

type Source = { type: 'sparql' | 'qpf' | 'file'; value: string }
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
//emit('change', { sources: [{ type: 'sparql', value: '' }] }) //FIXME
</script>

<template>
  <div>
    <div v-for="(source, index) in sourceSelections" :key="source.source.toString">
      <input
        type="checkbox"
        id="{{ source.source.name }}{{index}}"
        value="{{ source.source.name }}"
        v-model="source.selected"
      />
      <label for="{{ source.source.name }}{{ index }}">{{ source.source.name }}</label>
    </div>
  </div>
</template>

<style scoped></style>
