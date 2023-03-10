import type { StorageAdapter } from 'grammy/web';
import type { KVNamespace, KVNamespaceListResult, KVNamespaceListOptions } from '@cloudflare/workers-types';

export class KvAdapter<T> implements StorageAdapter<T> {
  private kv_namespace: KVNamespace<string>;

  constructor(kv_namespace: KVNamespace<string>) {
    this.kv_namespace = kv_namespace;
  }

  async read(key: string): Promise<T | undefined> {
    return await this.kv_namespace.get<T>(key, { type: 'json' }) ?? undefined;
  }

  async write(key: string, value: T): Promise<void> {
    await this.kv_namespace.put(key, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await this.kv_namespace.delete(key);
  }

  async has(key: string): Promise<boolean> {
    let keyList: KVNamespaceListResult<any, string>;
    const listOptions: KVNamespaceListOptions = {};
    do {
      keyList = await this.kv_namespace.list(listOptions);
      if (!keyList.list_complete) {
        listOptions.cursor = keyList.cursor;
      }
      for (const k of keyList.keys) {
        if (key === k.name) return true;
      }
    } while (!keyList.list_complete);
    return false;
  }

  async *readAllKeys(): AsyncIterable<string> {
    const kv_namespace = this.kv_namespace;
    let keyList: KVNamespaceListResult<any, string>;
    const listOptions: KVNamespaceListOptions = {};
    do {
      keyList = await kv_namespace.list(listOptions);
      if (!keyList.list_complete) {
        listOptions.cursor = keyList.cursor;
      }
      for (const key of keyList.keys) {
        yield key.name;
      }
    } while (!keyList.list_complete);
  }

  async *readAllValues(): AsyncIterable<T> {
    const kv_namespace = this.kv_namespace;
    let keyList: KVNamespaceListResult<any, string>;
    const listOptions: KVNamespaceListOptions = {};
    do {
      keyList = await kv_namespace.list(listOptions);
      if (!keyList.list_complete) {
        listOptions.cursor = keyList.cursor;
      }
      for (const key of keyList.keys) {
        const value = await kv_namespace.get<T>(key.name, { type: 'json' });
        if (value === null) {
          yield null as T;
        } else {
          yield value;
        }
      }
    } while (!keyList.list_complete);
  }

  async *readAllEntries(): AsyncIterable<[key: string, value: T]> {
    const kv_namespace = this.kv_namespace;
    let keyList: KVNamespaceListResult<any, string>;
    const listOptions: KVNamespaceListOptions = {};
    do {
      keyList = await kv_namespace.list(listOptions);
      if (!keyList.list_complete) {
        listOptions.cursor = keyList.cursor;
      }
      for (const key of keyList.keys) {
        const value = await kv_namespace.get<T>(key.name, { type: 'json' });
        if (value === null) {
          yield [key.name, null as T];
        } else {
          yield [key.name, value];
        }
      }
    } while (!keyList.list_complete);
  }
}
