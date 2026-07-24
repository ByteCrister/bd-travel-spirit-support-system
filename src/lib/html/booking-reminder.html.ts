export const getBookingReminderHtml = ({
    userName,
    subject,
    tourTitle,
    departureDate,
    isBefore,
}: {
    userName: string;
    subject: string;
    tourTitle: string;
    departureDate?: string;
    isBefore: boolean;
}) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7f6;
            color: #333333;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #0056b3;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .body-content {
            padding: 30px 40px;
        }
        .body-content h2 {
            font-size: 20px;
            color: #222222;
            margin-top: 0;
        }
        .body-content p {
            font-size: 16px;
            line-height: 1.6;
            color: #555555;
            margin: 15px 0;
        }
        .tour-details {
            background-color: #f9f9f9;
            border-left: 4px solid #0056b3;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .tour-details p {
            margin: 8px 0;
            font-size: 15px;
        }
        .tour-details strong {
            color: #333333;
        }
        .footer {
            background-color: #f4f7f6;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #888888;
            border-top: 1px solid #eeeeee;
        }
        .footer a {
            color: #0056b3;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>BD Travel Spirit</h1>
        </div>
        <div class="body-content">
            <h2>Hello ${userName},</h2>
            <p>${subject}</p>
            
            <div class="tour-details">
                <p><strong>Tour Name:</strong> ${tourTitle}</p>
                ${isBefore && departureDate ? `<p><strong>Departure Date & Time:</strong> ${departureDate}</p>` : ''}
            </div>

            <p>We are thrilled to have you traveling with us. If you have any questions or need further assistance, please don't hesitate to reach out to our support team.</p>
            <p>Have a wonderful experience!</p>
        </div>
        <div class="footer">
            <p>Best Regards,<br><strong>BD Travel Spirit Team</strong></p>
            <p><a href="#">Visit our website</a> | <a href="#">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
    `;
};
