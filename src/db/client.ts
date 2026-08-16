import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../features/notes/notes.schema';

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
