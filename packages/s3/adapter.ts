import {
  S3Client,
  type S3ClientOptions,
  type StorageAdapter,
} from './deps.deno.ts';
export { S3Client, type S3ClientOptions } from './deps.deno.ts';

export type S3StorageClient = Pick<
S3Client,
'exists' | 'deleteObject' | 'getObject' | 'host' | 'region' | 'putObject'
>;
function isS3StorageClient(
  maybeClient: S3StorageClient | S3ClientOptions,
): maybeClient is S3StorageClient {
  return ['exists', 'deleteObject', 'getObject', 'putObject'].every(
    (required) =>
      typeof maybeClient[required as keyof typeof maybeClient] === 'function',
  );
}

export function isObjectSession(maybeSession: unknown): maybeSession is object {
  return !!maybeSession && typeof maybeSession === 'object';
}

export class S3Storage<T> implements StorageAdapter<T> {
  readonly client: S3StorageClient;
  constructor(
    clientOrOptions: S3StorageClient | S3ClientOptions,
    readonly validateSession: (data: T | unknown) => boolean,
  ) {
    this.client = isS3StorageClient(clientOrOptions)
      ? clientOrOptions
      : new S3Client(clientOrOptions);
  }

  /**
   * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
   */
  isSafe(key: string): boolean {
    return /^[-0-9a-zA-Z!_.()]+$/.test(key);
  }

  async delete(key: string): Promise<void> {
    return await this.client.deleteObject(key);
  }

  async has(key: string): Promise<boolean> {
    return await this.client.exists(key);
  }

  async read(key: string): Promise<T | undefined> {
    try {
      const res = await this.client.getObject(key);
      const data = (await res.json()) as T;
      return this.validateSession(data) ? data : undefined;
    } catch {
      return undefined;
    }
  }

  async write(key: string, value: T): Promise<void> {
    // the client has a mismatching return type
    // to make type checks happy we await it, and intentionally do not return it
    await this.client.putObject(key, JSON.stringify(value));
  }
}
