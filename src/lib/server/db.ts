import postgres from 'postgres';
import { databaseUrl } from './config.ts';

let sql: postgres.Sql | null = null;

/** One pool for RSVPs and Hackatime. Connects on the first query. */
export function db(): postgres.Sql | null {
	const url = databaseUrl();
	if (!url) return null;
	if (!sql) sql = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10 });
	return sql;
}
