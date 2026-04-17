import { type StorageAdapter } from 'grammy';
import { CacheStrategy, SessionDelegate } from './types/SessionDelegate';

export * from './types/SessionDelegate';

export interface PrismaAdapterOptions {
  /**
   * Forwarded as `cacheStrategy` to the underlying Prisma `findUnique` call
   * on every session read. Only has an effect with the
   * [Prisma Accelerate](https://www.prisma.io/docs/accelerate/caching)
   * extension loaded; it is a no-op on vanilla Prisma clients.
   *
   * Writes (`upsert`) and deletes are not cached — Accelerate only caches
   * read queries.
   */
  cacheStrategy?: CacheStrategy;
}

export class PrismaAdapter<T> implements StorageAdapter<T> {
  private sessionDelegate: SessionDelegate;
  private cacheStrategy?: CacheStrategy;

  constructor(
    repository: SessionDelegate,
    options: PrismaAdapterOptions = {},
  ) {
    this.sessionDelegate = repository;
    this.cacheStrategy = options.cacheStrategy;
  }

  async read(key: string) {
    const session = await this.sessionDelegate.findUnique({
      where: { key },
      ...(this.cacheStrategy
        ? { cacheStrategy: this.cacheStrategy }
        : {}),
    });
    return session?.value ? (JSON.parse(session.value) as T) : undefined;
  }

  async write(key: string, data: T) {
    const value = JSON.stringify(data);
    await this.sessionDelegate.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async delete(key: string) {
    await this.sessionDelegate.delete({ where: { key } }).catch((err) => {
      // Record does not exist in database
      if (err?.code === 'P2025') return;
      return Promise.reject(err);
    });
  }
}
