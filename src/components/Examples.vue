<script setup lang="ts">
import { exampleQueries } from '@/modules/exampleQueries';
import { queryProviderKey } from '@/stores/query';
import { inject } from 'vue';

const { loadQuery } = inject(queryProviderKey)!;
</script>

<template>
  <p>
    Select a example query below to load it into the <mark>query</mark> panel.
    Then press the "Run Query" button to execute the query.
  </p>
  <hr>
  <div class="queries">
    <div v-for="query in exampleQueries">
      <a @click="loadQuery(query.query, query.sources)">{{ query.title }} </a>
      <Chip v-for="source in query.sources" :label="source" class="chip" />
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
  gap: 0.5rem;
}

.queries a {
  cursor: pointer;
}

hr {
  margin: 1rem 0px;
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