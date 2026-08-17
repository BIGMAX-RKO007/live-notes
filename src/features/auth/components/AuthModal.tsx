interface AuthModalProps {
  mode?: 'login' | 'register';
}

/**
 * 业务意图：通用认证模态框组件 (Auth Modal Component)。
 * 支持渲染登录与注册两种模式的手账信封风格弹窗，配置 HTMX 异步提交与局部错误信息置换。
 * 副作用：无状态，通过 HTMX 触发展开/提交/模式切换。
 */
export const AuthModal = ({ mode = 'login' }: AuthModalProps) => {
  const isLogin = mode === 'login';

  return (
    <div id="auth-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="relative w-full max-w-md p-8 mx-4 rounded-2xl border border-[#e2d4c7] bg-[#fffdfa] shadow-2xl">
        {/* 关闭按钮 */}
        <button
          class="absolute top-4 right-4 text-[#8c7b70] hover:text-[#382b26] transition-colors p-1 rounded-full hover:bg-black/5"
          onclick="document.getElementById('auth-modal').remove()"
        >
          ✕
        </button>

        <h2 class="text-2xl font-bold text-[#382b26] text-center mb-6 font-serif">
          {isLogin ? '打开我的留言墙' : '新建专属留言墙'}
        </h2>

        {/* 错误信息置换挂载节点 #auth-error */}
        <div id="auth-error" class="hidden mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm text-center font-sans"></div>

        {/* HTMX 表单 */}
        <form
          hx-post={isLogin ? '/api/auth/login' : '/api/auth/register'}
          hx-target="#auth-error"
          hx-swap="innerHTML"
          class="flex flex-col gap-4"
        >
          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">用户名</label>
            <input
              type="text"
              name="username"
              required
              placeholder={isLogin ? '请输入您的用户名' : '限字母、数字，如 fanxiao'}
              pattern={isLogin ? undefined : '^[a-zA-Z0-9_]{3,15}$'}
              title={isLogin ? undefined : '用户名只能包含3-15位字母、数字或下划线'}
              class={`w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:ring-1 transition-all font-sans ${isLogin ? 'focus:border-rose-400 focus:ring-rose-400' : 'focus:border-amber-500 focus:ring-amber-500'}`}
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#8c7b70] uppercase tracking-wider mb-2 font-sans">密码</label>
            <input
              type="password"
              name="password"
              required
              placeholder={isLogin ? '请输入您的密码' : '请输入密码（最少6位）'}
              minLength={isLogin ? undefined : 6}
              class={`w-full px-4 py-3 rounded-xl border border-[#e2d4c7] bg-[#fcfaf7] text-[#382b26] placeholder-[#b5a69c] focus:outline-none focus:ring-1 transition-all font-sans ${isLogin ? 'focus:border-rose-400 focus:ring-rose-400' : 'focus:border-amber-500 focus:ring-amber-500'}`}
            />
          </div>

          <button
            type="submit"
            class={`w-full py-3 mt-2 rounded-xl text-white font-semibold transition-all shadow-md active:scale-[0.98] font-sans cursor-pointer ${
              isLogin
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-300 hover:to-pink-400 shadow-rose-900/10'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 shadow-amber-900/10'
            }`}
          >
            {isLogin ? '开启留言墙' : '完成新建并进入'}
          </button>
        </form>

        {/* 模式切换底栏 */}
        <div class="mt-6 text-center text-sm text-[#8c7b70] font-sans">
          {isLogin ? '还没有留言墙？' : '已有留言墙？'}
          <button
            class={`${isLogin ? 'text-rose-500' : 'text-amber-700'} hover:underline ml-1 cursor-pointer font-medium`}
            hx-get={isLogin ? '/api/auth/register-modal' : '/api/auth/login-modal'}
            hx-target="#auth-modal"
            hx-swap="outerHTML"
          >
            {isLogin ? '免费新建' : '直接登录'}
          </button>
        </div>
      </div>
    </div>
  );
};
