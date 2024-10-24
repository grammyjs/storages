import { type StorageAdapter } from 'grammy';

export interface ISession {
	_id: { $oid: string };
	key: string;
	value: unknown;
}

interface Collection<T> {
	findOne(filter: { key: string }): Promise<T | null>;
	updateOne(
		filter: { key: string },
		update: { $set: { key: string; value: unknown } },
		opts: { upsert: true },
	): Promise<any>;
	deleteOne(filter: { key: string }): Promise<any>;
}

export class MongoDBAdapter<T> implements StorageAdapter<T> {
	private collection: Collection<ISession>;

	constructor({ collection }: { collection: Collection<ISession> }) {
		this.collection = collection;
	}

	async read(key: string): Promise<T | undefined> {
		const session = await this.collection.findOne({ key });

		if (session === null || session === undefined) {
			return undefined;
		}

		return session.value as T;
	}

	async write(key: string, data: T): Promise<void> {
		await this.collection.updateOne({
			key,
		}, {
			$set: {
				key,
				value: data,
			},
		}, { upsert: true });
	}

	async delete(key: string): Promise<void> {
		await this.collection.deleteOne({ key });
	}
}
