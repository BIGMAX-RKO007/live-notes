import { Note } from '../../notes/components/Note';
import { NoteModal } from '../../notes/components/NoteModal';
import { SponsorNote } from '../../notes/components/SponsorNote';
import { CornerBookmark } from './CornerBookmark';

interface BoardProps {
  notes: Array<{
    id: string;
    content: string;
    color: string;
    xPos: number;
    yPos: number;
    likes?: number;
  }>;
  isOwner?: boolean;
  canPostNote?: boolean;
  isLoggedIn?: boolean;
  username: string;
  boardOwnerId?: string;
}

/**
 * 业务意图：手账留言墙主大画布组件 (Main Journal Canvas)。
 * 承载顶栏 Header、手账画板画布、原生赞助卡片、左下角悬挂书签、便签轮询容器及客户端拖拽交互算法。
 * 副作用：渲染整体 UI，并在客户端嵌入拖拽拦截与 HTMX 轮询事件监听脚本。
 */
export const Board = ({ 
  notes, 
  isOwner = false, 
  canPostNote = false, 
  isLoggedIn = false, 
  username, 
  boardOwnerId = '' 
}: BoardProps) => {
  return (
    <div class="flex-grow flex flex-col h-full overflow-hidden relative bg-transparent">
      {/* 【步骤 1/4】顶栏 Header：显示画板主人名称、留言张数计数器、Web Share API 分享按钮与“切换朋友/我的画板”按钮 */}
      <header class="z-30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mx-4 sm:mx-8 mt-4 px-6 py-3.5 bg-[#fffdfa]/90 backdrop-blur-md border border-[#e8ded5] rounded-2xl shadow-sm shadow-[#4a3b32]/5">
        <div class="flex flex-col max-w-full">
          <h1 class="text-lg sm:text-xl font-bold tracking-tight text-[#382b26] flex items-center gap-2 font-serif select-none">
            📖 {username === 'public' ? '公共' : `${username} 的`}{isOwner ? '专属' : '分享'}治愈手账
          </h1>
          <p class="text-[11px] sm:text-xs text-[#78685f] mt-0.5 font-sans select-none break-words font-medium">
            {isOwner ? (
              '✨ 这是您的专属留言墙（只读查收）。点击【🔗 分享画板】发给好友，邀请大家为您留留言吧！'
            ) : canPostNote ? (
              `💌 您正在翻阅 ${username} 的留言墙。点击右下角【+】号可以给对方写便签哦！`
            ) : (
              `👀 您正在翻阅 ${username} 的留言墙。登录后即可给对方留便签！`
            )}
          </p>
        </div>
        <div class="flex items-center gap-2 sm:gap-4 text-xs font-sans w-full sm:w-auto justify-between sm:justify-end">
          <div class="px-3.5 py-1.5 bg-[#f4ebe1] border border-[#e2d4c7] rounded-full text-[#6b5b52] font-medium whitespace-nowrap text-xs font-serif">
            留言总数: <span id="note-count" class="font-mono text-amber-800 font-bold">{notes.length}</span> 张
          </div>
          <div class="flex items-center gap-2 sm:gap-4 text-xs font-sans w-full sm:w-auto justify-between sm:justify-end">
            {/* 分享按钮点击脚本：若设备支持 Web Share API 原生唤起系统分享，否则复制当前 URL 至剪贴板 */}
            <button 
              onclick="
                if (navigator.share) {
                  navigator.share({
                    title: document.title,
                    text: '快来看看我的专属手账留言墙吧！',
                    url: window.location.href
                  }).catch(err => console.log('Share failed:', err));
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  const toast = document.getElementById('share-toast');
                  if (toast) {
                    toast.classList.remove('opacity-0', 'pointer-events-none');
                    setTimeout(() => toast.classList.add('opacity-0', 'pointer-events-none'), 2500);
                  }
                }
              "
              class="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 rounded-xl font-semibold transition-all shadow-sm shadow-amber-900/10 flex items-center gap-1.5 cursor-pointer border border-amber-300"
            >
              🔗 分享画板
            </button>

            {/* 分支 A：若是画板主人，展示【👥 朋友的画板】按钮，发起 HTMX GET 请求加载查找弹窗 */}
            {/* 分支 B：若是访客，展示【🏠 我的画板】按钮，发起 HTMX GET 请求校验或打开登录弹窗 */}
            {isOwner ? (
              <button 
                hx-get="/api/board/friends-modal"
                hx-target="body"
                hx-swap="beforeend"
                class="px-4 py-2 bg-[#f4ebe1] hover:bg-[#ebdcd0] text-[#6b5b52] border border-[#e2d4c7] rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                👥 朋友的画板
              </button>
            ) : (
              <button 
                hx-get="/api/board/my-redirect"
                hx-target="body"
                hx-swap="beforeend"
                class="px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-300 hover:to-pink-400 text-white rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border border-rose-300"
              >
                🏠 我的画板
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 链接复制成功浮动 Toast */}
      <div 
        id="share-toast"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-amber-900/90 text-amber-50 text-xs font-sans shadow-lg transition-opacity duration-300 opacity-0 pointer-events-none flex items-center gap-2 border border-amber-700"
      >
        ✨ 链接已复制到剪贴板，快分享给好朋友吧！
      </div>

      {/* 【步骤 2/4】主画板大画布：挂载原生广告卡片、悬挂书签组件及 3 秒轮询容器 */}
      <div 
        id="board-canvas" 
        class="flex-grow w-full h-full relative overflow-hidden"
      >
        {/* 品牌赞助手账卡片组件 */}
        <SponsorNote />

        {/* 左下角悬挂书签与广告招租弹窗组件 */}
        <CornerBookmark />

        {/* 便签轮询容器：配置 `hx-trigger="every 3s"`，每 3 秒自动向后端获取最新便签 DOM 局部更新 */}
        <div
          id="board-notes-container"
          hx-get={`/api/notes/list?boardOwner=${username}`}
          hx-trigger="every 3s"
          hx-swap="innerHTML"
          class="w-full h-full absolute inset-0 p-4"
        >
          {notes.map((note) => (
            <Note
              key={note.id}
              id={note.id}
              content={note.content}
              color={note.color}
              xPos={note.xPos}
              yPos={note.yPos}
              likes={note.likes}
              isOwner={isOwner}
            />
          ))}
        </div>
      </div>

      {/* 【步骤 3/4】撰写便签浮动模态框（只有在别人墙上 + 已登录状态下才展现 `+` 号撰写按钮；未登录展现登录引导） */}
      {canPostNote ? (
        <NoteModal boardOwnerId={boardOwnerId} />
      ) : !isLoggedIn && !isOwner ? (
        <button
          hx-get="/api/board/my-redirect"
          hx-target="body"
          hx-swap="beforeend"
          class="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 rounded-full shadow-lg shadow-amber-900/20 animate-[pulse_2.5s_infinite] transition-all duration-150 active:scale-95 cursor-pointer font-bold text-2xl border border-amber-300"
          title="登录后给对方留下手账留言"
        >
          +
        </button>
      ) : null}

      {/* 【步骤 4/4】客户端原生 JS 脚本：事件委托拖拽算法 + HTMX 轮询冲突拦截器 + localStorage 历史记录写入 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const isOwner = ${isOwner ? 'true' : 'false'};
            
            let activeNote = null;
            let startX = 0;
            let startY = 0;
            let initialLeft = 0;
            let initialTop = 0;
            window.isDragging = false;
 
            const canvas = document.getElementById('board-canvas');
            const container = document.getElementById('board-notes-container');
 
            // 拖拽开始函数：通过事件委托绑定到便签贴纸节点
            function startDrag(e) {
              // 分支 A：非主人直接拦截拖拽行为
              if (!isOwner) return;

              // 分支 B：如果点击的是卡片内部的按钮、输入框或表单，放行原生点击，不触发卡片拖拽
              if (e.target.closest('button') || e.target.closest('form') || e.target.closest('input') || e.target.closest('textarea')) {
                return;
              }
 
              const card = e.target.closest('.note-card');
              if (!card) return;
 
              activeNote = card;
              window.isDragging = true; // 标记拖拽状态，告知 HTMX 暂停轮询刷新
              card.style.zIndex = 1000; // 提高当前拖拽卡片的层级至最前
 
              const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
              const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
 
              startX = clientX;
              startY = clientY;
 
              // 将百分比坐标转化为绝对像素以便精准推演偏移
              const rect = canvas.getBoundingClientRect();
              initialLeft = (parseFloat(card.style.left) / 100) * rect.width;
              initialTop = (parseFloat(card.style.top) / 100) * rect.height;
 
              document.addEventListener('mousemove', drag);
              document.addEventListener('touchmove', drag, { passive: false });
              document.addEventListener('mouseup', endDrag);
              document.addEventListener('touchend', endDrag);
            }
 
            // 拖拽过程更新：实时推演百分比坐标与画布边界约束
            function drag(e) {
              if (!activeNote) return;
              if (e.cancelable) e.preventDefault(); // 阻止移动端 Touch 事件的默认页面滚动行为
 
              const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
              const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
 
              const deltaX = clientX - startX;
              const deltaY = clientY - startY;
 
              const rect = canvas.getBoundingClientRect();
              
              let newLeftPx = initialLeft + deltaX;
              let newTopPx = initialTop + deltaY;
 
              // 画布边界溢出拦截防护 (Boundary Constraints)
              const cardWidth = activeNote.offsetWidth;
              const cardHeight = activeNote.offsetHeight;
              
              newLeftPx = Math.max(0, Math.min(newLeftPx, rect.width - cardWidth));
              newTopPx = Math.max(0, Math.min(newTopPx, rect.height - cardHeight));
 
              // 转换回相对百分比坐标，并实施严密的百分比防护钳制 (Percentage Boundary Clamp: 1% ~ 82%)
              let xPosPercent = (newLeftPx / rect.width) * 100;
              let yPosPercent = (newTopPx / rect.height) * 100;

              xPosPercent = Math.max(1, Math.min(xPosPercent, 82));
              yPosPercent = Math.max(1, Math.min(yPosPercent, 80));

              activeNote.style.left = xPosPercent + '%';
              activeNote.style.top = yPosPercent + '%';
            }
 
            // 拖拽释放：发起 PUT /api/notes/:id/position 持久化最新坐标
            function endDrag(e) {
              if (!activeNote) return;
 
              const noteId = activeNote.getAttribute('data-note-id');
              const xPos = parseFloat(activeNote.style.left);
              const yPos = parseFloat(activeNote.style.top);
 
              // 异步提交位置更新
              fetch('/api/notes/' + noteId + '/position', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ xPos, yPos })
              }).catch(err => console.error('Failed to save position:', err));
 
              activeNote.style.zIndex = ''; 
              activeNote = null;
              
              // 延迟 100ms 恢复拖拽标记，防止轮询请求瞬时重构 DOM
              setTimeout(function() {
                window.isDragging = false;
              }, 100);
 
              document.removeEventListener('mousemove', drag);
              document.removeEventListener('touchmove', drag);
              document.removeEventListener('mouseup', endDrag);
              document.removeEventListener('touchend', endDrag);
            }
 
            // 若为画板主人，在容器上注册 mousedown/touchstart 事件委托
            if (isOwner) {
              container.addEventListener('mousedown', startDrag);
              container.addEventListener('touchstart', startDrag, { passive: true });
            }
 
            // HTMX 拦截器 1：当用户正在拖拽卡片时，拦截 3 秒周期的轮询刷新，防止光标下的卡片被重新置换跳跃
            document.addEventListener('htmx:beforeRequest', function(evt) {
              if (evt.detail.target.id === 'board-notes-container' && window.isDragging) {
                evt.preventDefault();
              }
            });
 
            // HTMX 拦截器 2：轮询成功后，更新顶栏留言总数徽章
            document.addEventListener('htmx:afterOnLoad', function(evt) {
              if (evt.detail.target.id === 'board-notes-container') {
                const count = document.querySelectorAll('#board-notes-container .note-card').length;
                document.getElementById('note-count').innerText = count;
              }
            });

            // 写入本地历史记录：记录已访问过的画板到 localStorage，排重并保留最新 10 条
            (function() {
              const boardName = "${username}";
              if (boardName && boardName !== 'public') {
                let list = [];
                try {
                  list = JSON.parse(localStorage.getItem('visited_boards') || '[]');
                } catch(e) {}
                list = list.filter(function(item) { return item !== boardName; });
                list.unshift(boardName);
                list = list.slice(0, 10);
                localStorage.setItem('visited_boards', JSON.stringify(list));
              }
            })();
          })();
        `
      }} />
    </div>
  );
};
