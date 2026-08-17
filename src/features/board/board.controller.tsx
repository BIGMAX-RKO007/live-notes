import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { getDb } from '../../db/client';
import { users } from '../users/users.schema';
import { NotesRepository } from '../notes/notes.repository';
import { NotesService } from '../notes/notes.service';
import { Layout } from '../../shared/components/Layout';
import { Board } from './components/Board';
import { Landing } from './components/Landing';
import { JWT_SECRET } from '../auth/auth.controller';
import { AuthModal } from '../auth/components/AuthModal';
import { eq } from 'drizzle-orm';

// 声明 Cloudflare Workers 环境变量 Bindings 强类型映射，指示路由上下文 c.env 中包含 D1 数据库连接对象 DB
type Bindings = {
  DB: D1Database;
};

// 实例化 Hono 子路由应用对象 boardApp，挂载到主路由网关（主程序中将其映射到根路径 '/'）
const boardApp = new Hono<{ Bindings: Bindings }>();

/**
 * 业务意图：根路径网关路由，用于决定访客首次进入网站时呈现落地宣传页还是自动进入个人留言墙。
 * 副作用：读取并校验 Session Cookie；已登录用户触发 302 重定向到 `/board/:username`。
 */
boardApp.get('/', async (c) => {
  // 【步骤 1/3】凭证检查 guard clause：从 HTTP 请求头 Cookie 中尝试提取登录态令牌 sessionToken
  const sessionToken = getCookie(c, 'session');

  // 分支 A：检测到 Cookie 中存在登录凭证，尝试进行身份校验与自动重定向
  if (sessionToken) {
    try {
      // 【步骤 2/3】调用 JWT 解密算法验证签名有效性与过期时间
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      
      // 分支 A-1：凭证合法且包含有效的用户名，判定用户已登录
      // 业务语义：直通体验优化。已登录用户访问首页无需再看 Landing 宣传页，直接跳进属于自己的留言墙
      if (payload && payload.username) {
        return c.redirect(`/board/${payload.username}`);
      }
    } catch (e) {
      // 分支 A-2：Token 签名失效、被篡改或已过期
      // 业务语义：静默忽略非法 Cookie，不阻断流程，放行后降级展示公开 Landing 落地页
    }
  }

  // 分支 B：未登录或 Cookie 校验失败的普通访客
  // 【步骤 3/3】调用服务端 JSX 引擎，将 Landing 宣传组件装配进 Layout 主框架并返回 200 OK 页面 HTML
  return c.html(
    <Layout title="实时匿名留言墙 - 钉上你想说的话">
      <Landing />
    </Layout>
  );
});

/**
 * 业务意图：渲染指定用户名为 `:username` 的专属留言墙空间（支持所有人公开翻阅，但区分所有者/访客权限）。
 * 副作用：查询 D1 数据库校验用户是否存在；读取便签数据表；计算画板编辑与管理权限。
 */
boardApp.get('/board/:username', async (c) => {
  // 【步骤 1/5】参数标准化：截取 URL 路径参数 `:username`，过滤首尾空白并统一转为小写，保证数据库查询精准度
  const username = c.req.param('username').trim().toLowerCase();

  // 【步骤 2/5】建立 Cloudflare D1 数据库连接，根据用户名检索目标留言墙主人的数据库记录
  const db = getDb(c.env.DB);
  const [boardOwner] = await db.select().from(users).where(eq(users.username, username)).limit(1);

  // 分支 A：目标用户名在 D1 数据库中不存在（无效或拼写错误的画板网址）
  // 业务语义：防护性早退 (Guard Clause)，直接拦截非法访问，渲染友好 404 错误提示页，阻止后续数据库查询
  if (!boardOwner) {
    return c.html(
      <Layout title="画板未找到 - 实时匿名留言墙">
        <div class="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
          <div class="text-5xl mb-4 select-none">🫙</div>
          <h1 class="text-2xl font-extrabold text-white mb-2 font-sans">该留言墙看板不存在</h1>
          <p class="text-sm text-slate-500 max-w-sm mb-6 font-sans">请确认您访问的网址是否有拼写错误，或者立即免费创建一个属于您自己的留言墙！</p>
          <a href="/" class="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-semibold transition-all font-sans">返回首页</a>
        </div>
      </Layout>
    );
  }

  // 【步骤 3/5】画板权限计算逻辑（区分“所有权 isOwner”与“发布权限 canPostNote”）
  let isOwner = false;
  let currentUserId: string | null = null;
  const sessionToken = getCookie(c, 'session');

  // 分支 B：当前访问者携带了 Session Cookie，尝试解密身份
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      if (payload && payload.userId) {
        currentUserId = String(payload.userId);
        
        // 分支 B-1：登录用户 ID 与数据库中目标画板主人的 ID 完全一致
        // 业务语义：标记画板主人身份。主人看自己的墙时呈只读模式（不能在自己墙上写留言，只能查收他人对自己的评价）
        if (currentUserId === boardOwner.id) {
          isOwner = true;
        }
      }
    } catch (e) {
      // 分支 B-2：凭证异常，静默降级为未登录访客
    }
  }

  // 业务核心规则：
  // 1. isOwner: 访问者是画板主人。
  // 2. canPostNote: 访问者已登录，且访问的是“别人的画板”（允许给朋友贴便签）。
  // 3. isLoggedIn: 访问者是否已登录（未登录访问别人墙时提示先登录）。
  const isLoggedIn = Boolean(currentUserId);
  const canPostNote = Boolean(currentUserId && !isOwner);

  // 【步骤 4/5】按分层架构 (Repo -> Service) 检索当前画板主人下挂载的所有留言便签列表
  const notesRepo = new NotesRepository(db);
  const notesService = new NotesService(notesRepo);
  const userNotes = await notesService.getNotesByUserId(boardOwner.id);

  // 【步骤 5/5】渲染画板页面，将数据、权限开关注入 Board 组件并输出 HTML
  return c.html(
    <Layout title={`${username} 的留言墙 - 实时匿名留言墙`}>
      <Board 
        notes={userNotes} 
        isOwner={isOwner} 
        canPostNote={canPostNote}
        isLoggedIn={isLoggedIn}
        username={username} 
        boardOwnerId={boardOwner.id}
      />
    </Layout>
  );
});

