// 邮箱服务：真实 SMTP（环境变量配置）+ 开发模式（验证码打印控制台）
const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;
if (config.smtp.host && config.smtp.user) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  console.log('[mail] SMTP 已配置: ' + config.smtp.user);
} else {
  console.log('[mail] 未配置 SMTP：注册/找回验证码无法真实发送' + (config.devMode ? '（开发模式，验证码将打印在服务端控制台）' : '，发送请求将被拒绝'));
}

function isSmtpConfigured() {
  return !!transporter;
}

// 发送邮件；返回 { sent: bool, devCode?: string }
async function sendEmail(to, subject, html) {
  if (!transporter) {
    // 开发模式：不真实发送，但记录目标与主题，便于联调
    console.log(`[mail][dev] TO=${to} SUBJECT=${subject}`);
    return { sent: false, devMode: true };
  }
  await transporter.sendMail({
    from: config.smtp.from || `云屿 <${config.smtp.user}>`,
    to,
    subject,
    html,
  });
  return { sent: true, devMode: false };
}

// 同步判断是否真实发送（开发模式返回 false）
function isDevMode() {
  return !transporter;
}

function buildVerifyMail(code) {
  return {
    subject: `【云屿】邮箱验证码：${code}`,
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e8ecf3;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#4f8dff,#7c5cff);padding:28px 32px">
          <div style="font-size:22px;font-weight:700;color:#fff">☁️ 云屿 YunYuu</div>
          <div style="font-size:13px;color:rgba(255,255,255,.85);margin-top:4px">你的云上软件岛屿</div>
        </div>
        <div style="padding:32px">
          <p style="font-size:15px;color:#374151">你好：</p>
          <p style="font-size:15px;color:#374151;line-height:1.7">你正在使用云屿邮箱验证服务，本次验证码为：</p>
          <div style="margin:22px 0;padding:16px;background:#f4f7ff;border-radius:12px;text-align:center">
            <span style="font-size:30px;font-weight:800;letter-spacing:6px;color:#3b6fe0">${code}</span>
          </div>
          <p style="font-size:14px;color:#6b7280;line-height:1.7">验证码 5 分钟内有效，且仅可使用一次。如果不是你本人的操作，请忽略本邮件。</p>
        </div>
        <div style="padding:18px 32px;background:#f9fafb;font-size:12px;color:#9ca3af">本邮件由云屿系统自动发送，请勿直接回复。</div>
      </div>`,
  };
}

module.exports = { sendEmail, isSmtpConfigured, buildVerifyMail, isDevMode };