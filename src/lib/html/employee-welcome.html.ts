// utils/email/templates/employee-welcome.ts
import { CreateEmployeePayload } from "@/types/employee.types";
import { ShiftDTO } from "@/types/employee.types";
import { escapeHtml } from "../helpers/escape-html";

/**
 * Helper function to generate HTML email template for new employee welcome email
 * @param employeeData - Employee creation data including credentials
 * @param companyName - Optional company name for branding
 * @returns HTML string for email body
 */
export function generateEmployeeWelcomeEmail(
    employeeData: CreateEmployeePayload,
    companyName: string = "Our Company"
): string {
    const {
        name,
        password,
        dateOfJoining,
        salary,
        currency,
        shifts = [],
        contactInfo,
        notes // Extract notes from payload
    } = employeeData;

    // Format date
    const joiningDate = new Date(dateOfJoining).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Format salary with currency
    const formattedSalary = salary
        ? `${currency} ${salary.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`
        : 'Not specified';

    // Generate shifts table rows
    const shiftsHTML = generateShiftsTable(shifts);

    // Generate the BD Travel Spirit logo HTML
    const logoHTML = generateLogoHTML();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${companyName}</title>
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
            background: linear-gradient(135deg, #10b981 0%, #0d9488 50%, #06b6d4 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 20px;
            font-family: 'Inter', 'Segoe UI', sans-serif;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            margin-right: 15px;
        }
        
        .logo-text {
            flex: 1;
        }
        
        .logo-main {
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        
        .logo-subtitle {
            font-size: 11px;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
            margin-top: 2px;
        }
        
        .logo-underline {
            height: 3px;
            width: 100px;
            background: linear-gradient(90deg, #10b981 0%, #0d9488 100%);
            margin-top: 5px;
            border-radius: 2px;
        }
        
        /* Responsive logo */
        @media (max-width: 480px) {
            .logo-icon {
                width: 40px;
                height: 40px;
                font-size: 18px;
            }
            
            .logo-main {
                font-size: 18px;
            }
            
            .logo-subtitle {
                font-size: 10px;
                letter-spacing: 1.5px;
            }
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-section {
            margin-bottom: 30px;
        }
        
        .welcome-section h2 {
            color: #2d3748;
            font-size: 22px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .credentials-box {
            background: linear-gradient(135deg, #f6f9ff 0%, #f0f4ff 100%);
            border-left: 4px solid #667eea;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .credentials-box h3 {
            color: #4a5568;
            font-size: 18px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .credentials-box h3:before {
            content: "🔐";
            font-size: 20px;
        }
        
        .credential-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .credential-item:last-child {
            border-bottom: none;
        }
        
        .credential-label {
            flex: 0 0 140px;
            font-weight: 600;
            color: #4a5568;
            font-size: 14px;
        }
        
        .credential-value {
            flex: 1;
            color: #2d3748;
            font-size: 15px;
        }
        
        .password-display {
            background: white;
            padding: 12px 15px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            letter-spacing: 1px;
            color: #e53e3e;
            font-weight: 600;
            display: inline-block;
            margin-top: 5px;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .detail-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .detail-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
        }
        
        .detail-icon {
            font-size: 24px;
            margin-bottom: 15px;
        }
        
        .detail-title {
            font-size: 14px;
            color: #718096;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .detail-value {
            font-size: 18px;
            color: #2d3748;
            font-weight: 600;
        }
        
        .shifts-section {
            margin-top: 40px;
        }
        
        .shifts-section h3 {
            color: #4a5568;
            font-size: 18px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .shifts-section h3:before {
            content: "🕒";
            font-size: 20px;
        }
        
        .shifts-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .shifts-table th {
            background: #f7fafc;
            color: #4a5568;
            font-weight: 600;
            text-align: left;
            padding: 15px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .shifts-table td {
            padding: 15px;
            border-top: 1px solid #e2e8f0;
            color: #2d3748;
        }
        
        .shifts-table tr:hover {
            background: #f7fafc;
        }
        
        .days-badge {
            display: inline-flex;
            background: #edf2f7;
            color: #4a5568;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            margin-right: 5px;
            margin-bottom: 5px;
        }
        
        /* Notes Section */
        .notes-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);
        }
        
        .notes-section h3 {
            color: #92400e;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notes-section h3:before {
            content: "📝";
            font-size: 20px;
        }
        
        .notes-content {
            color: #78350f;
            font-size: 15px;
            line-height: 1.7;
            white-space: pre-wrap;
            background: rgba(255, 255, 255, 0.7);
            padding: 15px;
            border-radius: 6px;
            border: 1px solid rgba(245, 158, 11, 0.2);
        }
        
        .footer {
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .important-note {
            background: #fffaf0;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .important-note h4 {
            color: #c53030;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .important-note h4:before {
            content: "⚠️";
        }
        
        .contact-info {
            background: #f0fff4;
            border: 1px solid #c6f6d5;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .contact-info h4 {
            color: #276749;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .contact-info h4:before {
            content: "📞";
        }
        
        @media (max-width: 600px) {
            .email-container {
                border-radius: 0;
            }
            
            .header, .content {
                padding: 25px 20px;
            }
            
            .details-grid {
                grid-template-columns: 1fr;
            }
            
            .credential-item {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .credential-label {
                margin-bottom: 5px;
            }
            
            .shifts-table {
                display: block;
                overflow-x: auto;
            }
            
            .logo-container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Logo Section -->
        <div class="logo-container">
            ${logoHTML}
        </div>
        
        <div class="header">
            <h1>Welcome to ${companyName}! 🎉</h1>
            <p>Your employee account has been successfully created</p>
        </div>
        
        <div class="content">
            <div class="welcome-section">
                <h2>Hello ${name},</h2>
                <p>We're excited to welcome you to our team! Your employee account has been set up, and you can now access our systems using the credentials below.</p>
            </div>
            
            <!-- Notes Section (if notes exist) -->
            ${notes ? `
            <div class="notes-section">
                <h3>Additional Notes</h3>
                <div class="notes-content">
                    ${escapeHtml(notes)}
                </div>
            </div>
            ` : ''}
            
            <div class="credentials-box">
                <h3>Login Credentials</h3>
                <div class="credential-item">
                    <div class="credential-label">Email Address:</div>
                    <div class="credential-value">${contactInfo.email}</div>
                </div>
                <div class="credential-item">
                    <div class="credential-label">Password:</div>
                    <div class="credential-value">
                        <div class="password-display">${escapeHtml(password)}</div>
                        <p style="font-size: 13px; color: #718096; margin-top: 8px;">
                            Please change your password after first login for security.
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="details-grid">
                <div class="detail-card">
                    <div class="detail-icon">📅</div>
                    <div class="detail-title">Date of Joining</div>
                    <div class="detail-value">${joiningDate}</div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-icon">💰</div>
                    <div class="detail-title">Salary</div>
                    <div class="detail-value">${formattedSalary}</div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-icon">📱</div>
                    <div class="detail-title">Phone Number</div>
                    <div class="detail-value">${contactInfo.phone}</div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-icon">👥</div>
                    <div class="detail-title">Emergency Contact</div>
                    <div class="detail-value">${contactInfo.emergencyContact.name} (${contactInfo.emergencyContact.relation})</div>
                    <div style="font-size: 14px; color: #4a5568; margin-top: 5px;">${contactInfo.emergencyContact.phone}</div>
                </div>
            </div>
            
            ${shifts.length > 0 ? `
            <div class="shifts-section">
                <h3>Your Scheduled Shifts</h3>
                ${shiftsHTML}
            </div>
            ` : ''}
            
            <div class="contact-info">
                <h4>Contact Information</h4>
                <p>If you have any questions or need assistance, please contact the HR department or your supervisor.</p>
            </div>
            
            <div class="important-note">
                <h4>Important Security Note</h4>
                <ul style="padding-left: 20px; margin-top: 10px;">
                    <li>Keep your login credentials confidential</li>
                    <li>Change your password immediately after first login</li>
                    <li>Do not share your password with anyone</li>
                    <li>Log out from shared computers after use</li>
                    <li>Report any suspicious activity immediately</li>
                </ul>
            </div>
            
            <p style="margin-top: 30px; color: #4a5568; font-size: 15px;">
                We're thrilled to have you on board and look forward to working with you. 
                Please complete your profile setup and document uploads as soon as possible.
            </p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from ${companyName}'s HR System.</p>
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
}

/**
 * Generate BD Travel Spirit logo HTML for email
 */
function generateLogoHTML(): string {
    return `
        <div class="logo-icon">BD</div>
        <div class="logo-text">
            <div class="logo-main">BD Travel Spirit</div>
            <div class="logo-subtitle">Professional Guides</div>
            <div class="logo-underline"></div>
        </div>
    `;
}

/**
 * Helper function to generate HTML table for shifts
 */
function generateShiftsTable(shifts: ShiftDTO[]): string {
    if (shifts.length === 0) {
        return '<p style="color: #718096; font-style: italic;">No shifts scheduled yet.</p>';
    }

    return `
    <table class="shifts-table">
      <thead>
        <tr>
          <th>Shift Days</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${shifts.map((shift) => {
        const duration = calculateDuration(shift.startTime, shift.endTime);
        const daysBadges = shift.days.map(day =>
            `<span class="days-badge">${day}</span>`
        ).join('');

        return `
          <tr>
            <td>${daysBadges}</td>
            <td><strong>${formatTime(shift.startTime)}</strong></td>
            <td><strong>${formatTime(shift.endTime)}</strong></td>
            <td>${duration}</td>
          </tr>
          `;
    }).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Format time from 24h to 12h format
 */
function formatTime(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculate duration between start and end time
 */
function calculateDuration(startTime: string, endTime: string): string {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    let hours = endHours - startHours;
    let minutes = endMinutes - startMinutes;

    if (minutes < 0) {
        hours -= 1;
        minutes += 60;
    }

    if (hours < 0) {
        hours += 24;
    }

    return `${hours}h ${minutes}m`;
}

/**
 * Simplified version for quick integration with NodeMailer
 */
export function EmployeeWelcome(
    employeeData: CreateEmployeePayload,
    companyName?: string
): { subject: string; html: string } {
    return {
        subject: `Welcome to ${companyName || 'Our Team'} - Your Employee Account Details`,
        html: generateEmployeeWelcomeEmail(employeeData, companyName)
    };
}