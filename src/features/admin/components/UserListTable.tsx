interface UserItem {
  id: string;
  username: string;
  createdAt: string;
  noteCount?: number;
}

interface UserListTableProps {
  users: UserItem[];
}

/**
 * 业务意图：后台全站注册用户管理表格组件 (User List Table Component)。
 * 列出全站注册用户账号，查看其名下便签数，并提供一键跳转预览其专属画板的入口。
 * 副作用：渲染用户列表。
 */
export const UserListTable = ({ users }: UserListTableProps) => {
  return (
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            👥 全站注册用户列表
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">监控全站用户账号与各画板统计数据</p>
        </div>
        <span class="text-xs font-mono px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
          注册用户总数: <strong class="text-amber-400">{users.length}</strong>
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase">
              <th class="py-3 px-4">用户 ID</th>
              <th class="py-3 px-4">用户名</th>
              <th class="py-3 px-4">画板网址</th>
              <th class="py-3 px-4">注册时间</th>
              <th class="py-3 px-4 text-right">画板预览</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            {users.length === 0 ? (
              <tr>
                <td colspan={5} class="py-8 text-center text-slate-500 font-sans">
                  👤 暂无注册用户
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {user.id.substring(0, 8)}...
                  </td>
                  <td class="py-3 px-4 font-bold text-white font-sans">
                    {user.username}
                  </td>
                  <td class="py-3 px-4 font-mono text-slate-400">
                    /board/{user.username}
                  </td>
                  <td class="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : '最近'}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <a
                      href={`/board/${user.username}`}
                      target="_blank"
                      class="px-3 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all font-medium inline-flex items-center gap-1"
                    >
                      🔗 查看留言墙
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
