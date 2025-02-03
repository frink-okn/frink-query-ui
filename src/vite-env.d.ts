/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KG_SOURCES_YAML: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
