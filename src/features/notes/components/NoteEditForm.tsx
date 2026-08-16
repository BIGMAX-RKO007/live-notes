interface NoteEditFormProps {
  id: string;
  content: string;
  color: string;
}

export const NoteEditForm = ({ id, content, color }: NoteEditFormProps) => {
  return (
    <form
      hx-patch={`/api/notes/${id}`}
      hx-target={`#note-${id}`}
      hx-swap="outerHTML"
      class="flex flex-col gap-2 w-full flex-grow mt-2"
      onclick="event.stopPropagation()" // Prevent drag events when clicking form
    >
      <textarea
        name="content"
        rows={4}
        maxlength={200}
        required
        class="w-full p-2 text-xs bg-white/40 border border-slate-300/60 rounded focus:outline-none focus:border-slate-500 resize-none font-medium leading-relaxed text-slate-800"
        autofocus
        onfocus="const val = this.value; this.value = ''; this.value = val;" // Set cursor to end of text
      >
        {content}
      </textarea>
      
      <div class="flex justify-end gap-1.5 text-[10px] font-bold">
        {/* Cancel button */}
        <button
          type="button"
          class="px-2 py-1 bg-slate-950/5 hover:bg-slate-950/10 text-slate-700 rounded cursor-pointer transition-colors duration-150"
          hx-get={`/api/notes/${id}/content`}
          hx-target="closest form"
          hx-swap="outerHTML"
        >
          取消
        </button>
        {/* Save button */}
        <button
          type="submit"
          class="px-2 py-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded cursor-pointer transition-colors duration-150"
        >
          保存
        </button>
      </div>
    </form>
  );
};
