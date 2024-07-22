import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import AuraTheme from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

import Tooltip from 'primevue/tooltip'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import Divider from 'primevue/divider'
import Chip from 'primevue/chip'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Popover from 'primevue/popover'
import Select from 'primevue/select'
import { queryProvider, queryProviderKey } from './stores/query'
import { savedQueriesProviderKey, savedQueriesProvider } from './stores/savedQueries'
import AutoComplete from 'primevue/autocomplete'

const app = createApp(App)

const CustomizedTheme = definePreset(AuraTheme, {
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
      darkModeSelector: '.dark-mode'
    }
  }
})

app.component('Button', Button)
app.component('MultiSelect', MultiSelect)
app.component('Divider', Divider)
app.component('Column', Column)
app.component('Chip', Chip)
app.component('Popover', Popover)
app.component('InputText', InputText)
app.component('Select', Select)
app.component('AutoComplete', AutoComplete)

app.directive('tooltip', Tooltip)

app.use(router)

app.provide(queryProviderKey, queryProvider)
app.provide(savedQueriesProviderKey, savedQueriesProvider)

app.mount('#app')
