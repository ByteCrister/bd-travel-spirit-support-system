/**
 * Notify a user that their application has been approved and provide login details.
 *
 * @param {string} guideCompanyName - Full legal or display name of the guide company whose application was approved.
 * @param {string} userEmail - Recipient email address for the approval notification.
 * @param {string} temporaryPassword - One-time or temporary password issued to the user; should be treated as sensitive.
 * @param {string} [loginLink="https://app.bdtravelspirit.com/login"] - URL where the user can sign in and complete first-time setup.
 *
 * @returns {void} No return value. Use exceptions or logging to surface errors.
 *
 * @example
 * applicationApproved(
 *   "BD Travel Spirit Ltd.",
 *   "applicant@example.com",
 *   "TempP@ssw0rd123",
 *   "https://app.bdtravelspirit.com/login"
 * );
 */
export function applicationApproved(
    guideCompanyName: string,
    userEmail: string,
    temporaryPassword: string,
    loginLink: string = "https://app.bdtravelspirit.com/login"
) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #ffffff;
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #eaeaea;
        }
        .logo-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            padding: 10px 0;
        }
        .logo-icon {
            position: relative;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #10b981 0%, #0d9488 50%, #0891b2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 15px rgba(16, 185, 129, 0.3);
            overflow: hidden;
            flex-shrink: 0;
        }
        .logo-icon-text {
            color: white;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 800;
            font-size: 20px;
            letter-spacing: -0.5px;
        }
        .logo-text {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .logo-main-title {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 800;
            font-size: 24px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
            line-height: 1.2;
        }
        .logo-subtitle {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 2px;
            line-height: 1.2;
        }
        .header h1 {
            margin: 20px 0 0 0;
            font-size: 28px;
            font-weight: 600;
            color: #059669;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .content {
            padding: 40px 30px;
        }
        .congratulations-box {
            background: linear-gradient(135deg, #d1fae5 0%, #bbf7d0 100%);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
            border: 2px solid #10b981;
        }
        .congratulations-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .congratulations-text {
            font-size: 20px;
            font-weight: 600;
            color: #065f46;
            margin-bottom: 15px;
        }
        .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #064e3b;
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            display: inline-block;
        }
        .message-box {
            background-color: #f8f9ff;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            margin-bottom: 30px;
        }
        .credentials-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%);
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
            border: 2px dashed #10b981;
            text-align: center;
        }
        .info-label {
            font-size: 14px;
            color: #059669;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        .email-display {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            color: #0f172a;
            font-weight: 600;
            padding: 12px;
            background: white;
            border-radius: 6px;
            margin: 10px 0;
            word-break: break-all;
            border: 1px solid #d1fae5;
        }
        .password-display {
            font-family: 'Courier New', monospace;
            font-size: 20px;
            color: #065f46;
            font-weight: 700;
            padding: 12px;
            background: white;
            border-radius: 6px;
            margin: 10px 0;
            border: 1px solid #d1fae5;
            letter-spacing: 1px;
        }
        .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 18px;
            margin: 25px 0;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }
        .instructions {
            background-color: #fefce8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 30px 0;
        }
        .instructions-title {
            color: #b45309;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .instructions-list {
            padding-left: 20px;
            margin: 15px 0;
        }
        .instructions-list li {
            margin-bottom: 10px;
        }
        .warning-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        .security-note {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #6c757d;
            margin: 20px 0;
            font-size: 14px;
            color: #6c757d;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eaeaea;
        }
        .next-steps {
            background-color: #eff6ff;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #3b82f6;
        }
        .next-steps-title {
            color: #1d4ed8;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .congratulations-box {
                padding: 20px;
            }
            .congratulations-text {
                font-size: 18px;
            }
            .company-name {
                font-size: 20px;
            }
            .login-button {
                padding: 14px 30px;
                font-size: 16px;
            }
            .email-display, .password-display {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-wrapper">
                <div class="logo-icon">
                    <div class="logo-icon-text">BD</div>
                </div>
                <div class="logo-text">
                    <div class="logo-main-title">BD Travel Spirit</div>
                    <div class="logo-subtitle">Professional Guides</div>
                </div>
            </div>
            <h1>🎉 Congratulations! Your Application is Approved</h1>
        </div>
        
        <div class="content">
            <div class="congratulations-box">
                <div class="congratulations-icon">✅</div>
                <div class="congratulations-text">Welcome to BD Travel Spirit!</div>
                <p>We are delighted to inform you that your guide application for</p>
                <div class="company-name">${guideCompanyName}</div>
                <p>has been <strong>approved</strong>!</p>
            </div>
            
            <div class="message-box">
                <p>Dear Guide,</p>
                <p>Your application has been reviewed and accepted by our team. You are now officially part of the BD Travel Spirit professional guides network.</p>
                <p>We're excited to have you join our community of professional guides who help travelers discover the beauty of Bangladesh.</p>
            </div>
            
            <div class="credentials-box">
                <div class="info-label">Your Account Credentials</div>
                <p>Use the following credentials to access your account:</p>
                
                <div class="info-label">Registered Email</div>
                <div class="email-display">${userEmail}</div>
                
                <div class="info-label">Temporary Password</div>
                <div class="password-display">${temporaryPassword}</div>
                
                <a href="${loginLink}" class="login-button">Login to Your Account</a>
                
                <p style="margin-top: 20px;">
                    <strong>First login URL:</strong><br>
                    <span style="color: #3b82f6; word-break: break-all;">${loginLink}</span>
                </p>
            </div>
            
            <div class="instructions">
                <div class="instructions-title">Important Next Steps</div>
                <ul class="instructions-list">
                    <li><strong>Change your password immediately</strong> after first login</li>
                    <li>Complete your profile with additional details</li>
                    <li>Upload high-quality photos for your guide profile</li>
                    <li>Review our guide policies and code of conduct</li>
                    <li>Set up your availability calendar</li>
                </ul>
            </div>
            
            <div class="next-steps">
                <div class="next-steps-title">What's Next?</div>
                <p>Now that you're approved, you can:</p>
                <ul class="instructions-list">
                    <li>Create and publish tour packages</li>
                    <li>Accept booking requests from travelers</li>
                    <li>Build your reviews and reputation</li>
                    <li>Access our guide dashboard and tools</li>
                </ul>
            </div>
            
            <div class="warning-note">
                <strong>Important Security Notice:</strong> This password is temporary. You <strong>must</strong> change it after your first login. Do not share your login credentials with anyone.
            </div>
            
            <div class="security-note">
                <strong>Support:</strong> If you encounter any issues logging in or have questions, please contact our support team at support@bdtravelspirit.com
            </div>
            
            <p>We look forward to seeing you create amazing travel experiences!</p>
            
            <p>Best regards,<br>
            <strong>The BD Travel Spirit Team</strong><br>
            Professional Guides Network</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For assistance, contact: support@bdtravelspirit.com</p>
            <p>© ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}