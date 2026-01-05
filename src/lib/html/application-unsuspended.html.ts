// lib/html/application-unsuspended.html.ts
export const applicationUnsuspended = (
  companyName: string,
  email: string,
  reason: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Restored - BD Travel Spirit</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  </style>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);">
  <!-- Logo Header -->
  <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 25px 30px; border-radius: 16px 16px 0 0; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); text-align: center;">
    
    <!-- Logo Container -->
    <div style="display: inline-block; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;">
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
    
    <div style="border-top: 2px solid #d1fae5; margin-top: 20px; padding-top: 20px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);">
        <span style="color: white; font-size: 28px; font-weight: bold;">✓</span>
      </div>
      <h1 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 700;">Account Successfully Restored</h1>
    </div>
  </div>
  
  <!-- Main Content -->
  <div style="background: #ffffff; padding: 35px 30px; border-radius: 0 0 16px 16px; border: 1px solid #d1fae5; border-top: none; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.08);">
    
    <div style="text-align: center; margin-bottom: 25px;">
      <h2 style="color: #047857; margin: 0 0 15px 0; font-size: 22px; font-weight: 700;">Welcome Back, ${companyName}! 👋</h2>
      <p style="color: #475569; font-size: 16px; margin: 0;">
        We're pleased to inform you that your guide account has been <strong>fully restored</strong>.
      </p>
    </div>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #10b981; padding: 22px; margin: 25px 0; border-radius: 0 12px 12px 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);">
      <h3 style="color: #065f46; margin-top: 0; font-size: 18px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <span style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">✓</span>
        Account Status Update
      </h3>
      <p style="color: #065f46; margin-bottom: 12px;"><strong>Current Status:</strong> <span style="color: #10b981; font-weight: 600;">Active & Approved</span></p>
      <p style="color: #065f46; margin-bottom: 0;"><strong>Restoration Reason:</strong> ${reason}</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%); border: 1px solid #a7f3d0; padding: 22px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);">
      <h3 style="color: #0f766e; margin-top: 0; font-size: 18px; font-weight: 700; margin-bottom: 15px;">🎉 Your Access Has Been Restored</h3>
      <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #d1fae5; color: #10b981; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">✓</span>
          <span style="color: #064e3b;">Full access to guide dashboard and tools</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #d1fae5; color: #10b981; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">✓</span>
          <span style="color: #064e3b;">Your listings are now visible to travelers</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #d1fae5; color: #10b981; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">✓</span>
          <span style="color: #064e3b;">Ability to create and manage tours</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="background: #d1fae5; color: #10b981; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">✓</span>
          <span style="color: #064e3b;">All premium features and functionalities</span>
        </div>
      </div>
    </div>
    
    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%); border: 1px solid #a7f3d0; padding: 22px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);">
      <h3 style="color: #047857; margin-top: 0; font-size: 18px; font-weight: 700; margin-bottom: 15px;">💎 Exclusive Welcome Back Offer</h3>
      <p style="color: #064e3b; margin-bottom: 15px;">
        As a welcome back gesture, you now have access to:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #064e3b;">
        <li style="margin-bottom: 8px;">Priority support for the next 30 days</li>
        <li style="margin-bottom: 8px;">Featured listing placement for 1 week</li>
        <li style="margin-bottom: 0;">New traveler booking notifications</li>
      </ul>
    </div>
    
    <p style="margin: 30px 0; font-size: 15px; color: #475569; line-height: 1.7; text-align: center;">
      We're thrilled to have you back on the BD Travel Spirit platform! Your expertise helps travelers discover amazing experiences.
    </p>
    
    <!-- Dashboard CTA -->
    <div style="text-align: center; margin-top: 35px; padding-top: 25px; border-top: 1px solid #d1fae5;">
      <a href="https://bdtravelspirit.com/guide/dashboard" 
         style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 14px 36px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: all 0.3s ease; border: none; margin-bottom: 10px;">
        Go to Your Dashboard
      </a>
      <p style="font-size: 13px; color: #64748b; margin-top: 15px;">
        Click above to access your fully restored account
      </p>
    </div>
    
    <!-- Help Section -->
    <div style="background: #f8fafc; border-radius: 10px; padding: 20px; margin-top: 30px; border: 1px solid #e2e8f0;">
      <h4 style="color: #475569; margin-top: 0; font-size: 16px; font-weight: 600; margin-bottom: 12px;">Need Assistance?</h4>
      <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">
        Our support team is here to help you get back on track:
      </p>
      <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
        <a href="mailto:support@bdtravelspirit.com" style="color: #10b981; text-decoration: none; font-size: 14px; font-weight: 500;">✉️ Email Support</a>
        <span style="color: #cbd5e1;">•</span>
        <a href="https://bdtravelspirit.com/help" style="color: #10b981; text-decoration: none; font-size: 14px; font-weight: 500;">📚 Help Center</a>
        <span style="color: #cbd5e1;">•</span>
        <a href="https://bdtravelspirit.com/community-guidelines" style="color: #10b981; text-decoration: none; font-size: 14px; font-weight: 500;">📘 Community Guidelines</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
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
        © ${new Date().getFullYear()} BD Travel Spirit. All rights reserved.<br>
        <span style="font-size: 12px; color: #cbd5e1;">Email ID: ${email}</span>
      </p>
    </div>
  </div>
</body>
</html>
`;