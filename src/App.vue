<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="wrapper">
    <Sidebar class="sidebar" />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
}

.sidebar {
  flex: 0 0 auto;
}

main {
  flex: 1;
  overflow: auto;
}
</style>
