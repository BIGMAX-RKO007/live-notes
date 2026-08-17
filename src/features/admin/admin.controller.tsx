import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { getDb } from '../../db/client';
import { users } from '../users/users.schema';
import { notes } from '../notes/notes.schema';
import { adminOtps } from './admin_otps.schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { JWT_SECRET } from '../auth/auth.controller';
import { adsConfig } from '../../shared/config/ads.config';
import { sendEmailOTP } from '../../shared/utils/email';

type Bindings = {
  DB: D1Database;
  RESEND_API_KEY?: string;
};

// 指定的管理员主邮箱
export const ADMIN_EMAIL = 'fx369246926@gmail.com';

const adminApp = new Hono<{ Bindings: Bindings }>();

/**
 * 确保数据库中存在 admin_otps 表结构防护助手
 */
const ensureOtpsTable = async (db: any) => {
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS admin_otps (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        attempts INTEGER DEFAULT 0 NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  } catch (e) {
    // 静默忽略建表重复异常
  }
};

/**
 * 业务意图：后台系统中间件 (Admin Auth Guard)。
 * 副作用：解密 admin_session Cookie，拦截非管理员访问并重定向至 /admin/login。
 */
const adminAuthGuard = async (c: any, next: any) => {
  const adminToken = getCookie(c, 'admin_session');
  if (!adminToken) {
    return c.redirect('/admin/login');
  }

  try {
    const payload = await verify(adminToken, JWT_SECRET, 'HS256');
    if (!payload || payload.role !== 'admin') {
      return c.redirect('/admin/login');
    }
    await next();
  } catch (e) {
    return c.redirect('/admin/login');
  }
};

/**
 * 业务意图：渲染后台管理员动态验证码登录界面。
 * 副作用：渲染带 60s 倒计时发信与 6 位 OTP 输入框的管理员登录表单。
 */
adminApp.get('/login', (c) => {
  return c.html(
    <AdminLayout title="邮箱验证码安全登录 - 实时后台管理系统">
      <div class="min-h-[70vh] flex items-center justify-center">
        <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div class="text-center mb-6">
            <span class="text-4xl select-none">🔐</span>
            <h2 class="text-2xl font-extrabold text-white mt-2 font-sans">后台安全验证码登录</h2>
            <p class="text-xs text-slate-400 mt-1 font-mono">向管理员邮箱发送 6 位动态口令</p>
          </div>

          <div id="otp-feedback" class="mb-4 font-mono text-xs text-center"></div>

          <form
            hx-post="/admin/login"
            hx-target="#otp-feedback"
            hx-swap="innerHTML"
            class="flex flex-col gap-4"
          >
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">管理员主邮箱 (Admin Email)</label>
              <input
                type="email"
                name="email"
                id="admin-email-input"
                required
                value={ADMIN_EMAIL}
                class="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-amber-400 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">6 位动态验证码 (OTP Code)</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  name="code"
                  required
                  maxLength={6}
                  placeholder="请输入 6 位数字验证码"
                  class="flex-grow px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-sm tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  id="send-otp-btn"
                  hx-post="/admin/send-otp"
                  hx-include="#admin-email-input"
                  hx-target="#otp-feedback"
                  hx-swap="innerHTML"
                  onclick="
                    const btn = this;
                    if (btn.disabled) return;
                    let count = 60;
                    btn.disabled = true;
                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                    const timer = setInterval(() => {
                      count--;
                      btn.innerText = count + 's 后重发';
                      if (count <= 0) {
                        clearInterval(timer);
                        btn.disabled = false;
                        btn.innerText = '发送验证码';
                        btn.classList.remove('opacity-50', 'cursor-not-allowed');
                      }
                    }, 1000);
                  "
                  class="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono font-semibold rounded-xl text-xs border border-slate-700 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  发送验证码
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] font-sans cursor-pointer text-sm"
            >
              🚀 安全验证并进入控制台
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
});

/**
 * 业务意图：生成 6 位随机验证码，写盘存入 D1 数据库并发送/打印日志。
 * 副作用：向 D1 `admin_otps` 插入行记录，触发 60s 频控防刷，控制台打印 OTP 口令。
 */
