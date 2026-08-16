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
      onclick="event.stopPropagation()"
    >
      <textarea
        name="content"
        rows={4}
        maxLength={200}
        required
        class="w-full p-2 text-[15px] font-serif bg-white/60 border border-[#e2d4c7] rounded-lg focus:outline-none focus:border-amber-500 resize-none font-semibold leading-relaxed text-[#382b26]"
        autofocus
        onfocus="const val = this.value; this.value = ''; this.value = val;"
      >
        {content}
      </textarea>
      
      <div class="flex justify-end gap-1.5 text-[10px] font-bold">
        {/* Cancel button */}
        <button
          type="button"
          class="px-2.5 py-1 bg-[#f4ebe1] hover:bg-[#ebdcd0] text-[#6b5b52] rounded-md cursor-pointer transition-colors duration-150 border border-[#e2d4c7]"
          hx-get={`/api/notes/${id}/content`}
          hx-target="closest form"
          hx-swap="outerHTML"
        >
          取消
        </button>
        {/* Save button */}
        <button
          type="submit"
          class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-md cursor-pointer transition-colors duration-150 font-bold border border-amber-400"
        >
          保存
        </button>
      </div>
    </form>
  );
};
