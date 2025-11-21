/// <reference types="vite/client" />

// Поддержка process.env для TypeScript
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly VITE_API_BASE_URL?: string;
  }
}

