/**
 * 业务意图：统一 HTMX 异常与表单提示 HTML 响应助手 (HTMX Response Helper)。
 * 替代在 JSX 中直写 `<script>` 产生的 `&amp;` 语法转义 Bug，统一输出语义化、带强类型防御的错误提示 DOM。
 * 副作用：无状态，接收 Context 与提示文本，返回 Hono HTML 响应。
 */
export function renderAuthError(c: any, message: string) {
  return c.html(
    `<div id="auth-error" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold text-center animate-[shake_0.2s_ease-in-out]">
      ❌ ${message}
    </div>`
  );
}

export function renderToastSuccess(c: any, message: string) {
  return c.html(
    `<div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center">
      ✅ ${message}
    </div>`
  );
}

export function renderToastError(c: any, message: string) {
  return c.html(
    `<div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center">
      ❌ ${message}
    </div>`
  );
}
