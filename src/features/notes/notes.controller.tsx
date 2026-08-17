import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { getDb } from '../../db/client';
import { NotesRepository } from './notes.repository';
import { NotesService } from './notes.service';
import { users } from '../users/users.schema';
import { JWT_SECRET } from '../auth/auth.controller';
import { eq } from 'drizzle-orm';
import { canUserPerformNoteAction, NotePermissionAction } from './notes.permission';

// 便签关联展现组件
import { Note } from './components/Note';
import { NoteEditForm } from './components/NoteEditForm';

// 声明 Cloudflare Workers 环境变量 Bindings 强类型映射
type Bindings = {
  DB: D1Database;
};

// 实例化便签 API 控制器子应用 notesApp
const notesApp = new Hono<{ Bindings: Bindings }>();

/**
 * 业务意图：手动依赖注入助手函数。初始化数据库连接、Repository 仓储层与 Service 业务逻辑层。
 * 副作用：实例化三层架构对象。
 */
const getNotesService = (d1: D1Database) => {
  const db = getDb(d1);
  const repo = new NotesRepository(db);
  return new NotesService(repo);
};

export type NoteAction = 'drag' | 'edit' | 'delete';

interface NoteAuthResult {
  currentUserId: string;
  service: NotesService;
  note: any;
  isBoardOwner: boolean;
  isNoteAuthor: boolean;
}

/**
 * 业务意图：集中式便签权限校验与矩阵判定助手函数。
 * 明确划分【画板主人 boardOwner】与【便签作者 author】在不同操作（drag/edit/delete）下的安全边界：
 * - drag: 画板主人 或 便签作者 可拖拽卡片调整布局
 * - edit: 仅便签作者 可修改留言正文
 * - delete: 画板主人（清扫画板）或 便签作者（撤回留言）可删除便签
 */
const checkNoteActionPermission = async (
  c: any, 
  noteId: string, 
  action: NoteAction
): Promise<NoteAuthResult | null> => {
  // 【步骤 1/4】凭证提取：获取客户端 Cookie 中的 sessionToken
  const sessionToken = getCookie(c, 'session');

  // 分支 A：未登录早退拦截
  if (!sessionToken) return null;

  try {
    // 【步骤 2/4】签名解密：验证 JWT Token 有效性
    const payload = await verify(sessionToken, JWT_SECRET, 'HS256');

    // 分支 B：Payload 异常早退
    if (!payload || !payload.userId) return null;

    const currentUserId = String(payload.userId);
    
    // 【步骤 3/4】查库检索便签实体
    const service = getNotesService(c.env.DB);
    const note = await service.getNoteById(noteId);

    // 分支 C：便签不存在早退
    if (!note) return null;

    // 权限身份判定
    const isBoardOwner = note.userId === currentUserId;
    const isNoteAuthor = note.authorId === currentUserId;
    const hasPermission = canUserPerformNoteAction(action as NotePermissionAction, {
      isOwner: isBoardOwner,
      isLoggedIn: true,
    });

    // 分支 D：无匹配权限，防护性拦截
    if (!hasPermission) return null;

    return { currentUserId, service, note, isBoardOwner, isNoteAuthor };
  } catch (e) {
    // 分支 E：异常保护早退
    return null;
  }
};

/**
 * 业务意图：轮询 API。响应 HTMX 每 3 秒发起的被动轮询，局部返回特定画板下的便签列表 HTML 片段。
 * 副作用：读取数据库，计算 `isOwner` 权限；返回 JSX 局部 <li> 列表片段。
 */
notesApp.get('/list', async (c) => {
  // 【步骤 1/4】参数校验：截取查询参数 `boardOwner` 用户名
  const boardOwnerName = String(c.req.query('boardOwner') || '').trim().toLowerCase();

  // 分支 A：缺少画板用户名参数 (Guard Clause)
  if (!boardOwnerName) {
    return c.text('Missing boardOwner query parameter', 400);
  }

  // 【步骤 2/4】查库获取画板主人的数据库用户对象
  const db = getDb(c.env.DB);
  const [boardOwner] = await db.select().from(users).where(eq(users.username, boardOwnerName)).limit(1);

  // 分支 B：画板主人记录不存在
  if (!boardOwner) {
    return c.text('Board owner not found', 404);
  }

  // 【步骤 3/4】校验当前轮询发起者是否为该画板的主人
  let isOwner = false;
  const sessionToken = getCookie(c, 'session');

  // 分支 C：访问者带有登录态，进行权限判定
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      if (payload && payload.userId === boardOwner.id) {
        isOwner = true;
      }
    } catch (e) {
      // 异常时维持 isOwner = false
    }
  }

  // 【步骤 4/4】查询画板主人名下的全部便签，遍历渲染成纯 HTML 片段返回给 HTMX 进行局部 DOM 置换
  const service = getNotesService(c.env.DB);
  const userNotes = await service.getNotesByUserId(boardOwner.id);

  return c.html(
    <>
      {userNotes.map((note: any) => (
        <Note
          key={note.id}
          id={note.id}
          content={note.content}
          color={note.color}
          xPos={note.xPos}
          yPos={note.yPos}
          likes={note.likes}
          isOwner={isOwner}
          isLoggedIn={Boolean(sessionToken)}
          authorUsername={note.authorUsername}
        />
      ))}
    </>
  );
});

