import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDBClient();
export default dynamodb;
