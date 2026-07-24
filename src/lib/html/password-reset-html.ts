import { escapeHtml } from "../helpers/escape-html";

/**
 * Generates a professional HTML email for password reset verification.
 * The email contains the verification token and the user's email address.
 *
 * @param {string} plainToken - The raw verification token.
 * @param {string} email - The user's email address.
 * @returns {string} - Complete HTML email body as a string.
 */
export function PasswordResetHtml(plainToken: string, email: string) {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password – BD Travel Spirit Support System</title>
  <style type="text/css">
    body, table, td, p, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #eef1f4;
    }
    .logo-mark {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #006666 0%, #008080 55%, #00b3b3 100%);
      border-radius: 14px;
      box-shadow: 0 6px 16px rgba(0, 102, 102, 0.35);
      text-align: center;
      line-height: 56px;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      color: #006666;
      background: #e6f5f5;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 4px 10px;
      border-radius: 999px;
      margin-top: 6px;
    }
    .token-box {
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      padding: 22px 24px;
      font-family: 'Courier New', monospace;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #5eead4;
      border-radius: 12px;
      word-break: break-all;
      margin: 24px 0;
      text-align: center;
    }
    .token-label {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      text-align: center;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 18px;
      margin: 20px 0;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 8px !important; }
      .email-card { border-radius: 14px !important; }
      .header-pad { padding: 24px 20px 16px 20px !important; }
      .content-pad { padding: 20px 20px 8px 20px !important; }
      .footer-pad { padding: 16px 20px 20px 20px !important; }
      .divider-pad { padding: 0 20px !important; }
      .brand-name { font-size: 17px !important; }
      h1 { font-size: 19px !important; }
      .info-card, .token-box { margin: 16px 0 !important; }
    }
    @media only screen and (max-width: 480px) {
      .logo-mark { width: 48px !important; height: 48px !important; line-height: 48px !important; font-size: 20px !important; border-radius: 12px !important; }
      .token-box { font-size: 18px !important; letter-spacing: 2px !important; padding: 16px !important; }
      .info-card p, .content-pad p { font-size: 14px !important; }
      .badge { font-size: 11px !important; padding: 3px 8px !important; }
    }
    @media only screen and (max-width: 360px) {
      .token-box { font-size: 15px !important; letter-spacing: 1px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#eef1f4;">
  <!--[if (gte mso 9)|(IE)]>
    <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
  <![endif]-->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f4;">
    <tr>
      <td align="center" class="email-wrapper" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-card" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:20px; box-shadow:0 10px 30px rgba(15,23,42,0.08); border:1px solid #eef1f4; border-collapse:separate;">
          <!-- Header -->
          <tr>
            <td class="header-pad" style="padding:36px 32px 20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="66" style="vertical-align:middle;">
                    <div class="logo-mark" style="width:56px; height:56px; background:linear-gradient(135deg, #006666 0%, #008080 55%, #00b3b3 100%); border-radius:14px; text-align:center; line-height:56px; font-size:24px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                      BD
                    </div>
                  </td>
                  <td style="padding-left:14px; vertical-align:middle;">
                    <div class="brand-name" style="font-size:20px; font-weight:700; color:#0f172a; letter-spacing:-0.4px;">BD Travel Spirit Support</div>
                    <span class="badge" style="display:inline-block; font-size:12px; font-weight:700; color:#006666; background:#e6f5f5; text-transform:uppercase; letter-spacing:0.6px; padding:4px 10px; border-radius:999px; margin-top:6px;">Password Reset</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td class="divider-pad" style="padding:0 32px;"><div class="divider" style="height:1px; background:#e2e8f0;"></div></td></tr>

          <!-- Main content -->
          <tr>
            <td class="content-pad" style="padding:28px 32px 8px 32px;">
              <h1 style="color:#0f172a; font-size:22px; font-weight:700; margin:0 0 12px 0; letter-spacing:-0.3px;">Password Reset Request</h1>
              <p style="color:#475569; font-size:15px; line-height:1.6; margin:0 0 8px 0;">Hello <strong style="color:#0f172a;">${escapeHtml(email)}</strong>,</p>
              <p style="color:#475569; font-size:15px; line-height:1.6; margin:0 0 4px 0;">
                We received a request to reset the password for your account. Please use the verification token below to proceed.
              </p>

              <div class="token-box" style="background:linear-gradient(180deg, #0f172a 0%, #1e293b 100%); padding:22px 24px; font-family:'Courier New', monospace; font-size:26px; font-weight:700; letter-spacing:4px; color:#5eead4; border-radius:12px; word-break:break-all; margin:24px 0; text-align:center;">
                <div class="token-label" style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; text-align:center;">Password Reset Token</div>
                ${escapeHtml(plainToken)}
              </div>

              <div class="info-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px; margin:20px 0;">
                <p style="color:#334155; font-size:14px; line-height:1.6; margin:0;">
                  <strong style="color:#0f172a;">Instructions:</strong> Copy the token above and paste it into the reset form. 
                  Expires in <strong style="color:#0f172a;">1 hour</strong>. If you did not request this, please ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <tr><td class="divider-pad" style="padding:8px 32px 0 32px;"><div class="divider" style="height:1px; background:#e2e8f0;"></div></td></tr>

          <!-- Footer -->
          <tr>
            <td class="footer-pad" style="padding:20px 32px 28px 32px;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">© ${new Date().getFullYear()} BD Travel Spirit Support System. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!--[if (gte mso 9)|(IE)]>
        </td>
      </tr>
    </table>
  <![endif]-->
</body>
</html>`;
}
