import { session } from 'grammy';
import { DynamoDBAdapter } from '../src';
import { test, expect, describe, beforeEach } from 'vitest';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import dynamodb from './helpers/dynamodb';

beforeEach(async () => {
  await dynamodb.send(new DeleteItemCommand({
    TableName: 'grammy_test_table',
    Key: {
      id: {
        S: '1',
      },
    },
  }));
});

describe('Pizza counter test', () => {

  const adapter = new DynamoDBAdapter({
    tableName: 'grammy_test_table',
    dynamoDbClient: dynamodb,
  });

  test('Pizza counter should be equals 0 on initial', async () => {
    const bot = createBot();
    const firstMessage = createMessage(bot);

    bot.use(
      session<any, any>({
        initial: () => ({ pizzaCount: 0 }),
        storage: adapter,
      }),
    );
    bot.on('msg:text', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(0);
    });

    await bot.handleUpdate(firstMessage.update);
  });

  test('Pizza counter should be equals 1 after first message', async () => {
    const bot = createBot();

    bot.use(
      session<any, any>({
        initial: () => ({ pizzaCount: 0 }),
        storage: new DynamoDBAdapter({
          tableName: 'grammy_test_table',
          dynamoDbClient: dynamodb,
        }),
      })
    );
    bot.hears('first', (ctx) => {
      ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
    });

    bot.hears('second', (ctx) => {
      expect(ctx.session.pizzaCount).toEqual(1);
      ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
    });

    const firstMessage = createMessage(bot, 'first');
    const secondMessage = createMessage(bot, 'second');

    await bot.handleUpdate(firstMessage.update);
    await bot.handleUpdate(secondMessage.update);
  });
});
