<script setup lang="ts">
import Panels from "@/components/Panels.vue";

import Examples from "@/components/Examples.vue";
import Saved from "@/components/Saved.vue";
import Query from "@/components/Query.vue";
import Results from "@/components/Results.vue";
</script>

<template>
  <div class="padding-wrapper">
    <Panels>
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
  </div>
</template>

<style scoped>
.padding-wrapper {
  height: 100%;
  padding: 1rem;
}

@media (max-width: 800px) {
  .padding-wrapper {
    padding: 0.5rem;
  }
}
</style>
