import { Column, DataSource, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ISession } from '../../src/types/session';

@Entity()
export class Session implements ISession {
  @PrimaryGeneratedColumn()
    id: string;

  @Column('varchar')
    key: string;

  @Column('text')
    value: string;
}

export default () => {
  return new DataSource({
    name: 'default',
    type: 'better-sqlite3',
    database: ':memory:',
    entities: [Session],
    synchronize: true,
  }).initialize();
};
