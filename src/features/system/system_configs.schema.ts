import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * 业务意图：系统配置与广告变现持久化 D1 数据表 ORM Schema。
 * 用于替代内存配置对象 `ads.config.ts` 的运行期易失性存取，落地实现 Serverless 分布式无状态持久化。
 */
export const systemConfigs = sqliteTable('system_configs', {
  // 配置健 Key (如 'ad_sponsor_note', 'ad_corner_bookmark', 'ad_google_adsense')
  key: text('key').primaryKey(),

  // 配置内容 JSON 字符串
  value: text('value').notNull(),

  // 最后更新修改时间戳
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
