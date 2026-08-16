import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { setCookie, deleteCookie } from 'hono/cookie';
import { getDb } from '../../db/client';
import { users } from '../users/users.schema';
import { notes } from '../notes/notes.schema';
import { hashPassword, verifyPassword } from '../../shared/utils/auth';
import { eq } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const authApp = new Hono<{ Bindings: Bindings }>();
export const JWT_SECRET = 'hono-live-notes-jwt-secret-key';

// 1. Render Login Modal
authApp.get('/login-modal', (c) => {
  return c.html(
    <div id="auth-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="relative w-full max-w-md p-8 mx-4 rounded-2xl border border-[#e2d4c7] bg-[#fffdfa] shadow-2xl">
        <button
          class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] transition-colors p-1 rounded-full hover:bg-black/5"
          onclick="document.getElementById('auth-modal').remove()"
        >
          ✕
        </button>
        <h2 class="text-2xl font-bold text-[#382b26] text-center mb-6 font-serif">打开我的手账本</h2>

        <div id="auth-error" class="hidden mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm text-center font-sans"></div>

        <form
          hx-post="/api/auth/login"
          hx-target="#auth-error"
          hx-swap="innerHTML"
          class="flex flex-col gap-4"
        >
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">用户名</label>
            <input
              type="text"
              name="username"
              required
              placeholder="请输入您的用户名"
              class="w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all font-sans"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">密码</label>
            <input
              type="password"
              name="password"
              required
              placeholder="请输入您的密码"
              class="w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            class="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-300 hover:to-pink-400 text-white font-semibold transition-all shadow-md shadow-rose-900/10 active:scale-[0.98] font-sans cursor-pointer"
          >
            开启手账本
          </button>
        </form>
        <div class="mt-6 text-center text-sm text-[#8c7b70] font-sans">
          还没有手账本？
          <button
            class="text-rose-500 hover:underline ml-1 cursor-pointer font-medium"
            hx-get="/api/auth/register-modal"
            hx-target="#auth-modal"
            hx-swap="outerHTML"
          >
            免费新建
          </button>
        </div>
      </div>
    </div>
  );
});

// 2. Render Register Modal
authApp.get('/register-modal', (c) => {
  return c.html(
    <div id="auth-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="relative w-full max-w-md p-8 mx-4 rounded-2xl border border-[#e2d4c7] bg-[#fffdfa] shadow-2xl">
        <button
          class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] transition-colors p-1 rounded-full hover:bg-black/5"
          onclick="document.getElementById('auth-modal').remove()"
        >
          ✕
        </button>
        <h2 class="text-2xl font-bold text-[#382b26] text-center mb-6 font-serif">新建专属留言墙</h2>

        <div id="auth-error" class="hidden mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm text-center font-sans"></div>

        <form
          hx-post="/api/auth/register"
          hx-target="#auth-error"
          hx-swap="innerHTML"
          class="flex flex-col gap-4"
        >
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">用户名</label>
            <input
              type="text"
              name="username"
              required
              placeholder="限字母、数字，如 fanxiao"
              pattern="^[a-zA-Z0-9_]{3,15}$"
              title="用户名只能包含3-15位字母、数字或下划线"
              class="w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">密码</label>
            <input
              type="password"
              name="password"
              required
              placeholder="请输入密码（最少6位）"
              minLength={6}
              class="w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            class="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-semibold transition-all shadow-md shadow-amber-900/10 active:scale-[0.98] font-sans cursor-pointer"
          >
            完成新建并进入
          </button>
        </form>
        <div class="mt-6 text-center text-sm text-[#8c7b70] font-sans">
          已有手账本？
          <button
            class="text-amber-700 hover:underline ml-1 cursor-pointer font-medium"
            hx-get="/api/auth/login-modal"
            hx-target="#auth-modal"
            hx-swap="outerHTML"
          >
            直接登录
          </button>
        </div>
      </div>
    </div>
  );
});

// 3. Process Login
authApp.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!username || !password) {
    return c.html(<script>const err = document.getElementById('auth-error'); err.innerText = '用户名和密码不能为空'; err.classList.remove('hidden');</script>);
  }

  const db = getDb(c.env.DB);
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.html(<script>const err = document.getElementById('auth-error'); err.innerText = '用户名或密码不正确'; err.classList.remove('hidden');</script>);
  }

  // Issue signed session cookie with JWT (valid for 7 days)
  const token = await sign({
    userId: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  }, JWT_SECRET);

  setCookie(c, 'session', token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  c.header('HX-Redirect', `/board/${user.username}`);
  return c.text('Redirecting...');
});

// 4. Process Register
authApp.post('/register', async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!username || username.length < 3 || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return c.html(<script>const err = document.getElementById('auth-error'); err.innerText = '用户名不合规，需为3-15位字母或数字'; err.classList.remove('hidden');</script>);
  }

  if (password.length < 6) {
    return c.html(<script>const err = document.getElementById('auth-error'); err.innerText = '密码不能少于6位'; err.classList.remove('hidden');</script>);
  }

  const db = getDb(c.env.DB);
  const [existingUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (existingUser) {
    return c.html(<script>const err = document.getElementById('auth-error'); err.innerText = '该用户名已被占用'; err.classList.remove('hidden');</script>);
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    id: userId,
    username,
    passwordHash,
    createdAt: new Date(),
  });

  // Seed two welcome notes for the new user board
  const welcomeNotes = [
    {
      id: crypto.randomUUID(),
      content: '欢迎来到您的专属留言墙！🎉 双击卡片可以编辑修改我，按住贴纸可调整我的位置。快点击右上角的 "分享画板" 发给好友吧！ 🚀',
      color: 'yellow',
      xPos: 20,
      yPos: 35,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      content: '💡 今日话题：2026年，您最想实现的一个小目标是什么？双击写下您的愿望，然后截图分享出去吧！ ✨',
      color: 'pink',
      xPos: 55,
      yPos: 25,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  await db.insert(notes).values(welcomeNotes);

  const token = await sign({
    userId,
    username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  }, JWT_SECRET);

  setCookie(c, 'session', token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  c.header('HX-Redirect', `/board/${username}`);
  return c.text('Redirecting...');
});

// 5. Logout
authApp.post('/logout', (c) => {
  deleteCookie(c, 'session');
  c.header('HX-Redirect', '/');
  return c.text('Logging out...');
});

export default authApp;
