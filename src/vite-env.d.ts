/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KG_SOURCES_YAML: string;
  readonly VITE_GH_REPO: string;
  readonly VITE_GH_SOURCES: string;
  readonly VITE_GH_EXAMPLES_DIRECTORY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
