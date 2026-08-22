import { adsConfig } from '../../../shared/config/ads.config';

/**
 * 业务意图：品牌赞助手账卡片组件 (Sponsor Note Card Component)。
 * 混入画板右上方固定位置 (`left: 74%, top: 16%`)，以限定香槟金和纸胶带与 `✨ 独家好物赞助` 标签展示品牌好物，点击拉出专属弹窗。
 * 副作用：根据配置开启/关闭节点渲染。
 */
export const SponsorNote = () => {
  const config = adsConfig.sponsorNote;

  // 【步骤 1/3】配置关停检测 (Guard Clause)
  // 分支 A：若配置中关停了 sponsorNote (enabled === false)，静默返回 null 销毁节点
  if (!config || !config.enabled) {
    return null;
  }

  return (
    // 【步骤 2/3】渲染品牌赞助手账卡片根节点：配有香槟金胶带 `.washi-tape-gold` 与暖金沙色彩渐变
    <div
      id="sponsor-note"
      class="hidden md:block absolute z-30 transition-transform duration-200 select-none cursor-pointer group hover:z-40"
      style="left: 74%; top: 16%; transform: rotate(-2.5deg);"
      onclick="document.getElementById('sponsor-modal').classList.remove('hidden')"
    >
      {/* 拟物撕边香槟金和纸胶带 */}
      <div 
        class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 w-28 h-5 washi-tape-gold opacity-95 shadow-sm pointer-events-none"
        style="clip-path: polygon(0% 15%, 4% 0%, 8% 12%, 12% 2%, 90% 0%, 94% 15%, 97% 3%, 100% 18%, 100% 85%, 96% 100%, 92% 84%, 87% 96%, 10% 100%, 6% 88%, 3% 98%, 0% 82%);"
      />

      {/* 便签主卡片 */}
      <div class="relative w-64 sm:w-72 p-5 pt-6 bg-gradient-to-br from-[#fffdf5] via-[#fffbf0] to-[#fef6e4] border-2 border-amber-300/80 rounded-2xl paper-shadow paper-texture flex flex-col justify-between overflow-hidden">
        
        {/* 顶部标签 */}
        <div class="flex items-center justify-between mb-3 border-b border-amber-200/60 pb-2">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/90 border border-amber-300 text-[11px] font-bold text-amber-900 font-serif shadow-xs">
            {config.tag}
          </span>
          <span class="text-[10px] text-amber-800/60 font-sans tracking-wider uppercase">
            {config.brandName}
          </span>
        </div>

        {/* 描述正文 */}
        <p class="text-sm font-serif text-[#382b26] leading-relaxed whitespace-pre-wrap mb-4 font-medium">
          {config.icon} <span class="font-bold text-amber-950">{config.title}</span>
          <br />
          {config.description}
        </p>

        {/* 底部领取按钮与赞数盖章 */}
        <div class="flex items-center justify-between pt-2 border-t border-amber-200/50">
          <span class="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-300/80 text-amber-900 text-xs font-bold font-sans hover:bg-amber-500/20 transition-all flex items-center gap-1">
            {config.ctaText}
          </span>

          {/* 红色印章 */}
          <div class="flex items-center gap-1 px-2 py-0.5 rounded border border-rose-300 bg-rose-50/50 text-[10px] font-serif text-rose-700 select-none">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
            <span>{config.likesCount}</span>
          </div>
        </div>
      </div>

      {/* 【步骤 3/3】品牌专属领取福利模态框 */}
      <div 
        id="sponsor-modal" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm hidden cursor-default"
        onclick="event.stopPropagation(); if(event.target === this) this.classList.add('hidden')"
      >
        <div class="relative w-full max-w-sm p-7 bg-[#fffdfa] border border-[#e2d4c7] rounded-2xl shadow-2xl mx-4 text-center font-sans">
          <button 
            class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            onclick="event.stopPropagation(); document.getElementById('sponsor-modal').classList.add('hidden')"
          >
            ✕
          </button>
          
          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-sm">
            {config.icon}
          </div>
          
          <h3 class="text-xl font-bold text-[#382b26] mb-2 font-serif">
            {config.modalTitle}
          </h3>
          <p class="text-sm text-[#78685f] mb-6 leading-relaxed">
            {config.modalDescription}
          </p>

          <a 
            href={config.targetUrl}
            target="_blank" 
            rel="noopener noreferrer"
            class="block w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold rounded-xl shadow-md transition-all active:scale-95 text-center cursor-pointer"
            onclick="event.stopPropagation()"
          >
            立即前往 🚀
          </a>
        </div>
      </div>
    </div>
  );
};
