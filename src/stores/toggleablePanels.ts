import { ref, type InjectionKey, type Ref } from "vue";

interface ToggleablePanel {
  label: string;
  icon: string;
  color: string;
  selected: boolean
}

const toggleablePanels = ref<ToggleablePanel[]>([
  {
    label: "Examples",
    icon: "pi-search",
    color: "var(--p-teal-400)",
    selected: false,
  },
  {
    label: "Saved Queries",
    icon: "pi-bookmark",
    color: "var(--p-amber-400)",
    selected: false,
  }
]);

const togglePanel = (index: number) => {
  let current = toggleablePanels.value[index]?.selected;
  if (current === undefined) return;
  toggleablePanels.value[index].selected = !current;
}

export const toggleablePanelsKey = Symbol() as InjectionKey<{
  toggleablePanels: Ref<ToggleablePanel[]>;
  togglePanel: (index: number) => void
}>

export const toggleablePanelsProvider = {
  toggleablePanels,
  togglePanel
}