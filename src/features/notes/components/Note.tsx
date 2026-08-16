interface NoteProps {
  id: string;
  content: string;
  color: string;
  xPos: number;
  yPos: number;
  key?: string;
}

export const Note = ({ id, content, color, xPos, yPos }: NoteProps) => {
  // Deterministic tilt based on ID to look organic but remain consistent
  const getTiltClass = (noteId: string) => {
    const sum = noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const tilts = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0', '-rotate-[1.5deg]', 'rotate-[1.5deg]'];
    return tilts[sum % tilts.length];
  };

  // Color classes for sticky notes
  const colorMap: Record<string, { bg: string; border: string; text: string; pin: string }> = {
    yellow: {
      bg: 'bg-[#fef9c3]',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      pin: 'bg-yellow-500',
    },
    pink: {
      bg: 'bg-[#fce7f3]',
      border: 'border-pink-200',
      text: 'text-pink-900',
      pin: 'bg-pink-500',
    },
    blue: {
      bg: 'bg-[#dbeafe]',
      border: 'border-blue-200',
      text: 'text-blue-900',
      pin: 'bg-blue-500',
    },
    green: {
      bg: 'bg-[#dcfce7]',
      border: 'border-green-200',
      text: 'text-green-900',
      pin: 'bg-green-500',
    },
    purple: {
      bg: 'bg-[#f3e8ff]',
      border: 'border-purple-200',
      text: 'text-purple-900',
      pin: 'bg-purple-500',
    },
  };

  const style = colorMap[color] || colorMap.yellow;
  const tilt = getTiltClass(id);

  return (
    <div
      id={`note-${id}`}
      class={`note-card absolute p-5 w-60 min-h-[150px] flex flex-col justify-between rounded-md shadow-lg border hover:shadow-2xl transition-shadow duration-200 ${style.bg} ${style.border} ${style.text} ${tilt} cursor-grab active:cursor-grabbing`}
      style={{ left: `${xPos}%`, top: `${yPos}%`, touchAction: 'none' }}
      data-note-id={id}
    >
      {/* Decorative pin */}
      <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full shadow-inner bg-slate-700/80 flex items-center justify-center">
        <div class={`w-1.5 h-1.5 rounded-full ${style.pin}`} />
      </div>

      {/* Delete button (Top Right) */}
      <button
        class="absolute top-2 right-2 opacity-0 hover:opacity-100 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity duration-150 p-1 rounded-full hover:bg-slate-900/5 text-xs font-bold leading-none cursor-pointer"
        hx-delete={`/api/notes/${id}`}
        hx-target={`#note-${id}`}
        hx-swap="outerHTML swap:0.3s"
        title="删除留言"
        style={{ opacity: '0.4' }} // always slightly visible for touch screens
      >
        ✕
      </button>

      {/* Note content (double-click to edit) */}
      <div
        class="note-content mt-2 flex-grow overflow-y-auto break-words text-sm font-medium leading-relaxed font-sans pr-1"
        hx-get={`/api/notes/${id}/edit`}
        hx-trigger="dblclick"
        hx-target="this"
        hx-swap="outerHTML"
        title="双击可编辑内容"
      >
        {content}
      </div>

      {/* Footer / Info */}
      <div class="mt-4 flex items-center justify-between text-[10px] opacity-40 font-mono select-none">
        <span>#{id.slice(0, 8)}</span>
        <span>双击编辑</span>
      </div>
    </div>
  );
};
