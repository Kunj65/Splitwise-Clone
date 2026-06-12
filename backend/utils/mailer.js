import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: "Splitwise App <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email failed:", err.message);
  }
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);border-radius:12px;padding:10px 20px;">
                <span style="font-size:22px;font-weight:700;color:#34d399;letter-spacing:1px;">Splitwise</span>
              </div>
              <p style="color:#94a3b8;margin:12px 0 0;font-size:13px;">Smart Expense Splitting</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                This email was sent by <strong style="color:#64748b;">Splitwise App</strong>.<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:12px 0 0;color:#cbd5e1;font-size:11px;">© 2026 Splitwise App. All rights reserved.</p>
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
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hi <strong>${name}</strong>, we received a request to reset your password.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#34d399,#059669);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:16px 40px;border-radius:12px;">
            Reset My Password →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;font-size:12px;color:#64748b;word-break:break-all;text-align:center;">${resetLink}</p>
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
          <p style="margin:0;color:#166534;font-size:14px;">⏱️ This code expires in <strong>10 minutes</strong>.</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;">
          <p style="margin:0;color:#9a3412;font-size:13px;">⚠️ <strong>Never share this code</strong> with anyone.</p>
        </td>
      </tr>
    </table>
  `);

export const sendExpenseNotification = async ({ toEmail, toName, groupName, description, amount, paidByName }) => {
  await sendMail({
    to: toEmail,
    subject: `New expense in "${groupName}"`,
    html: baseTemplate(`
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f172a;">New Expense Added</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hi <strong>${toName}</strong>, <strong>${paidByName}</strong> added a new expense in <strong>${groupName}</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:28px;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 8px;color:#166534;font-size:14px;"><strong>Description:</strong> ${description}</p>
            <p style="margin:0;color:#166534;font-size:14px;"><strong>Amount:</strong> ₹${Number(amount).toFixed(2)}</p>
          </td>
        </tr>
      </table>
      <p style="color:#94a3b8;font-size:13px;">Login to Splitwise to view your updated balance.</p>
    `),
  });
};

export const sendGroupInviteNotification = async ({ toEmail, toName, groupName, invitedByName }) => {
  await sendMail({
    to: toEmail,
    subject: `You were added to "${groupName}"`,
    html: baseTemplate(`
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f172a;">You've been added to a group</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hi <strong>${toName}</strong>, <strong>${invitedByName}</strong> added you to <strong>${groupName}</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0;color:#166534;font-size:14px;">Login to Splitwise to view the group and start tracking expenses.</p>
          </td>
        </tr>
      </table>
    `),
  });
};