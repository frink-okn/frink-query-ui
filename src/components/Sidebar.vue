<script setup lang="ts">
import SidebarItem from '@/components/SidebarItem.vue';

defineOptions({
  inheritAttrs: false
});

</script>

<template>
  <nav>
    <div class="header-box">
      <div class="logo">
        FRINK KG UI
      </div>
      <div class="subtitle">
        Query the PROTO-OKN
      </div>
      <Divider />
    </div>


    <div class="links">
      <div class="links-spacer">

        <SidebarItem label="Home" to="/" icon-class="pi-home" />
        <SidebarItem label="About" to="/about" icon-class="pi-question-circle" />
        
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

.header-box {
  padding: 1rem 0 0 0;
  text-align: center;
}

.logo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  font-style: italic;
}

@media (max-width: 600px) {
  .header-box {
    display: none;
  }
}
</style>