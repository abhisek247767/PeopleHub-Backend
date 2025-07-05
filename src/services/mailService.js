require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");


const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendVerificationEmail = async (to, username, verificationCode) => {

    const templatePath = path.join(__dirname, "../views/verificationTemplate.html");

    try{
      let verificationTemplate = fs.readFileSync(templatePath, "utf-8");

      verificationTemplate = verificationTemplate
        .replace("{{username}}", username || 'Guest')
        .replace("{{verificationCode}}", verificationCode || '123456');

      if (!username || !verificationCode) {
        console.warn('Missing data for placeholders in email template');
      }

      const mailOptions = {
          from: process.env.EMAIL_USER, 
          to: to,
          subject: "Email Verification Code",
          html: verificationTemplate
      };

      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${to}`);

    }catch (error){
      console.error('Error while sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
      
}

module.exports = sendVerificationEmail;
