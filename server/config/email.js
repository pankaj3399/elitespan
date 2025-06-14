const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { Resend } = require('resend');
require('dotenv').config();

let transporter;

// Configure based on EMAIL_SERVICE environment variable
if (process.env.EMAIL_SERVICE === 'sendgrid') {
  // SendGrid Configuration
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not set in environment variables');
    process.exit(1);
  }

  if (!process.env.EMAIL_USER) {
    console.error('EMAIL_USER is not set in environment variables');
    process.exit(1);
  }
  
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  transporter = {
    sendMail: async (mailOptions) => {
      if (!mailOptions.to) {
        throw new Error('Recipient email address is required');
      }

      const msg = {
        to: mailOptions.to,
        from: {
          email: process.env.EMAIL_USER,
          name: 'Elite Healthspan'
        },
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      };

      try {
        console.log('Attempting to send email via SendGrid:', {
          to: msg.to,
          from: msg.from,
          subject: msg.subject
        });
        
        const response = await sgMail.send(msg);
        console.log('SendGrid response:', response);
        return response;
      } catch (error) {
        console.error('SendGrid Error Details:', {
          message: error.message,
          code: error.code,
          response: error.response?.body,
          stack: error.stack
        });
        throw error;
      }
    },
  };
} else if (process.env.EMAIL_SERVICE === 'resend') {
  // Resend Configuration
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables');
    process.exit(1);
  }

  if (!process.env.EMAIL_USER) {
    console.error('EMAIL_USER is not set in environment variables');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  transporter = {
    sendMail: async (mailOptions) => {
      if (!mailOptions.to) {
        throw new Error('Recipient email address is required');
      }

      const emailData = {
        from: `Elite Healthspan <${process.env.EMAIL_USER}>`,
        to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      };

      try {
        console.log('Attempting to send email via Resend:', {
          to: emailData.to,
          from: emailData.from,
          subject: emailData.subject
        });
        
        const response = await resend.emails.send(emailData);
        console.log('Resend response:', response);
        return response;
      } catch (error) {
        console.error('Resend Error Details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        throw error;
      }
    },
  };
} else {
  // Nodemailer (Gmail) Configuration (default if EMAIL_SERVICE is not "sendgrid" or "resend")
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('EMAIL_USER and EMAIL_PASS are required for Gmail configuration');
    process.exit(1);
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };