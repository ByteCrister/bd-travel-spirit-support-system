export default function applicationSuccess(email: string, accessToken: string) {
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
            background: linear-gradient(135deg, #4f6df5 0%, #3a56e8 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
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
        .token-box {
            background-color: #f0f2ff;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
            word-break: break-all;
            border: 1px dashed #4f6df5;
        }
        .token {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #2d3a8c;
            font-size: 16px;
            letter-spacing: 0.5px;
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
        @media only screen and (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .header {
                padding: 25px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
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
            
            <p>You can use the following access token to view your submitted form:</p>
            
            <div class="token-box">
                <div class="token">${accessToken}</div>
            </div>
            
            <p>Keep this token safe as it provides access to your application details.</p>
            
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