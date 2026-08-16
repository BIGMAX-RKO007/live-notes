import { drizzle } from 'drizzle-orm/d1';
import * as notesSchema from '../features/notes/notes.schema';
import * as usersSchema from '../features/users/users.schema';

const schema = { ...notesSchema, ...usersSchema };

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
