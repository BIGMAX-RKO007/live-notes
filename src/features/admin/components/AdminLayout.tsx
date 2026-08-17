import { html } from 'hono/html';

interface AdminLayoutProps {
  title?: string;
  children: any;
}

/**
 * 业务意图：后台管理系统专属 HTML 外壳组件 (Admin Layout Shell)。
 * 采用深色高级 Slate/Zinc 色系，与前台手账治愈风区分，包含 HTMX 引擎与后台顶部导航。
 * 副作用：无状态，输出完整的 HTML 页面外壳。
 */
export const AdminLayout = ({ title = '实时后台管理系统 - 治愈手账', children }: AdminLayoutProps) => {
  return html`
    <!DOCTYPE html>
    <html lang="zh-CN" class="h-full bg-slate-950 text-slate-100">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>

        <!-- Google Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

        <!-- Tailwind CSS & HTMX -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>

        <style>
          body {
            font-family: 'Inter', sans-serif;
          }
          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }
        </style>
      </head>
      <body class="h-full flex flex-col bg-slate-950 text-slate-200 antialiased selection:bg-amber-500 selection:text-slate-950">
        <!-- 顶栏 Navigation -->
        <header class="z-40 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0">
          <div class="flex items-center gap-3">
            <span class="text-2xl select-none">🛡️</span>
            <div>
              <h1 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                留言墙实时控制台 <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">ADMIN v1.0</span>
              </h1>
              <p class="text-xs text-slate-400">Real-time Management & Moderation Center</p>
            </div>
          </div>

          <div class="flex items-center gap-4 text-xs">
            <a href="/" class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 flex items-center gap-1">
              🏠 返回画板首页
            </a>
            <a href="/admin/logout" class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border border-rose-500/20 font-medium">
              退出登录
            </a>
          </div>
        </header>

        <!-- 主内容区 -->
        <main class="flex-grow max-w-7xl w-full mx-auto p-6">
          ${children}
        </main>

        <footer class="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-600 font-mono">
          Live Notes Management Dashboard &copy; 2026 Powered by Hono + Cloudflare D1
        </footer>
      </body>
    </html>
  `;
};
