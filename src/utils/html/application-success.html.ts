export default function applicationSuccess(email: string, accessToken: string, password: string) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* --- Logo Container Styles --- */
        .logo-container {
            display: inline-block;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s ease;
        }
        
        .logo-wrapper {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        /* --- Icon Design --- */
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
            transition: all 0.3s ease;
            overflow: hidden;
            flex-shrink: 0;
        }
        
        .logo-icon::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: 0.5s;
        }
        
        .logo-icon-text {
            color: white;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 800;
            font-size: 20px;
            z-index: 2;
            letter-spacing: -0.5px;
        }
        
        /* --- Text Section --- */
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
        
        .logo-underline {
            width: 40px;
            height: 3px;
            background: linear-gradient(90deg, #10b981 0%, #0d9488 100%);
            border-radius: 2px;
            margin-top: 2px;
            transition: width 0.3s ease;
        }
        
        /* --- Hover Effects --- */
        .logo-container:hover .logo-wrapper {
            transform: translateY(-2px);
        }
        
        .logo-container:hover .logo-icon {
            transform: scale(1.1);
            box-shadow: 0 15px 20px rgba(16, 185, 129, 0.4);
        }
        
        .logo-container:hover .logo-icon::before {
            left: 100%;
        }
        
        .logo-container:hover .logo-main-title {
            background: linear-gradient(135deg, #10b981 0%, #0891b2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }
        
        .logo-container:hover .logo-underline {
            width: 60px;
            background: linear-gradient(90deg, #10b981 0%, #0891b2 100%);
        }
        
        /* --- Responsive Design --- */
        @media (max-width: 768px) {
            .logo-icon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
            }
            
            .logo-icon-text {
                font-size: 18px;
            }
            
            .logo-main-title {
                font-size: 20px;
            }
            
            .logo-subtitle {
                font-size: 10px;
                letter-spacing: 1.5px;
            }
            
            .logo-wrapper {
                gap: 12px;
                padding: 15px;
            }
            
            .logo-main-title::after {
                content: "Travel";
            }
            
            .logo-main-title span {
                display: none;
            }
        }
        
        @media (min-width: 1024px) {
            .logo-icon {
                width: 56px;
                height: 56px;
                border-radius: 14px;
            }
            
            .logo-icon-text {
                font-size: 22px;
            }
            
            .logo-main-title {
                font-size: 28px;
            }
            
            .logo-subtitle {
                font-size: 12px;
            }
        }
        
        @media (max-width: 480px) {
            .logo-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
            }
            
            .logo-icon-text {
                font-size: 16px;
            }
            
            .logo-main-title {
                font-size: 18px;
            }
            
            .logo-subtitle {
                font-size: 9px;
                letter-spacing: 1px;
            }
            
            .logo-wrapper {
                gap: 10px;
                padding: 12px;
            }
        }
        
        /* --- Existing Email Styles (Updated for logo integration) --- */
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
            background: linear-gradient(135deg, #4f6df5 0%, #3a56e8 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 15px 0 0 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .message {
            background-color: #f8f9ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4f6df5;
            margin-bottom: 30px;
        }
        .info-box {
            background-color: #f0f2ff;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
            word-break: break-all;
            border: 1px dashed #4f6df5;
        }
        .info-label {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .token, .password {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #2d3a8c;
            font-size: 16px;
            letter-spacing: 0.5px;
            display: block;
            padding: 8px 0;
        }
        .warning-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 12px 15px;
            border-radius: 6px;
            margin: 15px 0;
            font-size: 14px;
            border-left: 4px solid #ffc107;
        }
        .warning-note strong {
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eaeaea;
        }
        .highlight {
            background-color: #fff9e6;
            padding: 10px 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 3px solid #ffc107;
        }
        .email-address {
            color: #4f6df5;
            font-weight: 600;
        }
        .section {
            margin: 30px 0;
        }
        .section-title {
            color: #4f6df5;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
            border-bottom: 2px solid #f0f2ff;
            padding-bottom: 5px;
        }
        .security-note {
            background-color: #f8f9fa;
            padding: 12px 15px;
            border-radius: 6px;
            border-left: 3px solid #6c757d;
            margin: 15px 0;
            font-size: 13px;
            color: #6c757d;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .header {
                padding: 15px;
            }
            .token, .password {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <!-- New BD Travel Spirit Logo -->
            <a href="#" class="logo-container">
                <div class="logo-wrapper">
                    <div class="logo-icon">
                        <div class="logo-icon-text">BD</div>
                    </div>
                    <div class="logo-text">
                        <div class="logo-main-title">
                            BD Travel<span> Spirit</span>
                        </div>
                        <div class="logo-subtitle">Professional Guides</div>
                        <div class="logo-underline"></div>
                    </div>
                </div>
            </a>
            <!-- End Logo -->
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
                    <div class="token">${accessToken}</div>
                </div>
                
                <p>Keep this token safe as it provides access to your application details.</p>
            </div>
            
            <div class="section">
                <div class="section-title">Account Information</div>
                
                <p>Your account has been created with the following temporary password:</p>
                
                <div class="info-box">
                    <div class="info-label">Temporary Password</div>
                    <div class="password">${password}</div>
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