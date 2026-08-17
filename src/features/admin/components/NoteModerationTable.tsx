interface NoteItem {
  id: string;
  content: string;
  color: string;
  likes: number;
  createdAt: string;
  targetUsername?: string;
}

interface NoteModerationTableProps {
  notes: NoteItem[];
}

/**
 * 业务意图：后台全站便签实时审核与一键下架表格组件 (Note Moderation Component)。
 * 列出全站最新的便签留言，支持管理员一键一键下架/删除违规卡片。
 * 副作用：点击删除按钮通过 HTMX DELETE /api/admin/notes/:id 实时擦除该行。
 */
export const NoteModerationTable = ({ notes }: NoteModerationTableProps) => {
  return (
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            📝 全站便签实时审核与管理
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">监控并下架全站违规、敏感或恶意便签</p>
        </div>
        <span class="text-xs font-mono px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
          全站留言数: <strong class="text-amber-400">{notes.length}</strong>
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono uppercase">
              <th class="py-3 px-4">便签 ID</th>
              <th class="py-3 px-4">所属画板</th>
              <th class="py-3 px-4 max-w-md">留言内容</th>
              <th class="py-3 px-4">卡片色彩</th>
              <th class="py-3 px-4">获赞数</th>
              <th class="py-3 px-4 text-right">操作管理</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            {notes.length === 0 ? (
              <tr>
                <td colspan={6} class="py-8 text-center text-slate-500 font-sans">
                  🫙 暂无便签记录
                </td>
              </tr>
            ) : (
              notes.map((note) => (
                <tr id={`admin-note-row-${note.id}`} class="hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {note.id.substring(0, 8)}...
                  </td>
                  <td class="py-3 px-4 font-medium text-amber-300">
                    <a href={`/board/${note.targetUsername || 'public'}`} target="_blank" class="hover:underline flex items-center gap-1">
                      📖 {note.targetUsername || 'public'}
                    </a>
                  </td>
                  <td class="py-3 px-4 max-w-md break-words font-sans text-slate-200">
                    {note.content}
                  </td>
                  <td class="py-3 px-4">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono capitalize bg-slate-800 border border-slate-700 text-slate-300">
                      <span class={`w-2 h-2 rounded-full ${
                        note.color === 'yellow' ? 'bg-amber-300' :
                        note.color === 'pink' ? 'bg-rose-300' :
                        note.color === 'blue' ? 'bg-sky-300' :
                        note.color === 'green' ? 'bg-emerald-300' : 'bg-purple-300'
                      }`}></span>
                      {note.color}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono text-rose-400 font-semibold">
                    ❤️ {note.likes || 0}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button
                      hx-delete={`/admin/notes/${note.id}`}
                      hx-target={`#admin-note-row-${note.id}`}
                      hx-swap="outerHTML"
                      hx-confirm="确定要下架并永久删除该条留言便签吗？"
                      class="px-3 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all font-medium active:scale-95 cursor-pointer"
                    >
                      🗑️ 强制下架
                    </button>
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
