import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/**'],
    testTimeout: 2000,
    watch: false,
  },
}); 
