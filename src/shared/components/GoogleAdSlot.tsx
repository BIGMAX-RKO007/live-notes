import { adsConfig } from '../config/ads.config';

interface GoogleAdSlotProps {
  slotId?: string;
  adFormat?: string;
  className?: string;
}

/**
 * 业务意图：Google AdSense 谷歌官方响应式广告单元渲染组件 (Google AdSense Slot Component)。
 * 供悬挂书签、Landing 落地页或画布弹窗挂载使用，渲染 `<ins class="adsbygoogle">` 并触发客户端 JS 推送渲染。
 * 副作用：根据配置动态渲染广告位节点。
 */
export const GoogleAdSlot = ({ slotId, adFormat = 'auto', className = '' }: GoogleAdSlotProps) => {
  const config = adsConfig.googleAdSense;

  // 【步骤 1/2】配置检查 (Guard Clause)
  // 分支 A：若配置中未启用 AdSense 或无发布商 Client ID，静默返回 null 销毁节点
  if (!config || !config.enabled || !config.client) {
    return null;
  }

  const activeSlotId = slotId || config.slotId || '';

  // 【步骤 2/2】渲染 AdSense `<ins>` 节点与 `(adsbygoogle = window.adsbygoogle || []).push({})` 渲染触发脚本
  return (
    <div class={`w-full overflow-hidden my-2 border border-[#e8ded5] rounded-xl bg-[#fcfaf7] p-2 text-center ${className}`}>
      <ins
        class="adsbygoogle"
        style="display:block"
        data-ad-client={config.client}
        data-ad-slot={activeSlotId}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </div>
  );
};
