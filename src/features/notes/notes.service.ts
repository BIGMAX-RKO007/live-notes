import { NotesRepository } from './notes.repository';

/**
 * 业务意图：便签业务逻辑服务层 (Domain Service)。
 * 负责核心业务校验、随机分布坐标算法计算、实体 UUID 生成，透传数据操作至下层 Repository。
 */
export class NotesService {
  constructor(private notesRepo: NotesRepository) {}

  /**
   * 业务意图：获取全库全量便签（仅保留基础查询）。
   */
  async getAllNotes() {
    return this.notesRepo.getAllNotes();
  }

  /**
   * 业务意图：按用户 ID 查出该用户个人画板下挂载的所有便签卡片。
   */
  async getNotesByUserId(userId: string) {
    return this.notesRepo.getNotesByUserId(userId);
  }

  /**
   * 业务意图：按 UUID 主键精准检索单个便签实体。
   */
  async getNoteById(id: string) {
    return this.notesRepo.getNoteById(id);
  }

  /**
   * 业务意图：创建新便签核心算法逻辑。
   * 副作用：过滤空白符；生成屏幕 15%-75% 范围内的随机 X/Y 坐标（避免多张卡片完全重叠覆盖）；写 D1 库。
   */
  async createNote(content: string, color: string, userId: string) {
    // 【步骤 1/4】业务校验：清洗文本并检查非空
    const trimmedContent = content.trim();
    
    // 分支 A：输入全为空白字符 (Guard Clause)
    if (!trimmedContent) {
      throw new Error('留言内容不能为空');
    }

    // 【步骤 2/4】核心算法：随机分布坐标计算
    // 业务语义：防止新新增便签全部堆在左上角 (0,0) 位置导致重叠，限制在 15% 到 75% 相对百分比画框内
    const xPos = Math.floor(Math.random() * 60) + 15;
    const yPos = Math.floor(Math.random() * 60) + 15;

    // 【步骤 3/4】生成唯一 UUID 主键与时间戳
    const id = crypto.randomUUID();
    const now = new Date();

    // 【步骤 4/4】透传调用仓储层写入 D1 数据库并返回插入记录
    const [newNote] = await this.notesRepo.insertNote({
      id,
      content: trimmedContent,
      color,
      xPos,
      yPos,
      userId,
      createdAt: now,
      updatedAt: now,
    });

    return newNote;
  }

  /**
   * 业务意图：更新便签在画板上的相对百分比坐标。
   */
  async updatePosition(id: string, xPos: number, yPos: number) {
    return this.notesRepo.updateNotePosition(id, xPos, yPos);
  }

  /**
   * 业务意图：更新便签文字内容。
   * 副作用：过滤空白符，抛出非空或记录未找到异常。
   */
  async updateContent(id: string, content: string) {
    // 【步骤 1/3】清洗输入文本
    const trimmedContent = content.trim();

    // 分支 A：文本非空校验 (Guard Clause)
    if (!trimmedContent) {
      throw new Error('留言内容不能为空');
    }

    // 【步骤 2/3】调用仓储层 UPDATE 语法
    const [updatedNote] = await this.notesRepo.updateNoteContent(id, trimmedContent);

    // 分支 B：更新结果为空（可能已在其他端被删除）
    if (!updatedNote) {
      throw new Error('未找到该留言');
    }

    return updatedNote;
  }

  /**
   * 业务意图：删除便签。
   */
  async deleteNote(id: string) {
    return this.notesRepo.deleteNote(id);
  }

  /**
   * 业务意图：便签点赞原子 +1。
   * 副作用：更新库中 likes 字段，返回最新点赞数。
   */
  async incrementLikes(id: string) {
    // 【步骤 1/2】调用仓储层原子自增 SQL
    const [updatedNote] = await this.notesRepo.incrementLikes(id);

    // 分支 A：目标便签不存在
    if (!updatedNote) {
      throw new Error('未找到该留言');
    }
    return updatedNote;
  }
}
