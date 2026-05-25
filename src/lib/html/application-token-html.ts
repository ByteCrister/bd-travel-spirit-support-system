export default function ApplicationTokenHtml(token: string, email: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Authentication Token - BD Travel Spirit</title>
    <style>
        /* Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .email-container {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
        }
        
        /* Card Container */
        .card {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            box-shadow: 
                0 4px 6px rgba(0, 0, 0, 0.05),
                0 10px 15px rgba(0, 0, 0, 0.1),
                0 20px 40px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Header Section with White Background */
        .header {
            background: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        /* Logo */
        .logo-container {
            display: inline-block;
            margin-bottom: 25px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: 800;
            box-shadow: 
                0 4px 15px rgba(16, 185, 129, 0.3),
                0 8px 25px rgba(16, 185, 129, 0.2),
                inset 0 2px 0 rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 1;
        }
        
        .logo::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            height: 90%;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 15px;
            z-index: -1;
        }
        
        /* Branding */
        .brand {
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .brand-name {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(to right, #1e293b 0%, #334155 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
            margin-bottom: 5px;
        }
        
        .tagline {
            color: #10b981;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
            position: relative;
            display: inline-block;
            padding-bottom: 8px;
        }
        
        .tagline::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 3px;
            background: linear-gradient(to right, #10b981 0%, #14b8a6 100%);
            border-radius: 2px;
        }
        
        /* Content Section */
        .content {
            padding: 40px 30px;
        }
        
        .welcome-text {
            font-size: 18px;
            color: #334155;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        
        .email-display {
            background: #f1f5f9;
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        
        .email-display strong {
            color: #10b981;
            font-weight: 600;
        }
        
        /* Token Container */
        .token-container {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px dashed #cbd5e1;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        
        .token-label {
            color: #64748b;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .token {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 32px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: 2px;
            padding: 15px;
            background: white;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            display: inline-block;
            min-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
        }
        
        .footer-links a {
            color: #10b981;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
            color: #0d9668;
            text-decoration: underline;
        }
        
        .copyright {
            margin-top: 20px;
            font-size: 12px;
            color: #94a3b8;
        }
        
        /* Responsive Design */
        @media (max-width: 640px) {
            .card {
                border-radius: 16px;
            }
            
            .header, .content {
                padding: 30px 20px;
            }
            
            .brand-name {
                font-size: 28px;
            }
            
            .token {
                font-size: 24px;
                min-width: auto;
                width: 100%;
                padding: 12px;
            }
            
            .footer {
                padding: 20px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 10px;
            }
        }
        
        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            body {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            }
            
            .card {
                background: rgba(30, 41, 59, 0.95);
                border-color: rgba(255, 255, 255, 0.1);
            }
            
            .header {
                background: #1e293b;
            }
            
            .brand-name {
                background: linear-gradient(to right, #ffffff 0%, #e2e8f0 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .welcome-text {
                color: #e2e8f0;
            }
            
            .email-display {
                background: #334155;
                border-color: #475569;
            }
            
            .token {
                background: #1e293b;
                color: #ffffff;
                border-color: #334155;
            }
            
            .footer {
                background: #1e293b;
                border-color: #334155;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="card">
            <!-- Header with Logo - White Background -->
            <div class="header">
                <div class="logo-container">
                    <div class="logo">BD</div>
                </div>
                <div class="brand">
                    <h1 class="brand-name">BD Travel Spirit</h1>
                    <div class="tagline">Professional Guides</div>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <p class="welcome-text">
                    Hello! You've requested an authentication token for your BD Travel Spirit account.
                </p>
                
                <div class="email-display">
                    Account: <strong>${email}</strong>
                </div>
                
                <div class="token-container">
                    <div class="token-label">Your Verification Token</div>
                    <div class="token">${token}</div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="copyright">
                    © ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.<br>
                    Professional Travel Guidance Services
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}