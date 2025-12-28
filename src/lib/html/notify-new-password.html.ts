/**
 *
 * @param employeeName - Full name of the employee. Used to personalize the greeting.
 *   Example: "Ayesha Rahman"
 *
 * @param employeeEmail - The employee's email address. Included in the footer for clarity
 *   and to help the recipient verify the intended recipient. Example: "ayesha@example.com"
 *
 * @param newPassword - The temporary or newly generated password to deliver to the user.
 *   This should be a one-time or temporary password that the user is required to change
 *   on first login. Example: "X7f#2kL9"
 *
 * @returns A string containing the HTML email body ready to be sent via your mailer.
 *   The returned HTML is safe to embed in an email message (content-type: text/html).
 */
export function notifyEmployeeNewPassword(
    employeeName: string,
    employeeEmail: string,
    newPassword: string
): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BD Travel Spirit - Password Update</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
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
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #ffffff 100%);
            padding: 40px 30px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 30px 30px;
            opacity: 0.3;
            animation: float 20s linear infinite;
        }
        
        @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(30px, 30px) rotate(360deg); }
        }
        
        .logo-container {
            display: inline-block;
            padding: 20px;
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3),
                        0 5px 15px rgba(20, 184, 166, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }
        
        .logo-bd {
            font-size: 32px;
            font-weight: 800;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            letter-spacing: 1px;
        }
        
        .brand-name {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(to right, #334155, #475569);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
        }
        
        .tagline {
            font-size: 12px;
            font-weight: 600;
            color: #10b981;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            position: relative;
            display: inline-block;
            padding-bottom: 8px;
            margin-top: 4px;
            position: relative;
            z-index: 1;
        }
        
        .tagline::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(to right, #10b981, #14b8a6);
            border-radius: 3px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 8px;
        }
        
        .intro-text {
            color: #64748b;
            margin-bottom: 30px;
            font-size: 15px;
        }
        
        .password-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .password-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(to right, #10b981, #14b8a6, #06b6d4);
        }
        
        .password-label {
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .password-value {
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            background: white;
            padding: 16px 24px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            letter-spacing: 1px;
            margin: 15px 0;
            word-break: break-all;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .warning-note {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 15px;
            margin: 25px 0;
            font-size: 14px;
            color: #9a3412;
        }
        
        .warning-note strong {
            color: #ea580c;
        }
        
        .instructions {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .instructions h3 {
            color: #334155;
            font-size: 16px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .instructions ol {
            padding-left: 20px;
            color: #475569;
        }
        
        .instructions li {
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .instructions li strong {
            color: #0f172a;
        }
        
        .security-tip {
            background: linear-gradient(135deg, #10b98110 0%, #06b6d410 100%);
            border-left: 4px solid #10b981;
            padding: 16px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-tip p {
            color: #065f46;
            font-size: 14px;
            font-weight: 500;
        }
        
        .footer {
            background: #0f172a;
            color: #cbd5e1;
            padding: 30px;
            text-align: center;
            font-size: 13px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
        }
        
        .footer-links a {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.2s;
        }
        
        .footer-links a:hover {
            color: #10b981;
        }
        
        .copyright {
            color: #64748b;
            margin-top: 20px;
            font-size: 12px;
        }
        
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
            color: white;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            margin: 20px 0;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }
        
        .login-btn {
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
        }
        
        .support-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
            margin-left: 10px;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .brand-name {
                font-size: 24px;
            }
            
            .password-value {
                font-size: 18px;
                padding: 12px 16px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 10px;
            }
        }
        
        /* Animation for logo */
        @keyframes pulse-glow {
            0%, 100% {
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3),
                            0 5px 15px rgba(20, 184, 166, 0.2),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            50% {
                box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4),
                            0 8px 25px rgba(20, 184, 166, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
        }
        
        .logo-container {
            animation: pulse-glow 3s ease-in-out infinite;
        }
        
        /* Dark mode support for email clients that support it */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background: #0f172a;
                color: #cbd5e1;
            }
            
            .brand-name {
                background: linear-gradient(to right, #ffffff, #e2e8f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .content {
                color: #cbd5e1;
            }
            
            .greeting {
                color: #f1f5f9;
            }
            
            .intro-text {
                color: #94a3b8;
            }
            
            .password-card {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border-color: #334155;
            }
            
            .password-value {
                background: #1e293b;
                color: #f1f5f9;
                border-color: #475569;
            }
            
            .instructions {
                background: #1e293b;
            }
            
            .instructions h3 {
                color: #e2e8f0;
            }
            
            .instructions li {
                color: #94a3b8;
            }
            
            .instructions li strong {
                color: #f1f5f9;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <div class="logo-container">
                <div class="logo-bd">BD</div>
            </div>
            <h1 class="brand-name">BD Travel Spirit</h1>
            <div class="tagline">Professional Guides</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h2 class="greeting">Hello ${employeeName},</h2>
            <p class="intro-text">
                Your account password has been successfully updated by the administration team. 
                Below you'll find your new login credentials.
            </p>
            
            <!-- Password Display Card -->
            <div class="password-card">
                <div class="password-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Your New Password
                </div>
                <div class="password-value">${newPassword}</div>
                <p style="font-size: 14px; color: #64748b; margin: 10px 0;">
                    Use this password to log in to your account
                </p>
            </div>
            
            <!-- Warning Note -->
            <div class="warning-note">
                <strong>⚠️ Important:</strong> For security reasons, please change this password immediately after logging in.
            </div>
            
            <!-- Instructions -->
            <div class="instructions">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Next Steps
                </h3>
                <ol>
                    <li><strong>Log in</strong> to your account using your email and the password above</li>
                    <li>Navigate to <strong>Account Settings</strong> or <strong>Profile</strong></li>
                    <li>Select <strong>Change Password</strong> to set your own secure password</li>
                    <li>Choose a strong password that you can remember easily</li>
                </ol>
            </div>
            
            <!-- Security Tip -->
            <div class="security-tip">
                <p>
                    <strong>💡 Security Tip:</strong> For maximum security, avoid using this password for other services 
                    and consider enabling two-factor authentication in your account settings.
                </p>
            </div>
            
            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://bd-travel-spirit.com/login" class="btn login-btn">Login to Your Account</a>
                <a href="https://bd-travel-spirit.com/support" class="btn support-btn">Get Support</a>
            </div>
            
            <!-- Additional Info -->
            <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center;">
                This is an automated message. Please do not reply to this email.<br>
                If you didn't request this password change, please contact our support team immediately.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div style="margin-bottom: 20px;">
                <div style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">BD Travel Spirit</div>
                <div style="font-size: 12px; color: #94a3b8;">Professional Travel Management System</div>
            </div>
            
            <div class="footer-links">
                <a href="https://bd-travel-spirit.com/privacy">Privacy Policy</a>
                <a href="https://bd-travel-spirit.com/terms">Terms of Service</a>
                <a href="https://bd-travel-spirit.com/help">Help Center</a>
                <a href="https://bd-travel-spirit.com/contact">Contact Us</a>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.<br>
                This email was sent to ${employeeEmail}
            </div>
        </div>
    </div>
</body>
</html>
`;
}