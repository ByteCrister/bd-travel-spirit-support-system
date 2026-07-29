import { UpdateEmployeePayload } from "@/types/employee/employee.types";

/**
 * Helper function to generate HTML email template for employee updates
 * @param employeeName - Employee's name
 * @param companyName - Optional company name for branding
 * @returns HTML string for email body
 */
export function generateEmployeeUpdateEmail(
    employeeName: string,
    companyName: string = "BD Travel Spirit"
): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Update - ${companyName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            margin-top: 40px;
            margin-bottom: 40px;
        }
        
        /* Logo Styles */
        .logo-container {
            display: flex;
            align-items: center;
            padding: 25px 30px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-bottom: 1px solid #e2e8f0;
        }
        
        .logo-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #006666 0%, #008080 55%, #00b3b3 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 20px;
            font-family: 'Inter', 'Segoe UI', sans-serif;
            box-shadow: 0 4px 12px rgba(0, 102, 102, 0.3);
            text-align: center;
            line-height: 48px;
        }
        
        .logo-text-container {
            margin-left: 16px;
        }
        
        .logo-text-main {
            font-size: 22px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
            margin-bottom: 2px;
        }
        
        .logo-text-sub {
            font-size: 13px;
            font-weight: 600;
            color: #006666;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        /* Header section */
        .header {
            background: linear-gradient(135deg, #006666 0%, #008080 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        /* Content area */
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1e293b;
        }
        
        .intro-text {
            margin-bottom: 25px;
            font-size: 16px;
            color: #475569;
        }
        
        .info-card {
            background: #f8fafc;
            border-radius: 10px;
            padding: 25px;
            border-left: 4px solid #006666;
            margin-bottom: 30px;
        }
        
        .info-card p {
            font-size: 15px;
            color: #334155;
        }
        
        .footer {
            background: #f1f5f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Logo Header -->
        <div class="logo-container">
            <div class="logo-icon">BD</div>
            <div class="logo-text-container">
                <div class="logo-text-main">BD Travel</div>
                <div class="logo-text-sub">Spirit System</div>
            </div>
        </div>
        
        <div class="header">
            <h1>Profile Updated</h1>
            <p>Your employment details have been modified</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${employeeName},</div>
            
            <p class="intro-text">
                This is an automated notification to let you know that your employee profile and details have recently been updated by an administrator in the ${companyName} system.
            </p>
            
            <div class="info-card">
                <p>If you have any questions regarding these changes, such as your salary, shifts, or contact information, please reach out to the HR department or your direct manager.</p>
            </div>
            
            <p class="intro-text">
                Thank you for your continued dedication to our team!
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            <p style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
                This is an automated message. Please do not reply directly to this email.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}
