import { StorageAdapter } from 'grammy';
import { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

export interface DynamoDBAdapterOptions {
  tableName: string;
  dynamoDbClient: DynamoDBClient
}

export class DynamoDBAdapter<T> implements StorageAdapter<T> {
  private client: DynamoDBClient;
  private tableName: string;

  constructor(options: DynamoDBAdapterOptions) {
    this.client = options.dynamoDbClient;
    this.tableName = options.tableName;
  }

  async read(key: string) {
    const getItemCommand = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        id: { S: key },
      },
    });

    try {
      const response = await this.client.send(getItemCommand);
      const item = response.Item;
      if (item) {
        return JSON.parse(item.Value.S) as T;
      }
    } catch (error) {
      console.error('Error reading item from DynamoDB:', error);
    }
  }

  async write(key: string, data: T) {
    const putItemCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        id: { S: key },
        Value: { S: JSON.stringify(data) },
      },
    });

    try {
      await this.client.send(putItemCommand);
    } catch (error) {
      console.error('Error writing item to DynamoDB:', error);
    }
  }

  async delete(key: string) {
    const deleteItemCommand = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        id: { S: key },
      },
    });

    try {
      await this.client.send(deleteItemCommand);
    } catch (error) {
      console.error('Error deleting item from DynamoDB:', error);
    }
  }
}
