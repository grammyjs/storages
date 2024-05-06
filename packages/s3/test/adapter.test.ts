import {
  isObjectSession,
  S3Client,
  S3Storage,
  S3StorageClient,
} from '../adapter.ts';
import { lazySession } from 'grammy';
import { createBot, createMessage } from '@grammyjs/storage-utils';
import { assertSpyCall, spy } from '@std/testing/mock';
import { assert } from '@std/assert';

const createClient = (
  {
    exists = (key: string) => Promise.resolve(key === SESSION_KEY),
    deleteObject = () => Promise.resolve(),
    getObject = () => Promise.reject<Response>(new Error('not implemented')),
    putObject = () => Promise.resolve({ etag: '', versionId: null }),
    host = 'localhost',
    region = 'test-auto',
  }: Partial<S3StorageClient> = {},
) => ({
  exists: spy(exists),
  deleteObject: spy(deleteObject),
  getObject: spy(getObject),
  host,
  region,
  putObject: spy(putObject),
});
const SESSION_KEY = '/chat/1234567890/session.json';
const getSessionKey = () => SESSION_KEY;

Deno.test('integration test green path', async () => {
  const bot = createBot(true, true);
  const client = createClient({
    getObject: () =>
      Promise.resolve(new Response(JSON.stringify({ pizzaCount: -1 }))),
  });
  const validateSession = spy(isObjectSession);

  bot.use(lazySession({
    getSessionKey,
    initial: () => ({ pizzaCount: 0 }),
    storage: new S3Storage(client, validateSession),
  }));

  bot.hears('first', async (ctx) => {
    const session = await ctx.session;
    assertSpyCall(validateSession, 0, {
      args: [{ pizzaCount: -1 }],
      returned: true,
    });
    session.pizzaCount = 1;
  });

  await bot.handleUpdate(createMessage(bot, 'first').update);

  assertSpyCall(client.getObject, 0, { args: [SESSION_KEY] });
  assertSpyCall(client.putObject, 0, {
    args: [SESSION_KEY, JSON.stringify({ pizzaCount: 1 })],
  });
});

const endPoint = 'example.com';
const region = 'test-region';
Deno.test('new S3Storage({...}) instantiates S3Client', () => {
  const it = new S3Storage({ endPoint, region }, () => false);
  assert(it.client instanceof S3Client);
  assert(it.client.host === 'example.com');
  assert(it.client.region === region);
});
Deno.test('new S3Storage(client) uses existing instance', () => {
  const client = new S3Client({ endPoint, region });
  const it = new S3Storage(client, () => false);
  assert(it.client === client);
  assert(it.client.host === 'example.com');
  assert(it.client.region === region);
});
Deno.test('S3Storage.read returns data when validateSession returns true', async () => {
  const data = { pizzaCount: 5 };
  const client = createClient({
    getObject: () => Promise.resolve(new Response(JSON.stringify(data))),
  });

  const validateSession = spy((raw: any) => Object.hasOwn(raw, 'pizzaCount'));
  const it = new S3Storage<typeof data>(client, validateSession);

  const actual = await it.read(SESSION_KEY);

  assertSpyCall(validateSession, 0, { args: [data], returned: true });
  assert(actual?.pizzaCount === 5);
});
Deno.test('S3Storage.read returns undefined when validateSession returns false', async () => {
  const data = { noPizzaCount: 5 };
  const client = createClient({
    getObject: () => Promise.resolve(new Response(JSON.stringify(data))),
  });

  const it = new S3Storage<typeof data>(
    client,
    (raw) => Object.hasOwn(raw, 'pizzaCount'),
  );

  assert(await it.read(SESSION_KEY) === undefined);
});
Deno.test('S3Storage.read returns undefined when the object exists but contains no json', async () => {
  const data = { pizzaCount: 5 };
  const client = createClient({
    getObject: () =>
      Promise.resolve(new Response('<html>some error page or XML</html>')),
  });

  const it = new S3Storage<typeof data>(client, () => true);

  assert(await it.read(SESSION_KEY) === undefined);
});
Deno.test('S3Storage.read returns undefined when the object doesn\'t exist', async () => {
  const data = { pizzaCount: 5 };
  const client = createClient({
    getObject: () =>
      Promise.reject(new Error('thrown because if http status code > 400')),
  });

  const it = new S3Storage<typeof data>(client, () => false);

  assert(await it.read(SESSION_KEY) === undefined);
});
Deno.test('S3Storage.read returns undefined when the key is invalid', async () => {
  const data = { pizzaCount: 5 };
  const client = new S3Client({ endPoint, region });

  const it = new S3Storage<typeof data>(client, () => false);

  assert(await it.read('') === undefined);
});
