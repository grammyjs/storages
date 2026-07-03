import { SupabaseClient } from '@supabase/supabase-js'

import type { StorageAdapter } from 'grammy'

interface Session {
	id: string
	session: string
}

export function supabaseAdapter<T>({
	supabase,
	table,
}: {
	supabase: SupabaseClient
	table: string
}): StorageAdapter<T> {
	if (!supabase) {
		throw new Error('Kindly pass an instance of supabase client to the parameter list.')
	}

	if (!table) {
		throw new Error('Kindly pass a table to the parameter list.')
	}

	return {
		read: async (id: string): Promise<T | undefined> => {
			const { data, error } = await supabase
				.from<Session>(table)
				.select('session')
				.eq('id', id)
				.single()

			if (error || !data) {
				return undefined
			}

			return JSON.parse(data.session) as T
		},
		write: async (id: string, value: T): Promise<void> => {
			const input = { id, session: JSON.stringify(value) }

			await supabase.from<Session>(table).upsert(input, { returning: 'minimal' })
		},
		delete: async (id: string): Promise<void> => {
			await supabase.from<Session>(table).delete({ returning: 'minimal' }).match({ id })
		},
	}
}
