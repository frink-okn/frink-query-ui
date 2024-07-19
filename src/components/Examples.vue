<script setup lang="ts">
import { exampleQueries } from '@/modules/exampleQueries'
import { queryProviderKey } from '@/stores/query'
import { inject } from 'vue'

const { loadQuery } = inject(queryProviderKey)!
</script>

<template>
  <p>
    Select a example query below to load it into the <mark>query</mark> panel. Then press the "Run
    Query" button to execute the query.
  </p>
  <hr />
  <div class="queries">
    <div v-for="query in exampleQueries" class="query" :key="query.title">
      <a @click="loadQuery(query.query, query.sources)">
        {{ query.title }}
        <Chip v-for="source in query.sources" :label="source" class="chip" :key="source" />
      </a>
    </div>
  </div>
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
</style>
