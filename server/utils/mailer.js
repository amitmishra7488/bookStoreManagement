const nodemailer = require("nodemailer");
require("dotenv").config();
const {
  otpVerificationTemplate,
  passwordChangedTemplate,
  authorRevenueTemplate,
} = require("./mailTemplate.js");

// Function to send an email
const sendEmail = async (email, name, message, subject) => {
  let emailTemaplate;
  try {
    switch (subject) {
      case "Account Registration":
        emailTemaplate = otpVerificationTemplate(name, message);
        break;

      case "Reset Password":
        emailTemaplate = otpVerificationTemplate(name, message);
        break;

      case "Password Changed":
        emailTemaplate = passwordChangedTemplate(name, message);
        break;
      
      case "Revenue Generated":
        const {authorRevenue, newPurchase} = message;
        emailTemaplate = authorRevenueTemplate(name, authorRevenue, newPurchase);
        break;
      default:
        throw new Error("Invalid actionType");
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAILUSERNAME,
        pass: process.env.GMAILPASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAILUSERNAME,
      to: email,
      subject: `Otp Verification for track_us ${subject}`,
      text: `${"Mail For Revenue"}`,
      html: emailTemaplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info.response;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
