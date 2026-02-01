export default function guideUpdatePasswordHtml(email: string, newPass: string) {
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
      <title>Password Updated - BD Travel Spirit</title>
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
          
          .content {
              padding: 40px 40px 30px;
              background: #ffffff;
          }
          
          .greeting {
              font-size: 24px;
              font-weight: 600;
              color: #0f172a;
              margin-bottom: 30px;
          }
          
          .info-box {
              background: #f8fafc;
              border-radius: 16px;
              padding: 25px;
              margin: 25px 0;
              border-left: 4px solid #10b981;
              border: 1px solid #e2e8f0;
          }
          
          .info-box-title {
              font-size: 16px;
              font-weight: 600;
              color: #0f172a;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 10px;
          }
          
          .info-box-title i {
              color: #10b981;
          }
          
          .credentials {
              display: flex;
              flex-direction: column;
              gap: 12px;
          }
          
          .credential-item {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px 15px;
              background: white;
              border-radius: 10px;
              border: 1px solid #e2e8f0;
          }
          
          .credential-item label {
              font-weight: 500;
              color: #64748b;
              min-width: 120px;
          }
          
          .credential-item span {
              font-weight: 600;
              color: #0f172a;
              word-break: break-all;
          }
          
          .password-warning {
              background: #fef2f2;
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
              border-left: 4px solid #dc2626;
              border: 1px solid #fecaca;
          }
          
          .warning-title {
              color: #dc2626;
              font-weight: 600;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          
          .warning-list {
              padding-left: 20px;
              color: #7f1d1d;
              font-size: 14px;
          }
          
          .warning-list li {
              margin-bottom: 8px;
          }
          
          .support-note {
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
          
          @media (max-width: 600px) {
              .content, .header, .footer {
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
              
              .credential-item {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 5px;
              }
              
              .credential-item label {
                  min-width: auto;
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
          
          <div class="content">
              <h1 class="greeting">Password Successfully Updated</h1>
              
              <p>Your BD Travel Spirit account password has been successfully updated. Here are your updated credentials:</p>
              
              <div class="info-box">
                  <div class="info-box-title">
                      <i>🔐</i> Account Information
                  </div>
                  <div class="credentials">
                      <div class="credential-item">
                          <label>Email Address:</label>
                          <span>${email}</span>
                      </div>
                      <div class="credential-item">
                          <label>New Password:</label>
                          <span>${newPass}</span>
                      </div>
                  </div>
              </div>
              
              <div class="password-warning">
                  <div class="warning-title">
                      <i>⚠️</i> Important Security Notice
                  </div>
                  <ul class="warning-list">
                      <li>Store your password in a secure location</li>
                      <li>Do not share your password with anyone</li>
                      <li>Consider changing your password periodically</li>
                      <li>Log out of your account when using public devices</li>
                  </ul>
              </div>
              
              <p>You can now use your new password to log in to your BD Travel Spirit account on our website and mobile app.</p>
              
              <div class="support-note">
                  If you didn't request this password change or need assistance, please contact our support team immediately at 
                  <a href="mailto:support@bdtravelspirit.com" class="support-link">support@bdtravelspirit.com</a>
              </div>
          </div>
          
          <div class="footer">
              <div class="timestamp">Password updated on ${currentDate} at ${currentTime}</div>
              <div class="copyright">
                  © ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.<br>
                  Professional Travel Guides & Expert Tour Services Worldwide
              </div>
          </div>
      </div>
      
      <script>
          // Add hover effect for logo (only works in email clients that support JavaScript, which is rare)
          document.querySelector('.logo-square').addEventListener('mouseenter', function() {
              this.style.transform = 'scale(1.05) rotateY(5deg)';
              this.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4), 0 10px 20px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
          });
          
          document.querySelector('.logo-square').addEventListener('mouseleave', function() {
              this.style.transform = 'scale(1)';
              this.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3), 0 5px 15px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
          });
      </script>
  </body>
  </html>`;

    return htmlString;
}