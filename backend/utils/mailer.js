import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Splitwise App" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Splitwise App</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:36px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);border-radius:12px;padding:10px 20px;">
                      <span style="font-size:22px;font-weight:700;color:#34d399;letter-spacing:1px;">Splitwise</span>
                    </div>
                    <p style="color:#94a3b8;margin:12px 0 0;font-size:13px;letter-spacing:0.5px;">Smart Expense Splitting</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                This email was sent by <strong style="color:#64748b;">Splitwise App</strong>.<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:12px 0 0;color:#cbd5e1;font-size:11px;">
                © 2026 Splitwise App. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const forgotPasswordTemplate = ({ name, resetLink }) =>
  baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f172a;">Reset Your Password</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>, we received a request to reset your password.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">
            🔒 Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.
          </p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${resetLink}"
            style="display:inline-block;background:linear-gradient(135deg,#34d399,#059669);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;">
            Reset My Password →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-align:center;">Or copy this link into your browser:</p>
    <p style="margin:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;font-size:12px;color:#64748b;word-break:break-all;text-align:center;">${resetLink}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;color:#9a3412;font-size:13px;">
            ⚠️ <strong>Didn't request this?</strong> Your account is safe. Simply ignore this email and your password won't change.
          </p>
        </td>
      </tr>
    </table>
  `);

export const otpTemplate = ({ name, otp }) =>
  baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f172a;">Your Login Code</h1>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>, use the code below to log in to your account.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="display:inline-block;background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:16px;padding:28px 48px;">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">One-Time Password</p>
            <p style="margin:0;font-size:48px;font-weight:800;color:#34d399;letter-spacing:16px;">${otp}</p>
          </div>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;">
          <p style="margin:0;color:#166534;font-size:14px;">
            ⏱️ This code expires in <strong>10 minutes</strong>. Enter it on the login page to continue.
          </p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;">
          <p style="margin:0;color:#9a3412;font-size:13px;">
            ⚠️ <strong>Never share this code</strong> with anyone. Splitwise will never ask for your OTP.
          </p>
        </td>
      </tr>
    </table>
  `);

export const monthlySummaryTemplate = ({ name, monthName, summaryRows, balanceHTML, hasUnsettled }) =>
  baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f172a;">Monthly Summary</h1>
    <p style="margin:0 0 4px;color:#64748b;font-size:15px;">Hi <strong>${name}</strong>, here's your expense breakdown for</p>
    <p style="margin:0 0 28px;font-size:18px;font-weight:700;color:#0f172a;">${monthName}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr style="background:#0f172a;">
        <th style="padding:14px 20px;text-align:left;color:#94a3b8;font-size:12px;letter-spacing:1px;font-weight:600;text-transform:uppercase;">Currency</th>
        <th style="padding:14px 20px;text-align:right;color:#94a3b8;font-size:12px;letter-spacing:1px;font-weight:600;text-transform:uppercase;">Total Spent</th>
      </tr>
      ${summaryRows}
    </table>

    <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f172a;">
      ${hasUnsettled ? "⚠️ Unsettled Balances" : "✅ All Settled Up!"}
    </h2>

    ${hasUnsettled
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:20px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;color:#9a3412;font-size:14px;font-weight:600;">Please settle up with your group members:</p>
            ${balanceHTML}
          </td></tr>
        </table>`
      : `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:20px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0;color:#166534;font-size:14px;">Great job! All your group balances are settled for ${monthName}. 🎉</p>
          </td></tr>
        </table>`
    }
  `);