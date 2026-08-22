import { eq } from 'drizzle-orm';
import { systemConfigs } from './system_configs.schema';

/**
 * 业务意图：系统配置与广告变现 D1 数据库持久化服务层。
 * 负责强类型 JSON 配置的读取、默认值降级保护 (Fallback) 与 D1 写盘更新 (Upsert)。
 */
export class SystemConfigsService {
  constructor(private db: any) {}

  /**
   * 读取指定 Key 的配置对象，若尚未配置或不存在则返回 defaultValue 降级保护
   */
  async getConfig<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const [record] = await this.db
        .select()
        .from(systemConfigs)
        .where(eq(systemConfigs.key, key))
        .limit(1);

      if (!record || !record.value) {
        return defaultValue;
      }

      return JSON.parse(record.value) as T;
    } catch (e) {
      console.error(`Failed to read system_config [${key}]:`, e);
      return defaultValue;
    }
  }

  /**
   * 将配置 Key / Value 强类型对象写入/更新 (Upsert) 到 D1 数据库中
   */
  async setConfig<T>(key: string, value: T): Promise<void> {
    const jsonStr = JSON.stringify(value);
    const now = new Date();

    const [existing] = await this.db
      .select()
      .from(systemConfigs)
      .where(eq(systemConfigs.key, key))
      .limit(1);

    if (existing) {
      await this.db
        .update(systemConfigs)
        .set({ value: jsonStr, updatedAt: now })
        .where(eq(systemConfigs.key, key));
    } else {
      await this.db.insert(systemConfigs).values({
        key,
        value: jsonStr,
        updatedAt: now,
      });
    }
  }
}
