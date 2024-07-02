<!--
  This component determines which layout of the panels to use based
  on the screen width. On displays larger than 700px, use the PanelGroup
  from "vue-resizable-panels" package. For smaller displays, all the
  panels are joined into one and switched with tabs.

  The component has named slots for each panel, so the consumer of this
  component can provide those panel components using <template v-slot:id>
-->

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import {
  Panel as ResizablePanel,
  PanelGroup,
  PanelResizeHandle
} from "vue-resizable-panels";
import Panel from "@/components/Panel.vue";
import TabsPanel from "@/components/TabsPanel.vue";

const { width } = useWindowSize();

const allTabs = [
  {
    id: "examples",
    label: "Examples",
    color: "var(--p-teal-400)",
  },
  {
    id: "saved",
    label: "Saved",
    color: "var(--p-amber-400)",
  },
  {
    id: "query",
    label: "Query",
    color: "var(--p-blue-400)",
  },
  {
    id: "results",
    label: "Results",
    color: "var(--p-purple-400)",
  },
]
</script>

<template>
  <PanelGroup
    v-if="width > 700"
    autoSaveId="localstorage-panels-horiz"
    direction="horizontal"
  >
    <ResizablePanel :defaultSize="50" :collapsible="true">
      <PanelGroup direction="vertical" autoSaveId="localstorage-panels-vert">
        <ResizablePanel :defaultSize="60" :order="1">
          <Panel 
            title="Query"
            color="var(--p-blue-400)"
          >
            <slot name="query"></slot>
          </Panel>
        </ResizablePanel>
    
        <PanelResizeHandle class="handle vertical" />
    
        <ResizablePanel
          :defaultSize="40"
          :order="2"
          :collapsible="true"
        >
          <TabsPanel :tabs="[{
            id: 'examples',
            label: 'Examples',
            color: 'var(--p-teal-400)',
          }]">
            <template v-slot:examples><slot name="examples"></slot></template>
            <template v-slot:saved><slot name="saved"></slot></template>
            <template v-slot:query><slot name="query"></slot></template>
            <template v-slot:results><slot name="results"></slot></template>
          </TabsPanel>
        </ResizablePanel>
      </PanelGroup>
    </ResizablePanel>

    <PanelResizeHandle class="handle" />

    <ResizablePanel :defaultSize="50" :collapsible="true">
      <Panel 
        title="Results"
        color="var(--p-purple-400)"
      >
        <slot name="results"></slot>
      </Panel>
    </ResizablePanel>
  </PanelGroup>

  <TabsPanel v-else :tabs="allTabs">
    <template v-slot:examples><slot name="examples"></slot></template>
    <template v-slot:saved><slot name="saved"></slot></template>
    <template v-slot:query><slot name="query"></slot></template>
    <template v-slot:results><slot name="results"></slot></template>
  </TabsPanel>
</template>

<style scoped>
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

.handle.vertical {
  width: 64px;
  height: 12px;
  margin: 4px 0;
}
.handle.vertical[data-resize-handle-active="pointer"] {
  width: 96px;
  transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
}
</style>