// lib/html/application-suspended.html.ts
export const applicationSuspended = (
  companyName: string,
  email: string,
  reason: string,
  untilDate: string,
  untilTime: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Suspension Notification - BD Travel Spirit</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  </style>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
  <!-- Logo Header -->
  <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 25px 30px; border-radius: 16px 16px 0 0; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1); text-align: center;">
    
    <!-- Logo Container -->
    <div style="display: inline-block; margin-bottom: 20px; transition: all 0.3s ease;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <!-- BD Symbol -->
        <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%); border-radius: 18px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 28px; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);">
          BD
        </div>
        
        <!-- Brand Name -->
        <div style="text-align: left;">
          <div style="font-weight: 800; font-size: 28px; background: linear-gradient(90deg, #1e293b 0%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px;">
            BD Travel Spirit
          </div>
          <div style="margin-top: 4px;">
            <span style="color: #10b981; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Professional Guides</span>
            <div style="height: 3px; width: 100%; background: linear-gradient(90deg, #10b981 0%, #14b8a6 100%); border-radius: 2px; margin-top: 4px;"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div style="border-top: 2px solid #f1f5f9; margin-top: 20px; padding-top: 20px;">
      <h1 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 700;">⚠️ Account Suspension Notice</h1>
    </div>
  </div>
  
  <!-- Main Content -->
  <div style="background: #ffffff; padding: 35px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);">
    
    <p style="margin-bottom: 25px; font-size: 16px; color: #475569;">
      Dear <strong style="color: #1e293b;">${companyName}</strong>,
    </p>
    
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fffaf0 100%); border-left: 4px solid #ef4444; padding: 22px; margin: 25px 0; border-radius: 0 12px 12px 0; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);">
      <h3 style="color: #dc2626; margin-top: 0; font-size: 18px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span style="background: #ef4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">!</span>
        Account Suspended
      </h3>
      <p style="color: #7f1d1d; margin-bottom: 12px;"><strong>Reason:</strong> ${reason}</p>
      <p style="color: #7f1d1d; margin-bottom: 0;"><strong>Suspension Duration:</strong> Until ${untilDate} at ${untilTime}</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%); border: 1px solid #cbd5e1; padding: 22px; border-radius: 12px; margin: 25px 0;">
      <h3 style="color: #0f766e; margin-top: 0; font-size: 18px; font-weight: 700; margin-bottom: 15px;">📋 Current Restrictions</h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 8px;">Your account is temporarily inactive</li>
        <li style="margin-bottom: 8px;">All guide features have been disabled</li>
        <li style="margin-bottom: 8px;">Your listings are not visible to travelers</li>
        <li style="margin-bottom: 0;">Tour creation and management are suspended</li>
      </ul>
    </div>
    
    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%); border: 1px solid #a7f3d0; padding: 22px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);">
      <h3 style="color: #047857; margin-top: 0; font-size: 18px; font-weight: 700; margin-bottom: 15px;">✅ Next Steps</h3>
      <ul style="margin: 0; padding-left: 20px; color: #064e3b;">
        <li style="margin-bottom: 8px;">Account will auto-restore on <strong>${untilDate}</strong></li>
        <li style="margin-bottom: 8px;">Review our community guidelines before returning</li>
        <li style="margin-bottom: 0;">Contact support if you believe this is an error</li>
      </ul>
    </div>
    
    <p style="margin: 30px 0; font-size: 15px; color: #475569; line-height: 1.7;">
      This suspension is temporary and intended to ensure compliance with BD Travel Spirit's community standards. 
      We value your contribution to our platform and look forward to your return.
    </p>
    
    <!-- Support CTA -->
    <div style="text-align: center; margin-top: 35px; padding-top: 25px; border-top: 1px solid #e2e8f0;">
      <a href="mailto:support@bdtravelspirit.com?subject=Suspension%20Inquiry%20-%20${companyName}" 
         style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 14px 36px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: all 0.3s ease; border: none;">
        Contact Support Team
      </a>
      <p style="font-size: 13px; color: #64748b; margin-top: 15px;">
        Expected response time: 24-48 hours
      </p>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
          BD
        </div>
        <div>
          <div style="font-weight: 700; font-size: 16px; color: #1e293b;">BD Travel Spirit</div>
          <div style="font-size: 12px; color: #64748b;">Professional Guides Network</div>
        </div>
      </div>
      
      <p style="font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.6; margin-bottom: 0;">
        This is an automated notification from BD Travel Spirit's account management system.<br>
        For immediate assistance, contact: <a href="mailto:support@bdtravelspirit.com" style="color: #10b981; text-decoration: none;">support@bdtravelspirit.com</a><br>
        © ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;