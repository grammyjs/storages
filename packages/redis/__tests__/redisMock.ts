export class RedisMock {
  private store: Map<string, unknown> = new Map();

  get(key: string) {
    return Promise.resolve(this.store.get(key));
  }

  set(key: string, data: string | number | Uint8Array) {
    Promise.resolve(this.store.set(key, data));
  }

  del(key: string) {
    Promise.resolve(this.store.delete(key));
  }
}