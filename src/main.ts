import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config';
import LaraTheme from "@primevue/themes/lara"
import { definePreset } from '@primevue/themes';

import Tooltip from 'primevue/tooltip';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import Divider from 'primevue/divider';
import Chip from 'primevue/chip';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Popover from 'primevue/popover';
import { queryProvider, queryProvivderKey } from './stores/query';

const app = createApp(App);

const CustomizedTheme = definePreset(LaraTheme, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}'
    }
  }
})
app.use(PrimeVue, {
  theme: {
    preset: CustomizedTheme,
    options: {
      darkModeSelector: ".dark-mode"
    }
  }
});



app.component('Button', Button);
app.component('MultiSelect', MultiSelect);
app.component('Divider', Divider);
app.component('Column', Column);
app.component('Chip', Chip);
app.component('Popover', Popover);
app.component('InputText', InputText);

app.directive('tooltip', Tooltip);

app.use(router);

app.provide(queryProvivderKey, queryProvider);

app.mount('#app');