/**
 * 业务意图：在朋友的留言墙上发布新便签 API。
 * 校验登录身份，拦截向自己墙发布便签的操作，并在目标画板上创建新卡片。
 * 副作用：向 D1 的 notes 表插入行记录，随机生成 X/Y 坐标，返回单个 Note 卡片 HTML。
 */
notesApp.post('/', async (c) => {
  // 【步骤 1/5】认证检查早退防护
  const sessionToken = getCookie(c, 'session');

  // 分支 A：未登录阻止发布
  if (!sessionToken) {
    return c.html(
      `<script>
        alert('您当前尚未登录。请先登录后，即可给朋友贴手账便签！');
      </script>`,
      401
    );
  }

  try {
    const payload = await verify(sessionToken, JWT_SECRET, 'HS256');

    // 分支 B：登录态失效
    if (!payload || !payload.userId) {
      return c.html(
        `<script>
          alert('登录凭证已过期，请重新登录账号！');
        </script>`,
        401
      );
    }
    
    const currentUserId = String(payload.userId);
    const currentUsername = String(payload.username || '');

    // 【步骤 2/5】解析并清洗表单提报参数
    const body = await c.req.parseBody();
    const content = String(body.content || '').trim();
    const color = String(body.color || 'yellow');
    const boardOwnerId = String(body.boardOwnerId || '').trim();

    // 【步骤 3/5】核心防御拦截 (Guard Clause)：禁止用户在属于自己的画板上贴便签
    // 分支 C：尝试在自己画板上贴便签，进行拦截并返回友好提示
    if (boardOwnerId && currentUserId === boardOwnerId) {
      return c.text('不能在自己的留言墙上贴便签哦，去朋友的留言墙逛逛吧！', 400);
    }

    // 目标宿主 ID：若指定了 boardOwnerId 则贴在目标画板上
    const targetUserId = boardOwnerId || currentUserId;

    // 【步骤 4/5】调用逻辑层计算随机位置坐标，附带作者信息写库
    const service = getNotesService(c.env.DB);
    const newNote = await service.createNote(
      content, 
      color, 
      targetUserId,
      currentUserId,
      currentUsername
    );
    
    // 【步骤 5/5】局部置换：直接返回包含新便签的 Note 节点 HTML，供前端 HTMX 插入 append 到画布尾部
    return c.html(
      <Note 
        id={newNote.id} 
        content={newNote.content} 
        color={newNote.color} 
        xPos={newNote.xPos} 
        yPos={newNote.yPos} 
        likes={newNote.likes}
        isOwner={false}
        isLoggedIn={true}
        authorUsername={newNote.authorUsername || currentUsername}
      />
    );
  } catch (error: any) {
    // 分支 D：捕捉非空校验等业务异常并返回错误
    return c.text(error.message || '创建留言失败', 400);
  }
});

/**
 * 业务意图：保存便签拖拽位置 API。
 * 副作用：校验所有权后更新 D1 中便签的 xPos 和 yPos 百分比坐标。
 */
notesApp.put('/:id/position', async (c) => {
  const id = c.req.param('id');

  // 【步骤 1/3】拖拽权限判断（主人与作者均可调整布局）
  // 分支 A：越权拒绝
  const auth = await checkNoteActionPermission(c, id, 'drag');
  if (!auth) return c.text('Forbidden: Unauthorized or missing drag permission', 403);

  // 【步骤 2/3】解析 JSON Payload 中的 xPos 与 yPos 坐标值
  const { xPos, yPos } = await c.req.json<{ xPos: number; yPos: number }>();

  // 【步骤 3/3】持久化最新坐标到 D1 数据库
  await auth.service.updatePosition(id, xPos, yPos);

  return c.text('Position updated');
});

/**
 * 业务意图：响应便签双击事件，返回行内编辑表单 (`NoteEditForm`) HTML。
 * 副作用：校验权限，返回动态表单替代原有文字节点。
 */
notesApp.get('/:id/edit', async (c) => {
  const id = c.req.param('id');

  // 【步骤 1/3】正文编辑权限判断（仅作者可修改）
  // 分支 A：越权拒绝
  const auth = await checkNoteActionPermission(c, id, 'edit');
  if (!auth) return c.text('Forbidden', 403);

  // 【步骤 2/3】读取数据库中便签原内容
  const note = await auth.service.getNoteById(id);

  // 分支 B：便签被删早退
  if (!note) return c.text('Note not found', 404);

  // 【步骤 3/3】渲染 EditForm 动态编辑组件
  return c.html(
    <NoteEditForm id={note.id} content={note.content} color={note.color} />
  );
});

