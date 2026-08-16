export const NoteModal = () => {
  return (
    <div>
      {/* Floating Action Button */}
      <button
        id="open-modal-btn"
        class="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-150 active:scale-95 cursor-pointer font-bold text-2xl"
        onclick="document.getElementById('note-modal').classList.remove('hidden')"
        title="写下新留言"
      >
        +
      </button>

      {/* Modal Overlay */}
      <div
        id="note-modal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm hidden"
        onclick="if(event.target === this) this.classList.add('hidden')"
      >
        {/* Modal Card */}
        <div class="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl mx-4">
          {/* Close button */}
          <button
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors duration-150 font-bold text-lg cursor-pointer"
            onclick="document.getElementById('note-modal').classList.add('hidden')"
          >
            ✕
          </button>

          <h3 class="text-lg font-bold text-slate-100 mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            新建匿名留言
          </h3>

          <form
            hx-post="/api/notes"
            hx-target="#board-notes-container"
            hx-swap="beforeend"
            hx-on="htmx:afterRequest: if(event.detail.successful) { document.getElementById('note-modal').classList.add('hidden'); document.getElementById('note-form').reset(); }"
            id="note-form"
            class="flex flex-col gap-4"
          >
            {/* Content Input */}
            <div class="flex flex-col gap-1.5">
              <label for="content-textarea" class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                留言内容
              </label>
              <textarea
                id="content-textarea"
                name="content"
                rows={4}
                maxlength={200}
                required
                placeholder="写下你想说的话，限制 200 字以内..."
                class="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none transition-colors duration-150"
              />
            </div>

            {/* Color Picker */}
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                选择便签颜色
              </span>
              <div class="flex gap-3 mt-1">
                {/* Yellow */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="yellow" checked class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#fef9c3] border-2 border-transparent peer-checked:border-slate-400 transition-all duration-150" />
                </label>
                {/* Pink */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="pink" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#fce7f3] border-2 border-transparent peer-checked:border-slate-400 transition-all duration-150" />
                </label>
                {/* Blue */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="blue" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#dbeafe] border-2 border-transparent peer-checked:border-slate-400 transition-all duration-150" />
                </label>
                {/* Green */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="green" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#dcfce7] border-2 border-transparent peer-checked:border-slate-400 transition-all duration-150" />
                </label>
                {/* Purple */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="purple" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#f3e8ff] border-2 border-transparent peer-checked:border-slate-400 transition-all duration-150" />
                </label>
              </div>
            </div>

            {/* Hidden initial position */}
            {/* We will assign random positions on the server, but let's have defaults */}
            <input type="hidden" name="xPos" value="45" />
            <input type="hidden" name="yPos" value="45" />

            {/* Submit Button */}
            <button
              type="submit"
              class="w-full py-2.5 mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              钉上墙面
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
