<script setup lang="ts">
import type { Ref } from 'vue';
import { ref } from 'vue';

const value = ref("");
const items: Ref<string[]> = ref([]);

const search = (event: any) => {
    let _items = [...Array(10).keys()].map((v) => `${v}`);

    items.value = event.query ? [...Array(10).keys()].map((item) => event.query + '-' + item) : _items;
}
</script>

<template>
  <h1>Home page</h1>
  <h2>Home page</h2>
  <h3>Home page</h3>
  <h4>Home page</h4>
  <h5>Home page</h5>
  <h6>Home page</h6>
  <p>Home page</p>
  <Button v-tooltip="'Tooltip'">
    Hello
  </Button>
  <AutoComplete v-model="value" dropdown :suggestions="items" @complete="search" />
</template>

<style scoped>
</style>
