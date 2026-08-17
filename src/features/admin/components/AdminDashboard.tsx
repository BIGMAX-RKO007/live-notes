import { NoteModerationTable } from './NoteModerationTable';
import { UserListTable } from './UserListTable';
import { AdControlPanel } from './AdControlPanel';

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalNotes: number;
    totalLikes: number;
  };
  notes: any[];
  users: any[];
}

/**
 * 业务意图：后台控制台主视图组件 (Admin Dashboard Overview Component)。
 * 承载指标统计卡片、模块切换 Tab，以及全站便签审核表、用户管理表与广告控制台。
 * 副作用：渲染完整的控制台面板。
 */
export const AdminDashboard = ({ stats, notes, users }: AdminDashboardProps) => {
  return (
    <div class="flex flex-col gap-8">
      {/* 【指标统计卡片区】 */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* 卡片 1: 注册用户数 */}
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="absolute -right-4 -bottom-4 text-6xl opacity-10 select-none group-hover:scale-110 transition-transform">👥</div>
          <div class="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">全站注册用户</div>
          <div class="text-3xl font-extrabold text-white font-mono flex items-baseline gap-2">
            {stats.totalUsers} <span class="text-xs font-normal text-slate-500 font-sans">位用户</span>
          </div>
          <div class="mt-3 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <span>● 正常运行</span>
          </div>
        </div>

        {/* 卡片 2: 便签总数 */}
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="absolute -right-4 -bottom-4 text-6xl opacity-10 select-none group-hover:scale-110 transition-transform">📝</div>
          <div class="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">手账便签总数</div>
          <div class="text-3xl font-extrabold text-amber-400 font-mono flex items-baseline gap-2">
            {stats.totalNotes} <span class="text-xs font-normal text-slate-500 font-sans">张卡片</span>
          </div>
          <div class="mt-3 text-[11px] text-amber-500/80 flex items-center gap-1 font-mono">
            <span>⚡️ HTMX 3s 实时同步</span>
          </div>
        </div>

        {/* 卡片 3: 全站总赞数 */}
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div class="absolute -right-4 -bottom-4 text-6xl opacity-10 select-none group-hover:scale-110 transition-transform">❤️</div>
          <div class="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">全站累计点赞数</div>
          <div class="text-3xl font-extrabold text-rose-400 font-mono flex items-baseline gap-2">
            {stats.totalLikes} <span class="text-xs font-normal text-slate-500 font-sans">次互动</span>
          </div>
          <div class="mt-3 text-[11px] text-rose-400/80 flex items-center gap-1 font-mono">
            <span>🔥 原子自增计数机制</span>
          </div>
        </div>
      </div>

      {/* 【模块 Tab 切换卡与内容】 */}
      <div class="flex flex-col gap-6">
        <div class="flex border-b border-slate-800 gap-8 text-sm font-semibold font-sans overflow-x-auto">
          <button 
            onclick="document.getElementById('tab-notes').classList.remove('hidden'); document.getElementById('tab-users').classList.add('hidden'); document.getElementById('tab-ads').classList.add('hidden'); this.className='py-3 border-b-2 border-amber-500 text-amber-400 font-bold'; document.getElementById('btn-users-tab').className='py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200'; document.getElementById('btn-ads-tab').className='py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200';"
            id="btn-notes-tab"
            class="py-3 border-b-2 border-amber-500 text-amber-400 font-bold cursor-pointer whitespace-nowrap"
          >
            📝 便签实时审核 ({notes.length})
          </button>
          <button 
            onclick="document.getElementById('tab-users').classList.remove('hidden'); document.getElementById('tab-notes').classList.add('hidden'); document.getElementById('tab-ads').classList.add('hidden'); this.className='py-3 border-b-2 border-amber-500 text-amber-400 font-bold'; document.getElementById('btn-notes-tab').className='py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200'; document.getElementById('btn-ads-tab').className='py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200';"
            id="btn-users-tab"
            class="py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            👥 账号列表 ({users.length})
          </button>
          <button 
            onclick="document.getElementById('tab-ads').classList.remove('hidden'); document.getElementById('tab-notes').classList.add('hidden'); document.getElementById('tab-users').classList.add('hidden'); this.className='py-3 border-b-2 border-amber-500 text-amber-400 font-bold'; document.getElementById('btn-notes-tab').className='py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200'; document.getElementById('btn-users-tab').className='py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200';"
            id="btn-ads-tab"
            class="py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            🛍️ 变现与广告位控制
          </button>
        </div>

        {/* Tab 1: 便签审核表 */}
        <div id="tab-notes">
          <NoteModerationTable notes={notes} />
        </div>

        {/* Tab 2: 用户列表 */}
        <div id="tab-users" class="hidden">
          <UserListTable users={users} />
        </div>

        {/* Tab 3: 广告与变现管理 */}
        <div id="tab-ads" class="hidden">
          <AdControlPanel />
        </div>
      </div>
    </div>
  );
};
