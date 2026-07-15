import type { CollectionReference } from '@google-cloud/firestore'
import type { StorageAdapter } from 'grammy'

export function adapter<T extends Record<string, string | number | boolean | undefined | null>>(
	collection: CollectionReference
): StorageAdapter<T> {
	return {
		read: async (key: string): Promise<T | undefined> => {
			const snapshot = await collection.doc(key).get()
			return snapshot.data() as T | undefined
		},
		write: async (key: string, value: T): Promise<void> => {
			await collection.doc(key).set(value)
		},
		delete: async (key: string): Promise<void> => {
			await collection.doc(key).delete()
		},
	}
}
