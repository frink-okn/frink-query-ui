<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<template>
  <div class="centering-container">
    <div class="max-width-container">
      <h1 v-if="title" class="title">{{ title }}</h1>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.centering-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.max-width-container {
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
}

.title {
  margin: 0px;
  padding: 1rem 2rem;
}

.content {
  background-color: var(--p-slate-50);
  padding: 1rem 2rem;
  border: 1px solid var(--p-slate-300);
  border-radius: 8px;
  box-shadow: 0px 8px 16px 0px var(--p-slate-300);
}

@media screen and (max-width: 800px) {
  .centering-container {
    padding: 0.5rem;
  }

  .content {
    padding: 0rem 1rem;
  }

  .title {
    padding: 1rem;
  }
}
</style>