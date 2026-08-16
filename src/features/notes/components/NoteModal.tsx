import { adsConfig } from '../../../shared/config/ads.config';

export const NoteModal = () => {
  const footerAd = adsConfig.modalFooterBanner;

  return (
    <div>
      {/* Floating Action Button */}
      <button
        id="open-modal-btn"
        class="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 rounded-full shadow-lg shadow-amber-900/20 animate-[pulse_2.5s_infinite] transition-all duration-150 active:scale-95 cursor-pointer font-bold text-2xl border border-amber-300"
        onclick="document.getElementById('note-modal').classList.remove('hidden')"
        title="写下新手账留言"
      >
        +
      </button>

      {/* Modal Overlay */}
      <div
        id="note-modal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm hidden"
        onclick="if(event.target === this) this.classList.add('hidden')"
      >
        {/* Modal Card */}
        <div class="relative w-full max-w-md p-6 bg-[#fffdfa] border border-[#e2d4c7] rounded-2xl shadow-2xl mx-4">
          {/* Close button */}
          <button
            class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] transition-colors duration-150 font-bold text-lg cursor-pointer"
            onclick="document.getElementById('note-modal').classList.add('hidden')"
          >
            ✕
          </button>

          <h3 class="text-xl font-bold text-[#382b26] mb-4 font-serif">
            ✍️ 撰写手账留言
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
              <label for="content-textarea" class="text-xs font-semibold text-[#8c7b70] uppercase tracking-wider font-sans">
                留言内容
              </label>
              <textarea
                id="content-textarea"
                name="content"
                rows={4}
                maxLength={200}
                required
                placeholder="写下你想说的话，记录此时此刻的心理感悟..."
                class="w-full p-3 bg-[#fcfaf7] border border-[#e2d4c7] rounded-xl text-sm text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:border-amber-500 font-serif leading-relaxed resize-none transition-colors duration-150"
              />
            </div>

            {/* Color Picker */}
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-[#8c7b70] uppercase tracking-wider font-sans">
                选择手账纸色调
              </span>
              <div class="flex gap-3 mt-1">
                {/* Yellow */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="yellow" checked class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#fef6e4] border-2 border-[#e2d4c7] peer-checked:border-amber-600 transition-all duration-150 shadow-sm" />
                </label>
                {/* Pink */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="pink" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#fcf0e4] border-2 border-[#e2d4c7] peer-checked:border-rose-500 transition-all duration-150 shadow-sm" />
                </label>
                {/* Blue */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="blue" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#eaf4f4] border-2 border-[#e2d4c7] peer-checked:border-sky-500 transition-all duration-150 shadow-sm" />
                </label>
                {/* Green */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="green" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#e8f5e9] border-2 border-[#e2d4c7] peer-checked:border-emerald-500 transition-all duration-150 shadow-sm" />
                </label>
                {/* Purple */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="purple" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#f3e8ff] border-2 border-[#e2d4c7] peer-checked:border-purple-500 transition-all duration-150 shadow-sm" />
                </label>
              </div>
            </div>

            {/* Hidden initial position */}
            <input type="hidden" name="xPos" value="45" />
            <input type="hidden" name="yPos" value="45" />

            {/* Submit Button */}
            <button
              type="submit"
              class="w-full py-3 mt-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 text-sm font-bold rounded-xl shadow-md transition-all duration-150 active:scale-[0.98] cursor-pointer font-sans"
            >
              贴在手账本里 🌸
            </button>

            {/* Native Ad / Promo Banner Footer */}
            {footerAd && footerAd.enabled && (
              <div class="mt-3 pt-3 border-t border-[#eee5dc] text-center">
                <a
                  href={footerAd.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] font-medium text-amber-900 hover:text-amber-950 hover:bg-amber-100/90 transition-all font-sans cursor-pointer"
                >
                  <span>{footerAd.icon}</span>
                  <span>{footerAd.text}</span>
                </a>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
