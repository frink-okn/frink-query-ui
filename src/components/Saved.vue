<script setup lang="ts">
import { queryProviderKey } from '@/stores/query'
import { savedQueriesProviderKey } from '@/stores/savedQueries'
import { ref, inject } from 'vue'

const formatDate = (timestamp: number) =>
  new Date(timestamp)
    .toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
    .replace(' PM', 'pm')
    .replace(' AM', 'am')

const { loadQuery } = inject(queryProviderKey)!
const { savedQueries, deleteQuery } = inject(savedQueriesProviderKey)!

const queryToBeDeleted = ref<any>()
const popover = ref()
const togglePopover = (event: any) => {
  popover.value.toggle(event)
}
</script>

<template>
  <p>
    You can save the current query by pressing the "Save Query" button in the
    <mark>Query</mark> panel. This will be persisted in the browser between sessions using local
    storage. To load a saved query, click on the name. Note that just the query is saved, not the
    results.
  </p>
  <hr v-if="savedQueries.length > 0" />
  <div class="queries">
    <div
      v-for="query in savedQueries.sort((a, b) => b.timestamp - a.timestamp)"
      class="query"
      :key="query.title"
    >
      <div>
        <a @click="loadQuery(query.query, query.sources)">
          {{ query.title }}
          <Chip v-for="source in query.sources" :label="source" class="chip" :key="source" />
          <small class="date-stamp">
            {{ formatDate(query.timestamp) }}
          </small>
        </a>
      </div>
      <button
        class="delete-button"
        @click="
          (e) => {
            togglePopover(e)
            queryToBeDeleted = query
          }
        "
      >
        <span class="pi pi-trash"></span>
      </button>
    </div>
  </div>

  <Popover ref="popover">
    <p :style="{ marginBottom: '0.5rem' }">Delete this query?</p>
    <div :style="{ display: 'flex', gap: '0.5rem' }">
      <Button
        label="Cancel"
        @click="togglePopover"
        severity="secondary"
        size="small"
        :style="{ flex: '1' }"
      />
      <Button
        label="Delete"
        @click="
          (e: MouseEvent) => {
            deleteQuery(queryToBeDeleted)
            togglePopover(e)
          }
        "
        size="small"
        severity="danger"
        icon="pi pi-trash"
        iconPos="right"
        :style="{ flex: '1' }"
      />
    </div>
  </Popover>
</template>

<style scoped>
p {
  margin: 0;
}

mark {
  padding: 0.25rem 0.4rem;
  background-color: var(--p-blue-400);
  text-transform: uppercase;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.queries {
  display: flex;
  flex-direction: column;
}

.queries a {
  cursor: pointer;
}

.query {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.query:not(:last-of-type) {
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px dotted var(--p-slate-300);
}

hr {
  margin: 0.5rem 0px;
}

.chip {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 2px 4px;
  background-color: var(--p-slate-200);
  border-radius: 6px;
  transform: translateY(-1.5px);
  margin-left: 1ch;
}

.delete-button {
  margin: 0;
  padding: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
  align-self: center;
  color: var(--p-slate-500);
  transition: all 250ms ease-in-out;
}

.delete-button:hover {
  color: var(--p-slate-800);
}

.date-stamp {
  font-size: 0.75rem;
  text-decoration: none;
  color: var(--p-slate-500);
  margin-left: 1ch;
}
</style>
