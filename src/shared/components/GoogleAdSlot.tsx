import { adsConfig } from '../config/ads.config';

interface GoogleAdSlotProps {
  slotId?: string;
  adFormat?: string;
  className?: string;
}

export const GoogleAdSlot = ({ slotId, adFormat = 'auto', className = '' }: GoogleAdSlotProps) => {
  const config = adsConfig.googleAdSense;

  if (!config || !config.enabled || !config.client) {
    return null;
  }

  const activeSlotId = slotId || config.slotId || '';

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
