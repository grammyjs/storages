import { StorageAdapter } from './deps.ts';

export class DenoKVAdapter<T> implements StorageAdapter<T> {
  constructor(private kv: Deno.Kv) {}

  async read(key: string): Promise<T | undefined> {
    const result = await this.kv.get(['sessions', key]);
    return result.value !== null ? result.value as T : undefined;
  }

  async write(key: string, value: T) {
    await this.kv.set(['sessions', key], value);
  }

  async delete(key: string) {
    await this.kv.delete(['sessions', key]);
  }
}
