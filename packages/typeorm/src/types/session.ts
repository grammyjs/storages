import { ObjectId } from 'mongodb'

export interface ISession {
	id: string | ObjectId | number
	key: string
	value: string
}
