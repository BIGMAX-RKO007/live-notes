import { adsConfig } from '../../../shared/config/ads.config';
import { GoogleAdSlot } from '../../../shared/components/GoogleAdSlot';

export const CornerBookmark = () => {
  const adsList = adsConfig.bookmarkAds;
  const business = adsConfig.contactBusiness;

  const badgeColorStyle = (color: string) => {
    switch (color) {
      case 'rose':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'amber':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'blue':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'emerald':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div>
      {/* Hanging Bookmark Trigger - Bottom Left */}
      <div
        id="corner-bookmark-btn"
        class="fixed bottom-8 left-8 z-40 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-300 hover:to-pink-400 text-white rounded-2xl shadow-lg shadow-rose-900/15 cursor-pointer animate-bookmark-swing transition-all active:scale-95 border border-rose-300 select-none"
        onclick="document.getElementById('bookmark-modal').classList.remove('hidden')"
        title="点击查看今日手账福利"
      >
        <span class="text-base">🔖</span>
        <span class="text-xs font-bold font-sans tracking-wide">手账特惠福利</span>
      </div>

      {/* Bookmark Ad Envelope Modal */}
      <div
        id="bookmark-modal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm hidden"
        onclick="if(event.target === this) this.classList.add('hidden')"
      >
        <div class="relative w-full max-w-md p-6 bg-[#fffdfa] border border-[#e2d4c7] rounded-2xl shadow-2xl mx-4 font-sans">
          {/* Close button */}
          <button
            class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            onclick="document.getElementById('bookmark-modal').classList.add('hidden')"
          >
            ✕
          </button>

          <div class="flex items-center gap-2 mb-4 border-b border-[#eee5dc] pb-3">
            <span class="text-2xl">🎁</span>
            <div>
              <h3 class="text-lg font-bold text-[#382b26] font-serif">
                今日手账精选福利
              </h3>
              <p class="text-xs text-[#8c7b70]">
                精选优质文具与手账好物推荐
              </p>
            </div>
          </div>

          {/* Google AdSense Unit (Automatic / Banner) */}
          <GoogleAdSlot />

          {/* Ad Cards List */}
          <div class="flex flex-col gap-3 my-4 max-h-[340px] overflow-y-auto pr-1">
            {adsList.map((item) => (
              <a
                key={item.id}
                href={item.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-3 bg-[#fcfaf7] border border-[#e2d4c7] hover:border-amber-400 rounded-xl transition-all hover:shadow-sm cursor-pointer group"
              >
                <div class="w-12 h-12 rounded-lg bg-amber-100/80 border border-amber-200 flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <h4 class="text-sm font-bold text-[#382b26] group-hover:text-amber-700 truncate font-serif">
                      {item.title}
                    </h4>
                    <span class={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${badgeColorStyle(item.badgeColor)}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p class="text-xs text-[#8c7b70] truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Business & Sponsor Contact Footer */}
          <div class="flex items-center justify-between pt-3 border-t border-[#eee5dc] text-[11px] text-[#b5a69c]">
            <span>赞助商广告 · 保持手账社区良性运营</span>
            <button
              type="button"
              class="text-amber-700 hover:underline cursor-pointer font-medium flex items-center gap-0.5"
              onclick="document.getElementById('bookmark-modal').classList.add('hidden'); document.getElementById('business-modal').classList.remove('hidden')"
            >
              <span>📢 商务合作</span>
            </button>
          </div>
        </div>
      </div>

      {/* Business Cooperation Modal */}
      <div
        id="business-modal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm hidden"
        onclick="if(event.target === this) this.classList.add('hidden')"
      >
        <div class="relative w-full max-w-sm p-6 bg-[#fffdfa] border border-[#e2d4c7] rounded-2xl shadow-2xl mx-4 text-center font-sans">
          <button
            class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            onclick="document.getElementById('business-modal').classList.add('hidden')"
          >
            ✕
          </button>

          <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-2xl shadow-xs">
            💼
          </div>

          <h3 class="text-xl font-bold text-[#382b26] mb-2 font-serif">
            广告位招租与商务合作
          </h3>
          <p class="text-xs text-[#78685f] mb-4 leading-relaxed">
            {business.note}
          </p>

          <div class="flex flex-col gap-2 p-3.5 bg-[#fcfaf7] border border-[#e2d4c7] rounded-xl text-left text-xs font-mono mb-4 text-[#5c4a40]">
            <div class="flex justify-between items-center">
              <span class="text-[#8c7b70] font-sans">📧 合作邮箱：</span>
              <span class="font-bold text-amber-900 select-all">{business.email}</span>
            </div>
            {business.wechat && (
              <div class="flex justify-between items-center pt-2 border-t border-[#eee5dc]">
                <span class="text-[#8c7b70] font-sans">💬 微信联系：</span>
                <span class="font-bold text-amber-900 select-all">{business.wechat}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            class="w-full py-2.5 bg-[#f4ebe1] hover:bg-[#ebdcd0] border border-[#e2d4c7] text-[#6b5b52] font-bold rounded-xl transition-all cursor-pointer text-xs"
            onclick="document.getElementById('business-modal').classList.add('hidden')"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
