import { Note } from '../../notes/components/Note';
import { NoteModal } from '../../notes/components/NoteModal';

interface BoardProps {
  notes: Array<{
    id: string;
    content: string;
    color: string;
    xPos: number;
    yPos: number;
  }>;
}

export const Board = ({ notes }: BoardProps) => {
  return (
    <div class="flex-grow flex flex-col h-full overflow-hidden relative">
      {/* Header Bar */}
      <header class="z-30 flex items-center justify-between px-8 py-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        <div class="flex flex-col">
          <h1 class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            📌 实时匿名留言墙
          </h1>
          <p class="text-xs text-slate-400 mt-0.5">
            双击便签内容可进行编辑，拖拽可调整任意便签的位置
          </p>
        </div>
        <div class="flex items-center gap-4 text-xs">
          <div class="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-slate-300 font-medium">
            留言总数: <span id="note-count" class="font-mono text-indigo-400 font-bold">{notes.length}</span> 张
          </div>
        </div>
      </header>

      {/* Main Interactive Board Canvas */}
      <div 
        id="board-canvas" 
        class="flex-grow w-full h-full relative overflow-hidden"
      >
        {/* Polling container - pulls notes updates every 3s */}
        <div
          id="board-notes-container"
          hx-get="/api/notes/list"
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
            />
          ))}
        </div>
      </div>

      {/* Floating note creation modal */}
      <NoteModal />

      {/* Client-side Drag & Drop Logic + HTMX Integration */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
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

            // Bind start listeners
            container.addEventListener('mousedown', startDrag);
            container.addEventListener('touchstart', startDrag, { passive: true });

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
          })();
        `
      }} />
    </div>
  );
};
