# DynamoDB storage adapter for grammY

Storage adapter that can be used to [store your session data](https://grammy.dev/plugins/session.html) with [AWS DynamoDB](https://aws.amazon.com/dynamodb/) when using sessions.

## Installation

```bash
npm install @grammyjs/storage-dynamodb --save
```

## Usage

You can check the [examples](https://github.com/grammyjs/storages/tree/main/packages/dynamodb/examples) folder, or simply use followed code:

Create a DynamoDB table using [Terraform](https://github.com/hashicorp/terraform):

```hcl
resource "aws_dynamodb_table" "test_table" {
  name         = "grammy_test_table"
  hash_key     = "id"
  billing_mode = "PAY_PER_REQUEST"
  attribute {
    name = "id"
    type = "S"
  }
}
```
> The `id` hash key is required for this adapter to work.
>
> AWS credentials are needed in order to deploy the previous resource.
> It is recommended to store Terraform state in a remote backend.

Deploy resource:

```bash
terraform init
terraform plan
terraform apply
```

Create bot and pass adapter as storage:

```ts
import { Bot, Context, session, SessionFlavor } from "grammy";
import { DynamoDBAdapter } from "@grammyjs/storage-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";


interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;

const client = new DynamoDBClient();

async function bootstrap() {
  const bot = new Bot<MyContext>("");
  bot.use(
    session({
      initial: () => ({ counter: 0 }),
      storage: new DynamoDBAdapter<SessionData>({
        tableName: "grammy_test_table",
        dynamoDbClient: client
      }),
    })
  );

  bot.command("stats", (ctx) =>
    ctx.reply(`Already got ${ctx.session.counter} photos!`)
  );
  bot.on(":photo", (ctx) => ctx.session.counter++);

  bot.start();
}

bootstrap();
```
