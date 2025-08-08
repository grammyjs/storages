import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import type { StorageAdapter } from 'grammy/web';

export interface DynamoDBAdapterConfig {
  instance: DynamoDBDocumentClient;
  tableName: string;
  ttl?: number;
  sessionKey?: string;
  ttlKey?: string;
}

export class DynamoDBAdapter<T> implements StorageAdapter<T> {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;
  private readonly ttl?: number;
  private readonly sessionKey: string;
  private readonly ttlKey: string;

  constructor({ instance, tableName, ttl, sessionKey = 'sessionKey', ttlKey = 'ttl' }: DynamoDBAdapterConfig) {
    if (!instance) {
      throw new Error(
        'You should pass DynamoDBDocumentClient instance to constructor.'
      );
    }

    if (!tableName) {
      throw new Error('You should pass tableName to constructor.');
    }

    this.client = instance;
    this.tableName = tableName;
    this.ttl = ttl;
    this.sessionKey = sessionKey;
    this.ttlKey = ttlKey;
  }

  async read(key: string): Promise<T | undefined> {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { [this.sessionKey]: key },
        })
      );

      if (!result.Item || !result.Item.sessionData) {
        return undefined;
      }

      return JSON.parse(result.Item.sessionData) as T;
    } catch (error) {
      console.error('Error reading from DynamoDB:', error);
      return undefined;
    }
  }

  async write(key: string, value: T): Promise<void> {
    const item: any = {
      [this.sessionKey]: key,
      sessionData: JSON.stringify(value),
    };

    if (this.ttl) {
      item[this.ttlKey] = Math.floor(Date.now() / 1000) + this.ttl;
    }

    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: item,
        })
      );
    } catch (error) {
      console.error('Error writing to DynamoDB:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { [this.sessionKey]: key },
        })
      );
    } catch (error) {
      console.error('Error deleting from DynamoDB:', error);
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { [this.sessionKey]: key },
          ProjectionExpression: 'sessionKey',
        })
      );

      return !!result.Item;
    } catch (error) {
      console.error('Error checking key existence in DynamoDB:', error);
      return false;
    }
  }
}
