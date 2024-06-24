<script setup lang="ts">
import { ref } from 'vue';

const selectedTab = ref(2);
const tabs = [
  {
    label: "Examples",
    color: "var(--p-teal-400)",
    closeable: true,
  },
  {
    label: "Saved",
    color: "var(--p-amber-400)",
    closeable: true,
  },
  {
    label: "Query",
    color: "var(--p-blue-400)",
    closeable: false,
  },
  {
    label: "Results",
    color: "var(--p-purple-400)",
    closeable: false,
  },
]
</script>

<template>
  <div class="wrapper" :style="{ '--accent-color': tabs[selectedTab].color }">
    <header>
      <div
        v-for="(tab, i) in tabs"
        class="tab"
        role="button"
        :class="{ selected: selectedTab === i }"
        :style="{ '--button-accent-color': tab.color }"
        @click="() => { selectedTab = i}"
      >
        <h2>{{ tab.label }}</h2>
        <button v-if="tab.closeable" class="close-button" @click.stop="() => console.log('Closed tab', i)">
          <span class="pi pi-times"></span>
        </button>
      </div>
    </header>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  isolation: isolate; /* Create stacking context for tab z-index */
}

header {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  overflow-x: auto;
  color: var(--p-slate-950);
  user-select: none;
}

.tab {
  border: none;
  color: inherit;
  background-color: var(--button-accent-color);
  padding: 0.5rem 0.75rem 0.3rem 0.75rem;
  align-self: flex-start;
  border-radius: 8px 8px 0px 0px;
  position: relative;
  display: flex;
  gap: 4px;
  flex-direction: row;
  align-items: center;
  --tab-flare-size: 10px;
}
.tab:not(.selected)::before {
  content: "";
  pointer-events: none;
  background: linear-gradient(
    to bottom, transparent 50%, rgba(0, 0, 0, 0.15)
  );
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.tab.selected:not(:first-of-type)::before {
  z-index: 2;
  position: absolute;
  content: "";
  width: var(--tab-flare-size);
  height: var(--tab-flare-size);
  background: radial-gradient(
    circle farthest-side at top left,
    transparent 95%,
    var(--button-accent-color) 100%
  );
  bottom: 0;
  left: calc(-1 * var(--tab-flare-size));
}
.tab.selected:not(:last-of-type)::after {
  z-index: 2;
  position: absolute;
  content: "";
  width: var(--tab-flare-size);
  height: var(--tab-flare-size);
  background: radial-gradient(
    circle farthest-side at top right,
    transparent 95%,
    var(--button-accent-color) 100%
  );
  bottom: 0;
  right: calc(-1 * var(--tab-flare-size));
}

.tab > h2 {
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.close-button {
  background-color: transparent;
  border: none;
  color: inherit;
  padding: 3px 3px 2px 3px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 250ms;
}
.close-button:hover {
  background-color: rgb(0, 0, 0, 0.15);
}
.close-button > span {
  font-size: 0.65rem;
}

.content {
  flex: 1;
  background-color: var(--p-slate-50);
  border: 2px solid var(--accent-color);
  padding: 0.75rem;
  border-radius: 8px;
  border-top-left-radius: 0px;
}

@media (max-width: 450px) {
  .content {
    border-radius: 0px 0px 8px 8px;
  }
}
</style>