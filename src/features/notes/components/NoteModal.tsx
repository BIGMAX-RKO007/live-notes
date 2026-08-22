import { adsConfig } from '../../../shared/config/ads.config';

interface NoteModalProps {
  boardOwnerId?: string;
}

/**
 * 业务意图：撰写/贴上新手账便签模态框组件 (Create Note Modal Component)。
 * 提供右下角固定定位的 `+` 悬浮触发按钮，点击弹出拟物风手账表单，支持输入文本、选择纸张色彩并原生嵌入好物推荐推广外链。
 * 副作用：无状态，通过 HTMX 发起 POST /api/notes，表单提交成功后重置 DOM 输入框并隐藏 Modal。
 */
export const NoteModal = ({ boardOwnerId = '' }: NoteModalProps) => {
  const footerAd = adsConfig.modalFooterBanner;

  return (
    <div>
      {/* 【步骤 1/4】右下角 Floating Action Button (`+` 按钮)：带有呼吸脉冲动画，点击显示弹窗 */}
      <button
        id="open-modal-btn"
        class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 rounded-full shadow-lg shadow-amber-900/20 animate-[pulse_2.5s_infinite] transition-all duration-150 active:scale-95 cursor-pointer font-bold text-2xl border border-amber-300"
        onclick="document.getElementById('note-modal').classList.remove('hidden')"
        title="写下新手账留言"
      >
        +
      </button>

      {/* 【步骤 2/4】 Modal Overlay：磨砂玻璃遮罩层，点击遮罩背景自动隐藏 */}
      <div
        id="note-modal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm hidden"
        onclick="if(event.target === this) this.classList.add('hidden')"
      >
        {/* Modal 拟物纸卡片 */}
        <div class="relative w-full max-w-md p-6 bg-[#fffdfa] border border-[#e2d4c7] rounded-2xl shadow-2xl mx-4">
          {/* 关闭按钮 ✕ */}
          <button
            class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] transition-colors duration-150 font-bold text-lg cursor-pointer"
            onclick="document.getElementById('note-modal').classList.add('hidden')"
          >
            ✕
          </button>

          <h3 class="text-xl font-bold text-[#382b26] mb-4 font-serif">
            ✍️ 撰写手账留言
          </h3>

          {/* 【步骤 3/4】表单配置：使用 HTMX POST /api/notes，成功后直接 append 到 #board-notes-container */}
          <form
            hx-post="/api/notes"
            hx-target="#board-notes-container"
            hx-swap="beforeend"
            hx-on="htmx:afterRequest: if(event.detail.successful) { document.getElementById('note-modal').classList.add('hidden'); document.getElementById('note-form').reset(); }"
            id="note-form"
            class="flex flex-col gap-4"
          >
            {/* 留言文本输入域 */}
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

            {/* 莫兰迪手账色调 Radio 单选选择器 */}
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-[#8c7b70] uppercase tracking-wider font-sans">
                选择手账纸色调
              </span>
              <div class="flex gap-3 mt-1">
                {/* Yellow 色彩 */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="yellow" checked class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#fef6e4] border-2 border-[#e2d4c7] peer-checked:border-amber-600 transition-all duration-150 shadow-sm" />
                </label>
                {/* Pink 色彩 */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="pink" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#fcf0e4] border-2 border-[#e2d4c7] peer-checked:border-rose-500 transition-all duration-150 shadow-sm" />
                </label>
                {/* Blue 色彩 */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="blue" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#eaf4f4] border-2 border-[#e2d4c7] peer-checked:border-sky-500 transition-all duration-150 shadow-sm" />
                </label>
                {/* Green 色彩 */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="green" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#e8f5e9] border-2 border-[#e2d4c7] peer-checked:border-emerald-500 transition-all duration-150 shadow-sm" />
                </label>
                {/* Purple 色彩 */}
                <label class="relative cursor-pointer">
                  <input type="radio" name="color" value="purple" class="sr-only peer" />
                  <div class="w-8 h-8 rounded-full bg-[#f3e8ff] border-2 border-[#e2d4c7] peer-checked:border-purple-500 transition-all duration-150 shadow-sm" />
                </label>
              </div>
            </div>

            {/* 隐藏字段：设定初始默认的中心百分比坐标 (45%, 45%) 与目标画板主人 ID */}
            <input type="hidden" name="xPos" value="45" />
            <input type="hidden" name="yPos" value="45" />
            <input type="hidden" name="boardOwnerId" value={boardOwnerId} />

            {/* 提交按钮 */}
            <button
              type="submit"
              class="w-full py-3 mt-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 text-sm font-bold rounded-xl shadow-md transition-all duration-150 active:scale-[0.98] cursor-pointer font-sans"
            >
              贴在手账本里 🌸
            </button>

            {/* 【步骤 4/4】原生广告推介位：表单底部好物推荐文字链 */}
            {/* 分支 A：配置中开启了 footerAd，显示手账达人好物推荐外链 */}
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
