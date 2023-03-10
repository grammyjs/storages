import { unstable_dev } from 'wrangler';
import test from 'node:test';
import assert from 'node:assert';

const worker = await unstable_dev('../src/index.ts', {
  experimental: { disableExperimentalWarning: true },
});

test('Should create sessions dir', async () => {
  const resp = await worker.fetch();
  if (resp) {
    const text = await resp.text();
    assert.equal(text, 'Hello World!');
  }
});

await worker.stop();