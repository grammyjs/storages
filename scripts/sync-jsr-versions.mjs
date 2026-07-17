import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const packagesDir = new URL('../packages', import.meta.url).pathname

for (const entry of await readdir(packagesDir, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue

	const dir = join(packagesDir, entry.name)

	let pkg
	try {
		pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
	} catch {
		continue
	}

	for (const configName of ['jsr.json', 'deno.json']) {
		const configPath = join(dir, configName)
		try {
			const config = JSON.parse(await readFile(configPath, 'utf8'))
			if (config.version !== pkg.version) {
				config.version = pkg.version
				await writeFile(configPath, `${JSON.stringify(config, null, '\t')}\n`)
				console.log(`${entry.name}: synced ${configName} version to ${pkg.version}`)
			}
		} catch {
			// no such config file
		}
	}
}
