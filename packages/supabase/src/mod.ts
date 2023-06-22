import { SupabaseClient } from './deps.deno.ts';

type Opts = {
  supabase: SupabaseClient,
  table: string
}

export function supabaseAdapter<T>({ supabase, table }: Opts) {
  if (!supabase) {
    throw new Error('Kindly pass an instance of supabase client to the parameter list.');
  } 
  
  if (!table) {
    throw new Error('Kindly pass a table to the parameter list.');
  }

  return {
    read: async (id: string) => {
      const { data, error } = await supabase.from(table).select(table).eq('id', id).limit(1).single();

      if (error) {
        throw error;
      }

      if (!data) {
        return undefined;
      }

      return JSON.parse(data.session) as T;
    },
    write: async (id: string, value: T) => {
      const input = { id, session: JSON.stringify(value) };

      await supabase.from(table).upsert(input);
    },
    delete: async (id: string) => {
      await supabase.from(table).delete().match({ id });
    },
  };
}