import { type KVNamespace } from '@cloudflare/workers-types';

function workersKvAdapter<T>(kv: KVNamespace): StorageAdapter<T>  {
  return {
    async read(key) {
      return await kv.get(key, { type: 'json' }) ?? undefined;
    },
    async write(key, value) {
      await kv.put(key, JSON.stringify(value));
    },
    async delete(key) {
      await kv.delete(key);
    },
    async has(key) {
      let keyList;
      do {
        keyList = await kv.list({ cursor: keyList?.cursor });
        for (const k of keyList.keys) {
          if (key === k.name) return true;
        }
      } while (!keyList.list_complete);
      return false;
    },
    async readAllKeys() {
      return {
        async *[Symbol.asyncIterator]() {
          let keyList;
          do {
            keyList = await kv.list({ cursor: keyList?.cursor });
            for (const key of keyList.keys) {
              yield key.name;
            }
          } while (!keyList.list_complete);
        },
      };
    },
    async readAllValues() {
      return {
        async *[Symbol.asyncIterator]() {
          let keyList;
          do {
            keyList = await kv.list({ cursor: keyList?.cursor });
            for (const key of keyList.keys) {
              yield await kv.get(key.name, { type: 'json' });
            }
          } while (!keyList.list_complete);
        },
      };
    },
    async readAllEntries() {
      return {
        async *[Symbol.asyncIterator]() {
          let keyList;
          do {
            keyList = await kv.list({ cursor: keyList?.cursor });
            for (const key of keyList.keys) {
              yield {
                key: key.name,
                value: await kv.get(key.name, { type: 'json' }),
              };
            }
          } while (!keyList.list_complete);
        },
      };
    },
  };
}
