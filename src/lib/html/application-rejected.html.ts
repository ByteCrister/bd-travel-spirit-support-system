/**
 * Send a rejection notification to an applicant with reasons and next steps.
 *
 * @param {string} guideCompanyName - Full legal or display name of the guide company whose application was reviewed.
 * @param {string} userEmail - Recipient email address for the rejection notification.
 * @param {string} rejectionReason - Clear, concise explanation of why the application was not approved; include actionable points when possible.
 * @param {string} [reapplyInstructions="You may reapply after addressing the issues mentioned above."] - Guidance for how and when the applicant can reapply, including any required changes or waiting periods.
 * @param {string} [contactEmail="support@bdtravelspirit.com"] - Support or contact address for follow-up questions or appeals.
 *
 * @returns {void} No return value. Surface errors via exceptions or logging.
 *
 * @example
 * applicationRejected(
 *   "BD Travel Spirit Ltd.",
 *   "applicant@example.com",
 *   "Missing proof of insurance and incomplete business registration documents.",
 *   "Please submit the missing documents within 14 days and then reapply.",
 *   "support@bdtravelspirit.com"
 * );
 */
export function applicationRejected(
    guideCompanyName: string,
    userEmail: string,
    rejectionReason: string,
    reapplyInstructions: string = "You may reapply after addressing the issues mentioned above.",
    contactEmail: string = "support@bdtravelspirit.com"
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
            color: #dc2626;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .content {
            padding: 40px 30px;
        }
        .notification-box {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
            border: 2px solid #ef4444;
        }
        .notification-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .notification-text {
            font-size: 20px;
            font-weight: 600;
            color: #7f1d1d;
            margin-bottom: 15px;
        }
        .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #7f1d1d;
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
            border-left: 4px solid #ef4444;
            margin-bottom: 30px;
        }
        .rejection-reason-box {
            background-color: #fef2f2;
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
            border: 2px solid #fca5a5;
        }
        .reason-title {
            color: #dc2626;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .reason-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            font-size: 16px;
            line-height: 1.8;
            color: #444;
        }
        .improvement-section {
            background-color: #fefce8;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #f59e0b;
        }
        .improvement-title {
            color: #b45309;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .improvement-list {
            padding-left: 20px;
            margin: 15px 0;
        }
        .improvement-list li {
            margin-bottom: 10px;
        }
        .reapply-section {
            background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border: 2px dashed #3b82f6;
            text-align: center;
        }
        .reapply-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 18px;
            margin: 20px 0;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .reapply-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }
        .contact-section {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #6c757d;
            text-align: center;
        }
        .contact-title {
            color: #4b5563;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .contact-email {
            font-size: 18px;
            color: #3b82f6;
            font-weight: 600;
            padding: 12px;
            background: white;
            border-radius: 6px;
            margin: 10px 0;
            word-break: break-all;
            border: 1px solid #d1d5db;
            display: inline-block;
        }
        .support-info {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eaeaea;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .notification-box {
                padding: 20px;
            }
            .notification-text {
                font-size: 18px;
            }
            .company-name {
                font-size: 20px;
            }
            .reapply-button {
                padding: 14px 30px;
                font-size: 16px;
            }
            .reason-title {
                font-size: 18px;
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
            <h1>Application Status Update</h1>
        </div>
        
        <div class="content">
            <div class="notification-box">
                <div class="notification-icon">⚠️</div>
                <div class="notification-text">Application Review Complete</div>
                <p>We regret to inform you that your guide application for</p>
                <div class="company-name">${guideCompanyName}</div>
                <p>has <strong>not been approved</strong> at this time.</p>
            </div>
            
            <div class="message-box">
                <p>Dear Applicant,</p>
                <p>Thank you for your interest in joining BD Travel Spirit as a professional guide. We have completed the review of your application.</p>
                <p>While we appreciate your time and effort in applying, we are unable to approve your application at this moment based on our current review criteria.</p>
            </div>
            
            <div class="rejection-reason-box">
                <div class="reason-title">
                    <span>📋</span>
                    Reason for Rejection
                </div>
                <div class="reason-content">
                    ${rejectionReason}
                </div>
            </div>
            
            <div class="improvement-section">
                <div class="improvement-title">Suggestions for Improvement</div>
                <p>To improve your chances for future applications, consider the following:</p>
                <ul class="improvement-list">
                    <li><strong>Review our requirements:</strong> Ensure all documentation meets our guidelines</li>
                    <li><strong>Complete documentation:</strong> Provide clear, legible copies of all required documents</li>
                    <li><strong>Update information:</strong> Make sure all contact and business information is current</li>
                    <li><strong>Professional presentation:</strong> Ensure your company profile and bio are well-written</li>
                    <li><strong>Quality verification:</strong> Submit high-quality documents that are easy to verify</li>
                </ul>
                <p>${reapplyInstructions}</p>
            </div>
            
            <div class="reapply-section">
                <h3>Interested in Reapplying?</h3>
                <p>We encourage you to address the feedback above and consider reapplying in the future.</p>
                <p>Our application system retains your information for 90 days, making it easier to update and resubmit.</p>
                
                <a href="https://app.bdtravelspirit.com/guides/apply" class="reapply-button">
                    View Application Portal
                </a>
                
                <p>You can log in with your registered email to review and update your application.</p>
            </div>
            
            <div class="contact-section">
                <div class="contact-title">Need Clarification?</div>
                <p>If you have questions about the rejection reason or need further clarification, our support team is here to help.</p>
                
                <div class="contact-email">${contactEmail}</div>
                
                <p>Please include your application reference and company name in your inquiry.</p>
            </div>
            
            <div class="support-info">
                <p><strong>Support Hours:</strong> Sunday - Thursday, 9:00 AM - 6:00 PM (Bangladesh Time)</p>
                <p><strong>Response Time:</strong> We aim to respond to inquiries within 24-48 hours</p>
            </div>
            
            <p>We appreciate your interest in BD Travel Spirit and hope you consider reapplying in the future.</p>
            
            <p>Best regards,<br>
            <strong>The BD Travel Spirit Team</strong><br>
            Professional Guides Network</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For assistance, contact: ${contactEmail}</p>
            <p>© ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}