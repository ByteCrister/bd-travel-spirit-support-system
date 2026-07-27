import { escapeHtml } from "../helpers/escape-html";

/**
 * Notify a user that their application was successful and provide credentials.
 *
 * Sends or prepares the information a newly approved user needs to access the application,
 * including an access token and an initial password. Treats credentials as sensitive and
 * does not imply any specific delivery mechanism (email, SMS, in-app).
 *
 * @param {string} email - Recipient email address for the success notification.
 * @param {string} accessToken - Short‑lived access token or session token issued to the user; must be treated as sensitive.
 * @param {string} password - Initial or temporary password for first sign-in; should require immediate change.
 *
 * @returns {void} No return value. If the function performs I/O (email, DB writes), make it async and return Promise<void>.
 *
 * @example
 * applicationSuccess(
 *   "applicant@example.com",
 *   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "TempP@ssw0rd123"
 * );
 */
export default function applicationSuccess(email: string, accessToken: string, password: string) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* Client-specific Resets */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }

        /* Reset Box Model */
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #334155;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
            width: 100% !important;
        }

        .email-container {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }

        /* --- Header / Logo --- */
        .header {
            background: #ffffff;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
        }

        .logo-container {
            display: inline-block;
            text-decoration: none;
            color: inherit;
        }

        .logo-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .logo-icon {
            position: relative;
            width: 48px;
            height: 48px;
            flex-shrink: 0;
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        .logo-icon-text {
            color: #ffffff;
            font-weight: 800;
            font-size: 20px;
            letter-spacing: -0.5px;
        }

        .logo-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
            text-align: left;
        }

        .logo-main-title {
            font-weight: 700;
            font-size: 24px;
            background: linear-gradient(to right, #334155, #475569);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
            line-height: 1.2;
            word-wrap: break-word;
        }

        .logo-subtitle {
            font-size: 12px;
            font-weight: 600;
            color: #10b981;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .logo-underline {
            width: 40px;
            height: 3px;
            background: linear-gradient(to right, #10b981, #14b8a6);
            border-radius: 2px;
            margin-top: 4px;
        }

        .header h1 {
            margin: 20px 0 0 0;
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            word-wrap: break-word;
        }

        /* --- Content --- */
        .content {
            padding: 40px;
        }

        .message {
            background-color: #f0fdfa;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #10b981;
            margin-bottom: 25px;
            color: #334155;
            word-wrap: break-word;
        }

        .message p {
            margin: 0 0 8px 0;
        }

        .message p:last-child {
            margin-bottom: 0;
        }

        .email-address {
            color: #0f766e;
            font-weight: 600;
            word-break: break-all; /* Ensures long emails wrap instead of overflowing */
        }

        .highlight {
            background-color: #fffbeb;
            padding: 16px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
        }

        .highlight p {
            margin: 0 0 6px 0;
            font-size: 14px;
            color: #92400e;
        }

        .highlight p:last-child {
            margin-bottom: 0;
        }

        .section {
            margin: 30px 0;
        }

        .section-title {
            color: #0f766e;
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: 700;
            border-bottom: 2px solid #f0fdfa;
            padding-bottom: 8px;
        }

        .section p {
            color: #64748b;
            font-size: 15px;
        }

        .info-box {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px dashed #cbd5e1;
            padding: 18px;
            border-radius: 12px;
            text-align: center;
            margin: 16px 0;
            width: 100%;
            overflow: hidden;
            box-sizing: border-box;
        }

        .info-label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }

        .token,
        .password {
            font-family: 'Courier New', monospace;
            font-weight: 700;
            color: #1e293b;
            font-size: 16px;
            letter-spacing: 0.5px;
            display: block;
            background: #ffffff;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            word-break: break-all; /* Crucial for JWTs so they don't break the layout */
            white-space: pre-wrap;
            max-width: 100%;
        }

        .warning-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            color: #92400e;
            padding: 14px 16px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 14px;
        }

        .warning-note strong {
            color: #92400e;
        }

        .security-note {
            background-color: #f8fafc;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 4px solid #94a3b8;
            margin: 15px 0;
            font-size: 13px;
            color: #64748b;
        }

        /* --- Footer --- */
        .footer {
            background: #f8fafc;
            padding: 25px;
            text-align: center;
            color: #64748b;
            font-size: 13px;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            margin: 4px 0;
        }

        /* --- Responsive --- */
        @media screen and (min-width: 1024px) {
            .logo-icon {
                width: 56px;
                height: 56px;
                border-radius: 16px;
            }

            .logo-icon-text {
                font-size: 22px;
            }

            .logo-main-title {
                font-size: 28px;
            }
        }

        @media screen and (max-width: 768px) {
            .content {
                padding: 25px;
            }

            .logo-icon {
                width: 44px;
                height: 44px;
                border-radius: 12px;
            }

            .logo-icon-text {
                font-size: 18px;
            }

            .logo-main-title {
                font-size: 20px;
            }

            .logo-subtitle {
                font-size: 10px;
                letter-spacing: 0.5px;
            }
            
            .token,
            .password {
                font-size: 14px; /* Slightly smaller on tablets */
            }
        }

        @media screen and (max-width: 480px) {
            body {
                padding: 10px;
            }

            .email-container {
                border-radius: 12px;
            }

            .content {
                padding: 20px 16px;
            }

            .header {
                padding: 20px 16px;
            }

            .logo-wrapper {
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }

            .logo-text {
                text-align: center;
                align-items: center; /* Center the underline */
            }

            .logo-icon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
            }

            .logo-main-title {
                font-size: 18px;
                white-space: normal;
                line-height: 1.3;
            }

            .header h1 {
                font-size: 18px;
            }

            .info-box {
                padding: 12px;
            }

            .token,
            .password {
                font-size: 12px; /* Prevent long strings from causing overflow */
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <a href="#" class="logo-container">
                <div class="logo-wrapper">
                    <div class="logo-icon">
                        <div class="logo-icon-text">BD</div>
                    </div>
                    <div class="logo-text">
                        <div class="logo-main-title">BD Travel Spirit</div>
                        <div class="logo-subtitle">Professional Guides</div>
                        <div class="logo-underline"></div>
                    </div>
                </div>
            </a>
            <h1>Application Submitted Successfully!</h1>
        </div>

        <div class="content">
            <p>Dear User,</p>

            <div class="message">
                <p>Your application submitted with email <span class="email-address">${email}</span> has been received successfully.</p>
                <p>We have begun processing your application and it is currently under review.</p>
            </div>

            <div class="highlight">
                <p><strong>Please note:</strong> The review process typically takes <strong>5-7 business days</strong> to complete.</p>
                <p>You will receive another email notification once your application has been reviewed.</p>
            </div>

            <div class="section">
                <div class="section-title">Your Application Credentials</div>

                <p>You can use the following access token to view your submitted form:</p>

                <div class="info-box">
                    <div class="info-label">Access Token</div>
                    <div class="token">${escapeHtml(accessToken)}</div>
                </div>

                <p>Keep this token safe as it provides access to your application details.</p>
            </div>

            <div class="section">
                <div class="section-title">Account Information</div>

                <p>Your account has been created with the following temporary password:</p>

                <div class="info-box">
                    <div class="info-label">Temporary Password</div>
                    <div class="password">${escapeHtml(password)}</div>
                </div>

                <div class="warning-note">
                    <strong>Important:</strong> This is your temporary password. <strong>You cannot use it until your application is accepted.</strong> Once your application is approved, you will receive further instructions on how to activate your account and change your password.
                </div>

                <div class="security-note">
                    <strong>Security Tip:</strong> Do not share your password with anyone. Our team will never ask for your password.
                </div>
            </div>

            <p>Thank you for your patience and for choosing our service.</p>

            <p>Best regards,<br>The BD Travel Spirit Team</p>
        </div>

        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
}