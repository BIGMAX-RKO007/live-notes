/**
 * 业务意图：邮箱 API 发信工具 (Resend HTTP Client)。
 * 在 Edge Workers 环境下通过 Resend 官方 HTTPS API 向指定管理员邮箱发送黑金风格 HTML 验证码邮件。
 * 副作用：发起 HTTPS 异步请求到 Resend API。
 */
export async function sendEmailOTP(toEmail: string, code: string, resendApiKey?: string) {
  if (resendApiKey && resendApiKey.trim() !== '') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LiveNotes Admin <onboarding@resend.dev>',
          to: [toEmail],
          subject: '🔒 实时留言墙后台登录动态验证码',
          html: `
            <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #090d16; color: #f8fafc; padding: 40px; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 42px;">🛡️</span>
                <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 8px;">实时留言墙后台安全验证</h2>
                <p style="color: #94a3b8; font-size: 13px;">管理员动态登录口令</p>
              </div>

              <div style="background-color: #0f172a; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your 6-Digit OTP Code</div>
                <div style="color: #fbbf24; font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 8px;">${code}</div>
              </div>

              <p style="color: #64748b; font-size: 12px; line-height: 1.6; text-align: center;">
                此验证码将在 <strong>5 分钟</strong> 后失效。如非本人操作，请忽视本邮件。
              </p>

              <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />

              <div style="color: #475569; font-size: 11px; text-align: center;">
                Live Notes Admin Dashboard &copy; 2026 Powered by Hono + Cloudflare D1
              </div>
            </div>
          `,
        }),
      });

      if (response.ok) {
        return { success: true, mode: 'email' };
      } else {
        const errText = await response.text();
        console.error('Resend API returned error:', errText);
      }
    } catch (e) {
      console.error('Failed to send email via Resend API:', e);
    }
  }

  // 降级为开发调试模式
  return { success: true, mode: 'dev' };
}
