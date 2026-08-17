import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { users } from '../users/users.schema';

/**
 * 业务意图：SQLite D1 `notes` 便签数据表 ORM Schema 建模规范。
 * 定义存储在 Cloudflare D1 中的便签属性：UUID 主键、文本内容、莫兰迪色调代号、百分比 X/Y 坐标、归属用户外键、点赞数及时间戳。
 */
export const notes = sqliteTable('notes', {
  // 便签唯一标识 UUID 主键
  id: text('id').primaryKey(),
  
  // 便签正文内容文本
  content: text('content').notNull(),
  
  // 莫兰迪手账配色名称 ('yellow' | 'pink' | 'blue' | 'green' | 'purple')
  color: text('color').notNull(),
  
  // 相对画布宽度的 X 轴百分比坐标 (0% - 100%)
  xPos: real('x_pos').default(50).notNull(),
  
  // 相对画布高度的 Y 轴百分比坐标 (0% - 100%)
  yPos: real('y_pos').default(50).notNull(),
  
  // 关联画板主人的 Users 表外键 ID
  userId: text('user_id').notNull().references(() => users.id),
  
  // 便签发布作者用户 ID 与用户名（方便落款识别与发布者追踪）
  authorId: text('author_id'),
  authorUsername: text('author_username'),
  
  // 累计点赞数计数器，默认初始为 0
  likes: integer('likes').default(0).notNull(),
  
  // 记录创建时间戳（毫秒级 Unix Timestamp）
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  
  // 记录最后一次更新修改时间戳
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
