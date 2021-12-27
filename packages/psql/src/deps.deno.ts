import type { Client } from 'https://deno.land/x/postgres@v0.14.2/mod.ts';
export type { StorageAdapter } from 'https://deno.land/x/grammy@v1.5.4/mod.ts';
export type { Client } from 'https://deno.land/x/postgres@v0.14.2/mod.ts';

export function buildQueryRunner(client: Client) {
  return async (text: string, args?: string[]) => {
    const result = await client.queryArray({
      text,
      args,
    });

    return result.rows.map((row) => ({ key: row[0], value: row[1] }));
  };
}
