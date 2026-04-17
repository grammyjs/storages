import { describe, expect, test, vi } from 'vitest';
import { PrismaAdapter } from '../src';
import type { SessionDelegate } from '../src';

function makeDelegate() {
  return {
    findUnique: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue({ key: 'k', value: '{}' }),
    delete: vi.fn().mockResolvedValue({ key: 'k', value: '{}' }),
  } satisfies SessionDelegate;
}

describe('PrismaAdapter cacheStrategy', () => {
  test('does not forward cacheStrategy when none is configured', async () => {
    const delegate = makeDelegate();
    const adapter = new PrismaAdapter(delegate);

    await adapter.read('k');

    expect(delegate.findUnique).toHaveBeenCalledTimes(1);
    const arg = delegate.findUnique.mock.calls[0][0];
    expect(arg).toEqual({ where: { key: 'k' } });
    expect(arg).not.toHaveProperty('cacheStrategy');
  });

  test('forwards cacheStrategy to findUnique when configured', async () => {
    const delegate = makeDelegate();
    const cacheStrategy = { ttl: 60, swr: 300, tags: ['grammy_session'] };
    const adapter = new PrismaAdapter(delegate, { cacheStrategy });

    await adapter.read('k');

    expect(delegate.findUnique).toHaveBeenCalledWith({
      where: { key: 'k' },
      cacheStrategy,
    });
  });

  test('does not forward cacheStrategy to writes or deletes', async () => {
    const delegate = makeDelegate();
    const adapter = new PrismaAdapter(delegate, {
      cacheStrategy: { ttl: 60 },
    });

    await adapter.write('k', { x: 1 } as never);
    await adapter.delete('k');

    const upsertArg = delegate.upsert.mock.calls[0][0];
    const deleteArg = delegate.delete.mock.calls[0][0];
    expect(upsertArg).not.toHaveProperty('cacheStrategy');
    expect(deleteArg).not.toHaveProperty('cacheStrategy');
  });
});
