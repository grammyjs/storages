import { SupabaseClient } from './deps.node.js';
export declare function supabaseAdapter<T>({ supabase, table }: {
  supabase: SupabaseClient;
  table: string;
}): {
  read: (id: string) => Promise<T | undefined>;
  write: (id: string, value: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
};
