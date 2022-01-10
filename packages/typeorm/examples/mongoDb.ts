import { Bot, Context, session, SessionFlavor } from "grammy";
import { TypeormAdapter, ISession } from "@grammyjs/grammy-typeorm-storage";
import { Column, createConnection, Entity, getRepository, ObjectID, ObjectIdColumn } from 'typeorm';

interface SessionData {
  counter: number;
}
type MyContext = Context & SessionFlavor<SessionData>;


@Entity()
export class Session implements ISession {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  key: string;

  @Column()
  value: string;
}

async function bootstrap() {
  await createConnection({
    type: 'mongodb',
    url: 'mongodb://localhost:27017/mydb',
    entities: [Session]
  });

  const bot = new Bot<MyContext>("");
  bot.use(
    session({
      initial: () => ({ counter: 0 }),
      storage: new TypeormAdapter({ repository: getRepository(Session) }),
    })
  );
  
  bot.command("stats", (ctx) =>
    ctx.reply(`Already got ${ctx.session.counter} photos!`)
  );
  bot.on(":photo", (ctx) => ctx.session.counter++);
  
  bot.start();
}

bootstrap()

