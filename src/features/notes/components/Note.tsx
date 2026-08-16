import { getAnonymousNickname } from '../../../shared/utils/nickname';

interface NoteProps {
  id: string;
  content: string;
  color: string;
  xPos: number;
  yPos: number;
  likes?: number;
  isOwner?: boolean;
  key?: string;
}

export const Note = ({ id, content, color, xPos, yPos, likes = 0, isOwner = true }: NoteProps) => {
  // Deterministic tilt based on ID to look organic but remain consistent
  const getTiltClass = (noteId: string) => {
    const sum = noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const tilts = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0', '-rotate-[1.5deg]', 'rotate-[1.5deg]'];
    return tilts[sum % tilts.length];
  };

  // Color classes for cozy Morandi journal notes
  const colorMap: Record<string, { bg: string; border: string; text: string; tapeClass: string; tapeAngle: string }> = {
    yellow: {
      bg: 'bg-gradient-to-br from-[#fffdf7] to-[#fef6e4]',
      border: 'border-[#f5ea8a]/80',
      text: 'text-[#4a3b32]',
      tapeClass: 'washi-tape-yellow',
      tapeAngle: '-rotate-2',
    },
    pink: {
      bg: 'bg-gradient-to-br from-[#fff8fa] to-[#fcf0e4]',
      border: 'border-[#fbcfe8]/80',
      text: 'text-[#4a3b32]',
      tapeClass: 'washi-tape-pink',
      tapeAngle: 'rotate-1.5',
    },
    blue: {
      bg: 'bg-gradient-to-br from-[#f8fafc] to-[#eaf4f4]',
      border: 'border-[#bae6fd]/80',
      text: 'text-[#334155]',
      tapeClass: 'washi-tape-blue',
      tapeAngle: '-rotate-1',
    },
    green: {
      bg: 'bg-gradient-to-br from-[#f8faf8] to-[#e8f5e9]',
      border: 'border-[#c6f6d5]/80',
      text: 'text-[#2e4a3b]',
      tapeClass: 'washi-tape-green',
      tapeAngle: 'rotate-2',
    },
    purple: {
      bg: 'bg-gradient-to-br from-[#faf8fc] to-[#f3e8ff]',
      border: 'border-[#e9d5ff]/80',
      text: 'text-[#4a3b4e]',
      tapeClass: 'washi-tape-purple',
      tapeAngle: '-rotate-1.5',
    },
  };

  const style = colorMap[color] || colorMap.yellow;
  const tilt = getTiltClass(id);

  return (
    <div
      id={`note-${id}`}
      class={`note-card absolute p-6 w-64 min-h-[175px] flex flex-col justify-between rounded-md paper-shadow paper-texture border ${style.bg} ${style.border} ${style.text} ${tilt} ${isOwner ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ left: `${xPos}%`, top: `${yPos}%`, touchAction: 'none' }}
      data-note-id={id}
    >
      {/* Skeuomorphic Washi Tape (和纸胶带) Top Strip */}
      <div 
        class={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 ${style.tapeClass} ${style.tapeAngle} shadow-sm pointer-events-none z-10 opacity-90`}
        style={{
          clipPath: 'polygon(0% 10%, 4% 0%, 96% 0%, 100% 10%, 97% 25%, 100% 40%, 96% 55%, 100% 70%, 97% 85%, 100% 100%, 96% 100%, 4% 100%, 0% 100%, 3% 85%, 0% 70%, 4% 55%, 0% 40%, 3% 25%)'
        }}
      />

      {/* Delete button (Top Right, only visible to owner) */}
      {isOwner && (
        <button
          class="absolute top-2.5 right-2.5 opacity-30 hover:opacity-100 text-[#8c7b70] hover:text-red-500 transition-all duration-150 p-1 rounded-full hover:bg-black/5 text-xs font-bold leading-none cursor-pointer z-20"
          hx-delete={`/api/notes/${id}`}
          hx-target={`#note-${id}`}
          hx-swap="outerHTML swap:0.3s"
          title="删除留言"
        >
          ✕
        </button>
      )}

      {/* Note content (double-click to edit, beautiful Noto Serif SC font) */}
      {isOwner ? (
        <div
          class="note-content mt-3 flex-grow overflow-y-auto break-words text-[15px] font-serif font-semibold leading-relaxed pr-1 text-[#382b26]"
          hx-get={`/api/notes/${id}/edit`}
          hx-trigger="dblclick"
          hx-target="this"
          hx-swap="outerHTML"
          title="双击可编辑内容"
        >
          {content}
        </div>
      ) : (
        <div class="note-content mt-3 flex-grow overflow-y-auto break-words text-[15px] font-serif font-semibold leading-relaxed pr-1 text-[#382b26]">
          {content}
        </div>
      )}

      {/* Footer / Info with Likes Stamp and Nickname Stamp */}
      <div class="mt-4 pt-2 border-t border-[#e6ded6]/60 flex items-center justify-between text-[11px] select-none font-sans">
        {/* Likes Button (anyone can click) */}
        <button 
          hx-post={`/api/notes/${id}/like`}
          hx-swap="outerHTML" 
          class="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#f4ebe1]/80 hover:bg-[#ebdcd0] border border-[#e2d4c7] transition-all text-[11px] font-bold text-rose-500 active:scale-95 cursor-pointer shadow-sm select-none"
          onclick="event.stopPropagation()"
          title="给这条手账留言点赞"
        >
          ❤️ <span class="text-[#6b5b52] font-mono font-medium">{likes}</span>
        </button>

        {/* Anonymous Nickname Stamp */}
        <span class="text-[11px] text-[#8c7b70] font-serif font-medium tracking-wide flex items-center gap-1 bg-[#f4ebe1]/60 px-2 py-0.5 rounded border border-[#e8ded5]">
          <span>{getAnonymousNickname(id)}</span>
          <span class="text-[9px] opacity-70 font-sans border border-[#8c7b70]/40 rounded px-0.5 scale-90">印</span>
        </span>
      </div>
    </div>
  );
};
