import { beforeAll, afterAll, test, expect, describe } from 'vitest';

import { session } from 'grammy';
import { Column, DataSource, Entity,  ObjectIdColumn, ObjectId } from 'typeorm';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { ISession, TypeormAdapter } from '../src';

import { createBot, createMessage } from '@grammyjs/storage-utils';

@Entity()
export class Session implements ISession {
  @ObjectIdColumn()
    id: ObjectId;

  @Column({ type: 'string' })
    key: string;

  @Column({ type: 'string' })
    value: string;
}

let mongod: MongoMemoryServer;
let source: DataSource;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();

  source = await new DataSource({
    type: 'mongodb',
    url: mongod.getUri(),
    entities: [Session],
  }).initialize();
});

afterAll(async () => {
  await source.destroy();
  await mongod.stop();
});

describe('Pizza counter test', () => {
  test('Pizza counter should be equals 0 on initial', async () => {
    const bot = createBot();
    const ctx = createMessage(bot);

    bot.use(session({
      initial() {
        return { pizzaCount: 0 };
      },
      storage: new TypeormAdapter({ repository: source.getRepository(Session) }),
    }));

    await bot.handleUpdate(ctx.update);

    bot.on('msg:text', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(0);
    });
  });

  test('Pizza counter should be equals 1 after first message', async () => {
    const bot = createBot();

    bot.use(session({
      initial: () => ({ pizzaCount: 0 }),
      storage: new TypeormAdapter({ repository: source.getRepository(Session) }),
    }));

    bot.hears('first', (ctx) => {
      ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
    });
    
    bot.hears('second', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(1);
    });
    
    await bot.handleUpdate(createMessage(bot, 'first').update);
    await bot.handleUpdate(createMessage(bot, 'second').update);
  });
});
