const otpVerificationTemplate = (name,message)=>{
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h1 {
          color: #007bff;
        }
    
        p {
          margin-bottom: 20px;
        }
    
        .otp-code {
          font-size: 24px;
          color: #28a745;
          font-weight: bold;
          display: inline-block;
          padding: 8px;
          background-color: #e6f7e1;
          border-radius: 4px;
        }
    
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>OTP Verification</h1>
        <p>Dear ${name},</p>
        <p>Your OTP for ${message} on BookStoreApplication is:</p>
        <p class="otp-code">${message}</p>
        <p>Please use this code to complete your process. Do not share this code with anyone.</p>
        <div class="footer">
          <p>If you did not request this OTP, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
    `
}

const passwordChangedTemplate = (name, message) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed - Email Notification</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
          color: #007bff;
        }

        p {
          margin-bottom: 20px;
        }

        .info {
          font-size: 16px;
          color: #333;
        }

        .footer {
          margin-top: 20px;
          text-align: center;
          color: #777;
        }

        .additional-info {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Password Changed</h1>
        <p>Dear ${name},</p>
        <p class="info">${message}</p>
        <p class="info additional-info">You will now need to use your new password for all future logins.</p>
        <div class="footer">
          <p>If you have any questions or did not initiate this change, please contact support immediately or change your Password ASAP.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

module.exports = {
    otpVerificationTemplate,
    passwordChangedTemplate
}