adminApp.post('/send-otp', async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email || '').trim().toLowerCase();

  // 1. 拦截非指定管理员邮箱
  if (email !== ADMIN_EMAIL) {
    return c.html(
      `<div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">❌ 仅允许指定管理员邮箱 (${ADMIN_EMAIL}) 获取验证码</div>`
    );
  }

  const db = getDb(c.env.DB);
  await ensureOtpsTable(db);

  const now = Math.floor(Date.now() / 1000);

  // 2. 60 秒发信频控校验 (Rate Limit)
  const [latestOtp] = await db
    .select()
    .from(adminOtps)
    .where(eq(adminOtps.email, email))
    .orderBy(desc(adminOtps.createdAt))
    .limit(1);

  if (latestOtp && now - latestOtp.createdAt < 60) {
    const remainSec = 60 - (now - latestOtp.createdAt);
    return c.html(
      `<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono text-center">⏳ 请求过于频繁，请 ${remainSec} 秒后再试</div>`
    );
  }

  // 3. 生成 6 位随机强 Key
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = now + 300; // 5 分钟后过期
  const id = crypto.randomUUID();

  // 4. 写盘保存至 D1 数据库 (Save to D1 DB)
  await db.insert(adminOtps).values({
    id,
    email,
    code,
    expiresAt,
    attempts: 0,
    createdAt: now,
  });

  // 5. 尝试通过 Resend API 发送真实邮件，或降级为 Dev 调试口令展示
  const resendApiKey = (c.env as any).RESEND_API_KEY;
  const sendResult = await sendEmailOTP(email, code, resendApiKey);

  if (sendResult.mode === 'email') {
    return c.html(
      `<div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center">
        ✉️ 验证码已成功发送至您的邮箱 ${email}！<br/>
        <span class="text-[11px] text-slate-300 block mt-1">请前往邮箱查收 6 位动态口令（5分钟内有效）</span>
      </div>`
    );
  }

  return c.html(
    `<div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono text-center">
      ✅ 验证码已成功生成！<br/>
      <span class="text-amber-300 font-bold tracking-wider mt-1 block">🔑 调试口令: ${code}</span>
      <span class="text-[10px] text-slate-400 block mt-0.5">(已打印至终端 Log / 未配置 RESEND_API_KEY)</span>
    </div>`
  );
});

/**
 * 业务意图：验证管理员提交的 6 位动态验证码，签发 admin_session JWT Cookie。
 * 副作用：查询 D1 `admin_otps` 比对 Code、有效期与尝试次数，签发 Cookie 并响应 HX-Redirect 跳转。
 */
adminApp.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email || '').trim().toLowerCase();
  const inputCode = String(body.code || '').trim();

  // 1. 邮箱精准匹配断言
  if (email !== ADMIN_EMAIL) {
    return c.html(
      `<div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">❌ 仅限管理员账号 (${ADMIN_EMAIL}) 登录</div>`
    );
  }

  const db = getDb(c.env.DB);
  await ensureOtpsTable(db);

  const now = Math.floor(Date.now() / 1000);

  // 2. 从 D1 数据库检索最新的 OTP 记录
  const [record] = await db
    .select()
    .from(adminOtps)
    .where(eq(adminOtps.email, email))
    .orderBy(desc(adminOtps.createdAt))
    .limit(1);

  // 分支 A：没有发信记录
  if (!record) {
    return c.html(
      `<div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">❌ 请先点击【发送验证码】</div>`
    );
  }

  // 分支 B：5 分钟已过期
  if (now > record.expiresAt) {
    return c.html(
      `<div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">❌ 验证码已失效过期，请重新获取</div>`
    );
  }

  // 分支 C：爆破防护，输错达 3 次锁定
  if (record.attempts >= 3) {
    return c.html(
      `<div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">❌ 该验证码输错次数过多，请重新获取</div>`
    );
  }

  // 分支 D：验证码不匹配，累加尝试次数
  if (record.code !== inputCode) {
    const nextAttempts = record.attempts + 1;
    await db
      .update(adminOtps)
      .set({ attempts: nextAttempts })
      .where(eq(adminOtps.id, record.id));

    return c.html(
      `<div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">❌ 验证码不正确 (剩余尝试次数: ${3 - nextAttempts} 次)</div>`
    );
  }

  // 分支 E：验证码正确，销毁/失效该条记录防二次重放
  await db.delete(adminOtps).where(eq(adminOtps.id, record.id));

  // 签发带有 role: 'admin' 权限标识的 JWT Token
  const token = await sign({ role: 'admin', email, exp: now + 86400 }, JWT_SECRET, 'HS256');

  setCookie(c, 'admin_session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 86400,
  });

  c.header('HX-Redirect', '/admin');
  return c.text('Success');
});

