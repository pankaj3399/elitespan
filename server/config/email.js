const nodemailer = require('nodemailer');
const AWS = require('aws-sdk'); // Add AWS SDK
require('dotenv').config();

let transporter;

// Configure based on EMAIL_SERVICE environment variable
if (process.env.EMAIL_SERVICE === 'ses') {
  // AWS SES Configuration
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const ses = new AWS.SES();

  transporter = {
    sendMail: async (mailOptions) => {
      const params = {
        Source: process.env.EMAIL_USER, // Verified SES sender email
        Destination: {
          ToAddresses: [mailOptions.to],
        },
        Message: {
          Subject: {
            Data: mailOptions.subject,
          },
          Body: {
            Text: {
              Data: mailOptions.text,
            },
          },
        },
      };

      try {
        await ses.sendEmail(params).promise();
        console.log(`Email sent via AWS SES to ${mailOptions.to}`);
      } catch (error) {
        console.error('Error sending email via AWS SES:', error);
        throw error;
      }
    },
  };
} else {
  // Nodemailer (Gmail) Configuration (default if EMAIL_SERVICE is not "ses")
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };