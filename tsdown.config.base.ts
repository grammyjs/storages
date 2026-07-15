import type { UserConfig } from 'tsdown'

export const baseConfig: UserConfig = {
	format: ['esm', 'cjs'],
	platform: 'node',
	dts: true,
	clean: true,
	deps: {
		onlyBundle: false,
	},
}

export default baseConfig
