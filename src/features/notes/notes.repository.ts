import { eq, desc, sql } from 'drizzle-orm';
import { notes } from './notes.schema';

/**
 * 业务意图：便签数据访问层 (Repository Pattern)。
 * 封装强类型 Drizzle ORM 查询语句，直接对接 Cloudflare D1 (SQLite) 数据库进行 CRUD。
 */
export class NotesRepository {
  constructor(private db: any) {}

  /**
   * 业务意图：读取全表便签，按创建时间降序排列。
   */
  async getAllNotes() {
    return this.db.select().from(notes).orderBy(desc(notes.createdAt));
  }

  /**
   * 业务意图：查询挂载在指定用户 userId 名下的便签，按创建时间降序排列。
   */
  async getNotesByUserId(userId: string) {
    return this.db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  }

  /**
   * 业务意图：按 UUID 主键精准检索单行便签记录。
   */
  async getNoteById(id: string) {
    const list = await this.db.select().from(notes).where(eq(notes.id, id)).limit(1);
    // 分支 A：有匹配记录返回对象，无匹配记录返回 null
    return list[0] || null;
  }

  /**
   * 业务意图：向 D1 数据库 `notes` 表插入单行新卡片记录，并返回插入成功后的强类型实体。
   */
  async insertNote(noteData: {
    id: string;
    content: string;
    color: string;
    xPos: number;
    yPos: number;
    userId: string;
    authorId?: string;
    authorUsername?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return this.db.insert(notes).values(noteData).returning();
  }

  /**
   * 业务意图：更新便签在看板上的 relative X/Y 百分比坐标与更新时间戳。
   */
  async updateNotePosition(id: string, xPos: number, yPos: number) {
    return this.db
      .update(notes)
      .set({ xPos, yPos, updatedAt: new Date() })
      .where(eq(notes.id, id));
  }

  /**
   * 业务意图：更新便签的文本内容 content 与更新时间戳，返回更新后的行对象。
   */
  async updateNoteContent(id: string, content: string) {
    return this.db
      .update(notes)
      .set({ content, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
  }

  /**
   * 业务意图：根据 ID 从 D1 数据库物理删除目标便签。
   */
  async deleteNote(id: string) {
    return this.db.delete(notes).where(eq(notes.id, id));
  }

  /**
   * 业务意图：针对 likes 点赞数进行数据库级别的原子自增 (+1)，避免并发竞争。
   * 实现方式：使用 Drizzle sql 模板拼接 `likes = likes + 1` 语句（比先查后加更安全）
   */
  async incrementLikes(id: string) {
    return this.db
      .update(notes)
      .set({ likes: sql`${notes.likes} + 1` })
      .where(eq(notes.id, id))
      .returning();
  }
}
