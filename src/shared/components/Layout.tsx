import { Child } from 'hono/jsx';

interface LayoutProps {
  children: Child;
  title: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <html lang="zh-CN" class="h-full bg-slate-950 text-slate-100">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Configure Tailwind with custom values */}
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    board: '#0f172a',
                  }
                }
              }
            }
          `
        }} />
        {/* HTMX */}
        <script src="https://unpkg.com/htmx.org@1.9.12"></script>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Beautiful gradient background */
            .board-grid {
              background-color: #0c0f1d;
              background-image: 
                radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                radial-gradient(at 50% 0%, hsla(225,39%,25%,0.3) 0, transparent 50%), 
                radial-gradient(at 100% 0%, hsla(339,49%,20%,0.2) 0, transparent 50%),
                radial-gradient(at 0% 100%, hsla(225,39%,15%,0.3) 0, transparent 50%), 
                radial-gradient(at 100% 100%, hsla(253,16%,7%,1) 0, transparent 50%);
              background-size: cover;
            }
            .grid-dots {
              background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
              background-size: 28px 28px;
            }
            /* Custom scrollbars */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            ::-webkit-scrollbar-track {
              background: rgba(12, 15, 29, 0.5);
            }
            ::-webkit-scrollbar-thumb {
              background: rgba(148, 163, 184, 0.2);
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(148, 163, 184, 0.4);
            }
            /* Transition for note deletion */
            .htmx-swapping {
              opacity: 0 !important;
              transform: scale(0.9) rotate(5deg) !important;
              transition: all 0.3s ease-out !important;
            }
          `
        }} />
      </head>
      <body class="h-full overflow-hidden board-grid grid-dots flex flex-col font-sans antialiased select-none">
        {children}
      </body>
    </html>
  );
};
