/**
 * 🛍️ 手账风原生广告、Google AdSense 与电商联盟 (CPS / 淘客 / 京东) 中央配置文件
 * 修改此文件中的链接、发布商 ID 或文字，页面所有广告位将自动同步更新。
 */

export interface GoogleAdSenseConfig {
  enabled: boolean;
  client: string;
  scriptUrl: string;
  slotId?: string;
}

export interface SponsorAdConfig {
  enabled: boolean;
  tag: string;
  brandName: string;
  title: string;
  description: string;
  icon: string;
  ctaText: string;
  targetUrl: string;
  modalTitle: string;
  modalDescription: string;
  likesCount: string;
}

export interface BookmarkAdItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: 'rose' | 'amber' | 'blue' | 'emerald';
  targetUrl: string;
}

export interface ModalFooterAdConfig {
  enabled: boolean;
  icon: string;
  text: string;
  targetUrl: string;
}

export interface ContactBusinessConfig {
  email: string;
  wechat?: string;
  note: string;
}

export const adsConfig = {
  // 0. Google AdSense 谷歌官方广告（所有权验证与自动广告）
  googleAdSense: {
    enabled: true,
    client: 'ca-pub-3978355800233117',
    scriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3978355800233117',
    slotId: '',
  } as GoogleAdSenseConfig,

  // 1. 画板右上侧——品牌赞助手账卡片 (Sponsor Note)
  sponsorNote: {
    enabled: true,
    tag: '✨ 独家好物赞助',
    brandName: 'Sponsor',
    title: '星巴克 · 手账温暖福利卡',
    description: '在记录生活微光的午后，别忘了给自己来一杯香醇咖啡。凭此卡立享限定买一送一！',
    icon: '☕',
    ctaText: '🎁 专属领取 ➔',
    targetUrl: 'https://www.starbucks.com.cn',
    modalTitle: '星巴克 · 午后手账季福利',
    modalDescription: '感谢您陪伴手账留言墙！点击下方按钮即可前往领取星巴克午后手账限定买一送一饮品券。',
    likesCount: '999+ 赞',
  } as SponsorAdConfig,

  // 2. 画板左下角——手账书签弹窗推荐列表 (Bookmark Ads)
  bookmarkAds: [
    {
      id: 'item-1',
      icon: '✒️',
      title: '百乐/Pilot 复古手账钢笔礼盒',
      subtitle: '控墨顺滑，手账书写必备神器',
      badge: '立减 ¥20',
      badgeColor: 'rose',
      targetUrl: 'https://s.click.taobao.com/example_pilot_pen', // 可替换为淘客/京东推广链接
    },
    {
      id: 'item-2',
      icon: '✂️',
      title: 'MT 日本限定和纸胶带套装 (10卷)',
      subtitle: '经典复古锯齿边缘，柔和高颜值',
      badge: '包邮特惠',
      badgeColor: 'amber',
      targetUrl: 'https://union.jd.com/example_washi_tape', // 可替换为京东联盟链接
    },
    {
      id: 'item-3',
      icon: '📓',
      title: 'Moleskine 经典硬面方格手账本',
      subtitle: '180° 平摊设计，纸质细腻防透墨',
      badge: '热销推荐',
      badgeColor: 'emerald',
      targetUrl: 'https://s.click.taobao.com/example_moleskine',
    },
  ] as BookmarkAdItem[],

  // 3. 新建便签弹窗——底部好物推荐标语 (Modal Footer Banner)
  modalFooterBanner: {
    enabled: true,
    icon: '💡',
    text: '手账达人好物：复古文具礼盒与印章盒 ➔',
    targetUrl: 'https://s.click.taobao.com/example_stationery_set',
  } as ModalFooterAdConfig,

  // 4. 商务合作 / 广告位招租联系信息 (Self-Serve Business Contact)
  contactBusiness: {
    email: 'business@livenotes.com',
    wechat: 'LiveNotes_BD',
    note: '欢迎手账文具、生活方式、咖啡饮品品牌及广告代理商合作。我们提供高点击率的原生拟物卡片展示！',
  } as ContactBusinessConfig,
};
