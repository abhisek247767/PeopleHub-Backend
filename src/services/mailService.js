const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const getEmailTemplate = (type, username, code) => {
  const templates = {
    verification: {
      subject: "Verify Your Email Address",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome ${username}!</h2>
                    <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h3 style="color: #333; margin: 0;">Your Verification Code:</h3>
                        <h1 style="color: #007bff; font-size: 32px; margin: 10px 0; letter-spacing: 5px;">${code}</h1>
                    </div>
                    <p>This code will expire in 1 hour.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
    },
    passwordReset: {
      subject: "Password Reset Request",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${username},</p>
                    <p>You requested to reset your password. Use the code below to reset your password:</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h3 style="color: #333; margin: 0;">Your Reset Code:</h3>
                        <h1 style="color: #dc3545; font-size: 32px; margin: 10px 0; letter-spacing: 5px;">${code}</h1>
                    </div>
                    <p><strong>This code will expire in 30 minutes.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
    },
  };

  return templates[type] || templates.verification;
};

const sendVerificationEmail = async (
  email,
  username,
  code,
  type = "verification"
) => {
  try {
    const transporter = createTransporter();
    const template = getEmailTemplate(type, username, code);

    const mailOptions = {
      from: {
        name: "PeopleHub Team",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: template.subject,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Alternative function for password reset emails (for clarity)
const sendPasswordResetEmail = async (email, username, code) => {
  return await sendVerificationEmail(email, username, code, "passwordReset");
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
