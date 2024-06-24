/// <reference types="vite/client" />

declare module 'vue-resizable-panels';

declare module '*.md' {
  import type { ComponentOptions } from 'vue'

  const Component: ComponentOptions
  export default Component
}