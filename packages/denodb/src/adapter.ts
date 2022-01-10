import { Database, StorageAdapter } from './deps.ts';
import { Session } from './model.ts';

export class DenoDBAdapter<T> implements StorageAdapter<T> {
  constructor(db: Database) {
    db.link([Session]);
  }

  async read(key: string) {
    const session = await Session.find(key);
    return session ? JSON.parse(session.value as string) : undefined;
  }

  async write(key: string, value: T) {
    const session = await Session.find(key);
    if (session) {
      session.value = JSON.stringify(value);
      await session.update();
    } else {
      await Session.create({
        key,
        value: JSON.stringify(value),
      });
    }
  }

  async delete(key: string) {
    await Session.deleteById(key);
  }
}
