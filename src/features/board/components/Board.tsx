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
  username: string;
}

export const Board = ({ notes, isOwner = true, username }: BoardProps) => {
  return (
    <div class="flex-grow flex flex-col h-full overflow-hidden relative bg-transparent">
      {/* Header Bar - Cozy Journal Folder Style */}
      <header class="z-30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mx-4 sm:mx-8 mt-4 px-6 py-3.5 bg-[#fffdfa]/90 backdrop-blur-md border border-[#e8ded5] rounded-2xl shadow-sm shadow-[#4a3b32]/5">
        <div class="flex flex-col max-w-full">
          <h1 class="text-lg sm:text-xl font-bold tracking-tight text-[#382b26] flex items-center gap-2 font-serif select-none">
            📖 {username === 'public' ? '公共' : `${username} 的`}{isOwner ? '专属' : '分享'}治愈手账
          </h1>
          <p class="text-[11px] sm:text-xs text-[#78685f] mt-0.5 font-sans select-none break-words">
            {isOwner ? '双击便签内容可编辑，按住手账贴纸可自由摆放位置' : '只读模式。您正在翻阅他人的手账页面，数据同步中'}
          </p>
        </div>
        <div class="flex items-center gap-2 sm:gap-4 text-xs font-sans w-full sm:w-auto justify-between sm:justify-end">
          <div class="px-3.5 py-1.5 bg-[#f4ebe1] border border-[#e2d4c7] rounded-full text-[#6b5b52] font-medium whitespace-nowrap text-xs font-serif">
            留言总数: <span id="note-count" class="font-mono text-amber-800 font-bold">{notes.length}</span> 张
          </div>
          <div class="flex items-center gap-2 sm:gap-4 text-xs font-sans w-full sm:w-auto justify-between sm:justify-end">
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

      {/* Share Toast */}
      <div 
        id="share-toast"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-amber-900/90 text-amber-50 text-xs font-sans shadow-lg transition-opacity duration-300 opacity-0 pointer-events-none flex items-center gap-2 border border-amber-700"
      >
        ✨ 链接已复制到剪贴板，快分享给好朋友吧！
      </div>

      {/* Main Interactive Board Canvas */}
      <div 
        id="board-canvas" 
        class="flex-grow w-full h-full relative overflow-hidden"
      >
        {/* Native Brand Sponsor Note Card */}
        <SponsorNote />

        {/* Floating Corner Bookmark Ad */}
        <CornerBookmark />

        {/* Polling container - pulls notes updates every 3s specific to the board owner */}
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

      {/* Floating note creation modal (Only visible to owner) */}
      {isOwner && <NoteModal />}

      {/* Client-side Drag & Drop Logic + HTMX Integration */}
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
 
            // Handle start dragging (delegated to container)
            function startDrag(e) {
              if (!isOwner) return; // Disable dragging for non-owners

              // Ignore if clicking a button or input inside the card
              if (e.target.closest('button') || e.target.closest('form') || e.target.closest('input') || e.target.closest('textarea')) {
                return;
              }
 
              const card = e.target.closest('.note-card');
              if (!card) return;
 
              activeNote = card;
              window.isDragging = true;
              card.style.zIndex = 1000; // Bring card to front
 
              // Get pointer coords
              const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
              const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
 
              startX = clientX;
              startY = clientY;
 
              // Parse percentages to pixels relative to canvas
              const rect = canvas.getBoundingClientRect();
              initialLeft = (parseFloat(card.style.left) / 100) * rect.width;
              initialTop = (parseFloat(card.style.top) / 100) * rect.height;
 
              document.addEventListener('mousemove', drag);
              document.addEventListener('touchmove', drag, { passive: false });
              document.addEventListener('mouseup', endDrag);
              document.addEventListener('touchend', endDrag);
            }
 
            // Drag execution
            function drag(e) {
              if (!activeNote) return;
              if (e.cancelable) e.preventDefault(); // Prevent scroll on touch
 
              const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
              const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
 
              const deltaX = clientX - startX;
              const deltaY = clientY - startY;
 
              const rect = canvas.getBoundingClientRect();
              
              // Calculate new position in pixels
              let newLeftPx = initialLeft + deltaX;
              let newTopPx = initialTop + deltaY;
 
              // Constrain boundaries (keep note completely or mostly inside canvas)
              const cardWidth = activeNote.offsetWidth;
              const cardHeight = activeNote.offsetHeight;
              
              newLeftPx = Math.max(0, Math.min(newLeftPx, rect.width - cardWidth));
              newTopPx = Math.max(0, Math.min(newTopPx, rect.height - cardHeight));
 
              // Convert back to percentages
              const xPosPercent = (newLeftPx / rect.width) * 100;
              const yPosPercent = (newTopPx / rect.height) * 100;
 
              activeNote.style.left = xPosPercent + '%';
              activeNote.style.top = yPosPercent + '%';
            }
 
            // End drag, save coordinates to backend
            function endDrag(e) {
              if (!activeNote) return;
 
              const noteId = activeNote.getAttribute('data-note-id');
              const xPos = parseFloat(activeNote.style.left);
              const yPos = parseFloat(activeNote.style.top);
 
              // Update database via fetch PUT
              fetch('/api/notes/' + noteId + '/position', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ xPos, yPos })
              }).catch(err => console.error('Failed to save position:', err));
 
              activeNote.style.zIndex = ''; // Restore z-index
              activeNote = null;
              
              // Set timeout to release dragging flag, preventing HTMX poll from instantly firing
              setTimeout(function() {
                window.isDragging = false;
              }, 100);
 
              document.removeEventListener('mousemove', drag);
              document.removeEventListener('touchmove', drag);
              document.removeEventListener('mouseup', endDrag);
              document.removeEventListener('touchend', endDrag);
            }
 
            // Bind start drag listeners if owner
            if (isOwner) {
              container.addEventListener('mousedown', startDrag);
              container.addEventListener('touchstart', startDrag, { passive: true });
            }
 
            // HTMX integration: Prevent board polling while dragging
            document.addEventListener('htmx:beforeRequest', function(evt) {
              if (evt.detail.target.id === 'board-notes-container' && window.isDragging) {
                evt.preventDefault(); // Cancel the request
              }
            });
 
            // HTMX integration: Update note count badge dynamically
            document.addEventListener('htmx:afterOnLoad', function(evt) {
              if (evt.detail.target.id === 'board-notes-container') {
                const count = document.querySelectorAll('#board-notes-container .note-card').length;
                document.getElementById('note-count').innerText = count;
              }
            });

            // Add current board to visited history in localStorage
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
