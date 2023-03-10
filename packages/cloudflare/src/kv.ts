import type { StorageAdapter } from 'grammy/web';
import type { KVNamespace, KVNamespaceListResult, KVNamespaceListOptions } from '@cloudflare/workers-types';

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  BOT_TOKEN: string,
  KV_NAMESPACE: KVNamespace<string>
}

export class KvAdapter<T> implements StorageAdapter<T> {
  private kv_namespace: KVNamespace<string>;

  constructor(kv_namespace: KVNamespace<string>) {
    this.kv_namespace = kv_namespace;
  }

  async read(key: string): Promise<T | undefined> {
    return await this.kv_namespace.get(key, { type: 'json' }) ?? undefined;
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

  readAllKeys(): AsyncIterable<string> {
    const kv_namespace = this.kv_namespace;
    return {
      async *[Symbol.asyncIterator](): AsyncIterator<string, any, undefined> {
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
      },
    };
  }

  readAllValues(): AsyncIterable<T> {
    const kv_namespace = this.kv_namespace;
    return {
      async *[Symbol.asyncIterator](): AsyncIterator<T, any, undefined> {
        let keyList: KVNamespaceListResult<any, string>;
        const listOptions: KVNamespaceListOptions = {};
        do {
          keyList = await kv_namespace.list(listOptions);
          if (!keyList.list_complete) {
            listOptions.cursor = keyList.cursor;
          }
          for (const key of keyList.keys) {
            yield await kv_namespace.get<T>(key.name, { type: 'json' }) as T;
          }
        } while (!keyList.list_complete);
      },
    };
  }

  readAllEntries(): AsyncIterable<[key: string, value: T]> {
    const kv_namespace = this.kv_namespace;
    return {
      async *[Symbol.asyncIterator](): AsyncIterator<[key: string, value: T], any, undefined> {
        let keyList: KVNamespaceListResult<any, string>;
        const listOptions: KVNamespaceListOptions = {};
        do {
          keyList = await kv_namespace.list(listOptions);
          if (!keyList.list_complete) {
            listOptions.cursor = keyList.cursor;
          }
          for (const key of keyList.keys) {
            const value = await kv_namespace.get<T>(key.name, { type: 'json' }) as T;
            yield [key.name, value];
          }
        } while (!keyList.list_complete);
      },
    };
  }
}