import { StorageAdapter } from 'https://lib.deno.dev/x/grammy@1.x/mod.ts';
import { S3Client } from 'jsr:@bradenmacdonald/s3-lite-client@0.7.4';
export { S3Client } from 'jsr:@bradenmacdonald/s3-lite-client@0.7.4';
/**
 * The type of the constructor argument for S3Client
 */
// vendored from https://github.com/bradenmacdonald/s3-lite-client/blob/b34c604d0e9c3741919c92bc0151ec7d13eae467/client.ts#L15C1-L29C2
// can be removed when https://github.com/bradenmacdonald/s3-lite-client/pull/38 is merged
export interface S3ClientOptions {
  /** Hostname of the endpoint. Not a URL, just the hostname with no protocol or port. */
  endPoint: string;
  accessKey?: string;
  secretKey?: string;
  sessionToken?: string;
  useSSL?: boolean | undefined;
  port?: number | undefined;
  /** Default bucket name, if not specified on individual requests */
  bucket?: string;
  /** Region to use, e.g. "us-east-1" */
  region: string;
  /** Use path-style requests, e.g. https://endpoint/bucket/object-key instead of https://bucket/object-key (default: true) */
  pathStyle?: boolean | undefined;
}

export type S3StorageClient = Pick<
S3Client,
'exists' | 'deleteObject' | 'getObject' | 'host' | 'region' | 'putObject'
>;
const isS3StorageClient = (
  maybeClient: S3StorageClient | any,
): maybeClient is S3StorageClient =>
  ['exists', 'deleteObject', 'getObject', 'putObject'].every((required) =>
    typeof maybeClient[required] === 'function'
  );

export const isObjectSession = (maybeSession: any): maybeSession is object =>
  !!maybeSession && typeof maybeSession === 'object';

export class S3Storage<T> implements StorageAdapter<T> {
  readonly client: S3StorageClient;
  constructor(
    clientOrOptions: S3StorageClient | S3ClientOptions,
    readonly validateSession: (data: any) => boolean,
  ) {
    this.client = isS3StorageClient(clientOrOptions)
      ? clientOrOptions
      : new S3Client(clientOrOptions);
  }
  /**
   * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
   */
  readonly isSafe = (key: string): boolean => /^[-0-9a-zA-Z!_.()]+$/.test(key);

  readonly delete = (key: string): Promise<void> =>
    this.client.deleteObject(key);
  readonly has = (key: string): Promise<boolean> => this.client.exists(key);
  readonly read = async (key: string): Promise<T | undefined> => {
    try {
      const res = await this.client.getObject(key);
      const data = await res.json() as T;
      return this.validateSession(data) ? data : undefined;
    } catch {
      return undefined;
    }
  };

  readonly write = async (key: string, value: T): Promise<void> => {
    // the client has a mismatching return type
    // to make type checks happy we await it, and intentionally do not return it
    await this.client.putObject(key, JSON.stringify(value));
  };
}
