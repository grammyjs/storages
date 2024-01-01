import { session } from 'grammy';
import { DynamoDBAdapter } from '../src';
import { test, expect, describe, beforeEach } from 'vitest';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import dynamodb from './helpers/dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

describe('Pizza counter test', () => {
  const ddbMock = mockClient(DynamoDBClient);

  beforeEach(() => {
    ddbMock.reset();
  });

  const adapter = new DynamoDBAdapter({
    tableName: 'grammy_test_table',
    dynamoDbClient: dynamodb,
  });

  test('Pizza counter should be equals 0 on initial', async () => {
    const bot = createBot();
    const firstMessage = createMessage(bot);

    ddbMock.resolves({});

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

    ddbMock.resolves({}).on(GetItemCommand)
      .resolvesOnce({ Item: { id: { S: '1' }, Value: { S: '{"pizzaCount":0}' } } })
      .resolvesOnce({ Item: { id: { S: '1' }, Value: { S: '{"pizzaCount":1}' } } });

    await bot.handleUpdate(firstMessage.update);
    await bot.handleUpdate(secondMessage.update);
  });
});