/**
 * 业务意图：返回“进入朋友的留言墙”交互模态框 HTML 片段（用于按用户名查找朋友画板及读取本地访问历史记录）。
 * 副作用：无服务端数据库修改；返回的 HTML 中嵌入客户端 JS 脚本读写 `localStorage`。
 */
boardApp.get('/api/board/friends-modal', (c) => {
  // 【步骤 1/2】直接响应模态弹窗的服务端 JSX 结构，供前端 HTMX 动态插入到 body 节点中
  return c.html(
    <div id="friends-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="relative w-full max-w-md p-8 mx-4 rounded-2xl border border-[#e2d4c7] bg-[#fffdfa] shadow-2xl">
        {/* 关闭模态框按钮：点击通过原生 DOM API 直接将模态框节点从页面移除 */}
        <button
          class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] transition-colors p-1 rounded-full hover:bg-black/5"
          onclick="document.getElementById('friends-modal').remove()"
        >
          ✕
        </button>
        <h2 class="text-2xl font-bold text-[#382b26] text-center mb-6 font-serif">翻阅朋友的留言墙</h2>

        {/* 搜索表单：用户输入朋友用户名点击提交后，通过前端原生 JS 直接触发页面跳转至 `/board/用户名` */}
        <form
          onsubmit="event.preventDefault(); const name = document.getElementById('friend-name-input').value.trim().toLowerCase(); if(name) window.location.href = '/board/' + name;"
          class="flex flex-col gap-4"
        >
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">留言墙主人的用户名</label>
            <input
              id="friend-name-input"
              type="text"
              required
              placeholder="请输入朋友的用户名"
              class="w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            class="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-semibold transition-all shadow-md shadow-amber-900/10 active:scale-[0.98] font-sans cursor-pointer"
          >
            立即翻阅
          </button>
        </form>

        {/* 历史访问记录区域：供客户端脚本动态渲染 localStorage 中的历史看过的用户名 */}
        <div class="mt-6 border-t border-[#eee5dc] pt-4">
          <span class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-3 font-sans">历史访问记录</span>
          <div id="visited-history-list" class="flex flex-wrap gap-2 min-h-[36px] items-center">
            {/* 这里的 DOM 节点由下方 IIFE 脚本在浏览器端动态挂载 */}
          </div>
        </div>
      </div>

      {/* 【步骤 2/2】客户端注入脚本：从浏览器 localStorage 提取 `visited_boards` 并拼接成可点击的历史徽章 */}
      {/* 业务语义：解决无搜索推荐时的冷启动问题，使用户可以一键重访曾经看过的朋友画板 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const container = document.getElementById('visited-history-list');
            let list = [];
            try {
              // 尝试从浏览器本地存储解析历史记录数组
              list = JSON.parse(localStorage.getItem('visited_boards') || '[]');
            } catch(e) {}
            
            // 分支 A：无任何历史访问记录
            // 实现方式：客户端 JS 动态写 DOM HTML（可简化为框架模板处理）
            if (list.length === 0) {
              container.innerHTML = '<span class="text-xs text-[#b5a69c] font-sans">暂无历史访问记录</span>';
            } else {
              // 分支 B：存在历史记录，遍历数组将每个用户名拼成超链接徽章
              container.innerHTML = list.map(function(username) {
                return '<a href="/board/' + username + '" class="px-3.5 py-1.5 rounded-xl bg-[#f4ebe1] border border-[#e2d4c7] hover:border-amber-400 text-xs text-[#6b5b52] hover:text-[#382b26] transition-all font-sans flex items-center gap-1 cursor-pointer">📖 ' + username + '</a>';
              }).join('');
            }
          })();
        `
      }} />
    </div>
  );
});

/**
 * 业务意图：智能导航路由（用于顶栏“我的留言墙”按钮），根据当前访问者的登录状态决定跳转方向。
 * 副作用：读取并解密 JWT Cookie；已登录则响应 HTMX 页面跳转指令 `HX-Redirect`，未登录则返回登录弹窗 HTML。
 */
boardApp.get('/api/board/my-redirect', async (c) => {
  // 【步骤 1/3】凭证提取：从 HTTP 请求头 Cookie 尝试提取 sessionToken
  const sessionToken = getCookie(c, 'session');

  // 分支 A：当前访问者处于已登录状态
  if (sessionToken) {
    try {
      const payload = await verify(sessionToken, JWT_SECRET, 'HS256');
      
      // 分支 A-1：解密成功且获取到有效用户名
      // 业务语义：智能直达。向 HTMX 发送特殊的 `HX-Redirect` HTTP 响应头，指示客户端浏览器立刻无刷新跳转到该用户自己的留言墙 `/board/:username`
      if (payload && payload.username) {
        c.header('HX-Redirect', `/board/${payload.username}`);
        return c.text('Redirecting...');
      }
    } catch (e) {
      // 分支 A-2：凭证无效或过期，放行继续向下渲染登录弹窗
    }
  }

  // 分支 B：当前访问者未登录或凭证过期
  // 【步骤 3/3】业务语义：引导登录/注册。返回登录模态框组件 HTML
  return c.html(<AuthModal mode="login" />);
});

export default boardApp;
