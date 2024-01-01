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
