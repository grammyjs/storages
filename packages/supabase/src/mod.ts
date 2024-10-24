import { SupabaseClient } from '@supabase/supabase-js';

export function supabaseAdapter<T>(
	{ supabase, table }: { supabase: SupabaseClient; table: string },
) {
	if (!supabase) {
		throw new Error('Kindly pass an instance of supabase client to the parameter list.');
	}

	if (!table) {
		throw new Error('Kindly pass a table to the parameter list.');
	}

	return {
		read: async (id: string) => {
			const { data, error } = await supabase.from(table).select('session').eq(
				'id',
				id,
			)
				.single();

			if (error || !data) {
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
