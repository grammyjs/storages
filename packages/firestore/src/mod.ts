import type { CollectionReference } from '@google-cloud/firestore';

export function adapter<T>(collection: CollectionReference) {
  return {
    read: async (key: string) => {
      const snapshot = await collection.doc(key).get();
      return snapshot.data() as T | undefined;
    },
    write: async (key: string, value: T) => {
      await collection.doc(key).set(value);
    },
    delete: async (key: string) => {
      await collection.doc(key).delete();
    },
  };
}