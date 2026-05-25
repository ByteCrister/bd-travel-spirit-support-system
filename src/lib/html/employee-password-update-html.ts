/**
 * Generate the email body sent when a user's password is updated.
 *
 * @param {string} email - Recipient's email address; must be a valid, deliverable address.
 * @param {string} name - Recipient's display name used to personalize the greeting.
 * @param {string} newPassword - The new or temporary password to include in the message; this is sensitive data and should be handled securely.
 * @returns {string} The complete email body (plain text or HTML) ready for sending.
 *
 * @remarks
 * - Prefer sending a password reset link instead of plaintext passwords when possible.
 * - If you must include a password, treat it as sensitive: log nothing, use TLS for delivery, and expire temporary passwords quickly.
 *
 * @example
 * const body = generatePasswordUpdateEmail("user@example.com", "Alex", "t3mpP@ssw0rd");
 */
export function employeePasswordUpdateEmail(email: string, name: string, newPassword: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Updated - BD Travel Spirit</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        
        .header {
            background: white;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .logo-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .logo-box {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 24px;
            color: white;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        
        .brand-text {
            text-align: left;
        }
        
        .brand-name {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(to right, #334155, #475569);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
        }
        
        .tagline {
            font-size: 12px;
            font-weight: 600;
            color: #10b981;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }
        
        .underline {
            height: 3px;
            width: 40px;
            background: linear-gradient(to right, #10b981, #14b8a6);
            margin: 8px auto 0;
            border-radius: 2px;
        }
        
        .content {
            padding: 40px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        
        .message {
            color: #64748b;
            margin-bottom: 30px;
            font-size: 16px;
        }
        
        .password-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 30px 0;
        }
        
        .password-label {
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .password {
            font-family: 'Courier New', monospace;
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: 2px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border: 1px solid #e2e8f0;
        }
        
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin: 30px 0;
            font-size: 14px;
        }
        
        .security-note strong {
            color: #92400e;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        .contact-info {
            color: #94a3b8;
            font-size: 13px;
            margin-top: 20px;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(to right, #10b981, #14b8a6);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 25px;
            }
            
            .logo-container {
                flex-direction: column;
                text-align: center;
            }
            
            .brand-text {
                text-align: center;
            }
            
            .password {
                font-size: 22px;
                letter-spacing: 1px;
                padding: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <div class="logo-container">
                <div class="logo-box">BD</div>
                <div class="brand-text">
                    <div class="brand-name">BD Travel Spirit</div>
                    <div class="tagline">Professional Guides</div>
                </div>
            </div>
            <div class="underline"></div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h1 class="greeting">Hello ${name}!</h1>
            
            <p class="message">
                Your BD Travel Spirit account password has been successfully updated as requested.
                Below is your new login credential:
            </p>
            
            <div class="password-card">
                <div class="password-label">Your New Password</div>
                <div class="password">${newPassword}</div>
                <p style="color: #64748b; font-size: 14px; margin-top: 10px;">
                    Use this password to log into your account
                </p>
            </div>
            
            <div class="security-note">
                <strong>⚠️ Security Notice:</strong> For your security, we recommend that you:
                <ul style="margin-top: 10px; padding-left: 20px; color: #64748b;">
                    <li>Change this password after your first login</li>
                    <li>Never share your password with anyone</li>
                    <li>Use a strong, unique password for your account</li>
                    <li>Enable two-factor authentication if available</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="https://bdtravelspirit.com/login" class="button">Login to Your Account</a>
            </div>
            
            <p class="message">
                If you didn't request this password change, please contact our support team immediately.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                Safe travels and unforgettable adventures await you with BD Travel Spirit.
            </p>
            <div class="contact-info">
                BD Travel Spirit • Professional Guides<br>
                support@bdtravelspirit.com • +880 XXX-XXXXXXX<br>
                © ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
`;
}