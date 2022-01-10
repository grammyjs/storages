import { publish } from 'https://x.nest.land/eggs@0.3.10/src/commands/publish.ts';

// import example config for autocomplitions
const ExamplePkg = await import('./packages/redis/package.json', { assert: { type: 'json' } });
type Pkg = typeof ExamplePkg

const pkgDir = `./packages/${Deno.args[0]}`;
Deno.chdir(pkgDir);

const pkg = JSON.parse(Deno.readTextFileSync(`./package.json`)) as Pkg;

publish({
  'description': pkg.description,
  'homepage': pkg.homepage,
  'version': pkg.version,
  'entry': `./src/mod.ts`,
  'unstable': false,
  'unlisted': false,
  'checkFormat': false,
  'checkTests': false,
  'checkInstallation': false,
  'check': true,
  'files': [
    `./src/*.ts`,
    `LICENSE`,
    `README.md`,
  ],
  'ignore': [
    `./src/*.node.ts`,
  ],
  yes: true,
}, pkg.name.replace('@grammyjs/', ''));