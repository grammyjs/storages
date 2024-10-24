import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { session } from "grammy";
import { Column, DataSource, Entity, ObjectId, ObjectIdColumn } from "typeorm";

import { ISession, TypeormAdapter } from "../src";

import { createBot, createMessage } from "@grammyjs/storage-utils";

@Entity()
export class Session implements ISession {
	@ObjectIdColumn()
	id: ObjectId;

	@Column({ type: "string" })
	key: string;

	@Column({ type: "string" })
	value: string;
}

let source: DataSource;

beforeAll(async () => {
	source = await new DataSource({
		type: "mongodb",
		url: "mongodb://localhost:27017/testdb",
		entities: [Session],
	}).initialize();
});

afterAll(async () => {
	await source?.destroy();
});

describe("Pizza counter test", () => {
	test("Pizza counter should be equals 0 on initial", async () => {
		const bot = createBot();
		const ctx = createMessage(bot);

		bot.use(session({
			initial() {
				return { pizzaCount: 0 };
			},
			storage: new TypeormAdapter({
				repository: source.getRepository(Session),
			}),
		}));

		await bot.handleUpdate(ctx.update);

		bot.on("msg:text", (ctx) => {
			expect(ctx.session.pizzaCount).toEqual(0);
		});
	});

	test("Pizza counter should be equals 1 after first message", async () => {
		const bot = createBot();

		bot.use(session({
			initial: () => ({ pizzaCount: 0 }),
			storage: new TypeormAdapter({
				repository: source.getRepository(Session),
			}),
		}));

		bot.hears("first", (ctx) => {
			ctx.session.pizzaCount = Number(ctx.session.pizzaCount) + 1;
		});

		bot.hears("second", (ctx) => {
			expect(ctx.session.pizzaCount).toEqual(1);
		});

		await bot.handleUpdate(createMessage(bot, "first").update);
		await bot.handleUpdate(createMessage(bot, "second").update);
	});
});
