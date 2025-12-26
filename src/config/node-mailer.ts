// src/config/node-mailer
import nodemailer from "nodemailer";
/**
 * Production Mailer (Gmail)
 */
// export const mailer = async (To: string, subject: string, html: string) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: "Gmail",
//             auth: {
//                 user: process.env.EMAIL_AUTH,
//                 pass: process.env.PASSWORD_AUTH,
//             },
//         });

//         const mailOptions = {
//             from: `"BD Travel Spirit" <${process.env.EMAIL_AUTH}>`,
//             to: To,
//             subject: subject,
//             html: html,
//         };

//         const info = await transporter.sendMail(mailOptions);
//         console.log("Message sent:", info.messageId);
//         return true;
//     } catch (error) {
//         console.error("Error sending email:", error);
//         throw new Error("Failed to send email. Check your SMTP settings.");
//     }
// };


/**
 * Testing Mailer (Ethereal)
 * No real emails are sent
 */
export const mailer = async (
    To: string,
    subject: string,
    html: string
): Promise<boolean> => {
    try {
        // Create a test account automatically
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await transporter.sendMail({
            from: `"BD Travel Spirit Test" <test@bdtravelspirit.com>`,
            to: To,
            subject,
            html,
        });

        console.log("🧪 Test Message ID:", info.messageId);
        console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));

        return true;
    } catch (error) {
        console.error("❌ Test mail error:", error);
        throw new Error("Failed to send test email.");
    }
};