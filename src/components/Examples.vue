<script setup lang="ts">
import { exampleQueries } from '@/modules/exampleQueries';
import { queryProvivderKey } from '@/stores/query';
import { inject } from 'vue';

const { loadQuery } = inject(queryProvivderKey)!;
</script>

<template>
  <h3>Examples</h3>
  <div v-for="query in exampleQueries" :key="query.title">
    <a @click="loadQuery(query.query, query.sources)">{{ query.title }} </a>
    <small class="source-pill" v-for="source in query.sources" :key="source">{{
      source
    }}</small>
  </div>
</template>

<style scoped>
h3 {
  margin: 0px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 6px;
}
</style>