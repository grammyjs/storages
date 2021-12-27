import type { Client } from 'pg';
export type { StorageAdapter } from 'grammy';
export type { Client } from 'pg';

export function buildQueryRunner(client: Client) {
  return async (query: string, params?: string[]) => {
    const { rows } = await client.query(query, params);

    return rows;
  };
}
