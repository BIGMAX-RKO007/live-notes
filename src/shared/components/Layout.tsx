import { Child } from 'hono/jsx';
import { adsConfig } from '../config/ads.config';

interface LayoutProps {
  children: Child;
  title: string;
}

/**
 * 业务意图：全站 HTML 外壳 Shell 组件 (Master Page Layout Component)。
 * 提供全站统一的“奶油手账风 (Cozy Journal Theme)”设计系统基础：
 * 引入 Google Fonts 手账字体、Tailwind CSS、HTMX 库、Google AdSense 全局验证脚本、方格纸 SVG 网格背景与日落光影。
 * 副作用：无状态依赖，纯服务端 JSX 引擎编译 HTML。
 */
export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <html lang="zh-CN" class="h-full bg-[#fcfaf7] text-[#382b26] antialiased selection:bg-amber-200 selection:text-amber-900">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>

        {/* 【步骤 1/4】动态加载 Google AdSense 谷歌官方验证与自动广告脚本 */}
        {/* 分支 A：配置中开启了谷歌广告 (enabled === true)，向 head 注入脚本 */}
        {adsConfig.googleAdSense && adsConfig.googleAdSense.enabled && (
          <script
            async
            src={adsConfig.googleAdSense.scriptUrl}
            crossOrigin="anonymous"
          />
        )}

        {/* 【步骤 2/4】引入 Google Fonts 字体库：Outfit(西文sans)、Noto Serif SC(手账宋体serif)、Zhi Mang Xing(手写体) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Serif+SC:wght@400;600;700&family=Zhi+Mang+Xing&display=swap" rel="stylesheet" />
        
        {/* 【步骤 3/4】引入 Tailwind CSS 动态编译脚本并注入手账专属设计系统 Design Tokens */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Outfit', 'system-ui', 'sans-serif'],
                    serif: ['Noto Serif SC', 'Georgia', 'serif'],
                    handwritten: ['Zhi Mang Xing', 'Noto Serif SC', 'cursive'],
                  },
                  colors: {
                    journal: '#fcfaf7',
                    'journal-card': '#fffdfa',
                    'journal-dark': '#382b26',
                    'journal-muted': '#78685f',
                  }
                }
              }
            }
          `
        }} />

        {/* 【步骤 4/4】引入 HTMX 超轻量交互库，支持 HTML-over-the-wire 局部无刷请求 */}
        <script src="https://unpkg.com/htmx.org@1.9.12"></script>
        
        {/* 拟物手账 CSS 引擎：方格网格线、撕边和纸胶带 (Washi Tape) 锯齿 `clip-path`、书签摇摆动画 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Cozy Cream Journal Grid Canvas */
            .board-grid {
              background-color: #fcfaf7;
              background-image: 
                radial-gradient(at 15% 15%, rgba(254, 243, 199, 0.45) 0px, transparent 50%),
                radial-gradient(at 85% 85%, rgba(253, 230, 138, 0.3) 0px, transparent 50%),
                radial-gradient(at 50% 50%, rgba(254, 215, 170, 0.25) 0px, transparent 70%);
              background-attachment: fixed;
            }
            
            /* Ambient Sunset Drifting Light Glows */
            .drift-glow-1 {
              position: absolute;
              width: 700px;
              height: 700px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(253, 230, 138, 0.25) 0%, rgba(253, 230, 138, 0) 70%);
              top: -15%;
              left: 15%;
              filter: blur(90px);
              animation: drift 28s infinite alternate ease-in-out;
              pointer-events: none;
            }
            .drift-glow-2 {
              position: absolute;
              width: 800px;
              height: 800px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(254, 215, 170, 0.2) 0%, rgba(254, 215, 170, 0) 70%);
              bottom: -20%;
              right: 10%;
              filter: blur(100px);
              animation: drift 35s infinite alternate-reverse ease-in-out;
              pointer-events: none;
            }
            @keyframes drift {
              0% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(60px, 40px) scale(1.08); }
              100% { transform: translate(-30px, -60px) scale(0.92); }
            }

            /* Infinite Journal Grid Notebook lines */
            .grid-dots {
              background-image: 
                linear-gradient(rgba(212, 197, 185, 0.22) 1px, transparent 1px),
                linear-gradient(90deg, rgba(212, 197, 185, 0.22) 1px, transparent 1px);
              background-size: 24px 24px;
              background-position: center;
            }

            /* Soft Warm Vignette screen borders */
            .vignette-overlay {
              position: absolute;
              inset: 0;
              background: radial-gradient(circle, transparent 50%, rgba(217, 197, 180, 0.18) 100%);
              pointer-events: none;
              z-index: 5;
            }

            /* Skeuomorphic Torn Washi Tape (和纸胶带) */
            .washi-tape-yellow {
              background-color: rgba(254, 240, 138, 0.75);
              background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(253, 224, 71, 0.4) 5px, rgba(253, 224, 71, 0.4) 10px);
              border-top: 1px solid rgba(250, 204, 21, 0.4);
              border-bottom: 1px solid rgba(250, 204, 21, 0.4);
            }
            .washi-tape-pink {
              background-color: rgba(251, 207, 232, 0.75);
              background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(244, 114, 182, 0.35) 5px, rgba(244, 114, 182, 0.35) 10px);
              border-top: 1px solid rgba(244, 114, 182, 0.4);
              border-bottom: 1px solid rgba(244, 114, 182, 0.4);
            }
            .washi-tape-blue {
              background-color: rgba(191, 219, 254, 0.75);
              background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(147, 197, 253, 0.4) 5px, rgba(147, 197, 253, 0.4) 10px);
              border-top: 1px solid rgba(96, 165, 250, 0.4);
              border-bottom: 1px solid rgba(96, 165, 250, 0.4);
            }
            .washi-tape-green {
              background-color: rgba(187, 247, 208, 0.75);
              background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(134, 239, 172, 0.4) 5px, rgba(134, 239, 172, 0.4) 10px);
              border-top: 1px solid rgba(74, 222, 128, 0.4);
              border-bottom: 1px solid rgba(74, 222, 128, 0.4);
            }
            .washi-tape-purple {
              background-color: rgba(233, 213, 255, 0.75);
              background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(216, 180, 254, 0.4) 5px, rgba(216, 180, 254, 0.4) 10px);
              border-top: 1px solid rgba(192, 132, 252, 0.4);
              border-bottom: 1px solid rgba(192, 132, 252, 0.4);
            }
            .washi-tape-gold {
              background-color: rgba(253, 224, 71, 0.85);
              background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(217, 119, 6, 0.45) 5px, rgba(217, 119, 6, 0.45) 10px);
              border-top: 1px solid rgba(217, 119, 6, 0.5);
              border-bottom: 1px solid rgba(217, 119, 6, 0.5);
            }

            @keyframes bookmark-swing {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-4deg); }
            }
            .animate-bookmark-swing {
              animation: bookmark-swing 4s ease-in-out infinite;
              transform-origin: top center;
            }

            /* Skeuomorphic shadow & warmth for journal notes */
            .paper-shadow {
              box-shadow: 
                0 4px 12px rgba(107, 91, 82, 0.07), 
                0 1px 3px rgba(107, 91, 82, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.9);
            }
            .paper-shadow:hover {
              box-shadow: 
                0 12px 24px rgba(107, 91, 82, 0.12), 
                0 4px 8px rgba(107, 91, 82, 0.06),
                inset 0 1px 0 rgba(255, 255, 255, 1);
              transform: translateY(-4px) scale(1.02) !important;
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            /* Journal Card subtle texture */
            .paper-texture {
              position: relative;
            }
            .paper-texture::after {
              content: "";
              position: absolute;
              inset: 0;
              border-radius: inherit;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.025'/%3E%3C/svg%3E");
              pointer-events: none;
              mix-blend-mode: multiply;
              z-index: 2;
            }

            /* Custom Cozy Scrollbars */
            ::-webkit-scrollbar {
              width: 7px;
              height: 7px;
            }
            ::-webkit-scrollbar-track {
              background: rgba(240, 230, 220, 0.3);
            }
            ::-webkit-scrollbar-thumb {
              background: rgba(195, 175, 160, 0.45);
              border-radius: 99px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(175, 155, 140, 0.65);
            }

            /* HTMX Swapping transition */
            .htmx-swapping {
              opacity: 0 !important;
              transform: scale(0.9) rotate(4deg) !important;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
          `
        }} />
      </head>
      <body class="h-full overflow-hidden board-grid grid-dots flex flex-col font-sans select-none relative text-[#382b26]">
        {/* 动态日落柔晕浮动层 */}
        <div class="drift-glow-1"></div>
        <div class="drift-glow-2"></div>
        
        {/* 柔和暗角收边层 */}
        <div class="vignette-overlay"></div>

        {/* 页面内容挂载容器 */}
        <div class="relative z-10 flex flex-col h-full w-full">
          {children}
        </div>
      </body>
    </html>
  );
};
