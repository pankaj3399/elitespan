const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PromoCode = require('../models/PromoCode');
const { sendEmail } = require('../config/email');
const router = express.Router();

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Endpoint: Send Subscription Email
router.post('/send-subscription-email', verifyToken, async (req, res) => {
  console.log('Received send-subscription-email request:', req.body);
  const { userId, promoCode } = req.body;

  if (!userId) {
    console.error('User ID is missing in the request body');
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userId).select('email name');
    if (!user) {
      console.error(`User not found for userId: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Default price and discount percentage
    const basePrice = 119.88;
    let discountPercentage = 0;

    // Check if promo code was provided and is valid
    if (promoCode) {
      const promoCodeData = await PromoCode.findOne({
        code: promoCode,
        isActive: true,
        expiryDate: { $gte: new Date() },
      });

      if (promoCodeData) {
        discountPercentage = promoCodeData.discountPercentage;
        console.log(
          `Applied promo code: ${promoCode} with discount: ${discountPercentage}%`
        );
      } else {
        console.log(`Promo code not found or expired: ${promoCode}`);
      }
    }

    // Calculate the final price
    const finalPrice = (basePrice * (1 - discountPercentage / 100)).toFixed(2);

    const { email, name } = user;

    const subject =
      'Welcome to Elite Healthspan – Your Subscription is Active!';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">Welcome to Elite Healthspan, ${name}!</h2>
        <p style="color: #333; font-size: 16px;">
          We're thrilled to confirm that your annual membership subscription of $${finalPrice} has been successfully activated.
          You now have full access to Elite Healthspan's exclusive network and resources to enhance your wellness journey.
        </p>
        <p style="color: #333; font-size: 16px;">
          <strong>What's Next?</strong><br/>
          - Connect with top providers, scientists, and practitioners.<br/>
          - Access state-of-the-art knowledge and insights.<br/>
          - Explore innovative therapies and treatments.
        </p>
        <p style="color: #333; font-size: 16px;">
          If you have any questions or need assistance, feel free to reach out to us at 
          <a href="mailto:${process.env.EMAIL_USER}" style="color: #0B0757;">${
      process.env.EMAIL_USER
    }</a>.
        </p>
        <p style="color: #333; font-size: 16px;">
          Thank you for joining Elite Healthspan!<br/>
          Best regards,<br/>
          The Elite Healthspan Team
        </p>
        <hr style="border: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
        </p>
      </div>
    `;

    const textContent = `
      Welcome to Elite Healthspan, ${name}!

      We're thrilled to confirm that your annual membership subscription of $${finalPrice} has been successfully activated.
      You now have full access to Elite Healthspan's exclusive network and resources to enhance your wellness journey.

      What's Next?
      - Connect with top providers, scientists, and practitioners.
      - Access state-of-the-art knowledge and insights.
      - Explore innovative therapies and treatments.

      If you have any questions or need assistance, feel free to reach out to us at ${
        process.env.EMAIL_USER
      }.

      Thank you for joining Elite Healthspan!
      Best regards,
      The Elite Healthspan Team

      © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
    `;

    await sendEmail(email, subject, textContent, htmlContent);

    res.status(200).json({ message: 'Subscription email sent successfully' });
  } catch (error) {
    console.error('Error sending subscription email:', error);
    res
      .status(500)
      .json({
        message: 'Failed to send subscription email',
        error: error.message,
      });
  }
});

router.post('/provider-signup-notification', async (req, res) => {
  try {
    const providerData = req.body;

    if (!providerData) {
      return res.status(400).json({ message: 'Provider data is required' });
    }

    const supportEmail = process.env.SUPPORT_EMAIL;

    if (!supportEmail) {
      console.warn('SUPPORT_EMAIL not configured in environment variables');
      return res.status(400).json({ message: 'Support email not configured' });
    }

    const subject = 'New Provider Registration - Elite Healthspan';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">New Provider Registration</h2>
        <p style="color: #333; font-size: 16px;">
          A new healthcare provider has registered on Elite Healthspan.
        </p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0B0757; margin-top: 0;">Provider Details:</h3>
          <p><strong>Name:</strong> ${providerData.name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${providerData.email || 'Not provided'}</p>
          <p><strong>Practice Name:</strong> ${providerData.practiceName || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${providerData.phone || 'Not provided'}</p>
          <p><strong>Specialties:</strong> ${providerData.specialties ? providerData.specialties.join(', ') : 'Not provided'}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
          ${providerData.id ? `<p><strong>Provider ID:</strong> ${providerData.id}</p>` : ''}
        </div>
        <p style="color: #333; font-size: 16px;">
          Please review the provider's information and follow up as needed.
        </p>
        <hr style="border: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
        </p>
      </div>
    `;

    const textContent = `
      New Provider Registration - Elite Healthspan

      A new healthcare provider has registered on Elite Healthspan.

      Provider Details:
      - Name: ${providerData.name || 'Not provided'}
      - Email: ${providerData.email || 'Not provided'}
      - Practice Name: ${providerData.practiceName || 'Not provided'}
      - Phone: ${providerData.phone || 'Not provided'}
      - Specialties: ${providerData.specialties ? providerData.specialties.join(', ') : 'Not provided'}
      - Registration Date: ${new Date().toLocaleDateString()}
      ${providerData.id ? `- Provider ID: ${providerData.id}` : ''}

      Please review the provider's information and follow up as needed.

      © ${new Date().getFullYear()} Elite Healthspan. All rights reserved.
    `;

    console.log('📤 About to send email to:', supportEmail);
    console.log('📧 Email subject:', subject);

    await sendEmail(supportEmail, subject, textContent, htmlContent);

    console.log('✅ Email sent successfully');
    // REMOVE THE DUPLICATE LINE BELOW:
    res.status(200).json({ message: 'Provider signup notification sent successfully' });
    
  } catch (error) {
    console.error('Error sending provider signup notification:', error);
    res.status(500).json({
      message: 'Failed to send provider signup notification',
      error: error.message,
    });
  }
});

module.exports = router;
