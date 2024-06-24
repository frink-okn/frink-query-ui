<script setup lang="ts">
import type { Ref } from 'vue';
import { ref } from 'vue';
import Panel from '@/components/Panel.vue';
import {
  Panel as ResizablePanel,
  PanelGroup,
  PanelResizeHandle
} from "vue-resizable-panels";
import MobileTabsPanel from '@/components/MobileTabsPanel.vue';

const value = ref("");
const items: Ref<string[]> = ref([]);

const search = (event: any) => {
    let _items = [...Array(10).keys()].map((v) => `${v}`);

    items.value = event.query ? [...Array(10).keys()].map((item) => event.query + '-' + item) : _items;
}
</script>

<template>
  <div class="panel-group">
    <MobileTabsPanel />
    <!-- <PanelGroup
      autoSaveId="localstorage-panels-id"
      direction="horizontal"
    >
      <ResizablePanel :defaultSize="33" :collapsible="true">
        <Panel 
          title="Examples"
          color="var(--p-teal-400)"
        >
          Content
          <Button v-tooltip="'Tooltip'">
            Hello
          </Button>
          <AutoComplete v-model="value" dropdown :suggestions="items" @complete="search" />
        </Panel>
      </ResizablePanel>

      <PanelResizeHandle class="handle" />

      <ResizablePanel :defaultSize="33">
        <Panel 
          title="Query"
          color="var(--p-blue-400)"
        >
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
        </Panel>
      </ResizablePanel>

      <PanelResizeHandle class="handle" />

      <ResizablePanel :defaultSize="33">
        <Panel 
          title="Results"
          color="var(--p-purple-400)"
        >
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
        </Panel>
      </ResizablePanel>
    </PanelGroup> -->
  </div>
</template>

<style scoped>
.panel-group {
  height: 100%;
  padding: 1rem;
}

@media (max-width: 800px) {
  .panel-group {
    padding: 0.5rem;
  }
}

.handle {
  align-self: center;
  width: 12px;
  border-radius: 6px;
  height: 64px;
  margin: 0 4px;
  backdrop-filter: blur(2px);
  background-color: color-mix(in srgb, var(--p-slate-200) 30%, transparent);
  border: 1px solid var(--p-slate-400);
  transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
}

.handle[data-resize-handle-active="pointer"],
.handle:hover {
  background-color:  color-mix(in srgb, var(--p-slate-500) 20%, transparent);;
  border-color: var(--p-slate-500);
  transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
}

.handle[data-resize-handle-active="pointer"] {
  height: 96px;
  transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
}
</style>
