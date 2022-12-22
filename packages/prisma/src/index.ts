import { StorageAdapter } from './deps.deno.ts';
import { SessionDelegate } from './types/SessionDelegate.ts';

export * from './types/SessionDelegate.ts';

export class PrismaAdapter<T> implements StorageAdapter<T> {
  private sessionDelegate: SessionDelegate;

  constructor(repository: SessionDelegate) {
    this.sessionDelegate = repository;
  }

  async read(key: string) {
    const session = await this.sessionDelegate.findUnique({ where: { key } });
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
    await this.sessionDelegate.delete({ where: { key } });
  }
}
