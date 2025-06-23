// server/utils/emailUtils.js - SIMPLIFIED VERSION
const { sendEmail } = require('../config/email');
const User = require('../models/User');
const Provider = require('../models/Provider');
const PromoCode = require('../models/PromoCode');

/**
 * Send user subscription emails (user welcome + admin notification)
 * Called directly from payment confirmation - NO API route needed
 */
const sendUserSubscriptionEmails = async (userId, promoCode = null) => {
  try {
    console.log('📧 Sending user subscription emails for userId:', userId);

    const user = await User.findById(userId).select('email name');
    if (!user) {
      throw new Error(`User not found for userId: ${userId}`);
    }

    // Calculate pricing
    const basePrice = 119.88;
    let discountPercentage = 0;

    if (promoCode) {
      const promoCodeData = await PromoCode.findOne({
        code: promoCode,
        isActive: true,
        expiryDate: { $gte: new Date() },
      });
      if (promoCodeData) {
        discountPercentage = promoCodeData.discountPercentage;
      }
    }

    const finalPrice = (basePrice * (1 - discountPercentage / 100)).toFixed(2);
    const { email, name } = user;

    // Email templates
    const userSubject =
      'Welcome to Elite Healthspan – Your Subscription is Active!';
    const userHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">Welcome to Elite Healthspan, ${name}!</h2>
        <p style="color: #333; font-size: 16px;">
          We're thrilled to confirm that your annual membership subscription of $${finalPrice} has been successfully activated.
        </p>
        <p style="color: #333; font-size: 16px;">
          <strong>What's Next?</strong><br/>
          - Connect with top providers, scientists, and practitioners.<br/>
          - Access state-of-the-art knowledge and insights.<br/>
          - Explore innovative therapies and treatments.
        </p>
        <p style="color: #333; font-size: 16px;">
          Thank you for joining Elite Healthspan!<br/>
          Best regards,<br/>
          The Elite Healthspan Team
        </p>
      </div>
    `;

    const adminSubject = 'New User Registration - Elite Healthspan';
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">New User Registration</h2>
        <p style="color: #333; font-size: 16px;">
          A new user has completed payment and joined Elite Healthspan.
        </p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Amount Paid:</strong> $${finalPrice}</p>
          ${promoCode ? `<p><strong>Promo Code:</strong> ${promoCode} (${discountPercentage}% off)</p>` : ''}
        </div>
      </div>
    `;

    // Send both emails simultaneously
    const supportEmail = process.env.SUPPORT_EMAIL;
    await Promise.all([
      sendEmail(
        email,
        userSubject,
        `Welcome ${name}! Your subscription is active.`,
        userHtmlContent
      ),
      sendEmail(
        supportEmail,
        adminSubject,
        `New user: ${name} (${email})`,
        adminHtmlContent
      ),
    ]);

    console.log('✅ User subscription emails sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending user subscription emails:', error);
    throw error;
  }
};

/**
 * Send provider registration emails (provider welcome + admin notification)
 * Called directly from provider signup - NO API route needed
 */
const sendProviderRegistrationEmails = async (providerId) => {
  try {
    console.log(
      '📧 Sending provider registration emails for providerId:',
      providerId
    );

    const provider = await Provider.findById(providerId);
    if (!provider) {
      throw new Error(`Provider not found for providerId: ${providerId}`);
    }

    const providerData = provider.toObject();

    // Provider welcome email
    const providerSubject =
      'Welcome to Elite Healthspan – Your Registration is Complete!';
    const providerHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">Dear ${providerData.providerName},</h2>
        <p style="color: #333; font-size: 16px;">
          Thank you for registering with Elite Healthspan! We're excited to review your application.
        </p>
        <p style="color: #333; font-size: 16px;">
          <strong>Next Steps:</strong><br/>
          - Our team will review your credentials<br/>
          - You'll receive confirmation once approved<br/>
          - Access to your provider dashboard will be granted
        </p>
        <p style="color: #333; font-size: 16px;">
          Best regards,<br/>
          The Elite Healthspan Team<br/>
          <a href="https://www.elitehealthspan.co">www.elitehealthspan.co</a><br/>
          Phone: (203) 987-4449
        </p>
      </div>
    `;

    // Admin notification email
    const adminSubject = 'New Provider Registration - Elite Healthspan';
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0B0757;">New Provider Registration</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${providerData.providerName || 'Not provided'}</p>
          <p><strong>Email:</strong> ${providerData.email || 'Not provided'}</p>
          <p><strong>Practice:</strong> ${providerData.practiceName || 'Not provided'}</p>
          <p><strong>Location:</strong> ${providerData.city || 'N/A'}, ${providerData.state || 'N/A'}</p>
          <p><strong>Specialties:</strong> ${
            providerData.specialties?.length > 0
              ? providerData.specialties.join(', ')
              : 'Not provided'
          }</p>
          <p><strong>NPI:</strong> ${providerData.npiNumber || 'Not provided'}</p>
        </div>
        <p>Please review and approve this provider registration.</p>
      </div>
    `;

    // Send both emails simultaneously
    const supportEmail = process.env.SUPPORT_EMAIL;
    await Promise.all([
      sendEmail(
        providerData.email,
        providerSubject,
        `Welcome ${providerData.providerName}!`,
        providerHtmlContent
      ),
      sendEmail(
        supportEmail,
        adminSubject,
        `New provider: ${providerData.providerName}`,
        adminHtmlContent
      ),
    ]);

    console.log('✅ Provider registration emails sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending provider registration emails:', error);
    throw error;
  }
};

module.exports = {
  sendUserSubscriptionEmails,
  sendProviderRegistrationEmails,
};
