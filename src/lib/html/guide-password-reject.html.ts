export default function guideUpdatePasswordRejectHtml(email: string, reason: string) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    const htmlString = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status - BD Travel Spirit</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          
          body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background-color: #ffffff;
              line-height: 1.6;
              color: #334155;
              padding: 20px;
          }
          
          .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
              border: 1px solid #e2e8f0;
          }
          
          .header {
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              padding: 40px 30px 30px;
              text-align: center;
              border-bottom: 1px solid #f1f5f9;
          }
          
          .logo-container {
              display: inline-block;
              margin-bottom: 20px;
              perspective: 1000px;
          }
          
          .logo-square {
              width: 100px;
              height: 100px;
              background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);
              border-radius: 22px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              box-shadow: 
                  0 10px 25px rgba(16, 185, 129, 0.3),
                  0 5px 15px rgba(6, 182, 212, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3);
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              position: relative;
              overflow: hidden;
          }
          
          .logo-square::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(
                  to bottom right,
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0) 50%,
                  rgba(255, 255, 255, 0.05) 100%
              );
              transform: rotate(45deg);
          }
          
          .logo-square:hover {
              transform: scale(1.05) rotateY(5deg);
              box-shadow: 
                  0 15px 35px rgba(16, 185, 129, 0.4),
                  0 10px 20px rgba(6, 182, 212, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4);
          }
          
          .logo-text {
              font-size: 48px;
              font-weight: 800;
              color: white;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              letter-spacing: -1px;
          }
          
          .brand-name {
              font-size: 28px;
              font-weight: 700;
              background: linear-gradient(to right, #1e293b, #334155);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
          }
          
          .tagline {
              font-size: 12px;
              font-weight: 600;
              color: #10b981;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 12px;
          }
          
          .underline {
              width: 60px;
              height: 3px;
              background: linear-gradient(to right, #10b981, #14b8a6);
              margin: 0 auto;
              border-radius: 2px;
          }
          
          .status-header {
              background: linear-gradient(to right, #fef2f2, #fff7ed);
              padding: 30px;
              text-align: center;
              border-bottom: 1px solid #fed7aa;
          }
          
          .status-icon {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              color: white;
              font-size: 40px;
              box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
          }
          
          .status-title {
              font-size: 32px;
              font-weight: 700;
              background: linear-gradient(to right, #dc2626, #ea580c);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 10px;
          }
          
          .status-subtitle {
              color: #7c2d12;
              font-size: 16px;
              font-weight: 500;
          }
          
          .content {
              padding: 40px 40px 30px;
              background: #ffffff;
          }
          
          .greeting {
              font-size: 24px;
              font-weight: 600;
              color: #0f172a;
              margin-bottom: 25px;
          }
          
          .email-address {
              color: #10b981;
              font-weight: 700;
              text-decoration: none;
          }
          
          .application-box {
              background: #f8fafc;
              border-radius: 16px;
              padding: 25px;
              margin: 25px 0;
              border-left: 4px solid #ef4444;
              border: 1px solid #e2e8f0;
          }
          
          .application-title {
              font-size: 18px;
              font-weight: 600;
              color: #dc2626;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
          }
          
          .reason-box {
              background: white;
              border-radius: 12px;
              padding: 20px;
              margin-top: 15px;
              border: 1px solid #fecaca;
          }
          
          .reason-label {
              font-weight: 600;
              color: #dc2626;
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }
          
          .reason-content {
              background: #fef2f2;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #fecaca;
              color: #7c2d12;
              line-height: 1.7;
              font-size: 15px;
              white-space: pre-line;
          }
          
          .next-steps {
              background: #f0fdfa;
              border-radius: 16px;
              padding: 25px;
              margin: 30px 0;
              border-left: 4px solid #10b981;
              border: 1px solid #ccfbf1;
          }
          
          .next-steps-title {
              font-size: 18px;
              font-weight: 600;
              color: #0f766e;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
          }
          
          .steps-list {
              padding-left: 20px;
              color: #0f766e;
          }
          
          .steps-list li {
              margin-bottom: 12px;
              line-height: 1.6;
          }
          
          .steps-list strong {
              color: #0f766e;
          }
          
          .reapply-note {
              background: linear-gradient(135deg, #f0f9ff, #f8fafc);
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
              text-align: center;
              border: 1px solid #e0f2fe;
          }
          
          .reapply-title {
              color: #0369a1;
              font-weight: 600;
              margin-bottom: 10px;
              font-size: 16px;
          }
          
          .reapply-deadline {
              color: #0c4a6e;
              font-size: 14px;
              font-weight: 500;
          }
          
          .support-section {
              text-align: center;
              color: #64748b;
              font-size: 14px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
          }
          
          .support-link {
              color: #10b981;
              font-weight: 600;
              text-decoration: none;
          }
          
          .footer {
              background: #f8fafc;
              padding: 25px 40px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
          }
          
          .timestamp {
              color: #94a3b8;
              font-size: 13px;
              margin-bottom: 15px;
          }
          
          .copyright {
              color: #64748b;
              font-size: 13px;
              line-height: 1.5;
          }
          
          .action-button {
              display: inline-block;
              background: linear-gradient(to right, #10b981, #0d9488);
              color: white;
              padding: 14px 32px;
              border-radius: 12px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
              border: none;
              cursor: pointer;
          }
          
          .action-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
              background: linear-gradient(to right, #0da577, #0c857a);
          }
          
          @media (max-width: 600px) {
              .content, .header, .footer, .status-header {
                  padding: 30px 20px;
              }
              
              .logo-square {
                  width: 80px;
                  height: 80px;
              }
              
              .logo-text {
                  font-size: 40px;
              }
              
              .brand-name {
                  font-size: 24px;
              }
              
              .status-title {
                  font-size: 26px;
              }
              
              .greeting {
                  font-size: 20px;
              }
              
              .application-box, .next-steps {
                  padding: 20px;
              }
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">
              <div class="logo-container">
                  <div class="logo-square">
                      <div class="logo-text">BD</div>
                  </div>
                  <div class="brand-name">BD Travel Spirit</div>
                  <div class="tagline">Professional Guides</div>
                  <div class="underline"></div>
              </div>
          </div>
          
          <div class="status-header">
              <div class="status-icon">✗</div>
              <h1 class="status-title">Application Not Approved</h1>
              <p class="status-subtitle">Your application has been reviewed</p>
          </div>
          
          <div class="content">
              <h1 class="greeting">Dear <a href="mailto:${email}" class="email-address">${email}</a>,</h1>
              
              <p>Thank you for your interest in joining <strong>BD Travel Spirit</strong> and for taking the time to submit your application.</p>
              
              <p>We have carefully reviewed your application, and after thorough consideration, we regret to inform you that we are unable to approve your application at this time.</p>
              
              <div class="application-box">
                  <div class="application-title">
                      <span>📋</span> Application Review Details
                  </div>
                  
                  <p><strong>Application Status:</strong> <span style="color: #dc2626; font-weight: 600;">Not Approved</span></p>
                  <p><strong>Review Date:</strong> ${currentDate}</p>
                  <p><strong>Reference ID:</strong> BDTS-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  
                  <div class="reason-box">
                      <div class="reason-label">
                          <span>📝</span> Reason for Rejection
                      </div>
                      <div class="reason-content">
                          ${reason}
                      </div>
                  </div>
              </div>
              
              <div class="next-steps">
                  <div class="next-steps-title">
                      <span>🔄</span> Next Steps & Recommendations
                  </div>
                  <ul class="steps-list">
                      <li><strong>Review Feedback:</strong> Carefully consider the reason provided above as it highlights areas for improvement.</li>
                      <li><strong>Gain Experience:</strong> Consider gaining additional experience or qualifications in the areas mentioned.</li>
                      <li><strong>Update Application:</strong> You're welcome to reapply once you've addressed the feedback provided.</li>
                      <li><strong>Explore Alternatives:</strong> Visit our careers page for other opportunities that might better match your current qualifications.</li>
                  </ul>
              </div>
              
              <div class="reapply-note">
                  <p class="reapply-title">You may reapply in 90 days</p>
                  <p class="reapply-deadline">Earliest reapplication date: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              
              <div style="text-align: center;">
                  <a href="https://bdtravelspirit.com/careers" class="action-button">
                      View Other Opportunities
                  </a>
              </div>
              
              <div class="support-section">
                  If you have questions about this decision or need clarification on the feedback provided, please contact our recruitment team at 
                  <a href="mailto:recruitment@bdtravelspirit.com" class="support-link">recruitment@bdtravelspirit.com</a>
              </div>
          </div>
          
          <div class="footer">
              <div class="timestamp">Application reviewed on ${currentDate} at ${currentTime}</div>
              <div class="copyright">
                  © ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.<br>
                  Professional Travel Guides & Expert Tour Services Worldwide<br>
                  <a href="https://bdtravelspirit.com" style="color: #10b981; text-decoration: none;">www.bdtravelspirit.com</a>
              </div>
          </div>
      </div>
      
      <script>
          // Add hover effect for logo
          document.querySelector('.logo-square').addEventListener('mouseenter', function() {
              this.style.transform = 'scale(1.05) rotateY(5deg)';
              this.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4), 0 10px 20px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
          });
          
          document.querySelector('.logo-square').addEventListener('mouseleave', function() {
              this.style.transform = 'scale(1)';
              this.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3), 0 5px 15px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
          });
          
          // Add hover effect for action button
          document.querySelector('.action-button').addEventListener('mouseenter', function() {
              this.style.transform = 'translateY(-2px)';
              this.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
          });
          
          document.querySelector('.action-button').addEventListener('mouseleave', function() {
              this.style.transform = 'translateY(0)';
              this.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.25)';
          });
      </script>
  </body>
  </html>`;

    return htmlString;
}