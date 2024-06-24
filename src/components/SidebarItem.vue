<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  label: string;
  selected?: boolean;
  iconClass: string;
  to?: string;
}>();
</script>

<template>
  <RouterLink v-if="to" :to="to" class="router-link" :aria-label="label">
    <button class="wrapper" :class="{ selected }" tabindex="-1">
      <span :class="['pi', iconClass]"></span>
      <span class="label">{{ label }}</span>
    </button>
  </RouterLink>

  <button v-else class="wrapper" :class="{ selected }" :aria-label="label">
      <span :class="['pi', iconClass]"></span>
      <span class="label">{{ label }}</span>
  </button>
</template>

<style scoped>
.wrapper {
  border: none;
  background-color: transparent;
  display: flex;
  align-items: center;
  gap: 1ch;
  width: 100%;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  color: var(--p-slate-950);
  cursor: pointer;
  border: 1px solid transparent;
}

.wrapper:hover {
  background-color: color-mix(in srgb, var(--p-slate-300) 30%, transparent);
}

.wrapper.selected:hover {
  background-color: color-mix(in srgb, var(--p-slate-400) 30%, transparent);
}

.selected,
.router-link.router-link-exact-active > .wrapper
{
  background-color: color-mix(in srgb, var(--p-slate-300) 50%, transparent);
  border: 1px solid var(--p-slate-400);
}

@media (max-width: 600px) {
  .wrapper {
    padding: 0.6rem;
  }
  
  .label {
    display: none;
  }
}

.router-link {
  text-decoration: none;
}
</style>