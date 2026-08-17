import { drizzle } from 'drizzle-orm/d1';
import * as notesSchema from '../features/notes/notes.schema';
import * as usersSchema from '../features/users/users.schema';

// 汇聚整合全部模块的 Drizzle ORM 数据表 Schema 定义对象
const schema = { ...notesSchema, ...usersSchema };

/**
 * 业务意图：D1 数据库客户端实例构建工厂函数 (Database Singleton Factory)。
 * 在 Edge 运行时按需绑定 Cloudflare Worker 的 D1 实例，返回带强类型 Schema 提示的 Drizzle ORM 查询器。
 * 副作用：无持久化存储开销，仅在 Worker 请求生命周期内实例化 ORM Client。
 */
export function getDb(d1: D1Database) {
  // 【步骤 1/1】传入 Cloudflare 全局变量 d1 绑定，结合 Schema 强类型约束生成 Drizzle API 查询对象
  return drizzle(d1, { schema });
}
