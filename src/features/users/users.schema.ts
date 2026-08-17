import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * 业务意图：SQLite D1 `users` 用户数据表 ORM Schema 建模规范。
 * 存储用户账号核心实体：UUID 主键、唯一拼音/英文用户名、加盐 PBKDF2 密码哈希以及账号注册时间戳。
 */
export const users = sqliteTable('users', {
  // 用户账号唯一 UUID 主键
  id: text('id').primaryKey(),
  
  // 唯一用户名（用于画板 URL `/board/:username` 检索访问），加 UNIQUE 索引避免重名
  username: text('username').unique().notNull(),
  
  // Web Crypto 加盐加密存储的 SHA-256 密码哈希 (格式: salt:hash)
  passwordHash: text('password_hash').notNull(),
  
  // 账号创建与注册时间戳
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
