import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/*.ts'],
    exclude: ['__tests__/helpers'],
    watch: false,
  },
});