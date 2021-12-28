import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['__tests__/*.ts'],
    exclude: ['__tests__/helpers'],
    watch: false,
  },
});