<script setup lang="ts">
import { queryProviderKey } from '@/stores/query'
import { savedQueriesProviderKey } from '@/stores/savedQueries'
import { computed, inject, ref } from 'vue'

type Query = (typeof savedQueries.value)[0]

const emit = defineEmits<{
  (e: 'close', trigger: Event): void
}>()

let { selectedSources, currentSparql } = inject(queryProviderKey)!
const { savedQueries, saveQuery, overwriteQuery } = inject(savedQueriesProviderKey)!

// Used for autocomplete search
const filteredSavedQueries = ref<Query[]>([])
const search = (event: any) => {
  if (!event.query.trim().length) {
    filteredSavedQueries.value = [...savedQueries.value]
  } else {
    filteredSavedQueries.value = savedQueries.value.filter((s) => {
      return s.title.toLowerCase().includes(event.query.toLowerCase())
    })
  }
}

const queryName = ref<string | Query>('')
const pressedSubmit = ref(false)
const isQueryNameBlank = computed(
  () => pressedSubmit.value && typeof queryName.value === 'string' && queryName.value === ''
)
const isOverwrite = computed(
  () =>
    typeof queryName.value !== 'string' ||
    savedQueries.value.find((sq) => sq.title === queryName.value)
)

function handleSubmit(e: Event) {
  e.preventDefault()
  pressedSubmit.value = true

  const newQuery: Omit<Query, 'timestamp'> = {
    title: typeof queryName.value === 'string' ? queryName.value : queryName.value.title,
    sources: selectedSources.value.map(({ source }) => source.shortname),
    query: currentSparql.value
  }

  if (typeof queryName.value === 'string') {
    if (queryName.value === '') return

    const existingQuery = savedQueries.value.find((sq) => sq.title === queryName.value)
    existingQuery ? overwriteQuery(existingQuery, newQuery) : saveQuery(newQuery)
  } else {
    overwriteQuery(queryName.value, newQuery)
  }

  emit('close', e)
  queryName.value = ''
}
</script>

<template>
  <form class="wrapper" @submit="handleSubmit">
    <p>Give the query a new name or select an existing query to overwrite.</p>

    <label>
      <p :class="{ error: isQueryNameBlank }">Name</p>
      <AutoComplete
        v-model="queryName"
        dropdown
        :suggestions="filteredSavedQueries"
        optionLabel="title"
        :invalid="isQueryNameBlank"
        @complete="search"
        emptySearchMessage="No matching queries exist."
      />
    </label>

    <p v-if="isQueryNameBlank" class="error">Please give the query a name.</p>

    <div class="save-buttons">
      <Button
        label="Cancel"
        @click="(e: MouseEvent) => $emit('close', e)"
        severity="secondary"
        size="small"
        :style="{ flex: '1' }"
      />
      <Button
        :label="isOverwrite ? 'Overwrite' : 'New Save'"
        type="submit"
        size="small"
        icon="pi pi-save"
        iconPos="right"
        :style="{ flex: '1' }"
      />
    </div>
  </form>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 300px;
}

p {
  margin: 0;
}

label {
  display: flex;
  flex-direction: column;
}

label > p {
  font-size: 0.85rem;
  color: var(--p-slate-600);
}

.error {
  color: var(--p-rose-500);
}

.save-buttons {
  display: flex;
  gap: 0.5rem;
}
</style>
