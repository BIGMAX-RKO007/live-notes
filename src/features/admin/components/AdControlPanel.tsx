import { adsConfig } from '../../../shared/config/ads.config';

/**
 * 业务意图：变现与广告位实时控制组件 (Monetization & Ads Control Panel Component)。
 * 后台可视化切换开关：实时启停 品牌赞助卡片、左下角悬挂书签 与 Google AdSense 官方广告。
 * 副作用：表单通过 HTMX POST /api/admin/ads/toggle 实时变更后端变量与配置。
 */
export const AdControlPanel = () => {
  const google = adsConfig.googleAdSense;
  const sponsor = adsConfig.sponsorNote;
  const bookmark = adsConfig.cornerBookmark;
  const business = adsConfig.contactBusiness;

  return (
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div class="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            🛍️ 变现与广告位实时控制中心
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">后台一键可视化启停广告位、AdSense 广告单元与商务合作信息</p>
        </div>
        <span class="text-xs font-mono px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
          ⚡️ 实时生效中
        </span>
      </div>

      <div id="ad-save-toast" class="hidden mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-mono"></div>

      <form
        hx-post="/admin/ads/toggle"
        hx-target="#ad-save-toast"
        hx-swap="innerHTML"
        class="flex flex-col gap-8"
      >
        {/* 开关 1: 品牌赞助手账卡片 */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-2xl">🏷️</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableSponsorNote"
                    value="true"
                    checked={sponsor.enabled}
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <h4 class="text-sm font-bold text-white font-sans">品牌赞助手账卡片 (SponsorNote)</h4>
              <p class="text-xs text-slate-400 mt-1">展示在画板右侧香槟金贴纸，点击展开好物推广弹窗</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
              <span class="text-slate-500">位置: 画板 (74%, 16%)</span>
              <span class={sponsor.enabled ? 'text-amber-400 font-semibold' : 'text-slate-600'}>
                {sponsor.enabled ? '● 已开启' : '○ 已关停'}
              </span>
            </div>
          </div>

          {/* 开关 2: 左下角悬挂书签 */}
          <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-2xl">🔖</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableCornerBookmark"
                    value="true"
                    checked={bookmark.enabled}
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <h4 class="text-sm font-bold text-white font-sans">左下角悬挂书签 (CornerBookmark)</h4>
              <p class="text-xs text-slate-400 mt-1">左下角微动摆动书签，点击拉出特惠文具商品信封</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
              <span class="text-slate-500">位置: 左下角固定</span>
              <span class={bookmark.enabled ? 'text-amber-400 font-semibold' : 'text-slate-600'}>
                {bookmark.enabled ? '● 已开启' : '○ 已关停'}
              </span>
            </div>
          </div>

          {/* 开关 3: Google AdSense 官方广告 */}
          <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-2xl">🌐</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableGoogleAdSense"
                    value="true"
                    checked={google.enabled}
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <h4 class="text-sm font-bold text-white font-sans">Google AdSense 官方广告</h4>
              <p class="text-xs text-slate-400 mt-1">发布商 ID: <span class="font-mono text-slate-300">{google.client}</span></p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
              <span class="text-slate-500">代码全自动注入</span>
              <span class={google.enabled ? 'text-amber-400 font-semibold' : 'text-slate-600'}>
                {google.enabled ? '● 已开启' : '○ 已关停'}
              </span>
            </div>
          </div>
        </div>

        {/* 商业合作联系参数表单区 */}
        <div class="bg-slate-950/40 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
          <h4 class="text-sm font-bold text-white font-sans flex items-center gap-2">
            ⚙️ 商务合作与招租联系参数配置
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-mono text-slate-400 mb-1">商务邮箱 (Contact Email)</label>
              <input
                type="email"
                name="businessEmail"
                value={business.email}
                class="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label class="block text-xs font-mono text-slate-400 mb-1">商务微信 (WeChat BD)</label>
              <input
                type="text"
                name="businessWechat"
                value={business.wechat || ''}
                class="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-mono text-slate-400 mb-1">招租公告说明 (Business Note)</label>
            <input
              type="text"
              name="businessNote"
              value={business.note}
              class="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs font-sans focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer font-sans text-xs flex items-center gap-2"
          >
            💾 保存并即时应用广告位配置
          </button>
        </div>
      </form>
    </div>
  );
};
