<script setup lang="ts">
import { inject } from 'vue';
import SidebarItem from '@/components/SidebarItem.vue';
import { toggleablePanelsKey } from '@/stores/toggleablePanels';

defineOptions({
  inheritAttrs: false
});

const { toggleablePanels, togglePanel } = inject(toggleablePanelsKey)!;
</script>

<template>
  <nav>
    <div class="logo">
      FRINK KG UI
    </div>
    <div class="links">
      <div class="links-spacer">

        <SidebarItem label="Home" to="/" icon-class="pi-home" />
        <SidebarItem label="About" to="/about" icon-class="pi-question-circle" />
        
        <Divider class="divider" />

        <template v-for="({ label, icon, selected, id }, i) in toggleablePanels">
          <SidebarItem :label="label" :iconClass="icon" :selected="selected" @item-clicked="togglePanel(id)" />
        </template>

      </div>
      <div class="links-spacer">
        <Divider class="divider" />
        <SidebarItem label="Settings" to="/settings" icon-class="pi-cog" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  min-width: max-content;
  padding: 8px;
  border-right: 1px solid var(--p-slate-300);
  flex-direction: column;
  backdrop-filter: blur(2px);
  background-color: color-mix(in srgb, var(--p-slate-50) 10%, transparent);
  box-shadow: 0px 8px 8px 0px var(--p-slate-300);
}

.links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.links-spacer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.divider {
  margin: 0;
}

.logo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 1rem 0 1.3rem 0;
}

@media (max-width: 600px) {
  .logo {
    display: none;
  }
}
</style>