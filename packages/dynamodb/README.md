# DynamoDB Storage for grammY

This package provides a [DynamoDB](https://aws.amazon.com/dynamodb/) storage adapter for [grammY](https://grammy.dev) sessions.

## Installation

```bash
npm install @grammyjs/storage-dynamodb @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

## Usage

### With Sessions

```typescript
import { Bot, Context, session, SessionFlavor } from 'grammy';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBAdapter } from '@grammyjs/storage-dynamodb';

// Define the shape of our session.
interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>('your-bot-token');

// Build your own DynamoDBClient. You may need to pass credentials here
const client = new DynamoDBClient({
  region: 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

bot.use(
  session({
    initial: () => ({ counter: 0 }),
    storage: new DynamoDBAdapter({
      instance: docClient,
      tableName: 'telegram_sessions',
      ttl: 60 * 60 * 24 * 30, // 30 days
    }),
  })
);
```

### With Conversations

```typescript
import { Bot, Context } from 'grammy';
import { ConversationFlavor, conversations } from '@grammyjs/conversations';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBAdapter } from '@grammyjs/storage-dynamodb';

// Build your own DynamoDBClient. You may need to pass credentials here
const client = new DynamoDBClient({
  region: 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

const bot = new Bot<ConversationFlavor<Context>>('your-bot-token');

bot.use(
  conversations({
    storage: new DynamoDBAdapter({
      instance: docClient,
      tableName: 'ConversationSessions',
      ttl: 24 * 60 * 60, // 24 hours in seconds
    }),
  })
);
```

## Configuration

The `DynamoDBAdapter` constructor accepts the following options:

- `instance` (required): An instance of `DynamoDBDocumentClient`
- `tableName` (required): The name of the DynamoDB table
- `ttl` (optional): Session time to live in SECONDS. If not provided, uncleaned sessions (due to crash) may stay forever
- `sessionKey` (optional): The name of the primary key field in the DynamoDB table. Defaults to `'sessionKey'`
- `ttlKey` (optional): The name of the TTL field in the DynamoDB table. Defaults to `'ttl'`

## DynamoDB Table Setup

You need to create a DynamoDB table with the following structure:

### Table Configuration

- **Table name**: `GrammySessions` (or your custom table name)
- **Partition key**: `sessionKey` (or the value you've set for `sessionKey`)
- **Sort key**: None

### Using AWS CLI

```bash
aws dynamodb create-table \
  --table-name GrammySessions \
  --attribute-definitions AttributeName=sessionKey,AttributeType=S \
  --key-schema AttributeName=sessionKey,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### Using Terraform

```hcl
resource "aws_dynamodb_table" "grammy_sessions" {
  name           = "GrammySessions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "sessionKey"

  attribute {
    name = "sessionKey"
    type = "S"
  }

  # Optional, to be added only if TTL is used
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}
```

## TTL (Time To Live)

Grammy automatically cleans session and conversation data. For session, [data is removed the next time the respective session data is read](https://grammy.dev/plugins/session#timeouts). For conversation, data is removed when the conversation ends.

This adapter allows to leverage the [native DynamoDB TTL](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) to remove items after some time. This helps prevent the table from growing indefinitely. You can enable TTL on your DynamoDB table to automatically delete expired items:

```bash
aws dynamodb update-time-to-live \
  --table-name GrammySessions \
  --time-to-live-specification Enabled=true,AttributeName=ttl
```

## Authentication

Since you pass the DynamoDB client instance yourself, you have full control over authentication. The AWS SDK supports several authentication methods:

1. **Environment variables**: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
2. **AWS credentials file**: `~/.aws/credentials`
3. **IAM roles** (when running on EC2/Lambda/ECS)
4. **Explicit credentials** in the client constructor

## Required IAM Permissions

Make sure your AWS credentials have the following DynamoDB permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"],
      "Resource": "arn:aws:dynamodb:region:account-id:table/GrammySessions"
    }
  ]
}
```

## Error Handling

The adapter includes built-in error handling and logging. Errors during read operations return `undefined`, while write and delete operations will throw errors.
