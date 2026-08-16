import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { users } from '../users/users.schema';

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  color: text('color').notNull(), // 'yellow' | 'pink' | 'blue' | 'green' | 'purple'
  xPos: real('x_pos').default(50).notNull(), // X coordinate percentage (0 - 100)
  yPos: real('y_pos').default(50).notNull(), // Y coordinate percentage (0 - 100)
  userId: text('user_id').notNull().references(() => users.id),
  likes: integer('likes').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
