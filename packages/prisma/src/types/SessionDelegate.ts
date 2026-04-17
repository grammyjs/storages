export interface Session {
  key: string;
  value: string;
}

interface Where {
  key: string;
}

interface Create {
  key: string;
  value: string;
}

interface Update {
  value: string;
}

/**
 * Cache options forwarded to the underlying Prisma delegate when
 * [Prisma Accelerate](https://www.prisma.io/docs/accelerate/caching) is in use.
 * Ignored by vanilla Prisma clients.
 */
export interface CacheStrategy {
  /** Time-to-live in seconds. */
  ttl?: number;
  /** Stale-while-revalidate window in seconds. */
  swr?: number;
  /** Cache-invalidation tags (alphanumeric + underscore, up to 64 chars each). */
  tags?: string[];
}

export interface SessionDelegate {
  findUnique: (
    input: { where: Where; cacheStrategy?: CacheStrategy },
  ) => Promise<Session | null>;
  upsert: (input: {
    where: Where;
    create: Create;
    update: Update;
  }) => Promise<Session>;
  delete: (input: { where: Where }) => Promise<Session>;
}
