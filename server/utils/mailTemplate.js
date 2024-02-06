const otpVerificationTemplate = (name, message) => {
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
  `;
};

const authorRevenueTemplate = (authorName, authorRevenue, purchaseHistory) => {
  console.log(authorName, authorRevenue, purchaseHistory);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
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
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #007bff;
      margin-bottom: 15px;
    }

    p {
      margin-bottom: 20px;
    }

    .info {
      font-size: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }

    th {
      background-color: #f2f2f2;
    }

    ul {
      padding-left: 20px;
      margin-bottom: 20px;
    }

    li {
      margin-bottom: 5px;
    }

    .footer p {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Author Revenue Report</h1>
    <p>Dear ${authorName},</p>
    <p class="info">We are pleased to provide you with the revenue report:</p>
    <table>
      <tr>
        <th>Revenue Source</th>
        <th>Amount (₹)</th>
      </tr>
      <tr>
        <td>Revenue for Current Month</td>
        <td>₹${authorRevenue.currentMonthRevenue}</td>
      </tr>
      <tr>
        <td>Revenue for Current Year</td>
        <td>₹${authorRevenue.currentYearRevenue}</td>
      </tr>
      <tr>
        <td>Total Revenue</td>
        <td>₹${authorRevenue.totalRevenue}</td>
      </tr>
    </table>
    <div>
      <h2>Purchase History</h2>
      <ul>
        <li><strong>Book ID:</strong> ${purchaseHistory.bookId}</li>
        <li><strong>User ID:</strong> ${purchaseHistory.userId}</li>
        <li><strong>Price:</strong> ${purchaseHistory.price}</li>
        <li><strong>Quantity:</strong>  ₹${purchaseHistory.quantity}</li>
        <li><strong>Purchase ID:</strong> ${purchaseHistory.purchaseId}</li>
      </ul>
    </div>
    <div class="footer">
      <p>If you have any questions or need further information, please don't hesitate to contact us.</p>
      <p>Thank you for your continued partnership.</p>
    </div>
  </div>
</body>
</html>
`;
};

module.exports = {
  otpVerificationTemplate,
  authorRevenueTemplate,
};