/**
 * 业务意图：取消行内编辑时，还原便签文字节点的原始 DOM。
 * 副作用：无状态修改，根据访问者是否为主人选择性绑定 `dblclick` 双击编辑事件。
 */
notesApp.get('/:id/content', async (c) => {
  const id = c.req.param('id');
  const service = getNotesService(c.env.DB);
  const note = await service.getNoteById(id);

  // 分支 A：不存在早退
  if (!note) {
    return c.text('Note not found', 404);
  }

  // 【步骤 1/2】校验访问者身份以决定是否允许双击绑定
  let isOwner = false;
  const sessionToken = getCookie(c, 'session');
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      if (payload && payload.userId === note.userId) {
        isOwner = true;
      }
    } catch (e) {
      // 异常维持 isOwner = false
    }
  }

  // 分支 B：如果是主人，输出带有 `hx-trigger="dblclick"` 属性的文字节点
  if (isOwner) {
    return c.html(
      <div
        class="note-content mt-2 flex-grow overflow-y-auto break-words text-sm font-medium leading-relaxed font-sans pr-1"
        hx-get={`/api/notes/${id}/edit`}
        hx-trigger="dblclick"
        hx-target="this"
        hx-swap="outerHTML"
        title="双击可编辑内容"
      >
        {note.content}
      </div>
    );
  } else {
    // 分支 C：如果是访客，仅输出不可编辑的纯静态文本 DOM
    return c.html(
      <div class="note-content mt-2 flex-grow overflow-y-auto break-words text-sm font-medium leading-relaxed font-sans pr-1">
        {note.content}
      </div>
    );
  }
});

/**
 * 业务意图：保存编辑后的便签文字内容。
 * 副作用：校验权限，更新 D1 中的 content 字段，返回更新后的 Note 卡片 HTML。
 */
notesApp.patch('/:id', async (c) => {
  const id = c.req.param('id');

  // 【步骤 1/3】正文编辑权限判断
  // 分支 A：越权拦截
  const auth = await checkNoteActionPermission(c, id, 'edit');
  if (!auth) return c.text('Forbidden', 403);

  // 【步骤 2/3】清洗提报文本
  const body = await c.req.parseBody();
  const content = String(body.content || '').trim();

  try {
    // 【步骤 3/3】更新库中文本并重新渲染 Note 节点
    const updatedNote = await auth.service.updateContent(id, content);
    
    return c.html(
      <Note
        id={updatedNote.id}
        content={updatedNote.content}
        color={updatedNote.color}
        xPos={updatedNote.xPos}
        yPos={updatedNote.yPos}
        likes={updatedNote.likes}
        isOwner={true}
      />
    );
  } catch (error: any) {
    // 分支 B：文本非空校验异常捕捉
    return c.text(error.message || '更新留言失败', 400);
  }
});

/**
 * 业务意图：删除便签 API。
 * 副作用：校验权限，删除 D1 数据库对应的行，返回空文本触发 HTMX 从 DOM 树中擦除节点。
 */
notesApp.delete('/:id', async (c) => {
  const id = c.req.param('id');

  // 【步骤 1/2】删除权限判断（主人或作者均可删除）
  // 分支 A：越权拒绝
  const auth = await checkNoteActionPermission(c, id, 'delete');
  if (!auth) return c.text('Forbidden', 403);

  // 【步骤 2/2】执行数据库 DELETE 指令
  await auth.service.deleteNote(id);
  
  // 业务语义：返回空字符串。HTMX 收到空响应，结合 outerHTML 置换，直接从页面删除该 <li> 节点
  return c.text('');
});

/**
 * 业务意图：便签点赞反应 API（所有人公开可用）。
 * 副作用：将 D1 数据库中目标便签的 `likes` 原子递增 + 1，局部返回点赞 `<button>` HTML。
 */
notesApp.post('/:id/like', async (c) => {
  const id = c.req.param('id');
  try {
    // 【步骤 1/2】调用逻辑层 `incrementLikes` 算法原子 +1
    const service = getNotesService(c.env.DB);
    const updatedNote = await service.incrementLikes(id);
    
    // 【步骤 2/2】局部返回最新包含计数的点赞按钮 HTML 节点
    return c.html(
      <button 
        hx-post={`/api/notes/${updatedNote.id}/like`}
        hx-swap="outerHTML" 
        class="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-950/20 hover:bg-slate-950/30 border border-slate-900/5 transition-all text-[11px] font-sans font-bold text-rose-600/80 active:scale-95 cursor-pointer shadow-sm shadow-indigo-950/5 select-none"
        onclick="event.stopPropagation()"
      >
        ❤️ <span class="text-slate-700 font-mono font-medium">{updatedNote.likes}</span>
      </button>
    );
  } catch (error: any) {
    // 分支 A：错误捕捉
    return c.text(error.message || '点赞失败', 400);
  }
});

export default notesApp;
