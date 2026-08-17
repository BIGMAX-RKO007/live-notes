import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { setCookie, deleteCookie } from 'hono/cookie';
import { getDb } from '../../db/client';
import { users } from '../users/users.schema';
import { notes } from '../notes/notes.schema';
import { hashPassword, verifyPassword } from '../../shared/utils/auth';
import { eq } from 'drizzle-orm';

// 声明 Cloudflare Workers 环境变量类型 Binding，注入 D1 Database 绑定
type Bindings = {
  DB: D1Database;
};

import { AuthModal } from './components/AuthModal';

// 实例化认证子应用 authApp
const authApp = new Hono<{ Bindings: Bindings }>();

// 定义全局统一的 JWT 加密秘钥（生产环境下建议提取至 Cloudflare Worker Secret 环境变量）
export const JWT_SECRET = 'hono-live-notes-jwt-secret-key';

/**
 * 业务意图：返回全屏登录模态框 HTML 片段。
 * 副作用：无服务端状态修改，纯 HTML 视图渲染。
 */
authApp.get('/login-modal', (c) => {
  // 【步骤 1/1】渲染登录 Modal 弹窗组件
  return c.html(<AuthModal mode="login" />);
});

/**
 * 业务意图：返回新建/注册账号模态框 HTML 片段。
 * 副作用：无服务端状态修改，纯 HTML 视图渲染。
 */
authApp.get('/register-modal', (c) => {
  // 【步骤 1/1】渲染注册 Modal 弹窗组件
  return c.html(<AuthModal mode="register" />);
});

import { renderAuthError } from '../../shared/utils/response';

/**
 * 业务意图：处理用户登录逻辑。校验密码成功后签发 HttpOnly JWT Session Cookie 并跳转至个人画板。
 * 副作用：查询 D1 数据库、校验密码 Hash；写 HttpOnly Cookie；触发前端 `HX-Redirect`。
 */
authApp.post('/login', async (c) => {
  // 【步骤 1/5】解析表单参数并标准化处理
  const body = await c.req.parseBody();
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');

  // 分支 A：参数非空校验（Guard Clause 防护性早退）
  if (!username || !password) {
    return renderAuthError(c, '用户名和密码不能为空');
  }

  // 【步骤 2/5】建立数据库连接，在 D1 中查询目标用户名记录
  const db = getDb(c.env.DB);
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

  // 【步骤 3/5】账号凭证校验：比对用户是否存在以及 PBKDF2 密码 Hash 是否匹配
  // 分支 B：用户不存在或密码错误
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return renderAuthError(c, '用户名或密码不正确');
  }

  // 【步骤 4/5】凭证签发：生成 7 天有效的 HMAC-SHA256 签名 JWT 令牌
  const token = await sign({
    userId: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  }, JWT_SECRET);

  // 【步骤 5/5】安全存储：向 HTTP 响应头注入 Session Cookie
  setCookie(c, 'session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  // 业务语义：登录成功。向 HTMX 响应跳转响应头，通知前端无刷新跳往主人的个人画板
  c.header('HX-Redirect', `/board/${user.username}`);
  return c.text('Redirecting...');
});

/**
 * 业务意图：处理新用户注册逻辑。校验参数、哈希加密密码、创建账号记录，并自动写入 2 张新手引导卡片（解决冷启动问题）。
 * 副作用：在 D1 的 users 和 notes 表执行 INSERT；签署写 Cookie；触发 `HX-Redirect`。
 */
authApp.post('/register', async (c) => {
  // 【步骤 1/6】解析并校验表单输入的用户名与密码合法性
  const body = await c.req.parseBody();
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');

  // 分支 A：用户名规格校验（只能为 3-15 位字母、数字或下划线）
  if (!username || username.length < 3 || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return renderAuthError(c, '用户名不合规，需为3-15位字母或数字');
  }

  // 分支 B：密码长度校验（最少 6 位）
  if (password.length < 6) {
    return renderAuthError(c, '密码不能少于6位');
  }

  // 【步骤 2/6】查重校验：检测目标用户名是否已被其他用户注册
  const db = getDb(c.env.DB);
  const [existingUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);

  // 分支 C：用户名已存在
  if (existingUser) {
    return renderAuthError(c, '该用户名已被占用');
  }

  // 【步骤 3/6】数据准备与密码 Hash 加密（Web Crypto PBKDF2 10,000 次加盐迭代）
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  // 【步骤 4/6】数据落库：向 D1 的 `users` 表插入新用户记录
  await db.insert(users).values({
    id: userId,
    username,
    passwordHash,
    createdAt: new Date(),
  });

  // 【步骤 5/6】新手体验冷启动预置 (Seeding)：自动向 `notes` 表写入 2 张突出“去朋友墙上贴纸/整理/撕掉”核心乐趣的便签
  const welcomeNotes = [
    {
      id: crypto.randomUUID(),
      content: '🔒 铁律规则：这里是您的专属留痕墙！主人无法在自己墙上发帖或修改画面——保持 100% 真实纯粹！快点击右上角【🔗 分享画板】发给好友，邀请大家来您的墙上贴纸、排版与守护吧！🤭✨',
      color: 'yellow',
      xPos: 18,
      yPos: 30,
      userId: userId,
      authorUsername: '系统小助手',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      content: '🚀 核心乐趣：想说话？去“霸占”朋友的留言墙！点击右上角【👥 朋友的画板】，去 TA 的墙上贴下属于您的便签、帮忙排版，或者帮 TA 撕掉恶搞贴纸！快去给朋友一个惊喜吧！🎈🔥',
      color: 'pink',
      xPos: 55,
      yPos: 26,
      userId: userId,
      authorUsername: '系统小助手',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  await db.insert(notes).values(welcomeNotes);

  // 【步骤 6/6】自动登录：签发 JWT Session Cookie 并响应 `HX-Redirect` 自动转入新创建的画板
  const token = await sign({
    userId,
    username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  }, JWT_SECRET);

  setCookie(c, 'session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  c.header('HX-Redirect', `/board/${username}`);
  return c.text('Redirecting...');
});

/**
 * 业务意图：处理安全退出登录。清除 Session Cookie 并引导回网站首页。
 * 副作用：清除 Cookie；触发 `HX-Redirect`。
 */
authApp.post('/logout', (c) => {
  // 【步骤 1/2】清除 HTTP 头部的 session Cookie 凭证
  deleteCookie(c, 'session');

  // 【步骤 2/2】通知 HTMX 无刷新跳回主页 `/`
  c.header('HX-Redirect', '/');
  return c.text('Logging out...');
});

export default authApp;
