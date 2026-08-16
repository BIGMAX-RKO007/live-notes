export const Landing = () => {
  return (
    <div class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent px-4">
      {/* Decorative Warm Sunset Glow Orbs */}
      <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-orange-200/20 blur-3xl pointer-events-none"></div>

      <div class="relative z-10 text-center max-w-2xl flex flex-col items-center gap-6">
        {/* Floating Journal Cards with Washi Tapes Deco */}
        <div class="flex gap-4 mb-3 select-none pointer-events-none relative">
          <div class="relative w-16 h-16 bg-gradient-to-br from-[#fffdf7] to-[#fef6e4] rounded-lg paper-shadow rotate-[-6deg] border border-[#f5ea8a] flex items-center justify-center font-bold text-amber-900 text-xl font-serif">
            <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 washi-tape-yellow opacity-90 shadow-sm" />
            💡
          </div>
          <div class="relative w-16 h-16 bg-gradient-to-br from-[#fff8fa] to-[#fcf0e4] rounded-lg paper-shadow rotate-[4deg] border border-[#fbcfe8] flex items-center justify-center font-bold text-pink-900 text-xl font-serif">
            <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 washi-tape-pink opacity-90 shadow-sm" />
            ✍️
          </div>
          <div class="relative w-16 h-16 bg-gradient-to-br from-[#f8fafc] to-[#eaf4f4] rounded-lg paper-shadow rotate-[-2deg] border border-[#bae6fd] flex items-center justify-center font-bold text-blue-900 text-xl font-serif">
            <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 washi-tape-blue opacity-90 shadow-sm" />
            🌸
          </div>
        </div>

        <h1 class="text-4xl sm:text-6xl font-bold tracking-tight text-[#382b26] font-serif">
          治愈手账留言墙
        </h1>

        <p class="text-lg sm:text-xl text-[#78685f] font-medium leading-relaxed max-w-lg font-sans">
          记录日常温暖微光，贴在彼此的手账本里。
          <br />
          <span class="text-sm text-[#a09085]">好友可在线翻阅与点赞，只有您可以自由撰写与移动贴纸。</span>
        </p>

        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4">
          <button 
            hx-get="/api/auth/login-modal"
            hx-target="body"
            hx-swap="beforeend"
            class="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold transition-all shadow-md shadow-amber-900/10 active:scale-95 font-sans cursor-pointer border border-amber-300"
          >
            📖 我的画板
          </button>
          <button 
            hx-get="/api/board/friends-modal"
            hx-target="body"
            hx-swap="beforeend"
            class="flex-1 py-4 px-6 rounded-2xl bg-[#f4ebe1] hover:bg-[#ebdcd0] text-[#6b5b52] border border-[#e2d4c7] font-bold transition-all active:scale-95 font-sans cursor-pointer shadow-sm"
          >
            👥 朋友的画板
          </button>
        </div>

        <div class="mt-10 text-xs text-[#b5a69c] tracking-wider uppercase font-serif">
          📖 治愈系·实时手账空间 · Powered by Hono + HTMX
        </div>
      </div>
    </div>
  );
};
