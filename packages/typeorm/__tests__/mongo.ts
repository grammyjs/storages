import { beforeAll, afterAll, test, expect, describe } from 'vitest';

import { session } from 'grammy';
import { Column, createConnection, Entity, getConnection, getRepository, ObjectID, ObjectIdColumn } from 'typeorm';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { ISession, TypeormAdapter } from '../src';

import { createBot, createMessage } from '@grammyjs/grammy-storage-utils';

@Entity()
export class Session implements ISession {
  @ObjectIdColumn()
    id: ObjectID;

  @Column({ type: 'string' })
    key: string;

  @Column({ type: 'string' })
    value: string;
}

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();

  await createConnection({
    type: 'mongodb',
    url: mongod.getUri(),
    entities: [Session],
  });
});

afterAll(() => {
  mongod.stop();
  getConnection().close();
});

test('Bot should be created', () => {
  expect(createBot()).not.toBeFalsy();
});

test('Typeorm is connected and mocked successfuly', async () => {
  expect(getConnection().isConnected).toBe(true);

  const key = 'TEST KEY';
  const value = 'TEST VALUE';
  const repository = getRepository(Session);

  await repository.save({ key, value });
  expect((await repository.findOne({ key })).value).toBe(value);
});

describe('Pizza counter test', () => {
  test('Pizza counter should be equals 0 on initial', async () => {
    const bot = createBot();
    const ctx = createMessage(bot);

    bot.use(session({
      initial() {
        return { pizzaCount: 0 };
      },
      storage: new TypeormAdapter({ repository: getRepository(Session) }),
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
      storage: new TypeormAdapter({ repository: getRepository(Session) }),
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
