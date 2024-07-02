<script setup lang="ts">
import Panels from '@/components/Panels.vue'

import Examples from '@/components/Examples.vue'
import Saved from '@/components/Saved.vue'
import Query from '@/components/Query.vue'
import Results from '@/components/Results.vue'
</script>

<template>
  <div class="padding-wrapper">
    <Panels class="panels">
      <template v-slot:examples>
        <Examples />
      </template>

      <template v-slot:saved>
        <Saved />
      </template>

      <template v-slot:query>
        <Query />
      </template>

      <template v-slot:results>
        <Results />
      </template>
    </Panels>

    <footer>
      <small>
        <a href="https://renci.org/" target="_blank" rel="noopener noreferrer">RENCI</a>
      </small>
      <small>
        <a
          href="https://github.com/frink-okn/frink-query-ui/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code available on <span class="pi pi-github"></span>
        </a>
      </small>
      <small>
        Powered by
        <a href="https://comunica.dev/" target="_blank" rel="noopener noreferrer">Comunica</a>
      </small>
    </footer>
  </div>
</template>

<style scoped>
.padding-wrapper {
  height: 100%;
  padding: 1rem;
  padding-bottom: 0;

  display: flex;
  flex-direction: column;
}

.panels {
  flex: 1;
  min-height: 0;
}

footer {
  padding: 8px;
  text-align: center;
}

footer > small:not(:last-of-type)::after {
  content: '|';
  color: var(--p-slate-500);
  margin: 0px 1ch 0px 1.5ch;
}

@media (max-width: 800px) {
  .padding-wrapper {
    padding: 0.5rem;
    padding-bottom: 0;
  }
}
</style>
