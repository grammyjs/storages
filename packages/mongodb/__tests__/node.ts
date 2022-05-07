// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import test from 'node:test';
import assert from 'node:assert';

import { session } from 'grammy';
import { MongoClient, Collection } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createBot, createMessage } from '@grammyjs/storage-utils';


import { ISession, MongoDBAdapter } from '../dist/cjs/mod';

let mongod: MongoMemoryServer;
let client: MongoClient;
let collection: Collection<ISession>;

async function createMongoServer() {
  mongod = await MongoMemoryServer.create();
  client = new MongoClient(`${mongod.getUri()}/testdb`);
  await client.connect();
  collection = client.db('testdb').collection('sessions');
}

async function stopMongoServer() {
  await client.close();
  await mongod.stop();
}

test('Pizza counter test', async (t) => {
  await createMongoServer();

  const bot = createBot();

  bot.use(session({
    initial: () => ({ pizzaCount: 0 }),
    storage: new MongoDBAdapter({ collection }),
  }));

  bot.hears('first', (ctx) => {
    assert.equal(ctx.session.pizzaCount, 0);
    ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
  });
  
  bot.hears('second', (ctx) => {
    assert.equal(ctx.session.pizzaCount, 1);
  });
  
  await bot.handleUpdate(createMessage(bot, 'first').update);
  await bot.handleUpdate(createMessage(bot, 'second').update);

  await stopMongoServer();
});

test('Test storing of simple string', async (t) => {
  await createMongoServer();

  const bot = createBot(false);

  bot.use(session({
    initial() {
      return 'test';
    },
    storage: new MongoDBAdapter({ collection }),
  }));

  bot.hears('first', async (ctx) => {
    assert.equal(ctx.session, 'test');
    ctx.session = `${ctx.session} edited`;
  });
  
  bot.hears('second', async (ctx) => {
    assert.equal(ctx.session, 'test edited');
  });
  
  await bot.handleUpdate(createMessage(bot, 'first').update);
  await bot.handleUpdate(createMessage(bot, 'second').update);

  await stopMongoServer();
});