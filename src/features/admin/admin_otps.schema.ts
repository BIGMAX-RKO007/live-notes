import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * 管理员邮箱 OTP 动态验证码表 Schema (Cloudflare D1 SQLite)
 */
export const adminOtps = sqliteTable('admin_otps', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expiresAt: integer('expires_at').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  createdAt: integer('created_at').notNull(),
});
