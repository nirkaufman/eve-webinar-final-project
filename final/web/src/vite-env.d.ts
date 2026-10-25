/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVE_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
