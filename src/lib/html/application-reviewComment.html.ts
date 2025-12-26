/**
 * Add a review comment record for a guide company and notify the applicant.
 *
 * @param {string} guideCompanyName - Full legal or display name of the guide company receiving the review.
 * @param {string} userEmail - Email address of the user or applicant who submitted the review or application.
 * @param {string} reviewComment - The body of the review or reviewer feedback; plain text, may include short formatting.
 * @param {string} [reviewerName="BD Travel Spirit Team"] - Name shown as the reviewer or sender; defaults to the internal team name.
 * @param {string} [reviewDate] - Human‑readable date string for the review (defaults to today's date formatted like "Friday, December 26, 2025").
 * @param {string} [nextSteps="Our team will review your application and respond with a final decision soon."] - Short guidance for the recipient about what happens next.
 * @param {string} [contactEmail="support@bdtravelspirit.com"] - Contact address recipients can use for follow up or support.
 *
 * @returns {void} No return value. Use exceptions or logging to surface errors.
 *
 * @example
 * reviewCommentAdd(
 *   "BD Travel Spirit Ltd.",
 *   "applicant@example.com",
 *   "Thank you for your submission. We need additional documents to proceed.",
 *   "BD Travel Spirit Team",
 *   "Friday, December 26, 2025",
 *   "Please upload the requested documents within 7 days.",
 *   "support@bdtravelspirit.com"
 * );
 */
export function reviewCommentAdd(
    guideCompanyName: string,
    userEmail: string,
    reviewComment: string,
    reviewerName: string = "BD Travel Spirit Team",
    reviewDate: string = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }),
    nextSteps: string = "Our team will review your application and respond with a final decision soon.",
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
            color: #3b82f6;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .content {
            padding: 40px 30px;
        }
        .notification-box {
            background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
            border: 2px solid #3b82f6;
        }
        .notification-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .notification-text {
            font-size: 20px;
            font-weight: 600;
            color: #1d4ed8;
            margin-bottom: 15px;
        }
        .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #1d4ed8;
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
            border-left: 4px solid #3b82f6;
            margin-bottom: 30px;
        }
        .application-info {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #dbeafe;
        }
        .info-item {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
        }
        .info-label {
            font-weight: 600;
            color: #4b5563;
            min-width: 120px;
            font-size: 14px;
        }
        .info-value {
            flex: 1;
            font-weight: 500;
            color: #1f2937;
            word-break: break-all;
        }
        .email-value {
            font-family: 'Courier New', monospace;
            font-weight: 600;
            color: #0f172a;
        }
        .review-comment-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
            border: 2px solid #f59e0b;
        }
        .review-comment-title {
            color: #b45309;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .review-comment-content {
            background: white;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #fbbf24;
            font-size: 16px;
            line-height: 1.8;
            color: #444;
            font-style: italic;
            quotes: "\\201C" "\\201D";
        }
        .reviewer-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        .reviewer-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 5px;
        }
        .reviewer-name {
            font-size: 18px;
            color: #3b82f6;
            font-weight: 600;
        }
        .review-date {
            font-size: 14px;
            color: #6c757d;
            margin-top: 5px;
        }
        .next-steps-section {
            background: linear-gradient(135deg, #d1fae5 0%, #bbf7d0 100%);
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border: 2px dashed #10b981;
        }
        .next-steps-title {
            color: #065f46;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .next-steps-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #a7f3d0;
            font-size: 16px;
            line-height: 1.6;
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
        .status-note {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            border: 1px solid #fbbf24;
        }
        .status-title {
            color: #b45309;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
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
            .info-item {
                flex-direction: column;
            }
            .info-label {
                margin-bottom: 5px;
                min-width: auto;
            }
            .review-comment-box {
                padding: 20px;
            }
            .review-comment-content {
                padding: 20px;
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
            <h1>Review Comment Added to Your Application</h1>
        </div>
        
        <div class="content">
            <div class="notification-box">
                <div class="notification-icon">📝</div>
                <div class="notification-text">Application Review Update</div>
                <p>A review comment has been added to your guide application for</p>
                <div class="company-name">${guideCompanyName}</div>
                <p>Our team is currently reviewing your submission.</p>
            </div>
            
            <div class="message-box">
                <p>Dear Applicant,</p>
                <p>We have reviewed your guide application and have provided additional feedback below. This is part of our standard review process to ensure all applications meet our quality standards.</p>
                
                <div class="application-info">
                    <div class="info-item">
                        <div class="info-label">Application For:</div>
                        <div class="info-value">${guideCompanyName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Reference Email:</div>
                        <div class="info-value email-value">${userEmail}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Application Status:</div>
                        <div class="info-value">
                            <span style="background: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 4px; font-weight: 600;">
                                ⏳ Under Review
                            </span>
                        </div>
                    </div>
                </div>
                
                <p>Please review the comment below carefully. You do not need to take any immediate action unless specifically requested.</p>
            </div>
            
            <div class="review-comment-box">
                <div class="review-comment-title">
                    <span>💬</span>
                    Review Comment
                </div>
                <div class="review-comment-content">
                    "${reviewComment}"
                </div>
            </div>
            
            <div class="reviewer-info">
                <div class="reviewer-label">Reviewer</div>
                <div class="reviewer-name">${reviewerName}</div>
                <div class="review-date">Review Date: ${reviewDate}</div>
            </div>
            
            <div class="status-note">
                <div class="status-title">⚠️ Please Note:</div>
                <p>This review comment does not mean your application has been approved or rejected. It is part of our standard review process to ensure all necessary information is complete and accurate.</p>
            </div>
            
            <div class="next-steps-section">
                <div class="next-steps-title">Next Steps</div>
                <div class="next-steps-content">
                    <p>${nextSteps}</p>
                    <ul style="margin: 15px 0; padding-left: 20px;">
                        <li>Continue monitoring this email for updates</li>
                        <li>No action is required unless specifically requested in the review comment</li>
                        <li>We'll notify you as soon as a final decision is made</li>
                        <li>Typical review time is 3-5 business days from this date</li>
                    </ul>
                </div>
            </div>
            
            <div class="contact-section">
                <div class="contact-title">Questions About This Review?</div>
                <p>If you have questions about this review comment or need clarification regarding your application, please contact our support team.</p>
                
                <div class="contact-email">${contactEmail}</div>
                
                <p>When contacting support, please include your application reference email: <strong>${userEmail}</strong></p>
            </div>
            
            <p>Thank you for your patience during our review process.</p>
            
            <p>Best regards,<br>
            <strong>The BD Travel Spirit Team</strong><br>
            Professional Guides Network</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message regarding your application submitted with email: ${userEmail}</p>
            <p>For assistance, contact: ${contactEmail}</p>
            <p>© ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}