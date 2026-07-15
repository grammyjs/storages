import { ISession } from '@grammyjs/storage-typeorm'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Session implements ISession {
	@PrimaryGeneratedColumn()
	id: string

	@Column('varchar')
	key: string

	@Column('text')
	value: string
}
