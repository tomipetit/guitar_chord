import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Cloudflare Pages はサイトルート配信なので base は '/' でよい
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
