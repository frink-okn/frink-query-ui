/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GH_REPO: string;
  readonly VITE_GH_SOURCES: string;
  readonly VITE_GH_EXAMPLES_DIRECTORY: string;
  readonly VITE_TANSTACK_BASE_URL?: string;
  readonly VITE_GH_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
