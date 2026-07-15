import { defineConfig } from 'vitest'

export default defineConfig({
	test: {
		include: ['__tests__/node.ts'],
		testTimeout: 2000,
		watch: false,
	},
})
