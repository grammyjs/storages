import { Client, StorageAdapter } from './deps.deno.ts';

export class RedisAdapter<T> implements StorageAdapter<T> {
  private redis: Client;
  private readonly ttl?: number;

  /**
   * @constructor
   * @param {opts} Constructor options
   * @param {opts.ttl} ttl - Session time to life in SECONDS.
   * @param {opts.instance} instance - Instance of redis.
   */
  constructor({ instance, ttl }: { instance?: Client; ttl?: number }) {
    if (instance) {
      this.redis = instance;
    } else {
      throw new Error('You should pass redis instance to constructor.');
    }

    this.ttl = ttl;
  }

  async read(key: string) {
    const session = await this.redis.get(key);
    if (session === null || session === undefined) {
      return undefined;
    }
    return JSON.parse(session) as unknown as T;
  }

  async write(key: string, value: T) {
    await this.redis.set(key, JSON.stringify(value));
    if (this.ttl) {
      this.redis.expire(key, this.ttl);
    }
  }

  async delete(key: string) {
    await this.redis.del(key);
  }
}
