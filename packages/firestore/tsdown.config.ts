import { defineConfig } from 'tsdown'

import { baseConfig } from '../../tsdown.config.base.ts'

export default defineConfig({
	...baseConfig,
	entry: ['src/mod.ts'],
	dts: true,
	deps: {
		onlyBundle: false,
		neverBundle: ['@google-cloud/firestore'],
	},
})
