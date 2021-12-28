import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['__tests__/node.ts'],
    testTimeout: 2000,
    watch: false,
  },
});
