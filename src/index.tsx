import { Hono } from 'hono';
import boardController from './features/board/board.controller';
import notesController from './features/notes/notes.controller';
import authController from './features/auth/auth.controller';
import adminController from './features/admin/admin.controller';

// 声明 Cloudflare Workers 环境变量类型 Binding，绑定全局 D1 数据库
type Bindings = {
  DB: D1Database;
};

// 实例化主应用入口 App Gateway
const app = new Hono<{ Bindings: Bindings }>();

/**
 * 业务意图：全站顶层路由网关分发 (Application Router Gateway)。
 * 负责接收 Cloudflare Worker 发起的所有 HTTP 请求，并按 URL 前缀精准分发派发给对应 Feature 模块的控制器。
 */

// 【路由派发 1/4】挂载画板空间主路由控制网关（匹配 `'/'`, `'/board/:username'`, `'/api/board/*'`）
app.route('/', boardController);

// 【路由派发 2/4】挂载便签卡片 API 路由控制网关（匹配 `'/api/notes/list'`, `'/api/notes/:id'`, `'/api/notes/:id/like'` 等）
app.route('/api/notes', notesController);

// 【路由派发 3/4】挂载认证鉴权 API 路由控制网关（匹配 `'/api/auth/login'`, `'/api/auth/register'`, `'/api/auth/logout'` 等）
app.route('/api/auth', authController);

// 【路由派发 4/4】挂载后台管理控制台路由网关（匹配 `'/admin'`, `'/admin/login'`, `'/api/admin/*'` 等）
app.route('/admin', adminController);

// 导出 Worker 运行时的标准 Fetch Handler 实例对象
export default app;