/**
 * 业务意图：退出管理员登录态。
 * 副作用：清除 Cookie 并重定向到登录页。
 */
adminApp.get('/logout', (c) => {
  deleteCookie(c, 'admin_session');
  return c.redirect('/admin/login');
});

/**
 * 业务意图：后台主控制台网关路由 (`GET /admin`)。
 * 副作用：执行 D1 聚合查询（统计总用户数、总便签数、全站总点赞数，列出所有用户和便签），渲染 AdminDashboard。
 */
adminApp.get('/', adminAuthGuard, async (c) => {
  const db = getDb(c.env.DB);

  // 1. 查询全站注册用户列表
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  
  // 2. 查询全站便签列表（联合 users 表关联用户名）
  const allNotesRaw = await db
    .select({
      id: notes.id,
      content: notes.content,
      color: notes.color,
      likes: notes.likes,
      userId: notes.userId,
      createdAt: notes.createdAt,
      targetUsername: users.username,
    })
    .from(notes)
    .leftJoin(users, eq(notes.userId, users.id))
    .orderBy(desc(notes.createdAt));

  // 3. 计算聚合统计指标
  const totalUsers = allUsers.length;
  const totalNotes = allNotesRaw.length;
  const totalLikes = allNotesRaw.reduce((sum, n) => sum + (n.likes || 0), 0);

  return c.html(
    <AdminLayout title="实时后台控制台 - 治愈手账">
      <AdminDashboard
        stats={{
          totalUsers,
          totalNotes,
          totalLikes,
        }}
        notes={allNotesRaw}
        users={allUsers}
      />
    </AdminLayout>
  );
});

/**
 * 业务意图：管理员强制下架/删除全站任意留言便签 API。
 * 副作用：从 D1 数据库中执行 DELETE FROM notes WHERE id = :id，返回空响应使 HTMX 从表格无刷新擦除行。
 */
adminApp.delete('/notes/:id', adminAuthGuard, async (c) => {
  const id = c.req.param('id');
  const db = getDb(c.env.DB);

  await db.delete(notes).where(eq(notes.id, id));

  // 返回空文本，由 HTMX 将对应行 <tr> 从表格中擦除
  return c.text('');
});

/**
 * 业务意图：后台实时启停/更新变现广告配置 API。
 * 副作用：根据表单数据更新全局 `adsConfig` 运行状态，并返回局部 Toast HTML 提醒。
 */
adminApp.post('/ads/toggle', adminAuthGuard, async (c) => {
  const body = await c.req.parseBody();

  const enableSponsorNote = body.enableSponsorNote === 'true';
  const enableCornerBookmark = body.enableCornerBookmark === 'true';
  const enableGoogleAdSense = body.enableGoogleAdSense === 'true';

  const businessEmail = String(body.businessEmail || '').trim();
  const businessWechat = String(body.businessWechat || '').trim();
  const businessNote = String(body.businessNote || '').trim();

  // 更新全局内存配置对象
  adsConfig.sponsorNote.enabled = enableSponsorNote;
  adsConfig.cornerBookmark.enabled = enableCornerBookmark;
  adsConfig.googleAdSense.enabled = enableGoogleAdSense;

  if (businessEmail) adsConfig.contactBusiness.email = businessEmail;
  if (businessWechat) adsConfig.contactBusiness.wechat = businessWechat;
  if (businessNote) adsConfig.contactBusiness.note = businessNote;

  return c.html(
    <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center">
      ✅ 广告位配置已成功更新并即时生效！ (品牌赞助: {enableSponsorNote ? '开启' : '关停'}, 悬挂书签: {enableCornerBookmark ? '开启' : '关停'}, Google AdSense: {enableGoogleAdSense ? '开启' : '关停'})
    </div>
  );
});

export default adminApp;
